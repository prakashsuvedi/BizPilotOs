import { clearStaleLocalStorageCache } from './imageUtils';

export interface ClientLogoSpec {
  id: string;
  name: string;
  logoUrl?: string;
  category: string;
  metric?: string;
  badgeColor?: string;
  tenantId?: string;
  email?: string;
  password?: string;
}

export interface PlatformLogoSettings {
  fullLogoUrl: string;
  headerLogoUrl: string;
  emblemUrl: string;
  brandName?: string;
  tagline?: string;
  showTextInHeader?: boolean;
  updatedAt?: string;
  topClients?: ClientLogoSpec[];
}

export const DEFAULT_TOP_CLIENTS: ClientLogoSpec[] = [
  {
    id: 'client-1',
    name: 'Sienna & Clay',
    category: 'Omni Retail & Luxury',
    metric: '$42M GMV',
    badgeColor: 'from-amber-500 to-rose-500',
    tenantId: 'sienna-tenant',
    email: 'evelyn@siennaclay.com',
    password: 'siennapass123'
  },
  {
    id: 'client-2',
    name: 'Solas Global Supply',
    category: 'Logistics & Cold Chain',
    metric: '180+ Hubs',
    badgeColor: 'from-cyan-500 to-blue-500',
    tenantId: 'solas-tenant',
    email: 'ops@solas.io',
    password: 'solaspass123'
  },
  {
    id: 'client-3',
    name: 'Apex Wealth Treasury',
    category: 'FinTech & Banking',
    metric: '$1.2B Assets',
    badgeColor: 'from-emerald-500 to-teal-500',
    tenantId: 'demo-tenant',
    email: 'owner@democorp.com',
    password: 'demopass123'
  },
  {
    id: 'client-4',
    name: 'Alpha Dynamics AI',
    category: 'Robotics & Hardware',
    metric: 'Autonomous OS',
    badgeColor: 'from-purple-500 to-indigo-500',
    tenantId: 'alpha-tenant',
    email: 'founder@alpha.io',
    password: 'alphapass123'
  }
];

export const DEFAULT_PLATFORM_LOGOS: PlatformLogoSettings = {
  fullLogoUrl: '/assets/marketforge-logo.svg',
  headerLogoUrl: '/assets/marketforge-header-logo.svg',
  emblemUrl: '/assets/marketforge-emblem.svg',
  brandName: 'MarketForge OS',
  tagline: 'A TRUE BUSINESS TRANSFORMATION',
  showTextInHeader: true,
  topClients: DEFAULT_TOP_CLIENTS
};

const STORAGE_KEY = 'marketforge_platform_logo_settings';

export function getPlatformLogoSettings(): PlatformLogoSettings {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_LOGOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        fullLogoUrl: parsed.fullLogoUrl || DEFAULT_PLATFORM_LOGOS.fullLogoUrl,
        headerLogoUrl: parsed.headerLogoUrl || parsed.fullLogoUrl || DEFAULT_PLATFORM_LOGOS.headerLogoUrl,
        emblemUrl: parsed.emblemUrl || parsed.headerLogoUrl || parsed.fullLogoUrl || DEFAULT_PLATFORM_LOGOS.emblemUrl,
        brandName: parsed.brandName || DEFAULT_PLATFORM_LOGOS.brandName,
        tagline: parsed.tagline || DEFAULT_PLATFORM_LOGOS.tagline,
        showTextInHeader: parsed.showTextInHeader !== undefined ? parsed.showTextInHeader : true,
        updatedAt: parsed.updatedAt,
        topClients: Array.isArray(parsed.topClients) && parsed.topClients.length > 0 ? parsed.parsedTopClients || parsed.topClients : DEFAULT_TOP_CLIENTS
      };
    }
  } catch (e) {
    console.warn('Error reading platform logo settings:', e);
  }
  return DEFAULT_PLATFORM_LOGOS;
}

export function savePlatformLogoSettings(newSettings: Partial<PlatformLogoSettings>): PlatformLogoSettings {
  const current = getPlatformLogoSettings();
  const updated: PlatformLogoSettings = {
    ...current,
    ...newSettings,
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
      console.warn('LocalStorage quota exceeded for platform logo settings. Applied in memory.');
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('platform_logo_updated', { detail: updated }));
  }

  return updated;
}

export function resetPlatformLogoSettings(): PlatformLogoSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('platform_logo_updated', { detail: DEFAULT_PLATFORM_LOGOS }));
  }

  return DEFAULT_PLATFORM_LOGOS;
}
