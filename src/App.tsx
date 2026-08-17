import React, { useState, useEffect } from 'react';
import versionData from '../version.json';
import { useCurrency } from './lib/CurrencyContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Rocket, 
  Briefcase, 
  Sparkles, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Users, 
  Shield, 
  Clock, 
  Database,
  Network,
  LogOut,
  Mail,
  Share2,
  BookOpen,
  Settings as SettingsIcon,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Bed,
  ChevronRight,
  Globe,
  Plus,
  HelpCircle,
  FlaskConical,
  Compass,
  DollarSign,
  X,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  ChevronDown,
  Utensils,
  Receipt,
  UserCheck,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Ban,
  PlayCircle
} from 'lucide-react';

import { clientAuth, clientDb } from './lib/firebase';
import { BusinessProfile, CampaignPlan, CustomerPersona, BrandGuideline, TenantTeamMember } from './types';
import { getTenantBranding } from './lib/tenantBranding';

// Eager Lightweight Shell & Landing Components
import MarketForgeLanding from './components/MarketForgeLanding';
import { MarketForgeEmblem, MarketForgeLogo } from './components/MarketForgeLogo';
import MemberAuthModal from './components/MemberAuthModal';
import TrialBanner from './components/TrialBanner';
import { TenantNotFoundPage, InactiveTenantPage } from './components/TenantStatusPages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FeedbackWidget } from './components/FeedbackWidget';
import { ConnectingState } from './components/ConnectingState';
import TelemetrySparkline from './components/TelemetrySparkline';

// Lazy-Loaded Authenticated Workspace & Heavy Sub-Systems
const LoginPortal = React.lazy(() => import('./components/LoginPortal'));
const SuperAdminPortal = React.lazy(() => import('./components/SuperAdminPortal'));
const DailyCommandCenter = React.lazy(() => import('./components/DailyCommandCenter'));
const LaunchCenter = React.lazy(() => import('./components/LaunchCenter'));
const AIBusinessDepartment = React.lazy(() => import('./components/AIBusinessDepartment'));
const AdStudio = React.lazy(() => import('./components/AdStudio'));
const EmailStudio = React.lazy(() => import('./components/EmailStudio'));
const CampaignPlanner = React.lazy(() => import('./components/CampaignPlanner'));
const SocialStudio = React.lazy(() => import('./components/SocialStudio'));
const RevenueIntelligenceOS = React.lazy(() => import('./components/RevenueIntelligenceOS'));
const SuccessCenter = React.lazy(() => import('./components/SuccessCenter'));
const TenantWhiteLabelCenter = React.lazy(() => import('./components/TenantWhiteLabelCenter'));
const CustomDomainCenter = React.lazy(() => import('./components/CustomDomainCenter'));
const SubscriptionManagement = React.lazy(() => import('./components/SubscriptionManagement'));
const TenantHealthMonitor = React.lazy(() => import('./components/TenantHealthMonitor'));
const RestaurantManagement = React.lazy(() => import('./components/RestaurantManagement'));
const MobileTableQrOrderingApp = React.lazy(() => import('./components/MobileTableQrOrderingApp'));
const HotelManagement = React.lazy(() => import('./components/HotelManagement'));
const ToursAndTravelsManagement = React.lazy(() => import('./components/ToursAndTravelsManagement'));
const WebsiteBuilderOS = React.lazy(() => import('./components/WebsiteBuilderOS'));
const BusinessOperations = React.lazy(() => import('./components/BusinessOperations'));
const WorkflowAutomationStudio = React.lazy(() => import('./components/WorkflowAutomationStudio'));
const ApiGatewayDeveloperPortal = React.lazy(() => import('./components/ApiGatewayDeveloperPortal'));
const AdvancedWebhookEngine = React.lazy(() => import('./components/AdvancedWebhookEngine'));
const IntegrationManager = React.lazy(() => import('./components/IntegrationManager'));
const AiTelemetryModal = React.lazy(() => import('./components/AiTelemetryModal'));
const PaymentSuccessModal = React.lazy(() => import('./components/PaymentSuccessModal'));

// Sleek lightweight loading fallback for dynamic workspace modules
const WorkspaceModuleLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[360px] w-full p-8 text-center animate-fade-in">
    <div className="relative w-10 h-10 mb-3 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/30 backdrop-blur-sm animate-pulse" />
    </div>
    <p className="text-xs font-semibold text-slate-300 tracking-wide">Loading Module...</p>
    <p className="text-[11px] text-slate-500 mt-0.5">Initializing workspace component</p>
  </div>
);

// Default Fallbacks
const defaultProfile: BusinessProfile = {
  id: "default-profile",
  name: "Enterprise DemoCorp",
  industry: "Services",
  category: "Consulting",
  description: "Multi-agent B2B marketing & sales optimization systems.",
  targetAudience: "Mid-market enterprise service providers looking to scale automated outbound lead campaigns.",
  brandVoice: "Authoritative, analytical, vision-focused, yet simple and approachable.",
  modelWeightLeads: 40,
  modelWeightSales: 40,
  modelWeightRetention: 20
};

const defaultGuideline: BrandGuideline = {
  primaryColor: "#6366f1",
  secondaryColor: "#06b6d4",
  accentColor: "#ec4899",
  typographyHeading: "Space Grotesk",
  typographyBody: "Inter",
  visualVibe: "Modern Minimalist",
  vibeDescription: "Clean typography with highly balanced padding and dark sleek accents.",
  logoPlacementRules: ["Center headers", "Nav margins"],
  doAndDont: {
    dos: ["Use Inter for details", "Ensure high contrast color contrast"],
    donts: ["Do not use default system scrolls", "Avoid unnecessary borders"]
  },
  assetChecklist: ["Icon asset", "Vector logos"]
};

export default function App() {
  // Session State
  const [user, setUser] = useState<{ role: string; tenantId: string; email: string; name?: string; designation?: string } | null>(() => {
    try {
      const saved = localStorage.getItem("marketforge_user_session");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Active Team Member Session state (for designation-based access)
  const [activeTeamMember, setActiveTeamMember] = useState<TenantTeamMember | null>(() => {
    try {
      const saved = localStorage.getItem("marketforge_active_team_member");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isMemberAuthModalOpen, setIsMemberAuthModalOpen] = useState(false);
  const [isAiTelemetryOpen, setIsAiTelemetryOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHeaderFolded, setIsHeaderFolded] = useState(false);

  const handleSetActiveMember = (member: TenantTeamMember | null) => {
    setActiveTeamMember(member);
    if (member) {
      localStorage.setItem("marketforge_active_team_member", JSON.stringify(member));
    } else {
      localStorage.removeItem("marketforge_active_team_member");
    }
  };


  // Master Tenants list with local fallback for instant cold-start resolution
  const [tenantsList, setTenantsList] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('marketforge_sa_tenants');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      { id: 'demo-tenant', name: 'Enterprise DemoCorp (Template Showcase)', domain: 'demo-tenant.marketforge.ai', status: 'active', isTemplate: true },
      { id: 'sienna-tenant', name: 'Sienna Clay Studio (Template Showcase)', domain: 'sienna-tenant.marketforge.ai', status: 'active', isTemplate: true }
    ];
  });
  const [selectedTenantId, setSelectedTenantId] = useState<string>('demo-tenant');

  // Backend cold-start and connection resilience states
  const [backendStatus, setBackendStatus] = useState<'checking' | 'waking' | 'connected' | 'error'>('checking');
  const [retryAttempt, setRetryAttempt] = useState<number>(0);

  // Dedicated Multi-Tenant Ingress & Route State
  const [routeState, setRouteState] = useState<{
    type: 'platform_root' | 'tenant_view' | 'super_admin' | 'tenant_not_found' | 'tenant_suspended';
    slug?: string;
    tenant?: any;
  }>({ type: 'platform_root' });

  // Super Admin view state: 'portal' | 'selection' | 'dashboard'
  const [superAdminView, setSuperAdminView] = useState<'portal' | 'selection' | 'dashboard'>('portal');
  const [isSuperAdminQuickToggleOpen, setIsSuperAdminQuickToggleOpen] = useState(false);

  // Business Selection View Search & Filter states
  const [selectionSearch, setSelectionSearch] = useState('');
  const [selectionPlanFilter, setSelectionPlanFilter] = useState('ALL');
  const [selectionStatusFilter, setSelectionStatusFilter] = useState('ALL');
  const [selectionSort, setSelectionSort] = useState<'name-asc' | 'mrr-desc' | 'users-desc'>('name-asc');
  const [gridSelectedTenantIds, setGridSelectedTenantIds] = useState<string[]>([]);

  // Business Dashboard navigation
  const [dashboardTab, setDashboardTab] = useState<'landing' | 'command' | 'planner' | 'ad_studio' | 'email_studio' | 'social_studio' | 'revenue_intelligence' | 'success_center' | 'omnicore_labs' | 'domains' | 'whitelabel' | 'restaurant_os' | 'hotel_os' | 'tours_os' | 'website_builder' | 'business_ops' | 'subscription'>('landing');

  // OmniCore Labs sub-tabs
  const [omnicoreSubTab, setOmnicoreSubTab] = useState<'command' | 'launch' | 'business' | 'ads'>('command');

  // Shared Tenant-Specific App States
  const [profile, setProfile] = useState<BusinessProfile>(defaultProfile);
  const [brandConfig, setBrandConfig] = useState<any>({
    brand_name: "MarketForge OS",
    tagline: "The complete next-gen enterprise operating system.",
    primary_color: "#6366f1",
    secondary_color: "#06b6d4"
  });

  // Global User Settings
  const { currency, setCurrency, formatCurrency } = useCurrency();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('marketforge_theme_mode') as 'dark' | 'light') || 'dark';
  });
  const [highContrastMode, setHighContrastMode] = useState(() => {
    return localStorage.getItem('marketforge_high_contrast') === 'true';
  });
  const [baseFontSize, setBaseFontSize] = useState(() => {
    return parseInt(localStorage.getItem('marketforge_font_size') || '16', 10);
  });

  // Apply CSS overrides based on user settings
  useEffect(() => {
    localStorage.setItem('marketforge_theme_mode', themeMode);
    if (themeMode === 'light') {
      document.body.classList.add('light-mode-bg');
    } else {
      document.body.classList.remove('light-mode-bg');
    }
  }, [themeMode]);

  useEffect(() => {
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('marketforge_high_contrast', highContrastMode.toString());
  }, [highContrastMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${baseFontSize}px`);
    localStorage.setItem('marketforge_font_size', baseFontSize.toString());
  }, [baseFontSize]);
  const [personas, setPersonas] = useState<CustomerPersona[]>([]);
  const [campaign, setCampaign] = useState<CampaignPlan | null>(null);
  const [guideline, setGuideline] = useState<BrandGuideline | null>(null);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState<boolean>(false);

  // UTC clock running
  const [currentTime, setCurrentTime] = useState<string>(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Multi-Tenant Ingress and Route Matching Engine
  const matchAndSetTenant = (rawSlug: string, currentTenants: any[]) => {
    if (!rawSlug) {
      setRouteState({ type: 'platform_root' });
      return;
    }

    const cleanSlug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Direct ID match
    let matched = currentTenants.find(t => t.id && t.id.toLowerCase() === rawSlug.toLowerCase());

    // 2. Custom domain match
    if (!matched) {
      matched = currentTenants.find(t => t.domain && t.domain.toLowerCase() === rawSlug.toLowerCase());
    }

    // 3. Clean slug ID match
    if (!matched) {
      matched = currentTenants.find(t => t.id && t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSlug);
    }

    // 4. Prefix match (e.g. "malaysianrest" -> "malaysianrest-tenant")
    if (!matched) {
      matched = currentTenants.find(t => t.id && t.id.toLowerCase().startsWith(cleanSlug));
    }

    // 5. Tenant Name match
    if (!matched) {
      matched = currentTenants.find(t => t.name && t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSlug);
    }

    // 6. Hardcoded Template Fallbacks
    if (!matched && (rawSlug === 'demo-tenant' || cleanSlug === 'democorp' || cleanSlug === 'demo')) {
      matched = { id: 'demo-tenant', name: 'Enterprise DemoCorp (Template Showcase)', domain: 'demo-tenant.marketforge.ai', status: 'active', isTemplate: true };
    } else if (!matched && (rawSlug === 'sienna-tenant' || cleanSlug === 'sienna' || cleanSlug === 'siennaclay')) {
      matched = { id: 'sienna-tenant', name: 'Sienna Clay Studio (Template Showcase)', domain: 'sienna-tenant.marketforge.ai', status: 'active', isTemplate: true };
    }

    if (matched) {
      setSelectedTenantId(matched.id);
      if (matched.status === 'suspended' || matched.status === 'inactive') {
        setRouteState({ type: 'tenant_suspended', slug: rawSlug, tenant: matched });
      } else {
        setRouteState({ type: 'tenant_view', slug: rawSlug, tenant: matched });
      }
    } else {
      // Fallback async API check before declaring 404
      fetch(`/api/tenant/details?slug=${encodeURIComponent(rawSlug)}`)
        .then(res => {
          if (!res.ok && (res.status === 502 || res.status === 503 || res.status === 504)) {
            // Cold start fallback: synthesize provisional tenant so the page doesn't flash 404
            const dynamicName = rawSlug
              .replace(/[-_]/g, ' ')
              .replace(/\btenant\b/gi, 'Studio')
              .split(' ')
              .filter(Boolean)
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ') || 'Workspace Showcase';
            const provisional = { id: rawSlug, name: dynamicName, domain: `${rawSlug}.marketforge.ai`, status: 'active', isProvisional: true };
            setSelectedTenantId(rawSlug);
            setRouteState({ type: 'tenant_view', slug: rawSlug, tenant: provisional });
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (!data) return;
          if (data && data.success && data.tenant) {
            setSelectedTenantId(data.tenant.id);
            if (data.tenant.status === 'suspended' || data.tenant.status === 'inactive') {
              setRouteState({ type: 'tenant_suspended', slug: rawSlug, tenant: data.tenant });
            } else {
              setRouteState({ type: 'tenant_view', slug: rawSlug, tenant: data.tenant });
            }
          } else {
            setRouteState({ type: 'tenant_not_found', slug: rawSlug });
          }
        })
        .catch(() => {
          // If backend offline or cold starting, assume provisional tenant instead of 404
          const dynamicName = rawSlug
            .replace(/[-_]/g, ' ')
            .replace(/\btenant\b/gi, 'Studio')
            .split(' ')
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ') || 'Workspace Showcase';
          const provisional = { id: rawSlug, name: dynamicName, domain: `${rawSlug}.marketforge.ai`, status: 'active', isProvisional: true };
          setSelectedTenantId(rawSlug);
          setRouteState({ type: 'tenant_view', slug: rawSlug, tenant: provisional });
        });
    }
  };

  const resolveCurrentRoute = (currentTenants: any[] = tenantsList) => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    const urlParams = new URLSearchParams(window.location.search);
    const queryTenant = urlParams.get('tenant') || urlParams.get('slug') || urlParams.get('t') || urlParams.get('id');

    // Case 1: Root URL -> Platform Homepage
    if (pathSegments.length === 0) {
      if (queryTenant) {
        matchAndSetTenant(queryTenant, currentTenants);
      } else {
        setRouteState({ type: 'platform_root' });
      }
      return;
    }

    const firstSeg = pathSegments[0].toLowerCase();

    // Case 2: Super Admin route
    if (['admin', 'superadmin', 'super-admin'].includes(firstSeg)) {
      setRouteState({ type: 'super_admin' });
      return;
    }

    // Case 3: Reserved Platform routes (Login, Register, Pricing, About, etc.)
    if (['login', 'auth', 'register', 'signup', 'pricing', 'about', 'contact'].includes(firstSeg)) {
      setRouteState({ type: 'platform_root' });
      return;
    }

    // Case 4: Static assets/api
    if (['dist', 'static', 'assets', 'api', 'favicon.ico', 'robots.txt'].includes(firstSeg)) {
      return;
    }

    // Case 5: Tenant path e.g. /t/sienna-tenant or /tenant/demo-tenant or directly /sienna-tenant
    let targetSlug = pathSegments[0];
    if (pathSegments.length >= 2 && ['t', 'tenant', 'slug', 'b', 'company', 'workspace', 'store', 'view'].includes(firstSeg)) {
      targetSlug = pathSegments[1];
    }
    if (queryTenant) {
      targetSlug = queryTenant;
    }

    matchAndSetTenant(targetSlug, currentTenants);
  };

  // Browser Navigation Helpers
  const navigateToTenant = (tenantId: string, action?: 'landing' | 'workspace') => {
    const url = action === 'workspace' ? `/${tenantId}?action=workspace` : `/${tenantId}`;
    window.history.pushState({}, '', url);
    resolveCurrentRoute(tenantsList);
  };

  const navigateToPlatform = () => {
    window.history.pushState({}, '', '/');
    resolveCurrentRoute(tenantsList);
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    resolveCurrentRoute(tenantsList);
  };

  // Fetch tenants & resolve route
  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants-list');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          localStorage.setItem('marketforge_sa_tenants', JSON.stringify(list));
          setTenantsList(list);
          resolveCurrentRoute(list);
          return list;
        }
      }
      resolveCurrentRoute(tenantsList);
    } catch (err) {
      resolveCurrentRoute(tenantsList);
    }
  };

  // Cold-start probe & backend availability check with controlled exponential backoff
  const checkBackendAvailability = async (isManual: boolean = false) => {
    if (isManual) {
      setBackendStatus('checking');
      setRetryAttempt(0);
    }

    let attempt = 0;
    const maxAttempts = 6;

    const probe = async (): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7500);
        const res = await fetch('/api/health', {
          headers: { 'Cache-Control': 'no-cache, no-store' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          setBackendStatus('connected');
          fetchTenants();
          return true;
        } else if (res.status === 502 || res.status === 503 || res.status === 504) {
          // Backend is cold-starting / waking up
          setBackendStatus('waking');
        }
      } catch (err) {
        // Cold start network timeout or connection refused
        setBackendStatus('waking');
      }

      attempt++;
      setRetryAttempt(attempt);

      if (attempt < maxAttempts) {
        const backoffDelay = Math.min(Math.pow(2, attempt - 1) * 1200, 6000);
        await new Promise(r => setTimeout(r, backoffDelay));
        return probe();
      } else {
        // Retries exhausted for automatic probe; set to recoverable error state for backend-dependent views
        setBackendStatus('error');
        fetchTenants();
        return false;
      }
    };

    probe();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const isLaunchRequested = 
      urlParams.get('action') === 'workspace' || 
      urlParams.get('launch') === 'true' || 
      urlParams.get('autolaunch') === 'true' ||
      window.location.hash === '#workspace';

    if (isLaunchRequested) {
      if (user) {
        setDashboardTab('command');
        setIsHeaderFolded(true);
      } else {
        setIsMemberAuthModalOpen(true);
      }
    }

    // Run backend availability verification & tenant initialization
    resolveCurrentRoute(tenantsList);
    checkBackendAvailability();

    // Verify session authenticity with backend (blocks invalid, revoked or cross-tenant sessions)
    if (user?.email) {
      fetch("/api/tenant/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          tenantId: user.tenantId,
          role: user.role
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.valid) {
          const verifiedSession = {
            role: data.role || user.role,
            tenantId: data.tenantId || user.tenantId,
            email: data.email || user.email,
            name: data.name || user.name,
            designation: data.designation || user.designation
          };
          setUser(verifiedSession);
          localStorage.setItem("marketforge_user_session", JSON.stringify(verifiedSession));
          if (activeTeamMember) {
            const updatedMember = {
              ...activeTeamMember,
              name: data.name || activeTeamMember.name,
              designation: data.designation || activeTeamMember.designation,
              role: data.role || activeTeamMember.role,
              permittedModules: data.permittedModules || activeTeamMember.permittedModules
            };
            setActiveTeamMember(updatedMember);
            localStorage.setItem("marketforge_active_team_member", JSON.stringify(updatedMember));
          }
        } else if (data && data.valid === false) {
          console.warn("Session verification failed or account revoked:", data?.error);
          localStorage.removeItem("marketforge_user_session");
          localStorage.removeItem("marketforge_active_team_member");
          localStorage.removeItem("mf_simulated_tenant");
          localStorage.removeItem("mf_simulated_role");
          setUser(null);
          setActiveTeamMember(null);
          setDashboardTab('landing');
        }
      })
      .catch(err => {
        console.warn("Network error during session verification:", err);
      });
    }

    if (urlParams.get('payment_success')) {
       setIsPaymentSuccessOpen(true);
       window.history.replaceState({}, document.title, window.location.pathname);
       let attempts = 0;
       const pollInterval = setInterval(() => {
          fetch('/api/tenants-list').then(res => res.json()).then(list => {
             localStorage.setItem('marketforge_sa_tenants', JSON.stringify(list));
             setTenantsList(list);
             resolveCurrentRoute(list);
             if (user?.tenantId) {
                loadTenantDetails(user.tenantId);
             }
             attempts++;
             if (attempts > 3) {
                 clearInterval(pollInterval);
             }
          }).catch(() => {});
       }, 1000);
    }

    const handlePopState = () => {
      resolveCurrentRoute(tenantsList);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load state whenever selectedTenantId or user session changes
  const loadTenantDetails = async (tenantId: string) => {
    const dynamicTenantName = tenantId
      .replace(/[-_]/g, ' ')
      .replace(/\btenant\b/gi, 'Workspace')
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'Enterprise Workspace';

    try {
      // 1. Load Campaign Profiles (BusinessProfile)
      try {
        const profiles = await clientDb.getCollection("campaign_profiles", tenantId);
        if (profiles && profiles.length > 0) {
          setProfile({ ...profiles[0], tenantId });
        } else {
          const freshProfile = {
            ...defaultProfile,
            name: dynamicTenantName,
            id: `prof_${Math.random().toString(36).substr(2, 9)}`,
            tenantId
          };
          setProfile(freshProfile);
          await clientDb.addDocToTenant("campaign_profiles", freshProfile, tenantId).catch(err => console.warn("Failed to persist fresh profile:", err));
        }
      } catch (err1) {
        console.warn("Failed loading campaign profiles from Firestore:", err1);
        setProfile({ ...defaultProfile, name: dynamicTenantName, tenantId });
      }

      // 2. Load guidelines
      try {
        const guidelines = await clientDb.getCollection("brand_guidelines", tenantId);
        if (guidelines && guidelines.length > 0) {
          setGuideline(guidelines[0]);
        } else {
          const freshGuideline = {
            ...defaultGuideline,
            id: `guid_${Math.random().toString(36).substr(2, 9)}`,
            tenantId
          };
          setGuideline(freshGuideline);
          await clientDb.addDocToTenant("brand_guidelines", freshGuideline, tenantId).catch(err => console.warn("Failed to persist fresh guideline:", err));
        }
      } catch (err2) {
        console.warn("Failed loading brand guidelines from Firestore:", err2);
        setGuideline(defaultGuideline);
      }

      // 3. Load Campaign Plans
      try {
        const campaigns = await clientDb.getCollection("campaigns", tenantId);
        if (campaigns && campaigns.length > 0) {
          setCampaign(campaigns[0]);
        } else {
          setCampaign(null);
        }
      } catch (err3) {
        console.warn("Failed loading campaigns from Firestore:", err3);
        setCampaign(null);
      }
    } catch (e) {
      console.error("Error synchronizing isolated tenant database:", e);
    }
  };

  useEffect(() => {
    const activeId = user?.role === 'super_admin' ? selectedTenantId : user?.tenantId;
    if (activeId) {
      loadTenantDetails(activeId);
    }
  }, [selectedTenantId, user?.tenantId, user?.role]);

  // Auth Callbacks
  const handleLogin = (
    role: string, 
    tenantId: string, 
    email: string, 
    name?: string, 
    designation?: string, 
    userObj?: any
  ) => {
    const targetTenantObj = tenantsList.find(t => t.id === tenantId);
    const tenantDisplayName = targetTenantObj?.name || (tenantId ? tenantId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : "Enterprise Workspace");

    const effectiveName = 
      name || 
      userObj?.name || 
      (role === 'owner' ? `${tenantDisplayName} Owner` : (role === 'super_admin' ? 'Super Administrator' : (email ? email.split('@')[0] : 'Workspace User')));

    const effectiveDesignation = 
      designation || 
      userObj?.designation || 
      (role === 'owner' ? 'Business Owner' : (role === 'super_admin' ? 'System Administrator' : 'Team Member'));

    const session = { 
      role, 
      tenantId, 
      email, 
      name: effectiveName, 
      designation: effectiveDesignation 
    };
    setUser(session);
    localStorage.setItem("marketforge_user_session", JSON.stringify(session));

    const activeMember: TenantTeamMember = {
      id: userObj?.id || `usr_${Date.now()}`,
      name: effectiveName,
      email: email,
      role: (role as any) || "writer",
      tenantId: tenantId,
      status: "active",
      designation: effectiveDesignation,
      lastActive: "Active Now",
      permittedModules: userObj?.permittedModules
    };
    handleSetActiveMember(activeMember);

    if (role === 'super_admin') {
      setSelectedTenantId('demo-tenant');
      setSuperAdminView('portal');
      navigateToAdmin();
    } else {
      setSelectedTenantId(tenantId);
      setDashboardTab('command');
      setIsHeaderFolded(true);
      navigateToTenant(tenantId, 'workspace');
    }
  };

  const handleLogout = async () => {
    await clientAuth.logout();
    localStorage.removeItem("marketforge_user_session");
    localStorage.removeItem("marketforge_active_team_member");
    localStorage.removeItem("mf_simulated_tenant");
    localStorage.removeItem("mf_simulated_role");
    setUser(null);
    setActiveTeamMember(null);
    setSuperAdminView('portal');
    setDashboardTab('landing');
    if (routeState.type === 'tenant_view' && routeState.tenant?.id) {
      navigateToTenant(routeState.tenant.id, 'landing');
    } else {
      navigateToPlatform();
    }
  };

  const handleActivateTenant = (newTenant: any) => {
    // Append and refresh the list
    setTenantsList(prev => {
      if (prev.some(t => t.id === newTenant.id)) return prev;
      return [...prev, newTenant];
    });
    fetchTenants();
    if (newTenant?.id) {
      navigateToTenant(newTenant.id);
    }
  };

  const handleUpdateCampaign = async (newCampaign: CampaignPlan) => {
    const activeTenantId = user?.role === 'super_admin' ? selectedTenantId : user?.tenantId;
    if (!activeTenantId) return;

    setCampaign(newCampaign);
    try {
      if (newCampaign.id) {
        await clientDb.updateDocInTenant("campaigns", newCampaign.id, newCampaign, activeTenantId, user?.email);
      } else {
        const created = await clientDb.addDocToTenant("campaigns", newCampaign, activeTenantId, user?.email);
        setCampaign(created);
      }
    } catch (e) {
      console.error("Failed to persist updated campaign plan:", e);
    }
  };

  const handleChangeProfile = async (newProfile: BusinessProfile) => {
    const activeTenantId = user?.role === 'super_admin' ? selectedTenantId : user?.tenantId;
    if (!activeTenantId) return;

    setProfile(newProfile);
    try {
      if (newProfile.id && newProfile.id !== "default-profile") {
        await clientDb.updateDocInTenant("campaign_profiles", newProfile.id, newProfile, activeTenantId, user?.email);
      } else {
        const created = await clientDb.addDocToTenant("campaign_profiles", newProfile, activeTenantId, user?.email);
        setProfile(created);
      }
    } catch (e) {
      console.error("Failed to save updated business profile:", e);
    }
  };

  const handleCreateAuditLog = async (type: string, severity: string, details: string) => {
    const activeTenantId = user?.role === 'super_admin' ? selectedTenantId : user?.tenantId;
    if (!activeTenantId || !user) return;

    try {
      await clientDb.addDocToTenant("audit_logs", {
        id: `aud_${Math.random().toString(36).substr(2, 9)}`,
        tenantId: activeTenantId,
        userId: user.email,
        userEmail: user.email,
        action: `${type} [${severity}]`,
        details: details,
        timestamp: new Date().toISOString()
      }, activeTenantId, user.email);
    } catch (e) {
      console.error("Failed to record audit log:", e);
    }
  };

  const handleDashboardTabChange = (newTab: string) => {
    if (newTab === 'campaign' || newTab === 'planner') {
      setDashboardTab('planner');
    } else if (newTab === 'social') {
      setDashboardTab('social_studio');
    } else if (newTab === 'email') {
      setDashboardTab('email_studio');
    } else {
      setDashboardTab(newTab as any);
    }
  };

  // Check for Mobile QR Menu mode or Table scan
  const urlParams = new URLSearchParams(window.location.search);
  const isQrMode = urlParams.get('mode') === 'qr_menu' || urlParams.get('qr') === 'true' || urlParams.get('table');
  const qrTableNumber = urlParams.get('table') || 'T-01';
  const targetTenantId = urlParams.get('tenant') || urlParams.get('slug') || selectedTenantId || 'sienna-tenant';

  if (isQrMode && !urlParams.get('action')) {
    return (
      <MobileTableQrOrderingApp 
        tenantId={targetTenantId} 
        tableNumber={qrTableNumber} 
      />
    );
  }

  // 1. Tenant 404 Resolution (Invalid Tenant URL)
  if (routeState.type === 'tenant_not_found') {
    return (
      <TenantNotFoundPage 
        slug={routeState.slug || ''} 
        onNavigateHome={navigateToPlatform} 
        onOpenRegister={() => {
          navigateToPlatform();
        }}
      />
    );
  }

  // 2. Tenant Suspended / Inactive Page
  if (routeState.type === 'tenant_suspended') {
    return (
      <InactiveTenantPage 
        tenant={routeState.tenant} 
        onNavigateHome={navigateToPlatform} 
      />
    );
  }

  // 3. Specific Tenant View (https://marketforge.scamspike.com/{tenantname})
  if (routeState.type === 'tenant_view' && routeState.tenant) {
    const currentTenant = routeState.tenant;
    const isLaunchRequested = 
      urlParams.get('action') === 'workspace' || 
      urlParams.get('launch') === 'true' || 
      urlParams.get('autolaunch') === 'true' ||
      window.location.hash === '#workspace' ||
      dashboardTab !== 'landing';

    // If NOT logged in -> Render Specific Tenant Landing Page immediately (unblocked by cold-start)
    if (!user) {
      return (
        <MarketForgeLanding 
          tenantId={currentTenant.id}
          initialAuthModalOpen={isLaunchRequested}
          onLogin={handleLogin}
          onSelectFeature={() => {
            setIsMemberAuthModalOpen(true);
          }}
          onEnterOS={() => {
            setIsMemberAuthModalOpen(true);
          }}
        />
      );
    }

    // If logged in: check authorization
    const isAuthorizedForTenant = user.role === 'super_admin' || user.tenantId === currentTenant.id;

    if (!isAuthorizedForTenant) {
      // Viewing another tenant's public landing page
      return (
        <div className="relative">
          <div className="bg-slate-900 border-b border-indigo-500/30 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Signed in as <strong className="text-white">{user.email}</strong> ({user.tenantId}) &bull; Viewing public showcase for <strong className="text-indigo-300">{currentTenant.name}</strong></span>
            </div>
            <button 
              onClick={() => navigateToTenant(user.tenantId, 'workspace')}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Return to My Workspace ({user.tenantId})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <MarketForgeLanding 
            tenantId={currentTenant.id}
            onSelectFeature={() => {}}
            onEnterOS={() => navigateToTenant(user.tenantId, 'workspace')}
          />
        </div>
      );
    }

    // If authorized and viewing public landing page preview
    if (dashboardTab === 'landing' && !isLaunchRequested) {
      return (
        <div className="relative">
          <div className="bg-indigo-950/90 border-b border-indigo-500/30 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-indigo-200 gap-2 sticky top-0 z-50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Public Storefront Preview for <strong className="text-white">{currentTenant.name}</strong></span>
            </div>
            <button 
              onClick={() => {
                setDashboardTab('command');
                setIsHeaderFolded(true);
              }}
              className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
            >
              <span>Open Workspace Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <MarketForgeLanding 
            tenantId={currentTenant.id}
            onSelectFeature={(featureId) => {
              setDashboardTab(featureId as any);
              setIsHeaderFolded(true);
            }}
            onEnterOS={() => {
              setDashboardTab('command');
              setIsHeaderFolded(true);
            }}
          />
        </div>
      );
    }
  }

  // 4. Platform Root or Unauthenticated User -> Render Main MarketForge Platform Landing Page (unblocked)
  if (!user) {
    return (
      <React.Suspense fallback={<WorkspaceModuleLoader />}>
        <LoginPortal 
          onLogin={handleLogin}
          tenantsList={tenantsList}
          onActivateTenant={handleActivateTenant}
        />
      </React.Suspense>
    );
  }

  // 5. Super Admin Route Authorization Guard (Must hold verified server role === 'super_admin')
  if (routeState.type === 'super_admin' && user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#0C0D14] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#121420] border border-rose-500/30 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">403 — Super Admin Access Denied</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your session is authenticated as <strong className="text-rose-300">{user.email}</strong> with role <strong className="text-white uppercase">{user.role}</strong> bound to workspace <strong className="text-indigo-300">{user.tenantId}</strong>.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Super Admin operations require verified platform root authority.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigateToTenant(user.tenantId, 'workspace')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow"
            >
              <span>Return to My Workspace ({user.tenantId})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold text-xs transition cursor-pointer border border-white/10"
            >
              Log Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Authenticated Workspace Access -> Guard against waking/offline backend for live operations
  if (backendStatus === 'waking') {
    const currentSlug = routeState.slug || urlParams.get('tenant') || urlParams.get('slug') || (user?.tenantId || (routeState.tenant ? routeState.tenant.name : ''));
    return (
      <ConnectingState 
        statusText="Connecting to MarketForge Workspace..."
        subText="Establishing secure cloud connection for your workspace. If the service is warming up from inactivity, this takes just a few moments."
        tenantSlug={currentSlug || undefined}
        isRetrying={true}
        retryAttempt={retryAttempt}
        onManualRetry={() => checkBackendAvailability(true)}
      />
    );
  }

  if (backendStatus === 'error') {
    const currentSlug = routeState.slug || urlParams.get('tenant') || urlParams.get('slug') || (user?.tenantId || (routeState.tenant ? routeState.tenant.name : ''));
    return (
      <ConnectingState 
        statusText="Cloud Backend Reconnecting..."
        subText="The cloud backend service took longer than expected to respond. Your workspace data is protected. You can retry the connection or verify connectivity below."
        tenantSlug={currentSlug || undefined}
        isRetrying={false}
        retryAttempt={retryAttempt}
        onManualRetry={() => checkBackendAvailability(true)}
      />
    );
  }

  // Active tenant name helper
  const activeTenantObj = tenantsList.find(t => t.id === (user?.role === 'super_admin' ? selectedTenantId : user?.tenantId));
  const activeTenantName = activeTenantObj?.name || (user?.tenantId ? user.tenantId.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Enterprise Workspace");

  // Authenticated Member & Designation resolution
  const authenticatedMemberName = 
    activeTeamMember?.name || 
    user?.name || 
    (user?.role === 'super_admin' ? 'Super Administrator' : (user?.role === 'owner' ? `${activeTenantName} Owner` : (user?.email ? user.email.split('@')[0] : 'Workspace User')));

  const authenticatedMemberDesignation = 
    activeTeamMember?.designation || 
    user?.designation || 
    (user?.role === 'owner' ? 'Business Owner' : (user?.role === 'super_admin' ? 'System Administrator' : 'Team Member'));
  
  let trialDaysLeft = activeTenantObj?.trialDaysLeft !== undefined ? activeTenantObj.trialDaysLeft : 30;
  if (activeTenantObj?.createdAt && activeTenantObj?.plan === 'Trial') {
    const createdAt = new Date(activeTenantObj.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    trialDaysLeft = Math.max(0, 30 - diffDays);
  }


  // Dynamic module mapping and aliases
  const moduleAliasesMap: Record<string, string[]> = {
    planner: ['planner', 'marketing_planner', 'marketing'],
    ad_studio: ['ad_studio', 'adstudio', 'ads', 'ad'],
    email_studio: ['email_studio', 'email', 'emailstudio'],
    social_studio: ['social_studio', 'social', 'social_engine', 'socialstudio'],
    revenue_intelligence: ['revenue_intelligence', 'revenue', 'commerce', 'revenue_os'],
    restaurant_os: ['restaurant_os', 'restaurant', 'pos'],
    hotel_os: ['hotel_os', 'hotel', 'hospitality'],
    tours_os: ['tours_os', 'tours', 'travel', 'tours_and_travels'],
    website_builder: ['website_builder', 'website', 'web_builder'],
    business_ops: ['business_ops', 'hr', 'operations', 'team'],
    omnicore_labs: ['omnicore_labs', 'omnicore', 'ai_labs'],
    domains: ['domains', 'custom_domains', 'dns'],
    whitelabel: ['whitelabel', 'branding', 'white_label'],
    workflow_automation: ['workflow_automation', 'workflow', 'automation'],
    integrations: ['integrations', 'connections'],
    api_gateway: ['api_gateway', 'gateway'],
    webhook_engine: ['webhook_engine', 'webhooks'],
    subscription: ['subscription', 'billing', 'payments']
  };

  // Check designation-based module access
  const isModulePermittedForMember = (tabId: string): boolean => {
    if (!activeTeamMember) return true; // Owner/Tenant Admin by default
    const designationLower = (activeTeamMember.designation || '').toLowerCase();
    const roleLower = (activeTeamMember.role || '').toLowerCase();
    if (
      designationLower.includes('admin') || 
      designationLower.includes('ceo') || 
      designationLower.includes('founder') || 
      designationLower.includes('owner') ||
      roleLower === 'owner' ||
      roleLower === 'admin' ||
      roleLower === 'super_admin'
    ) {
      return true;
    }

    // Tabs available to all team members
    if (['landing', 'command', 'success_center'].includes(tabId)) {
      return true;
    }

    // Owner/Admin only tabs unless explicitly granted in permittedModules
    const adminOnlyTabs = ['subscription', 'whitelabel', 'domains'];
    const memberPerms = activeTeamMember.permittedModules || [];
    const aliases = moduleAliasesMap[tabId] || [tabId];

    const hasMatch = memberPerms.some(perm => 
      aliases.includes(perm) || perm === tabId || aliases.some(a => perm.toLowerCase().includes(a))
    );

    if (adminOnlyTabs.includes(tabId)) {
      return hasMatch;
    }

    return hasMatch;
  };

  // Check tenant module disabled / inactive status
  const isModuleDisabledForTenant = (tabId: string): { disabled: boolean; reason: 'disabled' | 'inactive' | null } => {
    if (!activeTenantObj) return { disabled: false, reason: null };
    
    // Core infrastructure tabs always accessible
    if (['landing', 'command', 'success_center', 'subscription'].includes(tabId)) {
      return { disabled: false, reason: null };
    }

    const aliases = moduleAliasesMap[tabId] || [tabId];

    // 1. Explicitly disabled modules for tenant
    if (activeTenantObj.disabledModules && Array.isArray(activeTenantObj.disabledModules)) {
      const isDisabled = aliases.some(a => activeTenantObj.disabledModules.includes(a));
      if (isDisabled) return { disabled: true, reason: 'disabled' };
    }

    // 2. Tenant subscription activated modules
    if (activeTenantObj.activatedModules && Array.isArray(activeTenantObj.activatedModules) && activeTenantObj.activatedModules.length > 0) {
      const isActivated = aliases.some(a => 
        activeTenantObj.activatedModules.some((act: string) => act === a || a.startsWith(act) || act.startsWith(a))
      );
      if (!isActivated) return { disabled: true, reason: 'inactive' };
    }

    return { disabled: false, reason: null };
  };

  // Sidebar Items for Tenant Dashboard
  const dashboardNavItems = [
    { id: 'landing', label: 'OS Features Suite', icon: Sparkles, color: 'text-amber-400' },
    { id: 'command', label: 'Command Center', icon: Terminal, color: 'text-emerald-400' },
    { id: 'subscription', label: 'Subscription & Billing', icon: Receipt, color: 'text-emerald-400' },
    { id: 'workflow_automation', label: 'Workflow Automation', icon: Zap, color: 'text-amber-400' },
    { id: 'api_gateway', label: 'API Gateway & Keys', icon: Network, color: 'text-cyan-400' },
    { id: 'webhook_engine', label: 'Webhook Engine', icon: Network, color: 'text-fuchsia-400' },
    { id: 'integrations', label: 'Autonomous Integrations', icon: Share2, color: 'text-violet-400' },
    { id: 'planner', label: 'Marketing Planner', icon: Layers, color: 'text-indigo-400' },
    { id: 'ad_studio', label: 'Ad Copy Studio', icon: Sparkles, color: 'text-purple-400' },
    { id: 'email_studio', label: 'Email Studio', icon: Mail, color: 'text-cyan-400' },
    { id: 'social_studio', label: 'Social Engine', icon: Share2, color: 'text-rose-400' },
    { id: 'revenue_intelligence', label: 'Revenue OS', icon: DollarSign, color: 'text-amber-400' },
    { id: 'success_center', label: 'Success Academy', icon: BookOpen, color: 'text-blue-400' },
    { id: 'domains', label: 'SaaS Domains', icon: Globe, color: 'text-teal-400' },
    { id: 'whitelabel', label: 'White-Label & Branding', icon: Shield, color: 'text-emerald-400' },
    { id: 'restaurant_os', label: 'Restaurant OS', icon: Building2, color: 'text-orange-400' },
    { id: 'tours_os', label: 'Tours & Travels', icon: Compass, color: 'text-cyan-400' },
    { id: 'website_builder', label: 'AI Website', icon: Globe, color: 'text-fuchsia-400' },
    { id: 'business_ops', label: 'Business Ops', icon: Briefcase, color: 'text-blue-400' },
    { id: 'omnicore_labs', label: 'OmniCore Labs', icon: FlaskConical, color: 'text-fuchsia-400' },
  ] as const;

  // Render Content based on views
  const renderDashboardContent = () => {
    const tenantStatus = isModuleDisabledForTenant(dashboardTab);
    if (tenantStatus.disabled) {
      return (
        <div className="bg-[#0e101a] border border-red-500/20 rounded-3xl p-8 max-w-2xl mx-auto my-12 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {tenantStatus.reason === 'disabled' ? 'Module Deactivated for Workspace' : 'Module Inactive on Current Plan'}
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              The module <strong className="text-indigo-400 font-mono">{dashboardTab}</strong> is currently {tenantStatus.reason === 'disabled' ? 'deactivated by workspace administrators in tenant settings' : 'not activated in your active workspace subscription plan'}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setDashboardTab('subscription')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Manage Subscriptions & Modules
            </button>
            <button
              onClick={() => setDashboardTab('command')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer"
            >
              Return to Command Center
            </button>
          </div>
        </div>
      );
    }

    if (!isModulePermittedForMember(dashboardTab)) {
      return (
        <div className="bg-[#0e101a] border border-amber-500/20 rounded-3xl p-8 max-w-2xl mx-auto my-12 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Module Access Restricted by Designation</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Logged in as <strong className="text-amber-300 font-mono">{activeTeamMember?.name}</strong> ({activeTeamMember?.designation || activeTeamMember?.role}).
              The Workspace Administrator has not granted permission to module <strong className="text-indigo-400 font-mono">{dashboardTab}</strong>.
            </p>
          </div>
          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left space-y-2 font-mono text-[11px]">
            <p className="text-slate-300 font-bold">Your Permitted Workspace Modules:</p>
            <div className="flex flex-wrap gap-1.5">
              {activeTeamMember?.permittedModules && activeTeamMember.permittedModules.length > 0 ? (
                activeTeamMember.permittedModules.map((m, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded">
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">No custom modules assigned yet. Accessing standard command center.</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setDashboardTab('command')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Go to Command Center
            </button>
            <button
              onClick={() => setIsMemberAuthModalOpen(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer"
            >
              Switch Team Member
            </button>
          </div>
        </div>
      );
    }

    switch (dashboardTab) {

      case 'landing':
        const activeTenantForLanding = user ? (user.role === 'super_admin' ? selectedTenantId : user.tenantId) : selectedTenantId;
        return (
          <MarketForgeLanding 
            tenantId={activeTenantForLanding}
            onLogin={handleLogin}
            onSelectFeature={(featureId) => {
              if (!user) {
                setSuperAdminView('portal');
              } else {
                setDashboardTab(featureId as any);
                setIsHeaderFolded(true);
              }
            }}
            onEnterOS={() => {
              if (!user) {
                setSuperAdminView('portal');
              } else {
                setDashboardTab('command');
                setIsHeaderFolded(true);
              }
            }}
          />
        );
      case 'command':
        return <DailyCommandCenter activeTenant={activeTenantObj} onOpenSubscription={() => setIsSubscriptionModalOpen(true)} />;
      case 'subscription':
        return <SubscriptionManagement inline={true} activeTenant={activeTenantObj} />;
      case 'planner':
        return (
          <CampaignPlanner 
            profile={profile}
            campaign={campaign}
            onUpdate={handleUpdateCampaign}
            isGenerating={isGeneratingCampaign}
            setIsGenerating={setIsGeneratingCampaign}
          />
        );
      case 'ad_studio':
        return <AdStudio />;
      case 'email_studio':
        return (
          <EmailStudio 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            userRole={user.role}
            onCreateAuditLog={(type, details) => handleCreateAuditLog(type, 'info', details)}
          />
        );
      case 'social_studio':
        return (
          <SocialStudio 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            userRole={user.role}
            onCreateAuditLog={(type, details) => handleCreateAuditLog(type, 'info', details)}
          />
        );
      case 'revenue_intelligence':
        return (
          <RevenueIntelligenceOS 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            userRole={user.role}
            onCreateAuditLog={(type, details) => handleCreateAuditLog(type, 'info', details)}
            onChangeTab={setDashboardTab}
          />
        );
      case 'success_center':
        return (
          <SuccessCenter 
            profile={profile}
            onChangeProfile={handleChangeProfile}
            brandConfig={brandConfig}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            tab="onboarding"
            onChangeTab={handleDashboardTabChange}
            personas={personas}
            setPersonas={setPersonas}
            campaign={campaign}
            setCampaign={handleUpdateCampaign}
            guideline={guideline}
            setGuideline={setGuideline}
            onCreateAuditLog={handleCreateAuditLog}
            userRole={user.role}
          />
        );
      case 'domains':
        return <CustomDomainCenter />;
      case 'whitelabel':
        return (
          <TenantWhiteLabelCenter 
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            onNavigateToWebsiteBuilder={() => setDashboardTab('website_builder')}
          />
        );
      case 'restaurant_os':
        return (
          <RestaurantManagement 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            onNavigateToWebsiteBuilder={() => setDashboardTab('website_builder')}
            onNavigateToHotelOS={() => setDashboardTab('hotel_os')}
          />
        );
      case 'hotel_os':
        return (
          <HotelManagement 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
          />
        );
      case 'tours_os':
        return (
          <ToursAndTravelsManagement 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
          />
        );
      case 'website_builder':
        return (
          <WebsiteBuilderOS 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
          />
        );
      case 'business_ops':
        return (
          <BusinessOperations 
            profile={profile}
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            onLoginAsUser={handleSetActiveMember}
          />
        );

      case 'workflow_automation':
        return (
          <WorkflowAutomationStudio
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            onCreateAuditLog={(type, severity, details) => handleCreateAuditLog(type, severity, details)}
          />
        );

      case 'api_gateway':
        return (
          <ApiGatewayDeveloperPortal
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            onCreateAuditLog={(type, severity, details) => handleCreateAuditLog(type, severity, details)}
          />
        );

      case 'webhook_engine':
        return (
          <AdvancedWebhookEngine
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            onCreateAuditLog={(type, severity, details) => handleCreateAuditLog(type, severity, details)}
          />
        );

      case 'integrations':
        return (
          <IntegrationManager
            tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
            activeCampaigns={[]}
            onReloadOutcomes={() => {}}
            onCreateAuditLog={(type, severity, details) => handleCreateAuditLog(type, severity, details)}
          />
        );

      case 'omnicore_labs':
        return (
          <div className="space-y-6">
            <section className="bg-[#0e101a] border border-white/5 p-6 rounded-2xl">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                OmniCore Labs (Experimental Developer Features)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Access advanced high-performance multi-agent departments, tactical schedulers, launch checklist triggers, and production diagnostic modules.
              </p>
              
              {/* OmniCore sub-navigation */}
              <div className="flex flex-wrap gap-2 mt-5 p-1 bg-black/30 rounded-xl border border-white/5 w-fit">
                <button 
                  onClick={() => setOmnicoreSubTab('command')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${omnicoreSubTab === 'command' ? 'bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300' : 'text-slate-400 hover:text-white'}`}
                >
                  Daily Command
                </button>
                <button 
                  onClick={() => setOmnicoreSubTab('launch')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${omnicoreSubTab === 'launch' ? 'bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300' : 'text-slate-400 hover:text-white'}`}
                >
                  Launch Center
                </button>
                <button 
                  onClick={() => setOmnicoreSubTab('business')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${omnicoreSubTab === 'business' ? 'bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300' : 'text-slate-400 hover:text-white'}`}
                >
                  AI Business Dept
                </button>
                <button 
                  onClick={() => setOmnicoreSubTab('ads')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${omnicoreSubTab === 'ads' ? 'bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300' : 'text-slate-400 hover:text-white'}`}
                >
                  Ad Studio
                </button>
              </div>
            </section>

            <AnimatePresence mode="wait">
              <motion.div
                key={omnicoreSubTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                {omnicoreSubTab === 'command' && <DailyCommandCenter activeTenant={activeTenantObj} onOpenSubscription={() => setIsSubscriptionModalOpen(true)} />}
                {omnicoreSubTab === 'launch' && <LaunchCenter />}
                {omnicoreSubTab === 'business' && <AIBusinessDepartment />}
                {omnicoreSubTab === 'ads' && <AdStudio />}
              </motion.div>
            </AnimatePresence>
          </div>
        );
      default:
        return <DailyCommandCenter activeTenant={activeTenantObj} onOpenSubscription={() => setIsSubscriptionModalOpen(true)} />;
    }
  };

  // If Super Admin view is Portal
  if (user.role === 'super_admin' && superAdminView === 'portal') {
    return (
      <div className="min-h-screen bg-[#0C0D14] text-slate-100 flex flex-col font-sans">
        {/* Super Admin Command Bar */}
        <header className="border-b border-rose-500/10 bg-[#0e101a] px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 shadow-lg text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                SUPER ADMIN SYSTEM PANEL <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">Root Security</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Global SaaS Control Plane</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Business Selection Button */}
            <button 
              onClick={() => setSuperAdminView('selection')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl border border-indigo-500/30 shadow-md transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              Business Selection
            </button>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentTime}
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl hover:bg-white/5 border border-transparent text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Portal component */}
        <div className="flex-1 overflow-y-auto">
          <React.Suspense fallback={<WorkspaceModuleLoader />}>
            <SuperAdminPortal 
              currentTenantId={selectedTenantId}
              onTenantChange={(id) => {
                setSelectedTenantId(id);
                setSuperAdminView('dashboard');
              }}
              userRole="super_admin"
              onTenantsUpdated={(newList) => setTenantsList(newList)}
            />
          </React.Suspense>
        </div>
      </div>
    );
  }

  // If Super Admin view is Business Selection Grid
  if (user.role === 'super_admin' && superAdminView === 'selection') {
    const filteredSelectionTenants = tenantsList
      .filter((t) => {
        const query = selectionSearch.toLowerCase().trim();
        const matchesQuery =
          !query ||
          (t.name && t.name.toLowerCase().includes(query)) ||
          (t.domain && t.domain.toLowerCase().includes(query)) ||
          (t.ownerEmail && t.ownerEmail.toLowerCase().includes(query)) ||
          (t.id && t.id.toLowerCase().includes(query)) ||
          (t.plan && t.plan.toLowerCase().includes(query));

        const matchesPlan =
          selectionPlanFilter === 'ALL' ||
          (t.plan && t.plan.toLowerCase() === selectionPlanFilter.toLowerCase());

        const matchesStatus =
          selectionStatusFilter === 'ALL' ||
          (t.status && t.status.toLowerCase() === selectionStatusFilter.toLowerCase());

        return matchesQuery && matchesPlan && matchesStatus;
      })
      .sort((a, b) => {
        if (selectionSort === 'mrr-desc') return (b.mrr || 0) - (a.mrr || 0);
        if (selectionSort === 'users-desc') return (b.activeUsers || 0) - (a.activeUsers || 0);
        if (selectionSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });

    const totalMrrFiltered = filteredSelectionTenants.reduce((acc, curr) => acc + (curr.mrr || 0), 0);
    const isFiltered = selectionSearch !== '' || selectionPlanFilter !== 'ALL' || selectionStatusFilter !== 'ALL';

    return (
      <div className="min-h-screen bg-[#0C0D14] text-slate-100 flex flex-col font-sans">
        {/* Selection Header */}
        <header className="border-b border-white/5 bg-[#0e101a] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSuperAdminView('portal')}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              title="Return to Super Admin Portal"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base text-white">Business Selector Portal</h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  {tenantsList.length} Workspaces
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1" title={`Build #${versionData.build} | Last Updated: ${versionData.lastUpdated}`}>
                  v{versionData.version} <span className="text-[9px] opacity-75">#{versionData.build}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Select an isolated tenant sandbox workspace to inspect operation pipelines, campaign outcomes, or financial projections.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                // Add default simulation tenant if missing
                const tId = `tenant-${Math.random().toString(36).substr(2, 6)}`;
                handleActivateTenant({
                  id: tId,
                  name: `SaaS Startup-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                  domain: `${tId}.marketforge.com`,
                  ownerEmail: `owner@${tId}.com`,
                  isCustom: true,
                  status: 'active',
                  plan: 'Growth',
                  mrr: 249,
                  trialDaysLeft: 14,
                  activeUsers: 1,
                  storageMb: 8.0,
                  health: 'Healthy',
                  apiRequests: 0,
                  pdfExports: 0,
                  imageGenerations: 0,
                  knowledgeAssets: 0,
                  disabledModules: []
                });
              }}
              className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Provision New Tenant
            </button>
            <div className="text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-2 rounded-xl hidden sm:block">
              {currentTime}
            </div>
          </div>
        </header>

        {/* Grid Display */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-[#0e101a] border border-white/10 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search businesses by name, domain, email, or tenant ID..."
                  value={selectionSearch}
                  onChange={(e) => setSelectionSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition font-sans"
                />
                {selectionSearch && (
                  <button
                    onClick={() => setSelectionSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & Sort Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Subscription Plan Filter */}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Plan:</span>
                  <select
                    value={selectionPlanFilter}
                    onChange={(e) => setSelectionPlanFilter(e.target.value)}
                    className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer [&>option]:bg-[#0e101a] [&>option]:text-white"
                  >
                    <option value="ALL">All Plans</option>
                    <option value="Basic">Basic Plan</option>
                    <option value="Growth">Growth Plan</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Status:</span>
                  <select
                    value={selectionStatusFilter}
                    onChange={(e) => setSelectionStatusFilter(e.target.value)}
                    className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer [&>option]:bg-[#0e101a] [&>option]:text-white"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectionSort}
                    onChange={(e: any) => setSelectionSort(e.target.value)}
                    className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer [&>option]:bg-[#0e101a] [&>option]:text-white"
                  >
                    <option value="name-asc">Sort: Name (A-Z)</option>
                    <option value="mrr-desc">Sort: MRR (High to Low)</option>
                    <option value="users-desc">Sort: Active Users (High to Low)</option>
                  </select>
                </div>

                {/* Select All Toggle Button */}
                <button
                  onClick={() => {
                    const filteredIds = filteredSelectionTenants.map(t => t.id);
                    const allSelected = filteredIds.length > 0 && filteredIds.every(id => gridSelectedTenantIds.includes(id));
                    if (allSelected) {
                      setGridSelectedTenantIds(prev => prev.filter(id => !filteredIds.includes(id)));
                    } else {
                      setGridSelectedTenantIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                    filteredSelectionTenants.length > 0 && filteredSelectionTenants.every(t => gridSelectedTenantIds.includes(t.id))
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title="Toggle multi-selection for all visible workspaces"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">
                    {filteredSelectionTenants.length > 0 && filteredSelectionTenants.every(t => gridSelectedTenantIds.includes(t.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </span>
                </button>

                {/* Reset filters button */}
                {isFiltered && (
                  <button
                    onClick={() => {
                      setSelectionSearch('');
                      setSelectionPlanFilter('ALL');
                      setSelectionStatusFilter('ALL');
                    }}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400 font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span>Showing <strong className="text-white">{filteredSelectionTenants.length}</strong> of <strong className="text-slate-300">{tenantsList.length}</strong> businesses</span>
                {selectionSearch && (
                  <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                    Search: "{selectionSearch}"
                  </span>
                )}
                {selectionPlanFilter !== 'ALL' && (
                  <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                    Plan: {selectionPlanFilter}
                  </span>
                )}
                {selectionStatusFilter !== 'ALL' && (
                  <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Status: {selectionStatusFilter}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span>Filtered MRR: <strong className="text-emerald-400 font-bold">{formatCurrency(totalMrrFiltered)}/mo</strong></span>
              </div>
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {filteredSelectionTenants.length === 0 ? (
            <div className="bg-[#0e101a] border border-white/10 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xl">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">No Matching Businesses Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No tenants matched your criteria
                {selectionSearch && <span> query <strong className="text-indigo-300">"{selectionSearch}"</strong></span>}
                {selectionPlanFilter !== 'ALL' && <span> on <strong className="text-indigo-300">{selectionPlanFilter} Plan</strong></span>}.
              </p>
              <button
                onClick={() => {
                  setSelectionSearch('');
                  setSelectionPlanFilter('ALL');
                  setSelectionStatusFilter('ALL');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer inline-flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSelectionTenants.map((t, index) => {
                  const isSelected = gridSelectedTenantIds.includes(t.id);
                  return (
                    <motion.div 
                      key={t.id} 
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: Math.min(index * 0.05, 0.4),
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className={`bg-[#0e101a] border rounded-2xl p-5 flex flex-col justify-between transition duration-250 group relative overflow-hidden shadow-lg ${
                        isSelected 
                          ? 'border-indigo-500/80 bg-indigo-950/20 ring-1 ring-indigo-500/50' 
                          : 'border-white/5 hover:border-indigo-500/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition" />
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setGridSelectedTenantIds(prev => 
                                  prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                                );
                              }}
                              className="p-1 rounded text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                              title={isSelected ? "Deselect workspace" : "Select workspace for batch operations"}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                              )}
                            </button>
                            <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                              {t.plan || 'Growth'} Plan
                            </span>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${t.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        </div>

                        <h3 className="font-display font-bold text-base text-white mb-1 group-hover:text-indigo-400 transition">
                          {t.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mb-4 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          {t.domain}
                        </p>

                        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 mb-5 text-[11px] font-mono">
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold">Active users</span>
                            <span className="text-slate-200">{t.activeUsers || 0} Operators</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold">Workspace size</span>
                            <span className="text-slate-200">{t.storageMb ? t.storageMb.toFixed(1) : 0} MB</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold">Operational health</span>
                            <span className="text-emerald-400 font-bold">{t.health || 'Healthy'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold">MRR Contribution</span>
                            <span className="text-indigo-400 font-bold">{formatCurrency(t.mrr || 0)}/mo</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedTenantId(t.id);
                          setSuperAdminView('dashboard');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 bg-white/5 group-hover:bg-indigo-600 border border-white/10 group-hover:border-indigo-500/30 text-slate-300 group-hover:text-white font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Enter Workspace
                        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

          {/* Floating Status Indicator & Bulk Actions Toolbar */}
          <AnimatePresence>
            {gridSelectedTenantIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121422]/95 backdrop-blur-md border border-indigo-500/40 text-white shadow-2xl rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 max-w-2xl w-[92%] sm:w-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 font-bold shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">
                        {gridSelectedTenantIds.length} {gridSelectedTenantIds.length === 1 ? 'Workspace' : 'Workspaces'} Selected
                      </span>
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Batch Grid Selection
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Aggregate MRR: <strong className="text-emerald-400 font-bold">{formatCurrency(
                        tenantsList
                          .filter(t => gridSelectedTenantIds.includes(t.id))
                          .reduce((sum, t) => sum + (t.mrr || 0), 0)
                      )}/mo</strong></span>
                      <span className="text-slate-600 hidden sm:inline">\u2022</span>
                      <span className="hidden sm:inline">Active Users: <strong className="text-indigo-300 font-bold">{
                        tenantsList
                          .filter(t => gridSelectedTenantIds.includes(t.id))
                          .reduce((sum, t) => sum + (t.activeUsers || 0), 0)
                      }</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const idsToSuspend = [...gridSelectedTenantIds];
                      const updated = tenantsList.map(t => idsToSuspend.includes(t.id) ? { ...t, status: 'suspended' } : t);
                      setTenantsList(updated);
                      localStorage.setItem('marketforge_sa_tenants', JSON.stringify(updated));
                      setGridSelectedTenantIds([]);
                      try {
                        await fetch('/api/admin/tenants/update-status', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tenantIds: idsToSuspend, status: 'suspended' })
                        });
                      } catch (e) {}
                    }}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    title="Suspend selected workspaces"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspend
                  </button>
                  <button
                    onClick={async () => {
                      const idsToActivate = [...gridSelectedTenantIds];
                      const updated = tenantsList.map(t => idsToActivate.includes(t.id) ? { ...t, status: 'active' } : t);
                      setTenantsList(updated);
                      localStorage.setItem('marketforge_sa_tenants', JSON.stringify(updated));
                      setGridSelectedTenantIds([]);
                      try {
                        await fetch('/api/admin/tenants/update-status', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tenantIds: idsToActivate, status: 'active' })
                        });
                      } catch (e) {}
                    }}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    title="Activate selected workspaces"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Activate
                  </button>
                  <button
                    onClick={() => setGridSelectedTenantIds([])}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer ml-1"
                    title="Clear Selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // Rent Business Dashboard (Tenant, or Super Admin viewing selected tenant)
  return (
    <div className="min-h-screen bg-[#0C0D14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Super Admin Active Impersonation Banner */}
      {user.role === 'super_admin' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold">SYSTEM WORKSPACE IMPERSONATION ACTIVE</span>
            <span>\u2014 You are actively administering</span>
            <span className="font-bold underline text-white font-mono bg-white/5 px-1.5 py-0.5 rounded">{activeTenantName}</span>
          </div>
          <div className="flex gap-4 font-semibold">
            <button 
              onClick={() => setSuperAdminView('selection')}
              className="text-amber-200 hover:text-white hover:underline cursor-pointer"
            >
              [Change Business]
            </button>
            <button 
              onClick={() => setSuperAdminView('portal')}
              className="text-rose-400 hover:text-white hover:underline cursor-pointer font-bold"
            >
              [Exit to Super Admin Portal]
            </button>
          </div>
        </div>
      )}

      {/* SuperAdmin View Mode Active Banner */}
      {user.role === 'super_admin' && (
        <div className="bg-gradient-to-r from-amber-950 via-slate-950 to-indigo-950 border-b border-amber-500/40 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl relative z-50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">SuperAdmin View Mode: Tenant Mode</span>
                <span className="bg-amber-400/20 text-amber-200 border border-amber-400/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  ON-BEHALF-OF ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Operating on behalf of workspace: <strong className="text-white font-bold">{activeTenantName}</strong> (<span className="font-mono text-amber-200">{selectedTenantId}</span>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSuperAdminView('portal')}
              className="px-3.5 py-1.8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Return to SuperAdmin Portal</span>
            </button>
            <button 
              onClick={() => setSuperAdminView('selection')}
              className="px-3 py-1.8 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Business Selector</span>
            </button>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {dashboardTab !== 'landing' && (
          <motion.header
            key="workspace-header"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`border-b border-white/10 bg-[#07080E]/85 backdrop-blur-xl px-4 sm:px-6 transition-all duration-500 ease-out flex items-center justify-between sticky top-0 z-40 shadow-2xl ${isHeaderFolded ? 'py-1.5' : 'py-3.5'}`}
          >
          <div className="flex items-center gap-3">
            {/* Foldable Sidebar Controls */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar Navigation" : "Fold Sidebar Navigation"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
            </button>

          <button
            onClick={() => setDashboardTab('landing')}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Open MarketForge OS Feature Landing Suite"
          >
            {isHeaderFolded ? (
              <div className="relative flex items-center justify-center w-8 h-8 group-hover:scale-105 transition">
                <MarketForgeEmblem className="w-8 h-8" glow={true} />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#07080E] rounded-full z-10" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/marketforge-header-logo.svg" 
                  alt="MarketForge OS - A True Business Transformation" 
                  className="h-9 md:h-10 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] group-hover:scale-105 transition"
                />
                <span className="text-[10px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono font-bold shrink-0">v5.0</span>
              </div>
            )}
          </button>

          {/* Quick OS Features Landing Trigger */}
          <button
            onClick={() => setDashboardTab(dashboardTab === 'landing' ? 'command' : 'landing')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              dashboardTab === 'landing'
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {dashboardTab === 'landing' ? 'Enter Workspace' : 'OS Features Overview'}
          </button>
        </div>

        {/* Live status indicators & Universal Workspace Actions */}
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] text-slate-400">
          <div className="hidden md:flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">STATUS:</span>
            <span className="text-emerald-400 font-bold uppercase">SECURE CLOUD</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          {/* Fold Header Toggle Button */}
          <button
            onClick={() => setIsHeaderFolded(!isHeaderFolded)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title={isHeaderFolded ? "Expand Header Bar" : "Fold Header Bar"}
          >
            {isHeaderFolded ? <Maximize2 className="w-3.5 h-3.5 text-indigo-300" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Action Header Dropdown */}
          <div className="relative">
            <button
              id="quick-actions-trigger"
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 hover:from-amber-500/30 hover:via-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-white text-xs font-bold transition shadow-lg cursor-pointer"
              title="Quick Actions Menu"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Quick Actions</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickActionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsQuickActionsOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-72 bg-[#0d0f18] border border-indigo-500/30 rounded-2xl shadow-2xl z-50 p-2 space-y-1 font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between text-slate-400">
                    <span className="font-bold uppercase text-[10px] tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Quick Action Triggers
                    </span>
                    <kbd className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">ESC</kbd>
                  </div>

                  {/* Quick Action Items */}
                  <div className="py-1 space-y-0.5">
                    {[
                      { label: 'Generate Social Post', desc: 'Create AI social copy & media', icon: Share2, color: 'text-rose-400', tab: 'social_studio' },
                      { label: 'Create Campaign', desc: 'Formulate growth & ad strategy', icon: Layers, color: 'text-indigo-400', tab: 'planner' },
                      { label: 'Restaurant POS & Floor', desc: 'Floor layout, Waiter POS & QR', icon: Utensils, color: 'text-orange-400', tab: 'restaurant_os' },
                      { label: 'Hotel & Resort Management', desc: 'Rooms, Reservations & Folios', icon: Bed, color: 'text-indigo-400', tab: 'hotel_os' },
                      { label: 'Manage SaaS Domains', desc: 'DNS, SSL & Custom branding', icon: Globe, color: 'text-teal-400', tab: 'domains' },
                      { label: 'Launch Website Builder', desc: 'Design landing pages & site', icon: Globe, color: 'text-fuchsia-400', tab: 'website_builder' },
                      { label: 'Revenue Intelligence', desc: 'Audit KPIs & sales forecast', icon: DollarSign, color: 'text-amber-400', tab: 'revenue_intelligence' },
                      { label: 'Ad Copy Studio', desc: 'Generate multi-channel ad copy', icon: Sparkles, color: 'text-purple-400', tab: 'ad_studio' },
                      { label: 'Email Studio', desc: 'Draft newsletters & workflows', icon: Mail, color: 'text-cyan-400', tab: 'email_studio' },
                    ].map((act, i) => {
                      const Icon = act.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setDashboardTab(act.tab as any);
                            setIsQuickActionsOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent transition text-slate-200 group cursor-pointer"
                        >
                          <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 ${act.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-indigo-300 flex items-center gap-1.5">
                              {act.label}
                            </div>
                            <div className="text-[10px] text-slate-400">{act.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Super Admin Quick Toggle */}
          {user.role === 'super_admin' && (
            <div className="relative">
              <button
                onClick={() => setIsSuperAdminQuickToggleOpen(!isSuperAdminQuickToggleOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-extrabold text-xs transition cursor-pointer shadow-lg"
                title="Super Admin Quick Toggle & Tenant Switcher"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="hidden sm:inline">Super Admin Mode</span>
                <ChevronDown className={`w-3.5 h-3.5 text-amber-300 transition-transform duration-200 ${isSuperAdminQuickToggleOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSuperAdminQuickToggleOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsSuperAdminQuickToggleOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-[#0c0e17] border border-amber-500/40 rounded-2xl shadow-2xl z-50 p-3 space-y-2.5 font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" /> Quick View Switcher
                      </span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                        SUPER_ADMIN
                      </span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setSuperAdminView('portal');
                          setIsSuperAdminQuickToggleOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 font-bold flex items-center justify-between transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-400" />
                          <span>Exit to Super Admin Portal</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      <button
                        onClick={() => {
                          setSuperAdminView('selection');
                          setIsSuperAdminQuickToggleOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 font-bold flex items-center justify-between transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          <span>Business Selection Grid</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </div>

                    <div className="border-t border-white/10 pt-2 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                        Rapid Switch Active Tenant:
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                        {tenantsList.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setSelectedTenantId(t.id);
                              setSuperAdminView('dashboard');
                              setIsSuperAdminQuickToggleOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition cursor-pointer ${
                              selectedTenantId === t.id
                                ? 'bg-amber-500/20 text-white font-bold border border-amber-500/40'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <div className="truncate">
                              <span className="block truncate font-medium">{t.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{t.id}</span>
                            </div>
                            {selectedTenantId === t.id && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase shrink-0">Active</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Authenticated Workspace & Member Identity Badge */}
          <button 
            id="workspace-identity-header"
            onClick={() => setIsMemberAuthModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-indigo-950/60 hover:from-indigo-900/80 hover:to-indigo-900/70 border border-indigo-500/40 hover:border-indigo-400/60 text-left transition cursor-pointer shadow-md group shrink-0"
            title="Switch Team Member / Designation Login"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold group-hover:scale-105 transition shrink-0">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-extrabold text-xs text-white tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
                  {activeTenantName}
                </span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                  {currency}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-sans text-slate-300 truncate max-w-[150px] sm:max-w-[230px] leading-tight mt-0.5">
                <span className="font-semibold text-slate-200 truncate">{authenticatedMemberName}</span>
                <span className="text-indigo-400/60 font-bold shrink-0">·</span>
                <span className="text-indigo-300 font-medium truncate">{authenticatedMemberDesignation}</span>
              </div>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 ml-1 shrink-0 hidden sm:block opacity-80 group-hover:opacity-100" />
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
            title="User Settings"
          >
            <SettingsIcon className="w-4.5 h-4.5" />
          </button>


          {/* Normal user logout */}
          {user.role !== 'super_admin' && (
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </motion.header>
        )}
      </AnimatePresence>

      {/* Main Container Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar Navigation - Only shown when in Workspace Mode */}
        <AnimatePresence mode="wait">
        {dashboardTab !== 'landing' && (
          <motion.aside
            key="workspace-sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className={`border-r border-white/5 bg-[#090a10] p-3 flex flex-col justify-between hidden lg:flex shrink-0 transition-all duration-500 ease-out ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}
          >
            <div className="space-y-4">
              {/* Foldable Sidebar Header Control */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-white/5">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase truncate">Enterprise Suite</span>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer mx-auto"
                  title={isSidebarCollapsed ? "Expand Navigation Menu" : "Collapse Navigation Menu"}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
                </button>
              </div>

              {/* Navigation Items Grouped */}
              <nav className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {[
                  {
                    category: 'Core Operations',
                    items: [
                      { id: 'command', label: 'Command Center', icon: Terminal, color: 'text-emerald-400' },
                      { id: 'business_ops', label: 'Team & Roster Ops', icon: Briefcase, color: 'text-blue-400' },
                      { id: 'subscription', label: 'Subscription & Billing', icon: Receipt, color: 'text-emerald-400' },
                    ]
                  },
                  {
                    category: 'Industry Verticals',
                    items: [
                      { id: 'restaurant_os', label: 'Restaurant OS', icon: Building2, color: 'text-orange-400' },
                      { id: 'hotel_os', label: 'Hotel & Resort OS', icon: Bed, color: 'text-indigo-400' },
                      { id: 'tours_os', label: 'Tours & Travels', icon: Compass, color: 'text-cyan-400' },
                      { id: 'website_builder', label: 'AI Website Builder', icon: Globe, color: 'text-fuchsia-400' },
                    ]
                  },
                  {
                    category: 'Growth & Intelligence',
                    items: [
                      { id: 'planner', label: 'Marketing Planner', icon: Layers, color: 'text-indigo-400' },
                      { id: 'ad_studio', label: 'Ad Copy Studio', icon: Sparkles, color: 'text-purple-400' },
                      { id: 'email_studio', label: 'Email Studio', icon: Mail, color: 'text-cyan-400' },
                      { id: 'social_studio', label: 'Social Engine', icon: Share2, color: 'text-rose-400' },
                      { id: 'revenue_intelligence', label: 'Revenue OS', icon: DollarSign, color: 'text-amber-400' },
                    ]
                  },
                  {
                    category: 'Brand & Infrastructure',
                    items: [
                      { id: 'whitelabel', label: 'White-Label Branding', icon: Shield, color: 'text-emerald-400' },
                      { id: 'domains', label: 'SaaS Domains', icon: Globe, color: 'text-teal-400' },
                      { id: 'success_center', label: 'Success Academy', icon: BookOpen, color: 'text-blue-400' },
                      { id: 'omnicore_labs', label: 'OmniCore Labs', icon: FlaskConical, color: 'text-fuchsia-400' },
                    ]
                  }
                ]
                  .map(group => ({
                    ...group,
                    items: group.items.filter(item => {
                      if (!isModulePermittedForMember(item.id)) return false;
                      const tenantStatus = isModuleDisabledForTenant(item.id);
                      if (tenantStatus.disabled) return false;
                      return true;
                    })
                  }))
                  .filter(group => group.items.length > 0)
                  .map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                    {!isSidebarCollapsed && (
                      <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider px-3 pt-1">
                        {group.category}
                      </div>
                    )}
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = dashboardTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`tab-btn-${item.id}`}
                          onClick={() => setDashboardTab(item.id as any)}
                          title={item.label}
                          className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'} rounded-xl text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            isActive 
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/15 border border-indigo-500/30' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                          {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Workspace Telemetry Panel with AI Sparkline & Tenant Health Monitor */}
              {!isSidebarCollapsed && (
                <div className="mx-1 pt-2 space-y-2">
                  <React.Suspense fallback={<div className="h-10 bg-white/5 rounded-xl animate-pulse" />}>
                    <TenantHealthMonitor
                      tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
                      compact={true}
                    />
                  </React.Suspense>
                  <TelemetrySparkline
                    tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
                    tenantPlan={activeTenantObj?.plan || "Growth"}
                    onOpenFullTelemetry={() => setIsAiTelemetryOpen(true)}
                  />
                </div>
              )}
            </div>

            {/* Footer Info */}
            {!isSidebarCollapsed ? (
              <div className="p-2 border-t border-white/5 font-mono text-[9px] text-slate-400 space-y-1">
                <div>SECURE MULTI-TENANCY</div>
                <div className="text-indigo-400 font-bold">ISOLATION ACTIVE</div>
              </div>
            ) : (
              <div className="p-1 border-t border-white/5 text-center text-[8px] font-mono text-indigo-400 font-bold">
                OS
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

        {/* Content Panel Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0C0D14]">
          
          {activeTenantObj?.plan === 'Trial' && (
            <TrialBanner 
              trialDaysLeft={trialDaysLeft} 
              onUpgradeClick={() => setIsSubscriptionModalOpen(true)} 
            />
          )}

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-4 text-[11px] font-semibold text-slate-400 font-sans tracking-wide">
            <span className="text-indigo-400">{activeTenantName}</span>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className={dashboardTab !== 'omnicore_labs' ? "text-slate-200" : "hover:text-slate-200 cursor-pointer transition"} onClick={() => dashboardTab === 'omnicore_labs' && setOmnicoreSubTab('command')}>
              {dashboardNavItems.find(item => item.id === dashboardTab)?.label}
            </span>
            {dashboardTab === 'omnicore_labs' && (
              <>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <span className="text-slate-200">
                  {omnicoreSubTab === 'command' ? 'Daily Command' : omnicoreSubTab === 'launch' ? 'Launch Center' : omnicoreSubTab === 'business' ? 'AI Business Dept' : 'Ad Studio'}
                </span>
              </>
            )}
          </div>

          {/* Mobile Navigation Header */}
          <div className="lg:hidden mb-6 bg-[#0e101a] border border-white/5 p-1 rounded-xl flex items-center gap-1 overflow-x-auto">
            {dashboardNavItems
              .filter((item) => isModulePermittedForMember(item.id) && !isModuleDisabledForTenant(item.id).disabled)
              .map((item) => {
              const Icon = item.icon;
              const isActive = dashboardTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setDashboardTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Screen Transition Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={dashboardTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <ErrorBoundary sectionName={`Workspace Module: ${dashboardTab}`}>
                <React.Suspense fallback={<WorkspaceModuleLoader />}>
                  {renderDashboardContent()}
                </React.Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {isSubscriptionModalOpen && (
        <React.Suspense fallback={null}>
          <SubscriptionManagement 
            isOpen={isSubscriptionModalOpen} 
            onClose={() => setIsSubscriptionModalOpen(false)} 
            activeTenant={activeTenantObj} 
          />
        </React.Suspense>
      )}
      {isPaymentSuccessOpen && (
        <React.Suspense fallback={null}>
          <PaymentSuccessModal 
            isOpen={isPaymentSuccessOpen}
            onClose={() => {
               setIsPaymentSuccessOpen(false);
               setIsSubscriptionModalOpen(false);
               fetchTenants();
            }}
          />
        </React.Suspense>
      )}

      {/* Global Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0C0D14] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0e101a]">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-indigo-400" />
                  <h2 className="font-display font-bold text-white text-lg">User Settings</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {/* Theme Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-200">Global Theme Mode</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Switch between Dark Luxury and High-Visibility Light UI</p>
                    </div>
                    <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setThemeMode('dark')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${themeMode === 'dark' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                      >
                        {"\u{1F319}"} Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('light')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${themeMode === 'light' ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'}`}
                      >
                        {"\u2600\uFE0F"} Light
                      </button>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-200">High Contrast Mode</h3>
                      <p className="text-xs text-slate-400 mt-0.5">WCAG compliant higher-luminosity colors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={highContrastMode}
                        onChange={(e) => setHighContrastMode(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <hr className="border-white/5" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                                            <div>
                        <h3 className="font-bold text-slate-200">Base Font Size</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Scale text independently of layout</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-400">{baseFontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="12" 
                      max="24" 
                      value={baseFontSize}
                      onChange={(e) => setBaseFontSize(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <hr className="border-white/5" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-200">Display Currency</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Select preferred billing currency</p>
                    </div>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'USD' | 'NPR')}
                      className="bg-[#0e101a] border border-white/10 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="NPR">NPR (\u0930\u0942)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-white/5 bg-[#0e101a] flex justify-end">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Authentication & Switcher Modal */}
      <MemberAuthModal
        isOpen={isMemberAuthModalOpen}
        onClose={() => setIsMemberAuthModalOpen(false)}
        tenantId={user?.role === 'super_admin' ? selectedTenantId : (user?.tenantId || (routeState.type === 'tenant_view' && routeState.tenant?.id) || selectedTenantId || 'demo-tenant')}
        tenantName={activeTenantName}
        currentMember={activeTeamMember}
        onLoginSuccess={(member) => {
          handleSetActiveMember(member);
          handleLogin(member.role, member.tenantId, member.email, member.name, member.designation, member);
        }}
        onLogoutToGuest={() => handleSetActiveMember(null)}
      />

      {/* AI Telemetry, BYOK & Token Billing Modal */}
      {isAiTelemetryOpen && (
        <React.Suspense fallback={null}>
          <AiTelemetryModal
            isOpen={isAiTelemetryOpen}
            onClose={() => setIsAiTelemetryOpen(false)}
            tenantId={user?.role === 'super_admin' ? selectedTenantId : (user?.tenantId || 'demo-tenant')}
            tenantName={activeTenantName}
            tenantPlan={activeTenantObj?.plan || "Growth"}
            isSuperAdmin={user?.role === 'super_admin'}
          />
        </React.Suspense>
      )}

      {/* In-App Feedback & Telemetry Diagnostics Drawer */}
      <FeedbackWidget
        currentTenantId={selectedTenantId}
        userEmail={user?.email || (activeTeamMember ? `${activeTeamMember.name.toLowerCase().replace(/\s+/g, '')}@${activeTenantObj?.domain || 'marketforge.ai'}` : 'guest@marketforge.ai')}
        userRole={user?.role || activeTeamMember?.designation || 'Visitor'}
      />
    </div>
  );
}

