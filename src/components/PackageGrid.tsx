import { useCurrency } from '../lib/CurrencyContext';
import React, { useState } from 'react';
import CheckoutModal from './CheckoutModal';
import { Check, Zap, Building2, Shield, Crown } from 'lucide-react';

interface PackageGridProps {
  currentPlan: string;
  activeTenant?: any;
}

export default function PackageGrid({ currentPlan, activeTenant }: PackageGridProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const { formatCurrency } = useCurrency();
  const handleSubscribe = (pkg: any) => {
    if (pkg.mrr === 0) return;
    const amountToPay = Math.max(0, pkg.mrr - currentMrr);
    if (amountToPay === 0) {
       alert("Downgrades will take effect at the end of your current billing cycle. Please contact support to finalize this change.");
       return;
    }
    setSelectedPkg({ ...pkg, amountToPay });
  };

  const handleCheckoutConfirm = async (method: string) => {
    if (!selectedPkg) return;
    setLoadingPlan(selectedPkg.name);
    try {
      // In a real app, 'method' would determine which endpoint to call (Stripe vs NepalPay)
      const endpoint = method === 'local' ? '/api/subscription/nepalpay/initiate' : '/api/subscription/stripe/initiate';
      
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
          plan_name: selectedPkg.name,
          amount: method === 'local' ? selectedPkg.amountToPay * 133 : selectedPkg.amountToPay,
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
      setLoadingPlan(null);
      // Keep modal open if error, or close it if needed. 
    }
  };

  const packages = [
    {
      name: 'Trial',
      mrr: 0,
      icon: Zap,
      color: 'text-slate-400',
      bgColor: 'bg-slate-400/10',
      borderColor: 'border-slate-500/30',
      features: [
        '30-Day Full Access',
        'Zero Upfront Charge',
        'Full Module Access',
        'Direct Support'
      ]
    },
    {
      name: 'Starter',
      mrr: 49,
      icon: Building2,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10',
      borderColor: 'border-indigo-500/30',
      features: [
        'Unlimited AI Operations',
        'Standard Dashboards',
        'Up to 3 Agent Seats',
        'Email Support'
      ]
    },
    {
      name: 'Growth',
      mrr: 249,
      icon: Shield,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-500/30',
      features: [
        'Everything in Starter',
        'Advanced Orchestration',
        'Up to 10 Agent Seats',
        'Priority Slack Support'
      ]
    },
    {
      name: 'Enterprise',
      mrr: 999,
      icon: Crown,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      borderColor: 'border-amber-500/30',
      features: [
        'Dedicated Infrastructure',
        'Unlimited Agent Seats',
        'Custom SSO (SAML/OIDC)',
        '24/7 Dedicated Account Rep'
      ]
    }
  ];
  
  const currentPkg = packages.find(p => p.name === currentPlan) || packages[0];
  const currentMrr = currentPkg.mrr;
  

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {packages.map((pkg) => {
        const Icon = pkg.icon;
        const isCurrent = currentPlan === pkg.name;
        const isDowngrade = pkg.mrr < currentMrr && pkg.mrr !== 0;
        const isPopular = pkg.name === 'Growth' && currentPlan === 'Trial';

        return (
          <div key={pkg.name} className={`relative bg-[#0e101a] border rounded-2xl flex flex-col ${isCurrent ? pkg.borderColor : 'border-white/5'} ${isPopular ? 'transform md:-translate-y-2 shadow-xl shadow-indigo-500/10' : ''}`}>
            {isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            
            <div className="p-6 border-b border-white/5 flex-1">
              <div className={`w-10 h-10 rounded-xl ${pkg.bgColor} ${pkg.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">{pkg.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-white">{formatCurrency(pkg.mrr)}</span>
                <span className="text-xs text-slate-400">/mo</span>
              </div>
              
              <ul className="mt-6 space-y-3">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.color}`} />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6">
              <button 
                disabled={isCurrent || loadingPlan === pkg.name || pkg.name === 'Trial'}
                onClick={() => handleSubscribe(pkg)}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${
                  isCurrent || pkg.name === 'Trial'
                     ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                     : isDowngrade
                     ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                     : 'bg-white hover:bg-slate-100 text-slate-900 cursor-pointer shadow-sm'
                }`}
              >
                {loadingPlan === pkg.name ? 'Processing...' : isCurrent ? 'Current Plan' : pkg.name === 'Trial' ? 'Not Available' : isDowngrade ? `Downgrade to ${pkg.name}` : `Upgrade to ${pkg.name}`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
      <CheckoutModal 
        isOpen={!!selectedPkg} 
        onClose={() => { if (!loadingPlan) setSelectedPkg(null); }} 
        selectedPlan={selectedPkg}
        onConfirm={handleCheckoutConfirm}
        isLoading={!!loadingPlan}
      />
    </>
  );
}
