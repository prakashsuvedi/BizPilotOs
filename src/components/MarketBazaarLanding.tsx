import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Bot,
  Building2,
  TrendingUp,
  UtensilsCrossed,
  Compass,
  Globe,
  Megaphone,
  Mail,
  Share2,
  Database,
  GraduationCap,
  Activity,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Zap,
  Play,
  Terminal,
  ChevronRight,
  Layers,
  Cpu,
  BarChart3,
  Sliders,
  Code,
  DollarSign,
  Briefcase
} from 'lucide-react';

export interface MarketForgeLandingProps {
  onSelectFeature?: (featureId: string) => void;
  onEnterOS?: () => void;
}

export interface OSFeature {
  id: string;
  title: string;
  category: 'Intelligence' | 'Industry OS' | 'Growth & Marketing' | 'Enterprise Operations';
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  keyCapabilities: string[];
  metrics: { label: string; value: string }[];
}

const OS_FEATURES: OSFeature[] = [
  {
    id: 'command_center',
    title: 'Daily Command Center',
    category: 'Intelligence',
    tagline: 'Real-time Executive Cockpit & Telemetry',
    description: 'Central nerve center providing unified visibility over business KPIs, automated morning briefings, and live operational status.',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Core Intelligence',
    keyCapabilities: [
      'Automated morning executive brief generation',
      'Real-time revenue, leads, and conversion metrics',
      'Unified quick-action dispatch toolbar',
      'Multi-department task escalation shortcuts'
    ],
    metrics: [
      { label: 'Time Saved', value: '14 hrs/wk' },
      { label: 'KPI Sync', value: 'Real-time' }
    ]
  },
  {
    id: 'autonomous_intelligence',
    title: 'Autonomous AI Agents',
    category: 'Intelligence',
    tagline: 'Self-Healing System & Proactive Execution',
    description: 'Autonomous AI agent worker pool that monitors system health, performs self-healing remediation, and handles multi-step tasks.',
    icon: Bot,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Self-Healing AI',
    keyCapabilities: [
      'Self-diagnostic log auditing & error resolution',
      'Background agent queue with progress telemetry',
      'Automated tenant isolation integrity audits',
      'Zero-human-dependency background tasks'
    ],
    metrics: [
      { label: 'Uptime Guarantee', value: '99.99%' },
      { label: 'Auto Fixes', value: 'Instant' }
    ]
  },
  {
    id: 'enterprise_ai_os',
    title: 'Enterprise AI-OS & Workspaces',
    category: 'Enterprise Operations',
    tagline: 'Multi-Tenant Isolation & Policy Control',
    description: 'Bank-grade multi-tenant workspace architecture ensuring absolute data isolation, white-labeling, and role-based policies.',
    icon: Building2,
    color: 'from-purple-500 to-indigo-600',
    badge: 'Multi-Tenant',
    keyCapabilities: [
      'Strict row-level tenant boundary isolation',
      'Custom domain mapping & white-label styling',
      'Granular RBAC privilege assignment',
      'Cross-organization compliance auditing'
    ],
    metrics: [
      { label: 'Security Level', value: 'SOC2 Ready' },
      { label: 'Isolation', value: '100% Strict' }
    ]
  },
  {
    id: 'revenue_intelligence',
    title: 'Revenue & Cashflow OS',
    category: 'Intelligence',
    tagline: 'Financial Forecasts & Cost Elimination',
    description: 'Math-backed financial intelligence tracking MRR, cashflow forecasts, agency expense elimination, and automated invoicing.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Financial Intelligence',
    keyCapabilities: [
      'Predictive 90-day cashflow runway models',
      'Agency cost avoidance math-backed ledger',
      'Automated invoice generation & aging alerts',
      'Regional tax & multi-currency tax calculators'
    ],
    metrics: [
      { label: 'Cost Avoided', value: '$12.4k/mo' },
      { label: 'Forecasting', value: 'Predictive' }
    ]
  },
  {
    id: 'restaurant_os',
    title: 'Restaurant Management OS',
    category: 'Industry OS',
    tagline: 'Digital Menu, POS & Kitchen Workflows',
    description: 'Tailored operating system for hospitality businesses featuring digital menu catalogs, POS order tracking, and table layout controls.',
    icon: UtensilsCrossed,
    color: 'from-orange-500 to-amber-600',
    badge: 'Industry Verticals',
    keyCapabilities: [
      'Interactive QR digital menu catalog builder',
      'Live POS order queue with kitchen status updates',
      'Inventory stock depletion & auto-reorder triggers',
      'Multi-table seating allocation dashboard'
    ],
    metrics: [
      { label: 'Order Speed', value: '3x Faster' },
      { label: 'Menu Updates', value: 'Instant' }
    ]
  },
  {
    id: 'tours_os',
    title: 'Travel & Tours OS',
    category: 'Industry OS',
    tagline: 'Itinerary Builder & Booking Management',
    description: 'Complete tour operator suite for managing travel packages, custom day-by-day itineraries, guest rosters, and bookings.',
    icon: Compass,
    color: 'from-sky-500 to-blue-600',
    badge: 'Industry Verticals',
    keyCapabilities: [
      'Multi-day travel itinerary composer',
      'Guest reservation roster & payment tracking',
      'Regional guide assignment & vessel dispatch',
      'Currency & localized pricing formatter'
    ],
    metrics: [
      { label: 'Booking Conversion', value: '+42%' },
      { label: 'Setup Time', value: '< 5 Mins' }
    ]
  },
  {
    id: 'website_builder',
    title: 'AI Website Builder OS',
    category: 'Growth & Marketing',
    tagline: 'Instant Landing Page Generation & Publishing',
    description: 'Generates responsive, production-ready landing pages from business parameters with live edit tools and 1-click publishing.',
    icon: Globe,
    color: 'from-violet-500 to-purple-600',
    badge: 'Instant Web Generator',
    keyCapabilities: [
      'Gemini-powered full page copy & hero layout generation',
      'Drag-and-drop section customization toolbar',
      'Live mobile / desktop viewport simulator',
      'Instant deployment & HTML/CSS export'
    ],
    metrics: [
      { label: 'Build Time', value: '30 Seconds' },
      { label: 'Page Speed', value: '98/100' }
    ]
  },
  {
    id: 'ad_studio',
    title: 'Ad & Campaign Studio',
    category: 'Growth & Marketing',
    tagline: 'Multi-Channel Ad Copy, Flyers & Video Scripts',
    description: 'Consolidated marketing suite compiling ad angles, visual flyer templates, video script storyboards, and regional copy localization.',
    icon: Megaphone,
    color: 'from-rose-500 to-pink-600',
    badge: 'Creative Engine',
    keyCapabilities: [
      'Multi-tier campaign package compiler',
      'Target buyer persona generator',
      'High-converting social ad copy variations',
      'Video script storyboard & hook writer'
    ],
    metrics: [
      { label: 'ROAS Lift', value: '2.8x Avg' },
      { label: 'Assets', value: 'Automated' }
    ]
  },
  {
    id: 'email_studio',
    title: 'Outbound Email Engine',
    category: 'Growth & Marketing',
    tagline: 'Automated Sequences & Direct SMTP Relay',
    description: 'High-deliverability outbound campaign studio with direct SMTP transport configuration, sequence triggers, and click tracking.',
    icon: Mail,
    color: 'from-emerald-500 to-green-600',
    badge: 'High Deliverability',
    keyCapabilities: [
      'Direct SMTP server relay connectivity setup',
      'Automated multi-step nurture email campaigns',
      'Dynamic merge tag personalization',
      'Real-time open & link engagement telemetry'
    ],
    metrics: [
      { label: 'Deliverability', value: '99.4%' },
      { label: 'Relay Mode', value: 'Direct SMTP' }
    ]
  },
  {
    id: 'social_studio',
    title: 'Social Studio & OAuth',
    category: 'Growth & Marketing',
    tagline: 'Cross-Platform Publishing & OAuth Distribution',
    description: 'Unified social scheduler connecting via OAuth to auto-publish campaigns across LinkedIn, Twitter, Facebook, and Instagram.',
    icon: Share2,
    color: 'from-indigo-500 to-blue-600',
    badge: 'OAuth Integrated',
    keyCapabilities: [
      'OAuth token handshake authorization',
      'Multi-network post composer & media uploader',
      'Visual content calendar & queue schedule',
      'Cross-platform engagement analytics'
    ],
    metrics: [
      { label: 'Channels', value: 'Unified' },
      { label: 'Publishing', value: 'Automated' }
    ]
  },
  {
    id: 'business_memory',
    title: 'RAG Business Memory',
    category: 'Intelligence',
    tagline: 'Brochure & PDF Catalog Knowledge Extractor',
    description: 'Retrieval-Augmented Generation engine extracting structured product features, pricing, and guidelines from uploaded catalogs.',
    icon: Database,
    color: 'from-fuchsia-500 to-purple-600',
    badge: 'RAG Knowledge Graph',
    keyCapabilities: [
      'Document & PDF catalog auto-ingestion',
      'Product guideline vector indexing',
      'Competitor feature matrix comparison',
      'Instant query context grounding'
    ],
    metrics: [
      { label: 'Extraction', value: 'Instant' },
      { label: 'Accuracy', value: '99.8%' }
    ]
  },
  {
    id: 'success_center',
    title: 'Success Center & AI Coach',
    category: 'Enterprise Operations',
    tagline: 'Guided Onboarding & Academy Courses',
    description: 'Interactive adoption desk featuring guided setup wizards, MarketForge Academy courses, and personal AI marketing coach.',
    icon: GraduationCap,
    color: 'from-amber-500 to-orange-600',
    badge: 'Adoption Engine',
    keyCapabilities: [
      'Step-by-step MarketForge Success Score™ wizard',
      'Structured Academy courses & certification quizzes',
      'Personal AI Marketing Coach chat interface',
      'Multi-channel setup progress tracking'
    ],
    metrics: [
      { label: 'Onboarding', value: '< 10 Mins' },
      { label: 'Support', value: '24/7 AI Coach' }
    ]
  },
  {
    id: 'diagnostics',
    title: 'System Diagnostics & Health',
    category: 'Enterprise Operations',
    tagline: 'Production Monitoring & Endpoint Health',
    description: 'Comprehensive operational status checker monitoring system latency, database connection health, and API endpoints.',
    icon: Activity,
    color: 'from-red-500 to-rose-600',
    badge: 'Telemetry & Logs',
    keyCapabilities: [
      'Live endpoint latency & health telemetry',
      'Real-time system startup lifecycle logs',
      'Database connection pool monitoring',
      'Multi-region deployment status verification'
    ],
    metrics: [
      { label: 'Latency', value: '< 45ms' },
      { label: 'Health Status', value: 'Healthy' }
    ]
  }
];

export function MarketForgeLanding({ onSelectFeature, onEnterOS }: MarketForgeLandingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewFeature, setPreviewFeature] = useState<OSFeature | null>(OS_FEATURES[0]);

  const categories = ['ALL', 'Intelligence', 'Industry OS', 'Growth & Marketing', 'Enterprise Operations'];

  const filteredFeatures = OS_FEATURES.filter((feature) => {
    const matchesCategory = selectedCategory === 'ALL' || feature.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      feature.title.toLowerCase().includes(query) ||
      feature.tagline.toLowerCase().includes(query) ||
      feature.description.toLowerCase().includes(query) ||
      feature.keyCapabilities.some((cap) => cap.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#07080E] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white pb-20">
      {/* Background Cinematic Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
        {/* Floating Top Header Banner */}
        <div className="bg-[#0D0E17]/90 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-violet-500/0 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                MarketForge OS • Next-Gen Enterprise Platform
              </div>
              
              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                The Complete Operating System for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">Autonomous Business Intelligence</span>
              </h1>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl">
                MarketForge OS unifies daily executive command, autonomous AI worker pipelines, industry verticals, multi-channel marketing, and financial forecasting into a single, sleek, multi-tenant workspace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                onClick={onEnterOS}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                Launch Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Ticker Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6 mt-6 font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active OS Suite</span>
              <span className="text-white font-bold text-sm">13 Core Modules</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Multi-Tenant Guard</span>
              <span className="text-emerald-400 font-bold text-sm">100% Isolated</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">AI Intelligence Engine</span>
              <span className="text-indigo-300 font-bold text-sm">Gemini Powered</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">System Latency</span>
              <span className="text-cyan-400 font-bold text-sm">&lt; 45ms Verified</span>
            </div>
          </div>
        </div>

        {/* Feature Explorer Toolbar */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0D0E17] border border-white/10 rounded-2xl p-4 shadow-xl">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-600/20 border border-indigo-400/30'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {cat === 'ALL' && <Layers className="w-3.5 h-3.5 text-indigo-400" />}
                    {cat === 'Intelligence' && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                    {cat === 'Industry OS' && <Briefcase className="w-3.5 h-3.5 text-amber-400" />}
                    {cat === 'Growth & Marketing' && <Megaphone className="w-3.5 h-3.5 text-rose-400" />}
                    {cat === 'Enterprise Operations' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    {cat === 'ALL' ? 'All OS Capabilities' : cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search capabilities, modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 transition font-sans"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    setPreviewFeature(feature);
                    if (onSelectFeature) onSelectFeature(feature.id);
                  }}
                  className="bg-[#0D0E17] border border-white/10 hover:border-indigo-500/40 rounded-2xl p-6 transition duration-300 hover:-translate-y-1 group relative flex flex-col justify-between cursor-pointer shadow-xl overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-15 blur-2xl transition duration-500 rounded-full pointer-events-none`} />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 flex items-center justify-center text-white shadow-lg shadow-indigo-500/10`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white/5 text-indigo-300 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {feature.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-indigo-300 transition flex items-center justify-between">
                        {feature.title}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1 text-indigo-400" />
                      </h3>
                      <p className="text-xs font-semibold text-indigo-400/90 mt-0.5">{feature.tagline}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {feature.description}
                    </p>

                    {/* Capabilities bullets */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      {feature.keyCapabilities.slice(0, 2).map((cap, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-white/10 font-mono text-[10px] relative z-10">
                    {feature.metrics.map((m, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="text-slate-400 block uppercase text-[9px]">{m.label}</span>
                        <span className="text-white font-bold">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Modal / Detailed Preview Sandbox */}
        {previewFeature && (
          <div className="bg-[#0D0E17] border border-indigo-500/30 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${previewFeature.color} p-3.5 flex items-center justify-center text-white shadow-xl`}>
                  {React.createElement(previewFeature.icon, { className: 'w-7 h-7' })}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
                      {previewFeature.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Module ID: {previewFeature.id}</span>
                  </div>
                  <h2 className="font-display font-extrabold text-2xl text-white">{previewFeature.title}</h2>
                  <p className="text-xs font-semibold text-indigo-300">{previewFeature.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (onSelectFeature) onSelectFeature(previewFeature.id);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch {previewFeature.title}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400">Core OS Capabilities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {previewFeature.keyCapabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-white/5 border border-white/5 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400">Verified Benchmarks</h4>
                <div className="space-y-3 font-mono text-xs">
                  {previewFeature.metrics.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#07080E] border border-white/5 rounded-lg">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="text-indigo-300 font-bold">{m.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2 bg-[#07080E] border border-white/5 rounded-lg">
                    <span className="text-slate-400">Multi-tenant Isolation</span>
                    <span className="text-emerald-400 font-bold">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketForgeLanding;
