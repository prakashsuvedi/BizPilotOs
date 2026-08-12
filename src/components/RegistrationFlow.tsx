import React, { useState, useEffect } from 'react';
import { clientAuth, clientDb } from '../lib/firebase';
import { Building2, Mail, Lock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Terminal, UtensilsCrossed, Compass, Share2, Users, MessageSquare, Globe, Bot, Send, Megaphone, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { OrchestrationEngine } from '../lib/orchestration';

const MODULE_CATALOG = [
  { id: 'restaurant', name: 'Restaurant Management System', priceNpr: 500, category: 'base', icon: UtensilsCrossed, description: 'POS, Order Management, Kitchen Display & Menu Builder' },
  { id: 'tours', name: 'Tours & Travels Management', priceNpr: 500, category: 'base', icon: Compass, description: 'Itinerary Builder, Booking Operations & Tour Packages' },
  { id: 'marketing', name: 'Digital Marketing Platform', priceNpr: 700, category: 'addon', icon: Share2, description: 'Instagram & Facebook AI Post Creator & Content Studio' },
  { id: 'hr', name: 'Simple HR & Payroll', priceNpr: 200, category: 'addon', icon: Users, description: 'Team Roster, Attendance, Payslips & Personnel Management' },
  { id: 'whatsapp', name: 'WhatsApp Automation', priceNpr: 1000, category: 'addon', icon: Send, description: 'Automated Broadcasts, Drip Campaign Triggers & Chatbots' },
  { id: 'messenger', name: 'Facebook Messenger Automation', priceNpr: 1000, category: 'addon', icon: MessageSquare, description: 'AI Messenger Bot & Automated Lead Capture' },
  { id: 'website', name: 'Basic Website Creation', priceNpr: 0, category: 'addon', icon: Globe, description: 'Responsive Website Builder with Free Custom Domain Mapping', isFree: true },
  { id: 'customercare', name: 'Customer Care AI Automation', priceNpr: 1000, category: 'addon', icon: Bot, description: '24/7 AI Customer Support & FAQ Ticket Router' },
  { id: 'email', name: 'Email Studio', priceNpr: 500, category: 'addon', icon: Mail, description: 'Drip Sequence Builder & Broadcast Newsletter Studio' },
  { id: 'adstudio', name: 'Ad Creation Package', priceNpr: 300, category: 'addon', icon: Megaphone, description: 'Meta & Google Ad Visuals Generator & Pixel Tracking' },
];

export default function RegistrationFlow({ onActivateTenant, onLogin }: { onActivateTenant: (tenant: any) => void, onLogin: (role: string, tenantId: string, email: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Module & Pricing Selection State
  const [baseIndustry, setBaseIndustry] = useState<'restaurant' | 'tours'>('restaurant');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['marketing', 'hr', 'website']);
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'esewa' | 'khalti' | 'fonepay'>('stripe');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Compute total monthly subscription in NPR and converted USD (~133.5 NPR = 1 USD)
  const totalNpr = (baseIndustry === 'restaurant' ? 500 : 500) + 
    selectedAddons.reduce((sum, id) => {
      const item = MODULE_CATALOG.find(m => m.id === id);
      return sum + (item ? item.priceNpr : 0);
    }, 0);
  
  const totalUsd = Number((totalNpr / 133.5).toFixed(2));

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter(a => a !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleRequestOTP = async () => {
    if (!email) {
      setError('Please enter your email first to request an OTP.');
      return;
    }
    try {
      const resp = await fetch("/api/tenant/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) {
        throw new Error("Failed to request OTP");
      }
      const data = await resp.json();
      setOtpSent(true);
      setLogs(prev => [...prev, `[AUTH] Verification OTP dispatched to ${email}`, `[DEBUG] Simulated OTP: ${data.simulatedOtp}`]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error requesting OTP');
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !companyName || !companyDomain || !otp) {
      setError('Please fill out all registration fields including OTP.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleRegisterAndPay = async () => {
    setError(null);
    setLogs([]);
    setIsSubmitting(true);

    const generatedTenantId = companyDomain.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '-tenant';
    const allSelectedModules = Array.from(new Set([baseIndustry, ...selectedAddons]));

    try {
      setLogs(prev => [...prev, `[AUTH] Registering tenant "${companyName}" with modules: ${allSelectedModules.join(', ')}...`]);

      // Call server endpoint
      const resp = await fetch("/api/tenants/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          domain: companyDomain,
          ownerEmail: email,
          password: password,
          baseIndustry: baseIndustry,
          selectedModules: allSelectedModules,
          paymentGateway: paymentGateway,
          currency: paymentGateway === 'stripe' ? 'USD' : 'NPR'
        })
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || "Signup failed.");
      }

      const resData = await resp.json();
      setLogs(prev => [...prev, `[PAYMENT] Initiating gateway session for ${paymentGateway.toUpperCase()}...`]);

      // Call payment API
      const payResp = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway: paymentGateway,
          tenantId: generatedTenantId,
          amountNpr: totalNpr,
          moduleIds: allSelectedModules,
          customerEmail: email,
          customerName: companyName
        })
      });

      const payData = await payResp.json();
      setLogs(prev => [...prev, `[PAYMENT] ${payData.message || 'Payment verified.'}`]);

      setSuccess(true);
      setLogs(prev => [...prev, `[SUCCESS] Account created! Activated modules: ${allSelectedModules.join(', ')}.`]);

      const newTenant = resData.tenant || {
        id: generatedTenantId,
        name: companyName,
        domain: companyDomain,
        ownerEmail: email,
        isCustom: true,
        status: 'active',
        plan: 'Pro (1 Month Free Trial)',
        subscriptionPriceNpr: 0,
        mrr: 0,
        trialDaysLeft: 30,
        activatedModules: allSelectedModules,
        paymentGateway: paymentGateway,
        paymentStatus: 'free_trial'
      };

      setTimeout(() => {
        onActivateTenant(newTenant);
        onLogin('owner', generatedTenantId, email);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setLogs(prev => [...prev, `[ERROR] Workflow aborted: ${err.message}`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 1 ? 'text-indigo-400' : 'text-slate-400'}`}>
          <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-mono">1</span>
          <span>Credentials</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 2 ? 'text-indigo-400' : 'text-slate-400'}`}>
          <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-mono">2</span>
          <span>Modules</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 3 ? 'text-indigo-400' : 'text-slate-400'}`}>
          <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-mono">3</span>
          <span>Checkout</span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleNextStep1} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Organization Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Kathmandu Bistro & Travel"
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Web Domain</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">www.</span>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                placeholder="ktmbistro.com"
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-12 pr-3 py-2.5 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Owner Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@ktmbistro.com"
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none font-mono tracking-wider"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Verification Code (OTP)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none tracking-widest font-mono"
                required
              />
              <button
                type="button"
                onClick={handleRequestOTP}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl transition whitespace-nowrap cursor-pointer"
              >
                {otpSent ? 'Resend Code' : 'Send OTP'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
          >
            <span>Continue to Module Packages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Select Industry Base & Activated Modules</h3>
            <p className="text-xs text-slate-400">Choose your base management system and add-on platforms. Activated modules will be immediately accessible in your workspace.</p>
          </div>

          {/* Base Industry System Selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">1. Base Business System (NPR 500 / month)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                onClick={() => setBaseIndustry('restaurant')}
                className={`p-3 rounded-xl border cursor-pointer transition ${baseIndustry === 'restaurant' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Restaurant Management</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">NPR 500/mo</span>
                </div>
                <p className="text-[11px] text-slate-400">POS, menu builder, order tracking & kitchen display system.</p>
              </div>

              <div 
                onClick={() => setBaseIndustry('tours')}
                className={`p-3 rounded-xl border cursor-pointer transition ${baseIndustry === 'tours' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Tours & Travels</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">NPR 500/mo</span>
                </div>
                <p className="text-[11px] text-slate-400">Itinerary builder, booking manager & tour package operations.</p>
              </div>
            </div>
          </div>

          {/* Add-on Modules Catalog */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">2. Select Add-on Modules</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {MODULE_CATALOG.filter(m => m.category === 'addon').map(mod => {
                const Icon = mod.icon;
                const isSelected = selectedAddons.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleAddon(mod.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start justify-between gap-2 ${isSelected ? 'bg-indigo-950/30 border-indigo-500/80 text-white' : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{mod.name}</div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{mod.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-mono font-bold block ${mod.isFree ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {mod.isFree ? 'FREE' : `NPR ${mod.priceNpr}`}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto mt-0.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Tally */}
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-300 font-bold uppercase font-mono">Calculated Monthly Subscription</span>
              <p className="text-xs text-slate-400">{1 + selectedAddons.length} Modules Selected ({baseIndustry} + {selectedAddons.length} add-ons)</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-emerald-400">NPR {totalNpr}</span>
              <span className="text-[11px] text-slate-400 block font-mono">≈ ${totalUsd} USD / mo</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Select Payment Gateway</h3>
            <p className="text-xs text-slate-400">All payments are connected securely via server-side APIs & webhooks.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => setPaymentGateway('stripe')}
              className={`p-3 rounded-xl border cursor-pointer transition ${paymentGateway === 'stripe' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Stripe International</span>
              </div>
              <p className="text-[10px] text-slate-400">Visa, Mastercard, Amex, Apple Pay (${totalUsd} USD)</p>
            </div>

            <div 
              onClick={() => setPaymentGateway('esewa')}
              className={`p-3 rounded-xl border cursor-pointer transition ${paymentGateway === 'esewa' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">eSewa Nepal</span>
              </div>
              <p className="text-[10px] text-slate-400">Direct eSewa Web Checkout (NPR {totalNpr})</p>
            </div>

            <div 
              onClick={() => setPaymentGateway('khalti')}
              className={`p-3 rounded-xl border cursor-pointer transition ${paymentGateway === 'khalti' ? 'bg-purple-950/40 border-purple-500' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Khalti Wallet</span>
              </div>
              <p className="text-[10px] text-slate-400">Khalti Pay API & Banking (NPR {totalNpr})</p>
            </div>

            <div 
              onClick={() => setPaymentGateway('fonepay')}
              className={`p-3 rounded-xl border cursor-pointer transition ${paymentGateway === 'fonepay' ? 'bg-amber-950/40 border-amber-500' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Fonepay / Mobile Banking</span>
              </div>
              <p className="text-[10px] text-slate-400">QR & Mobile Banking Nepal (NPR {totalNpr})</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Organization:</span>
              <span className="text-white font-bold">{companyName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Domain:</span>
              <span className="text-indigo-400 font-mono">{companyDomain}</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1 mt-1">
              <span>Total Subscription:</span>
              <span className="text-emerald-400 font-mono font-bold">NPR {totalNpr} / month</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p>Payment authorized! Initializing activated workspace...</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleRegisterAndPay}
              disabled={isSubmitting || success}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing Secure Gateway...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Activate & Pay NPR {totalNpr}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* System Execution Logs */}
      {logs.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-left space-y-1 max-h-[140px] overflow-y-auto">
          <div className="text-slate-400 border-b border-slate-800 pb-1 flex justify-between select-none">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-indigo-400" />
              PROVISIONING & PAYMENT LOGS
            </span>
            <span className="text-indigo-400 animate-pulse">● SECURE</span>
          </div>
          {logs.map((log, lIdx) => (
            <div key={lIdx} className={log.includes('[ERROR]') ? 'text-rose-400 font-bold' : log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
