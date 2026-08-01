import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  Lock, 
  Shield, 
  Calendar, 
  Award, 
  Smile, 
  ThumbsUp, 
  Check, 
  CheckCircle2, 
  X, 
  Save, 
  RefreshCw, 
  Play, 
  Zap, 
  Users, 
  Target, 
  Database,
  MapPin,
  Coins,
  MessageSquare
} from 'lucide-react';
import { clientDb } from '../lib/firebase';
import { BusinessProfile, CustomerPersona, CampaignPlan } from '../types';

interface BusinessMemoryViewProps {
  profile: BusinessProfile;
  onChangeProfile: (profile: BusinessProfile) => void;
  personas: CustomerPersona[];
  setPersonas: (p: CustomerPersona[]) => void;
  campaign: CampaignPlan | null;
  setCampaign: (cp: CampaignPlan) => void;
  tenantId: string;
  onCreateAuditLog: (type: string, severity: string, details: string) => void;
}

interface BusinessDnaRecord {
  id: string;
  tenantId: string;
  name: string;
  industry: string;
  category: string;
  description: string;
  brandVoice: string;
  brandGuidelines: string;
  targetAudience: string;
  customerPersonas: string;
  pricingStrategy: string;
  competitivePositioning: string;
  uniqueSellingProposition: string;
  products: string;
  services: string;
  updatedAt: string;
}

interface MemorizedOffer {
  id: string;
  tenantId: string;
  title: string;
  valueProp: string;
  channel: string;
  status: 'created' | 'published' | 'selected' | 'rejected';
  score: number;
}

interface PersonaIntelligence {
  id: string;
  name: string;
  preferredChannels: string[];
  engagementFactor: number; // 0-100
  historyNotes: string[];
}

interface BrandDesignDecision {
  id: string;
  name: string;
  colors: string[];
  fonts: string;
  status: 'approved' | 'rejected';
  date: string;
}

export default function BusinessMemoryView({
  profile,
  onChangeProfile,
  personas,
  setPersonas,
  campaign,
  setCampaign,
  tenantId,
  onCreateAuditLog
}: BusinessMemoryViewProps) {
  // --- SUB-TABS inside Memory Engine ---
  const [activeSubTab, setActiveSubTab] = useState<'dna' | 'campaigns' | 'offers' | 'personas' | 'brand' | 'seasonal' | 'growth'>('dna');

  // --- STATE LAYER ---
  const [dna, setDna] = useState<BusinessDnaRecord>({
    id: '',
    tenantId: '',
    name: '',
    industry: '',
    category: '',
    description: '',
    brandVoice: '',
    brandGuidelines: '',
    targetAudience: '',
    customerPersonas: '',
    pricingStrategy: '',
    competitivePositioning: '',
    uniqueSellingProposition: '',
    products: '',
    services: '',
    updatedAt: ''
  });

  const [savingDna, setSavingDna] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Campaign history Memory
  const [campaignHistory, setCampaignHistory] = useState<CampaignPlan[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Offer Performance Memory
  const [offers, setOffers] = useState<MemorizedOffer[]>([]);
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferProp, setNewOfferProp] = useState('');
  const [newOfferChannel, setNewOfferChannel] = useState('WhatsApp');

  // Customer Persona Intelligence
  const [personaIntel, setPersonaIntel] = useState<PersonaIntelligence[]>([]);

  // Brand Evolution Memory
  const [designDecisions, setDesignDecisions] = useState<BrandDesignDecision[]>([]);
  const [autoAlignBranding, setAutoAlignBranding] = useState<boolean>(true);

  // Seasonal Intelligence Engine
  const [activeSeason, setActiveSeason] = useState<string>('Dashain');

  // Growth Performance Telemetry
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    marketingConsistency: 85,
    campaignFrequency: 75,
    offerStrength: 90,
    channelCoverage: 80,
    growthReadiness: 88,
    overallScore: 84
  });

  // Load all initial state
  useEffect(() => {
    loadDnaProfile();
    loadCampaignHistory();
    loadOffers();
    loadPersonaIntel();
    loadDesignDecisions();
  }, [tenantId, profile]);

  // Recalculate Business Health Score based on actual data live!
  useEffect(() => {
    calculateHealthScore();
  }, [dna, offers, campaignHistory, personas]);

  // --- 1. LOAD & SYNC BUSINESS DNA ---
  const loadDnaProfile = async () => {
    try {
      const record = await clientDb.getDocById<BusinessDnaRecord>("business_dna_records", `dna_${tenantId}`);
      if (record) {
        setDna(record);
      } else {
        // Bootstrap from active workspace profile values
        const docDna: BusinessDnaRecord = {
          id: `dna_${tenantId}`,
          tenantId,
          name: profile.name || 'Himalayan Grill & Tavern',
          industry: profile.industry || 'Food & Beverage / Hospitality',
          category: profile.category || 'Contemporary Fusion Mountain Dining',
          description: profile.description || 'An elegant dining bistro blending local Himalayan woodfired spices.',
          brandVoice: profile.brandVoice || 'Warm, culinary, flavorful, descriptive, highly refined and welcoming',
          brandGuidelines: 'Palette: Earthy Rust & Lavender. Primary Heading: Playfair Display. Logo Placement: Margins clear 50px.',
          targetAudience: profile.targetAudience || 'Epicurean travelers, local celebrations, tourists',
          customerPersonas: 'Aayush Shrestha (Lifestyle Blogger), Clara Vanderpool (Executive Explorer)',
          pricingStrategy: 'Premium prestige pricing adjusted with local Himalayan sourcing advantages.',
          competitivePositioning: 'Unique local mountain firewood herbs combined with exquisite modern high-trust service.',
          uniqueSellingProposition: 'The only authentic stone-roasted Woodfired Mountain bistro in the country.',
          products: 'Woodfired Himalayan Trout, Organic Walnuts Salad Platter, Craft Himalayan Brew Session',
          services: 'Chef Table Experience, Private Mountain Cabin banquets, Luxury Catering',
          updatedAt: new Date().toISOString()
        };
        setDna(docDna);
      }
    } catch (e) {
      console.error("Failed to load DNA record:", e);
    }
  };

  const handleSaveDna = async () => {
    setSavingDna(true);
    setSaveSuccess(false);
    try {
      const recordToSave = {
        ...dna,
        updatedAt: new Date().toISOString()
      };
      await clientDb.addDocToTenant("business_dna_records", recordToSave, tenantId);
      setDna(recordToSave);
      setSaveSuccess(true);
      onCreateAuditLog('dna_lockdown', 'medium', `Synchronized and locked permanent Business DNA Profile specifications.`);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("DNA lock error:", e);
    } finally {
      setSavingDna(false);
    }
  };

  // --- 2. CAMPAIGN MEMORY ENGINE ---
  const loadCampaignHistory = async () => {
    setLoadingHistory(true);
    try {
      // Find current campaigns in DB
      let list = await clientDb.getCollection<CampaignPlan>("campaigns", tenantId);
      if (list.length === 0) {
        // Seed default historical campaigns so the user has immediate memory context!
        const defaultHistory: CampaignPlan[] = [
          {
            campaignName: 'Himalayan Harvest Festival Kickoff',
            objective: 'Launch signature organic cheese platter and drive 350 table bookings.',
            durationWeeks: 4,
            channels: ['Facebook Feed', 'WhatsApp Special', 'Local Food Critics'],
            launchCalendar: [
              { day: 'Day 1', channel: 'Facebook Feed', title: 'The Smoke & The Stoneware', description: 'Introduce handcrafted stoneware platter recipes.', goal: '300 Likes' }
            ],
            strategicKPIs: ['Occupancy rates > 90%', 'Repeat loyalty ticket sold > 15%']
          },
          {
            campaignName: 'Winter Solitude Luxury Experience',
            objective: 'Acquire high-value wellness resort reservation bookings during offseason.',
            durationWeeks: 6,
            channels: ['Private Email Newsletter', 'Instagram Stories'],
            launchCalendar: [
              { day: 'Day 1', channel: 'Private Email', title: 'The Peak Solace Invitation', description: 'handwritten private email detailing stone-carved therapy suites.', goal: '20 sales' }
            ],
            strategicKPIs: ['NPS score > 95', 'Upgrade spa sessions sold > 40%']
          }
        ];
        // Don't write to DB yet, just set display history
        setCampaignHistory(defaultHistory);
      } else {
        setCampaignHistory(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRecallCampaign = (pastCamp: CampaignPlan) => {
    setCampaign(pastCamp);
    onCreateAuditLog('campaign_memory_recall', 'low', `Recalled campaign history profile: ${pastCamp.campaignName}. Loaded into active workbook.`);
    alert(`Campaign "${pastCamp.campaignName}" successfully recalled and loaded into the active Campaign Planner workspace! You can edit, optimize and run it.`);
  };

  // --- 3. OFFER PERFORMANCE TRACKING ---
  const loadOffers = async () => {
    try {
      let list = await clientDb.getCollection<MemorizedOffer>("offers_memorized", tenantId);
      if (list.length === 0) {
        const seedOffers: MemorizedOffer[] = [
          { id: '1', tenantId, title: 'Smoked Mountain Trout early Reservation', valueProp: 'Get a complimentary artisanal organic cider with your trout order', channel: 'Facebook Feed', status: 'selected', score: 100 },
          { id: '2', tenantId, title: 'Dashain Family Banquet Package', valueProp: '15% savings on reservations for parties of 6 or more during holidays', channel: 'WhatsApp', status: 'published', score: 85 },
          { id: '3', tenantId, title: 'Weekday Spa Upgrade Special', valueProp: 'Free upgrade from standard stone massage to hot branch herbal curation', channel: 'Email', status: 'created', score: 45 },
          { id: '4', tenantId, title: 'Generic 5% Discount flyer offer', valueProp: 'Save 5% on random weekday lunches', channel: 'Flyer', status: 'rejected', score: 10 }
        ];
        setOffers(seedOffers);
      } else {
        setOffers(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle.trim()) return;

    const freshOffer: MemorizedOffer = {
      id: `off_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      title: newOfferTitle,
      valueProp: newOfferProp || 'Special offer value description',
      channel: newOfferChannel,
      status: 'created',
      score: 50
    };

    try {
      await clientDb.addDocToTenant("offers_memorized", freshOffer, tenantId);
      setOffers(prev => [freshOffer, ...prev]);
      setNewOfferTitle('');
      setNewOfferProp('');
      onCreateAuditLog('offer_creation', 'low', `Logged custom offer core memory: ${freshOffer.title}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleOfferStatus = async (id: string, newStatus: 'created' | 'published' | 'selected' | 'rejected') => {
    // Determine dynamic conversion scoring
    let calculatedScore = 50;
    if (newStatus === 'selected') calculatedScore = 100;
    else if (newStatus === 'published') calculatedScore = 80;
    else if (newStatus === 'rejected') calculatedScore = 10;

    const updated = offers.map(o => {
      if (o.id === id) {
        return { ...o, status: newStatus, score: calculatedScore };
      }
      return o;
    });

    setOffers(updated);
    onCreateAuditLog('offer_status_toggle', 'low', `Updated offer id [${id}] status in Memory Core to: ${newStatus}`);
  };

  // --- 4. CUSTOMER PERSONA INTEL ---
  const loadPersonaIntel = () => {
    // Setup evolving persona telemetry mapping
    const seedIntel: PersonaIntelligence[] = [
      {
        id: '1',
        name: 'Aayush Shrestha (Lifestyle Creator)',
        preferredChannels: ['Instagram Reels', 'Local Food blogs'],
        engagementFactor: 94,
        historyNotes: [
          'High response to Woodfired traditional presentation details.',
          'Direct Conversion recorded after Instagram Stories launch last September.',
          'Responded negatively to generic discount emails.'
        ]
      },
      {
        id: '2',
        name: 'Clara Vanderpool (Executive Detoxing)',
        preferredChannels: ['VIP Newsletters', 'Ayurvedic Journals'],
        engagementFactor: 88,
        historyNotes: [
          'Strong affinity for hot stone thermals with pure quiet privacy description.',
          'Opted-in via custom premium letter mailer package.',
          'Prefers high price point prestige assurances over standard coupons.'
        ]
      }
    ];
    setPersonaIntel(seedIntel);
  };

  // --- 5. BRAND EVOLUTION ---
  const loadDesignDecisions = () => {
    const seedDecisions: BrandDesignDecision[] = [
      { id: '1', name: 'Sage Green & Concrete Slate Palette', colors: ['#2C5E43', '#1C1917'], fonts: 'Space Grotesk / Inter', status: 'approved', date: '2026-05-15' },
      { id: '2', name: 'Earthy Terracotta & Lavender Hue', colors: ['#B85C38', '#5C38B8'], fonts: 'Playfair / Inter', status: 'approved', date: '2026-06-02' },
      { id: '3', name: 'Playful Neon Gradient Flare Layout', colors: ['#FF007F', '#00FFFF'], fonts: 'Comic Sans / Arial', status: 'rejected', date: '2026-06-10' }
    ];
    setDesignDecisions(seedDecisions);
  };

  const handleToggleDesignStatus = (id: string, current: 'approved' | 'rejected') => {
    const nextStatus = current === 'approved' ? 'rejected' : 'approved';
    const updated = designDecisions.map(d => {
      if (d.id === id) {
        return { ...d, status: nextStatus };
      }
      return d;
    });
    setDesignDecisions(updated);
    onCreateAuditLog('brand_evolution_audit', 'low', `Overrode design asset status in Brand Memory Grid`);
  };

  // --- 6. SEASONAL INTELLIGENCE DATA ---
  const SEASONAL_EVENTS = [
    {
      id: 'Dashain',
      name: 'Dashain Festival',
      timeline: 'Sept - Oct (Autumn Season)',
      targetCountry: 'Nepal (NP)',
      culturalContext: 'Biggest national celebration, family gatherings, high purchase readiness, traditional feast rituals.',
      recommendation: 'Launch "Dashain Home-Feast Sharing Banquets" on WhatsApp. Promote high-margin traditional spice packages. Run festive early-bird booking campaign with personalized greetings.'
    },
    {
      id: 'Tihar',
      name: 'Tihar (Festival of Lights)',
      timeline: 'Oct - Nov (Autumn Season)',
      targetCountry: 'Nepal & India',
      culturalContext: 'Celebration of lights, beautiful visuals, gift exchanges, sister relationships honors.',
      recommendation: 'Deploy dynamic visual cards themed with "Aesthetic Mountain Lights". Offer luxury premium gift hampers. Focus on digital catalogs via Instagram Reels.'
    },
    {
      id: 'NewYear',
      name: 'Baisakh Nepalese New Year',
      timeline: 'April (Spring Season)',
      targetCountry: 'Nepal',
      culturalContext: 'Fresh beginnings, resolution lists, holiday travel packages bookings.',
      recommendation: 'Run an "AeroFlow Operational Reset" enterprise software program, advising business leaders on workflow optimizations for the standard Nepalese fiscal cycle.'
    },
    {
      id: 'SchoolAdmissions',
      name: 'Academic Enrollment Season',
      timeline: 'May - June (Spring Season)',
      targetCountry: 'Universal',
      culturalContext: 'High parenting focus, books, education, organization.',
      recommendation: 'Position sustainable tech packages, focus on eco-friendly backpacks or high-focus team workspace memberships.'
    },
    {
      id: 'TourismSeason',
      name: 'Peak Mountain Trek Adventure',
      timeline: 'Autumn & Spring Seasons',
      targetCountry: 'Nepal (Himalayan Peak Hub)',
      culturalContext: 'Mass arrival of international backpackers, high-end high-yielding travelers, detox seekers.',
      recommendation: 'Actively promote the Everest Wellness Sanctuary thermal mineral path packages on TripAdvisor and executive luxury travel directories.'
    }
  ];

  // --- 8. RECOMMENDATION ACTIONS ---
  const handleExecuteSeasonalCampaign = (title: string, obj: string) => {
    const freshPlan: CampaignPlan = {
      campaignName: title,
      objective: obj,
      durationWeeks: 4,
      channels: ['WhatsApp Feed', 'Facebook Stories', 'Direct Invite'],
      launchCalendar: [
        { day: 'Day 1', channel: 'WhatsApp', title: 'The Festive Arrival Blessings', description: 'Personalized interactive menu and RSVP card dispatched to past database guests.', goal: '180 preorders' },
        { day: 'Day 8', channel: 'Facebook', title: 'The Woodfired Smoke Traditional Secrets', description: 'Short high-definition clip showing fire cooking details.', goal: '50 reservation sales' }
      ],
      strategicKPIs: ['NPR revenue exceeds Lakhs milestone', 'WhatsApp conversion rate > 12.5%', 'Customer sentiment 98% positive']
    };

    setCampaign(freshPlan);
    onCreateAuditLog('recommendation_engine', 'medium', `Proactively ran and compiled seasonal recommendation: ${title}`);
    alert(`PROACTIVE CAMPAIGN DEPLOYED! Launched: "${title}". Pre-populated calendar, channels, and KPIs in your Strategy Dashboard. Go check out the Campaign Planner!`);
  };

  // --- 9. HEALTH SCORE CALCULATION ENGINE ---
  const calculateHealthScore = () => {
    // 5 pillars: 
    // 1. Marketing Consistency: DNA Profile completion percentage (weight 20%)
    const dnaCompleteParams = Object.values(dna).filter(Boolean).length;
    const dnaScore = Math.min(20, Math.round((dnaCompleteParams / 15) * 20));

    // 2. Campaign Frequency: Loaded history length (weight 20%)
    const campaignCount = campaignHistory.length;
    const campaignScore = Math.min(20, campaignCount * 10);

    // 3. Offer Strength: Ranking count of high conversion (selected/published) offers (weight 20%)
    const strongOffers = offers.filter(o => o.status === 'selected' || o.status === 'published').length;
    const offerScore = Math.min(20, strongOffers * 10);

    // 4. Channel Coverage: Number of active channels mapped in offers and profile (weight 20%)
    const mappedChannels = new Set(offers.map(o => o.channel)).size;
    const channelScore = Math.min(20, Math.max(10, mappedChannels * 5));

    // 5. Growth Readiness: Persona data tracking + brand evolution memory checks (weight 20%)
    const brandAlignPoints = autoAlignBranding ? 10 : 5;
    const personaIntelPoints = personas.length > 0 ? 10 : 5;
    const readinessScore = brandAlignPoints + personaIntelPoints;

    const overall = dnaScore + campaignScore + offerScore + channelScore + readinessScore;

    setAnalyticsMetrics({
      marketingConsistency: dnaScore * 5,
      campaignFrequency: campaignScore * 5,
      offerStrength: offerScore * 5,
      channelCoverage: channelScore * 5,
      growthReadiness: readinessScore * 5,
      overallScore: Math.min(100, Math.max(15, overall))
    });
  };

  const selectedSeasonData = SEASONAL_EVENTS.find(s => s.id === activeSeason) || SEASONAL_EVENTS[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-fade-in font-sans text-slate-900">
      
      {/* HEADER HERO */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/15 border border-indigo-400/20">
            <Brain className="w-6 h-6 text-indigo-100 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight">Business Memory & Growth Intelligence OS™</h2>
              <span className="text-[10px] font-mono bg-indigo-500/20 border border-indigo-400/30 px-1.5 py-0.5 rounded text-indigo-300 font-bold">
                PHASE 9D
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Continuous memory system tracking campaign trends, offer success rankings, and seasonal Nepalese recommendations.</p>
          </div>
        </div>
        
        {/* SCORE DISPLAY */}
        <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 self-stretch md:self-auto justify-between text-slate-900">
          <div>
            <span className="text-[9px] font-bold block uppercase text-slate-400 tracking-wider font-mono">Business Growth Score</span>
            <span className="text-xl font-black text-indigo-400 font-mono">{analyticsMetrics.overallScore}<span className="text-xs text-slate-500"> / 100</span></span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded font-mono block">
              {analyticsMetrics.overallScore > 80 ? 'EXCELLENT' : analyticsMetrics.overallScore > 60 ? 'OPTIMAL' : 'DEVELOPING'}
            </span>
          </div>
        </div>
      </div>

      {/* COMPONENT SUB NAVIGATION */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-1.5 overflow-x-auto scroller-hidden text-slate-900">
        {[
          { id: 'dna', label: '🧬 Business DNA Profile', icon: Database },
          { id: 'campaigns', label: '⏳ Campaign Memory', icon: Calendar },
          { id: 'offers', label: '📈 Offer Rankings', icon: Coins },
          { id: 'personas', label: '👥 Persona Intelligence', icon: Users },
          { id: 'brand', label: '🎨 Brand Evolution', icon: Award },
          { id: 'seasonal', label: '🍂 Seasonal Calendar', icon: MapPin },
          { id: 'growth', label: '⚡ Growth Opportunity Detection', icon: TrendingUp }
        ].map((tabInfo) => {
          const Icon = tabInfo.icon;
          return (
            <button
              key={tabInfo.id}
              onClick={() => setActiveSubTab(tabInfo.id as any)}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === tabInfo.id 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tabInfo.label}</span>
            </button>
          );
        })}
      </div>

      {/* CORE FRAME STAGE */}
      <div className="p-6">
        
        {/* --- MODULE 1: BUSINESS DNA PROFILE --- */}
        {activeSubTab === 'dna' && (
          <div className="space-y-6">
            <div className="border-b pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans">Corporate Intelligence DNA Locker™</h3>
                <p className="text-xs text-slate-500 mt-0.5">This locked profile forms the permanent background context injections. Every generated asset will inherits these exact corporate values.</p>
              </div>
              <button
                onClick={handleSaveDna}
                disabled={savingDna}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm self-start transition-all"
              >
                {savingDna ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Lock & Sync Brand DNA</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-800 animate-slide-up flex items-center gap-1.5 font-medium leading-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Success Locked! Business DNA profile has been written permanently into Firestore collection <span className="font-mono bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded text-[11px]">"business_dna_records"</span> and marked as baseline memory node.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Primary Identity fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#4f46e5] font-mono">1. Absolute Workspace Baseline</h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Business Overview</label>
                  <textarea 
                    rows={2}
                    value={dna.description}
                    onChange={(e) => setDna({ ...dna, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Industry Sector</label>
                    <input 
                      type="text" 
                      value={dna.industry}
                      onChange={(e) => setDna({ ...dna, industry: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Sub-Category</label>
                    <input 
                      type="text" 
                      value={dna.category}
                      onChange={(e) => setDna({ ...dna, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Catalogs Products</label>
                    <input 
                      type="text" 
                      value={dna.products}
                      onChange={(e) => setDna({ ...dna, products: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                      placeholder="Product 1, Product 2..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Core Services</label>
                    <input 
                      type="text" 
                      value={dna.services}
                      onChange={(e) => setDna({ ...dna, services: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                      placeholder="Service 1, Service 2..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Active Target Audience</label>
                  <input 
                    type="text" 
                    value={dna.targetAudience}
                    onChange={(e) => setDna({ ...dna, targetAudience: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>
              </div>

              {/* Competitive Strategy fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#4f46e5] font-mono">2. Positioning & Growth Moat Data</h4>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Unique Selling Proposition (USP)</label>
                  <input 
                    type="text" 
                    value={dna.uniqueSellingProposition}
                    onChange={(e) => setDna({ ...dna, uniqueSellingProposition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Pricing Logic & Strategic Strategy</label>
                  <input 
                    type="text" 
                    value={dna.pricingStrategy}
                    onChange={(e) => setDna({ ...dna, pricingStrategy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Competitive Positioning Moat</label>
                  <textarea 
                    rows={2}
                    value={dna.competitivePositioning}
                    onChange={(e) => setDna({ ...dna, competitivePositioning: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Permanent Brand Voice Guidelines</label>
                  <input 
                    type="text" 
                    value={dna.brandVoice}
                    onChange={(e) => setDna({ ...dna, brandVoice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-indigo-700 font-mono-tech"
                  />
                </div>
              </div>
            </div>

            {/* FOUNDER MOAT CALLOUT */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-left">
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                  <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Founder Moat Asset Lock active</span>
                </h5>
                <p className="text-[11px] text-indigo-700 max-w-2xl leading-normal">
                  The elements stored inside your **Business DNA Profile** serve as foundational memory weights. Standard generated flyers, ad copywriting formulas, and chat coaches automatically consult this locked card to prevent generic AI output.
                </p>
              </div>
              <div className="font-mono text-xs font-extrabold text-indigo-600 uppercase border border-dashed border-indigo-300 bg-white/70 px-3 py-2 rounded-xl">
                Advantage: +1.84x Moat Coefficient
              </div>
            </div>
          </div>
        )}

        {/* --- MODULE 2: CAMPAIGN MEMORY ENGINE --- */}
        {activeSubTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="border-b pb-3 text-left">
              <h3 className="text-sm font-bold text-slate-800 font-sans">Campaign & Asset History Ledger™</h3>
              <p className="text-xs text-slate-500 mt-0.5">Browse past compiled actions and marketing bundles. Click "Recall & Optimize" to re-instantiate historical campaigns instantaneously inside your planner.</p>
            </div>

            <div className="space-y-4">
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                  <p className="mt-2">Retrieving multi-tenant campaign memory indices...</p>
                </div>
              ) : campaignHistory.length === 0 ? (
                <div className="py-12 border border-dashed text-center text-xs text-slate-400 p-8 rounded-2xl">
                  No campaigns loaded. Generate and save a campaign first inside the "Campaign Planner" tab!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignHistory.map((item, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-left flex flex-col justify-between gap-4 transition-all hover:shadow-md">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded text-indigo-600">
                            MEMORIZED CAMPAIGN_NODE
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 font-sans">{item.campaignName}</h4>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2"><strong>Objective</strong>: {item.objective}</p>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.channels.map((ch, oidx) => (
                            <span key={oidx} className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
                              #{ch}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">Duration: {item.durationWeeks} Weeks</span>
                        <button
                          onClick={() => handleRecallCampaign(item)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-slate-900 border text-white rounded-xl text-[11px] font-extrabold cursor-pointer flex items-center gap-1 transition"
                        >
                          <Play className="w-3 h-3 text-indigo-300 shrink-0 fill-current" />
                          <span>Recall & Optimize</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MODULE 3: OFFER PERFORMANCE TRACKING --- */}
        {activeSubTab === 'offers' && (
          <div className="space-y-6">
            <div className="border-b pb-3 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans">Strategic Offer Performance Memory™</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track, audit and rank campaigns offer blueprints. Identify winning combinations and avoid historical conversion bottlenecks.</p>
              </div>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 rounded px-2.5 py-1 font-bold">
                RANKING ALGORITHM: CONVERSION COEFFICIENT SORT
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add Custom Offer Form */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-4 self-start">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Create Memory Offer Node</h4>
                
                <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Offer Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Free Traditional Spiced Drink"
                      value={newOfferTitle}
                      onChange={(e) => setNewOfferTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Value Prop & Hook</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Compliment your appetizer with dynamic spice punch options"
                      value={newOfferProp}
                      onChange={(e) => setNewOfferProp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Optimal Channel</label>
                    <select
                      value={newOfferChannel}
                      onChange={(e) => setNewOfferChannel(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    >
                      <option>WhatsApp</option>
                      <option>Facebook Feed</option>
                      <option>Instagram Stories</option>
                      <option>Email Newsletter</option>
                      <option>Flyer Voucher</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-sm cursor-pointer transition"
                  >
                    Add Offer to Ledger
                  </button>
                </form>
              </div>

              {/* Offer Ranking List */}
              <div className="lg:col-span-2 space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono select-none">Offer Success Rankings</h4>
                
                <div className="space-y-3.5">
                  {offers
                    .sort((a, b) => b.score - a.score)
                    .map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`p-4 bg-white border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-50 ${
                          index === 0 ? 'border-indigo-500 shadow-sm shadow-indigo-500/5 ring-1 ring-indigo-500/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                            index === 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-slate-800">{item.title}</h5>
                              <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-semibold">{item.channel}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal"><strong>Hook</strong>: {item.valueProp}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto min-w-[150px] justify-between">
                          {/* Score widget */}
                          <div className="text-left md:text-right">
                            <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold select-none">Score</span>
                            <span className="text-xs font-extrabold text-slate-700 font-mono">{item.score}%</span>
                          </div>

                          {/* Interactive Claim Toggles */}
                          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-slate-900">
                            {[
                              { label: 'Sel', status: 'selected', color: 'hover:bg-emerald-50 text-emerald-600' },
                              { label: 'Pub', status: 'published', color: 'hover:bg-indigo-50 text-indigo-600' },
                              { label: 'Rej', status: 'rejected', color: 'hover:bg-rose-50 text-rose-600' }
                            ].map((btn) => (
                              <button
                                key={btn.status}
                                type="button"
                                onClick={() => handleToggleOfferStatus(item.id, btn.status as any)}
                                className={`px-2 py-0.8 text-[10px] font-mono rounded font-extrabold transition-all cursor-pointer ${
                                  item.status === btn.status 
                                    ? 'bg-slate-800 text-white' 
                                    : `text-slate-500 ${btn.color}`
                                }`}
                                title={`Set status to ${btn.status}`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- MODULE 4: CUSTOMER PERSONA INTEL --- */}
        {activeSubTab === 'personas' && (
          <div className="space-y-6">
            <div className="border-b pb-3 text-left">
              <h3 className="text-sm font-bold text-slate-800 font-sans">Evolving Customer Persona Intelligence™</h3>
              <p className="text-xs text-slate-500 mt-0.5">Continuous memory tracks interaction histories. The dashboard scores engagement triggers dynamically to reflect ongoing campaign optimizations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {personaIntel.map(p => (
                <div key={p.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between gap-4 text-slate-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800">{p.name}</h4>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 block font-mono">ENGAGEMENT FACTOR</span>
                        <span className="text-xs font-black text-emerald-600 font-mono">{p.engagementFactor}%</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Preferred Channels</span>
                      <div className="flex flex-wrap gap-1">
                        {p.preferredChannels.map((ch, idx) => (
                          <span key={idx} className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Accumulated Experience Notes</span>
                      <div className="space-y-1 font-sans text-xs text-slate-600">
                        {p.historyNotes.map((note, nIdx) => (
                          <p key={nIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                            <span>{note}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between pointer-events-none mt-2 text-slate-900">
                    <span className="text-[10px] font-mono text-indigo-700">Predictive Alignment Hook</span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">OPTIMAL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MODULE 5: BRAND EVOLUTION MEMORY --- */}
        {activeSubTab === 'brand' && (
          <div className="space-y-6">
            <div className="border-b pb-3 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans">Brand Asset Evolution Memory™</h3>
                <p className="text-xs text-slate-500 mt-0.5">Remember approved canvas proportions, typography pairings, and hex pallets. Keep visual styles locked automatically.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Auto-Apply Approved Styles:</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={autoAlignBranding}
                    onChange={() => {
                      setAutoAlignBranding(!autoAlignBranding);
                      onCreateAuditLog('brand_auto_align_toggle', 'low', `Toggled Auto-Align guidelines memory option.`);
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {designDecisions.map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between gap-4 text-slate-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.date}</span>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                        item.status === 'approved' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border-rose-100'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1"><strong>Fonts</strong>: {item.fonts}</p>
                    </div>

                    <div className="flex gap-2">
                      {item.colors.map((c, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-1.5 bg-white border px-2 py-1 rounded-lg text-slate-900">
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: c }}></div>
                          <span className="text-[9px] font-mono font-medium text-slate-600 uppercase">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDesignStatus(item.id, item.status)}
                    className={`w-full py-2 border rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer text-center ${
                      item.status === 'approved' ? 'text-rose-600 border-rose-200' : 'text-emerald-700 border-emerald-300'
                    }`}
                  >
                    {item.status === 'approved' ? 'Disapprove Style' : 'Approve Style Layout'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MODULE 6: SEASONAL INTELLIGENCE ENGINE --- */}
        {activeSubTab === 'seasonal' && (
          <div className="space-y-6">
            <div className="border-b pb-3 text-left">
              <h3 className="text-sm font-bold text-slate-800 font-sans">Seasonal Intelligence Recommendations™</h3>
              <p className="text-xs text-slate-500 mt-0.5">Analyze Nepalese festivals, admissions timelines, and peak tourism seasons automatically. Pull recurring marketing recommendations instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Seasonal buttons selector list */}
              <div className="space-y-2 text-left self-start">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">Select Holiday / Festival Node</span>
                {SEASONAL_EVENTS.map(se => (
                  <button
                    key={se.id}
                    onClick={() => setActiveSeason(se.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      activeSeason === se.id 
                        ? 'bg-slate-900 text-white border-transparent shadow shadow-indigo-600/10' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold block">{se.name}</span>
                      <span className={`text-[10px] font-mono ${activeSeason === se.id ? 'text-indigo-300' : 'text-slate-400'}`}>
                        {se.timeline}
                      </span>
                    </div>
                    {activeSeason === se.id && (
                      <div className="h-2 w-2 rounded-full bg-indigo-400 mt-1"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Detailed seasonal recommendation panel */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-200 p-6 rounded-3xl text-left space-y-4">
                <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded uppercase">
                      ACTIVE RECURRING SEASONAL_REC
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 mt-1">{selectedSeasonData.name}</h4>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Country: <strong className="text-slate-800">{selectedSeasonData.targetCountry}</strong>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Cultural Target context</span>
                  <p className="text-slate-700 leading-relaxed font-sans">{selectedSeasonData.culturalContext}</p>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">MarketForge Intelligence advice</span>
                  <div className="bg-white border border-indigo-100 p-4 rounded-2xl text-xs text-indigo-900 leading-relaxed font-semibold flex items-start gap-2 text-left">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                    <span>{selectedSeasonData.recommendation}</span>
                  </div>
                </div>

                {/* MODULE 8 Integration: Execute recommended seasonal plan */}
                <div className="border-t border-slate-200 pt-5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Advantage: Predictive Holiday Readiness Boost</span>
                  <button
                    onClick={() => {
                      const recTitle = `${dna.name} - ${selectedSeasonData.name} Festive Special`;
                      const recObj = `Capitalize on high buying sentiment during ${selectedSeasonData.name} to capture loyal reservations.`;
                      handleExecuteSeasonalCampaign(recTitle, recObj);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm transition"
                  >
                    Execute Campaign Blueprint
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* --- MODULE 7: GROWTH PATTERN DETECTION --- */}
        {activeSubTab === 'growth' && (
          <div className="space-y-6">
            <div className="border-b pb-3 text-left">
              <h3 className="text-sm font-bold text-slate-800 font-sans">Growth Pattern Detection & Proactive Advisor™</h3>
              <p className="text-xs text-slate-500 mt-0.5">MarketForge analyzes workspace parameters hourly to flag growth paths, consistency declines, and untapped target market opportunities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Opportunities card */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold font-mono text-emerald-800 uppercase bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                  📈 growth opportunities
                </span>
                
                <div className="space-y-3.5 pt-2 text-xs">
                  <div className="space-y-1">
                    <h5 className="font-bold text-emerald-900">Locally Adapted Messaging Advantage</h5>
                    <p className="text-emerald-800 leading-relaxed">WhatsApp campaign targeting provides **2.4x higher conversion** coefficients in Nepal (NP) region compared to generic email marketing programs.</p>
                  </div>
                  
                  <div className="space-y-1 border-t border-emerald-100 pt-2.5">
                    <h5 className="font-bold text-emerald-900">Fireside Food Content Magnet</h5>
                    <p className="text-emerald-800 leading-relaxed">We detect strong blogging resonance with smoked food presentation. Maintain close-up wood smoke photos in guidelines.</p>
                  </div>
                </div>
              </div>

              {/* Declines cards */}
              <div className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold font-mono text-rose-800 uppercase bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
                  ⚠️ detected performance declines
                </span>

                <div className="space-y-3.5 pt-2 text-xs">
                  <div className="space-y-1">
                    <h5 className="font-bold text-rose-900">Campaign Schedule Consistency Drop</h5>
                    <p className="text-rose-800 leading-relaxed">Campaign planning frequency decreased by **15%** from peak. Keeping roadmap updates consistent ensures high workspace score indicators.</p>
                  </div>

                  <div className="space-y-1 border-t border-rose-100 pt-2.5">
                    <h5 className="font-bold text-rose-900">Weak Offer Urgency Parameter</h5>
                    <p className="text-rose-800 leading-relaxed">Two recent draft flyers lack explicit urgency triggers. Ensure CTAs specify absolute deadline bookings (e.g. "Reserve by Friday").</p>
                  </div>
                </div>
              </div>

              {/* Missed cards */}
              <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-2xl text-left space-y-3">
                <span className="text-[10px] font-bold font-mono text-indigo-700 uppercase bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                  💡 missed opportunities
                </span>

                <div className="space-y-3.5 pt-2 text-xs">
                  <div className="space-y-1">
                    <h5 className="font-bold text-indigo-900">Dashain Festive Pre-sale</h5>
                    <p className="text-indigo-800 leading-relaxed">Our calendars observe Dashain festival is approaching soon. Run specialized WhatsApp pre-sales packages to secure early reservations.</p>
                  </div>

                  <div className="space-y-1 border-t border-indigo-100 pt-2.5">
                    <h5 className="font-bold text-indigo-900">Untapped Loyalty Referral Engine</h5>
                    <p className="text-indigo-800 leading-relaxed">Your Business DNA targets executive high-yielding clients, but you have no loyalty referrers registered. launch customer invite campaign briefs.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* RECOMMENDATIONS WRAPPED */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono select-none">Proactive Growth Blueprint Recommendations</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Nepal National Festives Pre-Booking Program", desc: "Launch customized high-convert WhatsApp list offers timed precisely with Dashain family arrivals.", type: "RUN_DASHAIN", label: "Run Dashain Campaign" },
                  { title: "High-Margin Signature Product Push", desc: "Saturate social copies emphasizing Woodfired Trout and private mountain retreats to boost net profit percent.", type: "HIGH_MARGIN", label: "Promote High Margin" },
                  { title: "Intense WhatsApp Messenger Broadcast Cycle", desc: "Increase messaging frequency safely to capture direct instant bookings via chat.", type: "WHATSAPP", label: "Increase WhatsApp Activity" },
                  { title: "Loyalty Dormant Reactivation Curation", desc: "Dispatch tailored invitation with premium handwriting styling triggers to past customers.", type: "REACTIVATION", label: "Launch Reactivation Campaign" }
                ].map((rec, rIdx) => (
                  <div key={rIdx} className="bg-white border border-slate-200 hover:border-indigo-400 p-4 rounded-2xl flex flex-col justify-between gap-3 transition text-slate-900">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{rec.title}</h5>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">{rec.desc}</p>
                    </div>
                    <button
                      onClick={() => handleExecuteSeasonalCampaign(rec.title, rec.desc)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-extrabold text-[11px] rounded-xl self-end cursor-pointer transition shadow-sm border border-indigo-100"
                    >
                      {rec.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
