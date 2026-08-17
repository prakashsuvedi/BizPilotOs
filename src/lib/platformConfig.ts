import { clearStaleLocalStorageCache } from './imageUtils';

export interface PlatformDomainConfig {
  platformName: string;
  primaryPlatformUrl: string;
  apiBaseUrl: string;
  allowedFrontendDomains: string[];
  environment: 'production' | 'staging' | 'development';
  updatedAt?: string;
  updatedBy?: string;
}

export type EmailProviderType = 'smtp' | 'sendgrid' | 'resend' | 'simulator';
export type SmtpSecurityType = 'ssl' | 'tls' | 'none';

export interface PlatformEmailConfig {
  provider: EmailProviderType;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPasswordSet?: boolean;
  smtpPasswordMasked?: string;
  smtpPassword?: string; // write-only
  smtpSecurity: SmtpSecurityType;
  senderName: string;
  senderEmail: string;
  replyToEmail?: string;
  enableProductionEmail: boolean;
  sendgridApiKeySet?: boolean;
  sendgridApiKeyMasked?: string;
  sendgridApiKey?: string; // write-only
  resendApiKeySet?: boolean;
  resendApiKeyMasked?: string;
  resendApiKey?: string; // write-only
  lastTestStatus?: 'IDLE' | 'SUCCESS' | 'FAILED' | 'TESTING';
  lastTestedAt?: string | null;
  lastTestRecipient?: string;
  lastTestError?: string | null;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_PLATFORM_EMAIL_CONFIG: PlatformEmailConfig = {
  provider: 'smtp',
  smtpHost: 'scamspike.com',
  smtpPort: 465,
  smtpUser: 'marketforge@scamspike.com',
  smtpPasswordSet: true,
  smtpPasswordMasked: '••••••••',
  smtpSecurity: 'ssl',
  senderName: 'MarketForge Operations',
  senderEmail: 'marketforge@scamspike.com',
  replyToEmail: 'support@marketforge.scamspike.com',
  enableProductionEmail: true,
  lastTestStatus: 'IDLE',
  lastTestedAt: null,
  lastTestRecipient: '',
  lastTestError: null
};

export const DEFAULT_PLATFORM_CONFIG: PlatformDomainConfig = {
  platformName: 'MarketForge OS',
  primaryPlatformUrl: 'https://marketforge.scamspike.com',
  apiBaseUrl: 'https://marketforge-api-vpgj.onrender.com',
  allowedFrontendDomains: [
    'https://marketforge.scamspike.com',
    'https://marketforge-api-vpgj.onrender.com'
  ],
  environment: 'production'
};

const STORAGE_KEY = 'marketforge_platform_domain_config';

/**
 * Validates a URL string ensuring valid protocol and hostname without malicious schemes
 */
export function isValidHttpUrl(urlString: string, allowHttp: boolean = false): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.trim());
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:' || parsed.protocol === 'vbscript:') {
      return false;
    }
    if (allowHttp) {
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    return parsed.protocol === 'https:' || (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

/**
 * Retrieve current platform domain and deployment configuration
 */
export function getPlatformDomainConfig(): PlatformDomainConfig {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return DEFAULT_PLATFORM_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        platformName: parsed.platformName || DEFAULT_PLATFORM_CONFIG.platformName,
        primaryPlatformUrl: parsed.primaryPlatformUrl || DEFAULT_PLATFORM_CONFIG.primaryPlatformUrl,
        apiBaseUrl: parsed.apiBaseUrl || DEFAULT_PLATFORM_CONFIG.apiBaseUrl,
        allowedFrontendDomains: Array.isArray(parsed.allowedFrontendDomains) && parsed.allowedFrontendDomains.length > 0
          ? parsed.allowedFrontendDomains
          : DEFAULT_PLATFORM_CONFIG.allowedFrontendDomains,
        environment: parsed.environment || DEFAULT_PLATFORM_CONFIG.environment,
        updatedAt: parsed.updatedAt,
        updatedBy: parsed.updatedBy
      };
    }
  } catch (e) {
    console.warn('Error reading platform domain config:', e);
  }
  return DEFAULT_PLATFORM_CONFIG;
}

/**
 * Saves platform domain config locally and dispatches update event
 */
export function savePlatformDomainConfig(newConfig: Partial<PlatformDomainConfig>): PlatformDomainConfig {
  const current = getPlatformDomainConfig();
  const updated: PlatformDomainConfig = {
    ...current,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e: any) {
    console.warn('LocalStorage save attempt failed, clearing stale cache:', e);
    clearStaleLocalStorageCache();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (retryErr) {
      console.warn('LocalStorage quota exceeded for platform domain config. Applied in memory.');
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('platform_domain_updated', { detail: updated }));
  }

  return updated;
}

export type ApiRoutingMode = 'SAME_ORIGIN_API' | 'EXTERNAL_API';

/**
 * Deterministic runtime resolver to determine whether API requests should stay
 * same-origin (co-located full-stack in local/preview/container) or route to an external API server.
 */
export function getApiRoutingMode(): ApiRoutingMode {
  if (typeof window === 'undefined') {
    return 'SAME_ORIGIN_API';
  }

  const hostname = (window.location.hostname || '').toLowerCase();

  // 1. Localhost / Loopback / Local network -> always SAME_ORIGIN_API
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local')
  ) {
    return 'SAME_ORIGIN_API';
  }

  // 2. AI Studio Dev / Preview / Cloud Run co-located full-stack containers -> always SAME_ORIGIN_API
  if (
    hostname.endsWith('.run.app') ||
    hostname.endsWith('.google.com') ||
    hostname.includes('ais-dev-') ||
    hostname.includes('ais-pre-')
  ) {
    return 'SAME_ORIGIN_API';
  }

  // 3. Known separate production frontend deployments (e.g. marketforge.scamspike.com)
  if (hostname === 'marketforge.scamspike.com' || hostname.endsWith('.scamspike.com')) {
    return 'EXTERNAL_API';
  }

  // 4. Check if explicit VITE_API_URL is configured for a separate hosting environment
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const envUrl = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.VITE_BACKEND_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      try {
        const parsed = new URL(envUrl.trim());
        if (parsed.origin !== window.location.origin) {
          return 'EXTERNAL_API';
        }
      } catch {
        // Ignore invalid URL
      }
    }
  }

  // 5. Check stored custom domain config for external static frontend
  const customConfig = getPlatformDomainConfig();
  if (
    customConfig.apiBaseUrl &&
    customConfig.apiBaseUrl !== window.location.origin &&
    !hostname.endsWith('.run.app')
  ) {
    return 'EXTERNAL_API';
  }

  return 'SAME_ORIGIN_API';
}

/**
 * Returns the active platform primary URL
 */
export function getPlatformUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const mode = getApiRoutingMode();
    if (mode === 'SAME_ORIGIN_API') {
      return window.location.origin;
    }
  }
  const config = getPlatformDomainConfig();
  return config.primaryPlatformUrl || DEFAULT_PLATFORM_CONFIG.primaryPlatformUrl;
}

/**
 * Returns the configured API base URL
 */
export function getApiBaseUrl(): string {
  const mode = getApiRoutingMode();
  if (mode === 'SAME_ORIGIN_API') {
    return typeof window !== 'undefined' && window.location ? window.location.origin : '';
  }

  // In EXTERNAL_API mode:
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const envUrl = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.VITE_BACKEND_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      return envUrl.trim().replace(/\/+$/, '');
    }
  }
  const config = getPlatformDomainConfig();
  return (config.apiBaseUrl || DEFAULT_PLATFORM_CONFIG.apiBaseUrl).replace(/\/+$/, '');
}

/**
 * Formats a full tenant landing or workspace URL
 */
export function formatTenantPlatformUrl(tenantSlug: string, isWorkspace: boolean = false): string {
  const base = getPlatformUrl().replace(/\/+$/, '');
  const cleanSlug = (tenantSlug || 'demo-tenant').trim().replace(/^\/+/, '');
  if (isWorkspace) {
    return `${base}/${cleanSlug}?action=workspace`;
  }
  return `${base}/${cleanSlug}`;
}
