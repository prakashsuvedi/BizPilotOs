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
  Building2,
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
  Minimize2
} from 'lucide-react';

import { clientAuth, clientDb } from './lib/firebase';
import { BusinessProfile, CampaignPlan, CustomerPersona, BrandGuideline, TenantTeamMember } from './types';

// Components
import LoginPortal from './components/LoginPortal';
import SuperAdminPortal from './components/SuperAdminPortal';
import DailyCommandCenter from './components/DailyCommandCenter';
import LaunchCenter from './components/LaunchCenter';
import AIBusinessDepartment from './components/AIBusinessDepartment';
import AdStudio from './components/AdStudio';
import EmailStudio from './components/EmailStudio';
import CampaignPlanner from './components/CampaignPlanner';
import SocialStudio from './components/SocialStudio';
import RevenueIntelligenceOS from './components/RevenueIntelligenceOS';
import SuccessCenter from './components/SuccessCenter';
import TenantWhiteLabelCenter from './components/TenantWhiteLabelCenter';
import CustomDomainCenter from './components/CustomDomainCenter';
import { getTenantBranding } from './lib/tenantBranding';
import SubscriptionManagement from './components/SubscriptionManagement';

import RestaurantManagement from './components/RestaurantManagement';
import ToursAndTravelsManagement from './components/ToursAndTravelsManagement';
import WebsiteBuilderOS from './components/WebsiteBuilderOS';

import BusinessOperations from './components/BusinessOperations';
import MemberAuthModal from './components/MemberAuthModal';
import TelemetrySparkline from './components/TelemetrySparkline';
import AiTelemetryModal from './components/AiTelemetryModal';
import { BizPilotLanding } from './components/BizPilotLanding';
import { MarketBazaarLanding } from './components/MarketBazaarLanding';

import PaymentSuccessModal from './components/PaymentSuccessModal';
import TrialBanner from './components/TrialBanner';

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
  const [user, setUser] = useState<{ role: string; tenantId: string; email: string } | null>(() => {
    const saved = localStorage.getItem("marketforge_user_session");
    return saved ? JSON.parse(saved) : null;
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


  // Master Tenants list
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('demo-tenant');

  // Super Admin view state: 'portal' | 'selection' | 'dashboard'
  const [superAdminView, setSuperAdminView] = useState<'portal' | 'selection' | 'dashboard'>('portal');
  const [isSuperAdminQuickToggleOpen, setIsSuperAdminQuickToggleOpen] = useState(false);

  // Business Selection View Search & Filter states
  const [selectionSearch, setSelectionSearch] = useState('');
  const [selectionPlanFilter, setSelectionPlanFilter] = useState('ALL');
  const [selectionStatusFilter, setSelectionStatusFilter] = useState('ALL');
  const [selectionSort, setSelectionSort] = useState<'name-asc' | 'mrr-desc' | 'users-desc'>('name-asc');

  // Business Dashboard navigation
  const [dashboardTab, setDashboardTab] = useState<'landing' | 'command' | 'planner' | 'ad_studio' | 'email_studio' | 'social_studio' | 'revenue_intelligence' | 'success_center' | 'omnicore_labs' | 'domains' | 'whitelabel' | 'restaurant_os' | 'tours_os' | 'website_builder' | 'business_ops' | 'subscription'>('landing');

  // OmniCore Labs sub-tabs
  const [omnicoreSubTab, setOmnicoreSubTab] = useState<'command' | 'launch' | 'business' | 'ads'>('command');

  // Shared Tenant-Specific App States
  const [profile, setProfile] = useState<BusinessProfile>(defaultProfile);
  const [brandConfig, setBrandConfig] = useState<any>({
    brand_name: "BizPilot OS",
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
  const [highContrastMode, setHighContrastMode] = useState(() => {
    return localStorage.getItem('marketforge_high_contrast') === 'true';
  });
  const [baseFontSize, setBaseFontSize] = useState(() => {
    return parseInt(localStorage.getItem('marketforge_font_size') || '16', 10);
  });

  // Apply CSS overrides based on user settings
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

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants-list');
      if (res.ok) {
        const list = await res.json();
        setTenantsList(list);
      } else {
        setTenantsList([
          { id: "demo-tenant", name: "Enterprise DemoCorp", domain: "demo.marketforge.com", ownerEmail: "owner@democorp.com", isCustom: false, status: "active", plan: "Enterprise", mrr: 499, trialDaysLeft: 30, activeUsers: 5, storageMb: 450.0, health: "Healthy", apiRequests: 1280, pdfExports: 42, imageGenerations: 180, knowledgeAssets: 12, disabledModules: [] },
          { id: "sienna-tenant", name: "Sienna Clay Co", domain: "siennaclay.com", ownerEmail: "evelyn@siennaclay.com", isCustom: false, status: "active", plan: "Basic", mrr: 99, trialDaysLeft: 12, activeUsers: 3, storageMb: 48.2, health: "Healthy", apiRequests: 320, pdfExports: 4, imageGenerations: 12, knowledgeAssets: 4, disabledModules: [] },
          { id: "solas-tenant", name: "Solas Systems", domain: "solas.io", ownerEmail: "admin@solas.io", isCustom: false, status: "active", plan: "Pro", mrr: 499, trialDaysLeft: 0, activeUsers: 14, storageMb: 289.4, health: "Healthy", apiRequests: 1940, pdfExports: 34, imageGenerations: 98, knowledgeAssets: 28, disabledModules: [] }
        ]);
      }
    } catch (err) {
      setTenantsList([
        { id: "demo-tenant", name: "Enterprise DemoCorp", domain: "demo.marketforge.com", ownerEmail: "owner@democorp.com", isCustom: false, status: "active", plan: "Enterprise", mrr: 499, trialDaysLeft: 30, activeUsers: 5, storageMb: 450.0, health: "Healthy", apiRequests: 1280, pdfExports: 42, imageGenerations: 180, knowledgeAssets: 12, disabledModules: [] },
        { id: "sienna-tenant", name: "Sienna Clay Co", domain: "siennaclay.com", ownerEmail: "evelyn@siennaclay.com", isCustom: false, status: "active", plan: "Basic", mrr: 99, trialDaysLeft: 12, activeUsers: 3, storageMb: 48.2, health: "Healthy", apiRequests: 320, pdfExports: 4, imageGenerations: 12, knowledgeAssets: 4, disabledModules: [] },
        { id: "solas-tenant", name: "Solas Systems", domain: "solas.io", ownerEmail: "admin@solas.io", isCustom: false, status: "active", plan: "Pro", mrr: 499, trialDaysLeft: 0, activeUsers: 14, storageMb: 289.4, health: "Healthy", apiRequests: 1940, pdfExports: 34, imageGenerations: 98, knowledgeAssets: 28, disabledModules: [] }
      ]);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTenant = urlParams.get('tenant') || urlParams.get('slug') || urlParams.get('t') || urlParams.get('id');

    // Parse path segments for clean slug URLs e.g. /t/sienna-tenant or /tenant/demo-tenant
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    let pathTenant = '';
    if (pathSegments.length >= 2 && ['t', 'tenant', 'slug', 'b', 'company', 'workspace'].includes(pathSegments[0])) {
      pathTenant = pathSegments[1];
    } else if (pathSegments.length === 1 && !['api', 'login', 'admin', 'dist', 'static', 'assets'].includes(pathSegments[0])) {
      pathTenant = pathSegments[0];
    }

    const detectedTenant = queryTenant || pathTenant;
    if (detectedTenant) {
      setSelectedTenantId(detectedTenant);
    }

    // Auto-launch workspace trigger check
    const isLaunchRequested = 
      urlParams.get('action') === 'workspace' || 
      urlParams.get('launch') === 'true' || 
      urlParams.get('autolaunch') === 'true' ||
      window.location.hash === '#workspace' ||
      pathSegments.includes('workspace') ||
      pathSegments.includes('launch');

    if (isLaunchRequested) {
      if (user) {
        setDashboardTab('command');
        setIsHeaderFolded(true);
      } else {
        setIsMemberAuthModalOpen(true);
      }
    }

    if (urlParams.get('payment_success')) {
       setIsPaymentSuccessOpen(true);
       window.history.replaceState({}, document.title, window.location.pathname);
       // Poll a few times to ensure the backend update has propagated
       let attempts = 0;
       const pollInterval = setInterval(() => {
          fetch('/api/tenants-list').then(res => res.json()).then(list => {
             localStorage.setItem('marketforge_sa_tenants', JSON.stringify(list));
             setTenantsList(list);
             if (user?.tenantId) {
                loadTenantDetails(user.tenantId);
             }
             attempts++;
             if (attempts > 3) {
                 clearInterval(pollInterval);
             }
          });
       }, 1000);
    } else {
       fetchTenants();
    }

    }, []);

  // Load state whenever selectedTenantId or user session changes
  const loadTenantDetails = async (tenantId: string) => {
    try {
      // 1. Load Campaign Profiles (BusinessProfile)
      try {
        const profiles = await clientDb.getCollection("campaign_profiles", tenantId);
        if (profiles && profiles.length > 0) {
          setProfile({ ...profiles[0], tenantId });
        } else {
          const freshProfile = {
            ...defaultProfile,
            id: `prof_${Math.random().toString(36).substr(2, 9)}`,
            tenantId
          };
          setProfile(freshProfile);
          await clientDb.addDocToTenant("campaign_profiles", freshProfile, tenantId).catch(err => console.warn("Failed to persist fresh profile:", err));
        }
      } catch (err1) {
        console.warn("Failed loading campaign profiles from Firestore:", err1);
        setProfile({ ...defaultProfile, tenantId });
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
  const handleLogin = (role: string, tenantId: string, email: string) => {
    const session = { role, tenantId, email };
    setUser(session);
    localStorage.setItem("marketforge_user_session", JSON.stringify(session));
    if (role === 'super_admin') {
      setSelectedTenantId('demo-tenant');
      setSuperAdminView('portal');
    } else {
      setSelectedTenantId(tenantId);
    }
  };

  const handleLogout = async () => {
    await clientAuth.logout();
    localStorage.removeItem("marketforge_user_session");
    setUser(null);
    setSuperAdminView('portal');
    setDashboardTab('command');
  };

  const handleActivateTenant = (newTenant: any) => {
    // Append and refresh the list
    setTenantsList(prev => {
      if (prev.some(t => t.id === newTenant.id)) return prev;
      return [...prev, newTenant];
    });
    fetchTenants();
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

  // Render Login Portal
  if (!user) {
    return (
      <LoginPortal 
        onLogin={handleLogin}
        tenantsList={tenantsList}
        onActivateTenant={handleActivateTenant}
      />
    );
  }

  // Active tenant name helper
  const activeTenantObj = tenantsList.find(t => t.id === (user.role === 'super_admin' ? selectedTenantId : user.tenantId));

  const activeTenantName = activeTenantObj?.name || "Enterprise Workspace";
  
  let trialDaysLeft = activeTenantObj?.trialDaysLeft !== undefined ? activeTenantObj.trialDaysLeft : 30;
  if (activeTenantObj?.createdAt && activeTenantObj?.plan === 'Trial') {
    const createdAt = new Date(activeTenantObj.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    trialDaysLeft = Math.max(0, 30 - diffDays);
  }


  // Sidebar Items for Tenant Dashboard
  const dashboardNavItems = [
    { id: 'landing', label: 'OS Features Suite', icon: Sparkles, color: 'text-amber-400' },
    { id: 'command', label: 'Command Center', icon: Terminal, color: 'text-emerald-400' },
    { id: 'subscription', label: 'Subscription & Billing', icon: Receipt, color: 'text-emerald-400' },
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
    // Check designation-based module access
    const isModulePermittedForMember = (tabId: string): boolean => {
      if (!activeTeamMember) return true; // Owner/Tenant Admin by default
      const designationLower = activeTeamMember.designation.toLowerCase();
      if (designationLower.includes('admin') || designationLower.includes('ceo') || designationLower.includes('founder') || designationLower.includes('owner')) {
        return true;
      }

      // Map tabId to module name
      const tabToModuleMap: Record<string, string> = {
        planner: 'marketing_planner',
        ad_studio: 'ad_studio',
        email_studio: 'email_studio',
        social_studio: 'social_studio',
        revenue_intelligence: 'revenue_intelligence',
        domains: 'domains',
        restaurant_os: 'restaurant_os',
        tours_os: 'tours_os',
        website_builder: 'website_builder',
        business_ops: 'business_ops',
        omnicore_labs: 'omnicore_labs'
      };

      const targetModule = tabToModuleMap[tabId];
      if (!targetModule) return true; // landing, command, success_center available to all
      return activeTeamMember.permittedModules?.includes(targetModule) ?? true;
    };

    if (!isModulePermittedForMember(dashboardTab)) {
      return (
        <div className="bg-[#0e101a] border border-amber-500/20 rounded-3xl p-8 max-w-2xl mx-auto my-12 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Module Access Restricted by Designation</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Logged in as <strong className="text-amber-300 font-mono">{activeTeamMember?.name}</strong> ({activeTeamMember?.designation}).
              The Tenant Admin has not granted access to feature module <strong className="text-indigo-400 font-mono">{dashboardTab}</strong>.
            </p>
          </div>
          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left space-y-2 font-mono text-[11px]">
            <p className="text-slate-300 font-bold">Your Authorized Designation Modules:</p>
            <div className="flex flex-wrap gap-1.5">
              {activeTeamMember?.permittedModules?.map((m, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setDashboardTab('business_ops')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Manage Team & Access
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
          <BizPilotLanding 
            tenantId={activeTenantForLanding}
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
          <SuperAdminPortal 
            currentTenantId={selectedTenantId}
            onTenantChange={(id) => {
              setSelectedTenantId(id);
              setSuperAdminView('dashboard');
            }}
            userRole="super_admin"
            onTenantsUpdated={(newList) => setTenantsList(newList)}
          />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSelectionTenants.map((t) => (
                <div 
                  key={t.id} 
                  className="bg-[#0e101a] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between transition duration-250 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                        {t.plan || 'Growth'} Plan
                      </span>
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
                </div>
              ))}
            </div>
          )}
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
            <span>— You are actively administering</span>
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

      {/* Main Brand/Workspace Header - Only shown in active Workspace mode */}
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
            title="Open MarketBazaar OS Feature Landing Suite"
          >
            <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-lg shadow-indigo-500/20 border border-white/20 group-hover:scale-105 transition ${isHeaderFolded ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <Cpu className={`text-white ${isHeaderFolded ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#07080E] rounded-full" />
            </div>
            {!isHeaderFolded && (
              <div>
                <h1 className="font-display font-extrabold text-sm tracking-wide text-white flex items-center gap-2 uppercase group-hover:text-indigo-300 transition">
                  {brandConfig?.brand_name || "MarketBazaar OS"}
                  <span className="text-[10px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono font-bold">v5.0</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                  {activeTenantName.toUpperCase()} • ACTIVE INSTANCE
                </p>
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

        {/* Live status indicators */}
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] text-slate-400">
          <div className="hidden md:flex items-center gap-2">
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">TENANT:</span>
            <span className="text-indigo-300 font-bold uppercase">{user.role === 'super_admin' ? selectedTenantId : user.tenantId}</span>
          </div>
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

          {/* Active Team Member Login Badge */}
          <button 
            onClick={() => setIsMemberAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition cursor-pointer"
            title="Switch Team Member / Designation Login"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-sans truncate max-w-[110px]">
              {activeTeamMember ? activeTeamMember.name : "Admin Session"}
            </span>
            <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded font-mono uppercase">
              {activeTeamMember ? activeTeamMember.designation : "Tenant Admin"}
            </span>
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

              {/* Navigation Items */}
              <nav className="space-y-1">
                {dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = dashboardTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`tab-btn-${item.id}`}
                      onClick={() => setDashboardTab(item.id)}
                      title={item.label}
                      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${
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
              </nav>

              {/* Workspace Telemetry Panel with AI Sparkline */}
              {!isSidebarCollapsed && (
                <div className="mx-1 pt-2">
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
            {dashboardNavItems.map((item) => {
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
              {renderDashboardContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <SubscriptionManagement 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
        activeTenant={activeTenantObj} 
      />
      <PaymentSuccessModal 
        isOpen={isPaymentSuccessOpen}
        onClose={() => {
           setIsPaymentSuccessOpen(false);
           setIsSubscriptionModalOpen(false);
           fetchTenants();
        }}
      />

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
                      <option value="NPR">NPR (रू)</option>
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
        tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
        tenantName={activeTenantName}
        currentMember={activeTeamMember}
        onLoginSuccess={(member) => handleSetActiveMember(member)}
        onLogoutToGuest={() => handleSetActiveMember(null)}
      />

      {/* AI Telemetry, BYOK & Token Billing Modal */}
      <AiTelemetryModal
        isOpen={isAiTelemetryOpen}
        onClose={() => setIsAiTelemetryOpen(false)}
        tenantId={user.role === 'super_admin' ? selectedTenantId : user.tenantId}
        tenantName={activeTenantName}
        tenantPlan={activeTenantObj?.plan || "Growth"}
        isSuperAdmin={user.role === 'super_admin'}
      />
    </div>
  );
}

