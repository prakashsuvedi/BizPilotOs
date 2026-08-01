import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import BizPilotGuidedTour from './BizPilotGuidedTour';
import { getTenantBranding, saveTenantBranding, TenantBranding } from '../lib/tenantBranding';
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
  Briefcase,
  Users,
  CreditCard,
  Package,
  ShoppingBag,
  Clock,
  Check,
  Copy,
  X,
  Stethoscope,
  Truck,
  Factory,
  BookOpen,
  Headphones,
  Workflow,
  Calculator,
  Lock,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Star,
  Award,
  Shield,
  FileText,
  MapPin,
  Flame,
  Phone,
  Palette,
  Sun,
  Moon,
  Eye,
  Store,
  ShoppingBasket,
  Tag,
  CheckCircle
} from 'lucide-react';

export interface BizPilotLandingProps {
  tenantId?: string;
  onSelectFeature?: (featureId: string) => void;
  onEnterOS?: () => void;
}

export interface ModuleItem {
  id: string;
  title: string;
  category: 'Core Operations' | 'Finance & HR' | 'Industry ERPs' | 'Growth & Marketing' | 'AI Autopilot';
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  badge: string;
  capabilities: string[];
  metrics: { label: string; value: string }[];
  replacedTools: string[];
}

const MODULES_REGISTRY: ModuleItem[] = [
  {
    id: 'crm_sales',
    title: 'CRM & Sales Pipeline',
    category: 'Core Operations',
    tagline: 'Predictive Lead Scoring & Deal Stages',
    description: '360° lead tracking, visual deal pipelines, activity timelines, automated lead distribution, and AI win-probability forecasting.',
    icon: Users,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-blue-600',
    badge: 'Core Revenue',
    capabilities: [
      'Visual Kanban deal pipelines & drag-and-drop stages',
      'AI lead scoring & behavioral intent signals',
      'Automated email & SMS follow-up sequences',
      'Unified customer communication history'
    ],
    metrics: [
      { label: 'Pipeline Velocity', value: '+45%' },
      { label: 'Win Rate Lift', value: '3.2x' }
    ],
    replacedTools: ['Salesforce', 'HubSpot CRM', 'Pipedrive']
  },
  {
    id: 'ai_automation',
    title: 'AI SDR & Autopilot Agents',
    category: 'AI Autopilot',
    tagline: 'Autonomous Prospecting & Email Outreach',
    description: 'Self-operating AI SDRs that research prospects, craft hyper-personalized emails, qualify inbound leads, and book meetings 24/7.',
    icon: Bot,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-indigo-600',
    badge: 'Autonomous AI',
    capabilities: [
      'Deep prospect LinkedIn & company web scraping',
      'Autonomous cold email drafting & response handling',
      'Calendar booking sync & meeting qualification',
      'Multi-channel outreach workflow triggers'
    ],
    metrics: [
      { label: 'Meetings Booked', value: '4.8x' },
      { label: 'Response Rate', value: '32.4%' }
    ],
    replacedTools: ['Outreach.io', 'Apollo.io', 'Salesloft']
  },
  {
    id: 'digital_marketing',
    title: 'Digital Marketing Studio',
    category: 'Growth & Marketing',
    tagline: 'Ad Copy, Creative Flyers & SEO Copywriter',
    description: 'Multi-channel marketing studio compiling high-ROAS ad copies, promotional flyer graphics, social calendars, and SEO content.',
    icon: Megaphone,
    color: 'text-rose-400',
    gradient: 'from-rose-500 to-pink-600',
    badge: 'Growth Engine',
    capabilities: [
      'Facebook, Google & LinkedIn ad angle generator',
      'Social media content calendar & automated publisher',
      'Visual flyer templates & brand guideline guardrails',
      'Video script storyboards & hook generator'
    ],
    metrics: [
      { label: 'ROAS Lift', value: '2.8x Avg' },
      { label: 'Asset Creation', value: '30 Secs' }
    ],
    replacedTools: ['Hootsuite', 'Jasper AI', 'Canva Pro']
  },
  {
    id: 'website_builder',
    title: 'AI Website & Landing Page Builder',
    category: 'Growth & Marketing',
    tagline: 'Instant Landing Page Generation & Publishing',
    description: 'Build high-converting responsive landing pages and full websites in under 30 seconds using prompt-based AI generation.',
    icon: Globe,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-teal-600',
    badge: '1-Click Web',
    capabilities: [
      'Gemini-powered hero layout & copy generation',
      'Drag-and-drop section customization toolbar',
      'Live mobile & desktop viewport simulator',
      'Instant custom domain mapping & SSL certs'
    ],
    metrics: [
      { label: 'Build Speed', value: '30 Secs' },
      { label: 'Lighthouse Score', value: '99/100' }
    ],
    replacedTools: ['Webflow', 'Framer', 'Unbounce']
  },
  {
    id: 'hr_employee',
    title: 'HR & Employee Operations',
    category: 'Finance & HR',
    tagline: 'Onboarding, Attendance & KPI Reviews',
    description: 'Comprehensive human capital management handling employee records, shift scheduling, performance appraisals, and time-off requests.',
    icon: Briefcase,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-600',
    badge: 'People Ops',
    capabilities: [
      'Digital onboarding workflows & document signing',
      'Biometric & GPS attendance tracking',
      'Goal tracking & 360-degree KPI performance appraisals',
      'Leave management & approval hierarchies'
    ],
    metrics: [
      { label: 'HR Admin Time', value: '-70%' },
      { label: 'Employee NPS', value: '+42' }
    ],
    replacedTools: ['BambooHR', 'Rippling', 'Gusto HR']
  },
  {
    id: 'payroll_compliance',
    title: 'Payroll & Tax Engine',
    category: 'Finance & HR',
    tagline: 'Automated Direct Deposits & Regional Taxes',
    description: 'Automated multi-currency payroll processing, tax deductions, direct deposit disbursements, and compliant pay stub generation.',
    icon: CreditCard,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-green-600',
    badge: 'Automated Payroll',
    capabilities: [
      '1-Click batch payroll calculation & disbursement',
      'Automatic federal, state & local tax withholdings',
      'Multi-currency contractor payouts across 120+ countries',
      'Automated digital paystub delivery via portal'
    ],
    metrics: [
      { label: 'Accuracy', value: '100.0%' },
      { label: 'Processing', value: '1-Click' }
    ],
    replacedTools: ['Gusto Payroll', 'ADP', 'Deel']
  },
  {
    id: 'finance_cashflow',
    title: 'Finance & Cashflow Intelligence',
    category: 'Finance & HR',
    tagline: 'Predictive 90-Day Runway & P&L Analytics',
    description: 'Real-time corporate treasury, cashflow forecasting models, agency expense elimination tracking, and automated invoicing.',
    icon: TrendingUp,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'Treasury OS',
    capabilities: [
      'Predictive 90-day AI cashflow forecasting',
      'Real-time P&L, balance sheet, and cash statement',
      'Automated recurring invoice generation & payment collection',
      'Multi-currency conversion & bank feed reconciliation'
    ],
    metrics: [
      { label: 'Forecast Precision', value: '98.4%' },
      { label: 'Overhead Saved', value: '$12.4k/mo' }
    ],
    replacedTools: ['QuickBooks', 'Xero', 'Mosaic']
  },
  {
    id: 'accounting_ledger',
    title: 'Accounting & General Ledger',
    category: 'Finance & HR',
    tagline: 'Double-Entry Accounting & Audit Audit Trail',
    description: 'Enterprise double-entry general ledger, customizable chart of accounts, automated tax categorization, and audit logs.',
    icon: Calculator,
    color: 'text-teal-400',
    gradient: 'from-teal-500 to-emerald-600',
    badge: 'Audit Ready',
    capabilities: [
      'Standardized double-entry chart of accounts',
      'Automated receipt OCR scanning & expense tagging',
      'Year-end tax report compilation & 1099 compliance',
      'Immutable audit trail for compliance officers'
    ],
    metrics: [
      { label: 'Close Time', value: '2 Days' },
      { label: 'Tax Accuracy', value: '99.9%' }
    ],
    replacedTools: ['NetSuite', 'Sage Intacct', 'FreshBooks']
  },
  {
    id: 'inventory_control',
    title: 'Inventory & Stock Control',
    category: 'Core Operations',
    tagline: 'Multi-Warehouse Stock & Safety Stock Alerts',
    description: 'Real-time SKU tracking, multi-warehouse stock allocation, low-stock reorder triggers, and supplier purchase orders.',
    icon: Package,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-600',
    badge: 'Supply Chain',
    capabilities: [
      'Multi-location warehouse stock synchronization',
      'Automated safety stock depletion warnings',
      'Barcode & QR code scanner mobile interface',
      'Vendor purchase order generation & receipt tracking'
    ],
    metrics: [
      { label: 'Stockouts Reduced', value: '-88%' },
      { label: 'Order Accuracy', value: '99.8%' }
    ],
    replacedTools: ['Zoho Inventory', 'TradeGecko', 'Fishbowl']
  },
  {
    id: 'pos_retail',
    title: 'POS & Retail Checkout',
    category: 'Core Operations',
    tagline: 'Omnichannel Cash Register & Barcode Reader',
    description: 'Lightning-fast retail POS terminal supporting hardware scanners, card readers, digital receipts, and offline order queuing.',
    icon: ShoppingBag,
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-600',
    badge: 'Omnichannel POS',
    capabilities: [
      'Touchscreen cash register interface with barcode reader',
      'Stripe terminal & card reader integration',
      'Customer loyalty points & discount coupon engine',
      'Offline order mode with auto-sync upon reconnect'
    ],
    metrics: [
      { label: 'Checkout Time', value: '1.2 Secs' },
      { label: 'Uptime', value: '100% Offline' }
    ],
    replacedTools: ['Shopify POS', 'Square', 'Clover']
  },
  {
    id: 'project_agile',
    title: 'Project Management & Agile Boards',
    category: 'Core Operations',
    tagline: 'Kanban, Gantt Charts & Resource Allocation',
    description: 'Collaborative project execution featuring task dependencies, time logging, milestone tracking, and workload balancing.',
    icon: Layers,
    color: 'text-indigo-400',
    gradient: 'from-indigo-600 to-purple-600',
    badge: 'Productivity',
    capabilities: [
      'Kanban, Gantt, and list project views',
      'Task dependencies, time tracking & time estimates',
      'Team resource workload capacity balancing',
      'Automated milestone status notifications'
    ],
    metrics: [
      { label: 'Task Throughput', value: '+38%' },
      { label: 'On-Time Delivery', value: '96.2%' }
    ],
    replacedTools: ['Asana', 'Monday.com', 'Jira']
  },
  {
    id: 'customer_support',
    title: 'Customer Support Helpdesk',
    category: 'Core Operations',
    tagline: 'Omnichannel Ticketing & AI Auto-Replies',
    description: 'Centralized helpdesk consolidating email, live chat, and WhatsApp tickets with instant AI response drafting and SLA timers.',
    icon: Headphones,
    color: 'text-teal-400',
    gradient: 'from-teal-500 to-cyan-600',
    badge: 'AI Helpdesk',
    capabilities: [
      'Unified ticket inbox for Email, Chat, and WhatsApp',
      'AI-suggested macro responses based on past resolutions',
      'Automated SLA breach warning notifications',
      'Customer satisfaction (CSAT) survey triggers'
    ],
    metrics: [
      { label: 'First Response', value: '< 2 Mins' },
      { label: 'CSAT Rating', value: '4.9 / 5' }
    ],
    replacedTools: ['Zendesk', 'Intercom', 'Freshdesk']
  },
  {
    id: 'analytics_cockpit',
    title: 'Executive Analytics Cockpit',
    category: 'Core Operations',
    tagline: 'Real-time Business Intelligence & KPI Dashboards',
    description: 'Command center displaying unified operational telemetry, daily automated morning AI briefings, and cross-department KPIs.',
    icon: BarChart3,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-yellow-600',
    badge: 'BI Cockpit',
    capabilities: [
      'Real-time executive briefing generated every morning',
      'Custom KPI widget builder with drill-down filters',
      'Cross-branch revenue & operational comparison',
      'Exportable board-ready PDF & CSV report generator'
    ],
    metrics: [
      { label: 'Decision Speed', value: '5x Faster' },
      { label: 'Report Prep', value: 'Instant' }
    ],
    replacedTools: ['Tableau', 'PowerBI', 'Looker']
  },
  {
    id: 'restaurant_erp',
    title: 'Restaurant & Hospitality ERP',
    category: 'Industry ERPs',
    tagline: 'Digital QR Menus, KDS & Table Seating',
    description: 'Purpose-built restaurant management suite with mobile QR ordering, Kitchen Display System (KDS), and table reservation grids.',
    icon: UtensilsCrossed,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600',
    badge: 'Hospitality',
    capabilities: [
      'Interactive QR code digital menu catalog with modifiers',
      'Live Kitchen Display System (KDS) order routing',
      'Visual floor map table seating & reservation manager',
      'Recipe ingredient cost tracking & auto-depletion'
    ],
    metrics: [
      { label: 'Table Turn Rate', value: '+35%' },
      { label: 'Order Errors', value: '-94%' }
    ],
    replacedTools: ['Toast POS', 'TouchBistro', 'Lightspeed']
  },
  {
    id: 'tours_travel',
    title: 'Tours & Travel ERP',
    category: 'Industry ERPs',
    tagline: 'Itinerary Builder & Package Reservations',
    description: 'Comprehensive tour operator platform for building multi-day itineraries, managing passenger manifests, and tour guide dispatches.',
    icon: Compass,
    color: 'text-sky-400',
    gradient: 'from-sky-500 to-blue-600',
    badge: 'Travel Suite',
    capabilities: [
      'Multi-day travel itinerary composer with PDF export',
      'Passenger manifest & deposit payment tracking',
      'Local guide assignment & vehicle fleet dispatch',
      'Localized multi-currency tour package pricing'
    ],
    metrics: [
      { label: 'Booking Conversion', value: '+42%' },
      { label: 'Setup Time', value: '< 5 Mins' }
    ],
    replacedTools: ['Rezdy', 'Tourwriter', 'FareHarbor']
  },
  {
    id: 'manufacturing_erp',
    title: 'Manufacturing & MRP',
    category: 'Industry ERPs',
    tagline: 'Bill of Materials & Work Order Routing',
    description: 'Production planning system managing raw material Bill of Materials (BOM), shop floor work orders, and quality assurance checks.',
    icon: Factory,
    color: 'text-slate-300',
    gradient: 'from-slate-600 to-slate-800',
    badge: 'Industrial MRP',
    capabilities: [
      'Multi-level Bill of Materials (BOM) creation',
      'Shop floor work order routing & machine scheduling',
      'Batch traceability & QA inspection logs',
      'Raw material requirement planning (MRP) triggers'
    ],
    metrics: [
      { label: 'Production Yield', value: '+22%' },
      { label: 'Scrap Rate', value: '-40%' }
    ],
    replacedTools: ['Katana MRP', 'Odoo Manufacturing', 'SAP Business One']
  },
  {
    id: 'healthcare_clinic',
    title: 'Healthcare & Clinic Management',
    category: 'Industry ERPs',
    tagline: 'EHR Patient Records & Appointment Scheduler',
    description: 'HIPAA-ready clinic platform handling patient appointments, digital Electronic Health Records (EHR), and e-prescriptions.',
    icon: Stethoscope,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'Healthcare',
    capabilities: [
      'Patient appointment booking calendar & SMS reminders',
      'Encrypted Electronic Health Record (EHR) charts',
      'Digital e-prescription writer & pharmacy integration',
      'Medical insurance claims & patient billing'
    ],
    metrics: [
      { label: 'No-Shows Reduced', value: '-65%' },
      { label: 'HIPAA Compliant', value: '100%' }
    ],
    replacedTools: ['Kareo', 'AthenaHealth', 'SimplePractice']
  },
  {
    id: 'logistics_fleet',
    title: 'Logistics & Fleet Dispatch',
    category: 'Industry ERPs',
    tagline: 'Vehicle Telematics & Route Optimization',
    description: 'Fleet management solution offering real-time GPS tracking, automated driver dispatch, fuel logging, and digital Proof of Delivery.',
    icon: Truck,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-yellow-600',
    badge: 'Fleet Ops',
    capabilities: [
      'Real-time GPS vehicle tracking & telematics map',
      'AI route optimization to minimize fuel consumption',
      'Digital Proof of Delivery (e-signature & photo upload)',
      'Vehicle maintenance schedules & driver logs'
    ],
    metrics: [
      { label: 'Fuel Saved', value: '28.5%' },
      { label: 'On-Time Deliveries', value: '99.1%' }
    ],
    replacedTools: ['Samsara', 'Samsara Fleet', 'Onfleet']
  },
  {
    id: 'education_academy',
    title: 'Education & Academy OS',
    category: 'Industry ERPs',
    tagline: 'Course Portal, Student Admissions & LMS',
    description: 'All-in-one learning management system for schools and corporate academies covering student admissions, grading, and video courses.',
    icon: BookOpen,
    color: 'text-violet-400',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'Education',
    capabilities: [
      'Student admissions portal & tuition fee collector',
      'Online course curriculum builder & video lessons',
      'Automated grading quizzes & digital certificates',
      'Parent-teacher communication dashboard'
    ],
    metrics: [
      { label: 'Student Engagement', value: '3.4x' },
      { label: 'Admin Overhead', value: '-60%' }
    ],
    replacedTools: ['Canvas LMS', 'Teachable', 'Kajabi']
  },
  {
    id: 'multi_company_branch',
    title: 'Multi-Company & Multi-Branch OS',
    category: 'Core Operations',
    tagline: 'Consolidated P&L & Inter-Company Billing',
    description: 'Enterprise organization manager governing multiple subsidiaries, branches, and regional entities under unified compliance rules.',
    icon: Building2,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-violet-600',
    badge: 'Enterprise Architecture',
    capabilities: [
      'Consolidated P&L and multi-branch roll-up reports',
      'Inter-company invoice transfers & currency matching',
      'Granular Role-Based Access Control (RBAC) per branch',
      'Centralized audit logging across all subsidiaries'
    ],
    metrics: [
      { label: 'Entities Managed', value: 'Unlimited' },
      { label: 'Consolidation Time', value: 'Instant' }
    ],
    replacedTools: ['Oracle NetSuite Multi-Entity', 'SAP']
  },
  {
    id: 'workflow_automation',
    title: 'Workflow Automation Engine',
    category: 'AI Autopilot',
    tagline: 'Drag-and-Drop Triggers, Webhooks & Logic',
    description: 'Visual automation builder creating multi-step cross-department workflows, webhook connections, and conditional business logic.',
    icon: Workflow,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
    badge: 'Zero Code Logic',
    capabilities: [
      'Visual drag-and-drop workflow canvas with conditional paths',
      'Inbound/outbound webhook integrations & API connectors',
      'Custom delay timers, loops, and branch logic',
      'Automatic failover retry handling & error alerts'
    ],
    metrics: [
      { label: 'Tasks Automated', value: '1.2M/mo' },
      { label: 'Manual Errors', value: '0%' }
    ],
    replacedTools: ['Zapier Enterprise', 'Make.com', 'Tray.io']
  }
];

const THEME_PRESETS = [
  { id: 'midnight', name: 'Midnight Cyber', icon: Moon, bg: 'bg-[#06070D]', cardBg: 'bg-[#0D0E17]', border: 'border-white/10', textPrimary: 'text-white', textSecondary: 'text-slate-300', accentGradient: 'from-indigo-400 via-purple-400 to-cyan-400', buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white' },
  { id: 'light', name: 'Enterprise Light', icon: Sun, bg: 'bg-slate-50', cardBg: 'bg-white', border: 'border-slate-200 shadow-xl', textPrimary: 'text-slate-900', textSecondary: 'text-slate-600', accentGradient: 'from-indigo-600 via-blue-600 to-teal-600', buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  { id: 'emerald', name: 'Emerald Organic', icon: Sparkles, bg: 'bg-[#04120C]', cardBg: 'bg-[#0A1E15]', border: 'border-emerald-500/20', textPrimary: 'text-emerald-50', textSecondary: 'text-emerald-200/80', accentGradient: 'from-emerald-400 via-teal-300 to-amber-300', buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
  { id: 'sunset', name: 'Sunset Gold', icon: Flame, bg: 'bg-[#0F0B07]', cardBg: 'bg-[#1A140E]', border: 'border-amber-500/20', textPrimary: 'text-amber-50', textSecondary: 'text-amber-200/80', accentGradient: 'from-amber-400 via-orange-400 to-yellow-300', buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white' },
  { id: 'purple', name: 'Royal Dusk', icon: Palette, bg: 'bg-[#0D0714]', cardBg: 'bg-[#170E24]', textPrimary: 'text-purple-50', textSecondary: 'text-purple-200/80', accentGradient: 'from-purple-400 via-pink-400 to-indigo-300', buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white' },
  { id: 'slate', name: 'Minimal Slate', icon: Layers, bg: 'bg-[#0F172A]', cardBg: 'bg-[#1E293B]', border: 'border-slate-700', textPrimary: 'text-slate-50', textSecondary: 'text-slate-300', accentGradient: 'from-sky-300 via-indigo-300 to-teal-300', buttonBg: 'bg-sky-600 hover:bg-sky-500 text-white' }
];

export function BizPilotLanding({ tenantId = 'demo-tenant', onSelectFeature, onEnterOS }: BizPilotLandingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Modules');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDrawerModule, setActiveDrawerModule] = useState<ModuleItem | null>(null);

  // Tenant White-Label & Dynamic Theme State
  const [branding, setBranding] = useState<TenantBranding>(() => getTenantBranding(tenantId));
  const [activeTheme, setActiveTheme] = useState<string>(() => branding.activeTheme || 'midnight');
  const [viewMode, setViewMode] = useState<'storefront' | 'platform'>('storefront');
  const [selectedProductModal, setSelectedProductModal] = useState<any | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderCustomerEmail, setOrderCustomerEmail] = useState<string>('');

  useEffect(() => {
    const loaded = getTenantBranding(tenantId);
    setBranding(loaded);
    if (loaded.activeTheme) setActiveTheme(loaded.activeTheme);
  }, [tenantId]);

  useEffect(() => {
    const handleBrandingUpdated = (e: any) => {
      if (!e.detail?.tenantId || e.detail?.tenantId === tenantId) {
        const fresh = getTenantBranding(tenantId);
        setBranding(fresh);
        if (fresh.activeTheme) setActiveTheme(fresh.activeTheme);
      }
    };
    window.addEventListener('tenant_branding_updated', handleBrandingUpdated);
    return () => window.removeEventListener('tenant_branding_updated', handleBrandingUpdated);
  }, [tenantId]);

  const handleSwitchTheme = (themeId: string) => {
    setActiveTheme(themeId);
    const updated = { ...branding, activeTheme: themeId };
    setBranding(updated);
    saveTenantBranding(updated);
  };

  const currentTheme = THEME_PRESETS.find(t => t.id === activeTheme) || THEME_PRESETS[0];

  // Interactive ROI Calculator State
  const [teamSize, setTeamSize] = useState<number>(25);
  const [branchCount, setBranchCount] = useState<number>(3);
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  // Live Dashboard Showcase Tab State
  const [showcaseTab, setShowcaseTab] = useState<'cockpit' | 'ai_sdr' | 'finance' | 'inventory' | 'industry'>('cockpit');

  // Hero Mockup Interactive Tab
  const [heroMockupTab, setHeroMockupTab] = useState<'feed' | 'kpis' | 'branches'>('feed');

  // Copyable Invite Links Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToast(label);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // ROI Math Calculations
  const traditionalCostPerUser = 150 + 120 + 89 + 40;
  const traditionalBaseFixed = 90 + 800 + (branchCount * 89);
  const totalTraditionalMonthly = (teamSize * traditionalCostPerUser) + traditionalBaseFixed;
  
  const bizpilotMonthly = Math.round(299 + (teamSize * 12) + (branchCount * 45));
  const monthlySavings = Math.max(0, totalTraditionalMonthly - bizpilotMonthly);
  const annualSavings = monthlySavings * 12;
  const savingsPercent = Math.min(88, Math.round((monthlySavings / totalTraditionalMonthly) * 100));

  const categories = ['All Modules', 'Core Operations', 'Finance & HR', 'Industry ERPs', 'Growth & Marketing', 'AI Autopilot'];

  const filteredModules = MODULES_REGISTRY.filter((mod) => {
    const matchesCategory = selectedCategory === 'All Modules' || mod.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      mod.title.toLowerCase().includes(query) ||
      mod.tagline.toLowerCase().includes(query) ||
      mod.description.toLowerCase().includes(query) ||
      mod.replacedTools.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  const handlePlaceOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedProductModal(null);
    }, 2500);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.textPrimary} font-sans selection:bg-indigo-500/30 selection:text-white pb-24 overflow-x-hidden transition-colors duration-300`}>
      
      {/* Dynamic SEO Meta Tags via React Helmet */}
      <Helmet>
        <title>{branding.companyName || 'BizPilot OS'} | Enterprise Operating System & Storefront</title>
        <meta name="description" content={branding.tagline || 'The complete AI operating system for enterprise.'} />
        <meta property="og:title" content={`${branding.companyName || 'BizPilot OS'} | Official Workspace`} />
        <meta property="og:description" content={branding.tagline} />
      </Helmet>

      {/* Background Radial Glow Halos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* 0. TOP WHITE-LABEL BRAND BAR */}
      <div className={`relative z-20 border-b ${currentTheme.border} ${currentTheme.cardBg} backdrop-blur-xl sticky top-0 py-3 px-4 sm:px-8 shadow-xl`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Tenant Logo, Brand Identity & Shareable URL Slug */}
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                {branding.companyName.substring(0, 1) || 'B'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`font-extrabold text-sm sm:text-base leading-tight ${currentTheme.textPrimary}`}>
                  {branding.companyName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Verified Brand
                </span>
                
                {/* Shareable Unique Tenant URL Slug Pill & Interactive Copy Popover */}
                <div className="relative">
                  <button
                    onClick={() => setIsCopyModalOpen(!isCopyModalOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 transition cursor-pointer"
                    title="Click to view & copy client-facing tenant invite URLs"
                  >
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>slug: ?tenant={tenantId}</span>
                    <span className="text-[9px] text-cyan-400/80 underline ml-0.5">Share Link</span>
                  </button>

                  {/* Share Links Dropdown Popover */}
                  {isCopyModalOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsCopyModalOpen(false)} />
                      <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-[#0d0f18] border border-cyan-500/30 rounded-2xl shadow-2xl z-50 p-3 space-y-3 font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-bold text-cyan-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5 font-mono">
                            <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Unique Tenant Invite Links
                          </span>
                          <button onClick={() => setIsCopyModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {copiedToast && (
                          <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>{copiedToast} copied!</span>
                          </div>
                        )}

                        <div className="space-y-2 text-[11px]">
                          {/* Option 1: Storefront Query Link */}
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition">
                            <div className="flex items-center justify-between font-bold text-white mb-1">
                              <span>Client Storefront Link</span>
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Pre-loads Branding</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate mb-2">
                              {window.location.origin}/?tenant={tenantId}
                            </div>
                            <button
                              onClick={() => handleCopyLink(`${window.location.origin}/?tenant=${tenantId}`, 'Storefront Link')}
                              className="w-full py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Copy Storefront Link
                            </button>
                          </div>

                          {/* Option 2: Clean Slug Path Link */}
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition">
                            <div className="flex items-center justify-between font-bold text-white mb-1">
                              <span>Clean Path Link</span>
                              <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Custom Path</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate mb-2">
                              {window.location.origin}/t/{tenantId}
                            </div>
                            <button
                              onClick={() => handleCopyLink(`${window.location.origin}/t/${tenantId}`, 'Clean Path Link')}
                              className="w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Copy Clean Path Link
                            </button>
                          </div>

                          {/* Option 3: Direct Launch Workspace Link */}
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition">
                            <div className="flex items-center justify-between font-bold text-white mb-1">
                              <span>Direct Workspace Link</span>
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Auto Launch OS</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate mb-2">
                              {window.location.origin}/?tenant={tenantId}&action=workspace
                            </div>
                            <button
                              onClick={() => handleCopyLink(`${window.location.origin}/?tenant=${tenantId}&action=workspace`, 'Direct Workspace Link')}
                              className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> Copy Direct Workspace Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className={`text-[11px] ${currentTheme.textSecondary} truncate max-w-xs sm:max-w-md`}>
                {branding.tagline || 'Leading Next-Gen Operations & Integrated Commerce.'}
              </p>
            </div>
          </div>

          {/* Right: Single Primary Launch Workspace / Tenant Sign In Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEnterOS}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl border border-indigo-400/30 flex items-center gap-2.5 cursor-pointer transition transform hover:scale-[1.02] active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Launch Workspace / Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-6 sm:pt-8">

        {/* ========================================================= */}
        {/* OFFICIAL TENANT PRODUCT HOMEPAGE & CLIENT STOREFRONT      */}
        {/* ========================================================= */}
        <div className="space-y-10 animate-fade-in">
            {/* Storefront Hero Section */}
            <section className={`p-6 sm:p-10 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} shadow-2xl space-y-6 relative overflow-hidden`}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                
                {/* Hero Left Copy */}
                <div className="space-y-4 max-w-2xl text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>{branding.companyName} • Official Digital Storefront & Workspace</span>
                  </div>

                  <h1 className={`text-3xl sm:text-5xl font-black ${currentTheme.textPrimary} tracking-tight leading-tight`}>
                    {branding.customLandingData?.heroTitle || `${branding.companyName} Operational Hub`}
                  </h1>

                  <p className={`text-sm sm:text-base ${currentTheme.textSecondary} leading-relaxed font-sans`}>
                    {branding.customLandingData?.heroSubtitle || branding.tagline || 'Next-generation enterprise operations, customer portal, and integrated commerce.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={onEnterOS}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/20 border border-emerald-400/40 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current text-amber-300" />
                      <span>Launch Workspace / Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="#storefront-catalog"
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/10 flex items-center gap-2 transition cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>Explore Catalog & Services</span>
                    </a>
                  </div>
                </div>

                {/* Hero Right Visual Showcase */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 relative aspect-video lg:aspect-square">
                    <img
                      src={branding.customLandingData?.heroImageUrl || branding.logoUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'}
                      alt={branding.companyName}
                      className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full w-fit">
                        Verified Live Storefront
                      </span>
                      <h3 className="text-base font-black text-white mt-1">{branding.companyName}</h3>
                      <p className="text-xs text-slate-300 truncate">{branding.customDomain}</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 3 Core Operational Pillars Highlight Cards */}
            <section className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${currentTheme.textSecondary} flex items-center gap-2`}>
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Core Autonomous Capabilities
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Fully Integrated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Pillar 1: Automatic Digital Marketing */}
                <div className={`p-6 rounded-2xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3 shadow-xl hover:border-rose-500/40 transition group`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      Pillar 1
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-1 group-hover:text-rose-300 transition">
                      Automatic Digital Marketing
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AI-powered multi-channel marketing generating high-ROAS ad copies, social media calendars, automated flyer layouts, and SEO copywriting in seconds.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Ad Generator</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Social Calendar</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">SEO Copywriter</span>
                  </div>
                </div>

                {/* Pillar 2: Automatic Business and Company Operation */}
                <div className={`p-6 rounded-2xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3 shadow-xl hover:border-indigo-500/40 transition group`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      Pillar 2
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-1 group-hover:text-indigo-300 transition">
                      Automatic Business & Company Operation
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Full-spectrum operational execution managing HR records, biometric attendance, direct deposit payroll, GAAP general ledger accounting, and POS stock inventory.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">HR & Payroll</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">GAAP Ledger</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Omnichannel POS</span>
                  </div>
                </div>

                {/* Pillar 3: Automated Business with Logical View */}
                <div className={`p-6 rounded-2xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3 shadow-xl hover:border-cyan-500/40 transition group`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
                    <Workflow className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                      Pillar 3
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-1 group-hover:text-cyan-300 transition">
                      Automated Business with Logical View
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Visual operational workflow engine detailing every trigger, webhook, and cross-department rule with live morning AI summaries & decision telemetry.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Visual Workflows</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">AI SDR Triggers</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">Live Cockpit</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Storefront Products & Services Catalog */}
            <section id="storefront-catalog" className="space-y-6 pt-2 text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className={`text-xl font-black ${currentTheme.textPrimary} flex items-center gap-2`}>
                    <ShoppingBag className="w-5 h-5 text-emerald-400" /> Featured Storefront Catalog ({branding.customLandingData?.productsCatalog?.length || 3})
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Browse operational items & services. Submit direct orders or inquiries to {branding.companyName}'s CRM & POS system.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Live Tenant POS Order Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(branding.customLandingData?.productsCatalog && branding.customLandingData.productsCatalog.length > 0
                  ? branding.customLandingData.productsCatalog
                  : [
                      {
                        id: 'prod-1',
                        title: `${branding.companyName} Premium Product`,
                        price: '$299.00',
                        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
                        category: 'Store Item',
                        badge: 'Popular',
                        description: 'Premium tenant store item backed by full warranty & instant support.'
                      },
                      {
                        id: 'prod-2',
                        title: 'Custom Technical Onboarding',
                        price: '$499.00',
                        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
                        category: 'Services',
                        badge: 'Featured',
                        description: 'White-glove implementation service with dedicated tenant support.'
                      },
                      {
                        id: 'prod-3',
                        title: 'Hardware & Terminal Accessories',
                        price: '$199.00',
                        image: 'https://images.unsplash.com/photo-1556742049-0a67dd3f1238?auto=format&fit=crop&w=400&q=80',
                        category: 'Hardware',
                        badge: 'In Stock',
                        description: 'High-performance retail hardware scanner and barcode bundle.'
                      }
                    ]
                ).map((prod) => (
                  <div
                    key={prod.id}
                    className={`group border ${currentTheme.border} ${currentTheme.cardBg} hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-xl transition flex flex-col`}
                  >
                    {/* Product Image */}
                    <div className="h-48 w-full relative overflow-hidden bg-slate-900">
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20">
                          {prod.category}
                        </span>
                        {prod.badge && (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/80 text-white shadow">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-emerald-600 text-white font-mono font-extrabold text-xs shadow-lg">
                        {prod.price}
                      </div>
                    </div>

                    {/* Product Details & Action */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base text-white group-hover:text-emerald-300 transition">{prod.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{prod.description || 'Premium tenant item backed by full warranty & instant support.'}</p>
                      </div>

                      <button
                        onClick={() => setSelectedProductModal(prod)}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/30 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <ShoppingBasket className="w-4 h-4" /> Order / Inquire Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Operational Infrastructure Overview */}
            <section className={`p-6 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-4 text-left`}>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Operational Systems Active for {branding.companyName}:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-black/20 rounded-xl border border-white/10 space-y-1">
                  <span className="font-bold text-white block">Omnichannel POS</span>
                  <span className="text-[11px] text-slate-400">Barcode & Cash Terminal</span>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/10 space-y-1">
                  <span className="font-bold text-white block">CRM & Lead Pipeline</span>
                  <span className="text-[11px] text-slate-400">Deals & Lead Tracking</span>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/10 space-y-1">
                  <span className="font-bold text-white block">HR & Biometrics</span>
                  <span className="text-[11px] text-slate-400">Payroll & Staff Hours</span>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/10 space-y-1">
                  <span className="font-bold text-white block">Double-Entry Ledger</span>
                  <span className="text-[11px] text-slate-400">Automated Tax & P&L</span>
                </div>
              </div>
            </section>

            {/* Tenant Physical Contact & Location Footer */}
            <section className={`p-6 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-left`}>
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-4 h-4 text-indigo-400" /> {branding.address}
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Phone className="w-4 h-4 text-emerald-400" /> {branding.phone}
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Mail className="w-4 h-4 text-cyan-400" /> {branding.supportEmail}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Domain Routing: {branding.customDomain}
              </span>
            </section>
          </div>


          <div className="hidden space-y-16 pt-6" style={{ display: 'none' }}>
            {/* 2. MAIN HERO SECTION */}
            <section className="space-y-12 text-center">
              
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-500/10 animate-fade-in">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span className="text-xs font-mono font-extrabold text-indigo-200 uppercase tracking-widest">
                  BizPilot OS 4.0 • Enterprise Operating System & Storefront
                </span>
              </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08]">
              One AI Operating System to Run <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">
                Your Entire Enterprise.
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-xl font-sans leading-relaxed max-w-2xl mx-auto">
              Replace 15+ fragmented SaaS tools. Manage CRM, Sales, AI Autopilot, HR, Payroll, Finance, Accounting, POS, Inventory & Multi-Branch ERP from one autonomous platform.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onEnterOS}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 border border-indigo-400/40 flex items-center justify-center gap-3 transition transform hover:-translate-y-1 cursor-pointer group"
            >
              <Zap className="w-5 h-5 fill-current text-amber-300 group-hover:scale-110 transition" />
              <span>Launch Live Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <a
              href="#guided-tour-section"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 font-extrabold text-sm rounded-2xl border border-indigo-500/30 flex items-center justify-center gap-2 transition cursor-pointer backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Interactive Guided Tour</span>
            </a>

            <a
              href="#roi-calculator"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-200 font-extrabold text-sm rounded-2xl border border-white/10 hover:border-indigo-500/40 flex items-center justify-center gap-2 transition cursor-pointer backdrop-blur-md"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Calculate Software ROI</span>
            </a>
          </div>

          {/* Floating Pill Cloud Ticker */}
          <div className="pt-4 overflow-hidden max-w-5xl mx-auto">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-3">Consolidating 24+ Operating Domains:</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
              {[
                { label: 'CRM & Pipeline', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' },
                { label: 'AI SDR Agents', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
                { label: 'HR & Payroll', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
                { label: 'Finance & P&L', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
                { label: 'POS & Inventory', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
                { label: 'Website Builder', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
                { label: 'Digital Marketing', color: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
                { label: 'Restaurant ERP', color: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
                { label: 'Tours & Travel', color: 'border-sky-500/30 bg-sky-500/10 text-sky-300' },
                { label: 'Healthcare Clinic', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
                { label: 'Multi-Branch HQ', color: 'border-violet-500/30 bg-violet-500/10 text-violet-300' }
              ].map((pill, idx) => (
                <span key={idx} className={`px-3 py-1 rounded-full border ${pill.color} font-semibold flex items-center gap-1.5 shadow-sm`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          {/* 2. HERO DASHBOARD LIVE MOCKUP (Linear / Vercel style) */}
          <div className="pt-6">
            <div className="bg-[#0B0D19]/90 border border-indigo-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden group max-w-5xl mx-auto text-left">
              
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">bizpilot-os.app / enterprise-cockpit</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    99.99% Operational
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                    Tenant: Global HQ
                  </span>
                </div>
              </div>

              {/* Mockup Tab Selector */}
              <div className="flex items-center gap-2 mb-4 bg-white/5 p-1 rounded-xl w-fit border border-white/5">
                <button
                  onClick={() => setHeroMockupTab('feed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    heroMockupTab === 'feed' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Live AI Autopilot Feed
                </button>
                <button
                  onClick={() => setHeroMockupTab('kpis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    heroMockupTab === 'kpis' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📈 Executive Cockpit KPIs
                </button>
                <button
                  onClick={() => setHeroMockupTab('branches')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    heroMockupTab === 'branches' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌐 Multi-Branch Matrix
                </button>
              </div>

              {/* Mockup Tab Contents */}
              {heroMockupTab === 'feed' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
                        AI
                      </div>
                      <div>
                        <p className="text-white font-bold">Autonomous AI SDR #4 Qualified Enterprise Lead</p>
                        <p className="text-[11px] text-slate-400">Scraped LinkedIn & scheduled $45,000 deal demo with VP of Operations at Acme Corp.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded">2s ago</span>
                  </div>

                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">
                        P&L
                      </div>
                      <div>
                        <p className="text-white font-bold">AI Financial Auditor Reconciled Q3 Tax Ledger</p>
                        <p className="text-[11px] text-slate-400">Identified $4,200 redundant software subscription charges & updated GAAP report.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded">14s ago</span>
                  </div>

                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
                        POS
                      </div>
                      <div>
                        <p className="text-white font-bold">Inventory Predictor Reordered SKU-8840 Safety Stock</p>
                        <p className="text-[11px] text-slate-400">Dispatched purchase order to supplier for Branch #2 (London) automatically.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-1 rounded">1m ago</span>
                  </div>
                </div>
              )}

              {heroMockupTab === 'kpis' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Monthly Recurring Revenue</span>
                    <span className="text-xl font-black text-white block">$184,200 USD</span>
                    <span className="text-[10px] text-emerald-400 font-bold">+24.2% MoM Growth</span>
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Active Pipeline Value</span>
                    <span className="text-xl font-black text-indigo-300 block">$1,420,000</span>
                    <span className="text-[10px] text-indigo-400 font-bold">88 Deals Stage 3+</span>
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Consolidated Staff</span>
                    <span className="text-xl font-black text-purple-300 block">142 Employees</span>
                    <span className="text-[10px] text-purple-400 font-bold">1-Click Payroll Ready</span>
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Software Costs Saved</span>
                    <span className="text-xl font-black text-emerald-400 block">$38,400/yr</span>
                    <span className="text-[10px] text-emerald-400 font-bold">82% Cost Reduction</span>
                  </div>
                </div>
              )}

              {heroMockupTab === 'branches' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> New York HQ</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <p>Revenue: <strong className="text-white">$92,400/mo</strong></p>
                      <p>POS Terminal: <strong className="text-emerald-400">Online</strong></p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> London Branch</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <p>Revenue: <strong className="text-white">£48,200/mo</strong></p>
                      <p>Inventory: <strong className="text-amber-300">Auto-Reordered</strong></p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Tokyo Sub-Branch</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <p>Revenue: <strong className="text-white">¥6.8M/mo</strong></p>
                      <p>Tax Ledger: <strong className="text-indigo-300">Synchronized</strong></p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </section>

        {/* 2. INTERACTIVE GUIDED TOUR WORKFLOW STEPPER */}
        <BizPilotGuidedTour onEnterOS={onEnterOS} onSelectFeature={onSelectFeature} />

        {/* 3. INTERACTIVE ROI & SOFTWARE CONSOLIDATION CALCULATOR */}
        <section id="roi-calculator" className="scroll-mt-12">
          <div className="bg-[#0B0D19] border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase">
                <DollarSign className="w-3.5 h-3.5" />
                Software Consolidation Math
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
                How Much Software Overhead Will You Save?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Stop paying separate subscriptions for Salesforce, Workday, QuickBooks, HubSpot, Zendesk & Shopify. See your exact annual savings.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders Input Column */}
              <div className="lg:col-span-7 space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
                
                {/* Team Size Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold uppercase">Team / Seat Count:</span>
                    <span className="text-indigo-300 font-black text-sm bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/30">
                      {teamSize} Employees
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5 Seats</span>
                    <span>50 Seats</span>
                    <span>100 Seats</span>
                    <span>200 Seats</span>
                  </div>
                </div>

                {/* Branch Count Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold uppercase">Operating Branches / Entities:</span>
                    <span className="text-purple-300 font-black text-sm bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30">
                      {branchCount} Locations
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={branchCount}
                    onChange={(e) => setBranchCount(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500 cursor-pointer bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 Location</span>
                    <span>5 Locations</span>
                    <span>10 Locations</span>
                    <span>15 Locations</span>
                  </div>
                </div>

                {/* Legacy Stack Breakdown List */}
                <div className="border-t border-white/10 pt-4 space-y-2 text-xs font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Fragmented Tool Costs:</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                      <span>Salesforce CRM:</span>
                      <span className="text-rose-400 font-bold">${(teamSize * 150).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                      <span>Workday / Gusto HR:</span>
                      <span className="text-rose-400 font-bold">${(teamSize * 120).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                      <span>HubSpot Marketing:</span>
                      <span className="text-rose-400 font-bold">$800/mo</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                      <span>Zendesk Support:</span>
                      <span className="text-rose-400 font-bold">${(teamSize * 89).toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Savings Output Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/40 p-6 rounded-3xl space-y-6 text-center shadow-xl">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                    Estimated Annual Savings
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                    ${annualSavings.toLocaleString()} USD
                  </div>
                  <span className="text-xs text-slate-400 font-mono block">
                    Save <strong className="text-white font-bold">{savingsPercent}%</strong> compared to traditional SaaS stacks
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs border-t border-b border-white/10 py-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Traditional Stack Cost</span>
                    <span className="text-lg font-extrabold text-rose-400">${totalTraditionalMonthly.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">BizPilot OS Flat Tier</span>
                    <span className="text-lg font-extrabold text-indigo-300">${bizpilotMonthly.toLocaleString()}/mo</span>
                  </div>
                </div>

                <button
                  onClick={onEnterOS}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Lock In Enterprise Savings Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ALL-IN-ONE MODULE MATRIX */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase mb-2">
                <Layers className="w-3.5 h-3.5" />
                Consolidated Capability Suite
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
                24+ Enterprise Operating Modules
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                Filter by category to explore built-in business capabilities. Click any module for a deep-dive preview.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search CRM, POS, HR, Payroll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 transition font-sans"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-lg shadow-indigo-600/20'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => setActiveDrawerModule(mod)}
                  className="bg-[#0B0D19] border border-white/10 hover:border-indigo-500/50 rounded-2xl p-5 transition duration-300 hover:-translate-y-1 group relative flex flex-col justify-between cursor-pointer shadow-xl overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mod.gradient} opacity-10 group-hover:opacity-25 blur-2xl transition duration-500 rounded-full pointer-events-none`} />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.gradient} p-2.5 flex items-center justify-center text-white shadow-md`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white/5 text-indigo-300 border border-white/10 px-2 py-0.5 rounded-full uppercase">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition flex items-center justify-between">
                        {mod.title}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1 text-indigo-400" />
                      </h3>
                      <p className="text-[11px] font-semibold text-indigo-400/90">{mod.tagline}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>

                    {/* Replaces Tool Badge List */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Replaces:</span>
                      {mod.replacedTools.map((tool, idx) => (
                        <span key={idx} className="text-[9px] font-mono text-rose-300/80 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Footer */}
                  <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-white/10 font-mono text-[10px] relative z-10">
                    {mod.metrics.map((m, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                        <span className="text-slate-400 block text-[8px] uppercase">{m.label}</span>
                        <span className="text-white font-bold">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. LIVE DASHBOARD INTERACTIVE SHOWCASE (5 Interactive Views) */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase">
              <Terminal className="w-3.5 h-3.5" />
              Interactive UI Preview Sandbox
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Experience the BizPilot OS Cockpit
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Switch between primary operational views to see how real-time intelligence flows across your departments.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 font-mono text-xs">
            {[
              { id: 'cockpit', label: 'Executive Cockpit', icon: BarChart3 },
              { id: 'ai_sdr', label: 'AI SDR & Outreach', icon: Bot },
              { id: 'finance', label: 'Finance & Payroll', icon: CreditCard },
              { id: 'inventory', label: 'POS & Inventory', icon: Package },
              { id: 'industry', label: 'Industry ERPs', icon: UtensilsCrossed }
            ].map((tab) => {
              const IconC = tab.icon;
              const isActive = showcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setShowcaseTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-lg shadow-indigo-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
                  }`}
                >
                  <IconC className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Sandbox Canvas */}
          <div className="bg-[#0B0D19] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
            
            {showcaseTab === 'cockpit' && (
              <div className="space-y-6 animate-fade-in font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> Executive Morning AI Briefing & KPI Cockpit
                  </h3>
                  <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    Live Sync
                  </span>
                </div>

                <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-2 text-xs">
                  <p className="text-indigo-300 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" /> Automated 8:00 AM AI Executive Summary:
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    "Good morning. Yesterday's gross revenue reached <strong className="text-emerald-400">$28,450</strong> (+14% above forecast). AI SDRs booked 12 sales calls. Branch #3 (Singapore) flagged a low inventory alert on SKU-1049, which has been auto-reordered."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Gross MRR</span>
                    <span className="text-2xl font-black text-white block">$184,200</span>
                    <span className="text-emerald-400 font-bold">+18.2% vs last month</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Open Support Tickets</span>
                    <span className="text-2xl font-black text-amber-300 block">4 Tickets</span>
                    <span className="text-slate-400">Avg Resolution: 4.2 Mins</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Payroll Status</span>
                    <span className="text-2xl font-black text-emerald-400 block">Calculated</span>
                    <span className="text-emerald-300">Ready for 1-Click Pay</span>
                  </div>
                </div>
              </div>
            )}

            {showcaseTab === 'ai_sdr' && (
              <div className="space-y-6 animate-fade-in font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" /> Autonomous AI SDR Prospecting & Lead Queue
                  </h3>
                  <span className="text-xs text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30">
                    24/7 Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">TechCorp Systems • Director of IT</p>
                      <p className="text-[11px] text-slate-400">Personalized sequence sent. Click-through detected on pricing calculator.</p>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">High Intent (94%)</span>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">Global Logistics Inc • Chief Operations Officer</p>
                      <p className="text-[11px] text-slate-400">Auto-replied to inquiry regarding multi-branch inventory tracking.</p>
                    </div>
                    <span className="text-indigo-300 font-bold bg-indigo-500/10 px-2 py-1 rounded">Meeting Booked</span>
                  </div>
                </div>
              </div>
            )}

            {showcaseTab === 'finance' && (
              <div className="space-y-6 animate-fade-in font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Financial Treasury, P&L & Automated Payroll
                  </h3>
                  <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    GAAP Audited
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <p className="text-slate-400 uppercase text-[10px]">Q3 Cashflow Forecast Runway:</p>
                    <p className="text-3xl font-black text-emerald-400">24.5 Months</p>
                    <p className="text-slate-400 text-[11px]">Calculated based on current burn rate & AR collections.</p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <p className="text-slate-400 uppercase text-[10px]">Batch Payroll Disbursement:</p>
                    <p className="text-3xl font-black text-indigo-300">$142,800 USD</p>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-[11px] font-bold">
                      Execute 1-Click Direct Deposit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showcaseTab === 'inventory' && (
              <div className="space-y-6 animate-fade-in font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" /> Multi-Warehouse Inventory & Retail POS Terminal
                  </h3>
                  <span className="text-xs text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                    Barcode Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[10px]">SKU-1049 (Server Racks)</span>
                    <span className="text-white font-bold text-lg">140 Units in Stock</span>
                    <span className="text-emerald-400 block text-[10px]">Warehouse A (NY)</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[10px]">SKU-8840 (POS Cables)</span>
                    <span className="text-amber-300 font-bold text-lg">12 Units (Low Stock)</span>
                    <span className="text-amber-400 block text-[10px]">Auto-PO Dispatched</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[10px]">Retail POS Checkout</span>
                    <span className="text-indigo-300 font-bold text-lg">Scanner Ready</span>
                    <span className="text-indigo-400 block text-[10px]">1.2s Avg Checkout</span>
                  </div>
                </div>
              </div>
            )}

            {showcaseTab === 'industry' && (
              <div className="space-y-6 animate-fade-in font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-400" /> Specialized Industry Verticals (Restaurant, Tours, Healthcare)
                  </h3>
                  <span className="text-xs text-orange-300 bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/30">
                    Pre-Built Workflows
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded-xl space-y-1">
                    <span className="text-orange-300 font-bold block">Restaurant QR POS</span>
                    <p className="text-slate-300 text-[11px]">Kitchen Display System order routing & floor layout manager.</p>
                  </div>
                  <div className="p-3 bg-sky-950/20 border border-sky-500/30 rounded-xl space-y-1">
                    <span className="text-sky-300 font-bold block">Tours & Travel ERP</span>
                    <p className="text-slate-300 text-[11px]">Multi-day itinerary builder & passenger manifest roster.</p>
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1">
                    <span className="text-emerald-300 font-bold block">Healthcare EHR</span>
                    <p className="text-slate-300 text-[11px]">HIPAA-ready Electronic Health Records & patient appointment desk.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* 6. ENTERPRISE AI AUTOPILOT CAPABILITIES */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase">
              <Bot className="w-3.5 h-3.5" />
              Autonomous AI Worker Workforce
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              AI Agents That Work While You Sleep
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Deploy autonomous AI worker agents across departments to eliminate tedious manual labor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'AI Revenue SDR',
                role: 'Sales & Prospecting',
                desc: 'Researches prospective clients, writes cold email sequences, qualifies inbound leads, and schedules demos.',
                icon: Users,
                color: 'text-indigo-400',
                border: 'border-indigo-500/30'
              },
              {
                title: 'AI Financial Auditor',
                role: 'Treasury & Compliance',
                desc: 'Audits expenses, detects double billing, reconciles bank feeds, and generates GAAP financial statements.',
                icon: DollarSign,
                color: 'text-emerald-400',
                border: 'border-emerald-500/30'
              },
              {
                title: 'AI Inventory Predictor',
                role: 'Supply Chain & POS',
                desc: 'Monitors SKU sales velocity, calculates safety stock levels, and automatically issues supplier POs.',
                icon: Package,
                color: 'text-amber-400',
                border: 'border-amber-500/30'
              },
              {
                title: 'AI Web & Content Studio',
                role: 'Marketing & Design',
                desc: 'Generates landing pages, social media post calendars, ad copies, and flyer graphics in under 30 seconds.',
                icon: Globe,
                color: 'text-cyan-400',
                border: 'border-cyan-500/30'
              }
            ].map((agent, idx) => {
              const IconA = agent.icon;
              return (
                <div key={idx} className={`bg-[#0B0D19] border ${agent.border} rounded-2xl p-5 space-y-3 shadow-xl relative overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white/5 text-white">
                      <IconA className={`w-5 h-5 ${agent.color}`} />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active 24/7
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{agent.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{agent.role}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {agent.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. INTEGRATIONS ECOSYSTEM */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase">
              <Workflow className="w-3.5 h-3.5" />
              Seamless Connectivity
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Connects with Your Existing Stack
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Native bi-directional OAuth integrations with payments, communication, marketing, and accounting platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center font-mono text-xs">
            {[
              'Stripe Payments', 'QuickBooks', 'Google Workspace', 'WhatsApp Business', 
              'Shopify Stores', 'SendGrid Mail', 'Zapier Automation', 'Slack Connect',
              'Salesforce Sync', 'Xero Accounting', 'PayPal Gateway', 'HubSpot Marketing'
            ].map((tool, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-indigo-500/40 transition text-slate-200 flex items-center justify-center gap-1.5 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{tool}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. PROOF METRICS & TRUST BADGES */}
        <section className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-white block">99.99%</span>
              <span className="text-xs text-slate-400 uppercase font-bold">Uptime SLA Guaranteed</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">$4.2M+</span>
              <span className="text-xs text-slate-400 uppercase font-bold">Software Overhead Saved</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-indigo-300 block">12,000+</span>
              <span className="text-xs text-slate-400 uppercase font-bold">Active Enterprise Workspaces</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-purple-300 block">&lt; 45ms</span>
              <span className="text-xs text-slate-400 uppercase font-bold">Global API Response Time</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> SOC2 Type II Certified</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> ISO 27001 Security</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Tenant Data Isolation</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> GDPR & HIPAA Ready</span>
          </div>
        </section>

        {/* 9. TESTIMONIALS & CASE STUDIES */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase">
              <Star className="w-3.5 h-3.5 fill-current" />
              Trusted by Enterprise Leaders
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Why Companies Switch to BizPilot OS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Replacing Salesforce, Gusto, and QuickBooks with BizPilot OS saved us $42,000 in our first year alone. The automated morning AI brief is how our executive board starts every day.",
                name: "Marcus Vance",
                role: "CEO, Apex Global Logistics",
                metric: "-84% Software Cost"
              },
              {
                quote: "Managing 8 restaurant locations was a nightmare with separate POS and inventory apps. BizPilot OS linked our floor seating, QR digital menus, and supplier POs seamlessly.",
                name: "Elena Rostova",
                role: "Founder, Gusto Dining Group",
                metric: "+35% Table Turnover"
              },
              {
                quote: "The autonomous AI SDRs qualified 140 enterprise sales leads last month without any manual intervention. It feels like having a 10-person outbound sales team for a fraction of the cost.",
                name: "David Sterling",
                role: "CTO, Solas HealthTech",
                metric: "4.8x Meetings Booked"
              }
            ].map((test, idx) => (
              <div key={idx} className="bg-[#0B0D19] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{test.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <div>
                    <p className="font-bold text-white">{test.name}</p>
                    <p className="text-[10px] text-slate-400">{test.role}</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold rounded text-[10px]">
                    {test.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. INTERACTIVE PRICING TIERS */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase">
              <CreditCard className="w-3.5 h-3.5" />
              Transparent Enterprise Pricing
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Simple Plans. No Hidden Per-App Fees.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              All plans include complete platform modules, unlimited AI automation tasks, and multi-tenant isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Starter OS',
                price: '$99',
                desc: 'Perfect for small teams & growing startups replacing basic CRMs.',
                features: ['Up to 10 Employee Seats', 'CRM, Invoicing & Basic HR', 'AI Web & Content Builder', '1 Operating Branch', 'Standard Email Support'],
                cta: 'Start 14-Day Free Trial',
                highlight: false
              },
              {
                title: 'Growth Enterprise',
                price: '$299',
                desc: 'Complete Operating System for scaling multi-branch businesses.',
                features: ['Up to 50 Employee Seats', 'All 24+ Operating Modules Included', '4 Autonomous AI SDR Agents', 'Up to 5 Operating Branches', 'Direct SMTP & Custom BYOK Keys', 'Priority 24/7 Dedicated Support'],
                cta: 'Launch Growth Workspace',
                highlight: true
              },
              {
                title: 'Global Multi-Branch',
                price: '$799',
                desc: 'Enterprise architecture for large corporations & global holding groups.',
                features: ['Unlimited Employee Seats', 'Unlimited Operating Branches', 'Custom AI Agent Fine-Tuning', 'Dedicated Infrastructure & SLA', 'SOC2 Audit Reports & SAML SSO', 'Dedicated Account Manager'],
                cta: 'Contact Enterprise Sales',
                highlight: false
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-6 sm:p-8 space-y-6 relative flex flex-col justify-between shadow-2xl ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-indigo-900/60 via-[#0B0D19] to-[#0B0D19] border-2 border-indigo-500 shadow-indigo-600/20'
                    : 'bg-[#0B0D19] border border-white/10'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-mono font-extrabold text-[10px] uppercase rounded-full shadow-md">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-white">{plan.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onEnterOS}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 11. HIGH-CONVERTING BOTTOM CTA */}
        <section className="bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-indigo-950/90 border border-indigo-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Ready to Upgrade to the AI Operating System?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base">
              Consolidate your business operations today. Launch your isolated enterprise workspace in under 60 seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto relative z-10">
            <button
              onClick={onEnterOS}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-2xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current text-indigo-600" />
              Launch BizPilot OS
            </button>
          </div>
        </section>

        {/* 12. FOOTER */}
        <footer className="border-t border-white/10 pt-12 pb-6 space-y-8 font-mono text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold font-sans">
                  BP
                </div>
                <span className="font-bold text-white text-sm font-sans">BizPilot OS</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                The AI Business Operating System unifying CRM, HR, Payroll, Finance, POS, Marketing & Multi-Branch ERP.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block uppercase text-[10px]">Core Suite</span>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>CRM & Sales</li>
                <li>AI SDR Agents</li>
                <li>HR & Payroll</li>
                <li>Finance & P&L</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block uppercase text-[10px]">Industry ERPs</span>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>Restaurant OS</li>
                <li>Tours & Travel</li>
                <li>Healthcare Clinic</li>
                <li>Manufacturing MRP</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block uppercase text-[10px]">Security & Status</span>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li className="text-emerald-400 font-bold">● System Normal (99.99%)</li>
                <li>SOC2 Type II Ready</li>
                <li>ISO 27001 Certified</li>
                <li>100% Tenant Isolation</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
            <p>© 2026 BizPilot OS Inc. All rights reserved. Enterprise AI Operating System.</p>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-300 cursor-pointer">Security Center</span>
            </div>
          </div>
        </footer>
      </div>
    </div>

      {/* DETAILED MODULE PREVIEW DRAWER / MODAL */}
      <AnimatePresence>
        {activeDrawerModule && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0B0D19] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-100 space-y-6 relative shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setActiveDrawerModule(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeDrawerModule.gradient} p-3 flex items-center justify-center text-white shadow-lg`}>
                  {React.createElement(activeDrawerModule.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full uppercase">
                    {activeDrawerModule.category}
                  </span>
                  <h3 className="font-extrabold text-2xl text-white">{activeDrawerModule.title}</h3>
                  <p className="text-xs text-indigo-300">{activeDrawerModule.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {activeDrawerModule.description}
              </p>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Key Enterprise Capabilities:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeDrawerModule.capabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 bg-white/5 rounded-xl text-slate-200 border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-xs font-mono">
                  <span className="text-slate-400 block text-[10px]">Replaces Disconnected Tools:</span>
                  <span className="text-rose-300 font-bold">{activeDrawerModule.replacedTools.join(', ')}</span>
                </div>

                <button
                  onClick={() => {
                    setActiveDrawerModule(null);
                    if (onEnterOS) onEnterOS();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  <span>Launch Module Workspace</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* 4. PRODUCT ORDER & INQUIRY MODAL */}
        {selectedProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0D0E17] border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-left"
            >
              <button
                onClick={() => setSelectedProductModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <img
                  src={selectedProductModal.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                  alt={selectedProductModal.title}
                  className="w-16 h-16 rounded-2xl object-cover border border-white/20"
                />
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                    {selectedProductModal.category}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">{selectedProductModal.title}</h3>
                  <span className="text-sm font-mono font-bold text-indigo-400">{selectedProductModal.price}</span>
                </div>
              </div>

              {orderSuccess ? (
                <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2 animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Order Inquiry Received!</h4>
                  <p className="text-xs text-emerald-200">
                    Your request has been routed to {branding.companyName}'s POS & CRM team. We will contact you shortly!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    {selectedProductModal.description || 'Place a direct order or product inquiry. Fully synced with tenant inventory and order pipeline.'}
                  </p>

                  <div className="space-y-2">
                    <label className="block text-slate-300 font-bold">Your Contact Email / Phone:</label>
                    <input
                      type="email"
                      placeholder="client@company.com"
                      value={orderCustomerEmail}
                      onChange={(e) => setOrderCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-300 font-bold">Quantity:</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-white px-2">{orderQuantity}</span>
                      <button
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm rounded-xl shadow-xl border border-emerald-400/30 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" /> Submit Order Inquiry to {branding.companyName}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default BizPilotLanding;
