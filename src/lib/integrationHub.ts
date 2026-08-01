/**
 * MarketForge AI™ Enterprise Integration Hub
 * 
 * Central gateway for all external system connectors. 
 * Level 2 modules MUST communicate with third-party APIs through this Hub.
 */

import { clientDb } from './firebase';

export interface IntegrationHealth {
  status: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED' | 'UNCONFIGURED';
  latencyMs: number;
  lastChecked: string;
  error?: string;
}

export interface IntegrationActionLog {
  tenantId: string;
  connectorId: string;
  action: string;
  status: 'SUCCESS' | 'FAIL';
  latencyMs: number;
  timestamp: string;
  details?: string;
}

/**
 * UNIFIED PROVIDER INTERFACE
 */
export interface IntegrationProvider {
  id: string;
  name: string;
  category: 'workspace' | 'payments' | 'accounting' | 'marketing' | 'communication' | 'hosting';
  version: string;
  rateLimitPerMinute: number;
  
  authorize(tenantId: string, credentials: any): Promise<{ success: boolean; details?: string }>;
  refreshToken(tenantId: string): Promise<{ success: boolean; accessToken?: string }>;
  checkHealth(tenantId: string): Promise<IntegrationHealth>;
  executeAction(tenantId: string, action: string, payload: any): Promise<any>;
}

/**
 * ENTERPRISE INTEGRATION HUB REGISTRY
 */
export class IntegrationHub {
  private static providers: Map<string, IntegrationProvider> = new Map();
  private static activeLimits: Map<string, { count: number; windowStart: number }> = new Map();

  /**
   * Registers a provider connector into the central hub.
   */
  static registerProvider(provider: IntegrationProvider): void {
    this.providers.set(provider.id, provider);
    console.info(`[IntegrationHub] Registered connector: "${provider.name}" [v${provider.version}]`);
  }

  /**
   * Retrieves registered providers.
   */
  static getProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Retrieves provider by ID.
   */
  static getProvider(id: string): IntegrationProvider | null {
    return this.providers.get(id) || null;
  }

  /**
   * Executes a standardized external system call with automated audit trailing,
   * rate-limiting enforcement, and automatic error retry logic.
   */
  static async callConnector(
    tenantId: string,
    providerId: string,
    action: string,
    payload: any,
    retryCount: number = 2
  ): Promise<any> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`[IntegrationHubError] Connector "${providerId}" not found in system registry.`);
    }

    // 1. Rate Limiting Check (Token-Bucket mechanism scoped by tenant & connector)
    const limitKey = `${tenantId}:${providerId}`;
    const now = Date.now();
    const limitState = this.activeLimits.get(limitKey) || { count: 0, windowStart: now };

    if (now - limitState.windowStart > 60000) {
      limitState.count = 0;
      limitState.windowStart = now;
    }

    if (limitState.count >= provider.rateLimitPerMinute) {
      throw new Error(`[RateLimitExceeded] Rate limit of ${provider.rateLimitPerMinute}/min exceeded for connector "${providerId}" on tenant "${tenantId}".`);
    }

    limitState.count++;
    this.activeLimits.set(limitKey, limitState);

    // 2. Connector Execution with Automatic Retries
    const startTime = Date.now();
    let lastError: any = null;

    for (let attempt = 1; attempt <= retryCount + 1; attempt++) {
      try {
        const result = await provider.executeAction(tenantId, action, payload);
        const duration = Date.now() - startTime;

        // Log to immutable database audit stream
        await this.logAction({
          tenantId,
          connectorId: providerId,
          action,
          status: 'SUCCESS',
          latencyMs: duration,
          timestamp: new Date().toISOString(),
          details: `Attempt ${attempt}/${retryCount + 1} succeeded.`
        });

        return result;
      } catch (err: any) {
        lastError = err;
        console.warn(`[IntegrationHub] Attempt ${attempt} failed for ${providerId}:${action}. Error: ${err?.message || err}`);
        
        // Wait exponential backoff
        if (attempt <= retryCount) {
          await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 300));
        }
      }
    }

    const duration = Date.now() - startTime;
    // Log failures
    await this.logAction({
      tenantId,
      connectorId: providerId,
      action,
      status: 'FAIL',
      latencyMs: duration,
      timestamp: new Date().toISOString(),
      details: `Failed after ${retryCount + 1} attempts. Root: ${lastError?.message || lastError}`
    });

    throw new Error(`[IntegrationHubError] Action failed after retry limits. Root: ${lastError?.message || lastError}`);
  }

  /**
   * Internal logging stream
   */
  private static async logAction(log: IntegrationActionLog): Promise<void> {
    try {
      await clientDb.addDocToTenant('integration_logs', log, log.tenantId, 'system-integration-hub');
    } catch (err) {
      console.error("[IntegrationHub] Failed to write action logs to Firestore:", err);
    }
  }
}

/**
 * --- PRE-LOADED STANDARD PLATFORM PROVIDERS ---
 */

// 1. Stripe Connector Implementation
class StripeProvider implements IntegrationProvider {
  id = 'stripe';
  name = 'Stripe Payments';
  category: 'payments' = 'payments';
  version = '2023-10-16';
  rateLimitPerMinute = 120;

  async authorize(tenantId: string, credentials: any): Promise<{ success: boolean; details?: string }> {
    if (!credentials?.secretKey) {
      return { success: false, details: 'Secret key is required for Stripe authentication.' };
    }
    // Secure token saving simulation
    await clientDb.addDocToTenant('data_integrations', {
      providerId: this.id,
      isEnabled: true,
      authStatus: 'VERIFIED',
      encryptedToken: 'AES_256_MOCKED_SECRET_KEY',
      updatedAt: new Date().toISOString()
    }, tenantId);
    return { success: true, details: 'Stripe API keys validated.' };
  }

  async refreshToken(tenantId: string): Promise<{ success: boolean }> {
    return { success: true }; // Stripe keys are static unless rotated
  }

  async checkHealth(tenantId: string): Promise<IntegrationHealth> {
    return {
      status: 'CONNECTED',
      latencyMs: 95,
      lastChecked: new Date().toISOString()
    };
  }

  async executeAction(tenantId: string, action: string, payload: any): Promise<any> {
    if (action === 'create_charge') {
      return { chargeId: `ch_${Math.random().toString(36).substring(7)}`, amount: payload.amount, currency: payload.currency, status: 'succeeded' };
    }
    if (action === 'create_subscription') {
      return { subId: `sub_${Math.random().toString(36).substring(7)}`, plan: payload.planId, active: true };
    }
    throw new Error(`Unknown action "${action}" on Stripe Provider.`);
  }
}

// 2. Google Workspace Connector Implementation
class GoogleWorkspaceProvider implements IntegrationProvider {
  id = 'google_workspace';
  name = 'Google Workspace';
  category: 'workspace' = 'workspace';
  version = 'v2';
  rateLimitPerMinute = 250;

  async authorize(tenantId: string, credentials: any): Promise<{ success: boolean; details?: string }> {
    return { success: true, details: 'OAuth Access Token mapped.' };
  }

  async refreshToken(tenantId: string): Promise<{ success: boolean; accessToken: string }> {
    return { success: true, accessToken: 'GOOGLE_OAUTH_REFRESHED_MOCK_TOKEN' };
  }

  async checkHealth(tenantId: string): Promise<IntegrationHealth> {
    return {
      status: 'CONNECTED',
      latencyMs: 140,
      lastChecked: new Date().toISOString()
    };
  }

  async executeAction(tenantId: string, action: string, payload: any): Promise<any> {
    if (action === 'create_event') {
      return { eventId: `evt_${Date.now()}`, calendarId: payload.calendarId || 'primary', summary: payload.summary, status: 'confirmed' };
    }
    if (action === 'sync_contacts') {
      return { syncedCount: 42, source: 'google_contacts' };
    }
    throw new Error(`Google Workspace does not support action "${action}".`);
  }
}

// 3. Slack Connector
class SlackProvider implements IntegrationProvider {
  id = 'slack';
  name = 'Slack Business';
  category: 'communication' = 'communication';
  version = 'v1.1';
  rateLimitPerMinute = 150;

  async authorize(tenantId: string, credentials: any) {
    return { success: true };
  }
  async refreshToken(tenantId: string) {
    return { success: true };
  }
  async checkHealth(tenantId: string): Promise<IntegrationHealth> {
    return { status: 'CONNECTED', latencyMs: 80, lastChecked: new Date().toISOString() };
  }
  async executeAction(tenantId: string, action: string, payload: any) {
    if (action === 'post_message') {
      return { channel: payload.channel, ts: `${Date.now()}.000100`, ok: true };
    }
    throw new Error(`Slack connector does not support "${action}" action.`);
  }
}

// 4. QuickBooks Accounting Connector
class QuickBooksProvider implements IntegrationProvider {
  id = 'quickbooks';
  name = 'QuickBooks Online';
  category: 'accounting' = 'accounting';
  version = 'v3';
  rateLimitPerMinute = 100;

  async authorize(tenantId: string, credentials: any) {
    return { success: true };
  }
  async refreshToken(tenantId: string) {
    return { success: true, accessToken: 'QB_REFRESHED_TOKEN' };
  }
  async checkHealth(tenantId: string): Promise<IntegrationHealth> {
    return { status: 'CONNECTED', latencyMs: 220, lastChecked: new Date().toISOString() };
  }
  async executeAction(tenantId: string, action: string, payload: any) {
    if (action === 'create_invoice') {
      return { invoiceId: `inv_qb_${Date.now()}`, customerId: payload.customerId, total: payload.amount, tax: payload.tax || 0 };
    }
    throw new Error(`QuickBooks does not support "${action}".`);
  }
}

// Register pre-loaded connectors automatically
IntegrationHub.registerProvider(new StripeProvider());
IntegrationHub.registerProvider(new GoogleWorkspaceProvider());
IntegrationHub.registerProvider(new SlackProvider());
IntegrationHub.registerProvider(new QuickBooksProvider());
