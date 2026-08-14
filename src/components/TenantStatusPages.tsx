import React from 'react';
import { MarketForgeLogo } from './MarketForgeLogo';
import { 
  Building2, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  Globe, 
  HelpCircle,
  PlusCircle,
  Mail,
  Home
} from 'lucide-react';

export interface TenantNotFoundProps {
  slug: string;
  onNavigateHome: () => void;
  onOpenRegister?: () => void;
}

export function TenantNotFoundPage({ slug, onNavigateHome, onOpenRegister }: TenantNotFoundProps) {
  return (
    <div className="min-h-screen bg-[#07080E] text-slate-100 font-sans flex flex-col justify-between p-4 md:p-8 relative overflow-hidden" id="tenant-404-wrapper">
      
      {/* Background Halos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center z-10 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <MarketForgeLogo variant="header" className="h-10 md:h-12 w-auto" />
        </div>
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-indigo-400" />
          <span>MarketForge Home</span>
        </button>
      </header>

      {/* Main 404 Content Card */}
      <main className="max-w-2xl mx-auto w-full z-10 py-12 px-4 text-center space-y-6">
        <div className="bg-[#0B0D19]/90 border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-500/15 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] font-bold rounded-full uppercase tracking-wider">
              HTTP 404 — Workspace Unresolved
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tenant Workspace Not Found
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              No active tenant workspace exists at path <strong className="text-rose-300 font-mono bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">/{slug}</strong>.
            </p>
          </div>

          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left font-mono text-xs space-y-2 text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Possible Reasons:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1">
              <li>The tenant name or URL was mistyped.</li>
              <li>The business workspace has not been created or registered yet.</li>
              <li>The tenant slug has been renamed or migrated.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Platform Homepage</span>
            </button>

            {onOpenRegister && (
              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/15 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Register This Workspace</span>
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs font-mono text-slate-400 py-4 border-t border-white/10 z-10">
        MarketForge OS Multi-Tenant Ingress Router &bull; Tenant Isolation Security Layer
      </footer>

    </div>
  );
}

export interface InactiveTenantProps {
  tenant: any;
  onNavigateHome: () => void;
}

export function InactiveTenantPage({ tenant, onNavigateHome }: InactiveTenantProps) {
  return (
    <div className="min-h-screen bg-[#07080E] text-slate-100 font-sans flex flex-col justify-between p-4 md:p-8 relative overflow-hidden" id="tenant-suspended-wrapper">
      
      {/* Background Halos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center z-10 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <MarketForgeLogo variant="header" className="h-10 md:h-12 w-auto" />
        </div>
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-indigo-400" />
          <span>MarketForge Home</span>
        </button>
      </header>

      {/* Main Content Card */}
      <main className="max-w-2xl mx-auto w-full z-10 py-12 px-4 text-center space-y-6">
        <div className="bg-[#0B0D19]/90 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/15 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px] font-bold rounded-full uppercase tracking-wider">
              Workspace Suspended / Inactive
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {tenant?.name || 'Business Workspace'} is Temporarily Inactive
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              This business workspace is currently suspended or undergoing administrative review. Public landing pages and API services for this workspace are paused.
            </p>
          </div>

          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left font-mono text-xs space-y-2 text-slate-400">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Workspace Identifier:</span>
              <span className="text-white font-bold">{tenant?.id || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Current Status:</span>
              <span className="text-amber-400 font-bold uppercase">{tenant?.status || 'Suspended'}</span>
            </div>
            {tenant?.ownerEmail && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Workspace Contact:</span>
                <span className="text-indigo-300">{tenant.ownerEmail}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Platform Homepage</span>
            </button>
            <a
              href={`mailto:${tenant?.ownerEmail || 'support@marketforge-os.app'}?subject=Workspace%20Inquiry%20-%20${encodeURIComponent(tenant?.id || '')}`}
              className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/15 flex items-center justify-center gap-2 transition"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Contact Workspace Support</span>
            </a>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs font-mono text-slate-400 py-4 border-t border-white/10 z-10">
        MarketForge OS Multi-Tenant Access Governor &bull; Enterprise Compliance Policy
      </footer>

    </div>
  );
}
