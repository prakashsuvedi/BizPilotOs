import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  RotateCw, 
  FileText, 
  Info, 
  Trash2, 
  Sliders,
  CheckCircle2,
  Maximize2,
  Plus,
  Building2,
  Tag,
  Briefcase
} from 'lucide-react';
import { 
  getPlatformLogoSettings, 
  savePlatformLogoSettings, 
  resetPlatformLogoSettings, 
  PlatformLogoSettings, 
  ClientLogoSpec,
  DEFAULT_PLATFORM_LOGOS,
  DEFAULT_TOP_CLIENTS
} from '../lib/platformBranding';
import { compressImageDataUrl } from '../lib/imageUtils';

export const PlatformLogoManager: React.FC = () => {
  const [logoSettings, setLogoSettings] = useState<PlatformLogoSettings>(getPlatformLogoSettings);
  const [fullUrlInput, setFullUrlInput] = useState(logoSettings.fullLogoUrl);
  const [headerUrlInput, setHeaderUrlInput] = useState(logoSettings.headerLogoUrl);
  const [emblemUrlInput, setEmblemUrlInput] = useState(logoSettings.emblemUrl);
  const [brandNameInput, setBrandNameInput] = useState(logoSettings.brandName || 'MarketForge OS');
  const [taglineInput, setTaglineInput] = useState(logoSettings.tagline || 'A TRUE BUSINESS TRANSFORMATION');
  const [showTextInHeaderInput, setShowTextInHeaderInput] = useState(logoSettings.showTextInHeader !== false);
  const [clientsList, setClientsList] = useState<ClientLogoSpec[]>(logoSettings.topClients || DEFAULT_TOP_CLIENTS);
  
  const [newClientName, setNewClientName] = useState('');
  const [newClientCategory, setNewClientCategory] = useState('');
  const [newClientMetric, setNewClientMetric] = useState('');
  const [newClientLogoUrl, setNewClientLogoUrl] = useState('');
  const [newClientTenantId, setNewClientTenantId] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fullFileInputRef = useRef<HTMLInputElement>(null);
  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const emblemFileInputRef = useRef<HTMLInputElement>(null);
  const clientFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = getPlatformLogoSettings();
    setLogoSettings(current);
    setFullUrlInput(current.fullLogoUrl);
    setHeaderUrlInput(current.headerLogoUrl);
    setEmblemUrlInput(current.emblemUrl);
    setBrandNameInput(current.brandName || 'MarketForge OS');
    setTaglineInput(current.tagline || 'A TRUE BUSINESS TRANSFORMATION');
    setShowTextInHeaderInput(current.showTextInHeader !== false);
    setClientsList(current.topClients || DEFAULT_TOP_CLIENTS);
  }, []);

  const handleApplyChanges = (updated: Partial<PlatformLogoSettings>) => {
    const payload: Partial<PlatformLogoSettings> = {
      ...updated,
      brandName: brandNameInput,
      tagline: taglineInput,
      showTextInHeader: showTextInHeaderInput,
      topClients: clientsList
    };
    const saved = savePlatformLogoSettings(payload);
    setLogoSettings(saved);
    setFullUrlInput(saved.fullLogoUrl);
    setHeaderUrlInput(saved.headerLogoUrl);
    setEmblemUrlInput(saved.emblemUrl);
    setBrandNameInput(saved.brandName || 'MarketForge OS');
    setTaglineInput(saved.tagline || 'A TRUE BUSINESS TRANSFORMATION');
    setShowTextInHeaderInput(saved.showTextInHeader !== false);
    setClientsList(saved.topClients || DEFAULT_TOP_CLIENTS);
    setSaveToast('Platform branding & top enterprise client list updated globally across all login views!');
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newClient: ClientLogoSpec = {
      id: `client-${Date.now()}`,
      name: newClientName.trim(),
      category: newClientCategory.trim() || 'Enterprise Client',
      metric: newClientMetric.trim() || 'Active Partner',
      logoUrl: newClientLogoUrl.trim() || undefined,
      tenantId: newClientTenantId.trim() || undefined,
      email: newClientEmail.trim() || undefined,
      password: 'demopass123'
    };

    const updatedList = [...clientsList, newClient];
    setClientsList(updatedList);
    setNewClientName('');
    setNewClientCategory('');
    setNewClientMetric('');
    setNewClientLogoUrl('');
    setNewClientTenantId('');
    setNewClientEmail('');

    handleApplyChanges({
      fullLogoUrl: fullUrlInput,
      headerLogoUrl: headerUrlInput,
      emblemUrl: emblemUrlInput,
      topClients: updatedList
    });
  };

  const handleDeleteClient = (id: string) => {
    const updatedList = clientsList.filter(c => c.id !== id);
    setClientsList(updatedList);
    handleApplyChanges({
      fullLogoUrl: fullUrlInput,
      headerLogoUrl: headerUrlInput,
      emblemUrl: emblemUrlInput,
      topClients: updatedList
    });
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset the platform logo & client showcase back to default MarketForge OS artwork?")) {
      const restored = resetPlatformLogoSettings();
      setLogoSettings(restored);
      setFullUrlInput(restored.fullLogoUrl);
      setHeaderUrlInput(restored.headerLogoUrl);
      setEmblemUrlInput(restored.emblemUrl);
      setClientsList(restored.topClients || DEFAULT_TOP_CLIENTS);
      setSaveToast('Restored default MarketForge OS branding assets.');
      setTimeout(() => setSaveToast(null), 4000);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'full' | 'header' | 'emblem' | 'all' | 'client'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, SVG, JPG, WebP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        setIsUploading(false);
        return;
      }

      // Process image data URL with high-definition resolution preservation
      const dataUrl = await compressImageDataUrl(rawDataUrl, 1800, 0.95);

      if (type === 'client') {
        setNewClientLogoUrl(dataUrl);
        setIsUploading(false);
        return;
      }

      if (type === 'all' || type === 'full') {
        setFullUrlInput(dataUrl);
      }
      if (type === 'all' || type === 'header') {
        setHeaderUrlInput(dataUrl);
      }
      if (type === 'all' || type === 'emblem') {
        setEmblemUrlInput(dataUrl);
      }

      handleApplyChanges({
        fullLogoUrl: type === 'all' || type === 'full' ? dataUrl : fullUrlInput,
        headerLogoUrl: type === 'all' || type === 'header' ? dataUrl : headerUrlInput,
        emblemUrl: type === 'all' || type === 'emblem' ? dataUrl : emblemUrlInput
      });

      setIsUploading(false);
    };

    reader.onerror = () => {
      alert('Failed to read image file.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#0B0D19] border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8 backdrop-blur-2xl text-slate-100">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Super Admin Governance
          </div>
          <h2 className="text-2xl font-black font-display text-white tracking-tight flex items-center gap-3">
            Global Platform Logo &amp; Client Showcase System
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Customize platform logos and top enterprise clients showcased on the login portal frames.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 rounded-xl text-xs font-mono font-bold cursor-pointer transition flex items-center gap-2"
            title="Reset to original MarketForge OS logo"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            Reset Defaults
          </button>

          <button
            onClick={() => handleApplyChanges({
              fullLogoUrl: fullUrlInput,
              headerLogoUrl: headerUrlInput,
              emblemUrl: emblemUrlInput,
              topClients: clientsList
            })}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-mono text-xs font-black rounded-xl shadow-lg hover:shadow-indigo-500/25 border border-indigo-400/40 cursor-pointer transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            Save &amp; Apply Globally
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      {saveToast && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs font-mono flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* QUICK UPLOAD DRAG & DROP ZONE */}
      <div className="p-6 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/60 border-2 border-dashed border-indigo-500/40 rounded-3xl text-center space-y-4 hover:border-indigo-400 transition group relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white">Upload Primary Platform Logo File</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Upload your logo image (PNG, SVG, JPG or WebP). It automatically resizes and formats for full cards, header navigation bars, and icon badges.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <input 
            ref={fullFileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleFileUpload(e, 'all')}
          />
          <button
            onClick={() => fullFileInputRef.current?.click()}
            disabled={isUploading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-2xl shadow-xl border border-indigo-400/40 cursor-pointer transition flex items-center gap-2"
          >
            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ImageIcon className="w-4 h-4" />}
            Select Image File...
          </button>
        </div>
      </div>

      {/* 3 LIVE LOGO PREVIEWS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* 1. FULL BRAND LOGO */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Hero &amp; Login Frame Logo
            </span>
            <h4 className="text-sm font-bold text-white">Full Brand Logo</h4>
            <p className="text-[11px] text-slate-400">Used on main landing hero cards &amp; login portal left frame.</p>
          </div>

          <div className="bg-[#070814] border border-white/10 rounded-xl p-4 flex items-center justify-center min-h-[140px] relative overflow-hidden">
            <img 
              src={fullUrlInput} 
              alt="Full Platform Logo Preview" 
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PLATFORM_LOGOS.fullLogoUrl; }}
              className="max-h-28 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
            />
          </div>

          <div className="space-y-3">
            <input 
              ref={fullFileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, 'full')}
            />
            <button
              type="button"
              onClick={() => fullFileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-2.5 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-mono font-bold cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-300" />
              Upload Full Logo File
            </button>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 block">Image URL / Data URI:</label>
              <input 
                type="text" 
                value={fullUrlInput}
                onChange={(e) => setFullUrlInput(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                placeholder="https://example.com/logo.svg"
              />
            </div>
          </div>
        </div>

        {/* 2. HORIZONTAL HEADER NAVBAR LOGO */}
        <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded border border-cyan-400/30">
                Top Navigation Header
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Horizontal Format
              </span>
            </div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Horizontal Nav Header Logo
            </h4>
            <p className="text-[11px] text-slate-300">Dedicated upload for horizontal navbar header section logo across all apps &amp; portals.</p>
          </div>

          <div className="bg-[#050B14] border border-cyan-500/30 rounded-xl p-4 flex items-center justify-center gap-3 min-h-[160px] relative overflow-hidden group-hover:border-cyan-400/60 transition">
            <img 
              src={headerUrlInput} 
              alt="Horizontal Header Navigation Logo Preview" 
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PLATFORM_LOGOS.headerLogoUrl; }}
              className="h-12 md:h-16 w-auto max-w-[50%] object-contain filter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            />
            {showTextInHeaderInput && (
              <div className="flex flex-col justify-center leading-none select-none">
                <span className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  {brandNameInput.includes('MarketForge') ? (
                    <>
                      MarketForge <span className="text-cyan-400 font-black">OS</span>
                    </>
                  ) : (
                    <span className="text-cyan-300 font-black">{brandNameInput}</span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider mt-1">
                  {taglineInput}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <input 
              ref={headerFileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, 'header')}
            />
            <button
              type="button"
              onClick={() => headerFileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-black rounded-xl shadow-lg border border-cyan-300/50 cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-white animate-bounce-subtle" />
              Upload Horizontal Header Logo File
            </button>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 block">Image URL / Data URI:</label>
              <input 
                type="text" 
                value={headerUrlInput}
                onChange={(e) => setHeaderUrlInput(e.target.value)}
                className="w-full bg-black/60 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                placeholder="https://example.com/horizontal-header-logo.svg"
              />
            </div>

            {/* Header Brand Name Text & Tagline Settings */}
            <div className="p-3 bg-black/40 border border-cyan-500/20 rounded-xl space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-cyan-300 font-bold block">
                  Header Brand Name Text:
                </label>
                <input 
                  type="text" 
                  value={brandNameInput}
                  onChange={(e) => {
                    setBrandNameInput(e.target.value);
                    handleApplyChanges({ brandName: e.target.value });
                  }}
                  className="w-full bg-black/80 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="MarketForge OS"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-cyan-300 font-bold block">
                  Brand Tagline:
                </label>
                <input 
                  type="text" 
                  value={taglineInput}
                  onChange={(e) => {
                    setTaglineInput(e.target.value);
                    handleApplyChanges({ tagline: e.target.value });
                  }}
                  className="w-full bg-black/80 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-cyan-200 font-bold font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="A TRUE BUSINESS TRANSFORMATION"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-300 font-mono">
                  Display Text alongside Header Logo Image
                </span>
                <input 
                  type="checkbox"
                  checked={showTextInHeaderInput}
                  onChange={(e) => {
                    setShowTextInHeaderInput(e.target.checked);
                    handleApplyChanges({ showTextInHeader: e.target.checked });
                  }}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. EMBLEM LOGO MARK */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
              Compact Icon / Favicon
            </span>
            <h4 className="text-sm font-bold text-white">Emblem Icon Mark</h4>
            <p className="text-[11px] text-slate-400">Used for compact sidebar toggles, avatars, and badges.</p>
          </div>

          <div className="bg-[#070814] border border-white/10 rounded-xl p-4 flex items-center justify-center min-h-[140px] relative overflow-hidden">
            <img 
              src={emblemUrlInput} 
              alt="Emblem Icon Mark Preview" 
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PLATFORM_LOGOS.emblemUrl; }}
              className="w-12 h-12 object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
            />
          </div>

          <div className="space-y-3">
            <input 
              ref={emblemFileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, 'emblem')}
            />
            <button
              type="button"
              onClick={() => emblemFileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-2.5 px-3 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-mono font-bold cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-purple-300" />
              Upload Emblem Icon File
            </button>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 block">Image URL / Data URI:</label>
              <input 
                type="text" 
                value={emblemUrlInput}
                onChange={(e) => setEmblemUrlInput(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500"
                placeholder="https://example.com/emblem.svg"
              />
            </div>
          </div>
        </div>

      </div>

      {/* TOP ENTERPRISE CLIENTS SHOWCASE MANAGER */}
      <div className="border-t border-white/10 pt-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-extrabold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Top Enterprise Clients Showcase Manager
          </div>
          <h3 className="text-xl font-bold text-white">Manage Clients Showcased on Login Portal</h3>
          <p className="text-slate-400 text-xs mt-1">
            Add or edit top client logos and metrics displayed on the login portal frame to fill visual blank space and boost credibility.
          </p>
        </div>

        {/* ADD NEW CLIENT FORM */}
        <form onSubmit={handleAddClient} className="p-5 bg-slate-900/90 border border-white/10 rounded-2xl space-y-4">
          <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            Add New Top Enterprise Client
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Company / Brand Name</label>
              <input 
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="e.g. Apex Wealth Treasury"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Industry / Category Tag</label>
              <input 
                type="text"
                value={newClientCategory}
                onChange={(e) => setNewClientCategory(e.target.value)}
                placeholder="e.g. FinTech & Banking"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Metric Highlight</label>
              <input 
                type="text"
                value={newClientMetric}
                onChange={(e) => setNewClientMetric(e.target.value)}
                placeholder="e.g. $1.2B Assets or 50k+ Users"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Tenant ID (For 1-Click Demo)</label>
              <input 
                type="text"
                value={newClientTenantId}
                onChange={(e) => setNewClientTenantId(e.target.value)}
                placeholder="e.g. demo-tenant"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Demo Email Address</label>
              <input 
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="e.g. owner@democorp.com"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Client Logo Image URL</label>
              <input 
                type="text"
                value={newClientLogoUrl}
                onChange={(e) => setNewClientLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Client Showcase
            </button>
          </div>
        </form>

        {/* CURRENT CLIENTS LIST GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clientsList.map((client) => (
            <div key={client.id} className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl space-y-3 relative group">
              <button
                type="button"
                onClick={() => handleDeleteClient(client.id)}
                className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 bg-black/40 hover:bg-rose-950/60 border border-white/10 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100"
                title="Remove client"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-300 shrink-0">
                  {client.logoUrl ? (
                    <img src={client.logoUrl} alt={client.name} className="w-6 h-6 object-contain" />
                  ) : (
                    client.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{client.name}</h4>
                  <p className="text-[10px] text-cyan-400 font-mono truncate">{client.category}</p>
                </div>
              </div>

              {client.metric && (
                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Highlight:</span>
                  <span className="text-emerald-400 font-bold">{client.metric}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl text-xs text-slate-300 font-mono">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Real-Time Synchronization:</strong> Updating the logo automatically syncs across localStorage, client broadcast channels, and active user browser sessions.
        </span>
      </div>

    </div>
  );
};

export default PlatformLogoManager;
