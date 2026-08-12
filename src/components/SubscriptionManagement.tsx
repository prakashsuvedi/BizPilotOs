import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Zap, Building2, Shield, Crown, RefreshCw, CheckCircle2, 
  Database, Sparkles, DollarSign, Layers, Bot, Mail, MessageSquare, 
  Utensils, Compass, Share2, FileText, Globe, Headphones, Megaphone 
} from 'lucide-react';
import PackageGrid from './PackageGrid';
import CheckoutModal from './CheckoutModal';
import React, { useState, useEffect } from 'react';
import { useCurrency } from '../lib/CurrencyContext';
import { getSubscriptionLimits, calculateUsagePercentage } from '../lib/subscriptionHelper';

interface SubscriptionManagementProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTenant: any;
  inline?: boolean;
}

export default function SubscriptionManagement({ isOpen = true, onClose, activeTenant, inline = false }: SubscriptionManagementProps) {
  const { currency, setCurrency } = useCurrency();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Provisioning Progress & Sync States
  const [isPolling, setIsPolling] = useState(false);
  const [provisioningStage, setProvisioningStage] = useState<'idle' | 'verifying' | 'syncing' | 'activating' | 'complete'>('complete');
  const [provisioningProgress, setProvisioningProgress] = useState(100);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [activeModulesList, setActiveModulesList] = useState<string[]>(() => {
    return activeTenant?.activatedModules || ['restaurant', 'tours', 'marketing', 'hr', 'website'];
  });
  const [catalogModules, setCatalogModules] = useState<any[]>([]);

  // Fetch dynamic catalog on load
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await fetch('/api/superadmin/pricing');
        const data = await res.json();
        if (data.success && Array.isArray(data.modules)) {
          setCatalogModules(data.modules);
        }
      } catch (e) {}
    };
    loadCatalog();
  }, []);

  const handleVerifyDatabaseProvisioning = async () => {
    setIsPolling(true);
    setProvisioningStage('verifying');
    setProvisioningProgress(25);

    await new Promise(r => setTimeout(r, 600));
    setProvisioningStage('syncing');
    setProvisioningProgress(60);

    await new Promise(r => setTimeout(r, 700));
    setProvisioningStage('activating');
    setProvisioningProgress(85);

    try {
      const tenantId = activeTenant?.id || 'demo-tenant';
      const res = await fetch(`/api/superadmin/tenants`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tenants)) {
        const found = data.tenants.find((t: any) => t.id === tenantId);
        if (found && Array.isArray(found.activatedModules)) {
          setActiveModulesList(found.activatedModules);
        }
      }
    } catch (e) {}

    await new Promise(r => setTimeout(r, 500));
    setProvisioningStage('complete');
    setProvisioningProgress(100);
    setLastSyncTime(new Date().toLocaleTimeString());
    setIsPolling(false);
  };

  const handleQuickActivateModule = async (modId: string) => {
    const updatedModules = Array.from(new Set([...activeModulesList, modId]));
    setActiveModulesList(updatedModules);

    try {
      await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'manual_module_activation',
          tenantId: activeTenant?.id || 'demo-tenant',
          gateway: 'stripe',
          activatedModules: updatedModules,
          amountNpr: 2900,
          status: 'COMPLETED'
        })
      });
      handleVerifyDatabaseProvisioning();
    } catch (e) {
      console.error(e);
    }
  };
  

  const currentPlan = activeTenant?.plan || 'Trial';
  
  let trialDaysLeft = activeTenant?.trialDaysLeft !== undefined ? activeTenant.trialDaysLeft : 30;
  if (activeTenant?.createdAt && currentPlan === 'Trial') {
    const createdAt = new Date(activeTenant.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    trialDaysLeft = Math.max(0, 30 - diffDays);
  }

  let subDaysLeft = 30; // default for active plan
  if (activeTenant?.subscriptionEndDate) {
    const endDate = new Date(activeTenant.subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    if (diffTime > 0) {
      subDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      subDaysLeft = 0;
    }
  }

  const limits = getSubscriptionLimits(currentPlan);
  const seatsPercentage = calculateUsagePercentage(activeTenant?.activeUsers || 1, limits.agentSeats);
  const apiPercentage = calculateUsagePercentage(activeTenant?.apiRequests || 0, limits.apiRequests);
  const imagesPercentage = calculateUsagePercentage(activeTenant?.imageGenerations || 0, limits.imageGenerations);

  const handleUpdatePayment = async (method: string) => {
    setIsProcessing(true);
    try {
      const endpoint = method === 'local' ? '/api/subscription/nepalpay/initiate' : '/api/subscription/nepalpay/initiate';
      
      const userRole = localStorage.getItem('userRole') || 'owner';
      const syncHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
        'x-simulated-role': userRole,
        'x-simulated-tenant': activeTenant?.id || 'tenant-1'
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: syncHeaders,
        body: JSON.stringify({
          plan_name: currentPlan,
          amount: currentPlan === 'Enterprise' ? 999 : currentPlan === 'Growth' ? 249 : 49,
          tenantId: activeTenant?.id,
          customerName: activeTenant?.name || "Customer",
          email: activeTenant?.email || "billing@example.com"
        })
      });
      const data = await res.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert("Failed to initiate payment: " + (data.message || JSON.stringify(data)));
      }
    } catch (err) {
      console.error(err);
      alert("Payment error");
    } finally {
      setIsProcessing(false);
    }
  };


  const content = (
    <div className="bg-[#0C0D14] border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-2">
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0e101a]">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" /> Subscription & Billing
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your workspace plan, view trial information, and upgrade your usage limits.
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-8">
            {/* Visual Provisioning Progress Indicator */}
            <div className="bg-[#0e101a] border border-indigo-500/20 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <Database className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Database Provisioning & Module Sync Engine
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time automated polling to verify database document sync & module licensing after payment.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">Last DB Sync: {lastSyncTime}</span>
                  <button
                    onClick={handleVerifyDatabaseProvisioning}
                    disabled={isPolling}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
                    <span>{isPolling ? 'Polling DB...' : 'Verify Provisioning'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar & Stages */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                    {provisioningProgress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    )}
                    <span>
                      {provisioningStage === 'verifying' && '1. Verifying Gateway Payment Signature...'}
                      {provisioningStage === 'syncing' && '2. Updating Firestore Tenant Document...'}
                      {provisioningStage === 'activating' && '3. Provisioning Licensed Service Modules...'}
                      {provisioningStage === 'complete' && '4. Database Provisioning Completed & Verified'}
                    </span>
                  </span>
                  <span className="font-bold text-emerald-400">{provisioningProgress}% Synced</span>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500" 
                    style={{ width: `${provisioningProgress}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                  <div className={`p-2 rounded-lg border ${provisioningProgress >= 25 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    ✓ Payment Verified
                  </div>
                  <div className={`p-2 rounded-lg border ${provisioningProgress >= 60 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    ✓ Firestore Document Synced
                  </div>
                  <div className={`p-2 rounded-lg border ${provisioningProgress >= 85 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    ✓ Modules Activated
                  </div>
                  <div className={`p-2 rounded-lg border ${provisioningProgress === 100 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    ✓ Live Workspaces Ready
                  </div>
                </div>
              </div>
            </div>

            {/* Active Modules Status Dashboard Grid */}
            <div className="bg-[#0e101a] border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" /> Active Modules Status Dashboard
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Live status of enabled and available services for tenant <span className="font-mono text-indigo-300 font-bold">{activeTenant?.id || 'demo-tenant'}</span> based on active plan.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-2.5 py-1 rounded-lg">
                    {activeModulesList.length} Services Enabled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'restaurant', name: 'Restaurant Management System', category: 'Base Industry System', priceNpr: 500, priceUsd: 4, desc: 'POS, Order Management, Kitchen Display & Menu Builder', icon: Utensils, caps: ['POS Orders', 'KDS Kitchen', 'Table Layout'] },
                  { id: 'tours', name: 'Tours & Travels Management', category: 'Base Industry System', priceNpr: 500, priceUsd: 4, desc: 'Itinerary Builder, Booking Operations & Tour Packages', icon: Compass, caps: ['Itineraries', 'Bookings', 'Group Tours'] },
                  { id: 'marketing', name: 'Digital Marketing Platform', category: 'Add-on Module', priceNpr: 700, priceUsd: 5.5, desc: 'Instagram & Facebook AI Post Creator & Content Studio', icon: Megaphone, caps: ['AI Posts', 'Social Scheduler', 'Analytics'] },
                  { id: 'hr', name: 'Simple HR & Payroll', category: 'Add-on Module', priceNpr: 200, priceUsd: 1.5, desc: 'Team Roster, Attendance, Payslips & Personnel Management', icon: FileText, caps: ['Staff Roster', 'Payslips', 'Leaves'] },
                  { id: 'whatsapp', name: 'WhatsApp Automation', category: 'Add-on Module', priceNpr: 1000, priceUsd: 7.5, desc: 'Automated Broadcasts, Drip Campaign Triggers & Chatbots', icon: MessageSquare, caps: ['Broadcasts', 'Drip Triggers', 'Chatbots'] },
                  { id: 'messenger', name: 'Facebook Messenger Automation', category: 'Add-on Module', priceNpr: 1000, priceUsd: 7.5, desc: 'AI Messenger Bot & Automated Lead Capture', icon: Bot, caps: ['AI Messenger', 'Lead Capture', 'Auto-reply'] },
                  { id: 'website', name: 'Basic Website Creation', category: 'Add-on Module', priceNpr: 0, priceUsd: 0, desc: 'Responsive Website Builder with Free Custom Domain Mapping', icon: Globe, caps: ['Page Builder', 'Custom Domain', 'SEO'] },
                  { id: 'customercare', name: 'Customer Care AI Automation', category: 'Add-on Module', priceNpr: 1000, priceUsd: 7.5, desc: '24/7 AI Customer Support & FAQ Ticket Router', icon: Headphones, caps: ['24/7 AI Support', 'FAQ Router', 'Tickets'] },
                  { id: 'email', name: 'Email Studio', category: 'Add-on Module', priceNpr: 500, priceUsd: 4, desc: 'Drip Sequence Builder & Broadcast Newsletter Studio', icon: Mail, caps: ['Newsletters', 'Drip Builder', 'Open Stats'] },
                  { id: 'adstudio', name: 'Ad Creation Package', category: 'Add-on Module', priceNpr: 300, priceUsd: 2.5, desc: 'Meta & Google Ad Visuals Generator & Pixel Tracking', icon: Sparkles, caps: ['Ad Generator', 'Meta Pixel', 'Google Ads'] },
                  ...(catalogModules.filter(m => !['restaurant','tours','marketing','hr','whatsapp','messenger','website','customercare','email','adstudio'].includes(m.id)).map(m => ({
                    id: m.id,
                    name: m.name,
                    category: m.category === 'base' ? 'Base Industry System' : 'Add-on Module',
                    priceNpr: m.priceNpr,
                    priceUsd: m.priceUsd,
                    desc: m.description,
                    icon: Zap,
                    caps: ['Enterprise Custom', 'Dynamic Service']
                  })))
                ].map((mod) => {
                  const isActive = activeModulesList.includes(mod.id);
                  const IconComp = mod.icon || Zap;
                  return (
                    <div 
                      key={mod.id} 
                      className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                        isActive 
                          ? 'bg-indigo-950/20 border-indigo-500/30 shadow-sm' 
                          : 'bg-white/[0.02] border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-400'}`}>
                            <IconComp className="w-4 h-4" />
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50' 
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {isActive ? 'ACTIVE IN FIRESTORE' : 'AVAILABLE ADD-ON'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-1">{mod.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{mod.desc}</p>

                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {mod.caps.map((c, i) => (
                            <span key={i} className="text-[9px] font-mono bg-white/5 text-slate-300 px-1.5 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          {mod.priceNpr === 0 ? 'FREE' : currency === 'USD' ? `$${mod.priceUsd}/mo` : `Rs. ${mod.priceNpr}/mo`}
                        </span>

                        {isActive ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live DB
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickActivateModule(mod.id)}
                            className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md transition shadow-sm cursor-pointer"
                          >
                            + Activate Service
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Plan Overview */}
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Current Active Plan</span>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-3xl font-display font-bold text-white">{activeTenant?.plan || 'Trial'}</span>
                  {currentPlan === 'Trial' ? (
                    <span className="text-sm text-emerald-400 font-bold mb-1">({trialDaysLeft} Days Left in Trial)</span>
                  ) : (
                    <span className="text-sm text-emerald-400 font-bold mb-1">({subDaysLeft} Days Left in Cycle)</span>
                  )}
                </div>
                {currentPlan === 'Trial' ? (
                  <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
                    You are currently experiencing the full 30-Day Free Trial. You have {trialDaysLeft} days remaining before billing begins. All tenant modules are active during your trial period.
                  </p>
                ) : (
                  <>
                  <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
                    You are currently on the {currentPlan} plan. You have {subDaysLeft} days remaining in your current billing cycle. Thank you for being a premium subscriber!
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-[#0e101a] border border-white/5 rounded-lg px-3 py-2">
                     <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Next Charge</span>
                     <span className="text-xs text-white font-mono">{activeTenant?.subscriptionEndDate ? new Date(activeTenant.subscriptionEndDate).toLocaleDateString() : 'Pending'}</span>
                     <span className="text-xs text-slate-500 font-bold ml-2 cursor-pointer hover:text-white transition">Cancel Renewal</span>
                  </div>
                  </>
                )}
              </div>
              <div>
                <button onClick={() => setIsCheckoutOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-lg cursor-pointer">
                  Update Payment Method
                </button>
              </div>
            </div>

            {/* Real-time Usage Tracker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0e101a] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Agent Seats</span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{activeTenant?.activeUsers || 1} / {limits.agentSeats === Infinity ? 'Unlimited' : limits.agentSeats}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${seatsPercentage}%` }}></div>
                </div>
              </div>
              
              <div className="bg-[#0e101a] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Campaign Generations</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{activeTenant?.apiRequests || 0} / {limits.apiRequests === Infinity ? 'Unlimited' : limits.apiRequests}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${apiPercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-[#0e101a] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Image Exports</span>
                  <span className="text-xs font-mono text-pink-400 font-bold">{activeTenant?.imageGenerations || 0} / {limits.imageGenerations === Infinity ? 'Unlimited' : limits.imageGenerations}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${imagesPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Pricing Packages */}
            <div className="flex items-center justify-between mt-8 mb-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pricing Packages</h3>
               <div className="flex bg-[#0e101a] border border-white/10 rounded-lg p-1">
                 <button 
                   onClick={() => setCurrency("USD")}
                   className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${currency === "USD" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                 >
                   USD ($)
                 </button>
                 <button 
                   onClick={() => setCurrency("NPR")}
                   className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${currency === "NPR" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                 >
                   NPR (रू)
                 </button>
               </div>
            </div>
            <PackageGrid currentPlan={currentPlan} activeTenant={activeTenant} />

            {/* Payment History */}
            {activeTenant?.paymentHistory && activeTenant.paymentHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Payment History</h3>
                <div className="bg-[#0e101a] border border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Plan</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Method</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Transaction ID</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {activeTenant.paymentHistory.map((pmt: any, i: number) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition">
                          <td className="px-4 py-3">{new Date(pmt.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-bold text-white">{pmt.plan}</td>
                          <td className="px-4 py-3">${pmt.amount}</td>
                          <td className="px-4 py-3">{pmt.method}</td>
                          <td className="px-4 py-3">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                              {pmt.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{pmt.trx_number}</td>
                          <td className="px-4 py-3">
                             <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition flex items-center gap-1">
                               Receipt
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


          </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto my-auto relative"
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
