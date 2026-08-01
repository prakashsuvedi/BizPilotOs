/**
 * MarketForge AI™ — Enterprise Error Framework
 * Standardized, typed error classifications aligned with ASVS L2 & OWASP compliance standards.
 */

export class BaseEnterpriseError extends Error {
  public readonly code: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly retryable: boolean;
  public readonly correlationId: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'INTERNAL_ENTERPRISE_FAULT',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    retryable: boolean = false,
    correlationId: string = `corr_${Math.random().toString(36).substr(2, 9)}`
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.retryable = retryable;
    this.correlationId = correlationId;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      retryable: this.retryable,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
    };
  }
}

export class ValidationError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'VALIDATION_ERROR', 'low', false, correlationId);
  }
}

export class AuthenticationError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'AUTHENTICATION_ERROR', 'high', false, correlationId);
  }
}

export class AuthorizationError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'AUTHORIZATION_ERROR', 'high', false, correlationId);
  }
}

export class RateLimitError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'RATE_LIMIT_ERROR', 'medium', true, correlationId);
  }
}

export class RepositoryError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'REPOSITORY_ERROR', 'medium', true, correlationId);
  }
}

export class IntegrationError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'INTEGRATION_ERROR', 'medium', true, correlationId);
  }
}

export class AIProviderError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'AI_PROVIDER_ERROR', 'medium', true, correlationId);
  }
}

export class StorageError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'STORAGE_ERROR', 'medium', true, correlationId);
  }
}

export class BillingError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'BILLING_ERROR', 'high', false, correlationId);
  }
}

export class QuotaError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'QUOTA_ERROR', 'medium', false, correlationId);
  }
}

export class TimeoutError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'TIMEOUT_ERROR', 'medium', true, correlationId);
  }
}

export class DatabaseError extends BaseEnterpriseError {
  constructor(message: string, correlationId?: string) {
    super(message, 'DATABASE_ERROR', 'critical', true, correlationId);
  }
}
