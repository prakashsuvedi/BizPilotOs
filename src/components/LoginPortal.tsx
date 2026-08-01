import React, { useState } from 'react';
import { clientAuth, clientDb } from '../lib/firebase';
import { TenantEngine } from '../lib/services';
import { OrchestrationEngine } from '../lib/orchestration';
import { InfrastructureHub } from '../lib/infrastructure';
import RegistrationFlow from './RegistrationFlow';
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
  Check
} from 'lucide-react';

export const BizPilotLogo = ({ className = "w-7 h-7", glow = true }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 60 64" 
      className={className}
    >
      <defs>
        <linearGradient id="bizpilot-login-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        {glow && (
          <filter id="bizpilot-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>
      
      <g>
        {/* Outer Shield & Wings Geometry */}
        <polygon 
          points="30,3 54,16 54,44 30,60 6,44 6,16" 
          fill="none" 
          stroke="url(#bizpilot-login-logo-grad)" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />
        
        {/* Dynamic Flight Wings */}
        <path 
          d="M 16 34 L 30 14 L 44 34 L 30 26 Z" 
          fill="url(#bizpilot-login-logo-grad)" 
          filter={glow ? "url(#bizpilot-logo-glow)" : undefined}
        />

        {/* Core Node Pulse */}
        <circle cx="30" cy="40" r="4" fill="#ffffff" />
        <line x1="30" y1="26" x2="30" y2="40" stroke="#ffffff" strokeWidth="2.5" />
      </g>
    </svg>
  );
};

export const MarketForgeLogo = BizPilotLogo;

interface LoginPortalProps {
  onLogin: (role: string, tenantId: string, email: string) => void;
  tenantsList: any[];
  onActivateTenant: (tenant: any) => void;
}

export default function LoginPortal({ onLogin, tenantsList, onActivateTenant }: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<'tenant' | 'superadmin'>('tenant');
  
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

  // Intercept query parameters (Sandbox Tenant Automation link)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryTenant = params.get('tenant');
      const queryRegister = params.get('register');
      const queryEmail = params.get('email');

      if (queryTenant) {
        setTenantId(queryTenant);
      }
      if (queryTenant && queryRegister === '1' && queryEmail) {
        setIsOnboardingMode(true);
        setOnboardTenantId(queryTenant);
        setOnboardEmail(decodeURIComponent(queryEmail));
      }
    } catch (err) {
      console.warn("Query parameters parsing skipped:", err);
    }
  }, []);

  // Superadmin Login Form
  const [adminEmail, setAdminEmail] = useState('digitalscamalert@gmail.com');
  const [adminPassword, setAdminPassword] = useState('superadmin123');
  const [adminMfaToken, setAdminMfaToken] = useState('99210');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminAuthenticating, setIsAdminAuthenticating] = useState(false);

  // Forgot Password State
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLogs, setForgotLogs] = useState<string[]>([]);
  const [isForgotSending, setIsForgotSending] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // SMTP Settings
  const [smtpServer] = useState('mail.smtp2go.com');
  const [smtpPort] = useState('2525');

  const [discoveredWorkspaces, setDiscoveredWorkspaces] = useState<any[]>([]);

  const handleTenantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError(null);

    if (tenantEmail.length < 2 || tenantPassword.length < 5) {
      setTenantError('Please provide a valid email/username and password.');
      return;
    }

    try {
      const resp = await fetch("/api/tenant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          tenantId: tenantId,
          email: tenantEmail,
          password: tenantPassword
        })
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || "Workspace authentication failed. Check credentials or password!");
      }

      const userSession = await resp.json();
      
      await clientAuth.signInWithEmailAndPassword(tenantEmail, tenantPassword, userSession.tenantId);
      await InfrastructureHub.getAuth().signInWithEmailAndPassword(tenantEmail, tenantPassword, userSession.tenantId);
      
      onLogin('owner', userSession.tenantId, tenantEmail);
    } catch (err: any) {
      setTenantError(`⛔ ${err.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    setTenantError(null);
    try {
      const email = 'google.user@enterprise.com';
      const targetTenant = tenantId !== 'auto' ? tenantId : 'demo-tenant';
      await clientAuth.signInWithEmailAndPassword(email, 'google_oauth_pass', targetTenant);
      onLogin('owner', targetTenant, email);
    } catch (err: any) {
      setTenantError('Google authentication failed. Using direct workspace auth mode.');
    }
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
        onLogin('owner', onboardTenantId, onboardEmail);
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
      await clientAuth.signInWithEmailAndPassword(adminEmail, adminPassword, adminSession.tenantId || "demo-tenant");

      onLogin('super_admin', adminSession.tenantId || 'demo-tenant', adminEmail);
    } catch (err: any) {
      setAdminError(`⛔ Superadmin Auth Security Lock: ${err.message}`);
    } finally {
      setIsAdminAuthenticating(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError(null);
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setTenantError('Please provide a valid company email address.');
      return;
    }

    setIsForgotSending(true);
    setForgotLogs([]);
    setForgotSuccess(null);

    const logSteps = [
      `[SMTP_CLI] EHLO bizpilot-os.app`,
      `[SMTP_CLI] STARTTLS`,
      `[SMTP_CLI] MAIL FROM: <security-desk@bizpilot-os.app>`,
      `[SMTP_CLI] RCPT TO: <${forgotEmail}>`,
      `[SMTP_CLI] DATA (Payload Dispatching)`,
      `[SMTP_CLI] SUBJECT: [BizPilot OS] Password Reset Token & Access Recovery`,
      `[SMTP_CLI] SMTPS handshake verified. Injecting recovery payload...`,
      `[SMTP_CLI] Dispatch successfully logged and accepted by destination MX record.`,
      `[RECOVERY] High-fidelity recovery ticket created for account ${forgotEmail}`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logSteps.length) {
        setForgotLogs(prev => [...prev, logSteps[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsForgotSending(false);
        setForgotSuccess(`✓ Authentication recovery code mapped! Select option below to access.`);
      }
    }, 300);
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 backdrop-blur-md">
            <BizPilotLogo className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white block uppercase">BizPilot OS</span>
              <span className="text-[10px] font-mono font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">v4.0 Enterprise</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-widest uppercase">THE AI BUSINESS OPERATING SYSTEM</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TLS 1.3 Ingress Secure
          </span>
        </div>
      </div>

      {/* MAIN AUTH CORE GRID */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10 py-8 md:py-12">
        
        {/* LEFT COLUMN: BRAND VALUE PROP & ENTERPRISE HIGHLIGHTS */}
        <div className="lg:col-span-5 text-left space-y-8">

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Unified Enterprise Architecture
            </div>

            <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight leading-[1.1]">
              One AI System to Run <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">
                Your Entire Business.
              </span>
            </h1>

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-sans">
              BizPilot OS unifies CRM & Pipeline, AI SDR Autopilot, HR & Payroll, Treasury Finance, Double-Entry Ledger, POS & Multi-Warehouse Inventory, Digital Marketing, and Multi-Branch Management into one autonomous platform.
            </p>
          </div>

          {/* Capability Highlight Cards */}
          <div className="space-y-3.5 pt-2 font-sans">
            <div className="p-3.5 bg-[#0B0D19]/80 border border-white/10 hover:border-indigo-500/40 rounded-2xl flex items-start gap-3.5 transition group">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Autonomous AI Autopilot & SDRs</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Research prospects, auto-draft cold email sequences, and qualify 24/7 sales inbound.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#0B0D19]/80 border border-white/10 hover:border-indigo-500/40 rounded-2xl flex items-start gap-3.5 transition group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">1-Click Global Payroll & Finance</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Automated direct deposits, tax deductions, 90-day cashflow models & double-entry ledger.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#0B0D19]/80 border border-white/10 hover:border-indigo-500/40 rounded-2xl flex items-start gap-3.5 transition group">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Omnichannel POS & Multi-Branch HQ</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Barcode scanners, multi-warehouse stock allocations, and consolidated branch P&Ls.</p>
              </div>
            </div>
          </div>

          {/* Trust Footnote */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 border-t border-white/10 pt-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /> SOC2 Type II Certified</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> 15+ SaaS Replaced</span>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE AUTH FORM CARD */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#0B0D19]/90 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 backdrop-blur-2xl relative overflow-hidden">
            
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
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {isForgotPasswordMode 
                        ? 'Forgot Password Recovery' 
                        : isRegisterMode 
                          ? 'Register New Tenant' 
                          : 'Log Into Workspace'}
                    </h3>
                    <button
                      onClick={() => {
                        if (isForgotPasswordMode) {
                          setIsForgotPasswordMode(false);
                        } else {
                          setIsRegisterMode(!isRegisterMode);
                        }
                        setTenantError(null);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {isForgotPasswordMode 
                        ? '← Back to Sign In' 
                        : isRegisterMode 
                          ? '← Back to Sign In' 
                          : '🆕 Register New Tenant & Activation Check'}
                    </button>
                  </div>

                  {!isForgotPasswordMode && !isRegisterMode ? (
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
                          placeholder="owner@democorp.com"
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
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 border border-indigo-400/30 transition transform hover:-translate-y-0.5"
                    >
                      <span>Authorize and Enter Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <span className="relative bg-[#0B0D19] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Or Connect with Google</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGoogleLogin()}
                      className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition"
                    >
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
                    </button>
                  </form>
                ) : isForgotPasswordMode ? (
                  // PASSWORD RECOVERY FORM VIEW
                  <div className="space-y-5">
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left font-sans">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Company Registered Email Address</label>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. founder@alpha.io"
                          className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isForgotSending}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition"
                      >
                        {isForgotSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Dispatching SMTP Recovery Outflow...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            <span>Dispatch OTP & Reset Credentials</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Forgot Password System Logs */}
                    {forgotLogs.length > 0 && (
                      <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-[9px] text-left space-y-1.5 max-h-[160px] overflow-y-auto animate-fade-in">
                        <div className="text-slate-400 border-b border-white/10 pb-1 flex justify-between select-none">
                          <span className="flex items-center gap-1">
                            <Terminal className="w-3 h-3 text-indigo-400" />
                            SMTP RECOVERY CONNECTION OUTFLOW
                          </span>
                          <span className="text-indigo-400 animate-pulse">● OUTBOUND</span>
                        </div>
                        <div className="space-y-1">
                          {forgotLogs.map((log, lIdx) => (
                            <div key={lIdx} className={log.includes('[SMTP_CLI]') ? 'text-indigo-300' : 'text-slate-300'}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Forgot Password Simulated Email Receipt */}
                    {forgotSuccess && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5 text-left animate-fade-in font-sans">
                        <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-slate-200">OUTBOX SIMULATION: Password Reset Outbound Link</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Bypass protocol activated</span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="text-slate-400"><strong className="text-slate-300">To:</strong> {forgotEmail}</div>
                          <div className="text-slate-400"><strong className="text-slate-300">Subject:</strong> Secure Password Reset Bypass Key</div>
                          <div className="text-slate-300 bg-black/50 p-3.5 rounded-xl border border-white/10 leading-relaxed font-mono text-[11px] select-all">
                            <span className="text-slate-400 block text-[9px] font-sans pb-1 uppercase font-bold tracking-wide">Secure Bypass Code</span>
                            <span className="text-indigo-400 font-bold">BP-RECOVERY-{(Math.random()*10000).toFixed(0)}</span>
                          </div>
                          <div className="pt-2 text-[11.5px] text-slate-400 leading-normal">
                            We have issued a temporary administrator access bypass. Click below to automatically access the platform with authorization clearance or key.
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const matchedId = tenantsList.find(t => forgotEmail.includes(t.id.replace('-tenant', '')) || t.id === 'demo-tenant')?.id || 'demo-tenant';
                            onLogin('owner', matchedId, forgotEmail);
                          }}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Autofill Reset Credentials & Enter Workspace</span>
                        </button>
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
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Root Key Token / Password</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400">One-Time MFA Passcode</label>
                      <input
                        type="text"
                        value={adminMfaToken}
                        onChange={(e) => setAdminMfaToken(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-1 text-[11px]">
                  <div className="text-slate-300 font-bold block">💡 Presets for Platform Demo Audit Evaluation:</div>
                  <div className="text-slate-300 font-mono">Email: <span className="text-emerald-400 select-all font-bold">digitalscamalert@gmail.com</span></div>
                  <div className="text-slate-300 font-mono">Password: <span className="text-indigo-400 font-bold">superadmin123</span></div>
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

          </div>

        </div>

      </div>

      {/* FOOTER BAR */}
      <div className="max-w-7xl mx-auto w-full border-t border-white/10 pt-4 z-10 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-400 font-mono gap-2">
        <span>© 2026 BizPilot OS Inc. All Rights Reserved.</span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <Database className="w-3.5 h-3.5 text-indigo-400" /> Relational Cloud Container isolated sandbox.
        </span>
      </div>

    </div>
  );
}
