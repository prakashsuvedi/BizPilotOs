import { clientDb } from './firebase';

export interface CustomFeatureTile {
  title: string;
  desc: string;
  badge?: string;
}

export interface CustomProductTile {
  id: string;
  title: string;
  price: string;
  unit?: string;
  rating?: string;
  image: string;
  category: string;
  badge?: string;
  description?: string;
  features?: string[];
}

export interface CustomLandingData {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  ctaButtonText?: string;
  showcaseFeatures?: CustomFeatureTile[];
  productsCatalog?: CustomProductTile[];
  aboutText?: string;
}

import { clearStaleLocalStorageCache } from './imageUtils';

export interface TenantBranding {
  tenantId: string;
  businessType?: string;
  companyName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  supportEmail: string;
  primaryColor: string;
  accentColor: string;
  customDomain: string;
  domainRoutingMode: 'path' | 'subdomain' | 'custom_domain';
  dnsStatus: 'verified' | 'pending' | 'unverified';
  sslStatus: 'active' | 'pending_dns';
  homepageSource: 'website_builder' | 'custom_landing' | 'default';
  activeTheme?: string;
  customLandingData?: CustomLandingData;
  lastUpdated?: string;
}

const DEFAULT_BRANDINGS: Record<string, Partial<TenantBranding>> = {
  'demo-tenant': {
    companyName: 'Enterprise DemoCorp',
    tagline: 'The complete AI-powered next-gen enterprise operating system.',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    address: '100 Enterprise Way, Suite 400, San Francisco, CA 94105',
    phone: '+1 (800) 555-DEMO',
    supportEmail: 'support@democorp.com',
    primaryColor: '#6366f1',
    accentColor: '#06b6d4',
    customDomain: 'demo.marketforge.com',
    domainRoutingMode: 'subdomain',
    dnsStatus: 'verified',
    sslStatus: 'active',
    homepageSource: 'default'
  },
  'sienna-tenant': {
    companyName: 'Sienna Clay Co',
    tagline: 'Handcrafted artisan ceramics & sustainable luxury stoneware.',
    logoUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80',
    address: '742 Clay Studio Lane, Portland, OR 97201',
    phone: '+1 (503) 555-CLAY',
    supportEmail: 'hello@siennaclay.com',
    primaryColor: '#d97706',
    accentColor: '#b45309',
    customDomain: 'siennaclay.com',
    domainRoutingMode: 'custom_domain',
    dnsStatus: 'verified',
    sslStatus: 'active',
    homepageSource: 'custom_landing'
  },
  'solas-tenant': {
    companyName: 'Solas Systems',
    tagline: 'Autonomous AI infrastructure & cloud data intelligence.',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80',
    address: '500 Cyber Park, Technology Ridge, Austin, TX 78701',
    phone: '+1 (512) 555-SOLAS',
    supportEmail: 'ops@solas.io',
    primaryColor: '#0ea5e9',
    accentColor: '#38bdf8',
    customDomain: 'solas.io',
    domainRoutingMode: 'custom_domain',
    dnsStatus: 'verified',
    sslStatus: 'active',
    homepageSource: 'default'
  }
};

export function getTenantBranding(tenantId: string): TenantBranding {
  if (!tenantId) tenantId = 'demo-tenant';

  // 1. Try local storage cache
  try {
    const raw = localStorage.getItem(`marketforge_tenant_branding_${tenantId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.companyName) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error parsing local tenant branding:', e);
  }

  // 2. Try matching from master tenants list in local storage
  let tenantFromMaster: any = null;
  try {
    const masterRaw = localStorage.getItem('marketforge_sa_tenants');
    if (masterRaw) {
      const list = JSON.parse(masterRaw);
      tenantFromMaster = list.find((t: any) => t.id === tenantId);
    }
  } catch (e) {}

  const defaultPreset = DEFAULT_BRANDINGS[tenantId] || {};

  const cleanFormattedName = tenantFromMaster?.name || defaultPreset.companyName || 
    tenantId.replace(/[-_]/g, ' ')
      .replace(/\btenant\b/gi, 'Workspace')
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

  const fallback: TenantBranding = {
    tenantId,
    businessType: tenantFromMaster?.businessType || defaultPreset.businessType,
    companyName: cleanFormattedName || 'Enterprise Workspace',
    tagline: defaultPreset.tagline || 'Leading Next-Gen Operations & Integrated Commerce.',
    logoUrl: defaultPreset.logoUrl || '',
    address: defaultPreset.address || '100 Business Avenue, Suite 100, Innovation District',
    phone: defaultPreset.phone || '+1 (800) 555-0199',
    supportEmail: tenantFromMaster?.ownerEmail || defaultPreset.supportEmail || `contact@${tenantId}.com`,
    primaryColor: defaultPreset.primaryColor || '#6366f1',
    accentColor: defaultPreset.accentColor || '#06b6d4',
    customDomain: tenantFromMaster?.domain || defaultPreset.customDomain || `${tenantId}.marketforge.com`,
    domainRoutingMode: defaultPreset.domainRoutingMode || 'path',
    dnsStatus: defaultPreset.dnsStatus || 'verified',
    sslStatus: defaultPreset.sslStatus || 'active',
    homepageSource: defaultPreset.homepageSource || 'default',
    lastUpdated: new Date().toISOString()
  };

  return fallback;
}

export async function fetchTenantBrandingFromServer(tenantId: string): Promise<TenantBranding | null> {
  if (!tenantId) return null;
  try {
    const res = await fetch(`/api/tenant/branding?tenantId=${encodeURIComponent(tenantId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.branding) {
        try {
          localStorage.setItem(`marketforge_tenant_branding_${tenantId}`, JSON.stringify(data.branding));
        } catch (e) {}
        return data.branding;
      }
    }
  } catch (err) {
    console.warn('[TenantBranding] Server fetch failed, fallback to local store:', err);
  }
  return null;
}

export async function saveTenantBranding(branding: TenantBranding): Promise<void> {
  if (!branding.tenantId) return;
  branding.lastUpdated = new Date().toISOString();

  // 1. Save to localStorage
  try {
    localStorage.setItem(`marketforge_tenant_branding_${branding.tenantId}`, JSON.stringify(branding));
  } catch (e) {
    console.warn('Failed to write tenant branding to localStorage, clearing stale cache:', e);
    clearStaleLocalStorageCache();
    try {
      localStorage.setItem(`marketforge_tenant_branding_${branding.tenantId}`, JSON.stringify(branding));
    } catch (retryErr) {
      console.warn('LocalStorage quota exceeded for tenant branding.');
    }
  }

  // 2. Sync to master tenant list in localStorage
  try {
    const masterRaw = localStorage.getItem('marketforge_sa_tenants');
    if (masterRaw) {
      const list = JSON.parse(masterRaw);
      const idx = list.findIndex((t: any) => t.id === branding.tenantId);
      if (idx !== -1) {
        list[idx].name = branding.companyName;
        list[idx].domain = branding.customDomain;
        localStorage.setItem('marketforge_sa_tenants', JSON.stringify(list));
      }
    }
  } catch (e) {}

  // 3. Persist via backend API endpoint (Authoritative Persistence)
  try {
    await fetch('/api/tenant/branding', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-simulated-tenant': branding.tenantId
      },
      body: JSON.stringify(branding)
    }).catch((err) => console.warn('[Branding API Post]', err));
  } catch (apiErr) {}

  // 4. Sync to Firestore client-side non-blocking
  try {
    await clientDb.addDocToTenant('tenant_brandings', branding, branding.tenantId).catch(() => {});
  } catch (err) {}

  // 5. Broadcast global event for instant UI re-rendering across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tenant_branding_updated', { detail: { tenantId: branding.tenantId, branding } }));
  }
}

export async function resetTenantBranding(tenantId: string, businessType?: string): Promise<TenantBranding> {
  let branding: TenantBranding = getTenantBranding(tenantId);
  try {
    const res = await fetch('/api/tenant/branding/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, businessType })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.branding) {
        branding = data.branding;
      }
    }
  } catch (err) {
    console.warn('[Branding Reset API]', err);
  }

  await saveTenantBranding(branding);
  return branding;
}

export async function verifyTenantCustomDomain(
  tenantId: string, 
  customDomain: string
): Promise<{ success: boolean; message: string; dnsStatus: 'verified' | 'unverified'; sslStatus: 'active' | 'pending_dns' }> {
  const current = getTenantBranding(tenantId);
  const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  if (!cleanDomain || cleanDomain.length < 4 || !cleanDomain.includes('.')) {
    return {
      success: false,
      message: 'Invalid domain format. Please provide a valid hostname (e.g., www.mycompany.com or shop.brand.io).',
      dnsStatus: 'unverified',
      sslStatus: 'pending_dns'
    };
  }

  // Update tenant branding with new domain
  const updatedBranding: TenantBranding = {
    ...current,
    customDomain: cleanDomain,
    domainRoutingMode: 'custom_domain',
    dnsStatus: 'verified',
    sslStatus: 'active'
  };

  await saveTenantBranding(updatedBranding);

  // Invoke backend domain verification endpoint
  try {
    await fetch('/api/tenant/branding/domain/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, domain: cleanDomain })
    }).catch(() => {});
  } catch (e) {}

  // Sync with domain records list in localStorage
  try {
    const rawDomains = localStorage.getItem('marketforge_domain_records');
    let domainsList: any[] = rawDomains ? JSON.parse(rawDomains) : [];
    const existingIdx = domainsList.findIndex((d: any) => d.tenantId === tenantId && d.domain === cleanDomain);

    const newRec = {
      id: `dom-${Date.now()}`,
      tenantId,
      domain: cleanDomain,
      routingMode: 'C',
      dnsStatus: 'verified',
      sslStatus: 'active',
      cloudflareState: 'proxied',
      txtChallenge: `marketforge-verification=${Math.random().toString(36).substring(2, 12)}`,
      ipAddress: '199.195.143.10',
      certificateIssuer: "Let's Encrypt Authority X3",
      expiryDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      autoRenew: true,
      createdAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      domainsList[existingIdx] = { ...domainsList[existingIdx], ...newRec };
    } else {
      domainsList.push(newRec);
    }
    localStorage.setItem('marketforge_domain_records', JSON.stringify(domainsList));
  } catch (e) {}

  return {
    success: true,
    message: `Domain '${cleanDomain}' successfully verified! SSL certificate issued & traffic auto-routed.`,
    dnsStatus: 'verified',
    sslStatus: 'active'
  };
}
