import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Palette, 
  Check, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Trash2, 
  Wand2, 
  Globe,
  Layout,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { TenantBranding } from '../lib/tenantBranding';

interface WhiteLabelBrandingEditorProps {
  branding: TenantBranding;
  onChange: (updatedBranding: TenantBranding) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const PRESET_LOGOS = [
  { name: 'Abstract Cyber', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
  { name: 'Minimalist Wave', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80' },
  { name: 'Tech Circuit', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80' },
  { name: 'Organic Leaf', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80' },
  { name: 'Golden Crest', url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=200&q=80' },
  { name: 'Modern Geometric', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80' }
];

const PRESET_THEMES = [
  { name: 'Electric Indigo', primary: '#6366f1', accent: '#06b6d4', desc: 'Modern tech & SaaS default' },
  { name: 'Emerald Organic', primary: '#059669', accent: '#10b981', desc: 'Eco, health & natural dining' },
  { name: 'Warm Amber & Gold', primary: '#d97706', accent: '#f59e0b', desc: 'Hospitality, luxury & dining' },
  { name: 'Cyber Blue & Sky', primary: '#0ea5e9', accent: '#38bdf8', desc: 'Fintech & logistics' },
  { name: 'Royal Violet & Rose', primary: '#8b5cf6', accent: '#ec4899', desc: 'Creative agency & fashion' },
  { name: 'Crimson Power', primary: '#e11d48', accent: '#fb7185', desc: 'Bold e-commerce & retail' },
  { name: 'Luxury Obsidian', primary: '#0f172a', accent: '#38bdf8', desc: 'Premium corporate & legal' }
];

export default function WhiteLabelBrandingEditor({
  branding,
  onChange,
  onSave,
  isSaving = false
}: WhiteLabelBrandingEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Handle Logo File Upload (converting to Base64 Data URL)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadMessage('⚠️ Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('⚠️ Image size exceeds 5MB limit. Please select a smaller logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange({
          ...branding,
          logoUrl: result
        });
        setUploadMessage('✅ Custom brand logo uploaded successfully!');
        setTimeout(() => setUploadMessage(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Section Header */}
      <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
              <Palette className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold">White-Label Logo & Primary Color Customizer</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload custom company logo, pick primary theme colors, and broadcast branded landing page styling.
          </p>
        </div>

        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md border border-indigo-400/30 flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
            {isSaving ? 'Publishing...' : 'Save & Publish Theme'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: CUSTOM LOGO UPLOADER */}
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Custom Logo Upload</span>
                </h4>
                <p className="text-xs text-slate-400">Upload your PNG, SVG, or JPG logo to appear on headers & landing pages.</p>
              </div>

              {branding.logoUrl && (
                <button
                  onClick={() => onChange({ ...branding, logoUrl: '' })}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                  title="Remove logo"
                >
                  <Trash2 className="w-3 h-3" /> Clear Logo
                </button>
              )}
            </div>

            {/* DRAG & DROP UPLOAD BOX */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-500/20'
                  : 'border-white/15 bg-slate-900/60 hover:bg-slate-900/90 hover:border-indigo-500/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {branding.logoUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-slate-950 border border-white/20 rounded-xl shadow-lg">
                    <img
                      src={branding.logoUrl}
                      alt="Brand Logo"
                      className="max-h-20 max-w-[200px] object-contain rounded-lg"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Logo Loaded (Click or drag to replace)
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mx-auto border border-indigo-500/30">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">Click or drag & drop custom logo file</p>
                  <p className="text-[10px] text-slate-400 font-mono">Supports PNG, SVG, JPG, WebP (Max 5MB)</p>
                </div>
              )}
            </div>

            {uploadMessage && (
              <p className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 p-2.5 rounded-xl">
                {uploadMessage}
              </p>
            )}

            {/* DIRECT LOGO URL INPUT */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Or Enter Direct Image CDN URL:</label>
              <input
                type="text"
                value={branding.logoUrl}
                onChange={(e) => onChange({ ...branding, logoUrl: e.target.value })}
                placeholder="https://cdn.example.com/assets/my-company-logo.png"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* PRESET LOGOS SELECTOR */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Or Choose Sample Vector Logo Preset:</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_LOGOS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange({ ...branding, logoUrl: item.url })}
                    className={`p-1.5 rounded-xl border text-center transition cursor-pointer overflow-hidden ${
                      branding.logoUrl === item.url
                        ? 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500'
                        : 'border-white/10 bg-slate-900 hover:border-white/30'
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-9 object-cover rounded-lg" />
                    <span className="text-[9px] text-slate-400 font-mono truncate block mt-1">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: PRIMARY COLOR THEME & BRAND PALETTE */}
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Primary Color Themes & Accents</span>
              </h4>
              <p className="text-xs text-slate-400">Select curated brand color schemes or define custom HEX codes.</p>
            </div>

            {/* PRESET COLOR PALETTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_THEMES.map((theme, idx) => {
                const isSelected = branding.primaryColor === theme.primary;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange({
                      ...branding,
                      primaryColor: theme.primary,
                      accentColor: theme.accent
                    })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/60 shadow-lg'
                        : 'border-white/10 bg-slate-900 hover:border-white/25 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-white/20 shadow" style={{ backgroundColor: theme.primary }} />
                        <div className="w-4 h-4 rounded-full border border-white/20 shadow" style={{ backgroundColor: theme.accent }} />
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>

                    <p className="text-xs font-bold text-white">{theme.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{theme.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* CUSTOM HEX COLOR PICKERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Custom Primary Theme Color</label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={branding.primaryColor || '#6366f1'}
                    onChange={(e) => onChange({ ...branding, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor || '#6366f1'}
                    onChange={(e) => onChange({ ...branding, primaryColor: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Custom Accent Color</label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={branding.accentColor || '#06b6d4'}
                    onChange={(e) => onChange({ ...branding, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={branding.accentColor || '#06b6d4'}
                    onChange={(e) => onChange({ ...branding, accentColor: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* COMPANY SLOGAN & TITLE TEXT */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Branded Company / Workspace Title</label>
                <input
                  type="text"
                  value={branding.companyName}
                  onChange={(e) => onChange({ ...branding, companyName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Acme Cloud Corp"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Landing Page Hero Tagline</label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => onChange({ ...branding, tagline: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Next-Generation Enterprise Autonomous AI Platform."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl sticky top-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Logo & Brand Live Preview</span>
              </h4>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                REAL-TIME
              </span>
            </div>

            {/* DEDICATED LOGO PREVIEW COMPONENT: NAVBAR & HEADER DEMONSTRATION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase font-mono tracking-wider">
                  Navigation Bar Logo Placement
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Dark & Light Views</span>
              </div>

              {/* 1. DARK THEME NAVBAR LOGO PREVIEW */}
              <div className="bg-slate-950 border border-white/15 rounded-xl p-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Brand Logo Navbar"
                      className="h-7 w-auto max-w-[120px] object-contain rounded bg-black/40 p-1 border border-white/10 shadow"
                    />
                  ) : (
                    <div 
                      className="w-7 h-7 rounded-lg text-white font-black flex items-center justify-center text-xs shadow"
                      style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                    >
                      {branding.companyName ? branding.companyName.slice(0, 2).toUpperCase() : 'MF'}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {branding.companyName || 'Your Brand Name'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Dark Navbar Fit</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <span className="hidden sm:inline hover:text-white">Products</span>
                  <button
                    className="px-2.5 py-1 text-[10px] font-bold text-white rounded-lg shadow"
                    style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                  >
                    Portal
                  </button>
                </div>
              </div>

              {/* 2. LIGHT THEME NAVBAR LOGO PREVIEW */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-md text-slate-900">
                <div className="flex items-center gap-2.5">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Brand Logo Light Navbar"
                      className="h-7 w-auto max-w-[120px] object-contain rounded bg-slate-100 p-1 border border-slate-200"
                    />
                  ) : (
                    <div 
                      className="w-7 h-7 rounded-lg text-white font-black flex items-center justify-center text-xs shadow"
                      style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                    >
                      {branding.companyName ? branding.companyName.slice(0, 2).toUpperCase() : 'MF'}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {branding.companyName || 'Your Brand Name'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Light Navbar Fit</span>
                  </div>
                </div>

                <button
                  className="px-2.5 py-1 text-[10px] font-bold text-white rounded-lg shadow"
                  style={{ backgroundColor: branding.accentColor || '#06b6d4' }}
                >
                  Contact
                </button>
              </div>
            </div>

            {/* LANDING PAGE HEADER HERO MOCKUP */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase font-mono tracking-wider block">
                Landing Page Header Hero
              </span>

              <div className="bg-slate-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl space-y-0">
                
                {/* HERO LANDING SECTION */}
                <div className="p-5 space-y-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                  <div className="flex items-center gap-2">
                    {branding.logoUrl && (
                      <img
                        src={branding.logoUrl}
                        alt="Hero Logo Badge"
                        className="h-6 w-auto object-contain rounded bg-black/50 p-1 border border-white/20"
                      />
                    )}
                    <span 
                      className="px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full text-white shadow"
                      style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                    >
                      OFFICIAL WORKSPACE
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white leading-snug">
                    {branding.tagline || 'Elevate Your Enterprise Operations With Autonomous AI.'}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    We empower teams with intelligent automation, streamlined order management, and real-time operational analytics.
                  </p>

                  {/* CALL TO ACTION BUTTONS */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      className="px-4 py-2 font-bold text-xs rounded-xl text-white shadow-lg transition transform hover:-translate-y-0.5"
                      style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                    >
                      Get Started Now
                    </button>
                    <button
                      className="px-4 py-2 font-bold text-xs rounded-xl text-slate-200 border border-white/20 hover:bg-white/5 transition"
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* FEATURE HIGHLIGHT TILES */}
                <div className="p-4 bg-slate-900/90 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                    />
                    <p className="font-bold text-white">24/7 Autopilot</p>
                    <p className="text-slate-400">Automated workflow execution.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: branding.accentColor || '#06b6d4' }}
                    />
                    <p className="font-bold text-white">Secure Edge</p>
                    <p className="text-slate-400">End-to-end DNS isolation.</p>
                  </div>
                </div>

                {/* FOOTER BAR */}
                <div className="p-3 bg-black/80 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>© 2026 {branding.companyName || 'MarketForge'}</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> SSL Active
                  </span>
                </div>

              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-white">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Real-time Brand Propagation
              </p>
              <p className="text-[11px] text-slate-300">
                Any logo upload or theme color update selected above instantly updates all customer portals, public booking engines, and Website Builder landing pages.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
