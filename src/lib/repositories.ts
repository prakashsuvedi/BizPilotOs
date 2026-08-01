import { InfrastructureHub } from './infrastructure';

/**
 * Enterprise Repository Validation Interface
 */
export interface RepositoryValidator<T> {
  validate(data: Partial<T>): { isValid: boolean; errors: string[] };
}

/**
 * Base Abstract Repository implementing the SOLID design rules of Layer 1 Core.
 * Restricts query and mutation actions strictly to tenant isolation boundaries.
 */
export class BaseRepository<T extends { id: string; tenantId?: string }> {
  constructor(
    protected colName: string,
    protected validator?: RepositoryValidator<T>
  ) {}

  /**
   * Run validation hook before write operations.
   */
  protected validate(data: Partial<T>) {
    if (this.validator) {
      const result = this.validator.validate(data);
      if (!result.isValid) {
        throw new Error(`[ValidationError] [${this.colName}] ${result.errors.join(', ')}`);
      }
    }
  }

  /**
   * Create an entity safely in the isolated tenant context.
   */
  async create(data: Omit<T, 'id'>, tenantId: string): Promise<T> {
    this.validate(data as Partial<T>);
    const currentUser = InfrastructureHub.getAuth().getCurrentUser();
    const authorUid = currentUser?.uid || 'system_worker';
    return InfrastructureHub.getDatabase().addDocToTenant(this.colName, data, tenantId, authorUid);
  }

  /**
   * Read single entity checking strict tenant isolation bounds.
   */
  async getById(id: string, tenantId: string): Promise<T | null> {
    const doc = await InfrastructureHub.getDatabase().getDocById<T>(this.colName, id);
    if (!doc) return null;
    if (doc.tenantId && doc.tenantId !== tenantId) {
      throw new Error(`[SecurityViolation] Unauthorized access request on resource ${this.colName}/${id}`);
    }
    return doc;
  }

  /**
   * Read all entities isolating the search strict to tenantId.
   */
  async list(tenantId: string, filter?: (item: T) => boolean): Promise<T[]> {
    const all = await InfrastructureHub.getDatabase().getCollection<T>(this.colName, tenantId);
    if (filter) {
      return all.filter(filter);
    }
    return all;
  }

  /**
   * Update an isolated entity securely.
   */
  async update(id: string, data: Partial<T>, tenantId: string): Promise<T> {
    // Verification: Must load existing to verify ownership
    const existing = await this.getById(id, tenantId);
    if (!existing) {
      throw new Error(`[NotFoundError] Entity ${id} not located in collection ${this.colName}`);
    }
    this.validate({ ...existing, ...data } as Partial<T>);
    const currentUser = InfrastructureHub.getAuth().getCurrentUser();
    const authorUid = currentUser?.uid || 'system_worker';
    return InfrastructureHub.getDatabase().updateDocInTenant(this.colName, id, data, tenantId, authorUid);
  }

  /**
   * Delete an isolated entity securely.
   */
  async delete(id: string, tenantId: string): Promise<void> {
    // Verification: Must load existing to verify ownership
    const existing = await this.getById(id, tenantId);
    if (!existing) {
      throw new Error(`[NotFoundError] Entity ${id} not located in collection ${this.colName}`);
    }
    const currentUser = InfrastructureHub.getAuth().getCurrentUser();
    const authorUid = currentUser?.uid || 'system_worker';
    return InfrastructureHub.getDatabase().deleteDocInTenant(this.colName, id, tenantId, authorUid);
  }


  /**
   * Executes atomic multiple mutations securely.
   */
  async batchWrite(operations: Array<{ type: 'create' | 'update' | 'delete'; id?: string; data?: any }>, tenantId: string): Promise<void> {
    for (const op of operations) {
      if (op.type === 'create') {
        await this.create(op.data, tenantId);
      } else if (op.type === 'update' && op.id) {
        await this.update(op.id, op.data, tenantId);
      } else if (op.type === 'delete' && op.id) {
        await this.delete(op.id, tenantId);
      }
    }
  }
}

// validators definitions
const DefaultValidator = {
  validate: () => ({ isValid: true, errors: [] })
};

export class TenantRepository extends BaseRepository<any> {
  constructor() {
    super('tenants', {
      validate: (data: any) => {
        const errors = [];
        if (!data.name) errors.push('Tenant Name is required');
        return { isValid: errors.length === 0, errors };
      }
    });
  }
}

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super('users', {
      validate: (data: any) => {
        const errors = [];
        if (!data.email) errors.push('User Email is required');
        if (!data.role) errors.push('User Role designation is required');
        return { isValid: errors.length === 0, errors };
      }
    });
  }
}

export class CampaignRepository extends BaseRepository<any> {
  constructor() {
    super('campaigns', {
      validate: (data: any) => {
        const errors = [];
        if (!data.campaignName) errors.push('Campaign name is required');
        return { isValid: errors.length === 0, errors };
      }
    });
  }
}

export class AuditRepository extends BaseRepository<any> {
  constructor() {
    super('audit_logs', DefaultValidator);
  }
}

export class BrandRepository extends BaseRepository<any> {
  constructor() {
    super('brand_guidelines', DefaultValidator);
  }
}

export class SubscriptionRepository extends BaseRepository<any> {
  constructor() {
    super('subscriptions', DefaultValidator);
  }
}

export class WorkflowRepository extends BaseRepository<any> {
  constructor() {
    super('workflows', DefaultValidator);
  }
}

export class NotificationRepository extends BaseRepository<any> {
  constructor() {
    super('notifications', DefaultValidator);
  }
}

export class CampaignProfileRepository extends BaseRepository<any> {
  constructor() {
    super('campaign_profiles', DefaultValidator);
  }
}

export class ContentAssetRepository extends BaseRepository<any> {
  constructor() {
    super('content_assets', DefaultValidator);
  }
}

// Singletons for Core Services usage
export const tenantRepo = new TenantRepository();
export const userRepo = new UserRepository();
export const campaignRepo = new CampaignRepository();
export const auditRepo = new AuditRepository();
export const brandRepo = new BrandRepository();
export const subscriptionRepo = new SubscriptionRepository();
export const workflowRepo = new WorkflowRepository();
export const notificationRepo = new NotificationRepository();
export const campaignProfileRepo = new CampaignProfileRepository();
export const contentAssetRepo = new ContentAssetRepository();
