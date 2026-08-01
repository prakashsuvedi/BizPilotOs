import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import {
  Building2,
  Bot,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Zap,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Package,
  Users,
  Terminal,
  BarChart3,
  Sliders,
  Layers,
  Globe,
  Mail,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export interface GuidedTourStep {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ElementType;
  color: string;
  accentBg: string;
  badge: string;
  summary: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keyHighlights: string[];
  replacedTools: string[];
  stats: { label: string; value: string; detail: string }[];
  demoActionLabel: string;
  interactivePreview: {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; tag?: string; statusColor?: string }>;
  };
}

export const TOUR_STEPS: GuidedTourStep[] = [
  {
    id: 1,
    slug: 'workspace-provisioning',
    title: 'Multi-Branch & Tenant Workspace Setup',
    subtitle: 'Isolated Tenant Infrastructure & Branch Hierarchy',
    category: 'Architecture & Security',
    icon: Building2,
    color: 'text-indigo-400',
    accentBg: 'from-indigo-500/20 to-blue-600/20',
    badge: 'Step 1 of 5 • Infrastructure',
    summary: 'Instantly provision secure, isolated database schema containers with multi-branch RBAC access and customized brand identities.',
    description: 'BizPilot OS boots up tenant environments in seconds. Group holding companies, subsidiaries, and localized retail branches under a unified executive hierarchy with automatic currency matching and SOC2-ready isolation.',
    metaTitle: 'BizPilot OS Guided Tour | Step 1: Multi-Branch & Tenant Workspace Setup',
    metaDescription: 'Discover how BizPilot OS provisions isolated enterprise database schemas and configures multi-branch operating hierarchies in seconds.',
    keyHighlights: [
      '100% Isolated tenant database schemas with zero data leakage',
      'Multi-branch hierarchical P&L roll-up and localized currency routing',
      'Granular Role-Based Access Control (RBAC) for owners, admins & branch staff',
      'Custom domain mapping with instant SSL encryption'
    ],
    replacedTools: ['NetSuite Multi-Entity', 'Oracle Cloud', 'Okta Identity'],
    stats: [
      { label: 'Provision Time', value: '< 10 Secs', detail: 'Automated Container Boot' },
      { label: 'Tenant Isolation', value: '100%', detail: 'Strict Database Separation' },
      { label: 'Branch Support', value: 'Unlimited', detail: 'Global Subsidiary Scaling' }
    ],
    demoActionLabel: 'Test Tenant Provisioning',
    interactivePreview: {
      title: 'Active Tenant Environment: Global Enterprise HQ',
      description: 'System automatically verified TLS 1.3 encryption and mapped 3 operating branches.',
      details: [
        { label: 'New York HQ (Primary)', value: 'Connected • USD ($)', tag: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'London Subsidiary', value: 'Connected • GBP (£)', tag: 'Active', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Tokyo Branch Office', value: 'Connected • JPY (¥)', tag: 'Synced', statusColor: 'bg-indigo-500/20 text-indigo-300' },
        { label: 'RBAC Security Matrix', value: '42 Staff Roles Assigned', tag: 'SOC2 Ready', statusColor: 'bg-purple-500/20 text-purple-300' }
      ]
    }
  },
  {
    id: 2,
    slug: 'ai-sdr-autopilot',
    title: 'Autonomous AI SDR & Prospecting',
    subtitle: '24/7 Prospect Research & Cold Outreach Engine',
    category: 'AI Autopilot',
    icon: Bot,
    color: 'text-purple-400',
    accentBg: 'from-purple-500/20 to-indigo-600/20',
    badge: 'Step 2 of 5 • Sales Automation',
    summary: 'Deploy self-operating AI SDR agents that research ideal customer profiles, craft personalized email copy, and book qualified sales meetings.',
    description: 'Eliminate manual cold prospecting. BizPilot OS AI SDR agents continuously monitor web intent, scrape prospect profiles, draft multi-touch email sequences via Gemini AI, and handle inbound responses autonomously.',
    metaTitle: 'BizPilot OS Guided Tour | Step 2: Autonomous AI SDR & Prospecting',
    metaDescription: 'Explore the BizPilot OS AI SDR Autopilot engine: research leads, generate tailored email sequences, and book enterprise demos 24/7.',
    keyHighlights: [
      'Deep web & LinkedIn company intelligence scraping',
      'Hyper-personalized email copy generation powered by Google Gemini',
      'Smart lead qualification scoring & intent signal tracking',
      'Automated calendar scheduling & meeting reminders'
    ],
    replacedTools: ['Apollo.io', 'Outreach.io', 'Salesloft', 'Jasper AI'],
    stats: [
      { label: 'Meeting Conversion', value: '4.8x', detail: 'Compared to Manual SDRs' },
      { label: 'Response Rate', value: '32.4%', detail: 'Hyper-Personalized Copy' },
      { label: 'Hours Saved', value: '35 hrs/wk', detail: 'Per Sales Representative' }
    ],
    demoActionLabel: 'Simulate AI Prospect Email',
    interactivePreview: {
      title: 'AI SDR Autopilot #2: Inbound Prospect Qualified',
      description: 'Gemini AI generated a custom 3-touch sequence for Acme Corp VP of Operations.',
      details: [
        { label: 'Target Prospect', value: 'Sarah Jenkins (VP Ops, Acme Corp)', tag: 'Score 98/100', statusColor: 'bg-purple-500/20 text-purple-300' },
        { label: 'AI Email Personalization', value: '"Noticed your 25-node logistics expansion in Q2..."', tag: 'Gemini 2.5', statusColor: 'bg-indigo-500/20 text-indigo-300' },
        { label: 'Sequence Trigger', value: 'Outreach Touch #1 Dispatched via SMTP2Go', tag: 'Sent', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Demo Calendar Sync', value: '30-Min Demo Booked for Aug 3 at 2:00 PM EST', tag: 'Confirmed', statusColor: 'bg-emerald-500/20 text-emerald-300' }
      ]
    }
  },
  {
    id: 3,
    slug: 'pos-inventory-sync',
    title: 'Omnichannel POS & Inventory Sync',
    subtitle: 'Multi-Warehouse Stock Control & Retail Terminal',
    category: 'Operations & Retail',
    icon: ShoppingBag,
    color: 'text-amber-400',
    accentBg: 'from-amber-500/20 to-orange-600/20',
    badge: 'Step 3 of 5 • Retail & Supply Chain',
    summary: 'Unify physical barcode retail registers with online inventory catalogs and multi-warehouse safety stock reorder triggers.',
    description: 'Keep your stock counts perfectly in sync across physical stores and web channels. BizPilot OS tracks raw material SKU depletions, generates supplier purchase orders when safety thresholds are breached, and processes 1.2s checkouts.',
    metaTitle: 'BizPilot OS Guided Tour | Step 3: Omnichannel POS & Inventory Sync',
    metaDescription: 'Learn how BizPilot OS connects barcode POS checkout terminals with multi-warehouse inventory tracking and automated reorders.',
    keyHighlights: [
      'Touchscreen POS interface supporting barcode scanners & Stripe hardware',
      'Real-time multi-warehouse stock sync with zero overselling',
      'Automated low-stock warnings & purchase order generation',
      '100% Offline transaction queueing with automatic background sync'
    ],
    replacedTools: ['Shopify POS', 'Square Retail', 'Zoho Inventory', 'TradeGecko'],
    stats: [
      { label: 'Checkout Time', value: '1.2 Secs', detail: 'Fast Hardware Scan' },
      { label: 'Stockout Reduction', value: '-88%', detail: 'Automated Reorders' },
      { label: 'Inventory Precision', value: '99.9%', detail: 'Multi-Location Sync' }
    ],
    demoActionLabel: 'Test POS Barcode Scan',
    interactivePreview: {
      title: 'Omnichannel POS Terminal & Warehouse Sync',
      description: 'Item barcode scanned at London Retail Store #1; inventory updated globally.',
      details: [
        { label: 'Scanned Product', value: 'Enterprise Router Node (SKU-8840)', tag: '$499.00', statusColor: 'bg-amber-500/20 text-amber-300' },
        { label: 'Hardware Terminal', value: 'Stripe Reader M2 Connected • Offline Guarded', tag: 'Online', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Warehouse Stock Level', value: 'Main Warehouse: 142 Units (Reorder threshold: 25)', tag: 'Healthy', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Auto Supplier PO', value: 'Supplier Purchase Order #PO-992 queued', tag: 'Automated', statusColor: 'bg-indigo-500/20 text-indigo-300' }
      ]
    }
  },
  {
    id: 4,
    slug: 'hr-payroll-tax',
    title: 'HR, Biometrics & 1-Click Payroll',
    subtitle: 'Global Employee Onboarding, Attendance & Direct Deposits',
    category: 'Finance & HR',
    icon: CreditCard,
    color: 'text-emerald-400',
    accentBg: 'from-emerald-500/20 to-teal-600/20',
    badge: 'Step 4 of 5 • Human Resources',
    summary: 'Manage global staff records, biometric attendance, tax withholdings, and 1-click batch direct deposit payroll disbursements.',
    description: 'Simplify human resource management. From employee onboarding contracts and time tracking to regional tax calculations and digital pay stub distribution, BizPilot OS automates the full employee lifecycle.',
    metaTitle: 'BizPilot OS Guided Tour | Step 4: HR, Biometrics & 1-Click Payroll',
    metaDescription: 'See how BizPilot OS streamlines HR onboarding, biometric GPS attendance, direct deposit payroll, and regional tax compliance.',
    keyHighlights: [
      'Digital employee onboarding & contract e-signatures',
      'Biometric & GPS mobile shift check-ins with overtime calculation',
      '1-Click batch payroll execution with automatic tax withholding',
      'Self-service employee portal for pay stubs, W2s & leave requests'
    ],
    replacedTools: ['Gusto Payroll', 'Rippling', 'BambooHR', 'ADP Workforce'],
    stats: [
      { label: 'Payroll Speed', value: '1-Click', detail: 'Automated Calculations' },
      { label: 'HR Admin Time', value: '-70%', detail: 'Self-Service Portal' },
      { label: 'Tax Accuracy', value: '100%', detail: 'Regional Rules Engine' }
    ],
    demoActionLabel: 'Run Batch Payroll Simulation',
    interactivePreview: {
      title: 'Monthly Payroll Run: July 2026 Disbursement',
      description: 'Calculated 142 employee salaries, local tax withholdings & benefits.',
      details: [
        { label: 'Total Employee Staff', value: '142 Active Employees across 3 Branches', tag: 'Verified', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Gross Payroll Amount', value: '$248,500.00 USD', tag: 'Calculated', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Tax & Benefit Deduction', value: '$52,185.00 (Federal, State & 401k)', tag: 'Remitted', statusColor: 'bg-indigo-500/20 text-indigo-300' },
        { label: 'Direct Deposit Output', value: 'Dispatched via Automated Clearing House (ACH)', tag: 'Completed', statusColor: 'bg-emerald-500/20 text-emerald-300' }
      ]
    }
  },
  {
    id: 5,
    slug: 'treasury-ledger-cockpit',
    title: 'Treasury Ledger & Executive Cockpit',
    subtitle: 'Double-Entry General Ledger & 90-Day Cashflow Forecasting',
    category: 'Finance & Executive BI',
    icon: TrendingUp,
    color: 'text-cyan-400',
    accentBg: 'from-cyan-500/20 to-blue-600/20',
    badge: 'Step 5 of 5 • Executive Cockpit',
    summary: 'Gain total financial clarity with automated double-entry general ledger, OCR expense scanning, and predictive 90-day cashflow runway models.',
    description: 'Make confident executive decisions. BizPilot OS compiles real-time P&L statements, balance sheets, and automated morning executive AI briefings so leaders always have full visibility into profitability and growth metrics.',
    metaTitle: 'BizPilot OS Guided Tour | Step 5: Treasury Ledger & Executive Cockpit',
    metaDescription: 'Explore executive business intelligence in BizPilot OS: double-entry accounting, OCR expense scanning, and 90-day cashflow models.',
    keyHighlights: [
      'Standardized double-entry general ledger & customizable chart of accounts',
      'AI OCR receipt scanner with automated category tagging',
      'Predictive 90-day cashflow runway model & scenario stress testing',
      'Daily automated morning executive AI briefings delivered via portal'
    ],
    replacedTools: ['QuickBooks Enterprise', 'NetSuite Financials', 'Tableau BI', 'Mosaic'],
    stats: [
      { label: 'Forecast Accuracy', value: '98.4%', detail: 'AI Predictive Runway' },
      { label: 'Month-End Close', value: '2 Days', detail: 'Down from 14 Days' },
      { label: 'Overhead Saved', value: '$12.4k/mo', detail: 'SaaS Tool Consolidation' }
    ],
    demoActionLabel: 'Generate Executive AI Briefing',
    interactivePreview: {
      title: 'Executive Intelligence Briefing • Morning Sync',
      description: 'AI analyzed Q3 cash inflows, recurring revenues & vendor spend.',
      details: [
        { label: 'Current Treasury Reserve', value: '$1,842,500.00 USD (18.4 Months Runway)', tag: 'Strong', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: '90-Day Cashflow Projection', value: '+$342,000 Expected Net Positive Cashflow', tag: 'Model v4.2', statusColor: 'bg-cyan-500/20 text-cyan-300' },
        { label: 'General Ledger Audit', value: '0 Discrepancies Found • GAAP Compliant', tag: 'Audited', statusColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'AI Optimization Tip', value: '"Consolidate 3 cloud hosting tiers to save $840/mo."', tag: 'Insight', statusColor: 'bg-amber-500/20 text-amber-300' }
      ]
    }
  }
];

export interface BizPilotGuidedTourProps {
  onEnterOS?: () => void;
  onSelectFeature?: (featureId: string) => void;
}

export function BizPilotGuidedTour({ onEnterOS, onSelectFeature }: BizPilotGuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [simulatedActionResult, setSimulatedActionResult] = useState<string | null>(null);

  const activeStep = TOUR_STEPS[currentStepIndex];

  // Auto-play timer effect
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % TOUR_STEPS.length);
        setSimulatedActionResult(null);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => (prev + 1) % TOUR_STEPS.length);
    setSimulatedActionResult(null);
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => (prev - 1 + TOUR_STEPS.length) % TOUR_STEPS.length);
    setSimulatedActionResult(null);
  };

  const handleRunSimulatedAction = () => {
    if (activeStep.id === 1) {
      setSimulatedActionResult("✓ Verified: Database schema isolated & SSL certificate mapped to tenant endpoint.");
    } else if (activeStep.id === 2) {
      setSimulatedActionResult("✓ Dispatched: Gemini AI crafted personalized email draft to VP of Ops.");
    } else if (activeStep.id === 3) {
      setSimulatedActionResult("✓ Scanned SKU-8840: POS transaction recorded & inventory depleted in London Warehouse.");
    } else if (activeStep.id === 4) {
      setSimulatedActionResult("✓ Executed: Direct deposit batch calculated for 142 employees ($248,500.00).");
    } else if (activeStep.id === 5) {
      setSimulatedActionResult("✓ Compiled: Morning executive AI briefing generated with 18.4 months runway prediction.");
    }
  };

  return (
    <div className="bg-[#0B0D19] border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8 font-sans" id="guided-tour-section">
      
      {/* Dynamic React Helmet Meta Tags for SEO */}
      <Helmet>
        <title>{activeStep.metaTitle}</title>
        <meta name="description" content={activeStep.metaDescription} />
        <meta name="keywords" content={`BizPilot OS, ${activeStep.title}, ${activeStep.category}, enterprise ERP, AI operating system, ${activeStep.replacedTools.join(', ')}`} />
        <meta property="og:title" content={activeStep.metaTitle} />
        <meta property="og:description" content={activeStep.metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BizPilot OS",
            "operatingSystem": "Web Cloud OS",
            "applicationCategory": "BusinessApplication",
            "description": activeStep.metaDescription,
            "offers": {
              "@type": "Offer",
              "price": "299.00",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      {/* Radial Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Interactive Guided Tour & Workflow Stepper
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            The BizPilot OS Workflow Blueprint
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Step through how BizPilot OS unifies your entire business operations from initial workspace boot to autonomous AI execution.
          </p>
        </div>

        {/* Stepper Controls: Auto-Play & Next/Prev */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-2 cursor-pointer ${
              isAutoPlaying
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Pause Tour' : 'Auto-Play Tour'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={handlePrevStep}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Previous Step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-indigo-300 px-2 font-bold">
              {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleNextStep}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Next Step"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* STEPPER STEP BUTTONS NAVIGATOR BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {TOUR_STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStepIndex(idx);
                setIsAutoPlaying(false);
                setSimulatedActionResult(null);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-900/60 to-[#0B0D19] border-indigo-500 shadow-lg shadow-indigo-600/20 text-white scale-[1.02]'
                  : isCompleted
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-500/40 hover:text-white'
                  : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              {/* Active Glow Bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
              )}

              <div className="flex items-center justify-between w-full">
                <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                </span>

                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {step.category.split(' ')[0]}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold block truncate leading-tight">
                  {step.title.split('&')[0]}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  {step.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE STEP CARD CONTENT DISPLAY */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Step Overview & Highlights */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeStep.accentBg} border border-white/10 p-2.5 flex items-center justify-center text-white shadow-lg`}>
                  {React.createElement(activeStep.icon, { className: `w-5 h-5 ${activeStep.color}` })}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full uppercase">
                    {activeStep.badge}
                  </span>
                  <h3 className="font-extrabold text-xl sm:text-2xl text-white mt-0.5">
                    {activeStep.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pt-1">
                {activeStep.description}
              </p>
            </div>

            {/* Key Highlights Checklist */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Workflow Highlights & Automation Rules:
              </span>
              <div className="space-y-2 text-xs text-slate-200">
                {activeStep.keyHighlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2.5 p-2.5 bg-white/5 border border-white/5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Replaced Disconnected SaaS Tools */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px] font-bold uppercase">Replaces Software:</span>
              {activeStep.replacedTools.map((tool, tIdx) => (
                <span key={tIdx} className="px-2.5 py-1 bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded-lg text-[10px] font-bold">
                  ✕ {tool}
                </span>
              ))}
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 font-mono">
              {activeStep.stats.map((stat, sIdx) => (
                <div key={sIdx} className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block truncate">{stat.label}</span>
                  <span className={`text-base sm:text-lg font-black block ${activeStep.color}`}>{stat.value}</span>
                  <span className="text-[9px] text-slate-400 block truncate">{stat.detail}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Interactive Simulated Preview Canvas */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-black/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
              
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[11px] font-mono text-slate-400 ml-1">workflow-node // step-{activeStep.id}.bizpilot</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  ● LIVE SIMULATOR
                </span>
              </div>

              {/* Interactive Canvas Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono font-extrabold text-sm text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    {activeStep.interactivePreview.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeStep.interactivePreview.description}
                  </p>
                </div>

                {/* Simulated Details Grid */}
                <div className="space-y-2.5 font-mono text-xs">
                  {activeStep.interactivePreview.details.map((detail, dIdx) => (
                    <div key={dIdx} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                      <div className="space-y-0.5 text-left truncate">
                        <span className="text-slate-400 text-[10px] block font-bold uppercase">{detail.label}</span>
                        <span className="text-slate-100 text-xs font-semibold block truncate">{detail.value}</span>
                      </div>
                      {detail.tag && (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ${detail.statusColor || 'bg-indigo-500/20 text-indigo-300'}`}>
                          {detail.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Simulated Action Tester Button */}
                <div className="pt-2">
                  <button
                    onClick={handleRunSimulatedAction}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 border border-indigo-400/30"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-300 animate-bounce" />
                    <span>{activeStep.demoActionLabel}</span>
                  </button>
                </div>

                {/* Simulated Result Toast */}
                {simulatedActionResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-mono text-left leading-relaxed flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{simulatedActionResult}</span>
                  </motion.div>
                )}

              </div>

            </div>

            {/* Launch Workspace Callout */}
            <div className="flex items-center justify-between p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl font-sans">
              <div>
                <span className="text-xs font-bold text-white block">Ready to run this step live?</span>
                <span className="text-[11px] text-slate-400 block">Launch your isolated workspace to access all 24+ modules.</span>
              </div>
              <button
                onClick={onEnterOS}
                className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs rounded-xl transition cursor-pointer shrink-0 shadow flex items-center gap-1.5"
              >
                <span>Launch OS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

export default BizPilotGuidedTour;
