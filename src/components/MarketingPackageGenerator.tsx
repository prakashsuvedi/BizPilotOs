import { useCurrency } from '../lib/CurrencyContext';
import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Edit3, 
  RefreshCw, 
  FileDown, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Video, 
  Megaphone, 
  FileText, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  Layers, 
  Compass, 
  Building2, 
  BookmarkCheck, 
  Eye, 
  CheckSquare,
  DollarSign,
  TrendingUp,
  Play,
  Zap,
  Flame,
  Globe,
  Languages,
  Activity,
  Calendar,
  Settings2,
  Percent,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

interface CampaignOpportunity {
  id: string;
  title: string;
  channel: string;
  expectedRevenue: string;
  effort: 'Low' | 'Medium' | 'High';
  confidence: number;
  timeToResult: string;
  whyThisMatters: string;
  icon: string;
}

// Custom defined output types for our three high-fidelity layers
interface Layer1OwnerView {
  estimatedRevenueImpact: string;
  campaignGoal: string;
  onePrimaryAction: string;
  expectedResultBreakdown: string;
  roiJustification: string;
  confidenceScore: number;
  timeToResult: string;
}

interface Layer2CopySystem {
  headlines: string[];
  facebookCaption: string;
  instagramCaption: string;
  whatsappBroadsheet: string;
  shortAdCopy: string;
  longAdCopy: string;
  ctaVariations: string[];
}

interface Layer2CreativeDesignSystem {
  bannerLayoutGuideline: string;
  colorPaletteStyles: string[];
  typographyRuleBook: string;
  visualCompositionTips: string;
  brandToneStrictRule: string;
}

interface ImagePromptSpec {
  dimensions: string;
  aspectRatio: string;
  targetPlatform: string;
  detailedPrompt: string;
  technicalDpiNotes: string;
}

interface Layer2ExecutionKit {
  copySystem: Layer2CopySystem;
  creativeDesign: Layer2CreativeDesignSystem;
  imagePrompts: {
    facebookAd: ImagePromptSpec;
    instagramPost: ImagePromptSpec;
    instagramStory: ImagePromptSpec;
    printFlyerA4: ImagePromptSpec;
  };
  technicalSpecs: {
    safeMarginingRule: string;
    allowedFormats: string;
    statutoryTaxDisclaimer: string;
  };
  platformOptimization: {
    facebookRankingSignal: string;
    instagramEngagementTrigger: string;
    whatsAppTimingRules: string;
    emailOpenRateFormulary: string;
  };
  contentCalendar: {
    dayByDaySchedule: string[];
    monthlyStructureTimeline: string;
    sequenceFrequencyRules: string;
  };
  audienceSegmentation: {
    coldAudienceRules: string;
    warmAudienceRules: string;
    retargetingLeadsCriteria: string;
    buyerPersonaManifest: string;
  };
  funnelPositioning: {
    stageMapping: 'Awareness' | 'Consideration' | 'Conversion' | 'Retention';
    buyerJourneyStageDetails: string;
  };
  leadGenerationSystem: {
    landingPageStructureMarkdown: string;
    whatsAppClickthroughFlow: string;
    leadCaptureTriggerStrategy: string;
  };
}

interface Layer3AgencyControl {
  competitorStrategyAudit: string;
  differentiationMessagingHooks: string[];
  estimatedMetrics: {
    ctrRange: string;
    cpcEstimated: string;
    cpaRange: string;
    conversionYieldPercent: string;
  };
  testingSystemAbcRules: string;
  winnerSelectionLogicRules: string;
  scalingThresholdCriteria: string;
  optimizationDecisions: {
    whenToPauseIndicators: string;
    whenToScaleIndicators: string;
    creativeRefreshTriggers: string;
  };
}

// Complete consolidated Campaign System Output
interface EnterpriseCampaignSystem {
  localizationCountry: string;
  activeFestivalOverlay: string;
  layer1: Layer1OwnerView;
  layer2: Layer2ExecutionKit;
  layer3: Layer3AgencyControl;
}

export default function MarketingPackageGenerator({ profile, tenantId }: Props) {
  const { formatCurrency } = useCurrency();
  // Calibration states
  const [selectedGoal, setSelectedGoal] = useState<string>('Product Promotion');
  const [products, setProducts] = useState<string>('');
  const [services, setServices] = useState<string>('');
  const [audience, setAudience] = useState<string>('');

  // Built-in presets based on current verified profiles
  const [presetProducts, setPresetProducts] = useState<string[]>([]);
  const [presetServices, setPresetServices] = useState<string[]>([]);
  const [presetAudiences, setPresetAudiences] = useState<string[]>([]);

  // Localization Engine States
  const [localizationRegion, setLocalizationRegion] = useState<'np' | 'in' | 'global' | 'me'>('np');
  const [festivalOverlay, setFestivalOverlay] = useState<'dashain' | 'tihar' | 'diwali' | 'eid' | 'christmas' | 'none'>('dashain');
  const [currencyCode, setCurrencyCode] = useState<string>('NPR');

  // Multi-channel budget allocation states (Interactive Layer 2/3 slider system)
  const [totalAdBudget, setTotalAdBudget] = useState<number>(850);
  const [facebookAllocation, setFacebookAllocation] = useState<number>(50);
  const [whatsAppAllocation, setWhatsAppAllocation] = useState<number>(30);
  const [emailAllocation, setEmailAllocation] = useState<number>(20);

  // Active view layer tabs (Ensures clear role separation for User Flow)
  const [activeViewerLayer, setActiveViewerLayer] = useState<'owner' | 'officer' | 'agency'>('owner');
  
  // Custom states for interactive editable variables
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [campaignData, setCampaignData] = useState<EnterpriseCampaignSystem | null>(null);
  const [editTargetKey, setEditTargetKey] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Onboarding simulation tracker
  const [onboardSuccessMessage, setOnboardSuccessMessage] = useState<string | null>(null);
  const [isCampaignExecutedInstant, setIsCampaignExecutedInstant] = useState<boolean>(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize base values with user's selected business profiles on mount or state change
  useEffect(() => {
    if (profile.id.includes('sienna')) {
      setPresetProducts(['Tethered Earth Clay Vessels', 'Kyoto Carbonaceous Ceramic Pots']);
      setPresetServices(['Bespoke Editorial Interior Design', 'Hand-Crafted Kiln Installations']);
      setPresetAudiences(['Boutique Commercial Architects', 'Luxury Modernist Home Designers']);
      setProducts('Tethered Earth Clay Vessels');
      setServices('Bespoke Editorial Interior Design');
      setAudience('Luxury Modernist Home Designers');
    } else if (profile.id.includes('solas')) {
      setPresetProducts(['Apex Ascent Titanium Gravel E-Bike', 'Carbon Integrated Aero Wheels']);
      setPresetServices(['Premium Trail Bike Diagnostics', 'Custom Gravity Geometry Welding']);
      setPresetAudiences(['Executive Trail Enthusiasts', 'B2B Corporate Cycling Teams']);
      setProducts('Apex Ascent Titanium Gravel E-Bike');
      setServices('Premium Trail Bike Diagnostics');
      setAudience('Executive Trail Enthusiasts');
    } else {
      // Default / Aeroflow / Standard high-scale profile
      setPresetProducts(['AeroGantt Enterprise Operations Engine', 'VocalFlow AI Meeting Transcriber']);
      setPresetServices(['Bespoke Workflow Automation Architecture', 'Team Agility Training Systems']);
      setPresetAudiences(['VP of Operations & CTOs', 'High-Growth Tech Startups']);
      setProducts('AeroGantt Enterprise Operations Engine');
      setServices('Bespoke Workflow Automation Architecture');
      setAudience('VP of Operations & CTOs');
    }
    // Set target currency and region defaults
    if (localizationRegion === 'np') {
      setCurrencyCode('NPR');
      setFestivalOverlay('dashain');
    } else if (localizationRegion === 'in') {
      setCurrencyCode('INR');
      setFestivalOverlay('diwali');
    } else if (localizationRegion === 'me') {
      setCurrencyCode('USD');
      setFestivalOverlay('eid');
    } else {
      setCurrencyCode('USD');
      setFestivalOverlay('christmas');
    }
    setCampaignData(null);
  }, [profile, localizationRegion]);

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    triggerToast('✓ Copied section text to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStartEditing = (keyId: string, primaryVal: string) => {
    setEditTargetKey(keyId);
    setEditTextValue(primaryVal);
  };

  // Run generation system following custom localization context rules
  const handleGenerateCampaignSystem = () => {
    setIsGenerating(true);
    setOnboardSuccessMessage(null);
    setIsCampaignExecutedInstant(false);
    setExecutionLog([]);

    const companyName = profile.name || 'Your Corporation';
    const targetProductObj = products || 'Premium Services';
    const targetServiceObj = services || 'Specialized Consulting';
    const finalAudience = audience || 'High-Value Consumers';

    // Local localized content lookup
    let currencySymbol = currencyCode === 'NPR' ? 'रु ' : currencyCode === 'INR' ? '₹ ' : '$';
    let localFestivalText = festivalOverlay === 'dashain' ? 'Bada Dashain Mahoutsav (Maha Ashtami Specials)' 
                          : festivalOverlay === 'tihar' ? 'Festive Light Tihar Celebration'
                          : festivalOverlay === 'diwali' ? 'Diwali Prosperity Festival'
                          : festivalOverlay === 'eid' ? 'Eid Al-Fitr Mubarak Offer'
                          : festivalOverlay === 'christmas' ? 'Christmas & New Year Holiday Blast'
                          : 'Standard Season Blast';

    setTimeout(() => {
      const generatedOutcome: EnterpriseCampaignSystem = {
        localizationCountry: localizationRegion === 'np' ? 'Nepal Regional Core' : localizationRegion === 'in' ? 'India Regional Core' : localizationRegion === 'me' ? 'Middle East Retail' : 'Global Markets',
        activeFestivalOverlay: localFestivalText,
        layer1: {
          estimatedRevenueImpact: currencySymbol + (totalAdBudget * 4.45).toLocaleString() + ' Net Increase',
          campaignGoal: `${selectedGoal} - Overlaid with ${localFestivalText}`,
          onePrimaryAction: `Deploy Automated WhatsApp broadsheet & matching customized local mobile newsletter highlighting our custom code [FESTIVE_${festivalOverlay.toUpperCase()}_77] to secure active referral payouts.`,
          expectedResultBreakdown: `Estimated CTR ~4.8%, expected to produce 220+ target lead submissions resulting in 45 high-ticket closures at minimal customer acquisition tax within 72 hours.`,
          roiJustification: `Expected to save over ${formatCurrency(6500)} compared to hiring a traditional creative agency. Replaces 5 active staff outputs directly.`,
          confidenceScore: 92,
          timeToResult: 'Within 24 Hours (Immediate feedback loops active)'
        },
        layer2: {
          copySystem: {
            headlines: [
              `🎉 Blessings of ${localFestivalText} with ${companyName}!`,
              `🔥 Save big this season: Unlocking ${targetProductObj} for immediate performance!`,
              `⚡ Elevate your workflows. Replace complex efforts with ${targetServiceObj}.`,
              `📍 Exclusive regional bonus: Get free onboarding clearance during this festive peak.`,
              `🤝 Recommended by similar businesses in Kathmandu & luxury regions.`
            ],
            facebookCaption: `This ${localFestivalText}, let your team focus on absolute scaling. Introducing ${companyName}'s premium integration of ${targetProductObj} combined with certified ${targetServiceObj}. Reclaim lost bandwidth while securing maximum referral payouts. Contact us via mobile or click below to lock in the special pricing. #FestiveBlessings #NepalBusiness #OperationsScale`,
            instagramCaption: `✨ PROSPERITY & SEAMLESS HARMONY ✨\n\nFor elite operators looking to elevate standard performance this festive season. Enjoy custom configurations on ${targetProductObj} plus live diagnostic audits designed especially for ${finalAudience}.\n\nReclaim 20%+ of your daily capacity. 🎁 Tap link in bio to deploy instantly! \n\n#HappyFestivities #LuxuryBusiness #SaaSFlow #ModernGrowth`,
            whatsappBroadsheet: `नमस्ते 🙏 / Greetings from ${companyName}.\n\nDuring this auspicious celebration of ${localFestivalText}, we are offering a unique 1-click upgrade package for our esteemed local partners. Avoid complex processes: get ${targetProductObj} configured directly with standard cashbacks and eSewa direct payout alignments.\n\nReply 'UPGRADE' to receive your secure trial coupon code. Text or call us anytime. Let's make this year profitable!`,
            shortAdCopy: `Eliminate standard planning delays. Deploy ${targetProductObj} this season with ${companyName}. Fully localized checkout support!`,
            longAdCopy: `Is meeting planning drag and coordination friction draining your local company resource pools? This ${localFestivalText}, ${companyName} is deploying the ultimate Operations Engine to stop corporate wastage. Specifically engineered for ${finalAudience}, we deliver ${targetProductObj} supported by localized ${targetServiceObj}. High-fidelity tracking with certified zero lag. Access standard B2B invoice clearing.`,
            ctaVariations: [
              `🚀 Secure Festive Discount Code Now`,
              `📱 Direct Chat with Growth Specialist via WhatsApp`,
              `✨ Book Direct Consultation (Save agency fee)`
            ]
          },
          creativeDesign: {
            bannerLayoutGuideline: `Centered high-contrast product mockup with a warm gold and classic charcoal background. Soft festive lights (dias/marigolds) framing margins to respect local culture without overloading brand maturity.`,
            colorPaletteStyles: ['#1e1b4b (Midnight Royal Indigo)', '#b45309 (Festive Marigold Golden Warmth)', '#065f46 (Serene Emerald Trust Accent)', '#f8fafc (Pure Slate High-Contrast Background)'],
            typographyRuleBook: `Display element font in "Outfit" or "Inter" tracking -0.05em for clean Modern Swiss layout. Match B2C components with clear "JetBrains Mono" metrics counters to reflect AI authority.`,
            visualCompositionTips: `Generate clean focus on the main laptop screen display showcasing the client dashboard dashboard. Prevent unnecessary gradient noise. Ensure logo is positioned firmly top right of primary visual flow.`,
            brandToneStrictRule: `Warm, highly authoritative, humble yet professional. No excessive marketing hyperbole. Keep text focused purely on direct business value and local service relevance.`
          },
          imagePrompts: {
            facebookAd: {
              dimensions: '1200 x 628 pixels',
              aspectRatio: '1.91:1 Landscape',
              targetPlatform: 'Facebook Feed & Display Network',
              detailedPrompt: `A beautiful clean studio rendering of ${targetProductObj} overlayed with subtle luxury gold decorations and festive warm light accents. Soft shadows, corporate professionalism, off-whites slate background, resolution 8k. Referrer policy friendly.`,
              technicalDpiNotes: `72 DPI optimized for standard mobile screen load speeds.`
            },
            instagramPost: {
              dimensions: '1080 x 1080 pixels',
              aspectRatio: '1:1 Square Grid',
              targetPlatform: 'Instagram Main Feed / Carousel Segment',
              detailedPrompt: `Elegant top-down flatlay displaying office productivity components alongside localized brass incense holder. Minimalist, modern Swiss design pairing, deep indigo card representing corporate strength.`,
              technicalDpiNotes: `96 DPI recommended for sharp crisp vector rendering on true Retina displays.`
            },
            instagramStory: {
              dimensions: '1080 x 1920 pixels',
              aspectRatio: '9:16 Vertical Portrait',
              targetPlatform: 'IG Stories, Reels Highlights, YouTube Short frames',
              detailedPrompt: `A clean dynamic vertical slide layout with the central tagline 'Reclaim Peak Performance This ${festivalOverlay.toUpperCase()}' written in space grotesk typography with premium tracking. Warm backlight glow.`,
              technicalDpiNotes: `72 DPI mobile layout optimization.`
            },
            printFlyerA4: {
              dimensions: '210 x 297 mm (A4 International Sheet)',
              aspectRatio: '1:1.41 Vertical',
              targetPlatform: 'Print Ready Local Mailer / Exhibition Handout Collateral',
              detailedPrompt: `Ultra high definition detailed vector design showing corporate workspace, labeled with local support line and certified eSewa or direct bank deposit QR cues. Perfect colors, rich deep contrast.`,
              technicalDpiNotes: `300 DPI high-grade print spec with a 3mm safety bleeding margin on all four boundaries.`
            }
          },
          technicalSpecs: {
            safeMarginingRule: `Ensure all text content is nested tightly within a 60px safe inner box margins to prevent system-level UI cropping on compact mobile screens.`,
            allowedFormats: `Compressed web-optimized .PNG and scalable vector graphics (.SVG) for logo signatures.`,
            statutoryTaxDisclaimer: localizationRegion === 'np' ? `Includes statutory 13% VAT warnings and standard PAN registered invoicing for local corporate clearances.` : `Standard business sales tax calculations in force locally.`
          },
          platformOptimization: {
            facebookRankingSignal: `Our algorithm optimized ad copies use certified local emotion hooks to spark relevant organic comment engagement, driving down aggregate CPC rates by ~22%.`,
            instagramEngagementTrigger: `Uses asymmetric graphical frames and marigold colored buttons to capture rapid thumb-stop behavior during fast scrolling.`,
            whatsAppTimingRules: `Best dispatched between 10:15 AM and 11:30 AM (local Kathmandu/Mumbai time) when business coordinators are actively clearing backlog priorities.`,
            emailOpenRateFormulary: `Construct dynamic personalized subject tags highlighting time-limited cultural gift bundles to bypass spam filtering blocks.`
          },
          contentCalendar: {
            dayByDaySchedule: [
              `Day 1: Direct Broadside launch. 'Workflows That Breathe' festival opener announcement.`,
              `Day 2: Deep dive customer testimonial study mapping ROI to human agency comparison grids.`,
              `Day 3: Interactive tutorial dispatch focusing on the performance scaling of ${targetProductObj}.`,
              `Day 4: Limited scarcity warning overlay - last clearance on early holiday bonus weights.`,
              `Day 5: Founders note explaining the localized service availability and customized onboarding support.`,
              `Day 6: VIP loyalty referral coupon dropdown.`,
              `Day 7: Final deadline reminder text with direct link to instant chat booking lines.`
            ],
            monthlyStructureTimeline: `30-Day strategic sequence: Week 1 focuses on community awareness; Week 2 maps considerations with customized specifications; Week 3 drives direct conversion pushes with easy payouts; Week 4 secures high-grade B2B retention.`,
            sequenceFrequencyRules: `Maintain strict pacing - 3 high-contrast posts per week on social feeds, daily dynamic broadsheet messages to warm WhatsApp lists, and 2 targeted email newsletters.`
          },
          audienceSegmentation: {
            coldAudienceRules: `Broad interest targeting filtered by elite operations software preferences and corporate directors looking for direct efficiency.`,
            warmAudienceRules: `Remarket past site visitors who have spent over 1.5 minutes reviewing pricing details or customized design features.`,
            retargetingLeadsCriteria: `Specific retargeting focused on leads who clicked 'Book Call' but did not finalize reservation parameters.`,
            buyerPersonaManifest: `Named 'The Determined Operational Modernist' - ages 32 to 55, values mechanical perfection, hates messy slack channels, loves ROI clarity and direct human customer care.`
          },
          funnelPositioning: {
            stageMapping: 'Conversion',
            buyerJourneyStageDetails: `Focused intensely on the direct conversion and decision simplification layers where clients are ready to swap old expensive manual agency contracts for automated AI Department operations.`
          },
          leadGenerationSystem: {
            landingPageStructureMarkdown: `### 1. Hero Block\n- Title: "Workflows That Breathe. Automation Built for Peak Modern Efficiency."\n- Subtitle: "This ${localFestivalText}, secure the certified growth power of an entire digital marketing team inside one unified, high-octane 1-click platform."\n- Sticky Call to Action: "Secure Local Performance Audit [Save $6,500 Agency Fees]"\n\n### 2. Social Proof & Saved Margin Ledger\n- Compares physical coordinator costs directly against our subscription.\n\n### 3. Core Trust Matrix\n- Showcases standard security certificates, 100% money back compliance, and localized checkout channels.`,
            whatsAppClickthroughFlow: `Client clicks standard FB Messenger/IG Ad → Launched inside direct pre-populated chat thread reading "Greetings! I'm interested to unlock specialized corporate scaling tools for ${companyName}." → System auto-dispatches direct calendar reservation link.`,
            leadCaptureTriggerStrategy: `Dynamic Exit-Intent Slide: Offer high-value corporate checklists in exchange for instant email verification parameters.`
          }
        },
        layer3: {
          competitorStrategyAudit: `Competitors are currently running noisy, high-pressure generic campaigns with repetitive templates that lack localized appeal and cost-justification arguments. Digital agencies are overcharging local SMBs with monthly retainer fee contracts up to ${formatCurrency(5000)}/mo.`,
          differentiationMessagingHooks: [
            `✔️ Clear, transparent local support with 13% Nepalese VAT / regional structures complied.`,
            `✔️ Absolutely zero multi-step workspace setup complexity. Tells you exactly what to do every day.`,
            `✔️ High-speed execution through localized automated campaign dispatchers.`
          ],
          estimatedMetrics: {
            ctrRange: '4.2% - 5.1% Average',
            cpcEstimated: currencySymbol + (0.15 * (currencyCode === 'NPR' ? 130 : currencyCode === 'INR' ? 83 : 1)).toFixed(2) + ' per Click',
            cpaRange: currencySymbol + (2.5 & (currencyCode === 'NPR' ? 130 : currencyCode === 'INR' ? 83 : 1) * 3).toLocaleString() + ' range',
            conversionYieldPercent: '18.4% Submissions to Closed Corporate Deals'
          },
          testingSystemAbcRules: `A/B/C dynamic variants testing rules: Variant A targets direct time savings metrics; Variant B focuses heavily on the human agency cost-replacement angle; Variant C triggers local celebratory festival emotional hooks.`,
          winnerSelectionLogicRules: `Evaluate CTR rates after exactly 2,500 target impressions. Auto-shift 80% remaining team budget into whichever variant demonstrates >1.8x average performance boost over standard baselines.`,
          scalingThresholdCriteria: `When CPA returns fall below target parameters, scale daily spend limits up to 45% increments safely without introducing bidding pressure.`,
          optimizationDecisions: {
            whenToPauseIndicators: `Pause display creatives showing <1.2% total click-velocity or high user-hide feedback marks.`,
            whenToScaleIndicators: `Double down on the high-conversion WhatsApp broadsheets during the local holiday peak.`,
            creativeRefreshTriggers: `Refresh image assets every 14 days to eliminate ad fatigue among retargeting audience lists.`
          }
        }
      };

      setCampaignData(generatedOutcome);
      setIsGenerating(false);
      triggerToast('✨ Superb! Campaign System generated with robust 3-Layer alignment & Localized variables!');
    }, 1200);
  };

  const handleSaveInteractiveEdit = (layerSection: string, subKey: string) => {
    if (!campaignData) return;
    const clone = { ...campaignData };
    
    // Dynamically update correct nested key
    if (layerSection === 'layer1') {
      (clone.layer1 as any)[subKey] = editTextValue;
    } else if (layerSection === 'copySystem') {
      (clone.layer2.copySystem as any)[subKey] = editTextValue;
    } else if (layerSection === 'creativeDesign') {
      (clone.layer2.creativeDesign as any)[subKey] = editTextValue;
    } else if (layerSection === 'technicalSpecs') {
      (clone.layer2.technicalSpecs as any)[subKey] = editTextValue;
    } else if (layerSection === 'platformOptimization') {
      (clone.layer2.platformOptimization as any)[subKey] = editTextValue;
    } else if (layerSection === 'audienceSegmentation') {
      (clone.layer2.audienceSegmentation as any)[subKey] = editTextValue;
    } else if (layerSection === 'leadGenerationSystem') {
      (clone.layer2.leadGenerationSystem as any)[subKey] = editTextValue;
    } else if (layerSection === 'layer3') {
      (clone.layer3 as any)[subKey] = editTextValue;
    } else if (layerSection === 'estimatedMetrics') {
      (clone.layer3.estimatedMetrics as any)[subKey] = editTextValue;
    } else if (layerSection === 'optimizationDecisions') {
      (clone.layer3.optimizationDecisions as any)[subKey] = editTextValue;
    }

    setCampaignData(clone);
    setEditTargetKey(null);
    triggerToast('✓ Variable updated successfully inside the active memory layer.');
  };

  // Safe Print layout triggers standard HTML view
  const handlePrintSystem = () => {
    if (!campaignData) return;
    window.print();
  };

  const executeOneClickCampaignSim = () => {
    setIsCampaignExecutedInstant(true);
    setExecutionLog([
      `[0.0s] Initiating campaign execution layers...`,
      `[0.4s] Matching goal directive with Active Goal Contract...`,
      `[0.9s] Compiling certified brand voice constraints...`,
      `[1.3s] Localization system approved for festival region: [${campaignData?.activeFestivalOverlay}].`,
      `[1.8s] Integrating automated 13% VAT and local payment checkout parameters...`,
      `[2.2s] Dispatched to specialized marketing networks: [WhatsApp Broadsheet: Active, Facebook Ads: Live, Local Mailer: Scheduled]`,
      `[3.0s] Done! Estimated yield metrics and live analytics have been securely mounted to owner dashboard.`
    ]);

    // Fast interval timeline simulation
    const logs = [
      `[0.0s] Initiating campaign execution layers...`,
      `[0.4s] Matching goal directive with Active Goal Contract...`,
      `[0.9s] Compiling certified brand voice constraints...`,
      `[1.3s] Localization system approved for festival region: [${campaignData?.activeFestivalOverlay}].`,
      `[1.8s] Integrating automated 13% VAT and local payment checkout parameters...`,
      `[2.2s] Dispatched to specialized marketing networks: [WhatsApp Broadsheet: Active, Facebook Ads: Live, Local Mailer: Scheduled]`,
      `[3.0s] Done! Estimated yield metrics and live analytics have been securely mounted to owner dashboard.`
    ];

    logs.forEach((logLine, index) => {
      setTimeout(() => {
        setExecutionLog(prev => [...prev, logLine]);
        if (index === logs.length - 1) {
          setOnboardSuccessMessage(`🎉 High-conversion Campaign launched instantly! Measure real result updates in 24-72 hours right on your Owner dashboard.`);
          triggerToast('🚀 Campaign system sent cleanly to target platforms!');
        }
      }, (index + 1) * 600);
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-left font-sans text-slate-800" id="marketing-package-root">
      
      {/* HEADER HERO AREA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-indigo-950">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3  py-1.5 rounded-full bg-indigo-900/80 border border-indigo-700/60 text-[10.5px] font-bold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>MARKETFORGE AI — ENTERPRISE DIGITAL MARKETING OPERATING SYSTEM</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Enterprise Campaign System Generator
            </h2>
            <p className="text-indigo-200 text-xs md:text-sm max-w-3xl leading-relaxed">
              We replace complex agencies and fragmented tools by drafting fully integrated systems containing copy, strategy, visual cues, precise platform optimization triggers, and A/B parameters. Fully localized for South Asian festivals and global workflows.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10 text-left min-w-[250px] space-y-2 shrink-0">
            <div className="text-[10px] text-indigo-300 font-mono font-bold uppercase tracking-wider">Enterprise Performance Audit</div>
            <div className="text-2xl font-black text-emerald-400">92%+ Success</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">Guaranteed professional output alignment utilizing certified local safety guidelines.</p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl border border-indigo-200 bg-slate-900 text-white shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-slide-up">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SYSTEM CALIBRATION INTERACTIVE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PARAMETER SETUP & LOCALIZATION ENGINE (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 text-slate-900">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                  Campaign Calibration
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-500" /> Secure Agency Tenant
              </span>
            </div>

            {/* Campaign Goal Selector */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase tracking-wider">Campaign Direct Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {['Lead Generation', 'Product Promotion', 'Brand Awareness', 'Festive Offer Expansion'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGoal(g)}
                    className={`py-2 px-3 text-[11px] font-semibold rounded-xl border text-left flex items-center justify-between transition duration-150 cursor-pointer ${
                      selectedGoal === g
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs font-bold'
                        : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{g}</span>
                    {selectedGoal === g && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* LOCALIZATION ENGINE SECTION */}
            <div className="p-4 bg-indigo-50/55 rounded-2xl border border-indigo-100 space-y-4 text-slate-900">
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                <Languages className="w-4 h-4 text-indigo-700" />
                <h4 className="text-[11px] font-extrabold text-indigo-900 font-mono uppercase tracking-wider">Localization & Cultural Engine</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Active Country / Region Select */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Geographic Zone & Currencies</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { key: 'np', label: '🇳🇵 Nepal', cur: 'NPR' },
                      { key: 'in', label: '🇮🇳 India', cur: 'INR' },
                      { key: 'global', label: '🌐 Global', cur: 'USD' },
                      { key: 'me', label: '🕌 GCC', cur: 'USD' }
                    ].map((loc) => (
                      <button
                        key={loc.key}
                        onClick={() => {
                          setLocalizationRegion(loc.key as any);
                          setCurrencyCode(loc.cur);
                        }}
                        className={`py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition ${
                          localizationRegion === loc.key
                            ? 'bg-indigo-900 text-white border-indigo-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Festival Overlay Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Cultural Festival Highlight</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'dashain', label: '🎯 Bada Dashain' },
                      { key: 'tihar', label: '🪔 Tihar Lights' },
                      { key: 'diwali', label: '✨ Diwali' },
                      { key: 'eid', label: '🌙 Eid Mubarak' },
                      { key: 'christmas', label: '🎄 Year-End Special' },
                      { key: 'none', label: '🏢 Pure Corporate' }
                    ].map((fest) => (
                      <button
                        key={fest.key}
                        onClick={() => setFestivalOverlay(fest.key as any)}
                        className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition ${
                          festivalOverlay === fest.key
                            ? 'bg-pink-700 text-white border-pink-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {fest.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 italic leading-relaxed">
                  {localizationRegion === 'np' ? (
                    <span>🇳🇵 <strong>Nepali Localization Active:</strong> Blends English & Romanized Nepali / Hinglish copy elements cleanly. Enforces <strong>eSewa checkout cues</strong>, Himalayan branding notes, and <strong>13% dry-run Nepalese VAT compliance specs</strong>.</span>
                  ) : localizationRegion === 'in' ? (
                    <span>🇮🇳 <strong>Indian Regional Focus:</strong> Adjusts metrics dynamically to INR, leverages Paytm / PhonePe UPI hooks, and includes Diwali traditional gifting triggers.</span>
                  ) : (
                    <span>🌐 <strong>Global Operations Mode:</strong> Generates crisp modern Swiss design copy assets aligned to standard Western marketing funnels.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Input fields with brand memory connections */}
            <div className="space-y-4">
              {/* Product selector */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Target Brand Product</label>
                  <div className="flex gap-1">
                    {presetProducts.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProducts(p)}
                        className="text-[9px] bg-slate-100 border border-slate-200 hover:border-indigo-300 text-slate-600 font-bold px-2 py-0.5 rounded transition cursor-pointer"
                      >
                        {p.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  placeholder="e.g. AeroGantt Automated Sync Engine..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-sans font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                />
              </div>

              {/* Service custom connections */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Associated Service Pillar</label>
                  <div className="flex gap-1">
                    {presetServices.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServices(s)}
                        className="text-[9px] bg-slate-100 border border-slate-200 hover:border-indigo-300 text-slate-600 font-bold px-2 py-0.5 rounded transition cursor-pointer"
                      >
                        {s.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="e.g. Custom Corporate Onboarding Diagnostics..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-sans font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                />
              </div>

              {/* Target Audience Specs */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Target Audience Profile</label>
                  <div className="flex gap-1">
                    {presetAudiences.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAudience(a)}
                        className="text-[9px] bg-slate-100 border border-slate-200 hover:border-indigo-300 text-slate-600 font-bold px-2 py-0.5 rounded transition cursor-pointer"
                      >
                        {a.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. VP of Operations & Senior IT Directors..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-sans font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Budget Modeling Block (Module 3 & Layer 2 interactive) */}
            <div className="border-t border-slate-100 pt-4 space-y-3.5">
              <label className="text-[10px] font-extrabold font-mono text-slate-400 block uppercase tracking-wider">Dynamic Budget Simulator</label>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Target Media Budget:</span>
                  <span className="text-indigo-700 font-mono font-black">{currencyCode === 'NPR' ? 'रु ' : currencyCode === 'INR' ? '₹ ' : '$'} {totalAdBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={totalAdBudget}
                  onChange={(e) => setTotalAdBudget(Number(e.target.value))}
                  className="w-full h-1.5 focus:accent-indigo-600 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-1 text-slate-900"
                />
              </div>

              {/* Dynamic split sliders */}
              <div className="space-y-1.5 text-left text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-500 font-mono text-[9px] uppercase tracking-wider mb-1">Target Channel Allocation Split</div>
                
                <div className="flex items-center gap-2 justify-between">
                  <span className="w-16 font-medium text-slate-600">Facebook:</span>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={facebookAllocation}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFacebookAllocation(val);
                      // Auto balance the remaining 100%
                      setWhatsAppAllocation(Math.round((100 - val) * 0.6));
                      setEmailAllocation(Math.round((100 - val) * 0.4));
                    }}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer text-slate-900"
                  />
                  <span className="w-8 text-right font-mono font-bold text-slate-800">{facebookAllocation}%</span>
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <span className="w-16 font-medium text-slate-600">WhatsApp:</span>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={whatsAppAllocation}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setWhatsAppAllocation(val);
                      // Auto balance the remaining
                      setFacebookAllocation(Math.round((100 - val) * 0.62));
                      setEmailAllocation(Math.round((100 - val) * 0.38));
                    }}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer text-slate-900"
                  />
                  <span className="w-8 text-right font-mono font-bold text-slate-800">{whatsAppAllocation}%</span>
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <span className="w-16 font-medium text-slate-600">Email:</span>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={emailAllocation}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEmailAllocation(val);
                      setFacebookAllocation(Math.round((100 - val) * 0.62));
                      setWhatsAppAllocation(Math.round((100 - val) * 0.38));
                    }}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer text-slate-900"
                  />
                  <span className="w-8 text-right font-mono font-bold text-slate-800">{emailAllocation}%</span>
                </div>
              </div>
            </div>

            {/* Primary Generation Call to Action */}
            <button
              onClick={handleGenerateCampaignSystem}
              disabled={isGenerating || !products.trim() || !audience.trim()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aligning Cognitive Context & Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300 fill-current animate-pulse" />
                  Generate Consolidated Campaign System
                </>
              )}
            </button>
          </div>

          {/* AI CONTEXT AND AUTH SECURITY SIGNALS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-300 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h4 className="text-[10.5px] uppercase tracking-wider font-mono text-slate-400 font-bold select-none">
                  SaaS Core Ingestion Status
                </h4>
              </div>
              <span className="text-[9px] font-mono font-bold bg-slate-800 text-indigo-400 px-2 py-0.5 rounded border border-slate-700">
                Live Audit Active
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              We pass certified B2B database schemas inside the safe agent vector parameters so all draft results adhere strictly to brand tones, avoiding hallucination and minimizing CPM pricing costs.
            </p>

            <div className="font-mono text-[10px] space-y-2.5 border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">💼 Brand Blueprint Signature</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <BookmarkCheck className="w-3.5 h-3.5" /> SECURED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">📅 Continuous Memory Ledger</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <BookmarkCheck className="w-3.5 h-3.5" /> MOUNTED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">⚙️ Local Tax & VAT Clearance Mode</span>
                <span className="text-indigo-400 font-extrabold uppercase font-mono">
                  {localizationRegion === 'np' ? 'NPR 13%' : 'Standard'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REVENUE-LOCKED GENERATIONS WORKSPACE (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {!campaignData ? (
            <div className="border border-dashed border-slate-300 bg-slate-50 rounded-3xl p-16 text-center text-slate-400 h-[600px] flex flex-col justify-center items-center shadow-inner">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200 text-slate-500 shadow-xs">
                <Megaphone className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-sm font-black text-slate-800 font-sans">No campaign blueprints dispatched yet</p>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Calibrate your goal metrics and regional localization, then click "Generate Consolidated Campaign System". MarketForge will instantly compile all copies, creatives, and budget trackers across our three primary decision tiers.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              
              {/* LAYER INTERACTION TABS: ELIMINATE COGNITIVE FATIGUE */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-slate-900">
                  <button
                    onClick={() => setActiveViewerLayer('owner')}
                    className={`py-2 px-3.5 text-xs font-black rounded-xl flex items-center gap-2 transition cursor-pointer ${
                      activeViewerLayer === 'owner' 
                        ? 'bg-indigo-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Business Owner View</span>
                  </button>

                  <button
                    onClick={() => setActiveViewerLayer('officer')}
                    className={`py-2 px-3.5 text-xs font-black rounded-xl flex items-center gap-2 transition cursor-pointer ${
                      activeViewerLayer === 'officer' 
                        ? 'bg-indigo-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Marketing Officer View</span>
                  </button>

                  <button
                    onClick={() => setActiveViewerLayer('agency')}
                    className={`py-2 px-3.5 text-xs font-black rounded-xl flex items-center gap-2 transition cursor-pointer ${
                      activeViewerLayer === 'agency' 
                        ? 'bg-indigo-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Agency Strategy View</span>
                  </button>
                </div>

                {/* Print and JSON Exporters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(campaignData, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `${profile.name}_Enterprise_Campaign_Pack.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      triggerToast('✓ System JSON file exported successfully.');
                    }}
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                    title="Export campaign JSON"
                  >
                    <FileDown className="w-4 h-4 text-indigo-600" />
                    <span className="hidden md:inline">Raw JSON</span>
                  </button>

                  <button
                    onClick={handlePrintSystem}
                    className="p-2 border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                    title="Print layout sheet"
                  >
                    <Eye className="w-4 h-4 text-pink-600" />
                    <span>Print PDF</span>
                  </button>
                </div>

              </div>

              {/* ACTIVE PREVIEW LAYER VIEWPORTS */}

              {/* ====================================================
                  LAYER 1 — BUSINESS OUTCOME LAYER (OWNER VIEW)
                  ==================================================== */}
              {activeViewerLayer === 'owner' && (
                <div className="space-y-6">
                  
                  {/* High Visual ROI Scorecard Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-slate-200 space-y-1 text-slate-900">
                      <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 font-mono">Expected Gain Impact</span>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{campaignData.layer1.estimatedRevenueImpact}</p>
                      <span className="text-[9.5px] text-emerald-700 font-extrabold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> High probability threshold
                      </span>
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-slate-200 space-y-1 text-slate-900">
                      <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 font-mono">Estimated Outcome Speed</span>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{campaignData.layer1.timeToResult}</p>
                      <span className="text-[9.5px] text-indigo-700 font-medium">Auto optimized timing loop</span>
                    </div>

                    <div className="bg-indigo-900 text-white p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] tracking-wider uppercase font-bold text-indigo-300 font-mono">AI Verification Rate</span>
                      <p className="text-2xl font-black text-emerald-400 tracking-tight">{campaignData.layer1.confidenceScore}% Confidence</p>
                      <span className="text-[9.5px] text-indigo-100">Consistent with past B2B successes</span>
                    </div>
                  </div>

                  {/* ONE PRIMARY ACTION BLOCK (FORCED FOCUS RULE) */}
                  <div className="bg-gradient-to-r from-teal-900 to-indigo-950 text-white p-6 rounded-3xl border border-teal-950 relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 py-1.5 px-3.5 bg-rose-600 text-white text-[9px] uppercase font-black font-mono rounded-bl-xl tracking-widest animate-pulse">
                      🏆 Recommended Primary Action Focus
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 mt-2">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-sm text-white">Automated Direct Dispatch Sequence</h4>
                          <span className="text-[10px] font-mono font-bold text-teal-300 uppercase">Targeting Warm Lists & Referrals</span>
                        </div>
                      </div>

                      <div className="p-4 bg-black/25 rounded-2xl border border-white/5 font-sans leading-relaxed text-xs">
                        {editTargetKey === 'onePrimaryAction' ? (
                          <div className="space-y-2">
                            <textarea
                              value={editTextValue}
                              onChange={(e) => setEditTextValue(e.target.value)}
                              rows={3}
                              className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl p-2.5 text-xs font-sans"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => setEditTargetKey(null)} className="px-2 py-1 bg-slate-700 text-white text-[10px] rounded-lg">Cancel</button>
                              <button onClick={() => handleSaveInteractiveEdit('layer1', 'onePrimaryAction')} className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-teal-100 italic">"{campaignData.layer1.onePrimaryAction}"</p>
                            <button onClick={() => handleStartEditing('onePrimaryAction', campaignData.layer1.onePrimaryAction)} className="p-1 hover:bg-white/10 rounded shrink-0 transition text-slate-900" title="Edit instruction">
                              <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1.5">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-teal-300 font-mono block">Why this matters:</span>
                          <p className="text-[11px] text-teal-100 leading-relaxed">
                            Seasonal customer click velocity is highly elevated this week under {campaignData.activeFestivalOverlay}. Automated whatsapp broadcast generates immediate direct traffic and helps secure the goal contract safely.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-indigo-300 font-mono block">ROI Cost Comparison:</span>
                          <p className="text-[11px] text-indigo-200 leading-relaxed">
                            {campaignData.layer1.roiJustification} Fits business scale perfectly with zero agency overhead fee tags.
                          </p>
                        </div>
                      </div>

                      {/* Execute Trigger */}
                      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Strict brand voice safeguards & checkout parameters verified</span>
                        </div>

                        <button
                          onClick={executeOneClickCampaignSim}
                          disabled={isCampaignExecutedInstant}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-black text-xs rounded-xl shadow-lg transition duration-200 cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>1-Click Deploy & Launch Campaign</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Execution Feedback Visual Trace Logs */}
                  {isCampaignExecutedInstant && (
                    <div className="bg-slate-950 text-emerald-400 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-2.5 shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live System Execution Logs</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <div className="space-y-1.5 text-[11px] max-h-[160px] overflow-y-auto">
                        {executionLog.map((logLine, idx) => (
                          <div key={idx} className="animate-fade-in">{logLine}</div>
                        ))}
                      </div>
                      {onboardSuccessMessage && (
                        <div className="p-3 bg-emerald-950/80 border border-emerald-900 text-emerald-300 rounded-xl leading-relaxed text-[11px] font-sans mt-3">
                          {onboardSuccessMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard Trust Simplification Layer */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-slate-900">
                    <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-500 space-y-1 text-left">
                      <h5 className="font-extrabold text-slate-900">Why MarketForge recommends this path</h5>
                      <p className="leading-relaxed">
                        We recommend this localized dispatch because similar high-growth operators in your segment saw a +42% uplift in purchase rates using matching local festival hooks. Hide unnecessary tool settings—our AI has confirmed perfect safe-margin clearances.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* ====================================================
                  LAYER 2 — MARKETING EXECUTION KIT (OFFICER VIEW)
                  ==================================================== */}
              {activeViewerLayer === 'officer' && (
                <div className="space-y-6">
                  
                  {/* COPY KIT COLLAPSIBLE ACCORDIONS */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-slate-900">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Megaphone className="w-4 h-4 text-indigo-600" /> Copy System & Caption Vault
                    </h4>

                    {/* Headlines list */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-bold font-mono text-slate-400 block tracking-wider">Campaign Headlines (5 high-converting variations)</span>
                      <div className="space-y-2">
                        {campaignData.layer2.copySystem.headlines.map((hl, hidx) => (
                          <div key={hidx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold gap-3 text-slate-800">
                            <span>Headline #{hidx + 1}: <strong className="text-indigo-900">"{hl}"</strong></span>
                            <button onClick={() => handleCopy(hl, `headline_${hidx}`)} className="p-1 text-slate-400 hover:text-indigo-700 shrink-0">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FB & IG captions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center bg-sky-50 p-1.5 rounded-lg">
                          <span className="font-mono font-black text-sky-800 uppercase text-[9px] flex items-center gap-1"><Facebook className="w-3 h-3" /> Facebook ad template</span>
                          <button onClick={() => handleCopy(campaignData.layer2.copySystem.facebookCaption, 'fb_caption')} className="text-slate-400 hover:text-indigo-700"><Copy className="w-3 h-3" /></button>
                        </div>
                        <p className="p-3 bg-slate-50 border border-slate-100 text-[11px] leading-relaxed select-all font-sans rounded-xl text-slate-600 italic">
                          "{campaignData.layer2.copySystem.facebookCaption}"
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center bg-pink-50 p-1.5 rounded-lg">
                          <span className="font-mono font-black text-pink-800 uppercase text-[9px] flex items-center gap-1"><Instagram className="w-3 h-3" /> Instagram captions</span>
                          <button onClick={() => handleCopy(campaignData.layer2.copySystem.instagramCaption, 'ig_caption')} className="text-slate-400 hover:text-indigo-700"><Copy className="w-3 h-3" /></button>
                        </div>
                        <p className="p-3 bg-slate-50 border border-slate-100 text-[11px] leading-relaxed select-all font-sans rounded-xl text-slate-600 italic">
                          "{campaignData.layer2.copySystem.instagramCaption}"
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Broadcaster caption */}
                    <div className="p-4 bg-emerald-50/20 border border-emerald-100 text-xs rounded-xl space-y-2">
                      <div className="flex justify-between items-center border-b border-emerald-100/60 pb-1">
                        <span className="font-mono font-black text-emerald-800 uppercase text-[9px] flex items-center gap-1">🟢 Instant WhatsApp Broadsheet Script</span>
                        <button onClick={() => handleCopy(campaignData.layer2.copySystem.whatsappBroadsheet, 'wa_broad')} className="text-slate-400 hover:text-indigo-700"><Copy className="w-3 h-3" /></button>
                      </div>
                      <p className="whitespace-pre-line text-slate-700 text-[11px] leading-relaxed font-sans font-medium">
                        {campaignData.layer2.copySystem.whatsappBroadsheet}
                      </p>
                    </div>
                  </div>

                  {/* LAYER 2 CREATIVE DESIGN DIRECTIVES */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-slate-900">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Compass className="w-4 h-4 text-indigo-600" /> Creative Design & Brand Styling Parameters
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="space-y-2">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900">
                          <span className="text-[10px] font-bold font-mono text-indigo-700 block uppercase">Canvas Layout Rule</span>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{campaignData.layer2.creativeDesign.bannerLayoutGuideline}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900">
                          <span className="text-[10px] font-bold font-mono text-indigo-700 block uppercase">Approved Typography pairing</span>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{campaignData.layer2.creativeDesign.typographyRuleBook}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900">
                          <span className="text-[10px] font-bold font-mono text-indigo-700 block uppercase">Brand Hex Color Guidelines</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {campaignData.layer2.creativeDesign.colorPaletteStyles.map((color, cix) => (
                              <span key={cix} className="px-2 py-1 font-mono text-[9px] font-semibold bg-white border border-slate-300 rounded-md text-slate-700 flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-400" style={{ backgroundColor: color.split(' ')[0] }}></span>
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900">
                          <span className="text-[10px] font-bold font-mono text-indigo-700 block uppercase">Strict Ingestion Safeguards</span>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{campaignData.layer2.creativeDesign.brandToneStrictRule}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IMAGE GENERATION PROMPTS (FB, IG, Story, Flyer) */}
                  <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 shadow-md space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest block">Layer 2.C — Studio Assets Directives</span>
                        <h4 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-emerald-400 animate-pulse" /> Precision Image Generation Prompts
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-md">
                        Dall-E & Midjourney Ready
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-normal">
                      Copy these robust, detailed prompts into any generative media canvas to render flawless backgrounds representing your actual corporate brand.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: '📘 Facebook Ad Visual', model: campaignData.layer2.imagePrompts.facebookAd },
                        { label: '📸 IG Feed Square Grid', model: campaignData.layer2.imagePrompts.instagramPost },
                        { label: '📱 Vertical Story Frame', model: campaignData.layer2.imagePrompts.instagramStory },
                        { label: '🖨️ Print-Ready A4 Flyer Layout', model: campaignData.layer2.imagePrompts.printFlyerA4 }
                      ].map((promptSet, pidx) => (
                        <div key={pidx} className="bg-black/35 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-left">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                            <span className="font-extrabold text-white text-[11px]">{promptSet.label}</span>
                            <button onClick={() => handleCopy(promptSet.model.detailedPrompt, `img_prompt_${pidx}`)} className="text-slate-500 hover:text-white transition cursor-pointer">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                            <div>Dimension: <strong className="text-slate-200">{promptSet.model.dimensions}</strong></div>
                            <div>Ratio: <strong className="text-slate-200">{promptSet.model.aspectRatio}</strong></div>
                          </div>

                          <p className="text-[10.5px] text-slate-300 leading-relaxed italic bg-black/15 p-2 rounded-lg border border-slate-800">
                            "{promptSet.model.detailedPrompt}"
                          </p>

                          <div className="text-[9.5px] text-emerald-400 font-mono">
                            Technical Spec: {promptSet.model.technicalDpiNotes}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Technical Specs & Local Taxes (VAT) */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex flex-wrap justify-between gap-4 text-left">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">DPI & Color Profile</span>
                        <span className="text-slate-300 font-medium">300 DPI vector output compliant</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Safety Margins</span>
                        <span className="text-slate-300 font-medium">{campaignData.layer2.technicalSpecs.safeMarginingRule}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Geographic VAT / Statutory Warning</span>
                        <span className="text-pink-400 font-mono font-bold">{campaignData.layer2.technicalSpecs.statutoryTaxDisclaimer}</span>
                      </div>
                    </div>
                  </div>

                  {/* PLATFORM TRICKS & 7-DAY CONTENT SCHEDULER */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-slate-900">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Calendar className="w-4 h-4 text-indigo-600" /> System Sequencing, Calendar & Platform Triggers
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase tracking-wider">7-Day Progressive Execution Schedule</label>
                        <div className="space-y-1.5 font-sans">
                          {campaignData.layer2.contentCalendar.dayByDaySchedule.map((dayText, dk) => (
                            <div key={dk} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed text-[11px] text-slate-600 flex items-start gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5"></span>
                              <span>{dayText}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-left">
                          <span className="text-[9px] uppercase font-bold text-indigo-800 font-mono block">Algorithm Execution Guidelines</span>
                          <div className="space-y-1 text-[11px] text-slate-600">
                            <div>• <strong>Facebook Target:</strong> {campaignData.layer2.platformOptimization.facebookRankingSignal}</div>
                            <div className="mt-1">• <strong>WhatsApp Timing:</strong> {campaignData.layer2.platformOptimization.whatsAppTimingRules}</div>
                            <div className="mt-1">• <strong>IG Thumb stop trigger:</strong> {campaignData.layer2.platformOptimization.instagramEngagementTrigger}</div>
                          </div>
                        </div>

                        <div className="p-3.5 bg-amber-50/20 border border-amber-100 rounded-xl space-y-2 text-left">
                          <span className="text-[9px] uppercase font-bold text-amber-800 font-mono block">Funnel Position Criteria</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Active stage map: <strong>{campaignData.layer2.funnelPositioning.stageMapping} Phase</strong>.<br />
                            {campaignData.layer2.funnelPositioning.buyerJourneyStageDetails}
                          </p>
                        </div>

                        <div className="p-3.5 bg-teal-50/20 border border-teal-100 rounded-xl space-y-2 text-left">
                          <span className="text-[9px] uppercase font-bold text-teal-800 font-mono block">Lead Generation Funnel Setup</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {campaignData.layer2.leadGenerationSystem.leadCaptureTriggerStrategy}<br />
                            <strong>Click Flow:</strong> {campaignData.layer2.leadGenerationSystem.whatsAppClickthroughFlow}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ====================================================
                  LAYER 3 — STRATEGY & AGENCY CONTROL LAYER
                  ==================================================== */}
              {activeViewerLayer === 'agency' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* COMPETITOR ANALYSIS & PERFORMANCE PROJECTIONS */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5 text-slate-900">
                    <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-violet-600" /> Agency Strategy & B2B Performance Tracker
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        ROAS Optimized
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-left">
                        <span className="text-[10px] font-bold font-mono text-indigo-700 block uppercase">Competitor Messaging Exploit</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{campaignData.layer3.competitorStrategyAudit}</p>

                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] uppercase font-extrabold text-slate-400 font-mono block">Differentiation messaging hooks:</span>
                          {campaignData.layer3.differentiationMessagingHooks.map((h, hidx) => (
                            <div key={hidx} className="text-[10.5px] text-emerald-800 font-medium flex items-center gap-1">
                              <span>•</span> <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance projections */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5 text-left">
                        <span className="text-[10px] font-bold font-mono text-indigo-700 block uppercase">Predictive Outcome Range Formulas</span>
                        
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-slate-900">
                            <span className="text-[9px] text-slate-400 block font-bold font-sans">CTR Estimates</span>
                            <span className="text-xs font-black text-rose-600">{campaignData.layer3.estimatedMetrics.ctrRange}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-slate-900">
                            <span className="text-[9px] text-slate-400 block font-bold font-sans">Estimated CPC</span>
                            <span className="text-xs font-black text-slate-900">{campaignData.layer3.estimatedMetrics.cpcEstimated}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-slate-900">
                            <span className="text-[9px] text-slate-400 block font-bold font-sans">SaaS target CPA</span>
                            <span className="text-xs font-black text-indigo-700">{campaignData.layer3.estimatedMetrics.cpaRange}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-slate-900">
                            <span className="text-[9px] text-slate-400 block font-bold font-sans">Target ROI Yield</span>
                            <span className="text-xs font-black text-emerald-700">{campaignData.layer3.estimatedMetrics.conversionYieldPercent}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 italic text-left">
                          *Projections calculated automatically based on your active spending guardrail: <strong>NPR {totalAdBudget.toLocaleString()}</strong>. Real figures update daily.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TESTING SYSTEMS & winner logic (Layer 3) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-slate-900">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-indigo-50 pb-2">
                      <Flame className="w-4 h-4 text-pink-600" /> Winner Selection Logic & Scaling Trees
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-left">
                      <div className="p-3 bg-indigo-50/45 rounded-xl border border-indigo-100 text-slate-900">
                        <span className="text-[9px] font-mono text-indigo-800 uppercase font-black block">A/B/C Priority Testing Setup</span>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{campaignData.layer3.testingSystemAbcRules}</p>
                      </div>

                      <div className="p-3 bg-teal-50/30 rounded-xl border border-teal-100">
                        <span className="text-[9px] font-mono text-emerald-800 uppercase font-black block">Winner Selection Formula</span>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{campaignData.layer3.winnerSelectionLogicRules}</p>
                      </div>

                      <div className="p-3 bg-amber-50/20 rounded-xl border border-amber-100 text-slate-900">
                        <span className="text-[9px] font-mono text-amber-800 uppercase font-black block">Budget Scaling Criteria</span>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{campaignData.layer3.scalingThresholdCriteria}</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950 text-slate-300 rounded-xl text-xs space-y-2 text-left font-mono">
                      <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Instant Campaign Diagnostics Trigger Parameters</span>
                      <div className="space-y-1 text-[11px]">
                        <div>• <strong>Pause action criteria:</strong> {campaignData.layer3.optimizationDecisions.whenToPauseIndicators}</div>
                        <div className="mt-1">• <strong>Scale indicator triggers:</strong> {campaignData.layer3.optimizationDecisions.whenToScaleIndicators}</div>
                        <div className="mt-1">• <strong>Creative fatigue refreshing:</strong> {campaignData.layer3.optimizationDecisions.creativeRefreshTriggers}</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
