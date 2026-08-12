import React, { useState } from 'react';
import { 
  Sparkles, 
  Megaphone, 
  Layers, 
  TrendingUp, 
  Image as ImageIcon, 
  Send,
  CheckCircle2,
  Cpu,
  ArrowUpRight,
  Palette,
  Target,
  Calendar,
  Share2,
  X,
  Check,
  Instagram,
  Facebook,
  Twitter,
  Video,
  Clock,
  Download,
  Zap,
  Tag,
  MessageSquare,
  Bot,
  Search,
  BarChart3,
  DollarSign,
  Globe,
  RefreshCw,
  Copy,
  Code,
  Smartphone,
  Play,
  Filter,
  MessageCircle,
  ShieldCheck,
  Award,
  ChevronRight,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface CreativeVariant {
  id: string;
  title: string;
  headline: string;
  subheadline: string;
  description: string;
  ctaText: string;
  imageUrl: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5';
  colorTheme: string;
  bgGradient: string;
  campaignGoal: string;
  audience: string;
  sentiment: string;
  performanceScore: number;
  suggestedHashtags: string[];
  viralScore: number;
}

interface WhatsAppRule {
  id: string;
  keyword: string;
  replyMessage: string;
  action: 'SEND_CATALOG' | 'COLLECT_LEAD' | 'TRANSFER_AGENT' | 'TEXT_REPLY';
  active: boolean;
}

interface ScheduledPost {
  id: string;
  title: string;
  platforms: string[];
  date: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'DRAFT';
  caption: string;
  hashtags: string[];
}

export default function AdStudio() {
  const [activeTab, setActiveTab] = useState<'visual_ads' | 'social_schedule' | 'messaging_automation' | 'seo_aeo_hub' | 'ad_boost_roi'>('visual_ads');
  
  // Toast notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // -------------------------------------------------------------
  // TAB 1: VISUAL ADS STATE
  // -------------------------------------------------------------
  const [variants, setVariants] = useState<CreativeVariant[]>([
    {
      id: 'var-1',
      title: 'Enterprise AI Engine Launch',
      headline: 'Scale Enterprise Output Safely with Autonomous AI Department Nodes',
      subheadline: 'Integrated directly into your multi-tenant Cloud database architecture.',
      description: 'Integrate secure autonomous AI department agents directly into your custom cloud database architecture. Built for CTOs, product leaders, and engineering architects.',
      ctaText: 'Claim 30-Day Enterprise License',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      aspectRatio: '1:1',
      colorTheme: 'Cyber Purple',
      bgGradient: 'from-purple-900 via-indigo-900 to-slate-900',
      campaignGoal: 'Product Launch & Feature Highlight',
      audience: 'CTOs & Software Architects',
      sentiment: 'Authoritative & Technical (98%)',
      performanceScore: 96,
      suggestedHashtags: ['#EnterpriseAI', '#CloudArchitecture', '#SaaS', '#AIEngine', '#TechLeaders'],
      viralScore: 94
    },
    {
      id: 'var-2',
      title: 'Summer Growth Promotion Banner',
      headline: 'Supercharge Your Marketing Pipeline with 30% Off All Workspaces',
      subheadline: 'Automate social scheduling, multi-channel direct message auto-responders.',
      description: 'Automate social scheduling, multi-channel direct message auto-responders, and custom domain white-label portals in a single unified dashboard.',
      ctaText: 'Unlock 30% Discount Today',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      aspectRatio: '16:9',
      colorTheme: 'Vibrant Coral',
      bgGradient: 'from-rose-900 via-orange-900 to-slate-900',
      campaignGoal: 'Urgent Flash Sale / Promo',
      audience: 'Growth Marketers & Agencies',
      sentiment: 'Urgent & High Energy (95%)',
      performanceScore: 92,
      suggestedHashtags: ['#GrowthHacks', '#MarketingTools', '#SaaSDeals', '#SummerPromo', '#Automation'],
      viralScore: 91
    },
    {
      id: 'var-3',
      title: 'Gourmet Culinary Experience Flyer',
      headline: 'Handcrafted Chef Tasting Menu & Organic Vintage Wine Pairing',
      subheadline: 'Exclusive weekend culinary journey featuring farm-fresh organic ingredients.',
      description: 'Reserve your table for an exclusive weekend culinary journey featuring farm-fresh organic ingredients and artisanal dessert pairings.',
      ctaText: 'Reserve Your Table Online',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      aspectRatio: '9:16',
      colorTheme: 'Onyx Gold Luxury',
      bgGradient: 'from-amber-950 via-slate-950 to-stone-900',
      campaignGoal: 'Lead Generation',
      audience: 'Food Enthusiasts & Diners',
      sentiment: 'Sophisticated & Indulgent (96%)',
      performanceScore: 94,
      suggestedHashtags: ['#GourmetDining', '#ChefSpecial', '#FineDining', '#Foodie', '#WinePairing'],
      viralScore: 95
    }
  ]);

  const [promptInput, setPromptInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('Product Launch & Feature Highlight');
  const [selectedPalette, setSelectedPalette] = useState('Cyber Purple');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariantForSocial, setSelectedVariantForSocial] = useState<CreativeVariant | null>(null);

  const campaignGoals = [
    'Product Launch & Feature Highlight',
    'Brand Awareness & Engagement',
    'High-Conversion Lead Generation',
    'Urgent Flash Sale / Promo',
    'Customer Testimonial & Social Proof'
  ];

  const colorPalettes = [
    { name: 'Cyber Purple', bg: 'from-purple-900 via-indigo-900 to-slate-900', border: 'border-purple-500/30' },
    { name: 'Vibrant Coral', bg: 'from-rose-900 via-orange-900 to-slate-900', border: 'border-rose-500/30' },
    { name: 'Onyx Gold Luxury', bg: 'from-amber-950 via-slate-950 to-stone-900', border: 'border-amber-500/30' },
    { name: 'Corporate Ocean Blue', bg: 'from-sky-900 via-blue-950 to-slate-950', border: 'border-sky-500/30' },
    { name: 'Minimalist Warm Neutral', bg: 'from-stone-800 via-amber-900/40 to-stone-950', border: 'border-amber-700/30' }
  ];

  const unsplashCollection = [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
  ];

  const handleGenerateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const topic = promptInput.trim();
      const paletteObj = colorPalettes.find(p => p.name === selectedPalette) || colorPalettes[0];
      const randomImg = unsplashCollection[Math.floor(Math.random() * unsplashCollection.length)];

      const newVariation: CreativeVariant = {
        id: `var-${Date.now()}`,
        title: `Branded Design: ${topic.slice(0, 30)}`,
        headline: `Transform Operations with Branded ${topic}`,
        subheadline: `High converting automated strategy tailored for modern digital market leaders.`,
        description: `Deliver peak engagement and measurable return on investment using our automated ${topic} workflows. Powered by AI Studio intelligence.`,
        ctaText: `Explore ${topic.slice(0, 15)} Today`,
        imageUrl: randomImg,
        aspectRatio: selectedAspectRatio,
        colorTheme: selectedPalette,
        bgGradient: paletteObj.bg,
        campaignGoal: selectedGoal,
        audience: 'Targeted High-Intent Prospects',
        sentiment: 'High Converting & Engaging (96%)',
        performanceScore: Math.floor(Math.random() * 8) + 91,
        suggestedHashtags: [`#${topic.replace(/\s+/g, '')}`, '#MarketForge', '#Automation', '#BrandedDesign', '#GrowthOps'],
        viralScore: Math.floor(Math.random() * 6) + 92
      };

      setVariants([newVariation, ...variants]);
      setPromptInput('');
      setIsGenerating(false);
      showToast(`Generated high-converting ad design for "${topic}"!`);
    }, 1200);
  };

  // -------------------------------------------------------------
  // TAB 2: SCHEDULED SOCIAL POSTING STATE
  // -------------------------------------------------------------
  const [schedulePlatforms, setSchedulePlatforms] = useState<string[]>(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER']);
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [dripDays, setDripDays] = useState<number>(7);

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: 'post-1',
      title: 'Autonomous AI Department Nodes Announcement',
      platforms: ['LINKEDIN', 'TWITTER', 'FACEBOOK'],
      date: new Date(Date.now() + 86400000).toLocaleDateString() + ' @ 09:00 AM',
      status: 'SCHEDULED',
      caption: '🚀 Introducing Autonomous AI Department Nodes! Scale your enterprise operations safely with secure multi-tenant cloud automation.',
      hashtags: ['#SaaS', '#EnterpriseAI', '#Automation', '#TechNews']
    },
    {
      id: 'post-2',
      title: '30-Day Growth Challenge Promotion',
      platforms: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK'],
      date: new Date(Date.now() + 172800000).toLocaleDateString() + ' @ 02:30 PM',
      status: 'SCHEDULED',
      caption: '🔥 Are you ready to double your qualified leads this month? Claim your 30-day workspace license now!',
      hashtags: ['#GrowthHacks', '#LeadGen', '#DigitalMarketing']
    },
    {
      id: 'post-3',
      title: 'Weekly Customer Case Study Highlight',
      platforms: ['LINKEDIN', 'PINTEREST'],
      date: new Date(Date.now() + 259200000).toLocaleDateString() + ' @ 11:15 AM',
      status: 'SCHEDULED',
      caption: '📊 How Enterprise Corp increased customer conversion by 240% using automated multi-channel messaging.',
      hashtags: ['#CaseStudy', '#CustomerSuccess', '#B2BMarketing']
    }
  ]);

  const handleDispatchToScheduler = () => {
    if (!selectedVariantForSocial) return;

    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`,
      title: selectedVariantForSocial.headline,
      platforms: schedulePlatforms,
      date: new Date(scheduleDate).toLocaleDateString() + ' @ ' + new Date(scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SCHEDULED',
      caption: `${selectedVariantForSocial.headline}\n\n${selectedVariantForSocial.description}`,
      hashtags: selectedVariantForSocial.suggestedHashtags
    };

    setScheduledPosts([newPost, ...scheduledPosts]);
    showToast(`Successfully scheduled "${selectedVariantForSocial.title}" across ${schedulePlatforms.length} platforms!`);
    setSelectedVariantForSocial(null);
  };

  const handleGenerateBatchDrip = () => {
    const topics = [
      'Top 5 Strategies to Scale Customer Acquisition',
      'Behind the Scenes: Building Secure Enterprise Infrastructure',
      'How Automation Saves 15+ Hours Every Single Week',
      'Customer Spotlight: Scaling Revenue with AI Strategy',
      'Exclusive Feature Deep Dive & Best Practices'
    ];

    const generated: ScheduledPost[] = topics.slice(0, Math.min(topics.length, Math.ceil(dripDays / 2))).map((t, idx) => ({
      id: `drip-${Date.now()}-${idx}`,
      title: t,
      platforms: ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER'],
      date: new Date(Date.now() + (idx + 1) * 86400000 * 2).toLocaleDateString() + ' @ 10:00 AM',
      status: 'SCHEDULED',
      caption: `💡 ${t}\n\nAutomate your digital presence and capture high-intent buyers around the clock.`,
      hashtags: ['#DigitalMarketing', '#Automation', '#BusinessGrowth', '#SaaS']
    }));

    setScheduledPosts([...generated, ...scheduledPosts]);
    showToast(`Generated ${generated.length} automated posts for a ${dripDays}-day drip schedule!`);
  };

  // -------------------------------------------------------------
  // TAB 3: MESSAGING AUTOMATION STATE (WhatsApp, Messenger, Web Chat)
  // -------------------------------------------------------------
  const [messagingSubTab, setMessagingSubTab] = useState<'whatsapp' | 'messenger' | 'webchat'>('whatsapp');

  // WhatsApp Rules
  const [waRules, setWaRules] = useState<WhatsAppRule[]>([
    {
      id: 'wa-1',
      keyword: 'PRICE',
      replyMessage: 'Hi! Our Enterprise Growth Plan starts at $299/mo with unlimited AI ad generation and social auto-posting. View options: https://marketforge.io/pricing',
      action: 'SEND_CATALOG',
      active: true
    },
    {
      id: 'wa-2',
      keyword: 'DEMO',
      replyMessage: 'Great! We would love to show you a live 1-on-1 walkthrough. Select a time here: https://marketforge.io/book-demo',
      action: 'COLLECT_LEAD',
      active: true
    },
    {
      id: 'wa-3',
      keyword: 'SUPPORT',
      replyMessage: 'Connecting you immediately to our senior engineer on duty. Please hold for 30 seconds.',
      action: 'TRANSFER_AGENT',
      active: true
    }
  ]);

  const [newWaKeyword, setNewWaKeyword] = useState('');
  const [newWaReply, setNewWaReply] = useState('');
  const [newWaAction, setNewWaAction] = useState<'SEND_CATALOG' | 'COLLECT_LEAD' | 'TRANSFER_AGENT' | 'TEXT_REPLY'>('TEXT_REPLY');

  const handleAddWaRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaKeyword.trim() || !newWaReply.trim()) return;

    const newRule: WhatsAppRule = {
      id: `wa-${Date.now()}`,
      keyword: newWaKeyword.trim().toUpperCase(),
      replyMessage: newWaReply.trim(),
      action: newWaAction,
      active: true
    };

    setWaRules([...waRules, newRule]);
    setNewWaKeyword('');
    setNewWaReply('');
    showToast(`WhatsApp trigger rule for keyword "${newRule.keyword}" activated!`);
  };

  // Web Chat Widget Settings & Live Simulator
  const [widgetTitle, setWidgetTitle] = useState('MarketForge AI Assistant');
  const [widgetWelcomeMsg, setWidgetWelcomeMsg] = useState('Hello there! 👋 How can we help you scale your business today?');
  const [widgetThemeColor, setWidgetThemeColor] = useState('#6366f1');
  const [chatLog, setChatLog] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    { sender: 'bot', text: 'Hello there! 👋 How can we help you scale your business today?', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendTestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const userMsg = { sender: 'user' as const, text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatLog(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let botReply = "Thank you for reaching out! One of our team members will respond shortly.";
      if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('cost')) {
        botReply = "Our plans start at $99/mo for Starter, $299/mo for Growth, and custom quotes for Enterprise. Would you like a demo link?";
      } else if (userText.toLowerCase().includes('demo') || userText.toLowerCase().includes('book')) {
        botReply = "Awesome! Please enter your email address below to lock in a priority demo slot with our strategist.";
      } else if (userText.toLowerCase().includes('feature') || userText.toLowerCase().includes('ad')) {
        botReply = "MarketForge includes AI visual ad creation, 7-platform social scheduling, WhatsApp & Messenger auto-bots, and AEO AI search engine optimization!";
      }

      setChatLog(prev => [...prev, { sender: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800);
  };

  // -------------------------------------------------------------
  // TAB 4: SEO & AEO INTELLIGENCE STATE
  // -------------------------------------------------------------
  const [targetDomain, setTargetDomain] = useState('marketforge.io');
  const [isAuditingSeo, setIsAuditingSeo] = useState(false);
  const [seoResult, setSeoResult] = useState({
    healthScore: 94,
    aeoScore: 91,
    title: 'MarketForge Enterprise - AI Multi-Tenant Operating System',
    metaDesc: 'Automate visual ad creation, 7-platform social auto-posting, WhatsApp messaging bots, and AI search engine optimization in one platform.',
    voiceSearchReady: true,
    schemaMarkupValid: true,
    perplexityRank: '#1 Recommended Answer',
    chatGptCitationScore: '98% Citation Probability',
    trendingKeywords: [
      { keyword: '#EnterpriseAI', volume: '145K/mo', difficulty: 'Medium', trend: '+42%' },
      { keyword: '#MarketingAutomation', volume: '320K/mo', difficulty: 'Low', trend: '+68%' },
      { keyword: '#SaaSGrowth', volume: '98K/mo', difficulty: 'Low', trend: '+35%' },
      { keyword: '#WhatsAppAutomation', volume: '210K/mo', difficulty: 'Medium', trend: '+85%' },
      { keyword: '#AEOSearchIndex', volume: '54K/mo', difficulty: 'Low', trend: '+120%' }
    ]
  });

  const handleRunSeoAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDomain.trim()) return;
    setIsAuditingSeo(true);

    setTimeout(() => {
      setIsAuditingSeo(false);
      setSeoResult({
        ...seoResult,
        healthScore: Math.floor(Math.random() * 6) + 91,
        aeoScore: Math.floor(Math.random() * 8) + 89
      });
      showToast(`SEO & AEO Analysis complete for ${targetDomain}!`);
    }, 1200);
  };

  // -------------------------------------------------------------
  // TAB 5: AD BOOSTING & BUDGET ROI SIMULATOR STATE
  // -------------------------------------------------------------
  const [selectedBoostPlatform, setSelectedBoostPlatform] = useState<'META' | 'GOOGLE' | 'LINKEDIN'>('META');
  const [monthlyBudgetUSD, setMonthlyBudgetUSD] = useState<number>(1000);
  const [targetCpcUSD, setTargetCpcUSD] = useState<number>(1.25);

  // Derived metrics
  const estimatedImpressions = Math.round((monthlyBudgetUSD / targetCpcUSD) * 22);
  const estimatedClicks = Math.round(monthlyBudgetUSD / targetCpcUSD);
  const estimatedLeads = Math.round(estimatedClicks * 0.12);
  const projectedRevenue = Math.round(estimatedLeads * 350);
  const projectedRoiPercent = Math.round(((projectedRevenue - monthlyBudgetUSD) / monthlyBudgetUSD) * 100);

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="bg-[#0e101a] border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" /> Omni-Channel Automated Marketing & Revenue OS
          </h2>
          <p className="text-xs text-slate-400">
            Phase 1 MVP Suite: Synthesize visual ads, multi-platform social scheduling, WhatsApp & Web Chat bots, AEO AI Search index optimization, and budget ROI forecasts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-xl shrink-0">
          <Award className="w-4 h-4 text-amber-400" /> Enterprise Premium Tier Active
        </div>
      </section>

      {/* Main Feature Tabs Navigation */}
      <div className="bg-[#0e101a] border border-white/5 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'visual_ads', label: '1. Visual Ad Studio', icon: ImageIcon, color: 'text-purple-400' },
          { id: 'social_schedule', label: '2. Social Auto-Poster', icon: Share2, color: 'text-rose-400' },
          { id: 'messaging_automation', label: '3. Messaging Bots (WhatsApp & Chat)', icon: MessageSquare, color: 'text-emerald-400' },
          { id: 'seo_aeo_hub', label: '4. SEO & AEO Intelligence', icon: Search, color: 'text-cyan-400' },
          { id: 'ad_boost_roi', label: '5. Ad Boost & ROI Simulator', icon: TrendingUp, color: 'text-amber-400' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VISUAL AD STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'visual_ads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Controls - 5 Cols */}
          <div className="lg:col-span-5 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Megaphone className="w-4 h-4 text-purple-400" /> AI Visual Banner Generator
            </h3>

            <form onSubmit={handleGenerateAd} className="space-y-4">
              {/* Campaign Goal Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Target className="w-3 h-3 text-purple-400" /> Campaign Goal
                </label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {campaignGoals.map((goal) => (
                    <option key={goal} value={goal} className="bg-slate-900 text-white">
                      {goal}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Canvas Format / Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { ratio: '1:1', label: 'Square (1:1)' },
                    { ratio: '9:16', label: 'Reel (9:16)' },
                    { ratio: '16:9', label: 'Banner (16:9)' },
                    { ratio: '4:5', label: 'Feed (4:5)' }
                  ].map((item) => (
                    <button
                      key={item.ratio}
                      type="button"
                      onClick={() => setSelectedAspectRatio(item.ratio as any)}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition text-center cursor-pointer ${
                        selectedAspectRatio === item.ratio
                          ? 'bg-purple-900/50 border-purple-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Palette Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Palette className="w-3 h-3 text-purple-400" /> Theme Palette
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colorPalettes.map((pal) => (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => setSelectedPalette(pal.name)}
                      className={`p-2 rounded-xl text-[11px] font-medium text-left border cursor-pointer transition flex items-center gap-2 ${
                        selectedPalette === pal.name
                          ? 'bg-purple-900/40 border-purple-400 text-purple-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${pal.bg} shrink-0`} />
                      <span className="truncate">{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Product, Offer, or Event Concept
                </label>
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. AI-driven cybersecurity scanner for multi-cloud enterprise networks..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !promptInput.trim()}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                  isGenerating
                    ? 'bg-purple-950 text-purple-400 border border-purple-500/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" /> GENERATING AD DESIGN & COPY...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> GENERATE VISUAL AD & SEO COPY
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-white/5 pt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>CANVAS RES: 2160 x 2160 (HD)</span>
              <span className="text-emerald-400 font-bold">100% UNLIMITED</span>
            </div>
          </div>

          {/* Generated Cards - 7 Cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Generated Ad Designs ({variants.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">1-Click Dispatch to Social Scheduler</span>
            </div>

            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {variants.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0e101a] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/40 transition flex flex-col md:flex-row gap-0 group"
                >
                  {/* Visual Image Banner with Overlay */}
                  <div className="md:w-5/12 relative aspect-square md:aspect-auto overflow-hidden bg-slate-900 shrink-0">
                    <img src={item.imageUrl} alt={item.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${item.bgGradient} opacity-60`} />
                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold text-purple-300">
                      {item.aspectRatio} • {item.colorTheme}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 p-2 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 text-center">
                      <p className="text-[10px] font-bold text-amber-300 truncate">{item.ctaText}</p>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-4 md:w-7/12 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider">{item.campaignGoal}</span>
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {item.viralScore}% Viral Score
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{item.headline}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.suggestedHashtags.map((tag) => (
                          <span key={tag} className="text-[9px] font-mono bg-white/5 text-slate-300 px-1.5 py-0.5 rounded border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-400">
                        <span>Audience: <strong className="text-slate-200">{item.audience}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedVariantForSocial(item)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-sm shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Schedule in Auto-Poster
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHEDULED SOCIAL POSTING */}
      {/* ========================================================================= */}
      {activeTab === 'social_schedule' && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-[#0e101a] border border-white/5 p-5 rounded-2xl space-y-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-rose-400" /> Multi-Platform Auto-Poster & Calendar Queue
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automate posts across 7 major networks: Facebook, Instagram, LinkedIn, X/Twitter, TikTok, YouTube, and Pinterest.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { name: 'Facebook', icon: <Facebook className="w-3.5 h-3.5 text-blue-500" /> },
                  { name: 'Instagram', icon: <Instagram className="w-3.5 h-3.5 text-pink-500" /> },
                  { name: 'LinkedIn', icon: <Share2 className="w-3.5 h-3.5 text-sky-400" /> },
                  { name: 'Twitter / X', icon: <Twitter className="w-3.5 h-3.5 text-slate-300" /> },
                  { name: 'TikTok', icon: <Video className="w-3.5 h-3.5 text-cyan-400" /> },
                  { name: 'Pinterest', icon: <Tag className="w-3.5 h-3.5 text-red-500" /> },
                  { name: 'YouTube', icon: <Play className="w-3.5 h-3.5 text-red-600" /> }
                ].map((net) => (
                  <span key={net.name} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-200">
                    {net.icon} {net.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 bg-[#0e101a] border border-rose-500/20 p-5 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Automated Drip Campaign Generator
              </h4>
              <p className="text-[11px] text-slate-400">
                Generate 1-click drip content tailored for your target audience for 7, 14, or 30 days ahead.
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={dripDays}
                  onChange={(e) => setDripDays(parseInt(e.target.value, 10))}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value={7} className="bg-slate-900">7 Days Schedule</option>
                  <option value={14} className="bg-slate-900">14 Days Schedule</option>
                  <option value={30} className="bg-slate-900">30 Days Schedule</option>
                </select>
                <button
                  type="button"
                  onClick={handleGenerateBatchDrip}
                  className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Generate Drip Queue
                </button>
              </div>
            </div>
          </div>

          {/* Scheduled Posts Table */}
          <div className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-400" /> Active Posts Queue ({scheduledPosts.length})
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                AUTOMATED DISPATCH ENGINE ONLINE
              </span>
            </div>

            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-rose-500/30 transition">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{post.title}</span>
                      <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">
                        {post.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{post.caption}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.platforms.map((p) => (
                        <span key={p} className="text-[9px] font-mono bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-rose-400 inline mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <button
                      onClick={() => {
                        setScheduledPosts(scheduledPosts.filter(p => p.id !== post.id));
                        showToast("Post removed from schedule queue.");
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Cancel Post"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MESSAGING AUTOMATION (WhatsApp, Messenger & Web Chat) */}
      {/* ========================================================================= */}
      {activeTab === 'messaging_automation' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            {[
              { id: 'whatsapp', label: 'WhatsApp Business Bot', icon: MessageCircle, color: 'text-emerald-400' },
              { id: 'messenger', label: 'Facebook Messenger Bot', icon: MessageSquare, color: 'text-blue-400' },
              { id: 'webchat', label: 'Webpage Live Chat Widget', icon: Bot, color: 'text-purple-400' }
            ].map((st) => {
              const Icon = st.icon;
              const isActive = messagingSubTab === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setMessagingSubTab(st.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${st.color}`} />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUBTAB 1: WHATSAPP */}
          {messagingSubTab === 'whatsapp' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> Create WhatsApp Keyword Trigger Rule
                </h3>

                <form onSubmit={handleAddWaRule} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Incoming Keyword / Trigger Phrase</label>
                    <input
                      type="text"
                      value={newWaKeyword}
                      onChange={(e) => setNewWaKeyword(e.target.value)}
                      placeholder="e.g. PRICE, DEMO, CATALOG, BOOK"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Automated Action Type</label>
                    <select
                      value={newWaAction}
                      onChange={(e) => setNewWaAction(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="TEXT_REPLY" className="bg-slate-900">Text Auto-Reply</option>
                      <option value="SEND_CATALOG" className="bg-slate-900">Send Product Catalog Link</option>
                      <option value="COLLECT_LEAD" className="bg-slate-900">Collect Lead Form</option>
                      <option value="TRANSFER_AGENT" className="bg-slate-900">Transfer to Live Agent</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">WhatsApp Response Message</label>
                    <textarea
                      value={newWaReply}
                      onChange={(e) => setNewWaReply(e.target.value)}
                      placeholder="e.g. Thanks for asking! Here is our product catalog link..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newWaKeyword.trim() || !newWaReply.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" /> Activate WhatsApp Rule
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active WhatsApp Rules ({waRules.length})
                </h3>

                <div className="space-y-3">
                  {waRules.map((rule) => (
                    <div key={rule.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          KEYWORD: "{rule.keyword}"
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                          ACTION: {rule.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{rule.replyMessage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: MESSENGER */}
          {messagingSubTab === 'messenger' && (
            <div className="bg-[#0e101a] border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Facebook Messenger Direct Lead Qualifier
              </h3>
              <p className="text-xs text-slate-400">
                Automatically reply to Facebook page messages, qualify prospective buyers, and store contact info in your tenant database.
              </p>
              <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-blue-300">
                  <span>MESSENGER AUTO-QUALIFIER BOT</span>
                  <span className="text-emerald-400 font-mono">STATUS: CONNECTED</span>
                </div>
                <p className="text-slate-300">
                  When prospects message your Facebook page, MarketForge AI greets them, asks 2 qualifying questions, and logs their budget and timeline.
                </p>
              </div>
            </div>
          )}

          {/* SUBTAB 3: WEBPAGE LIVE CHAT */}
          {messagingSubTab === 'webchat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Widget Configurator - 6 cols */}
              <div className="lg:col-span-6 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <Bot className="w-4 h-4 text-purple-400" /> Webpage Live Chat Widget Configurator
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Widget Title Header</label>
                    <input
                      type="text"
                      value={widgetTitle}
                      onChange={(e) => setWidgetTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Welcome Greeting</label>
                    <textarea
                      value={widgetWelcomeMsg}
                      onChange={(e) => setWidgetWelcomeMsg(e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Primary Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={widgetThemeColor}
                        onChange={(e) => setWidgetThemeColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-300 uppercase">{widgetThemeColor}</span>
                    </div>
                  </div>

                  {/* Embed Script Code snippet */}
                  <div className="p-3 bg-black/60 border border-white/10 rounded-xl space-y-1 font-mono text-[11px]">
                    <span className="text-slate-400 block font-bold">1-LINE HTML EMBED CODE:</span>
                    <code className="text-emerald-400 break-all block">
                      {`<script src="https://marketforge.io/chat.js" data-tenant="demo-tenant" data-color="${widgetThemeColor}"></script>`}
                    </code>
                  </div>
                </div>
              </div>

              {/* Live Chat Simulator - 6 cols */}
              <div className="lg:col-span-6 bg-[#0e101a] border border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between h-[480px]">
                {/* Chat Header */}
                <div className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: widgetThemeColor }}>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-white" />
                    <span className="font-bold text-xs text-white">{widgetTitle}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 my-2">
                  {chatLog.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl text-xs max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-white/10 text-slate-200 border border-white/10 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendTestChat} className="flex gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message (e.g. price, demo)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <button type="submit" className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SEO & AEO INTELLIGENCE HUB */}
      {/* ========================================================================= */}
      {activeTab === 'seo_aeo_hub' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Audit Form - 4 cols */}
            <div className="lg:col-span-4 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Search className="w-4 h-4 text-cyan-400" /> AEO & SEO Search Audit
              </h3>

              <form onSubmit={handleRunSeoAudit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Target Website Domain / URL</label>
                  <input
                    type="text"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. marketforge.io"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuditingSeo || !targetDomain.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAuditingSeo ? <Cpu className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {isAuditingSeo ? 'ANALYZING AI CITATIONS...' : 'RUN AEO & SEO INSPECTION'}
                </button>
              </form>

              <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs space-y-2">
                <p className="font-bold text-cyan-300">WHAT IS AEO (AI ENGINE OPTIMIZATION)?</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  AEO prepares your website content to be cited as the definitive answer by Perplexity AI, ChatGPT Search, Google Gemini, and Claude.
                </p>
              </div>
            </div>

            {/* Audit Results - 8 cols */}
            <div className="lg:col-span-8 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" /> AEO & SEO Scorecard
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                  DOMAIN: {targetDomain}
                </span>
              </div>

              {/* Score Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">SEO Health Score</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono">{seoResult.healthScore}/100</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">AEO AI Answer Score</span>
                  <p className="text-2xl font-black text-cyan-400 font-mono">{seoResult.aeoScore}/100</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Perplexity Rank</span>
                  <p className="text-xs font-bold text-amber-300 mt-2">{seoResult.perplexityRank}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">ChatGPT Citation</span>
                  <p className="text-xs font-bold text-purple-300 mt-2">{seoResult.chatGptCitationScore}</p>
                </div>
              </div>

              {/* Trending High-SEO Hashtags & Keywords */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> Trending High-SEO Hashtags & Keywords
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {seoResult.trendingKeywords.map((kw, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-cyan-300 block">{kw.keyword}</span>
                        <span className="text-[10px] text-slate-400">{kw.volume} Volume • {kw.difficulty} Diff</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {kw.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AD BOOSTING & BUDGET ROI SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'ad_boost_roi' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Config - 5 cols */}
            <div className="lg:col-span-5 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-5">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Ad Boost & Campaign Budget Simulator
              </h3>

              {/* Platform Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Ad Network Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'META', name: 'Meta Ads', icon: <Facebook className="w-3.5 h-3.5 text-blue-400" /> },
                    { id: 'GOOGLE', name: 'Google Search', icon: <Search className="w-3.5 h-3.5 text-rose-400" /> },
                    { id: 'LINKEDIN', name: 'LinkedIn B2B', icon: <Share2 className="w-3.5 h-3.5 text-sky-400" /> }
                  ].map((plat) => (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setSelectedBoostPlatform(plat.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedBoostPlatform === plat.id
                          ? 'bg-amber-900/50 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {plat.icon} {plat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Budget Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Monthly Ad Budget:</span>
                  <span className="font-bold text-amber-400">${monthlyBudgetUSD.toLocaleString()}/mo</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={monthlyBudgetUSD}
                  onChange={(e) => setMonthlyBudgetUSD(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Target CPC Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Target CPC (Cost Per Click):</span>
                  <span className="font-bold text-amber-400">${targetCpcUSD.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.50}
                  max={5.00}
                  step={0.25}
                  value={targetCpcUSD}
                  onChange={(e) => setTargetCpcUSD(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => showToast(`Simulated $${monthlyBudgetUSD} campaign boost on ${selectedBoostPlatform}!`)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" /> Launch Simulated Campaign Boost
              </button>
            </div>

            {/* Simulated ROI Results - 7 cols */}
            <div className="lg:col-span-7 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-5">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <DollarSign className="w-4 h-4 text-amber-400" /> Projected Campaign Return & Conversion Metrics
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Impressions</span>
                  <p className="text-lg font-black text-slate-200 font-mono">{estimatedImpressions.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Est. Clicks</span>
                  <p className="text-lg font-black text-indigo-400 font-mono">{estimatedClicks.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Qualified Leads</span>
                  <p className="text-lg font-black text-cyan-400 font-mono">{estimatedLeads.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Projected Net ROI</span>
                  <p className="text-lg font-black text-emerald-400 font-mono">+{projectedRoiPercent}%</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-300">ESTIMATED REVENUE FORECAST</span>
                  <span className="text-xl text-emerald-400 font-mono">${projectedRevenue.toLocaleString()} USD</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Based on standard B2B conversion ratios (12% click-to-lead and average lifetime contract value of $350).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT SOCIAL SCHEDULER MODAL */}
      {selectedVariantForSocial && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4">
          <div className="bg-[#0e101a] border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-xl p-6 font-sans space-y-5 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                Dispatch Design to Social Auto-Poster
              </h4>
              <button onClick={() => setSelectedVariantForSocial(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Asset Preview */}
            <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
              <img src={selectedVariantForSocial.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/10 shrink-0" />
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-mono text-purple-400 uppercase block font-bold">{selectedVariantForSocial.campaignGoal}</span>
                <p className="font-bold text-xs text-white truncate">{selectedVariantForSocial.headline}</p>
                <p className="text-[10.5px] text-slate-400 line-clamp-2">{selectedVariantForSocial.description}</p>
              </div>
            </div>

            {/* Schedule Date & Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Schedule Timestamp
              </label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDispatchToScheduler}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Confirm & Schedule Post
              </button>
              <button
                type="button"
                onClick={() => setSelectedVariantForSocial(null)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
