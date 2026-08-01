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
  Tag
} from 'lucide-react';

interface CreativeVariant {
  id: string;
  title: string;
  headline: string;
  description: string;
  ctaText: string;
  imageUrl: string;
  aspectRatio: '1:1' | '16:9' | '9:16';
  colorTheme: string;
  bgGradient: string;
  campaignGoal: string;
  audience: string;
  sentiment: string;
  performanceScore: number;
  suggestedHashtags: string[];
}

export default function AdStudio() {
  const [variants, setVariants] = useState<CreativeVariant[]>([
    {
      id: 'var-1',
      title: 'OmniCore v4 Enterprise AI Engine Launch',
      headline: 'Scale Enterprise Output Safely with Autonomous AI Department Nodes',
      description: 'Integrate secure autonomous AI department agents directly into your custom cloud database architecture. Built for CTOs, product leaders, and engineering architects.',
      ctaText: 'Claim 30-Day Developer License',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      aspectRatio: '1:1',
      colorTheme: 'Cyber Purple',
      bgGradient: 'from-purple-900 via-indigo-900 to-slate-900',
      campaignGoal: 'Product Launch & Feature Highlight',
      audience: 'CTOs & Software Architects',
      sentiment: 'Highly Authoritative & Technical (98%)',
      performanceScore: 96,
      suggestedHashtags: ['#EnterpriseAI', '#CloudArchitecture', '#SaaS', '#AIEngine', '#TechLeaders']
    },
    {
      id: 'var-2',
      title: 'Summer Growth Promotion Banner',
      headline: 'Supercharge Your Marketing Pipeline with 30% Off All Workspaces',
      description: 'Automate social scheduling, multi-channel direct message auto-responders, and custom domain white-label portals in a single unified dashboard.',
      ctaText: 'Unlock 30% Discount Today',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      aspectRatio: '1:1',
      colorTheme: 'Vibrant Coral',
      bgGradient: 'from-rose-900 via-orange-900 to-slate-900',
      campaignGoal: 'Urgent Flash Sale / Promo',
      audience: 'Growth Marketers & Agencies',
      sentiment: 'Urgent & High Energy (95%)',
      performanceScore: 92,
      suggestedHashtags: ['#GrowthHacks', '#MarketingTools', '#SaaSDeals', '#SummerPromo', '#Automation']
    },
    {
      id: 'var-3',
      title: 'Gourmet Culinary Experience Flyer',
      headline: 'Handcrafted Chef Tasting Menu & Organic Vintage Wine Pairing',
      description: 'Reserve your table for an exclusive weekend culinary journey featuring farm-fresh organic ingredients and artisanal dessert pairings.',
      ctaText: 'Reserve Your Table Online',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      aspectRatio: '1:1',
      colorTheme: 'Onyx Gold Luxury',
      bgGradient: 'from-amber-950 via-slate-950 to-stone-900',
      campaignGoal: 'Lead Generation',
      audience: 'Food Enthusiasts & Diners',
      sentiment: 'Sophisticated & Indulgent (96%)',
      performanceScore: 94,
      suggestedHashtags: ['#GourmetDining', '#ChefSpecial', '#FineDining', '#Foodie', '#WinePairing']
    }
  ]);

  const [promptInput, setPromptInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('Product Launch & Feature Highlight');
  const [selectedPalette, setSelectedPalette] = useState('Cyber Purple');
  const [isGenerating, setIsGenerating] = useState(false);

  // Social Scheduler Modal State inside Ad Studio
  const [selectedVariantForSocial, setSelectedVariantForSocial] = useState<CreativeVariant | null>(null);
  const [schedulePlatforms, setSchedulePlatforms] = useState<string[]>(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN']);
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
        title: `AI Branded Asset: ${topic.slice(0, 30)}`,
        headline: `Transform Operations with Branded ${topic}`,
        description: `Deliver peak engagement and measurable return on investment using our automated ${topic} workflows. Powered by AI Studio intelligence.`,
        ctaText: `Explore ${topic.slice(0, 15)} Today`,
        imageUrl: randomImg,
        aspectRatio: '1:1',
        colorTheme: selectedPalette,
        bgGradient: paletteObj.bg,
        campaignGoal: selectedGoal,
        audience: 'Targeted High-Intent Prospects',
        sentiment: 'High Converting & Engaging (96%)',
        performanceScore: Math.floor(Math.random() * 8) + 91,
        suggestedHashtags: [`#${topic.replace(/\s+/g, '')}`, '#MarketForge', '#Automation', '#BrandedDesign', '#GrowthOps']
      };

      setVariants([newVariation, ...variants]);
      setPromptInput('');
      setIsGenerating(false);
      setToastMsg(`Generated branded image design for "${topic}"!`);
      setTimeout(() => setToastMsg(null), 3000);
    }, 1200);
  };

  const handleDispatchToScheduler = () => {
    if (!selectedVariantForSocial) return;

    setToastMsg(`Successfully scheduled "${selectedVariantForSocial.title}" to ${schedulePlatforms.join(', ')} for ${scheduleDate}!`);
    setSelectedVariantForSocial(null);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Intro Header */}
      <section className="bg-[#0e101a] border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /> Creative Ad Studio & Branded Variation Forge
          </h2>
          <p className="text-xs text-slate-400">
            Synthesize branded image designs, color variations, headlines, and call-to-actions, then directly publish or schedule them in the Social Engine.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-purple-950/60 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-xl shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Direct Link to Social Engine Active
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ad Design Generator Controls - 5 columns */}
        <div className="lg:col-span-5 bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Megaphone className="w-4 h-4 text-purple-400" /> AI Branded Asset Generator
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

            {/* Brand Palette Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Palette className="w-3 h-3 text-purple-400" /> Branded Theme & Palette
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
                Product, Service, or Event Description
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
                  <Cpu className="w-4 h-4 animate-spin" /> SYNTHESIZING BRANDED VARIATION...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> GENERATE BRANDED IMAGE & COPY
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/5 pt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>COLLECTION: UNSPLASH FREE ASSETS</span>
            <span className="text-emerald-400 font-bold">100% UNLIMITED</span>
          </div>
        </div>

        {/* Branded Ad Asset Cards List - 7 columns */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Generated Branded Image Designs ({variants.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Ready for Social Engine Scheduler</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
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
                    {item.colorTheme}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 text-center">
                    <p className="text-[10px] font-bold text-amber-300 truncate">{item.ctaText}</p>
                  </div>
                </div>

                {/* Content Details & Scheduler Direct Link */}
                <div className="p-4 md:w-7/12 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider">{item.campaignGoal}</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {item.performanceScore}% Score
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{item.headline}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{item.description}</p>
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
                      <Share2 className="w-3.5 h-3.5" /> Schedule in Social Engine
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIRECT SOCIAL SCHEDULER MODAL */}
      {selectedVariantForSocial && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4">
          <div className="bg-[#0e101a] border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-xl p-6 font-sans space-y-5 animate-zoom-in text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                Dispatch Branded Design to Social Engine
              </h4>
              <button onClick={() => setSelectedVariantForSocial(null)} className="text-slate-400 hover:text-white">
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

            {/* Platform Checkboxes */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Select Target Social Networks</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'INSTAGRAM', name: 'Instagram', icon: <Instagram className="w-3.5 h-3.5 text-pink-500" /> },
                  { id: 'FACEBOOK', name: 'Facebook', icon: <Facebook className="w-3.5 h-3.5 text-blue-500" /> },
                  { id: 'LINKEDIN', name: 'LinkedIn', icon: <Share2 className="w-3.5 h-3.5 text-sky-400" /> },
                  { id: 'TWITTER', name: 'Twitter / X', icon: <Twitter className="w-3.5 h-3.5 text-slate-300" /> }
                ].map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => {
                      if (schedulePlatforms.includes(net.id)) {
                        setSchedulePlatforms(schedulePlatforms.filter(p => p !== net.id));
                      } else {
                        setSchedulePlatforms([...schedulePlatforms, net.id]);
                      }
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center justify-between ${
                      schedulePlatforms.includes(net.id)
                        ? 'bg-purple-900/50 border-purple-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">{net.icon} {net.name}</span>
                    {schedulePlatforms.includes(net.id) && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Date & Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Optimal Schedule Timestamp
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
                disabled={schedulePlatforms.length === 0}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Confirm & Dispatch to Social Engine
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

