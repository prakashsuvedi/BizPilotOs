/**
 * MarketForge AI™ Enterprise Core Module SDK (Layer 1 Core SDK)
 * 
 * This SDK defines the official, strongly-typed contracts and registry APIs
 * that allow external Level 2 business vertical modules (e.g., Marketing, CRM, Restaurant,
 * Hotel, Healthcare, Accounting, POS) to plug seamlessly into the Layer 1 Enterprise Core Platform.
 * 
 * Design Philosophy: Loose Coupling via Declarative Registration.
 * No business module should ever directly modify the Core Platform codebase.
 */

import { EnterpriseRole } from './services';

/**
 * STRONGLY TYPED ENTERPRISE CAPABILITIES
 * This registry powers dynamic feature flags, navigation filters, and billing tiers.
 */
export type EnterpriseCapability =
  | 'marketing.campaigns'
  | 'marketing.strategy'
  | 'marketing.social'
  | 'restaurant.table-booking'
  | 'restaurant.kitchen'
  | 'crm.pipeline'
  | 'crm.contacts'
  | 'hotel.booking'
  | 'accounting.invoicing'
  | 'accounting.ledger'
  | 'warehouse.inventory'
  | 'healthcare.patient-records'
  | 'pos.transactions'
  | 'hr.onboarding';

/**
 * 1. MODULE MANIFEST
 * Defines core metadata, licensing, and general requirements of the Level 2 module.
 */
export interface ModuleManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  requiredTier: 'Starter' | 'Professional' | 'Business' | 'Enterprise';
  dependencies?: string[];
  status: 'active' | 'inactive' | 'beta';
  icon: string;
  capabilities: EnterpriseCapability[];
}

/**
 * 2. NAVIGATION REGISTRATION
 * Registers sidebar tabs, deep route actions, and menu groups.
 */
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  group: 'operations' | 'marketing' | 'management' | 'finance' | 'admin';
  rolesAllowed: EnterpriseRole[];
  badge?: string;
  requiredCapability?: EnterpriseCapability;
}

/**
 * 3. PERMISSION REGISTRATION
 * Centralizes granular capabilities registered by the module to the core RBAC system.
 */
export interface ModulePermission {
  id: string; // e.g. "read:restaurant_menu"
  name: string;
  description: string;
  category: string;
  defaultRolesWithAccess: EnterpriseRole[];
  requiredCapability?: EnterpriseCapability;
}

/**
 * 4. WORKFLOW REGISTRATION
 * Registers metadata-driven operational pipelines and interactive state workflows.
 */
export interface ModuleWorkflowStep {
  id: string;
  title: string;
  description: string;
  requiredRole?: EnterpriseRole;
  actionHook?: string;
}

export interface ModuleWorkflow {
  id: string;
  name: string;
  category: 'onboarding' | 'compliance' | 'publication' | 'accounting_close' | 'clinical_audit';
  steps: ModuleWorkflowStep[];
  requiredCapability?: EnterpriseCapability;
}

/**
 * 5. AI AGENT REGISTRATION
 * Integrates custom intelligent personas or prompt pipelines with the Core AI Router.
 */
export interface ModuleAIAgent {
  id: string;
  name: string;
  roleDescription: string;
  systemDirective: string;
  recommendedModel: 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'imagen-3';
  temperature: number;
  requiredCapability?: EnterpriseCapability;
}

/**
 * 6. DATABASE SCHEMA REGISTRATION
 * Registers isolated Firestore collections and required index metrics used by the module.
 */
export interface DatabaseCollectionSchema {
  collectionName: string;
  isTenantIsolated: boolean; // Must be true for compliance
  indices?: string[];
  validatorHook?: (data: any) => { isValid: boolean; errors: string[] };
}

/**
 * 7. SETTINGS REGISTRATION
 * Plugs custom administrative or configurations inputs into the global user/admin views.
 */
export interface ModuleSettingField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  defaultValue: any;
  options?: string[];
}

export interface ModuleSettingsSection {
  id: string;
  title: string;
  fields: ModuleSettingField[];
}

/**
 * 8. DASHBOARD WIDGET REGISTRATION
 * Registers custom metrics, visual bento components, or charts into the tenant dashboard.
 */
export interface DashboardWidget {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  componentType: 'chart' | 'metric' | 'list' | 'action_items';
  rolesAllowed: EnterpriseRole[];
  requiredCapability?: EnterpriseCapability;
}

/**
 * FULL INTEGRATED MODULE SPECIFICATION
 */
export interface BusinessModuleSpec {
  manifest: ModuleManifest;
  navigation: NavigationItem[];
  permissions: ModulePermission[];
  workflows?: ModuleWorkflow[];
  aiAgents?: ModuleAIAgent[];
  databaseSchema?: DatabaseCollectionSchema[];
  settings?: ModuleSettingsSection[];
  widgets?: DashboardWidget[];
}

/**
 * ENTERPRISE CORE MODULE REGISTRY ENGINE
 */
export class EnterpriseCoreSDK {
  private static registeredModules: Map<string, BusinessModuleSpec> = new Map();
  private static capabilityProviders: Map<EnterpriseCapability, string> = new Map();

  /**
   * Register a new Layer 2 Business Module into the platform.
   */
  static registerModule(moduleSpec: BusinessModuleSpec): void {
    const { id } = moduleSpec.manifest;
    if (this.registeredModules.has(id)) {
      console.warn(`[ModuleSDK] Warning: Module "${id}" is already registered. Overwriting with new spec.`);
    }
    
    // Ensure strict multi-tenant schema verification
    if (moduleSpec.databaseSchema) {
      for (const col of moduleSpec.databaseSchema) {
        if (!col.isTenantIsolated) {
          throw new Error(`[SecurityViolation] Module "${id}" attempted to register a non-tenant isolated collection: "${col.collectionName}". Isolation is mandatory.`);
        }
      }
    }

    // Map capabilities to this providing module
    if (moduleSpec.manifest.capabilities) {
      for (const cap of moduleSpec.manifest.capabilities) {
        this.capabilityProviders.set(cap, id);
      }
    }

    this.registeredModules.set(id, moduleSpec);
    console.info(`[ModuleSDK] Module registered successfully: "${moduleSpec.manifest.name}" v${moduleSpec.manifest.version}`);
  }

  /**
   * Lists all currently loaded and authorized enterprise modules.
   */
  static getModules(): BusinessModuleSpec[] {
    return Array.from(this.registeredModules.values());
  }

  /**
   * Retrieves specific module specifications by id.
   */
  static getModuleById(id: string): BusinessModuleSpec | null {
    return this.registeredModules.get(id) || null;
  }

  /**
   * Verifies if a specific capability has been registered in the system and is entitled for a plan.
   */
  static isCapabilityEnabled(capability: EnterpriseCapability, plan: string = 'Starter'): boolean {
    const providerModuleId = this.capabilityProviders.get(capability);
    if (!providerModuleId) return false;

    const mod = this.getModuleById(providerModuleId);
    if (!mod) return false;

    // Check plan restriction hierarchy
    const requiredTier = mod.manifest.requiredTier;
    const tierRanks: Record<string, number> = { Starter: 1, Professional: 2, Business: 3, Enterprise: 4 };
    const currentRank = tierRanks[plan] || 1;
    const requiredRank = tierRanks[requiredTier] || 1;

    return currentRank >= requiredRank;
  }

  /**
   * Auto-discovers navigation items filtered by user authorization level and capability checks.
   */
  static getAuthorizedNavigation(role: EnterpriseRole, plan: string = 'Starter'): NavigationItem[] {
    const items: NavigationItem[] = [];
    for (const mod of this.registeredModules.values()) {
      for (const nav of mod.navigation) {
        // Filter by role allowance
        const hasRole = nav.rolesAllowed.includes(role) || nav.rolesAllowed.includes('viewer');
        if (!hasRole) continue;

        // Filter by capability allowance if specified
        if (nav.requiredCapability) {
          if (!this.isCapabilityEnabled(nav.requiredCapability, plan)) {
            continue;
          }
        }

        items.push(nav);
      }
    }
    return items;
  }

  /**
   * Auto-discovers active custom AI agents for the prompt pipeline with capability checks.
   */
  static getRegisteredAIAgents(plan: string = 'Starter'): ModuleAIAgent[] {
    const agents: ModuleAIAgent[] = [];
    for (const mod of this.registeredModules.values()) {
      if (mod.aiAgents) {
        for (const agent of mod.aiAgents) {
          if (agent.requiredCapability) {
            if (!this.isCapabilityEnabled(agent.requiredCapability, plan)) {
              continue;
            }
          }
          agents.push(agent);
        }
      }
    }
    return agents;
  }

  /**
   * Dynamic capabilities list
   */
  static getAllRegisteredCapabilities(): { capability: EnterpriseCapability; providerId: string; enabled: boolean }[] {
    return Array.from(this.capabilityProviders.entries()).map(([cap, provId]) => {
      const spec = this.getModuleById(provId);
      return {
        capability: cap,
        providerId: provId,
        enabled: spec ? spec.manifest.status === 'active' : false
      };
    });
  }
}
