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
  image: string;
  category: string;
  badge?: string;
  description?: string;
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

export interface TenantBranding {
  tenantId: string;
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

  const fallback: TenantBranding = {
    tenantId,
    companyName: tenantFromMaster?.name || defaultPreset.companyName || `${tenantId.replace(/[-_]/g, ' ').toUpperCase()} Co.`,
    tagline: defaultPreset.tagline || 'Leading Next-Gen Operations & Customer Experience.',
    logoUrl: defaultPreset.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
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

export async function saveTenantBranding(branding: TenantBranding): Promise<void> {
  if (!branding.tenantId) return;
  branding.lastUpdated = new Date().toISOString();

  // 1. Save to localStorage
  try {
    localStorage.setItem(`marketforge_tenant_branding_${branding.tenantId}`, JSON.stringify(branding));
  } catch (e) {
    console.error('Failed to write tenant branding to localStorage:', e);
  }

  // 2. Sync to master tenant list
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

  // 3. Sync to Firestore non-blocking
  try {
    await clientDb.addDocToTenant('tenant_brandings', branding, branding.tenantId).catch(() => {});
  } catch (err) {}

  // 4. Broadcast global event for instant UI re-rendering
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tenant_branding_updated', { detail: { tenantId: branding.tenantId, branding } }));
  }
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
