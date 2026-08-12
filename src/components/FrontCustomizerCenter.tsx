import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  SlidersHorizontal, 
  Building2, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  RotateCw, 
  ShieldCheck, 
  Palette, 
  Megaphone, 
  Hotel, 
  Utensils, 
  Compass, 
  Mail, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Bot, 
  Zap, 
  CheckCircle2, 
  Search,
  Layout,
  Layers,
  Link,
  Image as ImageIcon
} from 'lucide-react';
import { getTenantBranding, saveTenantBranding, TenantBranding } from '../lib/tenantBranding';
import PlatformLogoManager from './PlatformLogoManager';

interface FrontCustomizerCenterProps {
  tenants: any[];
  onTenantsUpdated?: (tenants: any[]) => void;
  onSelectTenantCustomizer?: (tenantId: string) => void;
}

const DEFAULT_SHOWCASE_MODULES = [
  {
    id: 'marketing-studio',
    name: 'Digital Marketing & Content AI',
    badge: 'Automated Campaigns',
    category: 'AI & Marketing',
    icon: 'Megaphone',
    iconBg: 'bg-[#FF5733]/20 text-[#FF5733] border-[#FF5733]/40 shadow-[0_0_12px_rgba(255,87,51,0.3)]',
    gradientText: 'from-orange-300 via-amber-300 to-yellow-300',
    borderHover: 'hover:border-[#FF5733]/60',
    description: 'Generates Instagram posts, Facebook ads, AI graphics, schedule calendars & multi-channel campaign copy.',
    highlightText: 'Meta & Google Ad Visuals + AI Instagram Captions'
  },
  {
    id: 'website-builder-os',
    name: 'AI Website Builder & Domain Mapper',
    badge: 'Zero Code OS',
    category: 'Core Commerce',
    icon: 'Globe',
    iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]',
    gradientText: 'from-indigo-300 via-purple-300 to-cyan-300',
    borderHover: 'hover:border-indigo-500/60',
    description: 'Build high-converting landing pages, e-commerce storefronts, custom themes & bind your own custom domains.',
    highlightText: '1-Click Instant Subdomain & Custom DNS Binding'
  },
  {
    id: 'hotel-management-os',
    name: 'Hotel & Resort Management OS',
    badge: 'Hospitality System',
    category: 'Hospitality & Dining',
    icon: 'Hotel',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    gradientText: 'from-amber-300 via-orange-300 to-yellow-300',
    borderHover: 'hover:border-amber-500/60',
    description: 'Room reservation calendar, front-desk check-in, guest folios, housekeeping schedules & booking engine.',
    highlightText: 'Real-time room occupancy grid & PMS folios'
  },
  {
    id: 'restaurant-pos-os',
    name: 'Restaurant POS & Kitchen Display',
    badge: 'Dining & Kitchen',
    category: 'Hospitality & Dining',
    icon: 'Utensils',
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    gradientText: 'from-emerald-300 via-teal-300 to-cyan-300',
    borderHover: 'hover:border-emerald-500/60',
    description: 'Table ordering, Kitchen Display System (KDS), split billing, digital QR menu & inventory recipe tracking.',
    highlightText: 'Live KDS ticket queue & touch POS checkout'
  },
  {
    id: 'tours-travels-os',
    name: 'Tours & Travels Operations OS',
    badge: 'Travel Industry',
    category: 'Travel & Services',
    icon: 'Compass',
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    gradientText: 'from-cyan-300 via-blue-300 to-teal-300',
    borderHover: 'hover:border-cyan-500/60',
    description: 'Tour itinerary generator, passenger manifests, guide assignments, vehicle dispatch & booking vouchers.',
    highlightText: 'Custom day-wise itinerary builder & passenger manifests'
  },
  {
    id: 'whatsapp-automation',
    name: 'WhatsApp Cloud API Automation',
    badge: 'Meta Official API',
    category: 'Communication AI',
    icon: 'WhatsApp',
    iconBg: 'bg-emerald-500/20 text-[#25D366] border-emerald-500/50 shadow-[0_0_14px_rgba(37,211,102,0.4)]',
    gradientText: 'from-emerald-300 via-green-300 to-teal-300',
    borderHover: 'hover:border-emerald-500/60',
    description: 'Broadcaster for broadcast lists, AI customer support bot, automated order confirmations & chat trigger flows.',
    highlightText: 'Official Meta Cloud API broadcast lists & bot trigger flows'
  }
];

export default function FrontCustomizerCenter({
  tenants,
  onTenantsUpdated,
  onSelectTenantCustomizer
}: FrontCustomizerCenterProps) {
  const [activeTab, setActiveTab] = useState<'platform_logo' | 'marquee' | 'tenants'>('platform_logo');
  
  // Marquee Configuration
  const [marqueeTitle, setMarqueeTitle] = useState(() => {
    try {
      const saved = localStorage.getItem('marketforge_showcase_config');
      return saved ? JSON.parse(saved).title || 'EXPLORE ALL BUILT-IN BUSINESS SYSTEMS' : 'EXPLORE ALL BUILT-IN BUSINESS SYSTEMS';
    } catch (e) { return 'EXPLORE ALL BUILT-IN BUSINESS SYSTEMS'; }
  });

  const [marqueeBadge, setMarqueeBadge] = useState(() => {
    try {
      const saved = localStorage.getItem('marketforge_showcase_config');
      return saved ? JSON.parse(saved).badge || '12+ Autonomous Apps' : '12+ Autonomous Apps';
    } catch (e) { return '12+ Autonomous Apps'; }
  });

  const [marqueeSubtitle, setMarqueeSubtitle] = useState(() => {
    try {
      const saved = localStorage.getItem('marketforge_showcase_config');
      return saved ? JSON.parse(saved).subtitle || 'Hover or click any module card to inspect AI capabilities and features.' : 'Hover or click any module card to inspect AI capabilities and features.';
    } catch (e) { return 'Hover or click any module card to inspect AI capabilities and features.'; }
  });

  const [modulesList, setModulesList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('marketforge_superadmin_showcase_modules');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SHOWCASE_MODULES;
  });

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Module Form State
  const [newModule, setNewModule] = useState({
    name: '',
    badge: 'Custom Module',
    category: 'AI & Marketing',
    icon: 'Sparkles',
    description: '',
    highlightText: ''
  });

  // Tenant Branding Editing Modal State
  const [editingTenantBranding, setEditingTenantBranding] = useState<TenantBranding | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');

  const handleSaveMarqueeConfig = () => {
    try {
      localStorage.setItem('marketforge_showcase_config', JSON.stringify({
        title: marqueeTitle,
        badge: marqueeBadge,
        subtitle: marqueeSubtitle
      }));
      localStorage.setItem('marketforge_superadmin_showcase_modules', JSON.stringify(modulesList));
      window.dispatchEvent(new Event('marketforge_showcase_updated'));
      setSaveSuccessMsg("✅ Front Marquee showcase settings saved successfully! Landing Page updated live.");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      alert("Error saving marquee configuration: " + err.message);
    }
  };

  const handleAddNewModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.name) return;

    const cleanId = newModule.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    const created = {
      id: cleanId,
      name: newModule.name,
      badge: newModule.badge || 'New System',
      category: newModule.category,
      icon: newModule.icon,
      iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]',
      gradientText: 'from-indigo-300 via-purple-300 to-pink-300',
      borderHover: 'hover:border-indigo-500/60',
      description: newModule.description || 'Enterprise autonomous system module.',
      highlightText: newModule.highlightText || 'Built-in 24/7 AI Autopilot'
    };

    const updated = [...modulesList, created];
    setModulesList(updated);
    localStorage.setItem('marketforge_superadmin_showcase_modules', JSON.stringify(updated));
    window.dispatchEvent(new Event('marketforge_showcase_updated'));
    setIsAddModalOpen(false);
    setNewModule({ name: '', badge: 'Custom Module', category: 'AI & Marketing', icon: 'Sparkles', description: '', highlightText: '' });
  };

  const handleDeleteModule = (id: string) => {
    const updated = modulesList.filter(m => m.id !== id);
    setModulesList(updated);
    localStorage.setItem('marketforge_superadmin_showcase_modules', JSON.stringify(updated));
    window.dispatchEvent(new Event('marketforge_showcase_updated'));
  };

  const handleCopySlugUrl = (tenantId: string) => {
    const origin = window.location.origin;
    const slugUrl = `${origin}/${tenantId}`;
    navigator.clipboard.writeText(slugUrl);
    setCopiedSlug(tenantId);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleSaveTenantBrandingModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenantBranding) return;
    saveTenantBranding(editingTenantBranding);

    // Update parent tenant list if needed
    if (onTenantsUpdated) {
      const updatedTenants = tenants.map(t => {
        if (t.id === editingTenantBranding.tenantId) {
          return {
            ...t,
            name: editingTenantBranding.companyName,
            domain: editingTenantBranding.customDomain || t.domain
          };
        }
        return t;
      });
      onTenantsUpdated(updatedTenants);
    }

    setSaveSuccessMsg(`✅ Saved landing page & branding settings for workspace '${editingTenantBranding.companyName}'!`);
    setEditingTenantBranding(null);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const filteredTenantsList = tenants.filter(t => 
    t.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
    (t.domain && t.domain.toLowerCase().includes(tenantSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-300">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Front Customizer & Tenant Landing Page OS</h2>
                <p className="text-xs text-slate-400">
                  Manage global showcase marquee modules & allocate individual tenant slug landing pages (<code className="text-indigo-300 bg-white/10 px-1 py-0.5 rounded">marketforge.scamspike.com/&lt;slug&gt;</code>).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('platform_logo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'platform_logo'
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
              Platform Logo System
            </button>
            <button
              onClick={() => setActiveTab('marquee')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'marquee'
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Showcase Marquee Editor
            </button>
            <button
              onClick={() => setActiveTab('tenants')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'tenants'
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Tenant Landing Pages ({tenants.length})
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* TAB 0: PLATFORM LOGO MANAGER */}
      {activeTab === 'platform_logo' && (
        <PlatformLogoManager />
      )}

      {/* TAB 1: MARQUEE SHOWCASE EDITOR */}
      {activeTab === 'marquee' && (
        <div className="space-y-6">
          
          {/* BANNER HEADER CONFIG CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Marquee Showcase Header Copy</span>
                </h3>
                <p className="text-xs text-slate-500">Customize title banner and badge displayed above the infinite system module carousel on the main login portal.</p>
              </div>
              <button
                onClick={handleSaveMarqueeConfig}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Showcase Copy
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Banner Headline Title</label>
                <input
                  type="text"
                  value={marqueeTitle}
                  onChange={e => setMarqueeTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={marqueeBadge}
                  onChange={e => setMarqueeBadge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle Instructions</label>
                <input
                  type="text"
                  value={marqueeSubtitle}
                  onChange={e => setMarqueeSubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SHOWCASE MODULE CARDS LIST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-indigo-600" />
                  <span>Showcase Module Cards ({modulesList.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Edit features, badges, icons, and highlight callouts of cards in the infinite marquee slider.</p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Showcase Card
              </button>
            </div>

            {/* CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulesList.map((mod, idx) => (
                <div 
                  key={mod.id || idx}
                  className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white transition space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {mod.badge}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{mod.name}</h4>
                    <span className="text-[10px] font-medium text-slate-500 block mt-0.5">{mod.category}</span>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{mod.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                    <span className="truncate pr-2">✨ {mod.highlightText}</span>
                    <span className="text-indigo-600 font-bold shrink-0">#{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TENANT SLUG LANDING PAGE MANAGER */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Tenant Landing Pages & Dedicated Slug Portals</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Every registered tenant gets their own dedicated landing page & login portal. Access via slug URL e.g. <code className="text-indigo-600 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">marketforge.scamspike.com/&lt;tenant-id&gt;</code> or custom domain.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tenant name or slug..."
                  value={tenantSearchQuery}
                  onChange={e => setTenantSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            </div>

            {/* TENANT LANDING PAGES LIST TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                    <th className="py-3 px-4">Workspace Tenant</th>
                    <th className="py-3 px-4">Dedicated Landing Page Slug URL</th>
                    <th className="py-3 px-4">Custom Domain Mapping</th>
                    <th className="py-3 px-4">Landing Page Source</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTenantsList.map((tenant) => {
                    const branding = getTenantBranding(tenant.id);
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://marketforge.scamspike.com';
                    const slugUrl = `${origin}/${tenant.id}`;

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/80 transition">
                        {/* TENANT NAME & LOGO */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {branding.logoUrl ? (
                              <img 
                                src={branding.logoUrl} 
                                alt={branding.companyName} 
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200" 
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center border border-indigo-200">
                                {tenant.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block">{tenant.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {tenant.id} • {tenant.plan} Plan</span>
                            </div>
                          </div>
                        </td>

                        {/* SLUG URL */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <code className="text-[11px] font-mono text-indigo-700 bg-indigo-50/80 border border-indigo-200/60 px-2 py-1 rounded-lg">
                              marketforge.scamspike.com/{tenant.id}
                            </code>
                            <button
                              onClick={() => handleCopySlugUrl(tenant.id)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition rounded"
                              title="Copy Tenant Landing Page URL"
                            >
                              {copiedSlug === tenant.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* CUSTOM DOMAIN MAPPING */}
                        <td className="py-3 px-4">
                          {branding.customDomain ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-slate-800 text-[11px] block">{branding.customDomain}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-2.5 h-2.5" /> DNS Active
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono italic">Subdomain routing</span>
                          )}
                        </td>

                        {/* LANDING PAGE SOURCE */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {branding.homepageSource === 'website_builder' ? 'AI Website Builder' : branding.homepageSource === 'custom_landing' ? 'Custom Studio' : 'Standard Tenant Portal'}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* VISIT TENANT LANDING */}
                            <a
                              href={`/${tenant.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                              View Landing
                            </a>

                            {/* CUSTOMIZE VIA AI WEBSITE BUILDER */}
                            {onSelectTenantCustomizer && (
                              <button
                                onClick={() => onSelectTenantCustomizer(tenant.id)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1 border border-indigo-200"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                Customizer OS
                              </button>
                            )}

                            {/* EDIT BRANDING */}
                            <button
                              onClick={() => setEditingTenantBranding(branding)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Tenant Logo & Landing Branding"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SHOWCASE MODULE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add Showcase Module Card to Marquee</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddNewModule} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Module Name</label>
                <input
                  type="text"
                  placeholder="e.g., E-Commerce Inventory Autopilot"
                  value={newModule.name}
                  onChange={e => setNewModule({ ...newModule, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Retail System"
                    value={newModule.badge}
                    onChange={e => setNewModule({ ...newModule, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newModule.category}
                    onChange={e => setNewModule({ ...newModule, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="AI & Marketing">AI & Marketing</option>
                    <option value="Hospitality & Dining">Hospitality & Dining</option>
                    <option value="Travel & Services">Travel & Services</option>
                    <option value="Communication AI">Communication AI</option>
                    <option value="Core Commerce">Core Commerce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  placeholder="Short description of the module capabilities..."
                  value={newModule.description}
                  onChange={e => setNewModule({ ...newModule, description: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Highlight Feature Callout</label>
                <input
                  type="text"
                  placeholder="e.g. Real-time barcode scanner & inventory sync"
                  value={newModule.highlightText}
                  onChange={e => setNewModule({ ...newModule, highlightText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  Add Card to Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TENANT BRANDING */}
      {editingTenantBranding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Customize Tenant Branding & Domain Mapping</span>
              </h3>
              <button onClick={() => setEditingTenantBranding(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveTenantBrandingModal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Workspace Name</label>
                <input
                  type="text"
                  value={editingTenantBranding.companyName}
                  onChange={e => setEditingTenantBranding({ ...editingTenantBranding, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={editingTenantBranding.tagline}
                  onChange={e => setEditingTenantBranding({ ...editingTenantBranding, tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Logo URL</label>
                <input
                  type="text"
                  value={editingTenantBranding.logoUrl}
                  onChange={e => setEditingTenantBranding({ ...editingTenantBranding, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Custom Domain</label>
                  <input
                    type="text"
                    value={editingTenantBranding.customDomain || ''}
                    onChange={e => setEditingTenantBranding({ ...editingTenantBranding, customDomain: e.target.value })}
                    placeholder="e.g. siennaclay.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Landing Page Source</label>
                  <select
                    value={editingTenantBranding.homepageSource || 'default'}
                    onChange={e => setEditingTenantBranding({ ...editingTenantBranding, homepageSource: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="default">Standard Tenant Login Portal</option>
                    <option value="website_builder">AI Website Builder Landing Page</option>
                    <option value="custom_landing">Custom Studio Landing Page</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTenantBranding(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  Save Tenant Branding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
