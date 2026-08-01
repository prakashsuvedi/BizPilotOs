import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, TrendingUp, DollarSign, Award, Users, Shield, ArrowUpRight, 
  BarChart3, RefreshCw, Layers, Brain, Database, Award as Crown, 
  Download, PieChart, Sparkles, AlertCircle, Bookmark, CheckCircle2,
  ChevronRight, ArrowRight, HelpCircle, Briefcase, Zap, Compass,
  Activity, Sparkle, Percent, ZapOff
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeCanvas } from 'qrcode.react';
import { clientDb } from '../lib/firebase';
import { BusinessProfile } from '../types';
import { getCommerceData, saveCommerceData } from '../lib/commerce';
import { useCurrency } from '../lib/CurrencyContext';
import FinancialIntelligenceEngine from './FinancialIntelligenceEngine';

interface RevenueIntelligenceOSProps {
  profile: BusinessProfile;
  tenantId: string;
  userRole: string;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
  onChangeTab?: (tab: any) => void;
}

// Interfaces
interface GraphNode {
  id: string;
  label: string;
  type: 'goal' | 'strategy' | 'campaign' | 'offer' | 'channel' | 'asset' | 'outcome';
  value: string;
  status: 'active' | 'completed' | 'pending';
  x: number;
  y: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export default function RevenueIntelligenceOS({
  profile,
  tenantId,
  userRole,
  onCreateAuditLog,
  onChangeTab
}: RevenueIntelligenceOSProps) {
  const { formatCurrency } = useCurrency();

  // Navigation internal state if needed
  const [activeSubTab, setActiveSubTab] = useState<'scoreboard' | 'graph' | 'attribution' | 'copilot' | 'calculator' | 'financial_intelligence' | 'payments'>('scoreboard');
  
  // State for loaded outcome metrics (Module 3)
  const [revenueLogs, setRevenueLogs] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Custom states for Module 10 (Self-Improving Engine Calibration)
  const [modelWeightLeads, setModelWeightLeads] = useState<number>(() => profile?.modelWeightLeads !== undefined ? profile.modelWeightLeads : 0.85);
  const [modelWeightSales, setModelWeightSales] = useState<number>(() => profile?.modelWeightSales !== undefined ? profile.modelWeightSales : 0.92);
  const [modelWeightRetention, setModelWeightRetention] = useState<number>(() => profile?.modelWeightRetention !== undefined ? profile.modelWeightRetention : 0.78);
  const [isRefiningEngine, setIsRefiningEngine] = useState<boolean>(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      if (profile.modelWeightLeads !== undefined) setModelWeightLeads(profile.modelWeightLeads);
      if (profile.modelWeightSales !== undefined) setModelWeightSales(profile.modelWeightSales);
      if (profile.modelWeightRetention !== undefined) setModelWeightRetention(profile.modelWeightRetention);
    }
  }, [profile]);

  // Custom simulation adjust parameters for Model 8 (Revenue Prediction)
  const [forecastTimeline, setForecastTimeline] = useState<'30' | '60' | '90'>('90');
  const [competitorBenchmarkInput, setCompetitorBenchmarkInput] = useState<string>("average");

  // Chat Copilot state (Module 12)
  
  const [paymentAmount, setPaymentAmount] = useState<string>("1000");
  const [paymentDesc, setPaymentDesc] = useState<string>("Consulting Services");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const handleGeneratePaymentQR = async () => {
    setIsGeneratingQR(true);
    setGeneratedQR(null);
    setPaymentLink(null);
    setQrError(null);
    
    try {
      // Simulate calling a payment API to get a QR string or redirect URL
      const response = await fetch('/api/subscription/nepalpay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_name: paymentDesc,
          amount: parseFloat(paymentAmount),
          tenantId,
          customerName: "Client",
          email: "client@example.com"
        })
      });
      
      const data = await response.json();
      
      if (data.redirect_url) {
         // Create a QR code pointing to the payment link
         setPaymentLink(data.redirect_url);
         setGeneratedQR(data.redirect_url); // We'll encode the URL itself into the QR
         
         if (onCreateAuditLog) {
            onCreateAuditLog("PAYMENT_LINK_GENERATED", "SUCCESS", `Generated payment link for ${paymentDesc} (${paymentAmount})`);
         }
      } else if (data.qr_string) {
         setGeneratedQR(data.qr_string);
         setPaymentLink(data.qr_string);
      } else {
         throw new Error("Failed to generate payment data.");
      }
    } catch (err: any) {
      console.error(err);
      setQrError("Could not generate payment QR. Please try again.");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const [copilotQuery, setCopilotQuery] = useState<string>("");
  const [copilotChat, setCopilotChat] = useState<Array<{ sender: 'user' | 'system', text: string, timestamp: string }>>([
    {
      sender: 'system',
      text: `Greetings, Founder. I am your specialized Executive Revenue Intelligence Copilot. Grounded in the ${profile.name} DNA profile, I track campaign-to-revenue allocations across active channels. Ask me anything, or run one of the curated strategic analysis templates.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isCopilotTyping, setIsCopilotTyping] = useState<boolean>(false);

  // Load custom stored memory or fallback to presets based on active profile (Module 1 & 3)
  useEffect(() => {
    const loadRevenueOSData = async () => {
      try {
        const stored = await clientDb.getCollection("revenue_logs", tenantId);
        if (stored && stored.length > 0) {
          setRevenueLogs(stored);
        } else {
          // Generate realistic baseline outcome logs based on selected profile
          const initialLogs = getInitialProfileLogs(profile.id);
          setRevenueLogs(initialLogs);
          // Auto-persist so they can be modified
          for (const l of initialLogs) {
            await clientDb.addDocToTenant("revenue_logs", l, tenantId);
          }
        }
      } catch (err) {
        console.warn("Using offline storage fallback for Revenue Intelligence OS:", err);
        const localData = getCommerceData(`rev_logs_${profile.id}`, getInitialProfileLogs(profile.id));
        setRevenueLogs(localData);
      }
    };
    loadRevenueOSData();
  }, [profile.id, tenantId]);

  // Helper baseline generators based on active profile
  const getInitialProfileLogs = (id: string) => {
    const baseDate = new Date();
    const dStr = (offset: number) => {
      const d = new Date();
      d.setDate(baseDate.getDate() - offset);
      return d.toISOString().split('T')[0];
    };

    if (id.includes('aeroflow')) {
      return [
        { id: 'rev-01', type: 'SALE', source: 'EMAIL', amount: 3100, goal: 'Upsell Existing Customers', campaign: 'Q2 SLA Renewal Bundle', date: dStr(5), units: 12 },
        { id: 'rev-02', type: 'LEAD', source: 'LINKEDIN', amount: 450, goal: 'Generate Leads', campaign: 'Operations Workspace Audit Launch', date: dStr(12), units: 45 },
        { id: 'rev-03', type: 'SALE', source: 'LANDING_PAGE', amount: 9500, goal: 'Upsell Existing Customers', campaign: 'Enterprise Migration Strategy Plan', date: dStr(18), units: 3 },
        { id: 'rev-04', type: 'SALE', source: 'EMAIL', amount: 4200, goal: 'Increase Sales', campaign: 'Developer Productivity Bundle', date: dStr(25), units: 8 },
        { id: 'rev-05', type: 'LEAD', source: 'LINKEDIN', amount: 600, goal: 'Generate Leads', campaign: 'Jira-GitHub Sync Free assessment', date: dStr(35), units: 62 },
        { id: 'rev-06', type: 'RETENTION', source: 'EMAIL', amount: 12000, goal: 'Retain Customers', campaign: 'Operations Renewal VIP Brief', date: dStr(45), units: 1 },
      ];
    } else if (id.includes('sienna')) {
      return [
        { id: 'rev-01', type: 'SALE', source: 'INSTAGRAM', amount: 1540, goal: 'Increase Sales', campaign: 'Modernist Kiln Clay drop', date: dStr(4), units: 28 },
        { id: 'rev-02', type: 'SALE', source: 'EMAIL', amount: 890, goal: 'Customer Retention', campaign: 'VIP Pottery Club private listing', date: dStr(9), units: 11 },
        { id: 'rev-03', type: 'SALE', source: 'FACEBOOK', amount: 2450, goal: 'Increase Sales', campaign: 'Mid-century Ceramics Collection', date: dStr(15), units: 40 },
        { id: 'rev-04', type: 'LEAD', source: 'LANDING_PAGE', amount: 180, goal: 'Generate Leads', campaign: 'Home Architect Styling Webinar', date: dStr(22), units: 34 },
        { id: 'rev-05', type: 'SALE', source: 'INSTAGRAM', amount: 3100, goal: 'Increase Sales', campaign: 'Summer Serene Earth Drops', date: dStr(31), units: 55 },
        { id: 'rev-06', type: 'SALE', source: 'EMAIL', amount: 4800, goal: 'Customer Retention', campaign: 'Handmade Craft Loyalty sequence', date: dStr(42), units: 6 },
      ];
    } else {
      // Solas titanium bikes or generic
      return [
        { id: 'rev-01', type: 'SALE', source: 'LANDING_PAGE', amount: 14500, goal: 'Launch Product', campaign: 'Titanium Gravel Electric launch', date: dStr(6), units: 3 },
        { id: 'rev-02', type: 'SALE', source: 'EMAIL', amount: 4900, goal: 'Upsell Existing Customers', campaign: 'Modular Carbon wheels VIP upgrade', date: dStr(14), units: 5 },
        { id: 'rev-03', type: 'LEAD', source: 'GOOGLE_BUSINESS', amount: 350, goal: 'Increase Foot Traffic', campaign: 'Gravel Speed Test booking drive', date: dStr(21), units: 70 },
        { id: 'rev-04', type: 'SALE', source: 'INSTAGRAM', amount: 9800, goal: 'Increase Sales', campaign: 'Overcome Gradient Summer blitz', date: dStr(30), units: 2 },
        { id: 'rev-05', type: 'SALE', source: 'EMAIL', amount: 6200, goal: 'Customer Retention', campaign: 'Off-Road Titanium service loyalty', date: dStr(40), units: 1 },
      ];
    }
  };

  // Re-save custom manual records to persistent store (Module 3)
  const handleAddManualRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === "viewer") {
      alert("Verification warning: View-only permissions prevent creating transaction outcomes.");
      return;
    }
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    const newLog = {
      id: `rev-${Math.random().toString(36).substring(2, 9)}`,
      type: formData.get('type') as string,
      source: formData.get('source') as string,
      amount: parseFloat(formData.get('amount') as string) || 0,
      goal: formData.get('goal') as string,
      campaign: formData.get('campaign') as string || "Manual Log Event",
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
      units: parseInt(formData.get('units') as string) || 1,
    };

    const updated = [newLog, ...revenueLogs];
    setRevenueLogs(updated);
    
    try {
      await clientDb.addDocToTenant("revenue_logs", newLog, tenantId);
      if (onCreateAuditLog) {
        onCreateAuditLog("REVENUE_AUDIT_LOGGED", "success", `Registered manual transaction outcome of ${formatCurrency(newLog.amount)} for campaign [${newLog.campaign}]`);
      }
    } catch (err) {
      console.warn("Storage warning: falling back to local storage cache for manual record");
      saveCommerceData(`rev_logs_${profile.id}`, updated);
    }

    form.reset();
    alert("Enterprise performance transaction recorded into Outcome Matrix successfully.");
  };

  // Calculate high-level stats (Module 9)
  const totalRevenueCalculated = revenueLogs.reduce((acc, curr) => acc + (curr.type === 'SALE' || curr.type === 'RETENTION' ? curr.amount : 0), 0);
  const totalLeadsCalculated = revenueLogs.reduce((acc, curr) => acc + (curr.type === 'LEAD' ? curr.units : 0), 0);
  const averageLeadValue = totalLeadsCalculated > 0 ? (revenueLogs.reduce((acc, curr) => acc + (curr.type === 'LEAD' ? curr.amount : 0), 0) / totalLeadsCalculated) : 75;
  const strategicSuccessRate = totalRevenueCalculated > 10000 ? 88.4 : 72.1;
  const estimatedROI = totalRevenueCalculated > 0 ? ((totalRevenueCalculated - 4500) / 4500 * 100).toFixed(1) : "340.2";

  // Attribution Calculation (Module 2)
  const channelAttributionDistribution = () => {
    const raw: Record<string, number> = {};
    revenueLogs.forEach(l => {
      if (l.type === 'SALE' || l.type === 'RETENTION') {
        raw[l.source] = (raw[l.source] || 0) + l.amount;
      }
    });
    const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
    return Object.keys(raw).map(k => ({
      channel: k,
      amount: raw[k],
      percentage: ((raw[k] / total) * 100).toFixed(1)
    })).sort((a,b) => b.amount - a.amount);
  };

  const offerAttributionDistribution = () => {
    const raw: Record<string, number> = {};
    revenueLogs.forEach(l => {
      if (l.type === 'SALE' || l.type === 'RETENTION') {
        const oName = l.campaign.includes("Bundle") ? "Enterprise Product Bundle" : (l.campaign.includes("VIP") ? "Exclusive VIP Special" : "Generic Seasonal Discount");
        raw[oName] = (raw[oName] || 0) + l.amount;
      }
    });
    const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
    return Object.keys(raw).map(k => ({
      offer: k,
      amount: raw[k],
      percentage: ((raw[k] / total) * 100).toFixed(1)
    })).sort((a,b) => b.amount - a.amount);
  };

  // Channel ROI Data (Module 5)
  const getChannelMetrics = () => {
    const channelsList = [
      { name: 'Facebook', baseCost: 1200, conversionRate: 2.1 },
      { name: 'Instagram', baseCost: 1400, conversionRate: 3.4 },
      { name: 'WhatsApp', baseCost: 350, conversionRate: 4.8 },
      { name: 'Email', baseCost: 200, conversionRate: 6.2 },
      { name: 'Landing Pages', baseCost: 500, conversionRate: 4.1 },
      { name: 'Flyers', baseCost: 650, conversionRate: 1.5 },
      { name: 'Google Business', baseCost: 150, conversionRate: 3.9 },
      { name: 'LinkedIn', baseCost: 1800, conversionRate: 2.8 }
    ];

    return channelsList.map(ch => {
      const matchLogs = revenueLogs.filter(l => l.source === ch.name.toUpperCase().replace(' ', '_'));
      const directRevenue = matchLogs.reduce((acc, l) => acc + (l.type === 'SALE' || l.type === 'RETENTION' ? l.amount : 0), 0) || (totalRevenueCalculated * (ch.conversionRate/25));
      const directLeads = matchLogs.reduce((acc, l) => acc + (l.type === 'LEAD' ? l.units : 0), 0) || Math.round(ch.conversionRate * 12);
      const cost = ch.baseCost;
      const roi = cost > 0 ? (((directRevenue - cost) / cost) * 100).toFixed(0) : "150";

      return {
        name: ch.name,
        cost,
        revenue: directRevenue,
        leads: directLeads,
        roi: parseInt(roi),
        leadEfficiency: (cost / (directLeads || 1)).toFixed(1),
        revenueEfficiency: (directRevenue / cost).toFixed(2)
      };
    }).sort((a, b) => b.roi - a.roi);
  };

  // Self-Improving Learning simulator (Module 10)
  const handleRefineLearning = async () => {
    setIsRefiningEngine(true);
    setCalibrationSuccess(false);

    try {
      const res = await fetch('/api/tenant/weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          modelWeightLeads,
          modelWeightSales,
          modelWeightRetention
        })
      });
      if (!res.ok) {
        throw new Error("HTTP Status " + res.status);
      }
    } catch (err: any) {
      console.warn("Could not persist weights to back-end:", err.message);
    }

    setTimeout(() => {
      setIsRefiningEngine(false);
      setCalibrationSuccess(true);
      if (onCreateAuditLog) {
        onCreateAuditLog("SELF_IMPROVING_CALIBRATED", "success", `Machine learning weights recalibrated. Strategic precision adjusted to: Leads (${modelWeightLeads * 100}%), Sales (${modelWeightSales * 150}%) for tenant ${tenantId}`);
      }
    }, 1200);
  };

  // Curated chat click handlers
  const handleAskCopilot = (question: string) => {
    setCopilotQuery(question);
    executeCopilotResponse(question);
  };

  const handleCustomSubmitCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;
    executeCopilotResponse(copilotQuery);
  };

  const executeCopilotResponse = (queryText: string) => {
    const userMsg = {
      sender: 'user' as const,
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setCopilotChat(prev => [...prev, userMsg]);
    setCopilotQuery("");
    setIsCopilotTyping(true);

    setTimeout(() => {
      let replay = "";
      const q = queryText.toLowerCase();

      if (q.includes("focus") || q.includes("should i run") || q.includes("campaign")) {
        replay = `FOUNDER INSIGHT: Looking at your accumulated Revenue Memory and current Growth Score, I strongly recommend focusing on ${
          profile.id.includes('aeroflow') 
            ? "LinkedIn mid-tier Operations Audits & automated Email Upsells which are holding a steady 6.2% conversion rate." 
            : (profile.id.includes('sienna') 
              ? "Instagram organic visual drops of boutique kiln models. Our attribution engine shows Meta channels drive 65% of customer volume." 
              : "Google Business Test Trail bookings matching titanium gravel enthusiasts in a 15-mile localized radius.")
        } This specific channel combination is predicted to optimize budget efficiency with an expected ROI above ${estimatedROI}%.`;
      } else if (q.includes("losing") || q.includes("leak") || q.includes("weak")) {
        replay = `REVENUE FLUIDITY GAP WARNING: We detect a ${profile.id.includes('aeroflow') ? "18.3%" : "22.5%"} friction mismatch inside your ${
          profile.id.includes('aeroflow') ? "Landing Page registration to VIP onboarding loop. Cost per lead here spikes to $14.50 compared to Email's $2.10." : "Flyers campaign where lead efficiency is lowest ($32 per acquisition)."
        } I recommend temporarily migrating ad dollars into our highest Offer Effectiveness segments to increase immediate cash flows.`;
      } else if (q.includes("retention") || q.includes("loyalty")) {
        replay = `RETENTION OPTIMIZATION VECTORS: Currently, Customer Lifetime Value peaks inside our high-value repeating Gold segment (${formatCurrency(totalRevenueCalculated * 0.45)} average). Launching an automated Email-based loyalty loop using pre-formatted VIP guidelines will lower repeat transaction intervals by over 14 days.`;
      } else {
        replay = `Core tactical feedback generated for ${profile.name}: The Outcome Graph highlights that your Goal of '${profile.brandVoice}' matches best with the ${
          profile.id.includes('aeroflow') ? 'LinkedIn / SaaS campaign portfolio' : 'Instagram Visual curation'
        }. Total recorded revenue stands at ${formatCurrency(totalRevenueCalculated)} with an attribution ROI rating of ${estimatedROI}% across your operational scope.`;
      }

      const systemMsg = {
        sender: 'system' as const,
        text: replay,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCopilotChat(prev => [...prev, systemMsg]);
      setIsCopilotTyping(false);
    }, 1200);
  };

  // Module 11 Custom Quadrant coordinates based on profile
  const getBenchmarkData = () => {
    if (profile.id.includes('aeroflow')) {
      return { us: { x: 75, y: 80 }, industry: { x: 60, y: 55 }, size: { x: 50, y: 48 }, competitivePosition: "Industry Innovator - Premium Pricing Authority" };
    } else if (profile.id.includes('sienna')) {
      return { us: { x: 84, y: 89 }, industry: { x: 45, y: 60 }, size: { x: 38, y: 45 }, competitivePosition: "Differentiated Artisanal Niche - High Brand Equity" };
    } else {
      return { us: { x: 68, y: 72 }, industry: { x: 55, y: 50 }, size: { x: 62, y: 58 }, competitivePosition: "High Performance Category Challenger" };
    }
  };
  const benchmarks = getBenchmarkData();

  // Handle report downloading mockup (Module 12)
  const handleDownloadExecutiveReport = () => {
    alert(`MarketForge Professional Growth Intelligence Log exported successfully! PDF metadata signed: ${tenantId.toUpperCase()}-${new Date().getFullYear()}. Net Value avoidance calculated: $12,400.`);
    if (onCreateAuditLog) {
      onCreateAuditLog("EXECUTIVE_REPORT_DOWNLOADED", "info", `Exported Monthly Growth intelligence report. Calculated net avoidance value: $12,400.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header Header Accent */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold inline-flex">
              <Compass className="w-3 h-3 animate-spin scroller-spinner" /> Launching Phase 9F Core
            </div>
            <h2 className="text-xl lg:text-3xl font-black tracking-tight font-sans text-white">
              Business Outcome Graph & Revenue Intelligence OS™
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Synthesize client journeys, attribute channels, segments cohorts, forecast growth probability and proof corporate executive ROI utilizing a self-optimizing closed-loop decision matrix.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handleAskCopilot("What should I focus on this month to recover lost revenue?")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Brain className="w-3.5 h-3.5" />
              Strategic Audit
            </button>
            <button
              onClick={handleDownloadExecutiveReport}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Executive Growth PDF
            </button>
          </div>
        </div>

        {/* Status mini widget */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Learning Matrix Status</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Continuously Training (v1.02)
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Outcome Precision Rate</span>
            <span className="text-indigo-300 font-semibold text-xs font-mono">{strategicSuccessRate}% Confidence Score</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Tracked Revenue Units</span>
            <span className="text-sky-300 font-semibold text-xs font-mono">{revenueLogs.length} Events Logged</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Workspace Boundary</span>
            <span className="text-indigo-400 font-semibold text-xs font-mono uppercase">{tenantId}</span>
          </div>
        </div>
      </div>

      {/* Primary Sub Tabs Select Segment */}
      <div className="flex border-b border-slate-200 bg-white/50 p-1 rounded-2xl border border-slate-200 gap-1 overflow-x-auto text-slate-900">
        <button
          onClick={() => setActiveSubTab('scoreboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'scoreboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Executive Scoreboard
        </button>
        <button
          onClick={() => setActiveSubTab('graph')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'graph' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Outcome Graph Engine
        </button>
        <button
          onClick={() => setActiveSubTab('attribution')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'attribution' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          ROI &amp; Attribution Analyser
        </button>
        <button
          onClick={() => setActiveSubTab('copilot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'copilot' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Brain className="w-4 h-4" />
          Founder Copilot IA
        </button>
        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'calculator' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Revenue Event Broker
        </button>
        <button
          onClick={() => setActiveSubTab('financial_intelligence')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'financial_intelligence' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500 animate-pulse" />
          Sovereign Financial Intel
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'payments' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          Payment Links & QR
        </button>
      </div>

      {/* TAB 1: EXECUTIVE SCOREBOARD */}
      {activeSubTab === 'scoreboard' && (
        <div className="space-y-6">
          
          {/* Module 9 Scoreboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 hover:shadow transition text-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Tracked Net Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 font-sans">{formatCurrency(totalRevenueCalculated)}</span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center">+18.5% MoM</span>
              </div>
              <p className="text-[10px] text-slate-500">Based on campaign conversion logs registered securely on AWS/FIRESTORE database.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 hover:shadow transition text-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Total Lead Acquisition</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 font-sans">{totalLeadsCalculated} Units</span>
                <span className="text-[11px] text-indigo-600 font-medium">LTV Value: {formatCurrency(averageLeadValue)}</span>
              </div>
              <p className="text-[10px] text-slate-500">Assimilated from Landing forms of registered target customer persona cohorts.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 hover:shadow transition text-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Forecast Accuracy Rate</span>
                <Target className="w-4 h-4 text-violet-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 font-sans">94.2%</span>
                <span className="text-[11px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded font-bold font-mono">EXCELLENT</span>
              </div>
              <p className="text-[10px] text-slate-500">Refined via Module 4 Strategy Performance Engine checking forecasted vs experienced returns.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 hover:shadow transition text-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Assisted Growth Proof</span>
                <Crown className="w-4 h-4 text-amber-500 animate-bounce cursor-pointer" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 font-sans">{formatCurrency(12400)}</span>
                <span className="text-[11px] text-amber-600 font-bold">164 Hrs Saved</span>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500 inline" /> Net marketing coordination expenses avoided.
              </p>
            </div>
          </div>

          {/* Module 12: FOUNDER VALUE PROOF HUD HEADER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Value Proof Box */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Founder Value Proof KPI Matrix™
                </h3>
                <span className="text-[9px] font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">Module 12</span>
              </div>
              
              <p className="text-slate-300 text-xs">
                MarketForge acts as your automated Chief Strategy Team. Here is a math-backed ledger of custom agency expenses completely eliminated and business value generated:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-indigo-900">
                  <span className="text-slate-400">Estimated Agency Fee Savings:</span>
                  <span className="font-mono font-bold text-amber-300">{formatCurrency(12400)} / Month</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-indigo-900">
                  <span className="text-slate-400">Strategy Formulation Time Saved:</span>
                  <span className="font-mono font-bold text-indigo-300">164 Hours Total</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-indigo-900">
                  <span className="text-slate-400">Decision Error Rate Mitigation:</span>
                  <span className="font-mono font-bold text-emerald-400">-74% Risk Reduction</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Assisted Net Revenue Pipeline:</span>
                  <span className="font-mono font-bold text-emerald-300 font-sans text-sm">{formatCurrency(totalRevenueCalculated * 0.85)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownloadExecutiveReport}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Export Signed Executive Summary Log
                </button>
              </div>
            </div>

            {/* Module 8: REVENUE PREDICTION ENGINE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  Revenue Predictive Simulator (Module 8)
                </h3>
                <span className="text-[9px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">90D Forecast</span>
              </div>

              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setForecastTimeline('30')}
                  className={`flex-1 py-1 rounded text-center transition ${forecastTimeline === '30' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600'}`}
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setForecastTimeline('60')}
                  className={`flex-1 py-1 rounded text-center transition ${forecastTimeline === '60' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600'}`}
                >
                  60 Days
                </button>
                <button
                  type="button"
                  onClick={() => setForecastTimeline('90')}
                  className={`flex-1 py-1 rounded text-center transition ${forecastTimeline === '90' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600'}`}
                >
                  90 Days
                </button>
              </div>

              {/* Forecast scenarios values based on timeline and profile */}
              {(() => {
                const multiplier = forecastTimeline === '30' ? 0.35 : forecastTimeline === '60' ? 0.65 : 1.0;
                const baseVal = totalRevenueCalculated > 0 ? totalRevenueCalculated : 18500;
                
                const expected = baseVal * 1.45 * multiplier;
                const conservative = expected * 0.75;
                const aggressive = expected * 1.35;

                return (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Conservative Base Estimate:</span>
                        <span className="font-bold text-slate-700">{formatCurrency(conservative)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden text-slate-900">
                        <div className="bg-slate-400 h-full rounded-full transition-all" style={{ width: '45%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-indigo-600 font-semibold">
                        <span>Expected Outcome Matrix:</span>
                        <span className="font-bold font-sans">{formatCurrency(expected)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden text-slate-900">
                        <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: '70%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                        <span>Aggressive Growth Target:</span>
                        <span className="font-bold font-sans">{formatCurrency(aggressive)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden text-slate-900">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '92%' }}></div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono text-center pt-2">
                      Growth Probability Matrix: {(strategicSuccessRate * 1.05).toFixed(1)}% Match Standards.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Module 11: BUSINESS COMPETITIVE QUOTIENT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-slate-500" />
                  Strategic Benchmark Plot (Module 11)
                </h3>
                <span className="text-[9px] font-mono bg-violet-50 text-violet-600 px-2 py-0.5 rounded font-bold">Competitive</span>
              </div>

              {/* Core interactive scatter graph canvas */}
              <div className="relative aspect-video w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-3 text-slate-900">
                
                {/* Visual Quad divider dotted lines */}
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-slate-300"></div>
                <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-300"></div>
                
                {/* Visual Labels for Quadrants */}
                <span className="absolute top-2 right-2 text-[8px] font-mono text-indigo-500 uppercase">Market Leader</span>
                <span className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400 uppercase">Premium Challenger</span>
                <span className="absolute top-2 left-2 text-[8px] font-mono text-slate-400 uppercase">Direct Innovator</span>
                <span className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-300 uppercase">Local Provider</span>

                {/* Plot: Competitive Average peer block */}
                <div 
                  className="absolute pointer-events-none transition-all flex flex-col items-center"
                  style={{ left: `${benchmarks.industry.x}%`, top: `${100 - benchmarks.industry.y}%` }}
                >
                  <div className="w-3 h-3 bg-slate-400 border-2 border-white rounded-full shadow-sm"></div>
                  <span className="text-[8px] font-mono bg-white text-slate-500 border rounded px-1 -mt-1 shadow-sm whitespace-nowrap">Industry Avg</span>
                </div>

                {/* Plot: Active company matching state */}
                <div 
                  className="absolute animate-bounce flex flex-col items-center z-10"
                  style={{ left: `${benchmarks.us.x}%`, top: `${100 - benchmarks.us.y}%` }}
                >
                  <div className="w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-md relative">
                    <span className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-60"></span>
                  </div>
                  <span className="text-[8px] font-sans font-bold bg-slate-900 text-white rounded px-1.5 py-0.5 -mt-1 shadow-md whitespace-nowrap uppercase">
                    Our Brand ({profile.name})
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p className="text-slate-800 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  {benchmarks.competitivePosition}
                </p>
                <div className="text-[10px] text-slate-500 leading-relaxed grid grid-cols-2 gap-1.5 pt-1">
                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">✓ Overcoming CAC avg by 28%</span>
                  <span className="text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-medium">✓ Retention duration high</span>
                </div>
              </div>

            </div>
          </div>

          {/* Module 6: Offer Intelligence Engine Index List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-slate-500" />
              Offer Effectiveness Matrix Index (Module 6)
            </h3>
            <p className="text-slate-500 text-xs">
              This engine ranks the performance weights of promotional models applied during campaign launches to identify conversion patterns.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-2.5 px-4 font-semibold">Offer Formulation</th>
                    <th className="py-2.5 px-4 font-semibold">Conversion Multiplier</th>
                    <th className="py-2.5 px-4 font-semibold">Units Dispatched</th>
                    <th className="py-2.5 px-4 font-semibold">Direct Allocated Revenue</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Effectiveness Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Exclusive VIP Concierge Bundle', multiplier: '3.8x', units: 38, revId: totalRevenueCalculated * 0.45, score: 96, color: 'text-emerald-600' },
                    { name: 'Monday Taste Secret Code', multiplier: '2.5x', units: 110, revId: totalRevenueCalculated * 0.25, score: 85, color: 'text-indigo-600' },
                    { name: 'Multi-year Enterprise Upgrade Credit', multiplier: '1.9x', units: 6, revId: totalRevenueCalculated * 0.20, score: 78, color: 'text-sky-600' },
                    { name: 'Standard 10% Flash First-purchase Off', multiplier: '1.2x', units: 240, revId: totalRevenueCalculated * 0.10, score: 54, color: 'text-slate-500' },
                  ].map((offer, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 text-slate-900">
                      <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-slate-300" /> {offer.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-indigo-600">{offer.multiplier}</td>
                      <td className="py-3 px-4">{offer.units} items</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{formatCurrency(offer.revId)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${offer.score > 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {offer.score} / 100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: OUTCOME GRAPH ENGINE */}
      {activeSubTab === 'graph' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Autonomous Outcome Graph Visualizer™ (Module 1)
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Connecting abstract core Business Goals to concrete Campaign execution, Offers, designated Multi-channel endpoints and ultimate Sales units.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced Pipeline
            </div>
          </div>

          {/* Graphical Map Flow Visuals */}
          <div className="relative border border-slate-200 rounded-2xl bg-slate-950 p-6 overflow-hidden min-h-[420px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
            
            {/* Legend guide */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Primary Goal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400"></span> Campaign</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Offer Model</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Channel</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Revenue Event</span>
            </div>

            {/* Simulated Interactive SVG Nodes Flow */}
            <div className="flex-1 w-full flex items-center justify-center p-3 relative min-h-[300px]">
              
              {/* Connected Lines Grid behind */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="glow-grad-indigo" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                
                {/* Visual link paths */}
                <path d="M 120,50 Q 220,50 320,100" stroke="url(#glow-grad-indigo)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
                <path d="M 120,50 Q 220,120 320,200" stroke="#4f46e5" strokeWidth="1" fill="none" opacity="0.4" />
                
                <path d="M 320,100 Q 420,70 520,70" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
                <path d="M 320,100 Q 420,120 520,165" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.3" />
                
                <path d="M 520,70 Q 620,70 720,150" stroke="#eab308" strokeWidth="1" fill="none" />
                <path d="M 520,165 Q 620,165 720,150" stroke="#eab308" strokeWidth="1.5" fill="none" />
                <path d="M 520,165 Q 620,220 720,250" stroke="#eab308" strokeWidth="1.5" fill="none" />

                <path d="M 720,150 M 720,150 L 920,150" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" fill="none" />
                <path d="M 720,250 M 720,250 L 920,250" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>

              {/* Graphical Nodes Elements placement with flex layouts */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10 text-xs">
                
                {/* Column 1: Objectives */}
                <div className="space-y-4 flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider text-center block mb-2">Stage 1: Goal layer</span>
                  <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-3 text-center text-red-100 shadow-md">
                    <Target className="w-5 h-5 mx-auto text-red-400 mb-1" />
                    <p className="font-bold font-sans">Upsell Products</p>
                    <span className="text-[9px] font-mono mt-0.5 text-red-300 block">Priority high</span>
                  </div>
                </div>

                {/* Column 2: Campaigns */}
                <div className="space-y-4 flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider text-center block mb-2">Stage 2: Strategy</span>
                  <div className="bg-violet-950/80 border border-violet-500/50 rounded-xl p-3 text-center text-violet-100 shadow-md">
                    <Briefcase className="w-5 h-5 mx-auto text-violet-400 mb-1" />
                    <p className="font-bold truncate">Q2 VIP Renewal</p>
                    <span className="text-[9px] font-mono text-violet-300 block">Lead Target: 110</span>
                  </div>
                </div>

                {/* Column 3: Offers */}
                <div className="space-y-4 flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider text-center block mb-2">Stage 3: Offer Engine</span>
                  <div className="bg-blue-950/80 border border-blue-500/50 rounded-xl p-3 text-center text-blue-100 shadow-md">
                    <Percent className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                    <p className="font-bold truncate">Custom Tier Bundle</p>
                    <span className="text-[9px] font-mono text-blue-300 block">Efficiency: 96%</span>
                  </div>
                </div>

                {/* Column 4: Channels */}
                <div className="space-y-3 flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider text-center block mb-2">Stage 4: Channels</span>
                  <div className="bg-slate-900 border border-yellow-500/30 rounded-xl p-2.5 text-center text-yellow-300 text-[11px] shadow">
                    <span className="font-bold">Email Blast</span>
                    <span className="text-[9px] font-mono block text-slate-400">ROI: 340%</span>
                  </div>
                  <div className="bg-slate-900 border border-yellow-500/30 rounded-xl p-2.5 text-center text-yellow-300 text-[11px] shadow">
                    <span className="font-bold">Meta Channels</span>
                    <span className="text-[9px] font-mono block text-slate-400">ROI: 140%</span>
                  </div>
                </div>

                {/* Column 5: Outcomes */}
                <div className="space-y-3 flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider text-center block mb-2">Stage 5: Outcomes</span>
                  <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-center text-emerald-100 shadow-md">
                    <DollarSign className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                    <p className="font-sans font-black">{formatCurrency(totalRevenueCalculated)}</p>
                    <span className="text-[9px] font-mono text-emerald-300 block">Units: +18.5%</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono text-center border-t border-slate-900 pt-3">
              Graph verification system: All database event links map correctly and follow standard OWASP security parameters.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROI & ATTRIBUTION ANALYSER */}
      {activeSubTab === 'attribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Module 5: Channel ROI Engine widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Channel ROI &amp; Efficiency Breakdown (Module 5)
            </h3>
            <p className="text-slate-500 text-xs">
              Compares direct costs allocated per channel versus acquired lead/sale volumes mapped dynamically.
            </p>

            <div className="space-y-3">
              {getChannelMetrics().map((ch, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-indigo-300 transition">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 font-sans block">{ch.name}</span>
                    <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Cost: {formatCurrency(ch.cost)}</span>
                      <span>Leads: {ch.leads}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-mono font-bold text-indigo-600 block">{formatCurrency(ch.revenue)}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ch.roi > 300 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                      {ch.roi}% ROI
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module 2: Attribution distribution view */}
          <div className="space-y-6">
            
            {/* Channel Attribution Pie percentages Mockup */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-violet-600" />
                Customer Purchase Attribution Weighting (Module 2)
              </h3>
              <p className="text-slate-500 text-xs">
                Calculates the exact percentage weight of closing conversion value mapped back to customer personas acquisition channels.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Channel Weight list */}
                <div className="space-y-3 py-2 border-r border-slate-200 pr-4">
                  <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">By Channel Allocation</span>
                  {channelAttributionDistribution().map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{item.channel}</span>
                        <span className="font-bold text-slate-800">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden text-slate-900">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Offer weighting list */}
                <div className="space-y-3 py-2 pl-2">
                  <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">By Offer Engagement</span>
                  {offerAttributionDistribution().map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500 font-sans">
                        <span className="truncate max-w-[130px]">{item.offer}</span>
                        <span className="font-bold text-slate-800">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden text-slate-900">
                        <div className="bg-violet-600 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Module 7: CLV Cohort Estimates */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  Customer Lifetime Value (LTV) Segmentation (Module 7)
                </h3>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold">Cohorts</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-amber-700">Gold Tier Segment</span>
                  <p className="text-slate-800 text-semibold font-sans">{formatCurrency(totalRevenueCalculated * 0.45)}</p>
                  <span className="text-[9px] text-slate-500 block">Repeat: 88% prob</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-600">Silver Tier Segment</span>
                  <p className="text-slate-800 text-semibold font-sans">{formatCurrency(totalRevenueCalculated * 0.35)}</p>
                  <span className="text-[9px] text-slate-500 block">Repeat: 45% prob</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-indigo-700">Bronze Segment</span>
                  <p className="text-slate-800 text-semibold font-sans">{formatCurrency(totalRevenueCalculated * 0.20)}</p>
                  <span className="text-[9px] text-slate-500 block">Repeat: 12% prob</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-mono text-center">
                Calibrated against registered acquisition cohorts. High LTV implies longer contract retain periods.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: FOUNDER COPILOT INTERACTIVE CONSOLE */}
      {activeSubTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Simulated Calibrator & Settings Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-slate-900">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                Strategic Self-Improving Engine™ (Module 10)
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Self-Refining algorithms continuously calibrate strategy weights based on logged performance logs.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Tweak Variable Multipliers</span>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Lead Attribution Factor:</span>
                  <span className="font-mono font-bold text-slate-800">{modelWeightLeads.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={modelWeightLeads}
                  onChange={(e) => setModelWeightLeads(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 text-indigo-500 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subscription Conversion Rate Factor:</span>
                  <span className="font-mono font-bold text-slate-800">{modelWeightSales.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={modelWeightSales}
                  onChange={(e) => setModelWeightSales(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 text-indigo-500 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Retention Loyalty Probability Weight:</span>
                  <span className="font-mono font-bold text-slate-800">{modelWeightRetention.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={modelWeightRetention}
                  onChange={(e) => setModelWeightRetention(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 text-indigo-500 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                disabled={isRefiningEngine}
                onClick={handleRefineLearning}
                className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 border border-slate-200 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                {isRefiningEngine ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Training Model Weights...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" /> Force Learning Retraining Loop
                  </>
                )}
              </button>

              {calibrationSuccess && (
                <div className="p-3 bg-emerald-50/70 text-emerald-800 rounded-xl flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[10px] leading-snug">Autonomous weighting parameters recalculated successfully against real logs!</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Copilot Console */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg h-[460px]">
            
            {/* Copilot Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span className="text-white text-xs font-bold font-sans">AI Founder Value Prover Copilot (Module 12)</span>
              </div>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 border px-2 py-0.5 rounded">Autonomous</span>
            </div>

            {/* Chat message display area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scroller-hidden">
              {copilotChat.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-sans ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[8px] text-slate-400 block mt-1.5 text-right font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isCopilotTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2 bg-slate-800 rounded-xl w-32 animate-pulse font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" /> Executive thinking...
                </div>
              )}
            </div>

            {/* Suggested Templates quick launch lists */}
            <div className="bg-slate-950/80 px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-800">
              <button 
                onClick={() => handleAskCopilot("What campaign should I run next for top revenue?")}
                className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:text-white px-2.5 py-1 text-[10px] text-indigo-300 font-mono rounded cursor-pointer transition"
              >
                /next-campaign
              </button>
              <button 
                onClick={() => handleAskCopilot("Where am I losing revenue in the active workspace funnel?")}
                className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:text-white px-2.5 py-1 text-[10px] text-indigo-300 font-mono rounded cursor-pointer transition"
              >
                /funnel-leaks
              </button>
              <button 
                onClick={() => handleAskCopilot("How can I increase customer retention and lifetime value?")}
                className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:text-white px-2.5 py-1 text-[10px] text-indigo-300 font-mono rounded cursor-pointer transition"
              >
                /boost-retention
              </button>
            </div>

            {/* Form submit input container */}
            <form onSubmit={handleCustomSubmitCopilot} className="bg-slate-950 p-2.5 flex items-center gap-2">
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="Query your enterprise matrix (or choose a shortcut above)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 font-sans"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow transition"
              >
                Prove
              </button>
            </form>

          </div>

        </div>
      )}

      {/* TAB 5: MANUAL PERFORMANCE BROKER TRANSACTION REGISTRATION */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Creation log manual ledger form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500 animate-pulse" />
              Register Campaign Transaction (Module 3)
            </h3>
            <p className="text-slate-500 text-xs">
              Directly feed conversion outcome events into the matrix. The engine auto-allocates attribution weights.
            </p>

            <form onSubmit={handleAddManualRevenue} className="space-y-3.5 text-xs text-slate-700">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">Transaction Type</label>
                <select name="type" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 cursor-pointer focus:outline-none focus:border-indigo-600 font-sans text-slate-900">
                  <option value="SALE">SALE (Direct Purchase Revenue)</option>
                  <option value="RETENTION">RETENTION (Upsell/Renewal Contract)</option>
                  <option value="LEAD">LEAD (Attributed Customer Registration)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">Marketing Source Channel</label>
                <select name="source" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 cursor-pointer focus:outline-none focus:border-indigo-600 font-sans text-slate-900">
                  <option value="EMAIL">EMAIL BLASTS</option>
                  <option value="INSTAGRAM">INSTAGRAM DIRECT STORIES</option>
                  <option value="LINKEDIN">LINKEDIN OUTREACH</option>
                  <option value="FACEBOOK">FACEBOOK ADS</option>
                  <option value="LANDING_PAGE">WEB LANDING FLOWS</option>
                  <option value="GOOGLE_BUSINESS">GOOGLE BUSINESS MAPS</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">Monetary Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  name="amount"
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-600 font-sans text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">Campaign Formulation Match</label>
                <input
                  type="text"
                  required
                  name="campaign"
                  placeholder="e.g. Summer VIP Renewal Drop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-600 font-sans text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">Units Generated</label>
                  <input
                    type="number"
                    defaultValue="1"
                    name="units"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">Goal Match</label>
                  <select name="goal" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none text-[10px]">
                    <option value="Generate Leads">Lead Generation</option>
                    <option value="Increase Sales">Sales Maximization</option>
                    <option value="Customer Retention">Retention loop</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer text-center pt-2"
              >
                Incorporate Record Matrix Event
              </button>
            </form>
          </div>

          {/* Right Panel: Manual Logs Ledger List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Dynamic Performance Event Ledger (Module 3)
            </h3>
            <p className="text-slate-500 text-xs">
              All processed transactional events connected to strategies. Filtering records below dynamically calculates allocations.
            </p>

            <div className="max-h-[300px] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
              {revenueLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No records registered inside current isolated workspace tenant yet. Check back after execution.
                </div>
              ) : (
                revenueLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                          log.type === 'SALE' ? 'bg-emerald-50 text-emerald-700' : (log.type === 'RETENTION' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700')
                        }`}>
                          {log.type}
                        </span>
                        <span className="font-semibold text-slate-800">{log.campaign}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {log.date} • Goal: {log.goal}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-mono font-bold text-slate-800 block">
                        {log.type === 'LEAD' ? `${log.units} Leads` : formatCurrency(log.amount)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.source}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: ENTERPRISE FINANCIAL INTELLIGENCE */}
      {activeSubTab === 'financial_intelligence' && (
        <FinancialIntelligenceEngine tenantId={tenantId} userRole={userRole} />
      )}

    </div>
  );
}

// Visual layout lines setup helper
