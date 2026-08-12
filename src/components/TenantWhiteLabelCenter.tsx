import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Globe,
  Upload,
  Image as ImageIcon,
  Palette,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Sparkles,
  ExternalLink,
  Layers,
  Wand2,
  AlertCircle,
  Copy,
  Eye,
  Check,
  Building2,
  Store,
  Layout,
  FileCode
} from 'lucide-react';
import {
  TenantBranding,
  getTenantBranding,
  saveTenantBranding,
  verifyTenantCustomDomain
} from '../lib/tenantBranding';
import WhiteLabelBrandingEditor from './WhiteLabelBrandingEditor';
import TenantCustomDomainPanel from './TenantCustomDomainPanel';

interface TenantWhiteLabelCenterProps {
  tenantId: string;
  onNavigateToWebsiteBuilder?: () => void;
}

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80'
];

const PRESET_COLORS = [
  { name: 'Indigo Electric', primary: '#6366f1', accent: '#06b6d4' },
  { name: 'Emerald Organic', primary: '#059669', accent: '#10b981' },
  { name: 'Warm Amber & Gold', primary: '#d97706', accent: '#f59e0b' },
  { name: 'Cyber Blue', primary: '#0ea5e9', accent: '#38bdf8' },
  { name: 'Royal Purple', primary: '#8b5cf6', accent: '#ec4899' },
  { name: 'Crimson Slate', primary: '#e11d48', accent: '#fb7185' }
];

export default function TenantWhiteLabelCenter({ tenantId, onNavigateToWebsiteBuilder }: TenantWhiteLabelCenterProps) {
  const [branding, setBranding] = useState<TenantBranding>(() => getTenantBranding(tenantId));
  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'domain' | 'homepage'>('branding');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState(branding.customDomain);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [domainVerifyResult, setDomainVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);

  useEffect(() => {
    const loaded = getTenantBranding(tenantId);
    setBranding(loaded);
    setCustomDomainInput(loaded.customDomain);
  }, [tenantId]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    await saveTenantBranding(branding);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleVerifyDomain = async () => {
    setIsVerifyingDomain(true);
    setDomainVerifyResult(null);
    const result = await verifyTenantCustomDomain(tenantId, customDomainInput);
    setIsVerifyingDomain(false);
    setDomainVerifyResult(result);
    if (result.success) {
      setBranding(getTenantBranding(tenantId));
    }
  };

  const copyDnsRecord = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-16">
      {/* Top Banner Header */}
      <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-3.5 flex items-center justify-center text-white shadow-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
                Tenant White-Label OS
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Workspace: {branding.companyName}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">White-Label Branding & Custom Homepage Engine</h2>
            <p className="text-xs text-slate-300">
              Customize company logo, tagline, address, colors, custom domain CNAME routing, and automated homepage sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/30 flex items-center gap-2 transition cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-amber-300" />}
            {isSaving ? 'Publishing Changes...' : 'Save & Broadcast Branding'}
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">White-Label Branding Successfully Synchronized!</p>
            <p className="text-emerald-300 text-xs">
              Company logo, tagline, address, contacts, colors, and custom homepage settings are now active everywhere across tenant pages, headers, and footers.
            </p>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 bg-[#0D0E17] border border-white/10 p-1.5 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'branding' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette className="w-4 h-4" /> Logo & Identity
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'contact' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-4 h-4" /> Company & Location Details
        </button>
        <button
          onClick={() => setActiveTab('domain')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'domain' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" /> Custom Domain & CNAME
        </button>
        <button
          onClick={() => setActiveTab('homepage')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'homepage' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layout className="w-4 h-4" /> Custom Homepage & Builder
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: Logo & Visual Identity */}
          {activeTab === 'branding' && (
            <WhiteLabelBrandingEditor
              branding={branding}
              onChange={setBranding}
              onSave={handleSaveAll}
              isSaving={isSaving}
            />
          )}

          {/* TAB 2: Company & Location Contacts */}
          {activeTab === 'contact' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" /> Physical Address & Contact Information
                </h3>
                <p className="text-xs text-slate-400">These details auto-populate on tenant websites, customer invoices, order receipts, and footers.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Physical Company Address</label>
                  <textarea
                    rows={2}
                    value={branding.address}
                    onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 100 Enterprise Way, Suite 400, San Francisco, CA 94105"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Support / Contact Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={branding.phone}
                        onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="+1 (800) 555-0199"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Official Support Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={branding.supportEmail}
                        onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="support@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Auto-Propagation Notice
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Whenever address or phone numbers are saved, they automatically update across your Website Builder OS preview, POS invoice footers, and contact maps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Custom Domain & CNAME Provisioning */}
          {activeTab === 'domain' && (
            <TenantCustomDomainPanel
              tenantId={tenantId}
              tenantName={branding.companyName}
              onDomainUpdated={(dom) => setBranding({ ...branding, customDomain: dom })}
            />
          )}

          {/* TAB 4: Custom Homepage & Website Builder Sync */}
          {activeTab === 'homepage' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-400" /> Custom Homepage & Website Builder Sync
                </h3>
                <p className="text-xs text-slate-400">Customize what visitors see when navigating to your homepage or custom domain.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Homepage Display Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setBranding({ ...branding, homepageSource: 'website_builder' })}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                        branding.homepageSource === 'website_builder' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-900 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FileCode className="w-5 h-5 text-cyan-400" />
                        {branding.homepageSource === 'website_builder' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="font-bold text-white text-xs">Website Builder Site</p>
                      <p className="text-[11px] text-slate-400 mt-1">Render full dynamic multi-section website created via Website Builder OS.</p>
                    </button>

                    <button
                      onClick={() => setBranding({ ...branding, homepageSource: 'custom_landing' })}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                        branding.homepageSource === 'custom_landing' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-900 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Store className="w-5 h-5 text-emerald-400" />
                        {branding.homepageSource === 'custom_landing' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="font-bold text-white text-xs">Custom White-Label Landing</p>
                      <p className="text-[11px] text-slate-400 mt-1">Sleek customizable landing page showcasing tenant branding & hero tiles.</p>
                    </button>
                  </div>
                </div>

                {/* Direct Link to Website Builder */}
                {onNavigateToWebsiteBuilder && (
                  <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-white text-xs">Want to visually craft your site?</p>
                      <p className="text-[11px] text-indigo-200">Open the full AI Website Builder OS studio to pick industry catalog templates and copy.</p>
                    </div>
                    <button
                      onClick={onNavigateToWebsiteBuilder}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition shrink-0 cursor-pointer"
                    >
                      Open Website Builder OS
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Live Preview Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl sticky top-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" /> Live White-Label UI Preview
              </h4>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                REAL-TIME
              </span>
            </div>

            {/* Simulated Live Tenant Web Card */}
            <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Card Header Bar */}
              <div
                className="p-4 border-b border-white/10 flex items-center justify-between"
                style={{ backgroundColor: branding.primaryColor ? `${branding.primaryColor}22` : '#1e1b4b' }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={branding.logoUrl || PRESET_LOGOS[0]}
                    alt="Tenant Logo"
                    className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-md"
                  />
                  <div>
                    <h5 className="font-extrabold text-white text-sm leading-tight">{branding.companyName || 'Tenant Brand'}</h5>
                    <p className="text-[10px] text-slate-300 font-mono truncate max-w-[180px]">{branding.customDomain || 'tenant.domain.com'}</p>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-white shadow"
                  style={{ backgroundColor: branding.accentColor || '#06b6d4' }}
                >
                  Contact
                </span>
              </div>

              {/* Card Hero Section */}
              <div className="p-5 space-y-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-indigo-300 uppercase font-mono">
                  Official Tenant Portal
                </span>
                <h6 className="text-base font-extrabold text-white leading-snug">
                  {branding.tagline || 'Next-Generation Operations & Customer Experience'}
                </h6>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Welcome to {branding.companyName}. We deliver world-class products, transparent scheduling, and dedicated client service.
                </p>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 font-bold text-xs rounded-xl text-white shadow transition"
                    style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                  >
                    Explore Products
                  </button>
                  <button
                    className="px-4 py-2 font-bold text-xs rounded-xl text-white border border-white/20 hover:bg-white/5 transition"
                  >
                    Get Direction
                  </button>
                </div>
              </div>

              {/* Card Footer Section */}
              <div className="p-4 bg-black/60 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
                <p className="flex items-center gap-1.5 text-slate-300 truncate">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {branding.address || 'Address configured'}
                </p>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Phone className="w-3 h-3 text-emerald-400" /> {branding.phone || '+1 800-555-0199'}
                  </span>
                  <span className="text-slate-400 font-mono">{branding.supportEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
