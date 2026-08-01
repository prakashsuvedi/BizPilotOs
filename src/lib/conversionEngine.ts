import { clientDb } from './firebase';
import { LayoutBlueprint, UniversalCoordinateObject } from './designIntelligence';

// ==========================================
// PHASE 9C: CONVERSION INTELLIGENCE ENGINE TYPES
// ==========================================

export type CampaignGoal =
  | 'Lead Generation'
  | 'Sales'
  | 'Awareness'
  | 'Event Promotion'
  | 'Product Launch'
  | 'Recruitment'
  | 'Retention'
  | 'Upsell'
  | 'Cross Sell';

export type MarketingChannel =
  | 'Facebook'
  | 'Instagram'
  | 'LinkedIn'
  | 'WhatsApp'
  | 'Email'
  | 'Flyer'
  | 'Brochure'
  | 'Landing Page';

export interface OfferAnalysis {
  discountScore: number;
  valuePropScore: number;
  urgencyScore: number;
  scarcityScore: number;
  differentiationScore: number;
  overallScore: number; // 0-100
  recommendations: string[];
}

export interface CtaAnalysis {
  visibilityScore: number;
  clarityScore: number;
  placementScore: number;
  actionabilityScore: number;
  overallScore: number; // 0-100
  recommendations: string[];
  alternativeCtas: string[];
}

export interface PersonaAnalysis {
  fitScore: number; // 0-100
  analyzedPersona: string;
  painPointsMatched: string[];
  motivationsLeveraged: string[];
  objectionsAddressed: string[];
  audienceMismatchFlag: boolean;
  mismatchReason?: string;
  improvementTriggers: string[];
}

export interface ChannelRecommendation {
  channel: MarketingChannel;
  suitabilityScore: number; // 0-100
  layoutGuideline: string;
  copywritingFormula: string;
  pacingStyle: string;
  attentionHacks: string[];
  recommendedCanvasFormat: string;
}

export interface JuryScorecard {
  conversionPotential: number; // 1-20
  relevance: number;           // 1-20
  clarity: number;             // 1-20
  offerStrength: number;       // 1-20
  trustworthiness: number;     // 1-20
  total: number;               // 5-100
}

export interface JuryMember {
  role: 'Performance Marketer' | 'Growth Strategist' | 'Consumer Psychologist' | 'Copywriter' | 'Sales Consultant' | 'Industry Specialist';
  avatar: string;
  vocalPitch: string;
  critique: string;
  scores: JuryScorecard;
}

export interface PerformanceForecast {
  engagementPotential: 'Low' | 'Medium' | 'High';
  leadPotential: 'Low' | 'Medium' | 'High';
  conversionProbability: 'Low' | 'Medium' | 'High';
  engagementReasoning: string;
  leadReasoning: string;
  conversionReasoning: string;
  optimizedBenchmarkCrr?: number; // estimated Click-through rate
}

export interface AbTestVariant {
  variantId: 'Variant A' | 'Variant B' | 'Variant C';
  emphasis: string;
  headlineOverride: string;
  ctaOverride: string;
  offerOverride: string;
  associatedLayoutModifications: string[];
  predictedPerformanceScore: number;
}

export interface MarketingExplainability {
  whyThisWorks: string;
  targetAudienceRationale: string;
  psychologicalTriggers: string[];
  primaryConversionGoal: string;
  expectedCustomerAction: string;
}

export interface ConversionFeedbackRecord {
  id: string;
  tenantId: string;
  userId: string;
  blueprintId: string;
  campaignGoal: CampaignGoal;
  selectedVariant: string; // e.g. "Variant A"
  editedVariant: boolean;
  publishedVariant: boolean;
  userRating: number; // 1-5 stars
  recordedOffer: string;
  recordedCta: string;
  timestamp: string;
}

// ==========================================
// MAIN CONVERSION INTELLIGENCE ENGINE IMPLEMENTATION
// ==========================================

export class ConversionIntelligenceEngine {

  /**
   * Module 1: Optimize Headline, CTA, and Body texts inside elements based on CampaignGoal
   */
  public static optimizeBlueprintForGoal(
    blueprint: LayoutBlueprint,
    goal: CampaignGoal,
    offerDetails?: { discountText?: string; uniqueValueProp?: string; urgencyDeadline?: string }
  ): LayoutBlueprint {
    // Deep clone blueprint
    const optimized = JSON.parse(JSON.stringify(blueprint)) as LayoutBlueprint;

    // Optimization text mappings
    const headlineEngines: Record<CampaignGoal, string> = {
      'Lead Generation': `Unlock Instant Access: ${offerDetails?.uniqueValueProp || 'Free Business Strategy Framework'}`,
      'Sales': `Exclusive Offer: ${offerDetails?.discountText || 'Save 35%'} On Our High-Impact Solutions Today`,
      'Awareness': `Introducing Next-Gen Innovation: Redefining Global Industry Standards`,
      'Event Promotion': `Limited Seating: Join High-Growth Keynotes & Network Realtime`,
      'Product Launch': `The Future Has Arrived: Experience Our Game-Changing System`,
      'Recruitment': `Build the Future With Us: Join Our High-Performance Culture`,
      'Retention': `Thank You For Being A Loyal Partner: Claim Your Anniversary Core Bundle`,
      'Upsell': `Upgrade to Pro Engine & Maximize Throughput Limits Unconditionally`,
      'Cross Sell': `Complete Your Ecosystem: Add Automated AI Integration At Half price`
    };

    const ctaEngines: Record<CampaignGoal, string> = {
      'Lead Generation': 'Get Free Consultation',
      'Sales': 'Claim Offer Now',
      'Awareness': 'Explore Interactive Catalog',
      'Event Promotion': 'Reserve Your Seat',
      'Product Launch': 'Book Live Demonstration',
      'Recruitment': 'Apply Today',
      'Retention': 'Unwrap Reward',
      'Upsell': 'Unlock Pro Tier',
      'Cross Sell': 'Add Complementary Pack'
    };

    const bodyEngines: Record<CampaignGoal, string> = {
      'Lead Generation': `Optimize your operations risk-free. Give your email to instantly receive our high-fidelity layout parameters, comprehensive checklist and audit sheets directly to your inbox. No credit card required.`,
      'Sales': `Accelerate your direct response. Get elite standard access to our premium suite during this flash sale. Limited quantities remain available. Buy now before this high-value offer closes.`,
      'Awareness': `A unified platform engineering better user interfaces. We align typography scales, crisp vector canvases, and automated repair guidelines seamlessly so you can focus purely on visual aesthetic.`,
      'Event Promotion': `Join thousands of developers, designers, and marketing strategists online or live. Deep sessions covering conversion science, pixel-perfection, and multi-agent rendering pipeline networks.`,
      'Product Launch': `We are thrilled to unveil our self-correcting coordination interface. Built using modern React 18 and tailwind configurations, this delivers absolute structural alignment.`,
      'Recruitment': `Ready to accelerate your professional path? We are sourcing brilliant technical product engineers, design auditors, and growth architects to scale our sovereign systems world-wide.`,
      'Retention': `As our valued client, we want to expand your cloud databases and OAuth integration capacities entirely on us. Thank you for building on our platform.`,
      'Upsell': `Lift all operational overhead. Elevate to our enterprise grid, unlock custom API gateways, multi-tenant databases, 300DPI physical print offsets, and unlimited generative queries today.`,
      'Cross Sell': `Boost productivity by over 40%. Seamlessly integrate your direct design dashboard with our workspace suite, calendar schedulers, and collaborative databases for maximum performance.`
    };

    // Replace contents inside elements
    optimized.elements.forEach((el: UniversalCoordinateObject) => {
      if (el.elementId === 'headline-copyblock' || (el.type === 'text' && el.styles?.fontSize && parseInt(el.styles.fontSize) >= 24)) {
        el.content = headlineEngines[goal];
      } else if (el.elementId === 'body-narrative-block' || (el.type === 'text' && el.height >= 100)) {
        el.content = bodyEngines[goal];
      } else if (el.elementId === 'cta-action-button' || el.type === 'cta') {
        el.content = ctaEngines[goal];
      }
    });

    if (!optimized.metadata) {
      optimized.metadata = { brandPersonality: [], designerRationale: '', targetPersona: '' };
    }
    optimized.metadata.designerRationale = `Optimized mathematically for campaign objective '${goal}' utilizing high-conversion triggers, strong visual focal points, and action-oriented syntax.`;

    return optimized;
  }

  /**
   * Module 2: Offer Strength Analyzer
   */
  public static analyzeOfferStrength(headlineText: string, bodyText: string, goal: CampaignGoal): OfferAnalysis {
    // Compute indicators algorithmically based on psychological text cues
    const text = (headlineText + ' ' + bodyText).toLowerCase();
    
    let discountScore = 50; 
    let valuePropScore = 60;
    let urgencyScore = 30;
    let scarcityScore = 30;
    let differentiationScore = 55;

    // Discount signals
    if (text.includes('%') || text.includes('off') || text.includes('save') || text.includes('discount')) {
      discountScore += 35;
    }
    if (text.includes('free') || text.includes('on us') || text.includes('complimentary')) {
      discountScore += 45;
    }

    // Value Prop signals
    if (text.includes('boost') || text.includes('maximize') || text.includes('streamline') || text.includes('redefine') || text.includes('future')) {
      valuePropScore += 25;
    }
    if (text.includes('pain') || text.includes('issues') || text.includes('risk-free') || text.includes('safeguard')) {
      valuePropScore += 15;
    }

    // Urgency signals
    if (text.includes('today') || text.includes('now') || text.includes('instant') || text.includes('immediate')) {
      urgencyScore += 35;
    }
    if (text.includes('limited') || text.includes('deadline') || text.includes('expires') || text.includes('ends soon') || text.includes('flash sale')) {
      urgencyScore += 55;
    }

    // Scarcity signals
    if (text.includes('seat') || text.includes('slot') || text.includes('spaces') || text.includes('only') || text.includes('quantity')) {
      scarcityScore += 40;
    }
    if (text.includes('exclusive') || text.includes('elite') || text.includes('member-only') || text.includes('selection')) {
      scarcityScore += 25;
    }

    // Differentiation signals
    if (text.includes('next-gen') || text.includes('self-correcting') || text.includes('automated') || text.includes('pixel') || text.includes('sovereign')) {
      differentiationScore += 30;
    }

    // Cap at 100
    discountScore = Math.min(100, discountScore);
    valuePropScore = Math.min(100, valuePropScore);
    urgencyScore = Math.min(100, urgencyScore);
    scarcityScore = Math.min(100, scarcityScore);
    differentiationScore = Math.min(100, differentiationScore);

    const overallScore = Math.round((discountScore + valuePropScore + urgencyScore + scarcityScore + differentiationScore) / 5);

    const recommendations: string[] = [];
    if (discountScore < 70) {
      recommendations.push("Introduce a strong sweet-spot financial hook (e.g. 'Get 30% Off' or 'Unlock 3 Months Entirely Free' to offset risk perception).");
    }
    if (valuePropScore < 75) {
      recommendations.push("Clarify the core transformation metric directly. Specify exactly how much time, stress, or expense the target persona will eliminate.");
    }
    if (urgencyScore < 60) {
      recommendations.push("Inject a definitive micro-deadline incentive (e.g. 'Flash Sale Ends in 12 Hours' or 'Valid for Today's Bookings Only').");
    }
    if (scarcityScore < 50) {
      recommendations.push("Enhance vertical FOMO by highlighting volume caps (e.g. 'Exclusive to first 50 pilot customers' or 'Only 9 slots remaining').");
    }
    if (differentiationScore < 65) {
      recommendations.push("Ditch corporate jargon. Focus on a patented or proprietary mechanism of high-fidelity output like 'Self-Optimizing Grid Systems'.");
    }

    return {
      discountScore,
      valuePropScore,
      urgencyScore,
      scarcityScore,
      differentiationScore,
      overallScore,
      recommendations
    };
  }

  /**
   * Module 3: CTA Intelligence Engine
   */
  public static analyzeCtaIntelligence(ctaContent: string, format: string): CtaAnalysis {
    const text = (ctaContent || "").trim().toLowerCase();
    
    let visibilityScore = 80; // High in our templates due to high contrast backdrop
    let clarityScore = 60;
    let placementScore = 85; 
    let actionabilityScore = 55;

    // Validate Clarity
    const standardHighperformingCtas = [
      'call now', 'book today', 'reserve your seat', 'get free consultation', 'claim offer', 'register now',
      'buy now', 'get started', 'unlock pro tier', 'apply today', 'book live demonstration'
    ];
    
    const isStandard = standardHighperformingCtas.some(sc => text.includes(sc));
    if (isStandard) {
      clarityScore += 35;
      actionabilityScore += 35;
    } else if (text.length > 5 && text.length < 25) {
      clarityScore += 20;
      actionabilityScore += 15;
    }

    if (text.includes('click here') || text.includes('submit')) {
      clarityScore -= 15;
      actionabilityScore -= 20;
    }

    // Format Placement
    if (format.includes('Story') || format.includes('Post')) {
      placementScore = 90; // Optimized coordinate zoning
    }

    visibilityScore = Math.min(100, visibilityScore);
    clarityScore = Math.min(100, clarityScore);
    placementScore = Math.min(100, placementScore);
    actionabilityScore = Math.min(100, actionabilityScore);

    const overallScore = Math.round((visibilityScore + clarityScore + placementScore + actionabilityScore) / 4);

    const recommendations: string[] = [];
    if (clarityScore < 80) {
      recommendations.push("Refine text into a commanding verb. Avoid passive words like 'Submit' or 'More Info' in favor of high-energy claims.");
    }
    if (actionabilityScore < 75) {
      recommendations.push("Introduce low-friction descriptors alongside action verbs (e.g. 'Claim Free Consultation' vs simply 'Consultation').");
    }

    return {
      visibilityScore,
      clarityScore,
      placementScore,
      actionabilityScore,
      overallScore,
      recommendations,
      alternativeCtas: [
        'Call Now',
        'Book Today',
        'Reserve Your Seat',
        'Get Free Consultation',
        'Claim Offer Now',
        'Unwrap Reward Immediately'
      ]
    };
  }

  /**
   * Module 4: Persona Match Engine
   */
  public static analyzePersonaMatch(
    personaName: string, 
    painPoints: string[], 
    headline: string, 
    body: string
  ): PersonaAnalysis {
    const text = (headline + ' ' + body).toLowerCase();
    const cleanPersona = personaName || "Global Segment Profile";

    const painPointsMatched: string[] = [];
    const motivationsLeveraged: string[] = [];
    const objectionsAddressed: string[] = [];

    // Evaluate pain points matched
    painPoints.forEach(point => {
      const words = point.toLowerCase().split(' ');
      const hasMatch = words.some(w => w.length > 3 && text.includes(w));
      if (hasMatch) {
         painPointsMatched.push(point);
      }
    });

    // Demographics and objections mapping heuristic
    if (text.includes('risk-free') || text.includes('guarantee') || text.includes('on us')) {
      objectionsAddressed.push("Financial risk concerns");
    }
    if (text.includes('instant') || text.includes('repar') || text.includes('self-correcting')) {
      objectionsAddressed.push("Slow development cycles");
      motivationsLeveraged.push("Immediate gratification feedback loop");
    }
    if (text.includes('guideline') || text.includes('compliance')) {
       objectionsAddressed.push("Brand consistency decay");
       motivationsLeveraged.push("Corporate trust parameters alignment");
    }
    if (text.includes('next-gen') || text.includes('redefine')) {
      motivationsLeveraged.push("Technological edge prestige");
    }

    let fitScore = 40 + (painPointsMatched.length * 15) + (motivationsLeveraged.length * 10) + (objectionsAddressed.length * 10);
    fitScore = Math.min(100, Math.max(25, fitScore));

    const audienceMismatchFlag = fitScore < 60;
    let mismatchReason: string | undefined;
    if (audienceMismatchFlag) {
      mismatchReason = `Critique: The generated copy fails to trigger pain points crucial to ${cleanPersona}. Missing localized terminology, friction-reduction words, or direct role-benefit connections.`;
    }

    const improvementTriggers: string[] = [];
    if (painPointsMatched.length === 0) {
      improvementTriggers.push(`Directly address target pains like '${painPoints[0] || "poor coordinate conversions"}' inside the subheading block.`);
    }
    if (objectionsAddressed.length === 0) {
      improvementTriggers.push("Pre-emptively counter deployment doubts by adding trust factors or solid lifetime support claims.");
    }

    return {
      fitScore,
      analyzedPersona: cleanPersona,
      painPointsMatched,
      motivationsLeveraged,
      objectionsAddressed,
      audienceMismatchFlag,
      mismatchReason,
      improvementTriggers
    };
  }

  /**
   * Module 5: Channel Optimization Engine
   */
  public static getChannelOptimizations(): ChannelRecommendation[] {
    return [
      {
        channel: 'Facebook',
        suitabilityScore: 88,
        layoutGuideline: 'Place key offer headlines in the top 30% quadrant. Focus visual energy on high-saturation colored backdrops.',
        copywritingFormula: 'Hook (Curiosity) -> Offer Frame -> Interactive Question -> Bold CTA',
        pacingStyle: 'Conversational, energetic, and highly readable with clean spacing blocks.',
        attentionHacks: ['Inject eye-catching emoticons sparingly', 'Specify deadline parameters directly inside image assets', 'Limit text bounding box overlays'],
        recommendedCanvasFormat: 'Facebook Post'
      },
      {
        channel: 'Instagram',
        suitabilityScore: 92,
        layoutGuideline: 'Enforce perfect 1:1 or 4:5 vertical grid structures. Limit background clutter entirely to let product focal blocks pop.',
        copywritingFormula: 'Visual Prompt -> Quick Benefit list -> Single CTA',
        pacingStyle: 'Highly curated, stylized, minimalist storytelling.',
        attentionHacks: ['Maximize color guidelines contrast', 'Use high-fidelity product previews in the center', 'Keep primary text to Under 150 characters'],
        recommendedCanvasFormat: 'Instagram Square'
      },
      {
        channel: 'LinkedIn',
        suitabilityScore: 85,
        layoutGuideline: 'Maintain professional editorial splitting with classic grid-heavy grids. Elegant borders and corporate typography pairings.',
        copywritingFormula: 'Relevant Industry Problem -> Professional Solution Metric -> High-value checklist Download CTA',
        pacingStyle: 'Academic, authority-driven, metrics-oriented, and corporate.',
        attentionHacks: ['Reference standard metric boosts (e.g. 40% time savings)', 'Introduce credentials and industry standards validation badges', 'Align font families strictly to elegant Inter sans-serif'],
        recommendedCanvasFormat: 'LinkedIn Post'
      },
      {
        channel: 'WhatsApp',
        suitabilityScore: 78,
        layoutGuideline: 'Extreme compact single-focused banner. Text elements must use high-readability extra-large sizes.',
        copywritingFormula: 'Urgency Flash alert -> Direct Offer Value -> Direct Call/Contact CTA',
        pacingStyle: 'Immediate, informal, personal, and urgent.',
        attentionHacks: ['Enforce bright accent backgrounds (e.g. neon green or electric blue)', 'Use bold leading numbers', 'Keep CTAs friction-free e.g. "Save and Chat"'],
        recommendedCanvasFormat: 'Instagram Square'
      },
      {
        channel: 'Email',
        suitabilityScore: 90,
        layoutGuideline: 'Vertical continuous layout structure with recurring horizontal rule dividers and centered cta-action.',
        copywritingFormula: 'Personalized Problem -> Value Proposition -> Scarcity Trigger -> Risk-free Button link',
        pacingStyle: 'Warm, advisory, systematic, and direct.',
        attentionHacks: ['Embed high contrast layout previews', 'Place a secondary text-link CTA in the footer block', 'Adopt plain text layout readability'],
        recommendedCanvasFormat: 'A4 Portrait'
      },
      {
        channel: 'Flyer',
        suitabilityScore: 95,
        layoutGuideline: 'Maximize A4 high-res printing limits using 3.0mm bleeds and crop indicators overlay. Clear hierarchical reading sequence.',
        copywritingFormula: 'Dominant Headline -> Product grid strip -> Bold Offer details -> Phone/Address contact',
        pacingStyle: 'Locally targeted, bold, and promotional.',
        attentionHacks: ['Utilize dynamic visual grids to hold physical attention longer', 'Draw an obvious accent discount badge', 'Place physical QR and address nodes in bottom rails'],
        recommendedCanvasFormat: 'A4 Portrait'
      },
      {
        channel: 'Brochure',
        suitabilityScore: 82,
        layoutGuideline: 'Multi-column grid divisions. Generous white space ratio to handle multi-sectional service parameters.',
        copywritingFormula: 'Corporate Trust Tagline -> Structural Value Pillars -> Capabilities Matrix -> Lead Contact',
        pacingStyle: 'Deep, informative, structured, and long-form.',
        attentionHacks: ['Utilize clean horizontal divider borders in the grid', 'Apply strict accessibility contrast margins on text overlays', 'Incorporate clear sub-head numbers'],
        recommendedCanvasFormat: 'A4 Landscape'
      },
      {
        channel: 'Landing Page',
        suitabilityScore: 94,
        layoutGuideline: 'Bento-box split interface. Hero image placements on right side, rich action forms and CTAs locked on left quadrant.',
        copywritingFormula: 'Ultimate Benefit Headline -> Interactive Sub-statement -> Direct Offer form -> Trust badges',
        pacingStyle: 'Direct-response, transactional, persuasive, and educational.',
        attentionHacks: ['Anchor CTAs to floating coordinates', 'Feature interactive scoring calculators', 'Include peer review validation nodes near CTA buttons'],
        recommendedCanvasFormat: 'Presentation Slide'
      }
    ];
  }

  /**
   * Module 6: Conversion Jury 2.0
   * Rates a blueprint's conversion readiness based on goal and elements
   */
  public static runConversionJury(
    blueprint: LayoutBlueprint,
    goal: CampaignGoal,
    offerScore: number,
    ctaScore: number,
    personaFitScore: number
  ): { members: JuryMember[]; winningVariantRecommendations: string[] } {
    const brandLabel = blueprint.metadata.targetPersona || "General Audience";

    // Sub-Scores heuristics
    const mktPsychBias = Math.round(personaFitScore * 0.95);
    const growthBias = Math.round((offerScore + ctaScore) / 2);
    const copyBias = Math.round((personaFitScore + offerScore) / 2);

    const members: JuryMember[] = [
      {
        role: 'Performance Marketer',
        avatar: '📊',
        vocalPitch: 'Direct Response Specialist',
        critique: ctaScore > 75 
          ? `High-quality visibility parameters. The call to action is centered in the standard bottom quadrant. I recommend scaling variant B or C to A/B test dynamic button colors and boost raw click CTR.`
          : `High Conversion Risk. The call to action is too generic. We are wasting direct ad spend on a passive statement. Deploy an alternative like "Get Free Consultation" immediately.`,
        scores: {
          conversionPotential: Math.round(ctaScore / 5 * 0.9),
          relevance: Math.round(personaFitScore / 5 * 0.8),
          clarity: Math.round(ctaScore / 5 * 0.95),
          offerStrength: Math.round(offerScore / 5 * 0.85),
          trustworthiness: 14,
          total: 0
        }
      },
      {
        role: 'Growth Strategist',
        avatar: '🚀',
        vocalPitch: 'Virality & Scale Lead',
        critique: offerScore > 70
          ? `The financial offer of this layout matches benchmark hooks. Total LTV will absorb ad positioning layout costs. We should construct an upsell or retention cascade immediately.`
          : `The offer feels flat and lacks a real viral hook. Recommend stronger value propositions like 'Get 30% Off Lifetime' to decrease CAC bounds significantly.`,
        scores: {
          conversionPotential: Math.round(growthBias / 5),
          relevance: 16,
          clarity: 15,
          offerStrength: Math.round(offerScore / 5),
          trustworthiness: 15,
          total: 0
        }
      },
      {
        role: 'Consumer Psychologist',
        avatar: '🧠',
        vocalPitch: 'Behavioral Bias Auditor',
        critique: personaFitScore > 70
          ? `Outstanding cognitive alignment. Addressing objections early lowers buyer friction and triggers standard commitment theory biases cleanly for target persona ${brandLabel}.`
          : `High cognitive load! Copy is too technical and cold. It ignores ${brandLabel}'s active pain points. Speak directly to their immediate fears or lack of time.`,
        scores: {
          conversionPotential: Math.round(mktPsychBias / 5 * 0.95),
          relevance: Math.round(personaFitScore / 5),
          clarity: 14,
          offerStrength: Math.round(offerScore / 5 * 0.8),
          trustworthiness: Math.round(personaFitScore / 5 * 0.9),
          total: 0
        }
      },
      {
        role: 'Copywriter',
        avatar: '✍️',
        vocalPitch: 'Direct-Response Wordsmith',
        critique: `The headline utilizes robust power verbs, but could push readability further. Ensure the reading sequence strictly paths from the supreme benefit to a risk-reversal sub-text.`,
        scores: {
          conversionPotential: Math.round(copyBias / 5),
          relevance: 16,
          clarity: Math.round(ctaScore / 5 * 0.95),
          offerStrength: Math.round(offerScore / 5 * 0.85),
          trustworthiness: 15,
          total: 0
        }
      },
      {
        role: 'Sales Consultant',
        avatar: '💼',
        vocalPitch: 'Enterprise Closing Advisor',
        critique: `The value prop is clear to read, but we need to ensure local buyers can find high-integrity contact mechanisms. Always secure proof and social testimonials within secondary focus nodes.`,
        scores: {
          conversionPotential: 15,
          relevance: 15,
          clarity: 16,
          offerStrength: Math.round(offerScore / 5 * 0.9),
          trustworthiness: Math.round(personaFitScore / 5 * 0.95),
          total: 0
        }
      },
      {
        role: 'Industry Specialist',
        avatar: '🏢',
        vocalPitch: 'Domain Authority Expert',
        critique: `Highly suited layout parameters for the ${blueprint.industry} vertical. Visual balance, strict color guidelines conformance, and clean corporate styling pairs reinforce domain authority.`,
        scores: {
          conversionPotential: 16,
          relevance: Math.round(personaFitScore / 5 * 0.95),
          clarity: 15,
          offerStrength: 15,
          trustworthiness: 17,
          total: 0
        }
      }
    ];

    // Calculate totals inside each jury member
    members.forEach(m => {
      m.scores.total = m.scores.conversionPotential + m.scores.relevance + m.scores.clarity + m.scores.offerStrength + m.scores.trustworthiness;
    });

    const winningVariantRecommendations = [
      "Variant A (Headline Focused) is elected the victor for maximum initial organic reach campaigns.",
      "Deploy Variant B (CTA Contrast emphasis) for paid ad placement networks where scrolling speed demands visual friction blocks.",
      "Utilize Variant C (Offer Accentuation) specifically during re-targeting campaigns to address pricing objections directly."
    ];

    return {
      members,
      winningVariantRecommendations
    };
  }

  /**
   * Module 7: Expected Performance Forecast
   */
  public static forecastPerformance(
    offerScore: number, 
    ctaScore: number, 
    personaFitScore: number
  ): PerformanceForecast {
    // Engagement
    let engagementPotential: 'Low' | 'Medium' | 'High' = 'Medium';
    let engagementReasoning = "Excellent visual layout structure paired with custom brand guidelines color overlays generates strong scroll-stopping potential.";
    
    if (personaFitScore > 80) {
      engagementPotential = 'High';
      engagementReasoning = "Strong Persona alignment! Speaking directly to matched customer pain points and objections dramatically maximizes initial audience click throughput.";
    } else if (personaFitScore < 50) {
      engagementPotential = 'Low';
      engagementReasoning = "The layout copy is standard but misses a clear connection to matched consumer desires. Visual assets need stronger emotional focal points.";
    }

    // Lead Potential
    let leadPotential: 'Low' | 'Medium' | 'High' = 'Medium';
    let leadReasoning = "Frictionless Call to Actions centered correctly in printable and digital grids path standard conversion channels.";

    if (ctaScore > 80 && offerScore > 75) {
      leadPotential = 'High';
      leadReasoning = "Excellent! Clear value, low-friction download hooks, and action-driven CTA verbs are compiled cleanly to drive sign-ups.";
    } else if (ctaScore < 55) {
      leadPotential = 'Low';
      leadReasoning = "Converting visitors will suffer. The CTA button is too generic or low-contrast to hold direct click attention.";
    }

    // Conversion Probability
    let conversionProbability: 'Low' | 'Medium' | 'High' = 'Medium';
    let conversionReasoning = "Standard high-fidelity design standards. Fits standard business launch calendars and media guidelines.";

    if (offerScore > 80 && ctaScore > 75 && personaFitScore > 75) {
      conversionProbability = 'High';
      conversionReasoning = "Top Performance Tier! Balanced offer mechanics, urgency deadlocks, and cognitive pain triggers are synchronized perfectly to secure Sales or Registrations.";
    } else if (offerScore < 60) {
      conversionProbability = 'Low';
      conversionReasoning = "Conversion rate will face high bounce paths. Visual outline checks pass, but the core financial incentive lacks competitive value.";
    }

    const baseCtr = 1.2;
    const optimizedBenchmarkCrr = parseFloat((baseCtr * (1 + (offerScore + ctaScore + personaFitScore) / 300)).toFixed(2));

    return {
      engagementPotential,
      leadPotential,
      conversionProbability,
      engagementReasoning,
      leadReasoning,
      conversionReasoning,
      optimizedBenchmarkCrr
    };
  }

  /**
   * Module 8: A/B Test Generator
   * Creates A, B, C alternative textual setups
   */
  public static generateAbTestVariants(
    blueprint: LayoutBlueprint,
    goal: CampaignGoal,
    baseOffer: { discountText?: string; uniqueValueProp?: string }
  ): AbTestVariant[] {
    const defaultOffer = baseOffer.uniqueValueProp || "Standard Corporate Package";
    const discountText = baseOffer.discountText || "Exclusive Access Included";

    return [
      {
        variantId: 'Variant A',
        emphasis: 'Headline Focus - Peak Transformational Value',
        headlineOverride: `Scale Operations: Eliminate ${defaultOffer} Stress Forever`,
        ctaOverride: 'Get Free Audit Now',
        offerOverride: 'Completely free trial - no credit bounds',
        associatedLayoutModifications: ['Enlarge Headline text box by +15px', 'Double white space breathing room surrounding the sub-head block'],
        predictedPerformanceScore: 88
      },
      {
        variantId: 'Variant B',
        emphasis: 'CTA & Convenience Accent - Fast Response Action',
        headlineOverride: `${defaultOffer}: Fast Deployment Core For Growth Strategists`,
        ctaOverride: 'Claim Free Consultation Today',
        offerOverride: 'First 50 subscribers unlock premium templates permanently',
        associatedLayoutModifications: ['Inject contrasting background hex surrounding Call to Action box', 'Repath layout sequence directly to active contact numbers in sub-rails'],
        predictedPerformanceScore: 92
      },
      {
        variantId: 'Variant C',
        emphasis: 'Offer Intensity & Urgency Focus',
        headlineOverride: `Save 40% On ${defaultOffer} During Global Launch Flash Sale`,
        ctaOverride: 'Unlock Immediate 40% Off Now',
        offerOverride: 'Price doubles instantly in 12 hours - lock standard rate now',
        associatedLayoutModifications: ['Add bright border overlay accentuation surrounding the discount copy', 'Inject countdown indicators block nearby key title nodes'],
        predictedPerformanceScore: 95
      }
    ];
  }

  /**
   * Module 9: Marketing Explainability
   */
  public static getMarketingExplainability(
    goal: CampaignGoal, 
    personaName: string, 
    offerOverall: number
  ): MarketingExplainability {
    const audienceLabel = personaName || "Global Audience Segment";

    const psychologicalTriggers: string[] = ["Cognitive Consistency (Matches Brand Identity System)"];
    if (offerOverall > 75) {
       psychologicalTriggers.push("Scarcity / FOMO Bias (Volumetric Caps)");
    } else {
       psychologicalTriggers.push("Reciprocity Anchor (Pre-deployment checklists provided)");
    }
    
    if (goal === 'Sales') {
      psychologicalTriggers.push("Incentive Auditing Bias (Immediate financial reward value)");
    } else if (goal === 'Lead Generation') {
      psychologicalTriggers.push("Friction-Aversion Theory (Zero financial risk anchoring)");
    } else {
      psychologicalTriggers.push("Social Proof Anchor (Credibility design badges layout)");
    }

    return {
      whyThisWorks: `Constructing a robust, well-defined hierarchy with high white-space ratios lets the attention path naturally flow from our benefit-driven headline blocks directly into action-enabled CTA buttons, minimizing operational bounce rates.`,
      targetAudienceRationale: `Tailored specifically for ${audienceLabel}'s active pain parameters. Addresses their core objectives directly in native scale copy strings.`,
      psychologicalTriggers,
      primaryConversionGoal: goal,
      expectedCustomerAction: goal === 'Lead Generation' 
        ? "Entering contact emails to access digital strategy blueprints." 
        : (goal === 'Sales' ? "Clicking dynamic payment triggers to complete transactions." : "Subscribing or exploring secondary layouts.")
    };
  }

  /**
   * Module 10: Learning Feedback Loop
   */
  public static async recordConversionFeedback(
    record: Omit<ConversionFeedbackRecord, 'id' | 'timestamp'>
  ): Promise<ConversionFeedbackRecord> {
    const freshRecord: ConversionFeedbackRecord = {
      ...record,
      id: `cfr_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    // Save record to client database
    await clientDb.addDocToTenant("conversion_feedback_records", freshRecord, record.tenantId, record.userId);
    return freshRecord;
  }

  /**
   * Calculate weights derived from rating choices to feed back to future generations
   */
  public static async getGoalConversionSuccessRatios(tenantId: string): Promise<Record<string, number>> {
    try {
      const records = await clientDb.getCollection<ConversionFeedbackRecord>("conversion_feedback_records", tenantId);
      const goalScores: Record<string, { total: number; count: number }> = {};
      
      records.forEach(r => {
        const goal = r.campaignGoal;
        if (!goalScores[goal]) {
          goalScores[goal] = { total: 0, count: 0 };
        }
        goalScores[goal].total += r.userRating || 5;
        goalScores[goal].count += 1;
      });

      const averages: Record<string, number> = {};
      Object.keys(goalScores).forEach(k => {
        averages[k] = parseFloat((goalScores[k].total / goalScores[k].count).toFixed(2));
      });

      return averages;
    } catch {
      return {};
    }
  }

}
