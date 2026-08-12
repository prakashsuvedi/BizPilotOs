import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  Database, 
  Calendar, 
  PenTool, 
  Palette, 
  HardDrive, 
  Activity, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Search, 
  Send, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Check, 
  RefreshCw, 
  X, 
  FileLock, 
  Video, 
  Users, 
  Coins, 
  MessageSquare, 
  ChevronDown,
  Info,
  Layers,
  Sparkle
} from 'lucide-react';
import { BusinessProfile, CustomerPersona, CampaignPlan, BrandGuideline } from '../types';
import { clientDb, clientAuth } from '../lib/firebase';
import BusinessMemoryView from './BusinessMemoryView';

// Academy Content Definition
export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  quizQuestion: string;
  quizOptions: string[];
  correctAnswer: number;
}

export interface AcademyCourse {
  id: string;
  category: string;
  title: string;
  description: string;
  badge: string;
  lessons: CourseLesson[];
}

// 6. MarketForge Academy Course Data
export const ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: 'get-started',
    category: 'Getting Started',
    title: 'MarketForge Foundations',
    description: 'Learn the core architecture of multi-tenant workspaces and AI-augmented asset creation.',
    badge: 'MF_FOUNDATIONS_BADGE',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Platform Architecture & Tenancy',
        duration: '3 mins',
        content: 'MarketForge AI is built on a high-security, multi-tenant workspace architecture. Each tenant accounts for a locked corporation boundary, securing products, guidelines, and campaigns from neighbor nodes. Workspaces leverage on-the-fly Gemini analysis to construct campaigns from standard business parameters.',
        quizQuestion: 'How is tenant-isolation secured in the MarketForge workspace?',
        quizOptions: [
          'Under separate container namespaces',
          'Via secure isolated sub-tier datastores mapped to unique Tenant IDs',
          'Through public server-side cookie caches'
        ],
        correctAnswer: 1
      },
      {
        id: 'lesson-1-2',
        title: 'Your First Campaign Strategy',
        duration: '5 mins',
        content: 'To generate a functional campaign, you must first complete your Active Corporation profile. This feeds the Strategic Synthesizer the necessary customer pain points, industry nuances, and brand voice. Once the strategy is locked, the Campaign Planner draws a chronological calendar map.',
        quizQuestion: 'What must be completed before launching the Strategic Synthesizer?',
        quizOptions: [
          'A subscription billing gateway activation',
          'Inviting at least five remote teammates',
          'Filling the Company Profile (Industry, Category, and Target Audience)'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'mkt-fundamentals',
    category: 'Marketing Fundamentals',
    title: 'Modern SaaS Demand Synthesis',
    description: 'Master the methodology of defining clear buyer segments and building chronological campaign maps.',
    badge: 'SaaS_DEMAND_BADGE',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Customer Personas That Convert',
        duration: '4 mins',
        content: 'A customer persona is not simply a name and age range. It encapsulates concrete day-to-day corporate pain points and buying triggers. In SaaS, focus on manual reporting friction; in boutique consumer products, focus on tactile luxury preferences and provenance.',
        quizQuestion: 'Which parameter is critical when drafting a B2B SaaS Customer Persona?',
        quizOptions: [
          'Favorite recreation pastimes',
          'Specific software integration needs and manual reporting friction',
          'Regional shipping customs clearances'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'brand-dev',
    category: 'Brand Development',
    title: 'Visual Identity Lockdown',
    description: 'Establish high-contrast visual rules to guide digital asset production.',
    badge: 'BRAND_LOCKDOWN_BADGE',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Brand Assets Cohesion',
        duration: '4 mins',
        content: 'Cohesive branding establishes visual authority. A proper design system contains primary colors, display/heading typography pairings, and a list of structural brand Do and Dont constraints. Adhering to these prevent visual clutter on collateral like social media flyers.',
        quizQuestion: 'Which element is an example of a structural brand constraint?',
        quizOptions: [
          'A primary color hex assignment',
          'Rules like "Never stretch, rotate, or apply dropshadows to the brand icon"',
          'The country exchange rate parameter'
        ],
        correctAnswer: 1
      }
    ]
  }
];

// Helper Articles
export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  videoPlaceholder?: string;
  workflowTriggerTab?: 'dashboard' | 'strategist' | 'planner' | 'writer' | 'creative' | 'lifecycle' | 'knowledge' | 'package' | 'admin_portal';
}

// 7. Help System Knowledge Base Data
export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'create-campaign',
    title: 'How do I create a campaign?',
    category: 'Campaign Planning',
    content: 'Creating a strategic campaign is simple. First, select the "Marketing Strategist" tab and click the "Synthesize Customer Personas & Market Positioning" button to extract targeted buyer personas. Next, jump to the "Campaign Planner" tab where you can customize campaign dates, selected channels, and strategic KPIs.',
    workflowTriggerTab: 'planner'
  },
  {
    id: 'generate-flyer',
    title: 'How do I generate a flyer?',
    category: 'Flyer Design',
    content: 'To generate a high-converting visual flyer or marketing brochure, open the "Marketing Package" tab. Specify your preferred promotional objective, and click on "Generate Content Package". The system will automatically build ready-made flyers, email copy templates, and social media copy matching your active brand guideline specifications.',
    workflowTriggerTab: 'package'
  },
  {
    id: 'upload-products',
    title: 'How do I upload products?',
    category: 'Global Commerce',
    content: 'Knowledge Center is the primary repository for company details, products, services, and brand voice guidelines. Go to the "Knowledge Base" tab, type in the specifications or upload a product catalog catalog PDF, and click on "Extract Knowledge". AI will parse information and list approved products automatically.',
    workflowTriggerTab: 'knowledge'
  },
  {
    id: 'target-nepal',
    title: 'How do I target Nepal customers?',
    category: 'Localization',
    content: 'To capture the Nepal market: 1) Open the Company Workspace and select "Nepal" (NP) as the Target Country. This automatically initializes NPR pricing rules with tax adjustments. 2) Utilize warm minimalist visuals to build high-trust relationships. 3) Select common channels like local Facebook feeds or digital news placements.',
    workflowTriggerTab: 'strategist'
  },
  {
    id: 'export-pdf',
    title: 'How do I export a PDF?',
    category: 'Platform Administration',
    content: 'The platform provides a 1-click PDF Generation engine. On any workspace tab (Strategist, Planner, Writer, Creative Director), you will see a violet "Print/Save PDF" button at the upper right. Clicking this calls the formatted page printer layout to write professional briefs instantly.',
    workflowTriggerTab: 'package'
  }
];

// Industry Presets
export interface IndustryTemplate {
  id: string;
  name: string;
  profile: Partial<BusinessProfile>;
  personas: CustomerPersona[];
  campaign: Partial<CampaignPlan>;
  guideline: Partial<BrandGuideline>;
}

// 9. Industry-Specific Starter Workspaces
export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'restaurant',
    name: 'Gourmet Restaurant',
    profile: {
      name: 'Himalayan Grill & Tavern',
      industry: 'Food & Beverage / Hospitality',
      category: 'Contemporary Fusion Mountain Dining',
      description: 'An elegant dining bistro blending local Himalayan woodfired spices with premium modern culinary presentation, targeting food lovers and high-end travelers.',
      targetAudience: 'Epicurean travelers, local celebrations, corporate networking banquets, and tourists',
      brandVoice: 'Warm, culinary, flavorful, descriptive, highly refined and welcoming'
    },
    personas: [
      {
        name: 'Aayush Shrestha',
        role: 'Premium Food Blogger & Lifestyle Creator',
        demographics: '25-38, lifestyle blogger, urban explorer, Kathamandu metro area',
        painPoints: [
          'Saturated generic fast food reviews with no authentic cultural history',
          'Poor low-light photography aesthetics at common visual eateries'
        ],
        goals: [
          'Highlight unique local organic kitchen sources to followers',
          'Experience highly textured, woodfired mountain fine dining'
        ],
        preferredChannels: ['Instagram reels', 'Local Food Guides', 'Word of Mouth'],
        buyingTriggers: 'Artisanal traditional details, wood-roasted organic recipes, beautiful presentation'
      }
    ],
    campaign: {
      campaignName: 'Local Fires: A Journey Through Himalayan Spices',
      objective: 'Drive 500 reservation pre-bookings and generate premium social media presence.',
      durationWeeks: 4,
      channels: ['Instagram Video', 'Private Member Invites', 'Local Food Critics'],
      launchCalendar: [
        { day: 'Day 1', channel: 'Instagram Feed', title: 'The Smoke & The Stoneware', description: 'Introduce hand-carved stone platter presentation with traditional spices.', goal: '500 likes' },
        { day: 'Day 10', channel: 'Local PR', title: 'Himalayan Fuel Redefined', description: 'Feature master chefs smoking local cheese over pine branches.', goal: '5 critic reservation bookings' }
      ],
      strategicKPIs: ['Food cost percentage < 28%', '95% guest satisfaction score', '20% repeat booking rate']
    },
    guideline: {
      primaryColor: '#7C3AED',
      secondaryColor: '#E11D48',
      accentColor: '#F59E0B',
      typographyHeading: 'Playfair Display',
      typographyBody: 'Inter',
      visualVibe: 'Warm Organic Rust & Lavender',
      vibeDescription: 'Earthy slate gray overlays paired with deep vibrant terracotta rust colors and lavender lighting to create high-end visual intimacy.',
      logoPlacementRules: ['Keep clear 50px borders', 'Always place against clean white or charcoal slate backgrounds'],
      doAndDont: {
        dos: ['Show high-definition tactile close-ups of food textures', 'Highlight locally sourced ingredients in description lists'],
        donts: ['Never use raw white flash photography showing empty seats', 'Do not cluster generic stock graphics or flyers']
      },
      assetChecklist: ['Special Chef Selection Board Layout', 'Terracotta Table Tent Template', 'Instagram Dinner Launch RSVP']
    }
  },
  {
    id: 'hotel',
    name: 'Boutique Hotel & Resort',
    profile: {
      name: 'Everest Wellness Sanctuary',
      industry: 'Luxury Travel & Hospitality',
      category: 'Mountaintop Eco-Luxury Wellness Retreat',
      description: 'A serene mountaintop hot-spring wellness hotel delivering luxurious off-grid relaxation, high-end stone-carved architecture, and Ayurvedic therapies.',
      targetAudience: 'High-income global explorers seeking emotional recharge, luxury travel couples',
      brandVoice: 'Slow-paced, spiritual, quiet luxury, serene, breathtakingly descriptive'
    },
    personas: [
      {
        name: 'Clara Vanderpool',
        role: 'Tech Executive & Meditation Loyalist',
        demographics: '40-55, Global traveler, European metropolitan hubs',
        painPoints: [
          'High burnout rates from constant web connectivity',
          'Slick crowded luxury hotels that feel like airports'
        ],
        goals: [
          'Complete physical and digital detox for 10 straight days',
          'Experience authentic high-altitude herbal treatment cures'
        ],
        preferredChannels: ['Luxury Travel Newsletters', 'Exclusive Healing Retreats lists'],
        buyingTriggers: 'Panoramic mountain views, zero phone towers, customized clinical therapies'
      }
    ],
    campaign: {
      campaignName: 'Silence in the Summit: Winter Recharge',
      objective: 'Secure 90% room capacity bookings for the upcoming peak winter sanctuary season.',
      durationWeeks: 6,
      channels: ['Curated Travel Directories', 'Wellness Newsletters', 'VIP Invite Packages'],
      launchCalendar: [
        { day: 'Day 1', channel: 'Direct Mailer', title: 'The High Altitude Solace', description: 'Personal handwritten invitation to past executive patrons detailing the hot stone herbal thermal baths.', goal: '18 retreats sold' }
      ],
      strategicKPIs: ['Net Promoter Score > 94', 'Room occupancy > 85%', 'Treatment up-sales rate of 45%']
    },
    guideline: {
      primaryColor: '#0F172A',
      secondaryColor: '#06B6D4',
      accentColor: '#10B981',
      typographyHeading: 'Inter',
      typographyBody: 'Inter',
      visualVibe: 'Mountain Sage & Deep Slate Black',
      vibeDescription: 'Sage green accent linings representing forest purity paired with premium slate blacks of the peaks.',
      logoPlacementRules: ['Centering inside high-contrast header bounds', 'No dropshadows'],
      doAndDont: {
        dos: ['Incorporate breathtaking raw outdoor landscape photography', 'Emphasize silent negative space in layouts'],
        donts: ['Do not place cartoon cliparts or generic wellness symbols', 'Never post high-pressure clickbaits']
      },
      assetChecklist: ['Luxury Room Guide Layout', 'Welcome Package Cover Brief', 'Ayurvedic Treatment Guide Flyer']
    }
  },
  {
    id: 'retail',
    name: 'Boutique Apparel / Retail Store',
    profile: {
      name: 'Valkyrie Threads',
      industry: 'Apparel & Fashion Retail',
      category: 'Minimalist Sustainable Active Wear',
      description: 'High-comfort premium sportswear designed from ethically spun local plants and ocean-synthesized fiber threads.',
      targetAudience: 'Eco-conscious active buyers, runner clubs, design purists',
      brandVoice: 'Dynamic, sustainable, forward-moving, raw athletic honesty'
    },
    personas: [],
    campaign: { campaignName: 'Threaded for Oceans', objective: 'Sell launch batches.', launchCalendar: [], strategicKPIs: [] },
    guideline: { primaryColor: '#1E293B', secondaryColor: '#10B981', accentColor: '#E2E8F0', typographyHeading: 'Space Grotesk', typographyBody: 'Inter', visualVibe: 'Active Technical Green', logoPlacementRules: [], doAndDont: { dos: [], donts: [] }, assetChecklist: [] }
  },
  {
    id: 'tech',
    name: 'Technology SaaS / Company',
    profile: {
      name: 'Nexus Analytics AI',
      industry: 'Software & deep tech',
      category: 'Real-time multi-channel data operations',
      description: 'Predictive cohort models computing cross-channel churn indicators in under 300 milliseconds.',
      targetAudience: 'SaaS CEOs, growth product managers, database architects',
      brandVoice: 'High-tech, monospaced, definitive, action-ready'
    },
    personas: [],
    campaign: { campaignName: 'Cohort zero-leak launch', objective: 'Acquire trials.', launchCalendar: [], strategicKPIs: [] },
    guideline: { primaryColor: '#4F46E5', secondaryColor: '#8B5CF6', accentColor: '#06B6D4', typographyHeading: 'JetBrains Mono', typographyBody: 'Inter', visualVibe: 'Neon Indigo Grid', logoPlacementRules: [], doAndDont: { dos: [], donts: [] }, assetChecklist: [] }
  },
  {
    id: 'consulting',
    name: 'Consulting Firm',
    profile: {
      name: 'Sovereign Strategists',
      industry: 'Premium Agency & Consulting',
      category: 'International Supply Chain Realignment',
      description: 'High-end logistics advisory aligning border tariffs, maritime laws, and storage hubs for multi-national conglomerates.',
      targetAudience: 'Logistics directors, Fortune 500 supply executives',
      brandVoice: 'Sovereign, authoritative, macro-economic, structured'
    },
    personas: [],
    campaign: { campaignName: 'Macro Realignment Briefing', objective: 'Secure 12 key enterprise consultances.', launchCalendar: [], strategicKPIs: [] },
    guideline: { primaryColor: '#0F172A', secondaryColor: '#B45309', accentColor: '#047857', typographyHeading: 'Playfair Display', typographyBody: 'Inter', visualVibe: 'Regal Forest Green & Amber', logoPlacementRules: [], doAndDont: { dos: [], donts: [] }, assetChecklist: [] }
  },
  {
    id: 'realestate',
    name: 'Real Estate Agency',
    profile: {
      name: 'Vanguard Luxury Estates',
      industry: 'Real Estate & Properties',
      category: 'Premium Mid-century Architectural Listings',
      description: 'Curating authentic concrete, glass, and steel architectural masterpieces from mid-century iconic designers for creative directors.',
      targetAudience: 'High-net worth design lovers, architectural collectors',
      brandVoice: 'Architectural, geometric, curating, design-centric'
    },
    personas: [],
    campaign: { campaignName: 'Iconic Concrete: The Glasshouse Series', objective: 'Secure initial buyer views.', launchCalendar: [], strategicKPIs: [] },
    guideline: { primaryColor: '#18181B', secondaryColor: '#F4F4F5', accentColor: '#D97706', typographyHeading: 'Space Grotesk', typographyBody: 'Inter', visualVibe: 'Concrete Brutalism', logoPlacementRules: [], doAndDont: { dos: [], donts: [] }, assetChecklist: [] }
  }
];

// Local Type definitions for Tour Steps
export interface TourStep {
  targetId: string;
  title: string;
  content: string;
}

export const WATER_TOURS: Record<string, TourStep[]> = {
  dashboard: [
    { targetId: 'dashboard-widget-hero', title: 'Daily Command Center', content: 'This is your centralized operational control deck. It aggregates campaign metrics, active client workspace parameters, and next recommended actions.' },
    { targetId: 'success-score-widget', title: 'MarketForge Success Score™', content: 'Your primary health meter. Complete setup targets like adding products, customizing typography guidelines, and printing strategy briefs to max out your core business readiness.' },
    { targetId: 'btn-brand-settings', title: 'Dynamic Brand Settings', content: 'Directly modify active logos, headers, colors, and document layout formats from this secure global settings dock.' }
  ],
  knowledge: [
    { targetId: 'knowledge-center-extraction', title: 'RAG Knowledge Parser', content: 'Extract raw operational parameters from reference company brochures, catalog PDFs, or competitor URLs. MarketForge translates text into approved product entries.' },
    { targetId: 'knowledge-items-container', title: 'Approved Knowledge Assets', content: 'Browse, edit, and audit extracted components. Approved components serve as direct memory injections for compiling campaign brief copies.' }
  ],
  strategist: [
    { targetId: 'strategist-agent-officer', title: 'Strategic Intelligence Synthesizer', content: 'Runs a deep analysis against your company details. Generates target buyer personas, competitive SWOT analytics, and positioning elevator pitches.' },
    { targetId: 'btn-trigger-strategist', title: 'Synthesize Intelligence', content: 'Triggers the server-side Gemini generation. If your workspace lacks internet context, it automatically deploys smart localized templates.' }
  ]
};

interface SuccessCenterProps {
  profile: BusinessProfile;
  onChangeProfile: (profile: BusinessProfile) => void;
  brandConfig?: any;
  tenantId: string;
  tab: string;
  onChangeTab: (tab: any) => void;
  personas: CustomerPersona[];
  setPersonas: (p: CustomerPersona[]) => void;
  campaign: CampaignPlan | null;
  setCampaign: (cp: CampaignPlan) => void;
  guideline: BrandGuideline | null;
  setGuideline: (bg: BrandGuideline) => void;
  onCreateAuditLog: (type: string, severity: string, details: string) => void;
  userRole?: string;
}

export default function SuccessCenter({
  profile,
  onChangeProfile,
  brandConfig,
  tenantId,
  tab,
  onChangeTab,
  personas,
  setPersonas,
  campaign,
  setCampaign,
  guideline,
  setGuideline,
  onCreateAuditLog,
  userRole
}: SuccessCenterProps) {
  // Navigation State
  const [successTab, setSuccessTab] = useState<'onboarding' | 'academy' | 'coach' | 'templates' | 'security' | 'memory'>('onboarding');

  // Enterprise Synchronization Engine States
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [activeBackoffDelay, setActiveBackoffDelay] = useState<number>(0);
  const [conflictCount, setConflictCount] = useState<number>(0);
  const [lastRemoteUpdatedAt, setLastRemoteUpdatedAt] = useState<string>('');
  const [showSyncDiagnostics, setShowSyncDiagnostics] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<Array<{ timestamp: string; action: string; result: 'success' | 'failure' | 'retry'; details: string }>>([]);

  const addSyncHistory = (action: string, result: 'success' | 'failure' | 'retry', details: string) => {
    setSyncHistory(prev => [
      { timestamp: new Date().toLocaleTimeString(), action, result, details },
      ...prev.slice(0, 19)
    ]);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addTelemetryLog('save', 'Network connectivity restored. Sync engine active.');
      addSyncHistory('network_change', 'success', 'System came online.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addTelemetryLog('save', 'Network connection offline. Local edits cached.');
      addSyncHistory('network_change', 'failure', 'System went offline.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Welcome Banner & Wizard States
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    const closed = localStorage.getItem(`mf_welcome_closed_${tenantId}`);
    return !closed;
  });
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardCompany, setWizardCompany] = useState({ name: profile.name, industry: profile.industry, description: profile.description });
  const [wizardBrand, setWizardBrand] = useState({ tagline: brandConfig?.tagline || '', primary: '#4f46e5', secondary: '#06b6d4' });
  const [wizardProduct, setWizardProduct] = useState('');
  const [wizardProductsList, setWizardProductsList] = useState<string[]>(['Premium Service Suite']);
  const [wizardCountry, setWizardCountry] = useState('NP');
  const [wizardGoals, setWizardGoals] = useState<string[]>(['Increase Leads', 'Social Authority']);
  const [wizardPersonaName, setWizardPersonaName] = useState('Sarah Jenkins');
  const [wizardCampaignName, setWizardCampaignName] = useState('Winter Launch Campaign');

  // Academy, Course, and Badges State
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState<boolean>(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem(`mf_badges_${tenantId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // AI Success Coach State
  const [coachQuery, setCoachQuery] = useState('');
  const [coachChat, setCoachChat] = useState<Array<{ sender: 'user' | 'coach', text: string, listItems?: string[] }>>([
    { sender: 'coach', text: `Welcome to MarketForge Success Center™ Coach! I am your personal AI Marketing Consultant. Ask me anything about how to optimize your ${profile.name} campaigns, formulate buyer personas, configure local sales parameters in Nepal and other regions, or design high-converting visual flyers.` }
  ]);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // Search & Help article States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);

  // Guided tours State
  const [activeTourModule, setActiveTourModule] = useState<string | null>(null);
  const [currentTourStepIndex, setCurrentTourStepIndex] = useState<number>(0);

  // Teammates Collaboration invitation
  const [teamEmailInput, setTeamEmailInput] = useState('');
  const [invitedTeammates, setInvitedTeammates] = useState<string[]>([]);

  // Workflow Engine Real-Time Telemetry, diagnostics and DB Synchronizers
  const [telemetryLogs, setTelemetryLogs] = useState<Array<{ id: string, timestamp: string, type: 'nav' | 'save' | 'validation' | 'db', message: string }>>([
    { id: 'tel_init', timestamp: new Date().toISOString(), type: 'nav', message: 'Onboarding Workflow Engine™ initialized and armed.' }
  ]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(false);
  const [savedSessionId, setSavedSessionId] = useState<string>('');

  const addTelemetryLog = (type: 'nav' | 'save' | 'validation' | 'db', message: string) => {
    const newLog = {
      id: `tel_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      message
    };
    setTelemetryLogs(prev => [newLog, ...prev]);
  };

  // Progress Checklist completions synced dynamically or via Storage
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`mf_checklist_${tenantId}`);
    return saved ? JSON.parse(saved) : {
      company: profile.name !== 'AeroFlow',
      brand: !!brandConfig?.tagline,
      products: false,
      target: false,
      personas: personas.length > 0,
      campaign: !!campaign,
      content: false,
      flyer: false,
      pdf: false
    };
  });

  // Dynamic Score Calculation
  const [scoreMetrics, setScoreMetrics] = useState({
    score: 0,
    companySetup: 0,
    brandSetup: 0,
    productsAdded: 0,
    knowledgeCode: 0,
    campaignGenerated: 0,
    contentGenerated: 0,
    pdfExported: 0,
    teamInvited: 0,
    readinessText: 'Developing'
  });

  // Check for incomplete onboarding session in the database on load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const syncHeaders = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
          'x-simulated-role': userRole || 'owner',
          'x-simulated-tenant': tenantId
        };
        const res = await fetch('/api/onboarding/session', {
          headers: syncHeaders
        });
        if (res.ok) {
          const session = await res.json();
          if (session) {
            setLastRemoteUpdatedAt(session.updatedAt || '');
            if (session.status !== 'completed' && session.currentStep < 9 && session.currentStep > 1) {
              setSavedSessionId(session.id);
              if (session.draftData) {
                const { 
                  wizardCompany: wc, 
                  wizardBrand: wb, 
                  wizardProductsList: wpl, 
                  wizardCountry: wco, 
                  wizardGoals: wg, 
                  wizardPersonaName: wpn, 
                  wizardCampaignName: wcn 
                } = session.draftData;
                if (wc) setWizardCompany(wc);
                if (wb) setWizardBrand(wb);
                if (wpl) setWizardProductsList(wpl);
                if (wco) setWizardCountry(wco);
                if (wg) setWizardGoals(wg);
                if (wpn) setWizardPersonaName(wpn);
                if (wcn) setWizardCampaignName(wcn);
              }
              setWizardStep(session.currentStep);
              setShowResumePrompt(true);
              addTelemetryLog('db', `Incomplete onboarding session found! Active save located at Step ${session.currentStep}.`);
              addSyncHistory('load_session', 'success', `Loaded step ${session.currentStep} from cloud database.`);
            } else {
              addTelemetryLog('db', 'Welcome checked. No incomplete remote onboarding sessions pending resumption.');
            }
          }
        }
      } catch (err: any) {
        addTelemetryLog('db', `Database sync diagnostic read failure: ${err.message}`);
        addSyncHistory('load_session', 'failure', `Read error: ${err.message}`);
      }
    };

    const fetchCoachSession = async () => {
      try {
        const syncHeaders = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
          'x-simulated-role': userRole || 'owner',
          'x-simulated-tenant': tenantId
        };
        const res = await fetch('/api/guide/session', {
          headers: syncHeaders
        });
        if (res.ok) {
          const s = await res.json();
          if (s && s.guideResponses && s.guideResponses.length > 0) {
            setCoachChat(s.guideResponses);
            addTelemetryLog('db', `AI Coach chat history restored from GuideSession: Count ${s.guideResponses.length}.`);
          }
        }
      } catch (e: any) {
        addTelemetryLog('db', `Coach session sync transient error: ${e.message}`);
      }
    };

    fetchSession();
    fetchCoachSession();
  }, [tenantId, userRole]);

  // Trigger automatic debounced remote autosave on draft updates
  useEffect(() => {
    if (!showWizard && wizardStep === 1) return;

    setIsPending(true);
    setSaveStatus('saving');
    
    const payload = {
      currentStep: wizardStep,
      completionPercentage: Math.round(((wizardStep - 1) / 9) * 100),
      status: wizardStep === 9 ? 'completed' : 'in_progress',
      draftData: {
        wizardCompany,
        wizardBrand,
        wizardProductsList,
        wizardCountry,
        wizardGoals,
        wizardPersonaName,
        wizardCampaignName
      }
    };

    const delayDebounceFn = setTimeout(async () => {
      let attempt = 0;
      const maxRetries = 3;
      
      const performSync = async () => {
        if (!navigator.onLine) {
          setSaveStatus('error');
          addTelemetryLog('save', 'Autosave deferred: System is offline. Changes cached locally.');
          addSyncHistory('autosave', 'retry', 'Offline: Waiting for connectivity...');
          return;
        }

        try {
          const syncHeaders = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
            'x-simulated-role': userRole || 'owner',
            'x-simulated-tenant': tenantId
          };

          // Conflict detection check (comparing last remote update timestamp if available)
          if (lastRemoteUpdatedAt) {
            const checkRes = await fetch('/api/onboarding/session', { headers: syncHeaders });
            if (checkRes.ok) {
              const currentRemote = await checkRes.json();
              if (currentRemote && currentRemote.updatedAt && currentRemote.updatedAt !== lastRemoteUpdatedAt) {
                console.warn('[Conflict Detection] Remote session has a newer timestamp:', currentRemote.updatedAt, 'vs expected:', lastRemoteUpdatedAt);
                setConflictCount(prev => prev + 1);
                addTelemetryLog('validation', `Conflict warning: Cloud has newer edits (${new Date(currentRemote.updatedAt).toLocaleTimeString()}). overwriting safely (last-write-wins).`);
                addSyncHistory('conflict', 'retry', 'Conflict detected: Auto-resolved.');
              }
            }
          }

          const res = await fetch('/api/onboarding/session', {
            method: 'POST',
            headers: syncHeaders,
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const resData = await res.json();
            setSaveStatus('saved');
            setIsPending(false);
            setRetryCount(0);
            setActiveBackoffDelay(0);
            const now = new Date().toLocaleTimeString();
            setLastSavedTimestamp(now);
            if (resData.session && resData.session.updatedAt) {
              setLastRemoteUpdatedAt(resData.session.updatedAt);
            }
            addTelemetryLog('save', `Autosave background daemon: State synchronized securely with database at ${now}.`);
            addSyncHistory('autosave', 'success', `Synced step ${wizardStep} with cloud.`);
            onCreateAuditLog('workspace_sync', 'low', `Onboarding autosave checkpoint for step ${wizardStep} synchronized.`);
          } else {
            throw new Error(`Server returned HTTP ${res.status}`);
          }
        } catch (err: any) {
          console.error(`Sync Attempt ${attempt + 1} failed:`, err.message);
          attempt++;
          setRetryCount(attempt);
          
          if (attempt <= maxRetries) {
            const backoffTime = Math.pow(2, attempt) * 1000;
            setActiveBackoffDelay(backoffTime / 1000);
            addTelemetryLog('save', `Sync Fault: Attempt ${attempt}/${maxRetries} failed (${err.message}). Retrying in ${backoffTime / 1000}s...`);
            addSyncHistory('autosave', 'retry', `Attempt ${attempt} failed: ${err.message}. Retrying...`);
            
            setTimeout(performSync, backoffTime);
          } else {
            setSaveStatus('error');
            setActiveBackoffDelay(0);
            addTelemetryLog('save', `Autosave background sync fault after ${maxRetries} attempts: ${err.message}`);
            addSyncHistory('autosave', 'failure', `Sync failed: ${err.message}`);
          }
        }
      };

      performSync();
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [
    wizardCompany, 
    wizardBrand, 
    wizardProductsList, 
    wizardCountry, 
    wizardGoals, 
    wizardPersonaName, 
    wizardCampaignName,
    wizardStep,
    showWizard,
    tenantId,
    userRole,
    lastRemoteUpdatedAt
  ]);

  // Sync state whenever parent props update
  useEffect(() => {
    const hasProducts = wizardProductsList.length > 0;
    const hasPersonas = personas.length > 0;
    const hasCampaign = !!campaign;
    const hasBrand = !!guideline;

    const checklist = {
      company: profile.name !== 'AeroFlow' && profile.name.trim() !== '',
      brand: hasBrand || !!brandConfig?.tagline,
      products: hasProducts,
      target: profile.id !== 'aeroflow' || profile.description.includes('Sanctuary') || profile.description.includes('Grill'),
      personas: hasPersonas,
      campaign: hasCampaign,
      content: hasCampaign && personas.length > 0,
      flyer: hasCampaign && hasProducts,
      pdf: hasCampaign
    };
    
    setCompletedSteps(checklist);
    localStorage.setItem(`mf_checklist_${tenantId}`, JSON.stringify(checklist));
  }, [profile, personas, campaign, guideline, brandConfig, tenantId]);

  // 3. Score Engine computations
  useEffect(() => {
    let companyS = completedSteps.company ? 10 : 0;
    let brandS = completedSteps.brand ? 10 : 0;
    let productsS = completedSteps.products ? 15 : 0;
    let knowledgeS = completedSteps.target ? 20 : 0;
    let campaignS = completedSteps.campaign ? 15 : 0;
    let contentS = completedSteps.content ? 10 : 0;
    let pdfS = completedSteps.pdf ? 10 : 0;
    let teamS = invitedTeammates.length > 0 ? 10 : 0;

    const total = companyS + brandS + productsS + knowledgeS + campaignS + contentS + pdfS + teamS;
    
    let text = 'Developing Stage';
    if (total > 80) text = 'Launch-Ready Authority (Excellent)';
    else if (total > 50) text = 'SaaS Integration Operational (Medium)';
    else if (total > 20) text = 'Onboarding Core Configured (Basic)';

    setScoreMetrics({
      score: total,
      companySetup: companyS,
      brandSetup: brandS,
      productsAdded: productsS,
      knowledgeCode: knowledgeS,
      campaignGenerated: campaignS,
      contentGenerated: contentS,
      pdfExported: pdfS,
      teamInvited: teamS,
      readinessText: text
    });
  }, [completedSteps, invitedTeammates]);

  // Onboarding Checklist actions
  const checklistItems = [
    { key: 'company', label: 'Company Setup', tab: 'dashboard', points: '+10', desc: 'Initialize active corporate profile details.' },
    { key: 'brand', label: 'Brand Identity', tab: 'creative', points: '+10', desc: 'Configure typography and color layout codes.' },
    { key: 'products', label: 'Products & Services', tab: 'knowledge', points: '+15', desc: 'Add core products to the active catalog.' },
    { key: 'target', label: 'Target Market', tab: 'knowledge', points: '+20', desc: 'Choose targeted regional sales parameters.' },
    { key: 'personas', label: 'Customer Personas', tab: 'strategist', points: '+15', desc: 'Synthesize detailed high-fidelity B2B or B2C customer profiles.' },
    { key: 'campaign', label: 'Campaign Creation', tab: 'planner', points: '+15', desc: 'Create chronological strategic campaign briefs.' },
    { key: 'content', label: 'Content Generation', tab: 'writer', points: '+10', desc: 'Compose optimized ad copies & social feeds.' },
    { key: 'flyer', label: 'Flyer Generation', tab: 'package', points: '+10', desc: 'Synthesize layout specs for visual flyers.' },
    { key: 'pdf', label: 'PDF Export', tab: 'planner', points: '+10', desc: 'Export certified marketing materials for compliance reviews.' }
  ];

  // Welcome dismiss
  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(`mf_welcome_closed_${tenantId}`, 'true');
    onCreateAuditLog('system', 'low', 'User dismissed first-time login onboarding banner.');
  };

  // Search input handler
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = HELP_ARTICLES.filter(art => 
      art.title.toLowerCase().includes(q.toLowerCase()) || 
      art.content.toLowerCase().includes(q.toLowerCase()) ||
      art.category.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // 10. Demo Workspace Activator
  const handleEnableDemoWorkspace = () => {
    const demoProfile = INDUSTRY_TEMPLATES[0].profile; 
    onChangeProfile({
      ...profile,
      ...demoProfile,
      id: 'demo-restaurant-workspace'
    } as any);

    setPersonas(INDUSTRY_TEMPLATES[0].personas);
    if (INDUSTRY_TEMPLATES[0].guideline) {
      setGuideline({
        primaryColor: '#7C3AED',
        secondaryColor: '#E11D48',
        accentColor: '#F59E0B',
        typographyHeading: 'Playfair Display',
        typographyBody: 'Inter',
        visualVibe: 'Warm Organic Rust',
        vibeDescription: 'Earthy charcoal tones paired with mountain lavender and rust highlights.',
        logoPlacementRules: ['Place against black/white fields'],
        doAndDont: { dos: ['Show smoked trout Platter details'], donts: ['Never post blurry low-light photos'] },
        assetChecklist: ['RSVP Card', 'Wood Platter Flyer']
      });
    }
    setWizardProductsList(['Woodfired Himalayan Trout', 'Local Walnut Salad Platter', 'Craft Himalayan Brew Session']);
    
    onCreateAuditLog('brand_override', 'medium', 'Activated Example Demo Restaurant Workspace parameters instantaneously.');
    alert('Demo Workspace Mode Activated! Sourced "Himalayan Grill & Tavern" products, guidelines, and strategies. Refreshing dashboard score.');
  };

  // 9. Industry Template Selector
  const handleSelectIndustryTemplate = (tpl: IndustryTemplate) => {
    onChangeProfile({
      id: `tpl-${tpl.id}-${tenantId}`,
      name: tpl.profile.name || 'Sample Company',
      industry: tpl.profile.industry || 'General Trade',
      category: tpl.profile.category || 'Standard Sales',
      description: tpl.profile.description || '',
      targetAudience: tpl.profile.targetAudience || 'General Audience',
      brandVoice: tpl.profile.brandVoice || 'Professional'
    });

    if (tpl.personas) setPersonas(tpl.personas);
    if (tpl.guideline) {
      setGuideline({
        primaryColor: tpl.guideline.primaryColor || '#4F46E5',
        secondaryColor: tpl.guideline.secondaryColor || '#06B6D4',
        accentColor: tpl.guideline.accentColor || '#10B981',
        typographyHeading: tpl.guideline.typographyHeading || 'Inter',
        typographyBody: tpl.guideline.typographyBody || 'Inter',
        visualVibe: tpl.guideline.visualVibe || 'Clean Corporate',
        vibeDescription: tpl.guideline.vibeDescription || 'Clean grids with soft gradients.',
        logoPlacementRules: tpl.guideline.logoPlacementRules || [],
        doAndDont: tpl.guideline.doAndDont || { dos: [], donts: [] },
        assetChecklist: tpl.guideline.assetChecklist || []
      });
    }

    if (tpl.campaign) {
      setCampaign({
        campaignName: tpl.campaign.campaignName || 'Product Launch Campaign',
        objective: tpl.campaign.objective || 'Drive local sales',
        durationWeeks: tpl.campaign.durationWeeks || 4,
        channels: tpl.campaign.channels || ['Direct mail', 'Social Media Ads'],
        launchCalendar: tpl.campaign.launchCalendar || [],
        strategicKPIs: tpl.campaign.strategicKPIs || []
      });
    }

    // Seed products
    if (tpl.id === 'restaurant') {
      setWizardProductsList(['Trout Platter', 'Traditional Lamb Roast', 'Mountain Herbal Tea Brew']);
    } else if (tpl.id === 'hotel') {
      setWizardProductsList(['Private Wellness Villa Overnight', 'Mountain Herbal Steam Therapy Session', 'High-altitude organic honey culinary brief']);
    } else if (tpl.id === 'retail') {
      setWizardProductsList(['Plant Fiber Runner Pants', 'Sustainable ocean-synthesised athletic top']);
    }

    onCreateAuditLog('brand_override', 'high', `Instantiated pre-designed starter workspace for industry: ${tpl.name}`);
    alert(`Success! Handcrafted "${tpl.name}" workspace loaded. Products, Customer Personas, and chronological Campaigns generated.`);
  };

  // 2. Wizard Stepper Control with Step-by-Step Validation and Auto-Save
  const validateStepData = (): boolean => {
    setValidationError(null);

    if (wizardStep === 1) {
      if (!wizardCompany.name || wizardCompany.name.trim().length < 3) {
        setValidationError("Company Name must be at least 3 characters.");
        addTelemetryLog('validation', "Blocked progression: Company Name length violation.");
        return false;
      }
      if (!wizardCompany.industry || wizardCompany.industry.trim().length === 0) {
        setValidationError("Industry Sector cannot be empty.");
        addTelemetryLog('validation', "Blocked progression: Empty industry sector.");
        return false;
      }
      if (!wizardCompany.description || wizardCompany.description.trim().length < 10) {
        setValidationError("SaaS Mandate/Description is too short. Minimum 10 characters required.");
        addTelemetryLog('validation', "Blocked progression: Brief SaaS Description violation.");
        return false;
      }
    }

    if (wizardStep === 2) {
      if (!wizardBrand.tagline || wizardBrand.tagline.trim().length < 5) {
        setValidationError("Brand Tagline must be at least 5 characters.");
        addTelemetryLog('validation', "Blocked progression: Tagline length violation.");
        return false;
      }
    }

    if (wizardStep === 3) {
      if (!wizardProductsList || wizardProductsList.length === 0 || wizardProductsList[0] === "" || (wizardProductsList.length === 1 && wizardProductsList[0].trim() === "")) {
        setValidationError("Please add at least one Product/Offering specification into the catalog.");
        addTelemetryLog('validation', "Blocked progression: Missing offering specs.");
        return false;
      }
    }

    if (wizardStep === 4) {
      if (!wizardCountry) {
        setValidationError("Please select a valid target country segment to bind localization parameters.");
        addTelemetryLog('validation', "Blocked progression: Country select violation.");
        return false;
      }
    }

    if (wizardStep === 5) {
      if (!wizardGoals || wizardGoals.length === 0) {
        setValidationError("Please select at least one marketing goal trigger parameter.");
        addTelemetryLog('validation', "Blocked progression: Zero-goals allocation.");
        return false;
      }
    }

    if (wizardStep === 6) {
      if (!wizardPersonaName || wizardPersonaName.trim().length < 3) {
        setValidationError("Persona Label Name is required and must be at least 3 characters.");
        addTelemetryLog('validation', "Blocked progression: Blank label name.");
        return false;
      }
    }

    if (wizardStep === 7) {
      if (!wizardCampaignName || wizardCampaignName.trim().length < 4) {
        setValidationError("Campaign Name must be at least 4 characters.");
        addTelemetryLog('validation', "Blocked progression: Short campaign name definition.");
        return false;
      }
    }

    return true;
  };

  const handleWizardNext = async () => {
    // 1. Validate Current Step!
    if (!validateStepData()) {
      return; 
    }

    setValidationError(null);
    addTelemetryLog('nav', `Navigating from Step ${wizardStep} to Step ${wizardStep + 1 > 9 ? 9 : wizardStep + 1}.`);

    // 2. Perform snapshot sync based on step completion
    if (wizardStep === 1) {
      onChangeProfile({
        ...profile,
        name: wizardCompany.name,
        industry: wizardCompany.industry,
        description: wizardCompany.description
      });
      addTelemetryLog('save', `Step 1 complete: Propagated Company profile "${wizardCompany.name}" snapshot to parent state.`);
    } else if (wizardStep === 2) {
      addTelemetryLog('save', `Step 2 complete: Brand specs tagline: "${wizardBrand.tagline}" logged.`);
    } else if (wizardStep === 3) {
      addTelemetryLog('save', `Step 3 complete: ${wizardProductsList.length} products synced to the catalog.`);
    } else if (wizardStep === 4) {
      addTelemetryLog('save', `Step 4 complete: Applied statutory tax index for target region ${wizardCountry}.`);
    } else if (wizardStep === 5) {
      addTelemetryLog('save', `Step 5 complete: Goals synced: ${wizardGoals.join(', ')}.`);
    } else if (wizardStep === 6) {
      addTelemetryLog('save', `Step 6 complete: Persona target mapped to ${wizardPersonaName}.`);
    } else if (wizardStep === 7) {
      addTelemetryLog('save', `Step 7 complete: Active Campaign timeline labeled "${wizardCampaignName}".`);
    }

    // Save progress to client simulated doc onboarding_progress
    try {
      await clientDb.addDocToTenant('onboarding_progress', {
        stepCompleted: wizardStep,
        profileSnapshot: { name: profile.name, industry: profile.industry },
        timestamp: new Date().toISOString()
      }, tenantId);
    } catch (e) {
      console.warn('Simulated database sync saved.');
    }

    if (wizardStep < 9) {
      setWizardStep(wizardStep + 1);
    } else {
      // PHASE 8: COMPLETION ENGINE execution!
      addTelemetryLog('nav', 'Completing Onboarding Setup Wizard...');
      
      // Update score metric tracker internally
      const finalChecklist = {
        company: true,
        brand: true,
        products: true,
        target: true,
        personas: true,
        campaign: true,
        content: true,
        flyer: true,
        pdf: true
      };
      setCompletedSteps(finalChecklist);
      localStorage.setItem(`mf_checklist_${tenantId}`, JSON.stringify(finalChecklist));

      // Seeding Initial Guidelines
      setGuideline({
        primaryColor: wizardBrand.primary,
        secondaryColor: wizardBrand.secondary,
        accentColor: '#10b981',
        typographyHeading: 'Inter',
        typographyBody: 'Inter',
        visualVibe: 'Clean Modern SaaS Layout',
        vibeDescription: 'A custom palette crafted securely around our core brand criteria.',
        logoPlacementRules: ['Place against compliant backgrounds'],
        doAndDont: { dos: ['Maintain Inter text styles'], donts: ['Never distort logo dimensions'] },
        assetChecklist: ['Standard Brand Kit Brochure', 'Marketing Flyer Leaflet']
      });

      // Seeding Default Campaign Planner State
      setCampaign({
        campaignName: wizardCampaignName,
        objective: wizardGoals.join(' and '),
        durationWeeks: 4,
        channels: ['Google Search Ads', 'LinkedIn B2B Feed', 'Local Direct Mailers'],
        launchCalendar: [
          { day: 'Day 1', channel: 'Google Search Ads', title: 'Targeting Personas Setup', description: 'Define targeting personas and seed digital brand kit vectors', goal: 'Establish baseline target demographic visibility' },
          { day: 'Day 7', channel: 'LinkedIn B2B Feed', title: 'Draft Ads Copy', description: 'Draft initial ad copies inside Marketing Package Catalog', goal: 'Achieve 1.5% click-through-ratio threshold' },
          { day: 'Day 14', channel: 'Local Direct Mailers', title: 'Gateway Connection Check', description: 'Test digital eSewa/Khalti gateway integration boundaries', goal: 'Zero-drop checkout navigation validation' },
          { day: 'Day 21', channel: 'Direct Mailers', title: 'Asset Proof PDF Distribution', description: 'Distribute finalized product specification brief PDF proof', goal: 'Secure first 100 localized conversion responses' }
        ],
        strategicKPIs: ['Increase high-trust leads by 25%', 'Align remote staff feedback indexes']
      });

      // Seeding Default Personas list
      setPersonas([
        {
          name: wizardPersonaName,
          role: 'Primary Account Segment Champion',
          demographics: '30-49, Regional Metropolitan areas',
          painPoints: ['Manual task repetition bottlenecks', 'Friction navigating unlocalized services catalog'],
          goals: ['Deploy reliable automated workflows', 'Achieve compliant business culture matching'],
          preferredChannels: ['Direct search indexing', 'Local metropolitan circulars'],
          buyingTriggers: 'Highly targeted visual flyer guides, local language specifications support.'
        }
      ]);

      // Complete Remote Session state save
      try {
        const complPayload = {
          currentStep: 9,
          completionPercentage: 100,
          status: 'completed',
          draftData: {
            wizardCompany,
            wizardBrand,
            wizardProductsList,
            wizardCountry,
            wizardGoals,
            wizardPersonaName,
            wizardCampaignName
          }
        };

        await fetch('/api/onboarding/session', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
            'x-simulated-role': userRole || 'owner',
            'x-simulated-tenant': tenantId
          },
          body: JSON.stringify(complPayload)
        });

        // Earn and save Certification Badge!
        const updatedBadges = Array.from(new Set([...earnedBadges, 'onboarding-champion']));
        setEarnedBadges(updatedBadges);
        localStorage.setItem(`mf_badges_${tenantId}`, JSON.stringify(updatedBadges));

        addTelemetryLog('db', 'Completion Engine: Session flagged COMPLETED. Seeded default guidelines, personas lists, and campaign planners.');
        onCreateAuditLog('onboarding_completion', 'high', 'SUCCESS: Onboarding Workflow Engine marked completed. Congratulations badge issued!');
      } catch (err: any) {
        addTelemetryLog('db', `Error finalising session metadata: ${err.message}`);
      }

      setShowWizard(false);
      alert('Congratulations! Your personalized marketing workspace is 100% prepared. Default guidelines, target buyer personas, and chronological campaigns are fully generated and locked!');
    }
  };

  // Wizard product add
  const handleAddWizardProduct = () => {
    if (wizardProduct.trim()) {
      setWizardProductsList([...wizardProductsList, wizardProduct.trim()]);
      setWizardProduct('');
      addTelemetryLog('save', `Interactive catalog catalog item added: "${wizardProduct.trim()}".`);
    }
  };

  // Team Inviter
  const handleInviteTeam = () => {
    if (teamEmailInput.includes('@')) {
      setInvitedTeammates([...invitedTeammates, teamEmailInput.trim()]);
      setTeamEmailInput('');
      onCreateAuditLog('role_change', 'low', `Invited teammate workspace access invitation to ${teamEmailInput}`);
      alert(`Teammate Invitation Sent to: ${teamEmailInput}! Secured workspace role: Member.`);
    }
  };

  // 8. Coach response compiler (Intelligent dynamic consulting agent backed by persistent database)
  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachQuery.trim()) return;

    const userMsg = coachQuery.trim();
    // Update local chat first to preserve interactive UI
    const updatedUserChat = [...coachChat, { sender: 'user' as const, text: userMsg }];
    setCoachChat(updatedUserChat);
    setCoachQuery('');
    setIsCoachLoading(true);
    addTelemetryLog('nav', `Sent consultant coach query: "${userMsg.substring(0, 30)}..."`);

    try {
      // 1. Call our custom server AI coach agent
      const response = await fetch('/api/agent/coach', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
          'x-simulated-role': userRole || 'owner',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          question: userMsg,
          history: coachChat,
          profile: profile,
          countryCode: wizardCountry
        })
      });

      if (!response.ok) throw new Error('Coach endpoint returned issue status.');

      const result = await response.json();
      const newReply = { 
        sender: 'coach' as const, 
        text: result.replyText || "I failed to compile dynamic consulting lines. Let's align brand parameters.", 
        listItems: result.listItems || [] 
      };

      const finalChat = [...updatedUserChat, newReply];
      setCoachChat(finalChat);

      // 2. Persist this converse to our guide_sessions DB collection!
      await fetch('/api/guide/session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
          'x-simulated-role': userRole || 'owner',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          guideState: 'active',
          guideResponses: finalChat,
          guideProgress: wizardStep,
          lastInteraction: new Date().toISOString()
        })
      });

      addTelemetryLog('db', 'Coach conversation backup synchronized securely to remote database.');
    } catch (err: any) {
      addTelemetryLog('db', `AI Consultant communication fault: ${err.message}`);
      // Fallback response
      const fallbackReply = { 
        sender: 'coach' as const, 
        text: `Consultant server offline, using local expert wisdom. Regarding "${userMsg}":`, 
        listItems: [
          "Validate statutory Nepal taxes (default VAT 13%)",
          "Match warm hospitality styling choices in flyer catalog"
        ] 
      };
      setCoachChat(prev => [...prev, fallbackReply]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // Interactive Lesson Quiz submission
  const handleQuizSubmit = (correctIdx: number) => {
    if (selectedQuizAnswer === null) return;
    if (selectedQuizAnswer === correctIdx) {
      setLessonCompleted(true);
      alert('Correct Answer! Lesson completed successfully.');
      
      // Earn Badge if course completed
      if (selectedCourse) {
        const lastIdx = selectedCourse.lessons.findIndex(l => l.id === selectedCourse.lessons[activeLessonIndex].id);
        if (lastIdx === selectedCourse.lessons.length - 1) {
          const badgeId = selectedCourse.badge;
          if (!earnedBadges.includes(badgeId)) {
            const nextBadges = [...earnedBadges, badgeId];
            setEarnedBadges(nextBadges);
            localStorage.setItem(`mf_badges_${tenantId}`, JSON.stringify(nextBadges));
            onCreateAuditLog('system', 'medium', `User earned professional certification badge: ${badgeId}`);
            alert(`Amazing! You completed all courses in "${selectedCourse.title}" and earned the "${badgeId.replace(/_/g, ' ')}" Badge!`);
          }
        }
      }
    } else {
      alert('Incorrect option. Please review the lesson content and try again!');
    }
  };

  // 4. Product Tours trigger
  const handleStartTour = (module: string) => {
    setActiveTourModule(module);
    setCurrentTourStepIndex(0);
    onChangeTab(module as any);
  };

  const currentTourSteps = activeTourModule ? WATER_TOURS[activeTourModule] || [] : [];
  const currentTourStep = currentTourSteps[currentTourStepIndex];

  return (
    <div id="marketforge-success-center" className="space-y-6 animate-fade-in relative z-20">
      
      {/* 20. Guided Product Tour Overlay Banner */}
      {activeTourModule && currentTourStep && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-indigo-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                Product Walkthrough: {activeTourModule.toUpperCase()}
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">
                Step {currentTourStepIndex + 1} of {currentTourSteps.length}
              </span>
            </div>
            
            <h4 className="text-base font-bold text-slate-800">{currentTourStep.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{currentTourStep.content}</p>
            
            {/* Visual Simulator Pointer */}
            <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg text-[10px] font-mono text-indigo-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Target element: <strong className="select-all">#{currentTourStep.targetId}</strong> has been spotlighted.</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => setActiveTourModule(null)}
                className="text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Skip Tour
              </button>
              
              <div className="flex gap-2">
                {currentTourStepIndex > 0 && (
                  <button 
                    onClick={() => setCurrentTourStepIndex(currentTourStepIndex - 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                )}
                {currentTourStepIndex < currentTourSteps.length - 1 ? (
                  <button 
                    onClick={() => setCurrentTourStepIndex(currentTourStepIndex + 1)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveTourModule(null);
                      alert('Walkthrough Completed! You unlocked +10 Success Center score points.');
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Finish Tour
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. RESUME WORKFLOW PROCESSOR (Phase 7 Prompt Banner) */}
      {showResumePrompt && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-3xl shadow-sm space-y-3 relative overflow-hidden mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-300 text-amber-700">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 font-sans">Active Onboarding Session Resumed!</h4>
              <p className="text-amber-800 text-xs leading-relaxed">
                The Onboarding Workflow Engine™ detected an incomplete setup session for your tenant. You are currently at <b>Step {wizardStep} of 9</b> ({Math.round(((wizardStep - 1) / 9) * 100)}% progress). Choose an action to continue adopting your workspace tools:
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-end pt-1">
            <button 
              onClick={() => {
                setShowWizard(true);
                setShowResumePrompt(false);
                addTelemetryLog('nav', `User resumed incomplete workspace onboarding session at Step ${wizardStep}.`);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition outline-none"
            >
              Resume Session
            </button>
            <button 
              onClick={async () => {
                setWizardStep(1);
                setWizardCompany({ name: profile.name, industry: profile.industry, description: profile.description });
                setWizardBrand({ tagline: '', primary: '#4f46e5', secondary: '#06b6d4' });
                setWizardCampaignName('Winter Launch Campaign');
                setWizardPersonaName('Sarah Jenkins');
                setWizardProductsList(['Premium Service Suite']);
                setWizardCountry('NP');
                setWizardGoals(['Increase Leads', 'Social Authority']);
                setShowWizard(true);
                setShowResumePrompt(false);

                await fetch('/api/onboarding/session', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
                    'x-simulated-role': userRole || 'owner',
                    'x-simulated-tenant': tenantId
                  },
                  body: JSON.stringify({
                    currentStep: 1,
                    completionPercentage: 0,
                    status: 'in_progress',
                    draftData: {
                      wizardCompany: { name: profile.name, industry: profile.industry, description: profile.description },
                      wizardBrand: { tagline: '', primary: '#4f46e5', secondary: '#06b6d4' },
                      wizardProductsList: ['Premium Service Suite'],
                      wizardCountry: 'NP',
                      wizardGoals: ['Increase Leads', 'Social Authority'],
                      wizardPersonaName: 'Sarah Jenkins',
                      wizardCampaignName: 'Winter Launch Campaign'
                    }
                  })
                });

                addTelemetryLog('nav', 'User initiated clean onboarding session restart Fresh.');
              }}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs rounded-xl cursor-pointer transition outline-none"
            >
              Restart Fresh
            </button>
            <button 
              onClick={async () => {
                setShowResumePrompt(false);
                const finalChecklist = {
                  company: true,
                  brand: true,
                  products: true,
                  target: true,
                  personas: true,
                  campaign: true,
                  content: true,
                  flyer: true,
                  pdf: true
                };
                setCompletedSteps(finalChecklist);
                localStorage.setItem(`mf_checklist_${tenantId}`, JSON.stringify(finalChecklist));

                try {
                  await fetch('/api/onboarding/session', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123',
                      'x-simulated-role': userRole || 'owner',
                      'x-simulated-tenant': tenantId
                    },
                    body: JSON.stringify({
                      currentStep: 9,
                      completionPercentage: 100,
                      status: 'completed'
                    })
                  });
                  const updatedBadges = Array.from(new Set([...earnedBadges, 'onboarding-champion']));
                  setEarnedBadges(updatedBadges);
                } catch (e: any) {
                  console.warn(e);
                }
                addTelemetryLog('nav', 'User skipped onboarding checklist progression.');
                alert('Onboarding skipped. Standard marketing defaults configured.');
              }}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl cursor-pointer transition border border-amber-200"
            >
              Skip and Use Defaults
            </button>
            <button 
              onClick={() => {
                setShowResumePrompt(false);
                addTelemetryLog('nav', 'User dismissed session resumption alert.');
              }}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-500 rounded-xl cursor-pointer"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Intelligent First Login Experience */}
      {showWelcome && (
        <div className="bg-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          
          <div className="space-y-2 relative z-10 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded">
                First Login Experience
              </div>
              <span className="text-[10px] text-indigo-300 font-mono">Workspace ID: {tenantId}</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold font-sans tracking-tight">Welcome to MarketForge OS</h2>
            <p className="text-indigo-200 text-xs leading-relaxed">
              Let's build your first marketing system. Fill company details, map tailored target client personas, establish design rules, and generate localized calendars to secure high adoption metrics.
            </p>
            
            {/* Automatic resume placeholder */}
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
              <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
              <span>Session loaded: Automatically resuming where you left off. Ready to begin Step {wizardStep}.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 relative z-10">
            <button 
              onClick={() => { setShowWizard(true); setWizardStep(1); }}
              className="px-5 py-3 bg-white hover:bg-slate-50 text-indigo-950 font-bold text-xs rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Start Guided Setup Wizard
            </button>
            <button 
              onClick={handleEnableDemoWorkspace}
              className="px-5 py-3 bg-indigo-800/80 hover:bg-indigo-800 border border-white/10 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Database className="w-4 h-4" />
              Explore sample Demo Workspace
            </button>
            <button 
              onClick={handleDismissWelcome}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition flex items-center justify-center cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Score & Setup Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic score widget */}
        <div id="success-score-widget" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">Enterprise Asset Audit</span>
            <h3 className="text-base font-bold text-slate-800 font-sans flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-indigo-500" />
              MarketForge Success Score™
            </h3>
          </div>

          <div className="py-6 flex items-center gap-6 justify-center">
            <div className="relative flex items-center justify-center w-24 h-24 shrink-0 rounded-full border-4 border-slate-100 bg-slate-50 text-slate-900">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{scoreMetrics.score}</span>
                <span className="text-[10px] block text-slate-400 font-bold uppercase">Ready</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-medium">Business Readiness:</div>
              <div className="text-xs font-bold text-indigo-600 font-mono tracking-tight bg-indigo-50 border border-indigo-200/50 inline-block px-2 py-0.5 rounded">
                {scoreMetrics.readinessText}
              </div>
              <p className="text-[10px] text-slate-400 leading-normal max-w-[160px]">
                Higher scores unlock custom localized currencies and statutory compliant templates.
              </p>
            </div>
          </div>

          {/* 15. Notification & Recommendation Engine */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900">
            <span className="text-[9px] font-bold text-indigo-600 block uppercase tracking-widest font-mono">Recommended Next Step</span>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {scoreMetrics.score < 30 ? 'Open Settings to write custom Company description' : 
               scoreMetrics.score < 50 ? 'Add Products & Services catalog inside Knowledge Base' :
               scoreMetrics.score < 80 ? 'Run First Strategist AI Report and view customer Personas' :
               'Invite your team and test multi-tenant access boundaries'}
            </p>
            <div className="mt-2.5 flex justify-end">
              <button 
                onClick={() => {
                  if (scoreMetrics.score < 30) onChangeTab('dashboard');
                  else if (scoreMetrics.score < 50) onChangeTab('knowledge');
                  else onChangeTab('strategist');
                }}
                className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Navigate there</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic setup Checklist percentage panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 font-sans">Corporate Onboarding Checklist</h4>
              <p className="text-slate-500 text-xs">Fulfill platform milestones to achieve full digital adoption benchmarks.</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-indigo-600 font-mono">
                {Math.round((Object.values(completedSteps).filter(Boolean).length / Object.values(completedSteps).length) * 100)}%
              </span>
              <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {checklistItems.map((chk) => {
              const isDone = completedSteps[chk.key];
              return (
                <div 
                  key={chk.key} 
                  className={`p-3 rounded-2xl border transition-all ${
                    isDone 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-100">
                      {chk.points} score
                    </span>
                    {isDone ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    )}
                  </div>
                  <h5 className="text-xs font-bold mt-2 font-sans">{chk.label}</h5>
                  <p className="text-[9px] text-slate-400 leading-normal mt-0.5">{chk.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-1">
            <button 
              onClick={() => { setShowWizard(true); setWizardStep(1); }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              Launch Setup wizard Stepper
            </button>
          </div>
        </div>

      </div>

      {/* Success Center Sub Navigation */}
      <div className="flex border-b border-slate-200 pb-0 gap-2 overflow-x-auto">
        <button 
          onClick={() => setSuccessTab('onboarding')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
            successTab === 'onboarding' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🎓 Onboarding & Tours
        </button>
        <button 
          onClick={() => setSuccessTab('academy')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
            successTab === 'academy' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🏆 Academy & Certifications
        </button>
        <button 
          onClick={() => setSuccessTab('coach')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
            successTab === 'coach' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🤖 AI success Coach™
        </button>
        <button 
          onClick={() => setSuccessTab('templates')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
            successTab === 'templates' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ⚡ Industry Presets
        </button>
        <button 
          onClick={() => setSuccessTab('security')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
            successTab === 'security' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🛡️ Isolation & Security Hub
        </button>
        <button 
          onClick={() => setSuccessTab('memory')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
            successTab === 'memory' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          💼 Business Memory OS™ <span className="ml-1 text-[8px] bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded font-mono font-bold uppercase">LIVE</span>
        </button>
      </div>

      {/* ONBOARDING & TOURS TAB */}
      {successTab === 'onboarding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Global Searchable help section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4 text-slate-900">
            <h4 className="text-sm font-bold text-slate-800 font-sans">Global Help Knowledge Base</h4>
            
            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="How do I generate a flyer? How to target Nepal..."
                className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 text-xs rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-800"
              />
            </div>

            {searchQuery.trim().length > 0 ? (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">Search Results ({searchResults.length})</span>
                {searchResults.length === 0 ? (
                  <p className="text-slate-500 text-xs p-4 bg-slate-50 rounded-xl border border-dashed text-center">No articles found matching "{searchQuery}". Search for "Nepal", "flyer" or "campaign".</p>
                ) : (
                  searchResults.map(art => (
                    <div key={art.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-slate-900">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 text-center uppercase tracking-wider px-2 py-0.5 rounded">
                          {art.category}
                        </span>
                        {art.workflowTriggerTab && (
                          <button 
                            onClick={() => onChangeTab(art.workflowTriggerTab)}
                            className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                          >
                            Jump to {art.workflowTriggerTab.toUpperCase()} Module
                          </button>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 font-sans">{art.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{art.content}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HELP_ARTICLES.map((art) => (
                  <div key={art.id} className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col justify-between transition cursor-pointer text-slate-900" onClick={() => handleSearch(art.title)}>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono font-bold uppercase text-slate-400">{art.category}</span>
                      <h5 className="text-xs font-bold text-slate-800 font-sans">{art.title}</h5>
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold flex items-center justify-end gap-1 mt-3">
                      <span>View Article</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tours Panel launcher */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
            <h4 className="text-sm font-bold text-slate-800 font-sans">Guided Feature Walks</h4>
            <p className="text-slate-500 text-xs">Launches custom spotlights and highlights to navigate product dashboards.</p>
            
            <div className="space-y-3">
              <div className="p-3 border border-slate-200 rounded-2xl flex items-center justify-between bg-slate-50 text-slate-900">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 font-sans">Command Center walkthrough</h5>
                  <p className="text-[9px] text-slate-400">Total steps: 3 • Dashboard module</p>
                </div>
                <button 
                  onClick={() => handleStartTour('dashboard')}
                  className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 cursor-pointer"
                >
                  Start
                </button>
              </div>

              <div className="p-3 border border-slate-200 rounded-2xl flex items-center justify-between bg-slate-50 text-slate-900">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 font-sans">Knowledge Base Index</h5>
                  <p className="text-[9px] text-slate-400">Total steps: 2 • RAG & products</p>
                </div>
                <button 
                  onClick={() => handleStartTour('knowledge')}
                  className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 cursor-pointer"
                >
                  Start
                </button>
              </div>

              <div className="p-3 border border-slate-200 rounded-2xl flex items-center justify-between bg-slate-50 text-slate-900">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 font-sans">Strategic Intelligence</h5>
                  <p className="text-[9px] text-slate-400">Total steps: 2 • Marketing personas</p>
                </div>
                <button 
                  onClick={() => handleStartTour('strategist')}
                  className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 cursor-pointer"
                >
                  Start
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Invite Teammates</span>
              <div className="mt-2 flex gap-2">
                <input 
                  type="email" 
                  value={teamEmailInput}
                  onChange={(e) => setTeamEmailInput(e.target.value)}
                  placeholder="collaborator@company.com" 
                  className="bg-slate-50 border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none w-full"
                />
                <button 
                  onClick={handleInviteTeam}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 rounded-xl cursor-pointer"
                >
                  Invite
                </button>
              </div>
              {invitedTeammates.length > 0 && (
                <div className="pt-2">
                  <div className="text-[8px] font-mono text-slate-400 uppercase font-bold">Collaborators:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {invitedTeammates.map(email => (
                      <span key={email} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[9px] rounded">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PHASE 9: Onboarding Workflow Live Trace Diagnostics Console */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl lg:col-span-3 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200 tracking-wider">ONBOARDING WORKFLOW ENGINE LOGS</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Real-time telemetry, step save traces, validation logs, and Firestore write status.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-slate-500">AutoSave Status:</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  saveStatus === 'saved' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : saveStatus === 'saving'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {saveStatus.toUpperCase()}
                </span>
                {lastSavedTimestamp && (
                  <span className="text-slate-400 text-[9px]">({lastSavedTimestamp})</span>
                )}
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 max-h-[220px] overflow-y-auto font-mono text-[10.5px] space-y-1.5 border border-slate-800">
              {telemetryLogs.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 hover:bg-slate-900/40 p-1 rounded transition text-slate-300">
                  <span className="text-[9.5px] text-slate-500 shrink-0 font-mono">[{item.timestamp.split('T')[1].substring(0, 8)}]</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider shrink-0 ${
                    item.type === 'validation' 
                      ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' 
                      : item.type === 'save' 
                      ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30' 
                      : item.type === 'db'
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="leading-relaxed font-sans text-xs">{item.message}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
              <span>Tenant Isolation Target: <b className="text-indigo-400 font-mono">{tenantId}</b></span>
              <span>Active Step: <b className="text-amber-400 font-mono">{wizardStep}/9</b> (completionPercentage: {Math.round(((wizardStep - 1) / 9) * 100)}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMY & CERTIFICATIONS TAB */}
      {successTab === 'academy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4 text-slate-900">
            <h4 className="text-sm font-bold text-slate-800 font-sans">MarketForge Academy Portal</h4>
            <p className="text-slate-500 text-xs">Acquire structured branding badges to prove expert-level demand generation capabilities.</p>
            
            {selectedCourse ? (
              <div className="space-y-4 border border-indigo-100 p-5 rounded-2xl bg-indigo-50/20 text-slate-900">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-600 uppercase">
                    Course: {selectedCourse.title}
                  </span>
                  <button 
                    onClick={() => { setSelectedCourse(null); setSelectedQuizAnswer(null); setLessonCompleted(false); }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Back to Curriculum
                  </button>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-bold text-slate-900">
                    Lesson {activeLessonIndex + 1}: {selectedCourse.lessons[activeLessonIndex].title}
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                    {selectedCourse.lessons[activeLessonIndex].content}
                  </p>
                </div>

                {/* Micro Quiz */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-slate-900">
                  <span className="text-[9px] font-bold text-emerald-600 block uppercase font-mono tracking-wider">Lesson Certification Quiz</span>
                  <h6 className="text-xs font-bold text-slate-800">{selectedCourse.lessons[activeLessonIndex].quizQuestion}</h6>
                  
                  <div className="space-y-2">
                    {selectedCourse.lessons[activeLessonIndex].quizOptions.map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-2 p-2 px-3 border border-slate-100 hover:bg-slate-50 rounded-lg text-xs cursor-pointer">
                        <input 
                          type="radio" 
                          name="quiz" 
                          checked={selectedQuizAnswer === idx} 
                          onChange={() => setSelectedQuizAnswer(idx)}
                          className="text-indigo-600" 
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => handleQuizSubmit(selectedCourse.lessons[activeLessonIndex].correctAnswer)}
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-400 font-mono">Quiz outcome determines certification progress</span>
                  
                  <div className="flex gap-2">
                    {activeLessonIndex < selectedCourse.lessons.length - 1 ? (
                      <button 
                        disabled={!lessonCompleted}
                        onClick={() => {
                          setActiveLessonIndex(activeLessonIndex + 1);
                          setSelectedQuizAnswer(null);
                          setLessonCompleted(false);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2"
                      >
                        <span>Next Lesson</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setSelectedCourse(null); setSelectedQuizAnswer(null); setLessonCompleted(false); }}
                        className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Finish Course / Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACADEMY_COURSES.map((course) => (
                  <div key={course.id} className="border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition flex flex-col justify-between space-y-4 bg-slate-50 text-slate-900">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-0.5 rounded">
                        {course.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 pt-2 font-sans">{course.title}</h5>
                      <p className="text-[11px] text-slate-500 leading-normal">{course.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400">Lessons: {course.lessons.length}</span>
                      <button 
                        onClick={() => { setSelectedCourse(course); setActiveLessonIndex(0); }}
                        className="font-bold text-[10px] text-indigo-600 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Acquirable Badge</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges system */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
            <h4 className="text-sm font-bold text-slate-800 font-sans">Your Certifications</h4>
            <p className="text-slate-500 text-xs">Credentials earned from completing lesson quizzes.</p>
            
            <div className="space-y-3">
              <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-center gap-3 text-slate-900">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-base ${
                  earnedBadges.includes('MF_FOUNDATIONS_BADGE') ? 'bg-violet-100 border-violet-300 text-violet-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  🏆
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">MarketForge Fundamentals</h5>
                  <p className="text-[9px] text-slate-400">{earnedBadges.includes('MF_FOUNDATIONS_BADGE') ? 'Verified Credential Earned' : 'Curriculum locked: Start Foundations'}</p>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-center gap-3 text-slate-900">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-base ${
                  earnedBadges.includes('SaaS_DEMAND_BADGE') ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  🔥
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Campaign Planning Specialist</h5>
                  <p className="text-[9px] text-slate-400">{earnedBadges.includes('SaaS_DEMAND_BADGE') ? 'Verified Credential Earned' : 'Locked: complete Demand Synthesis'}</p>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-center gap-3 text-slate-900">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-base ${
                  earnedBadges.includes('BRAND_LOCKDOWN_BADGE') ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  🎨
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">AI Content Specialist</h5>
                  <p className="text-[9px] text-slate-400">{earnedBadges.includes('BRAND_LOCKDOWN_BADGE') ? 'Verified Credential Earned' : 'Locked: complete Visual Identity'}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2 font-mono text-[9px] text-slate-400 text-center">
              *Certification records stored securely within multi-tenant database profiles.
            </div>
          </div>
        </div>
      )}

      {/* AI SUCCESS COACH TAB */}
      {successTab === 'coach' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 max-w-4xl mx-auto text-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 font-sans">MarketForge AI Coach™</h4>
              <p className="text-slate-500 text-xs text-left">Your high-fidelity marketing consultant checking active country profiles and statutory pricing setups.</p>
            </div>
          </div>

          <div className="space-y-4 pb-4 min-h-[300px] max-h-[400px] overflow-y-auto pr-2 space-y-4 font-sans text-xs">
            {coachChat.map((msg, idx) => (
              <div key={idx} className={`flex gap-3.5 p-4 rounded-2xl max-w-3xl ${
                msg.sender === 'coach' 
                  ? 'bg-indigo-50/50 border border-indigo-100 text-slate-800 mr-12' 
                  : 'bg-slate-900 border border-[#18191A] text-white ml-auto max-w-xl'
              }`}>
                {msg.sender === 'coach' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold font-mono">C</div>
                )}
                <div className="space-y-2">
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  {msg.listItems && msg.listItems.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px] text-slate-600">
                      {msg.listItems.map((item, idy) => <li key={idy}>{item}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {isCoachLoading && (
              <div className="flex gap-2 p-3 text-slate-400 bg-slate-50 rounded-xl max-w-xs text-[10px] font-mono items-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Coach is analyzing localization engine variables...</span>
              </div>
            )}
          </div>

          {/* Quick templates for coach */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 py-1 font-bold">Try asking:</span>
            <button onClick={() => setCoachQuery('How should I price my products in Nepal?')} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-[10px] text-slate-600 cursor-pointer">
              How to target Nepal?
            </button>
            <button onClick={() => setCoachQuery('What makes a perfect customer persona?')} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-[10px] text-slate-600 cursor-pointer">
              SaaS Customer Personas
            </button>
            <button onClick={() => setCoachQuery('How do I run my first campaign?')} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-[10px] text-slate-600 cursor-pointer">
              First Campaign Guide
            </button>
          </div>

          <form onSubmit={handleCoachSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={coachQuery}
              onChange={(e) => setCoachQuery(e.target.value)}
              placeholder="Ask about marketing strategy, regional statutory conversion rates, pricing tips, or walkthrough help..."
              className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 text-xs rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition text-slate-800"
            />
            <button 
              type="submit"
              className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* INDUSTRY PRESETS TAB */}
      {successTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800 font-sans">Ready-Made Starter Workspaces</h4>
            <p className="text-slate-500 text-xs text-left">Skip manual setup. Click any industry template to automatically generate robust guidelines, buyer personas, sample products, and localized strategy schedules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {INDUSTRY_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="border border-slate-200 hover:border-slate-300 transition p-5 rounded-3xl text-left bg-slate-50 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900 font-sans">{tpl.name} Preset</h5>
                  <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded uppercase">{tpl.profile.industry}</span>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{tpl.profile.description}</p>
                </div>
                
                <button 
                  onClick={() => handleSelectIndustryTemplate(tpl)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkle className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                  <span>Start From Template</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ISOLATION & SECURITY HUB TAB */}
      {successTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 max-w-4xl mx-auto text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-800 font-sans">Tenant isolation & Security Center</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl text-slate-900">
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Beginner-Friendly Cryptography</span>
              <h5 className="text-xs font-bold text-slate-800 font-sans">Tenant Boundary Isolation</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                MarketForge enforces a strict row-level multitenancy scheme in Firebase Firestore. Data files, image coordinates, and copywriting rules you compile are bound directly with your Tenant ID identifier block. neighbor accounts cannot peek, route, or execute cross-border API endpoints against your workspace credentials.
              </p>
              <div className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 inline-block px-2.5 py-0.5 rounded">
                ✓ OWASP A1: Broken Access Control Defended
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl text-slate-900">
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Compliance Guard</span>
              <h5 className="text-xs font-bold text-slate-800 font-sans">Statutory Country Protections</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                When targeting global areas (such as Nepal, India, or Europe), MarketForge automatically formats currency displays and isolates statutory tax structures. Regional and regulatory compliance boundaries guarantee proper calculation layouts to avoid pricing tax audits.
              </p>
              <div className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 inline-block px-2.5 py-0.5 rounded">
                ✓ GDPR & ISO 27001 Prepared Architecture
              </div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-900">
            <div className="space-y-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 font-mono tracking-widest uppercase block">Identity Shielding</span>
              <h6 className="text-xs font-bold text-slate-800">Advanced Multi-Factor Auth (MFA)</h6>
              <p className="text-[11px] text-slate-500">Enable absolute device constraints for the current active account.</p>
            </div>
            <button 
              onClick={() => alert('Multi-Factor Authentication (MFA) has been configured for the root tenant email digitalscamalert@gmail.com')}
              className="px-4 py-2 bg-[#18191A] hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Configure Active MFA
            </button>
          </div>
        </div>
      )}

      {/* BUSINESS MEMORY & GROWTH INTELLIGENCE OS TAB */}
      {successTab === 'memory' && (
        <BusinessMemoryView
          profile={profile}
          onChangeProfile={onChangeProfile}
          personas={personas}
          setPersonas={setPersonas}
          campaign={campaign}
          setCampaign={setCampaign}
          tenantId={tenantId}
          onCreateAuditLog={onCreateAuditLog}
        />
      )}

      {/* 2. GUIDED SETUP WIZARD MULTI-STEP MODAL */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-900">
            
            {/* Header */}
            <div className="bg-[#18191A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold font-sans">MarketForge AI Guided Setup Wizard</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Let's craft your localized marketing powerhouse step-by-step.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-1 overflow-x-auto text-slate-900">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNo) => (
                <div key={stepNo} className="flex items-center gap-1 shrink-0">
                  <div className={`w-6 h-6 rounded-full text-center text-[10px] font-bold flex items-center justify-center ${
                    wizardStep === stepNo 
                      ? 'bg-indigo-600 text-white' 
                      : wizardStep > stepNo 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {wizardStep > stepNo ? '✓' : stepNo}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                    {stepNo === 1 ? 'Company' : 
                     stepNo === 2 ? 'Brand' : 
                     stepNo === 3 ? 'Products' : 
                     stepNo === 4 ? 'Country' : 
                     stepNo === 5 ? 'Goals' : 
                     stepNo === 6 ? 'Persona' : 
                     stepNo === 7 ? 'Campaign' : 
                     stepNo === 8 ? 'Package' : 'PDF Export'}
                  </span>
                  {stepNo < 9 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                </div>
              ))}
            </div>

             {/* Step Content Stage */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              
              {/* Step-by-Step Validation Callout */}
              {validationError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start gap-2 text-xs">
                  <div className="bg-rose-100 p-1 rounded-lg text-rose-600 font-bold font-mono text-[10px] w-5 h-5 flex items-center justify-center shrink-0">
                    ⚠
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-rose-900 block font-sans">Validation Exception</span>
                    <span className="text-[11px] text-rose-700 leading-normal">{validationError}</span>
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 1: Company Information</h4>
                    <p className="text-slate-500 text-xs">Instantiate active firm credentials inside the workspace.</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Company Name</label>
                    <input 
                      type="text" 
                      value={wizardCompany.name}
                      onChange={(e) => setWizardCompany({ ...wizardCompany, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Industry Sector</label>
                    <input 
                      type="text" 
                      value={wizardCompany.industry}
                      onChange={(e) => setWizardCompany({ ...wizardCompany, industry: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">SaaS Mandate / Description</label>
                    <textarea 
                      rows={3}
                      value={wizardCompany.description}
                      onChange={(e) => setWizardCompany({ ...wizardCompany, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 2: Brand Identity Specifications</h4>
                    <p className="text-slate-500 text-xs">Define key tags and responsive hex colors to lock down style elements.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Unified Brand Tagline</label>
                    <input 
                      type="text" 
                      value={wizardBrand.tagline}
                      onChange={(e) => setWizardBrand({ ...wizardBrand, tagline: e.target.value })}
                      placeholder="e.g. Workflows that breathe."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Primary Color Accent</label>
                      <input 
                        type="color" 
                        value={wizardBrand.primary}
                        onChange={(e) => setWizardBrand({ ...wizardBrand, primary: e.target.value })}
                        className="w-full bg-white h-10 border border-slate-200 rounded-xl px-1 cursor-pointer focus:outline-none text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Secondary Color Accent</label>
                      <input 
                        type="color" 
                        value={wizardBrand.secondary}
                        onChange={(e) => setWizardBrand({ ...wizardBrand, secondary: e.target.value })}
                        className="w-full bg-white h-10 border border-slate-200 rounded-xl px-1 cursor-pointer focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 3: Products & Services Catalog</h4>
                    <p className="text-slate-500 text-xs">Add core offerings to drive campaign copy briefs.</p>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={wizardProduct}
                      onChange={(e) => setWizardProduct(e.target.value)}
                      placeholder="e.g. Enterprise Cloud storage"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleAddWizardProduct}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Add Offering
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider mb-2">Offerings added ({wizardProductsList.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {wizardProductsList.map((prod, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 4: Target Country Segment</h4>
                    <p className="text-slate-500 text-xs font-bold">Locks regional parameters and currency indexes dynamically.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widerblock">Select target country</label>
                    <select 
                      value={wizardCountry}
                      onChange={(e) => setWizardCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="NP">Nepal (NPR – 13% Statutory VAT default)</option>
                      <option value="IN">India (INR – IGST compliance)</option>
                      <option value="US">USA (USD – Standard merchant gates)</option>
                      <option value="UK">United Kingdom (GBP)</option>
                      <option value="AU">Australia (AUD)</option>
                      <option value="DE">Germany (EUR)</option>
                      <option value="AE">UAE (AED)</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 5: Marketing Goals Allocation</h4>
                    <p className="text-slate-500 text-xs">Define operational goal triggers.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['Generate High-Trust Reservation Pre-bookings', 'Establish Localized High-Value Leads', 'Boost Brand Authority on LinkedIn', 'Double Digital Conversions Catalog'].map((gl) => (
                      <label key={gl} className="p-3 border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center gap-2 text-xs text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={wizardGoals.includes(gl)} 
                          onChange={(e) => {
                            if (e.target.checked) setWizardGoals([...wizardGoals, gl]);
                            else setWizardGoals(wizardGoals.filter(item => item !== gl));
                          }}
                          className="text-indigo-600 rounded" 
                        />
                        <span>{gl}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 6: Customer Persona Blueprint</h4>
                    <p className="text-slate-500 text-xs">Isolate typical buying persona segments.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Persona Label Name</label>
                    <input 
                      type="text" 
                      value={wizardPersonaName}
                      onChange={(e) => setWizardPersonaName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 7 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 7: Campaign Objectives and Timelines</h4>
                    <p className="text-slate-500 text-xs">Lock active campaign calendar names.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Campaign Name</label>
                    <input 
                      type="text" 
                      value={wizardCampaignName}
                      onChange={(e) => setWizardCampaignName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 8 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 8: Content Package Synthesis</h4>
                    <p className="text-slate-500 text-xs">The platform executes multi-tenant draft packaging.</p>
                  </div>

                  <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-800">
                    <Info className="w-5 h-5 shrink-0" />
                    <p className="text-xs leading-normal">
                      MarketForge is preparing pre-designed layouts. On clicking Next, standard branding guidelines are synced with our local database.
                    </p>
                  </div>
                </div>
              )}

              {wizardStep === 9 && (
                <div className="space-y-4 text-left">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-800">Step 9: PDF Brief Export Simulation</h4>
                    <p className="text-slate-500 text-xs">Review layout print alignments.</p>
                  </div>

                  <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 p-5 rounded-2xl flex items-center justify-between text-emerald-800">
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold font-sans">Print Alignment Checklist</h5>
                      <p className="text-[10px] text-emerald-700 leading-normal">OWASP multitenant security credentials validated. Visual borders centered perfectly.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        window.print();
                        setCompletedSteps(prev => ({ ...prev, pdf: true }));
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Print/Save Alignment Proof PDF
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer buttons with advanced sync diagnostics */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-col gap-3 text-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  {saveStatus === 'saved' ? (
                    <span className="text-emerald-600 flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Autosaved securely {lastSavedTimestamp && `at ${lastSavedTimestamp}`}</span>
                    </span>
                  ) : saveStatus === 'saving' ? (
                    <span className="text-amber-600 flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      <span>Synchronizing draft metrics {isPending && '(Pending changes cached)...'}</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce"></span>
                      <span>Sync Fault: retrying {activeBackoffDelay > 0 && `in ${Math.ceil(activeBackoffDelay)}s`} (Attempt {retryCount}/3)...</span>
                    </span>
                  )}
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400">Step {wizardStep}/9</span>
                  
                  <button 
                    type="button"
                    onClick={() => setShowSyncDiagnostics(!showSyncDiagnostics)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer hover:bg-indigo-50 px-1.5 py-0.5 rounded transition"
                  >
                    {showSyncDiagnostics ? 'Hide Sync Diagnostics' : 'Show Sync Diagnostics'}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  {wizardStep > 1 && (
                    <button 
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button 
                    onClick={handleWizardNext}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    <span>{wizardStep === 9 ? 'Finish & Save Workspace' : 'Save & Next'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Advanced Diagnostics Panel */}
              {showSyncDiagnostics && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 mt-1 text-xs text-slate-600 space-y-3 shadow-inner animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Sync Channel Status</span>
                      <strong className={`font-semibold ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isOnline ? '🟢 Connected to Cloud' : '🔴 Offline Cache Active'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Retry Metric</span>
                      <strong className="font-semibold text-slate-800">{retryCount} / 3 Attempts</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Collisions Preempted</span>
                      <strong className={`font-semibold ${conflictCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-800'}`}>
                        {conflictCount} Conflict{conflictCount !== 1 && 's'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Last Synchronized</span>
                      <strong className="font-semibold text-slate-800">{lastSavedTimestamp || 'Pending first write'}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
                      <span>Real-time Sync Event Ledger (Diagnostic Audit)</span>
                      <span>Queue Status: {isPending ? '⚠️ 1 Pending' : '✅ Synced'}</span>
                    </div>
                    <div className="max-h-24 overflow-y-auto bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1 font-mono text-[10px]">
                      {syncHistory.length === 0 ? (
                        <div className="text-slate-400 text-center py-2">No synchronization logs emitted yet. Begin editing profile.</div>
                      ) : (
                        syncHistory.map((log, idx) => (
                          <div key={idx} className="flex justify-between items-start gap-2 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                            <span className="text-slate-400 shrink-0">{log.timestamp}</span>
                            <span className="text-indigo-600 shrink-0 font-semibold">[{log.action.toUpperCase()}]</span>
                            <span className="grow text-slate-700 truncate">{log.details}</span>
                            <span className={`shrink-0 font-bold ${
                              log.result === 'success' ? 'text-emerald-600' : log.result === 'failure' ? 'text-rose-600' : 'text-amber-600'
                            }`}>
                              {log.result.toUpperCase()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// 5. Context-Aware Floating Help Button System
interface ContextHelpProps {
  currentTab: string;
}

export function ContextHelpButton({ currentTab }: ContextHelpProps) {
  const [open, setOpen] = useState(false);

  const getHelpContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Daily Command Center',
          what: 'Consolidated overview of campaign performance, local brand settings, and active administrative telemetry.',
          why: 'Aggregates indicators across isolated databases instantly to allow workspace health assessment.',
          best: 'Fulfill recommended setup actions before generating content batches to increase conversion coefficients.',
          mistake: 'Failing to define localized country profiles leading to currency display mismatches.'
        };
      case 'strategist':
        return {
          title: 'Marketing Strategist Agent',
          what: 'Strategic synthesis generating rich Customer Personas and positioning pitch tags utilizing active brand metadata.',
          why: 'Saves hours of market research by modeling logical customer pain points based on the corporate sector.',
          best: 'Isolate distinct corporate target groups (e.g. tech managers vs wellness seekers) when adjusting campaigns.',
          mistake: 'Using extremely vague audience sentences instead of concrete daily reporting or tactile pain metrics.'
        };
      case 'planner':
        return {
          title: 'Chronological Campaign Planner',
          what: 'Chronological roadmap modeling launch objectives, channels (like LinkedIn PR or Instagram feeds), and KPI sets.',
          why: 'Ensures marketing calendars follow structured timetables with target indicators.',
          best: 'Keep launch calendars focused on high-trust peer recommendations and localized digital channels.',
          mistake: 'Saturating calendars with non-specific, generic corporate templates.'
        };
      case 'writer':
        return {
          title: 'Content Writer Brief Composer',
          what: 'Compose targeted ad copywriting briefs, sales threads, and social announcements.',
          why: 'Generates cohesive copies adjusted directly to the brand guideline voice specifications.',
          best: 'Define restrictive word blocks inside guidelines to prevent brand voice dilution.',
          mistake: 'Publishing draft materials lacking customer persona buying triggers.'
        };
      case 'creative':
        return {
          title: 'Creative Director guidelines',
          what: 'Design guidelines defining key responsive accent coloring and headlining typography rules.',
          why: 'Ensures visual consistency across independent remote agency workspaces.',
          best: 'Integrate restrictive "Do" and "Dont" instructions like "never use bright playful gradients representation".',
          mistake: 'Failing to define primary typography assignments.'
        };
      case 'package':
        return {
          title: 'Marketing Package Generator',
          what: 'Creates integrated brand collateral packages containing visual flyers and ad briefs.',
          why: 'Ensures professional, clean modern designs adhering to stripe and modern SaaS layout guidelines.',
          best: 'Input precise product Skus to guarantee billing conversions sync properly.',
          mistake: 'Failing to establish high-contrast color choices.'
        };
      case 'knowledge':
        return {
          title: 'RAG Knowledge Center',
          what: 'Central repository parsing catalog brochures or corporate website URLs into approved products list.',
          why: 'Prevents empty states across strategy segments by seeding live memory definitions.',
          best: 'Edit and audit extracted products to lock accurate price values.',
          mistake: 'Uploading long non-targeted general files causing RAG noise.'
        };
      default:
        return {
          title: 'MarketForge Enterprise OS',
          what: 'An intelligent marketing management platform containing full tenant-aware guidelines.',
          why: 'Boosts team demand efficiency while securing data privacy isolation.',
          best: 'Master the Academy courses to earn accredited specialist credentials.',
          mistake: 'Sharing active credentials with non-verified remote operators.'
        };
    }
  };

  const info = getHelpContent();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      <button 
        onClick={() => setOpen(!open)}
        className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl cursor-pointer transition transform hover:scale-105 active:scale-95"
        title="Help & Best Practices Center"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {open && (
        <div className="absolute bottom-16 right-0 bg-white border border-slate-200 rounded-3xl w-80 md:w-96 text-left p-6 shadow-2xl space-y-4 animate-scale-up">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Context Help Center</span>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            <h4 className="text-sm font-extrabold text-slate-800">{info.title}</h4>
            
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">What This Module Does</span>
              <p className="text-xs text-slate-600 leading-normal">{info.what}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Why It Matters</span>
              <p className="text-xs text-slate-600 leading-normal">{info.why}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Best Practices</span>
              <p className="text-xs text-emerald-800 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 leading-normal font-medium">{info.best}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-rose-500 uppercase tracking-widest block">Common Mistakes</span>
              <p className="text-xs text-rose-800 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 leading-normal font-medium">{info.mistake}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Visual Interface Concept</span>
              <div className="h-20 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-mono">
                [ Screenshot Placeholder: {info.title} ]
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100">
            Powered by MarketForge Success Center™ Coach
          </div>
        </div>
      )}
    </div>
  );
}
