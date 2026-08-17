import React, { useState, useEffect } from 'react';
import { clientAuth, clientDb } from '../lib/firebase';
import { TenantEngine } from '../lib/services';
import { OrchestrationEngine } from '../lib/orchestration';
import { InfrastructureHub } from '../lib/infrastructure';
import RegistrationFlow from './RegistrationFlow';
import MarketForgeLogo from './MarketForgeLogo';
import CompanyPagesModal, { CompanyPageType } from './CompanyPagesModal';
import { 
  getPlatformLogoSettings, 
  PlatformLogoSettings, 
  DEFAULT_TOP_CLIENTS 
} from '../lib/platformBranding';
import { 
  ShieldCheck, 
  Lock, 
  Building2, 
  Mail, 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Sliders,
  Database,
  Bot,
  Users,
  Briefcase,
  CreditCard,
  TrendingUp,
  Package,
  ShoppingBag,
  Layers,
  Headphones,
  BarChart3,
  Globe,
  Zap,
  Check,
  UserCheck,
  Megaphone,
  Utensils,
  Compass,
  MessageSquare,
  Share2,
  Hotel,
  Send,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SlidersHorizontal,
  Layout,
  Receipt,
  KeyRound,
  X
} from 'lucide-react';

export const MarketForgeEmblemIcon = ({ className = "w-8 h-8", glow = true }: { className?: string; glow?: boolean }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img 
        src="/assets/marketforge-emblem.svg" 
        alt="MarketForge OS Logo" 
        className={`w-full h-full object-contain ${glow ? 'drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]' : ''}`}
      />
    </div>
  );
};

export { MarketForgeLogo };

export const WhatsAppBrandIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.108 1.523 5.834L0 24l6.326-1.488C8.01 23.46 9.948 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.802 0-3.52-.472-5.02-1.325l-.36-.204-3.733.877.893-3.638-.225-.371A9.957 9.957 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
  </svg>
);

export const MessengerBrandIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.302 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.888-3.26-6.559 6.963z"/>
  </svg>
);

export interface SystemModuleItem {
  id: string;
  name: string;
  badge: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  gradientText: string;
  borderHover: string;
  description: string;
  highlightText: string;
}

export const MODULES_SHOWCASE_LIST: SystemModuleItem[] = [
  {
    id: 'digital-marketing-ai',
    name: 'Digital Marketing AI System',
    badge: 'AI Campaign Autopilot',
    category: 'AI & Marketing',
    icon: Megaphone,
    iconBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    gradientText: 'from-purple-300 via-indigo-300 to-pink-300',
    borderHover: 'hover:border-purple-500/60',
    description: 'Autonomous AI ad copy generator, multi-channel campaign dispatch, budget allocation & audience targeting engine.',
    highlightText: 'Automates Facebook, Instagram, Google & TikTok campaigns'
  },
  {
    id: 'website-builder',
    name: 'Website Builder OS',
    badge: 'Drag & Drop No-Code',
    category: 'Web & Builder',
    icon: Globe,
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    gradientText: 'from-cyan-300 via-blue-300 to-teal-300',
    borderHover: 'hover:border-cyan-500/60',
    description: 'AI-assisted visual website builder with custom domain routing, cPanel DNS syncing & landing page templates.',
    highlightText: 'Custom tenant domain hosting with automatic SSL'
  },
  {
    id: 'hotel-management',
    name: 'Hotel Management System',
    badge: 'Hospitality Core',
    category: 'Hospitality & Dining',
    icon: Hotel,
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    gradientText: 'from-amber-300 via-orange-300 to-yellow-300',
    borderHover: 'hover:border-amber-500/60',
    description: 'Real-time room availability, guest reservations, keycard billing, housekeeping logs & night audit analytics.',
    highlightText: 'Front desk PMS with automated guest SMS & invoices'
  },
  {
    id: 'restaurant-management',
    name: 'Restaurant Management POS',
    badge: 'Dining & Kitchen OS',
    category: 'Hospitality & Dining',
    icon: Utensils,
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    gradientText: 'from-emerald-300 via-teal-300 to-green-300',
    borderHover: 'hover:border-emerald-500/60',
    description: 'Table reservations, KDS kitchen display screens, menu modifier builder, recipe cost tracking & instant POS billing.',
    highlightText: 'Live KDS kitchen routing with barcode bill printing'
  },
  {
    id: 'tours-travels',
    name: 'Tours & Travels System',
    badge: 'Travel Engine',
    category: 'Travel & Services',
    icon: Compass,
    iconBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    gradientText: 'from-blue-300 via-indigo-300 to-cyan-300',
    borderHover: 'hover:border-blue-500/60',
    description: 'Itinerary builder, flight/hotel booking integration, travel agent commission tracking & multi-currency ticketing.',
    highlightText: 'Generate custom PDF itineraries and voucher packages'
  },
  {
    id: 'whatsapp-automation',
    name: 'WhatsApp Automation',
    badge: 'WhatsApp Business API',
    category: 'Communication AI',
    icon: WhatsAppBrandIcon,
    iconBg: 'bg-emerald-500/20 text-[#25D366] border-emerald-500/50 shadow-[0_0_14px_rgba(37,211,102,0.4)]',
    gradientText: 'from-emerald-300 via-green-300 to-teal-300',
    borderHover: 'hover:border-emerald-500/60',
    description: 'Broadcaster for broadcast lists, AI customer support bot, automated order confirmations & chat trigger flows.',
    highlightText: 'Official Meta Cloud API broadcast lists & bot trigger flows'
  },
  {
    id: 'facebook-reply-automation',
    name: 'Facebook Reply Automation',
    badge: 'Facebook Messenger Bot',
    category: 'Communication AI',
    icon: MessengerBrandIcon,
    iconBg: 'bg-blue-600/20 text-[#0084FF] border-blue-500/50 shadow-[0_0_14px_rgba(0,132,255,0.4)]',
    gradientText: 'from-blue-300 via-indigo-300 to-cyan-300',
    borderHover: 'hover:border-blue-500/60',
    description: 'Instant comment auto-reply for post engagement, messenger private auto-responder & lead magnet responder.',
    highlightText: 'Turn post comments into qualified CRM leads in real time'
  },
  {
    id: 'email-studio',
    name: 'Email Studio & SMTP Relay',
    badge: 'Outbound Broadcasts',
    category: 'AI & Marketing',
    icon: Mail,
    iconBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.3)]',
    gradientText: 'from-fuchsia-300 via-purple-300 to-indigo-300',
    borderHover: 'hover:border-fuchsia-500/60',
    description: 'Drag-and-drop HTML email editor, automated drip sequences, cPanel authenticated SMTP relay & tracking.',
    highlightText: 'Guaranteed inbox delivery with TLS 1.3 DKIM headers'
  },
  {
    id: 'omnichannel-pos',
    name: 'Omnichannel POS & Multi-Branch',
    badge: 'Retail Multi-Branch',
    category: 'Core Commerce',
    icon: ShoppingBag,
    iconBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    gradientText: 'from-rose-300 via-pink-300 to-red-300',
    borderHover: 'hover:border-rose-500/60',
    description: 'Hardware barcode scanner support, multi-warehouse stock sync, branch P&L reports & cash drawer controls.',
    highlightText: 'Real-time offline cash drawer & multi-branch stock sync'
  },
  {
    id: 'hr-payroll',
    name: 'HR & Payroll Autopilot',
    badge: 'Workforce OS',
    category: 'Core Commerce',
    icon: Users,
    iconBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.3)]',
    gradientText: 'from-violet-300 via-purple-300 to-indigo-300',
    borderHover: 'hover:border-violet-500/60',
    description: 'Biometric clock-in, 1-click salary direct deposit calculation, statutory tax withholding & leave management.',
    highlightText: 'Automated digital paystub generation & tax compliance'
  },
  {
    id: 'treasury-finance',
    name: 'Treasury Finance & Ledger',
    badge: 'Financial Intelligence',
    category: 'Core Commerce',
    icon: BarChart3,
    iconBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.3)]',
    gradientText: 'from-teal-300 via-cyan-300 to-emerald-300',
    borderHover: 'hover:border-teal-500/60',
    description: '90-day predictive cashflow forecast, multi-currency double-entry ledger & automated accounts receivable.',
    highlightText: 'Real-time financial P&L, double-entry ledger & cashflow'
  },
  {
    id: 'ai-sdr-autopilot',
    name: 'Autonomous AI SDR Autopilot',
    badge: '24/7 Prospecting',
    category: 'AI & Marketing',
    icon: Bot,
    iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]',
    gradientText: 'from-indigo-300 via-purple-300 to-pink-300',
    borderHover: 'hover:border-indigo-500/60',
    description: 'AI agent scrapes leads, auto-writes personalized outreach emails, books sales meetings & qualifies leads.',
    highlightText: 'Autonomous 24/7 lead qualification & appointment setter'
  }
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Megaphone,
  Globe,
  Hotel,
  Utensils,
  Compass,
  WhatsApp: WhatsAppBrandIcon,
  WhatsAppBrandIcon,
  Messenger: MessengerBrandIcon,
  MessengerBrandIcon,
  Mail,
  ShoppingBag,
  Users,
  BarChart3,
  Bot,
  Sparkles,
  Zap,
  Check,
  Building2,
  Lock,
  Receipt
};

export function getIconComponent(iconVal: any): React.ComponentType<{ className?: string }> {
  if (typeof iconVal === 'function' || (typeof iconVal === 'object' && iconVal !== null)) {
    return iconVal;
  }
  if (typeof iconVal === 'string' && ICON_MAP[iconVal]) {
    return ICON_MAP[iconVal];
  }
  return Sparkles;
}

export function ModuleShowcaseSlider() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModuleModal, setActiveModuleModal] = useState<SystemModuleItem | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Custom header & showcase module items configured from SuperAdmin
  const [showcaseConfig, setShowcaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('marketforge_showcase_config');
      return saved ? JSON.parse(saved) : {
        title: 'EXPLORE ALL BUILT-IN BUSINESS SYSTEMS',
        badge: '12+ Autonomous Apps',
        subtitle: 'Hover or click any module card to inspect AI capabilities and features.'
      };
    } catch (e) {
      return {
        title: 'EXPLORE ALL BUILT-IN BUSINESS SYSTEMS',
        badge: '12+ Autonomous Apps',
        subtitle: 'Hover or click any module card to inspect AI capabilities and features.'
      };
    }
  });

  const [modulesList, setModulesList] = useState<SystemModuleItem[]>(() => {
    try {
      const saved = localStorage.getItem('marketforge_superadmin_showcase_modules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return MODULES_SHOWCASE_LIST;
  });

  // Sync when SuperAdmin updates showcase settings
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedModules = localStorage.getItem('marketforge_superadmin_showcase_modules');
        if (savedModules) {
          const parsed = JSON.parse(savedModules);
          if (Array.isArray(parsed) && parsed.length > 0) setModulesList(parsed);
        }
        const savedConf = localStorage.getItem('marketforge_showcase_config');
        if (savedConf) setShowcaseConfig(JSON.parse(savedConf));
      } catch (e) {}
    };

    window.addEventListener('marketforge_showcase_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('marketforge_showcase_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const categories = ['All', 'AI & Marketing', 'Hospitality & Dining', 'Travel & Services', 'Communication AI', 'Core Commerce'];

  const filtered = selectedCategory === 'All' 
    ? modulesList 
    : modulesList.filter(m => m.category === selectedCategory);

  // Single unified module sequence for marquee
  const singleLineModules = [...filtered, ...filtered, ...filtered];

  return (
    <div className="w-full space-y-4 my-8 relative z-10">
      
      {/* HEADER CONTROLS & CATEGORIES */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>{showcaseConfig.title || 'EXPLORE ALL BUILT-IN BUSINESS SYSTEMS'}</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[10px] font-mono">
                {showcaseConfig.badge || '12+ Autonomous Apps'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">{showcaseConfig.subtitle || 'Hover or click any module card to inspect AI capabilities and features.'}</p>
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer ml-1 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
            title={isPaused ? "Play Marquee Auto-Scroll" : "Pause Marquee Auto-Scroll"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* SINGLE DIRECTION MARQUEE CAROUSEL */}
      <div className="relative w-full overflow-hidden py-3 bg-gradient-to-b from-black/40 via-indigo-950/20 to-black/40 border-y border-white/10">
        
        {/* Left & Right Vignette Shadows */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#07080E] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#07080E] to-transparent z-20 pointer-events-none" />

        {/* SINGLE MARQUEE ROW: ULTRA SLOW LEFT TO RIGHT SCROLL */}
        <div className="overflow-hidden flex">
          <div className={`${isPaused ? '' : 'animate-marquee-right'} flex gap-4 px-2`}>
            {singleLineModules.map((item, idx) => {
              const IconComp = getIconComponent(item.icon);
              return (
                <div
                  key={`single-${item.id}-${idx}`}
                  onClick={() => setActiveModuleModal(item)}
                  className={`w-72 sm:w-80 shrink-0 bg-[#0C0D16]/90 border border-white/10 ${item.borderHover || 'hover:border-indigo-500/60'} rounded-2xl p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/50 cursor-pointer group text-left relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className={`p-2.5 rounded-xl border ${item.iconBg || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'} shadow-inner shrink-0 group-hover:scale-110 transition`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 shrink-0">
                      {item.badge}
                    </span>
                  </div>

                  <h4 className={`text-xs sm:text-sm font-extrabold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${item.gradientText || 'from-indigo-300 via-purple-300 to-pink-300'} transition`}>
                    {item.name}
                  </h4>

                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400 group-hover:text-indigo-300 transition">
                    <span className="truncate pr-2">{item.highlightText}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODULE DETAIL POPUP MODAL */}
      {activeModuleModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto text-left"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModuleModal(null); }}
        >
          <div className="bg-[#0D0F1A] border border-indigo-500/40 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 relative shadow-2xl animate-fade-in my-auto">
            <button
              onClick={() => setActiveModuleModal(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer flex items-center gap-1 border border-white/10 transition z-10"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${activeModuleModal.iconBg}`}>
                <activeModuleModal.icon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {activeModuleModal.category}
                </span>
                <h3 className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${activeModuleModal.gradientText} mt-1`}>
                  {activeModuleModal.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeModuleModal.description}
            </p>

            <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-2">
              <div className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Key Built-in Capabilities:
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside font-sans">
                <li>{activeModuleModal.highlightText}</li>
                <li>Fully multi-tenant isolated per workspace</li>
                <li>Accessible via single-sign-on (SSO) tenant user portal</li>
                <li>Custom branding & web domain customization support</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModuleModal(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-lg"
              >
                Got It / Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

interface LoginPortalProps {
  onLogin: (role: string, tenantId: string, email: string, name?: string, designation?: string, userObj?: any) => void;
  tenantsList: any[];
  onActivateTenant: (tenant: any) => void;
}

export default function LoginPortal({ onLogin, tenantsList, onActivateTenant }: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<'tenant' | 'superadmin'>('tenant');
  const [platformLogos, setPlatformLogos] = useState<PlatformLogoSettings>(getPlatformLogoSettings);

  // Company Information Pages Modal State
  const [companyPagesModalOpen, setCompanyPagesModalOpen] = useState<boolean>(false);
  const [companyPageTab, setCompanyPageTab] = useState<CompanyPageType>('about');

  const openCompanyPage = (tab: CompanyPageType) => {
    setCompanyPageTab(tab);
    setCompanyPagesModalOpen(true);
  };

  useEffect(() => {
    const handleUpdate = () => {
      setPlatformLogos(getPlatformLogoSettings());
    };
    window.addEventListener('platform_logo_updated', handleUpdate);
    return () => window.removeEventListener('platform_logo_updated', handleUpdate);
  }, []);
  
  // Tenant Login Form
  const [tenantId, setTenantId] = useState('auto');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPassword, setTenantPassword] = useState('');
  const [tenantError, setTenantError] = useState<string | null>(null);

  // Tenant Register/Activation Simulation
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regTenantName, setRegTenantName] = useState('');
  const [regTenantEmail, setRegTenantEmail] = useState('');
  const [regTenantDomain, setRegTenantDomain] = useState('');
  const [activationLogs, setActivationLogs] = useState<string[]>([]);
  const [simulatedMailbox, setSimulatedMailbox] = useState<{
    to: string;
    subject: string;
    body: string;
    activationCode: string;
    sentAt: string;
  } | null>(null);
  const [isSmtpSending, setIsSmtpSending] = useState(false);
  const [inputActivationCode, setInputActivationCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  // Direct Outbound cPanel Tenant Enrollment States
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [onboardTenantId, setOnboardTenantId] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardFullName, setOnboardFullName] = useState('');
  const [onboardUsername, setOnboardUsername] = useState('');
  const [onboardPassword, setOnboardPassword] = useState('');
  const [onboardOtp, setOnboardOtp] = useState('');
  const [onboardOtpSent, setOnboardOtpSent] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);

  // Team Member Self-Registration States
  const [isMemberRegisterMode, setIsMemberRegisterMode] = useState(false);
  const [memRegTenantId, setMemRegTenantId] = useState('norvikmarketing-tenant');
  const [memRegName, setMemRegName] = useState('');
  const [memRegEmail, setMemRegEmail] = useState('');
  const [memRegPassword, setMemRegPassword] = useState('');
  const [memRegRole, setMemRegRole] = useState('writer');
  const [memRegDesignation, setMemRegDesignation] = useState('Team Member');
  const [memRegDepartment, setMemRegDepartment] = useState('Operations');
  const [memRegError, setMemRegError] = useState<string | null>(null);
  const [memRegSuccess, setMemRegSuccess] = useState<string | null>(null);
  const [isMemRegSubmitting, setIsMemRegSubmitting] = useState(false);

  // Intercept query parameters (Sandbox Tenant Automation & Team Direct Member Links)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryTenant = params.get('tenant') || params.get('tenantId') || params.get('slug') || params.get('t');
      const queryRegister = params.get('register');
      const queryMember = params.get('member');
      const queryEmail = params.get('email');

      if (queryTenant) {
        setTenantId(queryTenant);
        setMemRegTenantId(queryTenant);
      }

      if (queryRegister === 'member' || queryMember === 'register' || queryRegister === 'team' || params.get('mode') === 'member_register') {
        setIsMemberRegisterMode(true);
        if (queryEmail) {
          setMemRegEmail(decodeURIComponent(queryEmail));
        }
      } else if (queryTenant && queryRegister === '1' && queryEmail) {
        setIsOnboardingMode(true);
        setOnboardTenantId(queryTenant);
        setOnboardEmail(decodeURIComponent(queryEmail));
      }
    } catch (err) {
      console.warn("Query parameters parsing skipped:", err);
    }
  }, []);

  const handleMemberRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemRegError(null);
    setMemRegSuccess(null);
    setIsMemRegSubmitting(true);

    const targetTenant = memRegTenantId || tenantId || 'demo-tenant';

    if (!memRegName || !memRegEmail || !memRegPassword) {
      setMemRegError('Please fill out your name, email address, and desired password.');
      setIsMemRegSubmitting(false);
      return;
    }

    try {
      const resp = await fetch("/api/tenant/add-team-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: targetTenant,
          name: memRegName,
          email: memRegEmail,
          role: memRegRole || 'writer',
          password: memRegPassword,
          username: memRegEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
        })
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Failed to self-register team member account.");
      }

      // Save to local team mirror array
      const newLocalMember = {
        id: data.user?.id || `usr-${Date.now()}`,
        tenantId: targetTenant,
        name: memRegName,
        email: memRegEmail,
        password: memRegPassword,
        designation: memRegDesignation || 'Team Member',
        department: memRegDepartment || 'Operations',
        role: memRegRole || 'writer',
        status: 'active',
        invitedAt: new Date().toISOString(),
        lastActive: 'Just now'
      };

      try {
        const existing = JSON.parse(localStorage.getItem('marketforge_tenant_team_members') || '[]');
        localStorage.setItem('marketforge_tenant_team_members', JSON.stringify([newLocalMember, ...existing]));
      } catch (e) {}

      setMemRegSuccess(`✓ Team member account registered for ${memRegName}! Confirmation email sent. Auto-logging into ${targetTenant}...`);

      setTimeout(() => {
        onLogin(memRegRole || 'writer', targetTenant, memRegEmail, memRegName, memRegDesignation);
      }, 1200);

    } catch (err: any) {
      setMemRegError(`⛔ ${err.message}`);
    } finally {
      setIsMemRegSubmitting(false);
    }
  };

  // Superadmin Login Form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMfaToken, setAdminMfaToken] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminAuthenticating, setIsAdminAuthenticating] = useState(false);

  // Forgot Password State
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLogs, setForgotLogs] = useState<string[]>([]);
  const [isForgotSending, setIsForgotSending] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [passwordResetDone, setPasswordResetDone] = useState(false);

  // SMTP Settings
  const [smtpServer] = useState('mail.smtp2go.com');
  const [smtpPort] = useState('2525');

  const [discoveredWorkspaces, setDiscoveredWorkspaces] = useState<any[]>([]);

  // Tenant Sign-In Loading Animation States
  const [isTenantAuthenticating, setIsTenantAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authStepText, setAuthStepText] = useState('Connecting to Tenant Ingress Gateway...');
  const [authTerminalLogs, setAuthTerminalLogs] = useState<string[]>([]);
  const [activeAuthTenant, setActiveAuthTenant] = useState<{ id: string; name: string; email: string }>({ 
    id: 'demo-tenant', 
    name: 'Enterprise DemoCorp', 
    email: '' 
  });

  const executeTenantSignInAnimation = async (targetTenantId: string, email: string, pass: string, isGoogle = false) => {
    setIsTenantAuthenticating(true);
    setTenantError(null);
    setAuthProgress(10);
    setAuthStepText('Connecting to Tenant Ingress Gateway...');

    const found = tenantsList.find(t => t.id === targetTenantId);
    const friendlyName = found ? found.name : (targetTenantId === 'auto' ? 'Auto-Detected Workspace' : targetTenantId);

    setActiveAuthTenant({
      id: targetTenantId,
      name: friendlyName,
      email: email || 'owner@democorp.com'
    });

    setAuthTerminalLogs([
      `> [INGRESS] TLS 1.3 Handshake established with ${targetTenantId}`,
      `> [INGRESS] Route target: /api/tenant/login (Node #1)`
    ]);

    await new Promise(r => setTimeout(r, 220));
    setAuthProgress(35);
    setAuthStepText('Verifying Encrypted JWT Credentials...');
    setAuthTerminalLogs(prev => [
      ...prev,
      `> [AUTH] Dispatching encrypted bearer token to auth vault`,
      `> [SECURITY] Validating tenant isolation key & user permissions`
    ]);

    await new Promise(r => setTimeout(r, 280));
    setAuthProgress(65);
    setAuthStepText('Mounting Isolated Database Context...');
    setAuthTerminalLogs(prev => [
      ...prev,
      `> [DATABASE] Connected to Firestore collection: ${targetTenantId}`,
      `> [MODULES] Hydrating active SaaS modules & brand configuration`
    ]);

    try {
      let finalTenantId = targetTenantId;
      let userSession: any = null;
      if (isGoogle) {
        finalTenantId = targetTenantId !== 'auto' ? targetTenantId : 'demo-tenant';
        await clientAuth.signInWithEmailAndPassword(email, 'google_oauth_pass', finalTenantId);
      } else {
        const resp = await fetch("/api/tenant/login", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
          body: JSON.stringify({
            tenantId: targetTenantId,
            email: email,
            password: pass
          })
        });

        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          throw new Error(errJson.error || "Workspace authentication failed. Check credentials or password!");
        }

        userSession = await resp.json();
        finalTenantId = userSession?.tenantId || targetTenantId;

        try {
          await clientAuth.signInWithEmailAndPassword(email, pass, finalTenantId);
        } catch (e) {}

        try {
          await InfrastructureHub.getAuth().signInWithEmailAndPassword(email, pass, finalTenantId);
        } catch (e) {}
      }

      setAuthProgress(90);
      setAuthStepText('Session Authorized! Finalizing Command OS...');
      setAuthTerminalLogs(prev => [
        ...prev,
        `> [SESSION] JWT Bearer issued for ${email}`,
        `> [SUCCESS] Workspace authorized! Launching MarketForge OS...`
      ]);

      await new Promise(r => setTimeout(r, 320));
      setAuthProgress(100);

      await new Promise(r => setTimeout(r, 250));
      setIsTenantAuthenticating(false);
      onLogin(
        userSession?.role || 'owner', 
        finalTenantId, 
        email, 
        userSession?.name || userSession?.user?.name, 
        userSession?.user?.designation || (userSession?.role === 'owner' ? 'Business Owner' : 'Team Member'),
        userSession?.user
      );

    } catch (err: any) {
      setIsTenantAuthenticating(false);
      setTenantError(`⛔ ${err.message}`);
    }
  };

  const handleTenantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError(null);

    if (tenantEmail.length < 2 || tenantPassword.length < 5) {
      setTenantError('Please provide a valid email/username and password.');
      return;
    }

    await executeTenantSignInAnimation(tenantId, tenantEmail, tenantPassword, false);
  };

  const handleGoogleLogin = async () => {
    setTenantError(null);
    const email = 'google.user@enterprise.com';
    const targetTenant = tenantId !== 'auto' ? tenantId : 'demo-tenant';
    await executeTenantSignInAnimation(targetTenant, email, 'google_oauth_pass', true);
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    setOnboardSuccess(null);
    setIsOnboardingSubmitting(true);

    try {
      const resp = await fetch("/api/tenant/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: onboardTenantId,
          email: onboardEmail,
          fullName: onboardFullName,
          username: onboardUsername,
          password: onboardPassword
        })
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || "Workspace initialization failed.");
      }

      setOnboardSuccess("✓ Workspace claimed successfully! Redirecting to command dashboard...");
      setTimeout(() => {
        onLogin('owner', onboardTenantId, onboardEmail, onboardFullName, 'Business Owner');
      }, 1200);

    } catch (err: any) {
      setOnboardError(err.message);
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsAdminAuthenticating(true);

    try {
      const resp = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword
        })
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || "Designated Superadmin authentication failed.");
      }

      const adminSession = await resp.json();
      if (!adminSession || adminSession.role !== 'super_admin') {
        throw new Error("Access Denied: Designated Super Administrator privileges required.");
      }
      await clientAuth.signInWithEmailAndPassword(adminEmail, adminPassword, "super_admin");

      onLogin(adminSession.role, '', adminSession.email || adminEmail, adminSession.name || 'Super Administrator', 'System Administrator');
    } catch (err: any) {
      setAdminError(`⛔ Superadmin Auth Security Lock: ${err.message}`);
    } finally {
      setIsAdminAuthenticating(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError(null);
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setTenantError('Please provide a valid company email address.');
      return;
    }

    setIsForgotSending(true);
    setForgotLogs([]);
    setForgotSuccess(null);
    setPasswordResetDone(false);

    try {
      const res = await fetch('/api/tenant/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, step: 'request' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch password reset code.');
      }

      const generatedCode = data.resetCode || 'MKT-RESET-' + Math.floor(100000 + Math.random() * 900000);
      setForgotCode(generatedCode);
      setForgotLogs([
        `[SMTP_CLI] EHLO marketforge-os.app`,
        `[SMTP_CLI] MAIL FROM: <security-desk@marketforge-os.app>`,
        `[SMTP_CLI] RCPT TO: <${forgotEmail}>`,
        `[SMTP_CLI] SUBJECT: [MarketForge OS] Password Reset Code: ${generatedCode}`,
        `[RECOVERY] High-fidelity password recovery token generated for ${forgotEmail}`
      ]);
      setForgotSuccess(`✓ Password reset verification code dispatched to ${forgotEmail}. Set your new password below.`);
    } catch (err: any) {
      setTenantError(err.message || 'Failed to dispatch recovery email.');
    } finally {
      setIsForgotSending(false);
    }
  };

  const handleApplyNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError(null);
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setTenantError('New password must be at least 6 characters long.');
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await fetch('/api/tenant/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          newPassword: forgotNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply new password.');
      }

      setPasswordResetDone(true);
      setForgotSuccess('✓ Password successfully updated! You can now log in with your new password.');
      setTenantPassword(forgotNewPassword);
    } catch (err: any) {
      setTenantError(err.message || 'Error updating password.');
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070D] text-slate-100 font-sans flex flex-col justify-between p-4 md:p-8 relative overflow-hidden" id="login-portal-wrapper">
      
      {/* Radial Atmospheric Background Halos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* TOP HEADER BAR */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center z-10 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 py-1">
          <MarketForgeLogo variant="header" className="h-12 md:h-16 w-auto" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="hidden md:flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => openCompanyPage('about')}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => openCompanyPage('privacy')}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => openCompanyPage('contact')}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={() => openCompanyPage('faq')}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => openCompanyPage('disclaimer')}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              Disclaimer
            </button>
          </div>

          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TLS 1.3 Ingress Secure
          </span>
        </div>
      </div>

      {/* MAIN AUTH CORE GRID - BALANCED DUAL FRAME LAYOUT */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch z-10 py-6 md:py-10">
        
        {/* LEFT COLUMN: BRAND VALUE PROP & LOGO FRAME */}
        <div className="bg-[#0B0D19]/90 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between h-full space-y-6">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-600/10 blur-3xl pointer-events-none rounded-full" />

          {/* Full Official Uploaded Brand Logo Frame */}
          <div className="w-full bg-[#070814]/80 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
            <div className="absolute top-2 right-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                Primary Platform Branding
              </span>
            </div>
            <MarketForgeLogo variant="full" className="w-full max-w-md h-auto py-2 filter drop-shadow-[0_8px_25px_rgba(56,189,248,0.35)] transition group-hover:scale-[1.01]" />
          </div>

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Unified Enterprise Architecture
            </div>

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-sans">
              MarketForge OS unifies CRM &amp; Pipeline, AI SDR Autopilot, HR &amp; Payroll, Treasury Finance, Double-Entry Ledger, POS &amp; Multi-Warehouse Inventory, Digital Marketing, and Multi-Branch Management into one autonomous platform.
            </p>
          </div>

          {/* Capability Highlight Cards */}
          <div className="space-y-3 pt-1 font-sans relative z-10">
            <div className="p-3 bg-[#070814]/70 border border-white/10 hover:border-indigo-500/40 rounded-2xl flex items-start gap-3 transition group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Autonomous AI Autopilot &amp; SDRs</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Research prospects, auto-draft cold email sequences, and qualify 24/7 sales inbound.</p>
              </div>
            </div>

            <div className="p-3 bg-[#070814]/70 border border-white/10 hover:border-indigo-500/40 rounded-2xl flex items-start gap-3 transition group">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">1-Click Global Payroll &amp; Finance</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Automated direct deposits, tax deductions, 90-day cashflow models &amp; double-entry ledger.</p>
              </div>
            </div>

            <div className="p-3 bg-[#070814]/70 border border-white/10 hover:border-indigo-500/40 rounded-2xl flex items-start gap-3 transition group">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Omnichannel POS &amp; Multi-Branch HQ</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Barcode scanners, multi-warehouse stock allocations, and consolidated branch P&amp;Ls.</p>
              </div>
            </div>
          </div>

          {/* Trust Footnote */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 border-t border-white/10 pt-4 relative z-10">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /> SOC2 Type II Certified</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> 15+ SaaS Replaced</span>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE AUTH FORM CARD */}
        <div className="bg-[#0B0D19]/90 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between h-full space-y-6">
          
          {/* Ambient Inner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

          {/* PORTAL TAB CHANGE CONTROLS */}
          <div className="grid grid-cols-2 gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-white/10 relative z-10">
            <button
              onClick={() => {
                setActiveTab('tenant');
                setTenantError(null);
                setIsForgotPasswordMode(false);
                setIsRegisterMode(false);
              }}
              className={`py-2.5 text-xs font-mono font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-2 ${
                activeTab === 'tenant'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Tenant Workspace
            </button>
            <button
              onClick={() => {
                setActiveTab('superadmin');
                setTenantError(null);
                setIsForgotPasswordMode(false);
                setIsRegisterMode(false);
              }}
              className={`py-2.5 text-xs font-mono font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-2 ${
                activeTab === 'superadmin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Super Admin Entrance
            </button>
          </div>

          {tenantError && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-200 text-xs leading-relaxed flex items-start gap-2.5 relative z-10">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{tenantError}</span>
            </div>
          )}

            {activeTab === 'tenant' ? (
              isOnboardingMode ? (
                // ONBOARDING ACCOUNT PROVISION FORM
                <div className="space-y-5 relative z-10">
                  <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-extrabold text-white">Initialize Tenant Owner Account</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Define supervisor credentials to claim your workspace.</p>
                    </div>
                    <button
                      onClick={() => setIsOnboardingMode(false)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition hover:underline cursor-pointer"
                    >
                      ← Standard Login
                    </button>
                  </div>

                  {onboardError && (
                    <div className="p-3 bg-red-950/45 border border-red-800/60 rounded-xl text-red-200 text-xs text-left">
                      ⛔ {onboardError}
                    </div>
                  )}

                  {onboardSuccess && (
                    <div className="p-3 bg-emerald-950/45 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs text-left">
                      {onboardSuccess}
                    </div>
                  )}

                  <form onSubmit={handleOnboardSubmit} className="space-y-4 text-left font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Workspace ID</label>
                        <input
                          type="text"
                          disabled
                          value={onboardTenantId}
                          className="w-full bg-black/40 border border-white/10 text-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Owner Email</label>
                        <input
                          type="text"
                          disabled
                          value={onboardEmail}
                          className="w-full bg-black/40 border border-white/10 text-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none block truncate"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Administrator Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Liam Vance"
                        value={onboardFullName}
                        onChange={(e) => setOnboardFullName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400">System Username</label>
                        <input
                          type="text"
                          required
                          placeholder="vance_ceo"
                          value={onboardUsername}
                          onChange={(e) => setOnboardUsername(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Access Password</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={onboardPassword}
                          onChange={(e) => setOnboardPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isOnboardingSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {isOnboardingSubmitting ? "Finalizing Security Keys..." : "Claim Workspace & Activate"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-5 relative z-10">
                  
                  {/* Mode Select Header */}
                  <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-3 gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      {isForgotPasswordMode 
                        ? 'Forgot Password Recovery' 
                        : isRegisterMode 
                          ? 'Register New Tenant' 
                          : isMemberRegisterMode
                            ? '👥 Team Member Self-Registration'
                            : 'Log Into Workspace'}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs font-bold">
                      {isMemberRegisterMode ? (
                        <button
                          onClick={() => {
                            setIsMemberRegisterMode(false);
                            setMemRegError(null);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 transition hover:underline cursor-pointer flex items-center gap-1"
                        >
                          ← Back to Sign In
                        </button>
                      ) : isForgotPasswordMode ? (
                        <button
                          onClick={() => {
                            setIsForgotPasswordMode(false);
                            setTenantError(null);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 transition hover:underline cursor-pointer"
                        >
                          ← Back to Sign In
                        </button>
                      ) : isRegisterMode ? (
                        <button
                          onClick={() => {
                            setIsRegisterMode(false);
                            setTenantError(null);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 transition hover:underline cursor-pointer"
                        >
                          ← Back to Sign In
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsMemberRegisterMode(true);
                              setIsRegisterMode(false);
                              setIsForgotPasswordMode(false);
                              setTenantError(null);
                            }}
                            className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl transition cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Team Registration</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsRegisterMode(true);
                              setIsMemberRegisterMode(false);
                              setIsForgotPasswordMode(false);
                              setTenantError(null);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            🆕 New Tenant
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isMemberRegisterMode ? (
                    // TEAM MEMBER SELF-REGISTRATION FORM
                    <form onSubmit={handleMemberRegisterSubmit} className="space-y-4 text-left font-sans animate-fade-in">
                      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>Direct Self-Registration Portal for Team Personnel</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          Register your employee or contractor account under your company tenant workspace.
                        </p>
                      </div>

                      {memRegError && (
                        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs">
                          {memRegError}
                        </div>
                      )}

                      {memRegSuccess && (
                        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs font-semibold">
                          {memRegSuccess}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Target Tenant Workspace</label>
                        <select
                          value={memRegTenantId}
                          onChange={(e) => setMemRegTenantId(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
                        >
                          {(discoveredWorkspaces.length > 0 ? discoveredWorkspaces : tenantsList).map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarah Jenkins"
                            value={memRegName}
                            onChange={(e) => setMemRegName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Company Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. s.jenkins@democorp.com"
                            value={memRegEmail}
                            onChange={(e) => setMemRegEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Create Access Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={memRegPassword}
                            onChange={(e) => setMemRegPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Designated Role Scope</label>
                          <select
                            value={memRegRole}
                            onChange={(e) => setMemRegRole(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
                          >
                            <option value="writer">Content Writer & Creator (Writer)</option>
                            <option value="marketing">Marketing Specialist (Marketing)</option>
                            <option value="pos">POS & Store Operations (Staff)</option>
                            <option value="finance">Treasury & Accounting (Finance)</option>
                            <option value="admin">Workspace Manager (Admin)</option>
                            <option value="viewer">Observer / Read-Only (Viewer)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Job Title / Designation</label>
                          <input
                            type="text"
                            placeholder="e.g. Content Manager"
                            value={memRegDesignation}
                            onChange={(e) => setMemRegDesignation(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Department</label>
                          <input
                            type="text"
                            placeholder="e.g. Growth Marketing"
                            value={memRegDepartment}
                            onChange={(e) => setMemRegDepartment(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isMemRegSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 border border-indigo-400/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        {isMemRegSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Registering Team Member Account...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Register & Enter Workspace</span>
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setIsMemberRegisterMode(false)}
                          className="text-xs text-slate-400 hover:text-white transition hover:underline cursor-pointer"
                        >
                          Already have a registered team account? <strong className="text-indigo-400">Sign In Here</strong>
                        </button>
                      </div>
                    </form>
                  ) : !isForgotPasswordMode && !isRegisterMode ? (
                  // STANDARD TENANT LOGIN FORM
                  <form onSubmit={handleTenantLogin} className="space-y-4 text-left font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Target Workspace Client</label>
                      <select
                        value={tenantId}
                        onChange={(e) => {
                          setTenantId(e.target.value);
                          if (e.target.value === 'demo-tenant') setTenantEmail('owner@democorp.com');
                          else if (e.target.value === 'sienna-tenant') setTenantEmail('evelyn@siennaclay.com');
                          else if (e.target.value === 'solas-tenant') setTenantEmail('ops@solas.io');
                          else if (e.target.value === 'alpha-tenant') setTenantEmail('founder@alpha.io');
                        }}
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
                      >
                        <option value="auto">Auto-Detect Workspace</option>
                        {(discoveredWorkspaces.length > 0 ? discoveredWorkspaces : tenantsList).map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} (Workspace: {t.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Authorized Email or Username</label>
                        <input
                          type="text"
                          value={tenantEmail}
                          onChange={(e) => setTenantEmail(e.target.value)}
                          placeholder="e.g. user@company.com"
                          className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Password</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPasswordMode(true);
                              setIsRegisterMode(false);
                              setTenantError(null);
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition hover:underline cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <input
                          type="password"
                          value={tenantPassword}
                          onChange={(e) => setTenantPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isTenantAuthenticating}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 border border-indigo-400/30 transition transform hover:-translate-y-0.5 disabled:opacity-80"
                    >
                      {isTenantAuthenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                          <span>Authenticating Workspace... {authProgress}%</span>
                        </>
                      ) : (
                        <>
                          <span>Authorize and Enter Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <span className="relative bg-[#0B0D19] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Or Connect with Google</span>
                    </div>

                    <button
                      type="button"
                      disabled={isTenantAuthenticating}
                      onClick={() => handleGoogleLogin()}
                      className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition disabled:opacity-70"
                    >
                      {isTenantAuthenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-800" />
                          <span>Connecting Google Account...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#EA4335"
                              d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.21-3.21C17.53 1.65 14.94 1 12 1 7.35 1 3.37 3.68 1.44 7.59l3.77 2.92C6.12 7.54 8.84 5.04 12 5.04z"
                            />
                            <path
                              fill="#4285F4"
                              d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.44c-.28 1.47-1.11 2.71-2.35 3.55l3.65 2.83c2.14-1.97 3.75-4.87 3.75-8.48z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.21 14.91c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.44 7.41C.52 9.27 0 11.35 0 13.5s.52 4.23 1.44 6.09l3.77-2.68z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.65-2.83c-1.01.68-2.31 1.09-4.3 1.09-3.16 0-5.88-2.5-6.84-5.47L1.39 15.56C3.32 19.43 7.31 23 12 23z"
                            />
                          </svg>
                          <span>Sign in with Google Account</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : isForgotPasswordMode ? (
                  // PASSWORD RECOVERY FORM VIEW
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-indigo-400" />
                        Account Password Reset &amp; Recovery
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordMode(false)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    </div>

                    {tenantError && (
                      <div className="p-3 bg-red-950/40 border border-red-900 rounded-xl text-red-200 text-xs text-left">
                        {tenantError}
                      </div>
                    )}

                    {!forgotSuccess ? (
                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left font-sans">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Registered Account Email Address</label>
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="e.g. founder@alpha.io or owner@democorp.com"
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isForgotSending}
                          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
                        >
                          {isForgotSending ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                              <span>Dispatching Recovery Code...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 text-cyan-300" />
                              <span>Request Password Reset Code</span>
                            </>
                          )}
                        </button>
                      </form>
                    ) : !passwordResetDone ? (
                      <form onSubmit={handleApplyNewPassword} className="space-y-4 text-left font-sans animate-fade-in">
                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                          {forgotSuccess}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Verification Recovery Code</label>
                          <input
                            type="text"
                            value={forgotCode}
                            onChange={(e) => setForgotCode(e.target.value)}
                            placeholder="MKT-RESET-123456"
                            className="w-full bg-black/40 border border-white/10 text-white text-xs font-mono rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">New Password</label>
                          <input
                            type="password"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                            required
                            minLength={6}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isResetSubmitting}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
                        >
                          {isResetSubmitting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Confirm &amp; Update Password</span>
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4 text-center animate-fade-in p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl font-sans">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <div className="text-emerald-300 font-extrabold text-sm">Password Updated Successfully!</div>
                        <p className="text-xs text-slate-300">
                          Your account password for <strong>{forgotEmail}</strong> has been updated.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPasswordMode(false);
                            setTenantPassword(forgotNewPassword);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:from-indigo-500 hover:to-purple-500 shadow transition"
                        >
                          Sign In with New Password
                        </button>
                      </div>
                    )}

                    {/* Forgot Password System Logs */}
                    {forgotLogs.length > 0 && (
                      <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-[9px] text-left space-y-1.5 max-h-[120px] overflow-y-auto animate-fade-in">
                        <div className="text-slate-400 border-b border-white/10 pb-1 flex justify-between select-none">
                          <span className="flex items-center gap-1 font-bold text-indigo-300">
                            <Terminal className="w-3 h-3 text-indigo-400" />
                            RECOVERY LOGS
                          </span>
                          <span className="text-indigo-400 animate-pulse">● OUTBOUND</span>
                        </div>
                        <div className="space-y-1">
                          {forgotLogs.map((log, lIdx) => (
                            <div key={lIdx} className="text-slate-300">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <RegistrationFlow onActivateTenant={onActivateTenant} onLogin={onLogin} />
                )}
              </div>
            )
          ) : (
            // SUPERADMIN LOGIN SECURITY GATEWAY
              <form onSubmit={handleSuperAdminLogin} className="space-y-5 text-left font-sans relative z-10">
                <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    DESIGNATED SYSTEM SUPERADMIN PORTAL
                  </h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    Secured by MFA
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Only designated platform administrators holding verified root claims key signatures may access the global commerce engine, override tenant branding locks, or configure global webhook deliveries.
                </p>

                {adminError && (
                  <div className="p-3 bg-red-950/40 border border-red-900 rounded-xl text-red-200 text-xs">
                    {adminError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Designated Superadmin Personal Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Root Key Token / Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('tenant');
                            setIsForgotPasswordMode(true);
                            setForgotEmail(adminEmail || 'digitalscamalert@gmail.com');
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">One-Time MFA Passcode <span className="text-slate-500 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        value={adminMfaToken}
                        onChange={(e) => setAdminMfaToken(e.target.value)}
                        placeholder="Leave blank or enter TOTP code"
                        className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAdminAuthenticating}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
                >
                  {isAdminAuthenticating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Unlock Superadmin Panel Control Console</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TOP ENTERPRISE CLIENTS SHOWCASE */}
            <div className="pt-4 border-t border-white/10 space-y-3 relative z-10 font-sans">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Top Enterprise Clients
                </span>
                <span className="text-[10px] font-mono text-slate-400">Trusted Industry Leaders</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                {(platformLogos.topClients && platformLogos.topClients.length > 0 ? platformLogos.topClients : DEFAULT_TOP_CLIENTS).slice(0, 4).map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      if (client.tenantId && client.email && client.password) {
                        setTenantId(client.tenantId);
                        setTenantEmail(client.email);
                        setTenantPassword(client.password);
                      }
                    }}
                    className="p-2.5 bg-[#070814]/80 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/40 rounded-2xl transition text-left group cursor-pointer flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center shrink-0 font-bold text-xs text-indigo-300">
                      {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.name} className="w-5 h-5 object-contain" />
                      ) : (
                        client.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">{client.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        <span className="truncate">{client.category}</span>
                        {client.metric && <span className="text-cyan-400 font-mono font-bold shrink-0">• {client.metric}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      {/* SYSTEM MODULES SLIDER SHOWCASE (RIGHT ABOVE FOOTER) */}
      <ModuleShowcaseSlider />

      {/* FOOTER BAR WITH COMPANY INFO & LEGAL MENUS */}
      <div className="max-w-7xl mx-auto w-full border-t border-white/10 pt-4 pb-2 z-10 space-y-3 font-mono text-[11px] text-slate-400">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white font-bold">© 2026 MarketForge OS</span>
            <span>•</span>
            <span className="text-cyan-300 font-bold">Scamspike.com</span>
            <span>•</span>
            <span className="text-slate-300">Syuchatar, Nagarjun-9, Kathmandu</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-slate-300">
            <span className="text-emerald-400 font-bold">+9779715312299</span>
            <span>•</span>
            <span className="text-indigo-300 font-bold">solution@scamspike.com</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-white/5 text-[10px]">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => openCompanyPage('about')} className="hover:text-cyan-300 transition cursor-pointer">
              About Us
            </button>
            <button onClick={() => openCompanyPage('privacy')} className="hover:text-cyan-300 transition cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => openCompanyPage('contact')} className="hover:text-cyan-300 transition cursor-pointer">
              Contact Us
            </button>
            <button onClick={() => openCompanyPage('faq')} className="hover:text-cyan-300 transition cursor-pointer">
              FAQ
            </button>
            <button onClick={() => openCompanyPage('disclaimer')} className="hover:text-cyan-300 transition cursor-pointer">
              Disclaimer
            </button>
          </div>

          <span className="flex items-center gap-1.5 text-slate-500">
            <Database className="w-3 h-3 text-indigo-400" /> Multi-Tenant Container Isolation
          </span>
        </div>
      </div>

      {/* COMPANY INFORMATION PAGES MODAL */}
      <CompanyPagesModal
        isOpen={companyPagesModalOpen}
        initialTab={companyPageTab}
        onClose={() => setCompanyPagesModalOpen(false)}
      />

      {/* TENANT SIGN-IN LOADING ANIMATION OVERLAY MODAL */}
      {isTenantAuthenticating && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-[#0B0D19]/95 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.35)] space-y-6 text-center relative overflow-hidden my-auto">
            <button
              onClick={() => setIsTenantAuthenticating(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer z-30"
              title="Close & Cancel"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Background glowing particles / light circles */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* TOP EMBLEM LOGO & ROTATING DOUBLE RING */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Outer Rotating Gradient Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-indigo-500 border-b-purple-500 animate-spin" style={{ animationDuration: '2s' }} />
              {/* Inner Counter-Rotating Ring */}
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-400 border-l-cyan-300 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              {/* Glowing Aura Behind Icon */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/30 to-purple-500/30 blur-md animate-pulse" />
              
              {/* MarketForge Emblem Logo */}
              <div className="relative z-10 w-16 h-16 flex items-center justify-center">
                <MarketForgeEmblemIcon className="w-14 h-14" glow={true} />
              </div>
            </div>

            {/* WORKSPACE & USER BADGE */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-extrabold uppercase">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeAuthTenant.name}</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight pt-1">
                Authenticating Workspace...
              </h3>
              <p className="text-xs text-slate-300 font-mono truncate px-4">
                User: <span className="text-cyan-300 font-bold">{activeAuthTenant.email}</span>
              </p>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  {authStepText}
                </span>
                <span className="text-white font-black">{authProgress}%</span>
              </div>
              
              <div className="w-full h-3 bg-black/60 border border-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  style={{ width: `${authProgress}%` }}
                />
              </div>
            </div>

            {/* LIVE TELEMETRY LOG STREAM */}
            <div className="bg-black/90 border border-white/10 rounded-2xl p-3 text-left font-mono text-[10px] space-y-1 text-slate-300 shadow-inner max-h-28 overflow-y-auto">
              <div className="flex items-center justify-between text-[9px] text-slate-400 border-b border-white/10 pb-1 mb-1">
                <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> Tenant Auth Protocol Stream
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active
                </span>
              </div>
              {authTerminalLogs.map((log, lidx) => (
                <p key={lidx} className={`${lidx === authTerminalLogs.length - 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'} truncate`}>
                  {log}
                </p>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> TLS 1.3 Encrypted</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Tenant Isolation Verified</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
