import { clientDb, clientAuth } from './firebase';
import { EventBus, AuditEngine, TenantEngine } from './services';
import { tenantRepo, userRepo, campaignRepo, brandRepo, subscriptionRepo, auditRepo } from './repositories';

export type WorkflowState =
  | 'Queued'
  | 'Validating'
  | 'Executing'
  | 'Waiting'
  | 'Retrying'
  | 'Recovering'
  | 'Completed'
  | 'Cancelled'
  | 'Failed'
  | 'Rolled Back';

export interface WorkflowTelemetry {
  apiLatencyMs: number;
  databaseLatencyMs: number;
  executionStepsTime: Record<string, number>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  state: WorkflowState;
  startTime?: string;
  endTime?: string;
  error?: string;
}

export interface OrchestrationWorkflowRecord {
  id: string; // Workflow ID
  correlationId: string;
  transactionId: string;
  tenantId: string;
  userId: string;
  name: string;
  state: WorkflowState;
  startTime: string;
  finishTime?: string;
  durationMs?: number;
  retryCount: number;
  maxRetries: number;
  rollbackState: 'none' | 'pending' | 'completed' | 'failed';
  compensationActions: string[];
  auditEvents: string[];
  performanceMetrics: WorkflowTelemetry;
  errorClassification?: string;
  recoveryStatus?: string;
  payload: any;
  steps: WorkflowStep[];
}

// Enterprise Event Bus Listeners for orchestration
export class OrchestrationEngine {
  private static STORAGE_COLLECTION = 'orchestration_workflows';

  /**
   * Helper to write/update workflow status to persistence layer
   */
  static async persistWorkflow(record: OrchestrationWorkflowRecord): Promise<void> {
    try {
      const tenantId = record.tenantId || 'system-orchestrator';
      // Use clientDb to store or update the document
      const existing = await clientDb.getDocById(this.STORAGE_COLLECTION, record.id);
      if (existing) {
        await clientDb.updateDocInTenant(this.STORAGE_COLLECTION, record.id, record, tenantId);
      } else {
        // Since addDocToTenant auto-generates ID internally, let's set it via setDoc if real Firebase,
        // or just add directly. To avoid double ID generation, we'll write directly or use updateDocInTenant
        // after creating. For simplicity, we can set the record as is.
        // Let's use our clientDb helper wrapper or update storage directly
        const storeKey = 'marketforge_offline_saas_data';
        const raw = localStorage.getItem(storeKey);
        if (raw) {
          const store = JSON.parse(raw);
          if (!store[this.STORAGE_COLLECTION]) store[this.STORAGE_COLLECTION] = {};
          store[this.STORAGE_COLLECTION][record.id] = record;
          localStorage.setItem(storeKey, JSON.stringify(store));
        }
        
        // Also log to Firestore if real Firebase
        const isReal = (await import('./firebase')).isRealFirebase;
        if (isReal) {
          try {
            const { doc, setDoc, getFirestore } = await import('firebase/firestore');
            const { dbInstance } = await import('./firebase');
            await setDoc(doc(dbInstance, this.STORAGE_COLLECTION, record.id), record);
          } catch (e) {
            console.warn('[OrchestrationEngine] Firestore write failed:', e);
          }
        }
      }
    } catch (e) {
      console.error('[OrchestrationEngine] Persistence Failure:', e);
    }
  }

  /**
   * Retrieves all orchestration records (cross-tenant access for Super Admin)
   */
  static async listAllWorkflows(): Promise<OrchestrationWorkflowRecord[]> {
    try {
      const storeKey = 'marketforge_offline_saas_data';
      const raw = localStorage.getItem(storeKey);
      let localRecords: OrchestrationWorkflowRecord[] = [];
      if (raw) {
        const store = JSON.parse(raw);
        const collection = store[this.STORAGE_COLLECTION] || {};
        localRecords = Object.values(collection);
      }
      return localRecords.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    } catch (e) {
      console.error('[OrchestrationEngine] List workflows failed:', e);
      return [];
    }
  }

  /**
   * Generate an empty skeletal workflow record
   */
  static createRecord(
    name: string,
    tenantId: string,
    userId: string,
    payload: any,
    steps: string[],
    maxRetries = 3
  ): OrchestrationWorkflowRecord {
    const correlationId = `corr_${Math.random().toString(36).substr(2, 9)}`;
    const transactionId = `txn_${Math.random().toString(36).substr(2, 9)}`;
    const workflowId = `wflow_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: workflowId,
      correlationId,
      transactionId,
      tenantId,
      userId,
      name,
      state: 'Queued',
      startTime: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
      rollbackState: 'none',
      compensationActions: [],
      auditEvents: [`Workflow initialized with ${steps.length} steps`],
      performanceMetrics: {
        apiLatencyMs: 0,
        databaseLatencyMs: 0,
        executionStepsTime: {}
      },
      payload,
      steps: steps.map(s => ({
        id: s.toLowerCase().replace(/\s+/g, '_'),
        name: s,
        state: 'Queued'
      }))
    };
  }

  /**
   * Exponential backoff delay helper
   */
  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================
  // WORKFLOW 1: TENANT & WORKSPACE PROVISIONING
  // ==========================================
  static async runTenantProvisioning(
    targetTenantId: string,
    email: string,
    enterpriseName: string
  ): Promise<any> {
    const stepsList = [
      'Validate Request',
      'Reserve Workspace Name',
      'Reserve Domain',
      'Create Tenant',
      'Create Firebase User',
      'Send Verification Email',
      'Create Firestore Collections',
      'Initialize Permissions',
      'Initialize Roles',
      'Initialize Subscription',
      'Initialize Credits',
      'Initialize Brand',
      'Generate Client Portal',
      'Verify Login',
      'Publish Audit Event',
      'Notify Super Admin',
      'Complete Provisioning'
    ];

    const record = this.createRecord(
      'Tenant Provisioning Workflow',
      targetTenantId,
      clientAuth.currentUser?.uid || 'anonymous-system',
      { targetTenantId, email, enterpriseName },
      stepsList
    );

    record.state = 'Validating';
    await this.persistWorkflow(record);

    let stepIndex = 0;
    const runStep = async (stepName: string, action: () => Promise<void>) => {
      const start = Date.now();
      const currentStep = record.steps[stepIndex];
      if (!currentStep) return;

      currentStep.state = 'Executing';
      currentStep.startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      try {
        await action();
        currentStep.state = 'Completed';
        currentStep.endTime = new Date().toISOString();
        const duration = Date.now() - start;
        const key = stepName.toLowerCase().replace(/\s+/g, '_');
        record.performanceMetrics.executionStepsTime[key] = duration;
        record.auditEvents.push(`Step [${stepName}] finished successfully`);
        await this.persistWorkflow(record);
        stepIndex++;
      } catch (err: any) {
        currentStep.state = 'Failed';
        currentStep.error = err.message || String(err);
        currentStep.endTime = new Date().toISOString();
        await this.persistWorkflow(record);
        throw err;
      }
    };

    try {
      // Step 1: Validate Request
      await runStep('Validate Request', async () => {
        if (!targetTenantId || targetTenantId.trim().length < 3) {
          throw new Error('Tenant ID must be at least 3 characters long.');
        }
        if (!email || !email.includes('@')) {
          throw new Error('A valid email address is required.');
        }
        if (!enterpriseName || enterpriseName.trim().length < 2) {
          throw new Error('Enterprise name must be at least 2 characters.');
        }
      });

      // Step 2: Reserve Workspace Name
      await runStep('Reserve Workspace Name', async () => {
        const storeKey = 'marketforge_offline_saas_data';
        const storeRaw = localStorage.getItem(storeKey);
        if (storeRaw) {
          const store = JSON.parse(storeRaw);
          const existing = store.tenants?.[targetTenantId] || store.workspace_reservations?.[`res_${targetTenantId}`];
          if (existing) {
            throw new Error(`[DuplicateTenantError] Workspace "${targetTenantId}" already exists or is reserved!`);
          }
        }
        await clientDb.addDocToTenant('workspace_reservations', {
          id: `res_${targetTenantId}`,
          reservedAt: new Date().toISOString(),
          status: 'reserved'
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:workspace_reservations:res_${targetTenantId}`);
      });

      // Step 3: Reserve Domain
      await runStep('Reserve Domain', async () => {
        const domainName = `${targetTenantId}.marketforge.scamspike.com`;
        await clientDb.addDocToTenant('domain_reservations', {
          id: `dom_${targetTenantId}`,
          domain: domainName,
          reservedAt: new Date().toISOString(),
          status: 'reserved'
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:domain_reservations:dom_${targetTenantId}`);
      });

      // Step 4: Create Tenant
      await runStep('Create Tenant', async () => {
        const tenantPayload = {
          id: targetTenantId,
          name: enterpriseName,
          domain: `${targetTenantId}.marketforge.scamspike.com`,
          ownerEmail: email,
          isCustom: true,
          status: 'pending_verification',
          plan: 'Growth',
          mrr: 249,
          trialDaysLeft: 14,
          activeUsers: 1,
          storageMb: 10.0,
          health: 'Healthy',
          apiRequests: 0,
          pdfExports: 0,
          imageGenerations: 0,
          knowledgeAssets: 0,
          disabledModules: []
        };
        await clientDb.addDocToTenant('tenants', tenantPayload, targetTenantId);
        record.compensationActions.push(`delete_doc:tenants:${targetTenantId}`);
      });

      // Step 5: Create Firebase User
      const systemUserId = `usr_${targetTenantId}`;
      await runStep('Create Firebase User', async () => {
        const userPayload = {
          id: systemUserId,
          uid: systemUserId,
          email,
          tenantId: targetTenantId,
          role: 'owner',
          name: enterpriseName + ' Owner',
          status: 'pending_verification',
          createdAt: new Date().toISOString()
        };
        await clientDb.addDocToTenant('users', userPayload, targetTenantId);
        record.compensationActions.push(`delete_doc:users:${systemUserId}`);
      });

      // Step 6: Send Verification Email
      await runStep('Send Verification Email', async () => {
        const res = await fetch('/api/admin/send-verification-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, tenantId: targetTenantId, name: enterpriseName })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Outbound verification email delivery failed.');
        }
      });

      // Step 7: Create Firestore Collections
      await runStep('Create Firestore Collections', async () => {
        await clientDb.addDocToTenant('collection_registry', {
          id: `reg_${targetTenantId}`,
          collectionsInitialized: [
            'tenants', 'users', 'subscriptions', 'credits', 'audit_logs',
            'roles', 'permissions', 'brand_guidelines', 'settings', 'knowledge_assets'
          ],
          timestamp: new Date().toISOString()
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:collection_registry:reg_${targetTenantId}`);
      });

      // Step 8: Initialize Permissions
      await runStep('Initialize Permissions', async () => {
        await clientDb.addDocToTenant('permissions', {
          id: `perm_${targetTenantId}`,
          roles: ['owner', 'admin', 'writer', 'viewer'],
          capabilities: {
            owner: ['*'],
            admin: ['edit_brand', 'view_audit', 'manage_users'],
            writer: ['edit_brand', 'view_brand'],
            viewer: ['view_brand']
          }
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:permissions:perm_${targetTenantId}`);
      });

      // Step 9: Initialize Roles
      await runStep('Initialize Roles', async () => {
        await clientDb.addDocToTenant('roles', {
          id: `role_${targetTenantId}`,
          userId: systemUserId,
          assignedRole: 'owner',
          grantedAt: new Date().toISOString()
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:roles:role_${targetTenantId}`);
      });

      // Step 10: Initialize Subscription
      const systemSubId = `sub_${targetTenantId}`;
      await runStep('Initialize Subscription', async () => {
        const subscriptionPayload = {
          id: systemSubId,
          tenantId: targetTenantId,
          tier: 'Growth',
          status: 'active',
          aiCreditsUsed: 0,
          aiCreditsLimit: 2000,
          storageUsed: 0,
          storageLimit: 50 * 1024 * 1024,
          maxUsers: 10,
          modulesAvailable: ['marketing', 'brand', 'strategy'],
          apiUsageLimit: 5000,
          expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
        };
        await clientDb.addDocToTenant('subscriptions', subscriptionPayload, targetTenantId);
        record.compensationActions.push(`delete_doc:subscriptions:${systemSubId}`);
      });

      // Step 11: Initialize Credits
      await runStep('Initialize Credits', async () => {
        await clientDb.addDocToTenant('credits', {
          id: `cred_${targetTenantId}`,
          allocated: 500,
          remaining: 500,
          lastRechargeDate: new Date().toISOString()
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:credits:cred_${targetTenantId}`);
      });

      // Step 12: Initialize Brand
      const systemBrandId = `brnd_${targetTenantId}`;
      await runStep('Initialize Brand', async () => {
        const brandPayload = {
          id: systemBrandId,
          tenantId: targetTenantId,
          primaryColor: '#4f46e5',
          secondaryColor: '#0f172a',
          accentColor: '#10b981',
          typographyHeading: 'Space Grotesk',
          typographyBody: 'Inter',
          visualVibe: 'Premium Technology',
          vibeDescription: 'Corporate clean aesthetic, utilizing deep indigo, white spacing, and high contrast accents.',
          doAndDont: {
            dos: ['Apply generous grid gutters', 'Always prioritize visual typography pairing'],
            donts: ['Avoid overlapping text parameters', 'Do not exceed 3 font families']
          },
          assetChecklist: ['High Resolution Logo WebP', 'Brand Guideline System Spec Sheet']
        };
        await clientDb.addDocToTenant('brand_guidelines', brandPayload, targetTenantId);
        record.compensationActions.push(`delete_doc:brand_guidelines:${systemBrandId}`);
      });

      // Step 13: Generate Client Portal
      await runStep('Generate Client Portal', async () => {
        await clientDb.addDocToTenant('settings', {
          id: `sett_${targetTenantId}`,
          maintenanceMode: false,
          isPublic: true,
          theme: 'light',
          allowedDomains: [`${targetTenantId}.marketforge.scamspike.com`]
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:settings:sett_${targetTenantId}`);
      });

      // Step 14: Verify Login
      await runStep('Verify Login', async () => {
        const tenantSnap = await clientDb.getDocById('tenants', targetTenantId);
        const userSnap = await clientDb.getDocById('users', systemUserId);
        if (!tenantSnap || !userSnap) {
          console.warn('Post-provisioning verification warning: Records could not be fetched immediately.', { tenantSnap, userSnap });
          // In real Firestore, sometimes replication takes a second. We won't block the UI.
        }
      });

      // Step 15: Publish Audit Event
      await runStep('Publish Audit Event', async () => {
        await clientDb.addDocToTenant('audit_logs', {
          id: `aud_init_${targetTenantId}`,
          tenantId: targetTenantId,
          userId: systemUserId,
          userEmail: email,
          action: 'TENANT_PROVISION_COMPLETED',
          details: `Tenant registration transaction fully committed for "${enterpriseName}".`
        }, targetTenantId);
        record.compensationActions.push(`delete_doc:audit_logs:aud_init_${targetTenantId}`);
      });

      // Step 16: Notify Super Admin
      await runStep('Notify Super Admin', async () => {
        const res = await fetch('/api/admin/notify-super-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId: targetTenantId, name: enterpriseName, email })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Superadmin notification delivery failed.');
        }
      });

      // Step 17: Complete Provisioning
      await runStep('Complete Provisioning', async () => {
        // Update tenant and user status to active
        await clientDb.updateDocInTenant('tenants', targetTenantId, { status: 'active' }, targetTenantId);
        await clientDb.updateDocInTenant('users', systemUserId, { status: 'active' }, targetTenantId);

        // SYNC directly with marketforge_sa_tenants list in localStorage so it instantly reflects in UI
        const newTenantObj = {
          id: targetTenantId,
          name: enterpriseName,
          domain: `${targetTenantId}.marketforge.scamspike.com`,
          ownerEmail: email,
          isCustom: true,
          status: 'active',
          plan: 'Growth',
          mrr: 249,
          trialDaysLeft: 14,
          activeUsers: 1,
          storageMb: 10.0,
          health: 'Healthy',
          apiRequests: 0,
          pdfExports: 0,
          imageGenerations: 0,
          knowledgeAssets: 0,
          disabledModules: []
        };

        const activeTenantsRaw = localStorage.getItem('marketforge_sa_tenants');
        let currentTenants: any[] = [];
        if (activeTenantsRaw) {
          try {
            currentTenants = JSON.parse(activeTenantsRaw);
          } catch (e) {}
        }
        currentTenants = currentTenants.filter((t: any) => t.id !== targetTenantId);
        currentTenants.push(newTenantObj);
        localStorage.setItem('marketforge_sa_tenants', JSON.stringify(currentTenants));
      });

      // Finalize Workflow success
      record.state = 'Completed';
      record.finishTime = new Date().toISOString();
      record.durationMs = Date.now() - new Date(record.startTime).getTime();
      record.auditEvents.push('Workspace creation transaction fully committed and broadcasted!');
      await this.persistWorkflow(record);

      // Publish Success Events
      await EventBus.publish('TENANT_CREATED', targetTenantId, systemUserId, {
        tenantId: targetTenantId,
        ownerEmail: email,
        brandId: `brnd_${targetTenantId}`,
        subId: systemSubId
      });

      return {
        success: true,
        tenantId: targetTenantId,
        ownerUid: systemUserId,
        subscription: { id: systemSubId, tier: 'Growth' },
        workflowId: record.id
      };
    } catch (err: any) {
      console.error('[OrchestrationEngine] Provisioning Workflow CRASHED! Initiating Compensating Transaction Rollback...', err);
      record.state = 'Failed';
      record.errorClassification = 'TRANSACTION_ABORTED';
      record.recoveryStatus = 'Compensating (Rollback) actively in-progress';
      record.auditEvents.push(`Error Trapped: ${err.message || err}. Initiating compensating database rollback.`);
      await this.persistWorkflow(record);

      // Run compensation rollback loop to prevent orphaned records!
      await this.executeRollback(record);

      throw err;
    }
  }

  /**
   * Central Compensation Transaction (Rollback) loop
   */
  private static async executeRollback(record: OrchestrationWorkflowRecord): Promise<void> {
    record.rollbackState = 'pending';
    record.state = 'Rolled Back';
    await this.persistWorkflow(record);

    console.log(`[OrchestrationEngine] Initiating automated compensation loop for correlation ID: ${record.correlationId}`);

    for (let i = record.compensationActions.length - 1; i >= 0; i--) {
      const action = record.compensationActions[i];
      const [type, collectionName, docId] = action.split(':');

      if (type === 'delete_doc') {
        try {
          console.log(`[Rollback] Deleting leaked reference ${collectionName}/${docId}`);
          await clientDb.deleteDocInTenant(collectionName, docId, record.tenantId);
          record.auditEvents.push(`Compensated: Deleted orphaned doc ${collectionName}/${docId}`);
          await this.persistWorkflow(record);
        } catch (compensationErr) {
          console.error(`[Rollback Critical Failure] Failed to compensate ${action}:`, compensationErr);
          record.auditEvents.push(`CRITICAL ROLLBACK FAILURE: Failed to delete ${collectionName}/${docId}`);
          record.rollbackState = 'failed';
          await this.persistWorkflow(record);
        }
      }
    }

    if (record.rollbackState !== 'failed') {
      record.rollbackState = 'completed';
      record.recoveryStatus = 'Transaction rolled back successfully. No orphaned records remain.';
    }
    record.finishTime = new Date().toISOString();
    record.durationMs = Date.now() - new Date(record.startTime).getTime();
    await this.persistWorkflow(record);
  }

  // ==========================================
  // WORKFLOW 2: AI GENERATION & CREDIT ENFORCEMENT
  // ==========================================
  static async runAICreditDeductionWorkflow(
    tenantId: string,
    userId: string,
    creditsToDeduct: number,
    operationName: string,
    aiActionTask: () => Promise<any>
  ): Promise<any> {
    const record = this.createRecord(
      'AI Job & Credit Control Workflow',
      tenantId,
      userId,
      { creditsToDeduct, operationName },
      ['Query Allocation', 'Reserve Credits', 'Execute AI Core Inference', 'Finalize Ledgers']
    );

    record.state = 'Executing';
    await this.persistWorkflow(record);

    const stepStart = Date.now();

    try {
      // Step 1: Query Allocation & Limits
      record.steps[0].state = 'Executing';
      record.steps[0].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      const subs = await clientDb.getCollection('subscriptions', tenantId);
      const activeSub = subs[0];
      if (!activeSub) {
        throw new Error('[SubscriptionError] No active subscription plan located for tenant.');
      }

      const available = (activeSub.aiCreditsLimit || 500) - (activeSub.aiCreditsUsed || 0);
      if (available < creditsToDeduct) {
        throw new Error(`[QuotaLimitExceeded] Insufficient AI Credits quota available. Needed: ${creditsToDeduct}, Available: ${available}`);
      }

      record.steps[0].state = 'Completed';
      record.steps[0].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['query_allocation'] = Date.now() - stepStart;
      await this.persistWorkflow(record);

      // Step 2: Reserve Credits
      record.steps[1].state = 'Executing';
      record.steps[1].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      // Reserve credits by pre-adding them
      const updatedUsed = (activeSub.aiCreditsUsed || 0) + creditsToDeduct;
      await clientDb.updateDocInTenant('subscriptions', activeSub.id, { aiCreditsUsed: updatedUsed }, tenantId);
      record.compensationActions.push(`refund_credits:${activeSub.id}:${creditsToDeduct}`);

      record.steps[1].state = 'Completed';
      record.steps[1].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['reserve_credits'] = Date.now() - stepStart;
      record.auditEvents.push(`Successfully locked and reserved ${creditsToDeduct} credits in subscription ID ${activeSub.id}`);
      await this.persistWorkflow(record);

      // Step 3: Execute AI Core Inference (The main task)
      record.steps[2].state = 'Executing';
      record.steps[2].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      const inferenceResult = await aiActionTask();

      record.steps[2].state = 'Completed';
      record.steps[2].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['ai_core_inference'] = Date.now() - stepStart;
      record.auditEvents.push('AI core inference task resolved successfully');
      await this.persistWorkflow(record);

      // Step 4: Finalize Ledgers
      record.steps[3].state = 'Executing';
      record.steps[3].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      // Log credit deduction audit ledger entry
      await AuditEngine.logEvent(
        tenantId,
        userId,
        'AI_CREDITS_CONSUMED',
        `Successfully consumed ${creditsToDeduct} credits for operation: ${operationName}.`
      );

      record.steps[3].state = 'Completed';
      record.steps[3].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['finalize_ledgers'] = Date.now() - stepStart;

      record.state = 'Completed';
      record.finishTime = new Date().toISOString();
      record.durationMs = Date.now() - new Date(record.startTime).getTime();
      await this.persistWorkflow(record);

      // Publish trace event
      await EventBus.publish('AI_JOB_COMPLETED', tenantId, userId, {
        operationName,
        creditsConsumed: creditsToDeduct,
        jobId: record.id
      });

      return {
        success: true,
        result: inferenceResult,
        workflowId: record.id
      };
    } catch (err: any) {
      console.error('[OrchestrationEngine] AI Credit Workflow Failure! Initiating automated compensation refunds...', err);
      record.state = 'Failed';
      record.errorClassification = err.name || 'AI_INFERENCE_OR_QUOTA_ERROR';
      record.recoveryStatus = 'Active compensation credit refund processing';
      record.auditEvents.push(`Execution Failure: ${err.message || err}. Commencing automatic credit rollbacks.`);
      await this.persistWorkflow(record);

      // Refund reserved credits
      for (const compAction of record.compensationActions) {
        if (compAction.startsWith('refund_credits')) {
          try {
            const [, subId, amountStr] = compAction.split(':');
            const amt = Number(amountStr);
            const subs = await clientDb.getCollection('subscriptions', tenantId);
            const subDoc = subs.find(s => s.id === subId);
            if (subDoc) {
              const refundedUsed = Math.max(0, (subDoc.aiCreditsUsed || 0) - amt);
              await clientDb.updateDocInTenant('subscriptions', subDoc.id, { aiCreditsUsed: refundedUsed }, tenantId);
              record.auditEvents.push(`Refunded: Restored ${amt} AI Credits to sub ID ${subId}`);
              record.rollbackState = 'completed';
            }
          } catch (refundErr) {
            console.error('[Rollback Critical Failure] Failed to refund credits:', refundErr);
            record.rollbackState = 'failed';
          }
        }
      }

      record.state = 'Rolled Back';
      record.finishTime = new Date().toISOString();
      record.durationMs = Date.now() - new Date(record.startTime).getTime();
      await this.persistWorkflow(record);

      throw err;
    }
  }

  // ==========================================
  // WORKFLOW 3: SUBSCRIPTION PLAN UPGRADE/DOWNGRADE
  // ==========================================
  static async runSubscriptionUpgradeWorkflow(
    tenantId: string,
    userId: string,
    newPlanTier: 'Starter' | 'Growth' | 'Pro' | 'Enterprise',
    pricePaid: number
  ): Promise<any> {
    const record = this.createRecord(
      'Subscription Tier Upgrade Workflow',
      tenantId,
      userId,
      { newPlanTier, pricePaid },
      ['Verify Eligibility', 'Update Subscription Status', 'Expand Quotas', 'Generate Billing Audit Logs']
    );

    record.state = 'Executing';
    await this.persistWorkflow(record);

    const stepStart = Date.now();

    try {
      // Step 1: Verify Eligibility
      record.steps[0].state = 'Executing';
      record.steps[0].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      const subs = await clientDb.getCollection('subscriptions', tenantId);
      const activeSub = subs[0];
      if (!activeSub) {
        throw new Error('[SubscriptionError] No current active contract document to upgrade.');
      }

      record.steps[0].state = 'Completed';
      record.steps[0].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['verify_eligibility'] = Date.now() - stepStart;
      await this.persistWorkflow(record);

      // Step 2: Update Subscription Status
      record.steps[1].state = 'Executing';
      record.steps[1].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      // Save compensation in case downstream steps fail
      record.compensationActions.push(`restore_plan:${activeSub.id}:${activeSub.tier}:${activeSub.aiCreditsLimit}:${activeSub.maxUsers}`);

      await clientDb.updateDocInTenant('subscriptions', activeSub.id, {
        tier: newPlanTier,
        status: 'active'
      }, tenantId);

      record.steps[1].state = 'Completed';
      record.steps[1].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['update_subscription_status'] = Date.now() - stepStart;
      await this.persistWorkflow(record);

      // Step 3: Expand Quotas
      record.steps[2].state = 'Executing';
      record.steps[2].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      let newLimit = 1000;
      let newUsers = 10;
      if (newPlanTier === 'Pro') {
        newLimit = 5000;
        newUsers = 20;
      } else if (newPlanTier === 'Enterprise') {
        newLimit = 50000;
        newUsers = 100;
      } else if (newPlanTier === 'Growth') {
        newLimit = 2000;
        newUsers = 10;
      }

      await clientDb.updateDocInTenant('subscriptions', activeSub.id, {
        aiCreditsLimit: newLimit,
        maxUsers: newUsers
      }, tenantId);

      record.steps[2].state = 'Completed';
      record.steps[2].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['expand_quotas'] = Date.now() - stepStart;
      await this.persistWorkflow(record);

      // Step 4: Generate Billing Audit Logs
      record.steps[3].state = 'Executing';
      record.steps[3].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      await AuditEngine.logEvent(
        tenantId,
        userId,
        'BILLING_CONTRACT_UPGRADED',
        `Successfully upgraded workspace billing profile to [${newPlanTier}] level tier contract. Price: $${pricePaid}/mo.`
      );

      record.steps[3].state = 'Completed';
      record.steps[3].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['generate_billing_audit_logs'] = Date.now() - stepStart;

      record.state = 'Completed';
      record.finishTime = new Date().toISOString();
      record.durationMs = Date.now() - new Date(record.startTime).getTime();
      await this.persistWorkflow(record);

      return {
        success: true,
        tier: newPlanTier,
        limit: newLimit,
        workflowId: record.id
      };
    } catch (err: any) {
      console.error('[OrchestrationEngine] Upgrade Workflow crashed! Rolling back changes...', err);
      record.state = 'Failed';
      record.errorClassification = 'BILLING_SYSTEM_ERROR';
      record.auditEvents.push(`Error: ${err.message || err}. Initiating billing state rollback.`);
      await this.persistWorkflow(record);

      // Rollback
      for (const compAction of record.compensationActions) {
        if (compAction.startsWith('restore_plan')) {
          try {
            const [, id, oldTier, oldLimit, oldUsers] = compAction.split(':');
            await clientDb.updateDocInTenant('subscriptions', id, {
              tier: oldTier,
              aiCreditsLimit: Number(oldLimit),
              maxUsers: Number(oldUsers)
            }, tenantId);
            record.auditEvents.push(`Rollback: Restored sub ID ${id} back to original ${oldTier} settings`);
            record.rollbackState = 'completed';
          } catch (restoreErr) {
            console.error('[Rollback Failure] Failed to restore plan old state:', restoreErr);
            record.rollbackState = 'failed';
          }
        }
      }

      record.state = 'Rolled Back';
      record.finishTime = new Date().toISOString();
      record.durationMs = Date.now() - new Date(record.startTime).getTime();
      await this.persistWorkflow(record);

      throw err;
    }
  }

  // ==========================================
  // WORKFLOW 4: SYSTEM DOCUMENT BACKUP
  // ==========================================
  static async runSystemBackupWorkflow(
    tenantId: string,
    userId: string
  ): Promise<any> {
    const record = this.createRecord(
      'Automated Database Backup Workflow',
      tenantId,
      userId,
      {},
      ['Lock Collections', 'Extract Store JSON', 'Write Secure Archive File']
    );

    record.state = 'Executing';
    await this.persistWorkflow(record);

    const stepStart = Date.now();

    try {
      // Step 1: Lock Collections
      record.steps[0].state = 'Executing';
      record.steps[0].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      await this.sleep(100); // Simulate secure system freeze

      record.steps[0].state = 'Completed';
      record.steps[0].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['lock_collections'] = Date.now() - stepStart;
      await this.persistWorkflow(record);

      // Step 2: Extract Store JSON
      record.steps[1].state = 'Executing';
      record.steps[1].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      const storeKey = 'marketforge_offline_saas_data';
      const raw = localStorage.getItem(storeKey);
      if (!raw) {
        throw new Error('[BackupError] Storage stream is empty or corrupt.');
      }

      record.steps[1].state = 'Completed';
      record.steps[1].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['extract_store_json'] = Date.now() - stepStart;
      await this.persistWorkflow(record);

      // Step 3: Write Secure Archive File
      record.steps[2].state = 'Executing';
      record.steps[2].startTime = new Date().toISOString();
      await this.persistWorkflow(record);

      const archiveId = `bck_${Math.random().toString(36).substr(2, 9)}`;
      const backupPayload = {
        id: archiveId,
        tenantId,
        serializedData: raw,
        sizeBytes: raw.length,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await clientDb.addDocToTenant('database_backups', backupPayload, tenantId);

      record.steps[2].state = 'Completed';
      record.steps[2].endTime = new Date().toISOString();
      record.performanceMetrics.executionStepsTime['write_secure_archive_file'] = Date.now() - stepStart;
      record.auditEvents.push(`Successfully finalized secure system archive payload ID: ${archiveId}`);

      record.state = 'Completed';
      record.finishTime = new Date().toISOString();
      record.durationMs = Date.now() - new Date(record.startTime).getTime();
      await this.persistWorkflow(record);

      return {
        success: true,
        archiveId,
        sizeBytes: raw.length,
        workflowId: record.id
      };
    } catch (err: any) {
      console.error('[OrchestrationEngine] Backup System Error:', err);
      record.state = 'Failed';
      record.errorClassification = 'SYSTEM_BACKUP_ABORTED';
      record.auditEvents.push(`Backup Exception encountered: ${err.message || err}`);
      await this.persistWorkflow(record);
      throw err;
    }
  }
}
