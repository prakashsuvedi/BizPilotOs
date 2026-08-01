import React, { useState, useEffect } from 'react';
import { BusinessProfile, BrandGuideline } from '../types';
import { 
  Palette, 
  Eye, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  Sparkles, 
  Loader2, 
  Sparkle, 
  Layers, 
  Grid, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  HelpCircle, 
  History, 
  Award, 
  Zap, 
  Compass, 
  Maximize, 
  Cpu, 
  Printer,
  TrendingUp,
  Flame,
  Star,
  ThumbsUp
} from 'lucide-react';
import { 
  CreativeIntelligenceOrchestrator, 
  LayoutConstraintEngine, 
  DesignScoringFramework, 
  DesignMemorySystem, 
  SEEDED_DESIGN_PATTERNS, 
  CANVAS_DIMENSIONS, 
  CreativeType, 
  IndustryType, 
  LayoutBlueprint, 
  DesignScore, 
  LayoutValidationResult, 
  UniversalCoordinateObject 
} from '../lib/designIntelligence';
import { clientAuth, clientDb, isRealFirebase } from '../lib/firebase';
import { ServerSideRenderEngine } from '../lib/renderEngine';
import {
  CampaignGoal,
  MarketingChannel,
  OfferAnalysis,
  CtaAnalysis,
  PersonaAnalysis,
  ChannelRecommendation,
  JuryMember,
  PerformanceForecast,
  AbTestVariant,
  MarketingExplainability,
  ConversionIntelligenceEngine
} from '../lib/conversionEngine';

interface Props {
  profile: BusinessProfile;
  guideline: BrandGuideline | null;
  onUpdate: (guideline: BrandGuideline) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

export default function CreativeDirector({
  profile,
  guideline,
  onUpdate,
  isGenerating,
  setIsGenerating,
}: Props) {
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Creative Sandbox states
  const [sandboxText, setSandboxText] = useState<string>('');
  const [sandboxLayout, setSandboxLayout] = useState<'minimal' | 'architectural' | 'code'>('minimal');
  const [sandboxOverlayColor, setSandboxOverlayColor] = useState<string>('');
  const [downloadingState, setDownloadingState] = useState<boolean>(false);
  const [showExportToast, setShowExportToast] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  // Phase 9B - Rendering Engine state variables
  const [exportFormat, setExportFormat] = useState<'svg' | 'pdf'>('svg');
  const [exportScale, setExportScale] = useState<number>(1);
  const [bleedEnabled, setBleedEnabled] = useState<boolean>(false);
  const [cropMarksEnabled, setCropMarksEnabled] = useState<boolean>(false);

  // Multi-Agent Design Jury 2.0 states
  const [juryRunning, setJuryRunning] = useState<boolean>(false);
  const [juryResults, setJuryResults] = useState<any>(null);

  // Computer Vision Design Auditor states
  const [visionAuditing, setVisionAuditing] = useState<boolean>(false);
  const [visionAuditResult, setVisionAuditResult] = useState<any>(null);

  // Design Intelligence states
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>((profile.industry as IndustryType) || 'Technology');
  const [selectedCreativeType, setSelectedCreativeType] = useState<CreativeType>('Flyer');
  const [selectedFormat, setSelectedFormat] = useState<keyof typeof CANVAS_DIMENSIONS>('A4 Portrait');
  
  const [orchestrating, setOrchestrating] = useState<boolean>(false);
  const [activeBlueprint, setActiveBlueprint] = useState<LayoutBlueprint | null>(null);
  const [validationResult, setValidationResult] = useState<LayoutValidationResult | null>(null);
  const [designScore, setDesignScore] = useState<DesignScore | null>(null);

  // ==========================================
  // PHASE 9C: CONVERSION INTELLIGENCE STATES
  // ==========================================
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>('Lead Generation');
  const [discountText, setDiscountText] = useState<string>('Save 30% Today only');
  const [uniqueValueProp, setUniqueValueProp] = useState<string>('Patented dynamic vector design coordinates');
  const [urgencyDeadline, setUrgencyDeadline] = useState<string>('Ends in exactly 12 hours');
  const [ctaOverrideText, setCtaOverrideText] = useState<string>('Get Free Consultation');

  // Conversion analytics & scores
  const [offerAnalysis, setOfferAnalysis] = useState<OfferAnalysis | null>(null);
  const [ctaAnalysis, setCtaAnalysis] = useState<CtaAnalysis | null>(null);
  const [personaAnalysis, setPersonaAnalysis] = useState<PersonaAnalysis | null>(null);
  const [channelRecommendations, setChannelRecommendations] = useState<ChannelRecommendation[]>([]);
  const [conversionJury, setConversionJury] = useState<{ members: JuryMember[]; winningVariantRecommendations: string[] } | null>(null);
  const [performanceForecast, setPerformanceForecast] = useState<PerformanceForecast | null>(null);
  const [abVariants, setAbVariants] = useState<AbTestVariant[]>([]);
  const [explainability, setExplainability] = useState<MarketingExplainability | null>(null);

  // Active chosen A/B test Variant Choice & Learning Feedbacks
  const [chosenVariantId, setChosenVariantId] = useState<string>('Base Blueprint');
  const [userRating, setUserRating] = useState<number>(5);
  const [editedVariantFlag, setEditedVariantFlag] = useState<boolean>(false);
  const [publishedVariantFlag, setPublishedVariantFlag] = useState<boolean>(false);
  
  const [historicalBlueprints, setHistoricalBlueprints] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'blueprint' | 'library' | 'history'>('blueprint');

  // Load history records
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const tenantId = profile.tenantId || 'demo-tenant';
      const records = await clientDb.getCollection('creative_blueprints', tenantId);
      setHistoricalBlueprints(records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (err) {
      console.error("Error loaded local blueprints history list", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [profile.tenantId]);

  const handleSynthesizeIdentity = async () => {
    setIsGenerating(true);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/agent/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123' },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error('Unsuccessful brand guidelines generation');
      const data = await res.json();
      if (data.primaryColor) {
        onUpdate(data);
        setSandboxText(profile.name + ' - Timeless Series');
        setSandboxOverlayColor(data.secondaryColor || '#C08560');
      } else {
        throw new Error('Incomplete brand guideline response');
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus('The Creative Director agent encountered a design system compilation error. Loading standard editorial guidelines.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOrchestrateBlueprint = async () => {
    setOrchestrating(true);
    setErrorStatus(null);
    try {
      const tenantId = profile.tenantId || 'demo-tenant';
      const userId = clientAuth.currentUser?.uid || 'simulated_user';
      
      const res = await CreativeIntelligenceOrchestrator.orchestrateBlueprint({
        tenantId,
        userId,
        industry: selectedIndustry,
        creativeType: selectedCreativeType,
        format: selectedFormat as any,
        profile,
        guideline,
        localizationRegion: "US Metro"
      });

      // Optimize generated layout copy elements based on chosen campaign goal objective
      const optimizedBlueprint = ConversionIntelligenceEngine.optimizeBlueprintForGoal(
        res.blueprint,
        campaignGoal,
        { discountText, uniqueValueProp, urgencyDeadline }
      );

      // Find customized texts to feed our analytical engines
      let optHeadline = "";
      let optBody = "";
      let optCta = "";
      optimizedBlueprint.elements.forEach(el => {
        if (el.elementId === 'headline-copyblock') optHeadline = el.content || "";
        if (el.elementId === 'body-narrative-block') optBody = el.content || "";
        if (el.elementId === 'cta-action-button' || el.type === 'cta') optCta = el.content || "";
      });

      // Compute Conversions Evaluations using our modular libraries
      const offEval = ConversionIntelligenceEngine.analyzeOfferStrength(optHeadline, optBody, campaignGoal);
      const ctaEval = ConversionIntelligenceEngine.analyzeCtaIntelligence(optCta, selectedFormat);
      const persEval = ConversionIntelligenceEngine.analyzePersonaMatch(
        profile.targetAudience || "Target Segment Segment",
        profile.description ? [profile.description.substring(0, 48), "operations bottleneck"] : ["cost inefficiencies"],
        optHeadline,
        optBody
      );
      const chanRecs = ConversionIntelligenceEngine.getChannelOptimizations();
      const juryMems = ConversionIntelligenceEngine.runConversionJury(
        optimizedBlueprint,
        campaignGoal,
        offEval.overallScore,
        ctaEval.overallScore,
        persEval.fitScore
      );
      const fc = ConversionIntelligenceEngine.forecastPerformance(
        offEval.overallScore,
        ctaEval.overallScore,
        persEval.fitScore
      );
      const tests = ConversionIntelligenceEngine.generateAbTestVariants(
        optimizedBlueprint,
        campaignGoal,
        { discountText, uniqueValueProp }
      );
      const exp = ConversionIntelligenceEngine.getMarketingExplainability(
        campaignGoal,
        profile.targetAudience || "Target Customer Persona",
        offEval.overallScore
      );

      // Set state values
      setActiveBlueprint(optimizedBlueprint);
      setOfferAnalysis(offEval);
      setCtaAnalysis(ctaEval);
      setPersonaAnalysis(persEval);
      setChannelRecommendations(chanRecs);
      setConversionJury(juryMems);
      setPerformanceForecast(fc);
      setAbVariants(tests);
      setExplainability(exp);
      setChosenVariantId('Base Blueprint');
      setEditedVariantFlag(false);
      setPublishedVariantFlag(false);
      
      const scoreCalculated = DesignScoringFramework.calculateDetailedScore(optimizedBlueprint, guideline);
      setDesignScore(scoreCalculated);
      
      // Calculate and save constraint result directly
      const bounds = CANVAS_DIMENSIONS[selectedFormat] || CANVAS_DIMENSIONS['A4 Portrait'];
      const val = LayoutConstraintEngine.validateAndRepairLayout(optimizedBlueprint.elements, selectedFormat, bounds);
      setValidationResult(val);

      setExportMessage(`Successfully formulated validation blueprint optimized for Campaign Goal of [${campaignGoal}] with high-conversion safeguards built-in!`);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 5600);
      loadHistory();
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Could not orchestrate algorithmic design validation path: " + err.message);
    } finally {
      setOrchestrating(false);
    }
  };

  const handleSelectAbVariant = (variant: AbTestVariant) => {
    if (!activeBlueprint) return;
    setChosenVariantId(variant.variantId);
    
    // Perform copy and element overrides based on Module 8 variations
    const modifiedBlueprint = JSON.parse(JSON.stringify(activeBlueprint)) as LayoutBlueprint;
    modifiedBlueprint.elements.forEach(el => {
      if (el.elementId === 'headline-copyblock' || (el.type === 'text' && el.styles?.fontSize && parseInt(el.styles.fontSize) >= 24)) {
        el.content = variant.headlineOverride;
      } else if (el.elementId === 'cta-action-button' || el.type === 'cta') {
        el.content = variant.ctaOverride;
      } else if (el.elementId === 'body-narrative-block' || (el.type === 'text' && el.height >= 100)) {
        el.content = `Variant Bias: ${variant.emphasis}. ${variant.offerOverride}. Formulated in perfect vector alignment automatically.`;
      }
    });

    setActiveBlueprint(modifiedBlueprint);
    setEditedVariantFlag(true);

    // Compute sub-metrics on the fly for updated display
    if (offerAnalysis) {
      const updatedOffer = ConversionIntelligenceEngine.analyzeOfferStrength(variant.headlineOverride, variant.offerOverride, campaignGoal);
      setOfferAnalysis(updatedOffer);
    }
    if (ctaAnalysis) {
      const updatedCta = ConversionIntelligenceEngine.analyzeCtaIntelligence(variant.ctaOverride, selectedFormat);
      setCtaAnalysis(updatedCta);
    }

    setExportMessage(`Switched active canvas to ${variant.variantId}! Visual layouts updated to align with direct-response triggers.`);
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 4200);
  };

  const handleSaveConversionFeedback = async () => {
    if (!activeBlueprint) return;
    setDownloadingState(true);
    try {
      const tenantId = profile.tenantId || 'demo-tenant';
      const userId = clientAuth.currentUser?.uid || 'simulated_user';

      await ConversionIntelligenceEngine.recordConversionFeedback({
        tenantId,
        userId,
        blueprintId: activeBlueprint.id,
        campaignGoal,
        selectedVariant: chosenVariantId,
        editedVariant: editedVariantFlag,
        publishedVariant: publishedVariantFlag,
        userRating,
        recordedOffer: uniqueValueProp + ' | ' + discountText,
        recordedCta: activeBlueprint.elements.find(el => el.type === 'cta' || el.elementId === 'cta-action-button')?.content || 'Free Consultation',
      });

      setExportMessage(`Pre-launch published telemetry for [${chosenVariantId}] written to Firestore! Future campaign predictions updated.`);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 5600);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Learning Loop recording error: " + err.message);
    } finally {
      setDownloadingState(false);
    }
  };

  const handleRecordSelectionMemory = async (blueprint: LayoutBlueprint) => {
    try {
      const tenantId = profile.tenantId || 'demo-tenant';
      const userId = clientAuth.currentUser?.uid || 'simulated_user';
      
      await DesignMemorySystem.recordSelection({
        blueprintId: blueprint.id,
        patternId: blueprint.patternId,
        tenantId,
        userId,
        chosenVariant: blueprint.canvasFormat,
        userEdits: [],
        selectionHistory: [blueprint.patternId]
      });

      setExportMessage("Recorded blueprint selection memory choice in Firestore. System will optimize brand preference weights.");
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportBlueprint = async () => {
    if (!activeBlueprint) return;
    setDownloadingState(true);
    setErrorStatus(null);
    try {
      const tenantId = profile.tenantId || 'demo-tenant';
      const res = await fetch('/api/render/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123' },
        body: JSON.stringify({
          blueprintId: activeBlueprint.id,
          format: exportFormat,
          renderScale: exportScale,
          bleed: bleedEnabled,
          cropMarks: cropMarksEnabled,
          cmyk: exportFormat === 'pdf'
        })
      });

      if (!res.ok) throw new Error('Unsuccessful rendering download stream compile');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeBlueprint.creativeType.replace(/\s+/g, '_')}_300DPI.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setExportMessage(`Pixel-perfect Agency-Grade ${exportFormat.toUpperCase()} generated and downloaded successfully!`);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 4500);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Production Export failure: " + err.message);
    } finally {
      setDownloadingState(false);
    }
  };

  const handleExecuteVisionAudit = async () => {
    if (!activeBlueprint || !designScore) return;
    setVisionAuditing(true);
    setVisionAuditResult(null);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/render/audit-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123' },
        body: JSON.stringify({
          blueprintId: activeBlueprint.id,
          score: designScore
        })
      });
      if (!res.ok) throw new Error('Visual design audit was blocked');
      const data = await res.json();
      setVisionAuditResult(data);
      
      setExportMessage("Machine Vision audit complete! Review detailed review and grades in HUD.");
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Computer Vision audit error: " + err.message);
    } finally {
      setVisionAuditing(false);
    }
  };

  const handleTriggerJuryVariants = async () => {
    if (!activeBlueprint) return;
    setJuryRunning(true);
    setJuryResults(null);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/render/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123' },
        body: JSON.stringify({
          blueprintId: activeBlueprint.id,
          primaryColor: guideline?.primaryColor || '#4f46e5',
          secondaryColor: guideline?.secondaryColor || '#06b6d4',
          accentColor: guideline?.accentColor || '#f97316'
        })
      });
      if (!res.ok) throw new Error('Design variants jury generation failed');
      const data = await res.json();
      setJuryResults(data);
      
      // Automatically choose the elected winner blueprint
      if (data.winnerBlueprint) {
        setActiveBlueprint(data.winnerBlueprint);
        const bounds = CANVAS_DIMENSIONS[data.winnerBlueprint.canvasFormat || 'A4 Portrait'] || CANVAS_DIMENSIONS['A4 Portrait'];
        const valResult = LayoutConstraintEngine.validateAndRepairLayout(data.winnerBlueprint.elements, data.winnerBlueprint.canvasFormat, bounds);
        setValidationResult(valResult);
        if (data.winnerBlueprint.elements && guideline) {
          setDesignScore(DesignScoringFramework.calculateDetailedScore(data.winnerBlueprint, guideline));
        }
      }

      setExportMessage("Multi-Agent Jury 2.0 has elected the supreme creative layout variant! Active blueprint updated.");
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 5000);
      loadHistory();
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Design Jury election failure: " + err.message);
    } finally {
      setJuryRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Officer Header Card */}
      <div id="creative-agent-officer" className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm text-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
            <Palette className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-200/65">
                DESIGN INTELLIGENCE CORE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1 font-sans">Creative Identity & Layout Intelligence</h2>
            <p className="text-slate-500 text-sm mt-0.5 font-sans">Formulate core coordinates blueprint designs governed by automatic layout constraints, scoring matrices, and multi-tenant auditability paths.</p>
          </div>
        </div>

        <button
          id="btn-trigger-creative"
          onClick={handleSynthesizeIdentity}
          disabled={isGenerating}
          className="w-full md:w-auto px-5 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm text-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Compiling Guidelines...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-pink-100" />
              {guideline ? 'Recheck Vector System' : 'Formulate Brand Book Specs'}
            </>
          )}
        </button>
      </div>

      {errorStatus && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{errorStatus}</span>
        </div>
      )}

      {showExportToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between gap-3 shadow-md animate-slide-up">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-medium">{exportMessage}</span>
          </div>
          <button onClick={() => setShowExportToast(false)} className="text-emerald-700 hover:text-emerald-900 font-mono text-xs font-bold cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
        
        {/* Left column: Brand Settings & Traditional Sandbox preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Brand Colors guidelines block */}
          {guideline && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-slate-900">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Colors Guidelines</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="h-10 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: guideline.primaryColor }}></div>
                  <span className="text-[10px] text-slate-700 block font-bold text-center">Primary</span>
                  <span className="text-[9px] text-slate-400 block text-center uppercase font-mono">{guideline.primaryColor}</span>
                </div>
                <div className="space-y-1">
                  <div className="h-10 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: guideline.secondaryColor }}></div>
                  <span className="text-[10px] text-slate-700 block font-bold text-center">Secondary</span>
                  <span className="text-[9px] text-slate-400 block text-center uppercase font-mono">{guideline.secondaryColor}</span>
                </div>
                <div className="space-y-1">
                  <div className="h-10 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: guideline.accentColor }}></div>
                  <span className="text-[10px] text-slate-700 block font-bold text-center">Highlight</span>
                  <span className="text-[9px] text-slate-400 block text-center uppercase font-mono">{guideline.accentColor}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-mono font-bold tracking-wider block">Heading Font</span>
                  <p className="text-slate-800 font-bold text-xs mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200 text-center font-mono">
                    {guideline.typographyHeading}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-mono font-bold tracking-wider block">Body Font</span>
                  <p className="text-slate-800 font-bold text-xs mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200 text-center font-mono">
                    {guideline.typographyBody}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sandbox Mockup Quick Canvas Preview */}
          <div className="bg-slate-900 border border-slate-950 text-white rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Tactile Micro Sandbox</span>
              <span className="text-[9px] bg-slate-800 text-pink-400 px-2 py-0.5 rounded font-mono border border-white/5">SANDBOX MOCK</span>
            </div>
            
            <div 
              className="h-44 rounded-xl flex flex-col justify-between p-4 border border-white/10 relative overflow-hidden transition"
              style={{ backgroundColor: guideline?.primaryColor || '#0B111E' }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono text-slate-400 uppercase">{profile.name}</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold" style={{ color: guideline?.accentColor }}>● ONLINE</span>
              </div>

              <div>
                <h4 className="text-lg font-bold tracking-tight text-white leading-tight">
                  {sandboxText || "Earthy Textures; Craft Reforged."}
                </h4>
                <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                  {profile.description || "Synthesizing strategic layouts with enterprise design compliance layers seamlessly."}
                </p>
              </div>

              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                <span>FORMAT: {selectedFormat}</span>
                <span className="font-bold underline">ACTIVATE SUITE</span>
              </div>
            </div>

            <input 
              type="text"
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              placeholder="Edit sandbox title text..."
              className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-500 rounded-lg p-2 text-xs focus:outline-none"
            />
          </div>

          {/* Guidelines Thesis text */}
          {guideline && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm font-sans text-slate-900">
              <span className="text-slate-400 text-[10px] uppercase font-mono font-bold tracking-widest block">Executive Branding Theme</span>
              <h4 className="text-pink-600 font-bold text-sm">{guideline.visualVibe}</h4>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">{guideline.vibeDescription}</p>
            </div>
          )}

        </div>

        {/* Right column: Integrated coordinate workspace dashboard */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Inner workspace navigation */}
          <div className="flex border-b border-slate-200 gap-6">
            <button 
              onClick={() => setActiveSubTab('blueprint')}
              className={`pb-3 text-xs font-mono font-bold tracking-wide focus:outline-none flex items-center gap-2 border-b-2 cursor-pointer transition ${
                activeSubTab === 'blueprint' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Blueprint Orchestration
            </button>
            <button 
              onClick={() => setActiveSubTab('library')}
              className={`pb-3 text-xs font-mono font-bold tracking-wide focus:outline-none flex items-center gap-2 border-b-2 cursor-pointer transition ${
                activeSubTab === 'library' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              Seeded Design Patterns
            </button>
            <button 
              onClick={() => setActiveSubTab('history')}
              className={`pb-3 text-xs font-mono font-bold tracking-wide focus:outline-none flex items-center gap-2 border-b-2 cursor-pointer transition ${
                activeSubTab === 'history' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              Audit Blueprints History ({historicalBlueprints.length})
            </button>
          </div>

          {/* SUB-TAB 1: BLUEPRINT ORCHESTRATION */}
          {activeSubTab === 'blueprint' && (
            <div className="space-y-6">
              
              {/* Parameters panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-slate-900">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Configure Coordinates Target</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Creative Category</label>
                    <select 
                      value={selectedCreativeType} 
                      onChange={(e) => setSelectedCreativeType(e.target.value as CreativeType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="Flyer">Flyer</option>
                      <option value="Brochure">Brochure</option>
                      <option value="Product Catalog">Product Catalog</option>
                      <option value="Company Profile">Company Profile</option>
                      <option value="Pitch Deck">Pitch Deck</option>
                      <option value="Facebook Post">Facebook Post</option>
                      <option value="Instagram Post">Instagram Post</option>
                      <option value="LinkedIn Post">LinkedIn Post</option>
                      <option value="Social Carousel">Social Carousel</option>
                      <option value="Event Promotion">Event Promotion</option>
                      <option value="Product Launch">Product Launch</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Canvas Dimensions Format</label>
                    <select 
                      value={selectedFormat} 
                      onChange={(e) => setSelectedFormat(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="A4 Portrait">A4 Portrait (842 x 1191)</option>
                      <option value="A4 Landscape">A4 Landscape (1191 x 842)</option>
                      <option value="US Letter">US Letter (816 x 1056)</option>
                      <option value="Facebook Post">Facebook Post (1240 x 630)</option>
                      <option value="Instagram Square">Instagram Square (1080 x 1080)</option>
                      <option value="Instagram Story">Instagram Story (1080 x 1920)</option>
                      <option value="LinkedIn Post">LinkedIn Post (1200 x 1200)</option>
                      <option value="Presentation Slide">Presentation Slide (1920 x 1080)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Aesthetic Target Industry</label>
                    <select 
                      value={selectedIndustry} 
                      onChange={(e) => setSelectedIndustry(e.target.value as IndustryType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="Real Estate">Real Estate</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Retail">Retail</option>
                      <option value="Construction">Construction</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Government">Government</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Professional Services">Professional Services</option>
                    </select>
                  </div>
                </div>

                {/* CONVERSION & CAMPAIGN GOAL ENGINE CONTROLS */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <span className="text-[10px] font-mono font-bold text-pink-600 uppercase tracking-widest block flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-pink-500" /> Campaign Objective & Offer Strategy Engine
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campaign Goal */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Campaign Goal / Objective</label>
                      <select 
                        value={campaignGoal} 
                        onChange={(e) => setCampaignGoal(e.target.value as CampaignGoal)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                      >
                        <option value="Lead Generation">Lead Generation</option>
                        <option value="Sales">Sales</option>
                        <option value="Awareness">Awareness</option>
                        <option value="Event Promotion">Event Promotion</option>
                        <option value="Product Launch">Product Launch</option>
                        <option value="Recruitment">Recruitment</option>
                        <option value="Retention">Retention</option>
                        <option value="Upsell">Upsell</option>
                        <option value="Cross Sell">Cross Sell</option>
                      </select>
                      <p className="text-[9px] text-slate-400">Headline copy framing, content hooks, and CTA actions adapt to selected goal.</p>
                    </div>

                    {/* Target UVP */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Unique Value Proposition (UVP)</label>
                      <input 
                        type="text" 
                        value={uniqueValueProp} 
                        onChange={(e) => setUniqueValueProp(e.target.value)}
                        placeholder="e.g. Self-healing coordinate alignments system"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                      />
                      <p className="text-[9px] text-slate-400">High-potency benefit stated directly in visual block headlines.</p>
                    </div>

                    {/* Discount parameters */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Offer Incentive Reward / Discount</label>
                      <input 
                        type="text" 
                        value={discountText} 
                        onChange={(e) => setDiscountText(e.target.value)}
                        placeholder="e.g. Buy 1 get 1, 35% Flat Off, Free Trial"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                      />
                      <p className="text-[9px] text-slate-400">Used by the Offer Analyzer to grade incentive attractiveness.</p>
                    </div>

                    {/* Urgency limits */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Urgency Deadline Constraint</label>
                      <input 
                        type="text" 
                        value={urgencyDeadline} 
                        onChange={(e) => setUrgencyDeadline(e.target.value)}
                        placeholder="e.g. Flash Sale Expires in 12 Hours"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                      />
                      <p className="text-[9px] text-slate-400">Creates scarcity signals evaluated by consumer psychology judges.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={handleOrchestrateBlueprint}
                    disabled={orchestrating}
                    className="px-5 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {orchestrating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                        Generating Coordinate Blueprint...
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 text-pink-400" />
                        Synthesize Design Blueprint Layout
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Blueprint Results panel */}
              {activeBlueprint ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  {/* Left Column: Live Visual Vector Canvas (Covers 2 columns) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden min-h-[480px] flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-pink-500" /> Crisp Scaling Vector Canvas
                        </span>
                        <span className="text-[9px] font-mono text-white/50">{activeBlueprint.canvasFormat} Layout</span>
                      </div>

                      {/* Real-time scalable canvas render */}
                      <div className="flex-1 flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-white/5 relative group select-none">
                        <div 
                          className="w-full max-w-[340px] shadow-2xl rounded border border-white/15 bg-white overflow-hidden transition-transform duration-300 hover:scale-[1.01] text-slate-900"
                          dangerouslySetInnerHTML={{ __html: ServerSideRenderEngine.renderBlueprintToSVG(activeBlueprint) }}
                        />
                      </div>

                      {/* Canvas Dimensions and Spec Metrics info */}
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-white/5 pt-2.5">
                        <span>CANVAS SIZE: {activeBlueprint.dimensions.width}x{activeBlueprint.dimensions.height}px</span>
                        <span>ELEMENTS: {activeBlueprint.elements.length} NODES</span>
                      </div>
                    </div>

                    {/* Quality Feedback Matrix */}
                    {designScore && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-sans text-slate-900">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Algorithmic Design Grade</span>
                          <span className="text-xl font-black text-pink-600 font-mono">
                            {designScore.total}/100
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg text-slate-600 space-y-1 border border-slate-100">
                            <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Layout Calibration</span>
                            <div>Grid Alignment: {designScore.breakdown.layout.alignment}%</div>
                            <div>Hemisphere Balance: {designScore.breakdown.layout.balance}%</div>
                            <div>Gutter Spacing: {designScore.breakdown.layout.spacing}%</div>
                          </div>
                          
                          <div className="bg-slate-50 p-2 rounded-lg text-slate-600 space-y-1 border border-slate-100">
                            <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Typography Grade</span>
                            <div>Character Height: {designScore.breakdown.typography.readability}%</div>
                            <div>Visual Weight: {designScore.breakdown.typography.hierarchy}%</div>
                            <div>Font Consistency: {designScore.breakdown.typography.consistency}%</div>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg text-slate-600 space-y-1 border border-slate-100">
                            <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Branding Balance</span>
                            <div>Palette Integrity: {designScore.breakdown.branding.colorUsage}%</div>
                            <div>Book Standards: {designScore.breakdown.branding.guidelineMatch}%</div>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg text-slate-600 space-y-1 border border-slate-100">
                            <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Marketing Flow</span>
                            <div>CTA Contrast: {designScore.breakdown.marketing.ctaVisibility}%</div>
                            <div>Attention Pathway: {designScore.breakdown.marketing.conversionPathway}%</div>
                          </div>
                        </div>

                        {designScore.critique && designScore.critique.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold font-mono text-slate-400 block uppercase mb-1">Critique Recommendations:</span>
                            <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-0.5">
                              {designScore.critique.map((cri, idx) => (
                                <li key={idx}>{cri}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Execution Panels, Exports & Machine Vision Juries (Covers 3 columns) */}
                  <div className="lg:col-span-3 space-y-6">

                    {/* High-Resolution Production Export configuration */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-slate-900">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Palette className="w-5 h-5 text-pink-600" />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Professional Rendering & Print Export Engine™</h4>
                          <p className="text-xs text-slate-400 leading-none mt-0.5">Generate high-fidelity vector PDF books and crisp lossless SVG files</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        {/* Format selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Production Format</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setExportFormat('svg')}
                              className={`flex-1 p-2 rounded-xl text-center font-bold border transition ${
                                exportFormat === 'svg' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Lossless SVG
                            </button>
                            <button
                              onClick={() => setExportFormat('pdf')}
                              className={`flex-1 p-2 rounded-xl text-center font-bold border transition ${
                                exportFormat === 'pdf' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              CMYK PDF
                            </button>
                          </div>
                        </div>

                        {/* Scale selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Render DPI Scale</label>
                          <select 
                            value={exportScale} 
                            onChange={(e) => setExportScale(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                          >
                            <option value={1}>1.0x (Web Screen Proof)</option>
                            <option value={2}>2.0x (Retina Displays)</option>
                            <option value={3}>3.0x (300 DPI High-Res Poster)</option>
                          </select>
                        </div>

                        {/* Print modifiers (bleed and crop) */}
                        <div className="col-span-2 grid grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/70 transition cursor-pointer text-slate-900">
                            <input 
                              type="checkbox" 
                              checked={bleedEnabled} 
                              onChange={(e) => setBleedEnabled(e.target.checked)}
                              className="text-pink-600 focus:ring-pink-500 h-4 w-4 border-slate-300 rounded" 
                            />
                            <div>
                              <span className="font-bold text-slate-800 block leading-tight">Apply 3mm Bleed</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Adds print overflow safety bounds</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/70 transition cursor-pointer text-slate-900">
                            <input 
                              type="checkbox" 
                              checked={cropMarksEnabled} 
                              onChange={(e) => setCropMarksEnabled(e.target.checked)}
                              className="text-pink-600 focus:ring-pink-500 h-4 w-4 border-slate-300 rounded" 
                            />
                            <div>
                              <span className="font-bold text-slate-800 block leading-tight">Draw Crop Marks</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Overlays paper crop crosshairs</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between gap-3 items-center">
                        <button 
                          onClick={() => handleRecordSelectionMemory(activeBlueprint)}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Check className="w-4 h-4 text-emerald-600" /> Commend Style Core
                        </button>

                        <button 
                          onClick={handleExportBlueprint}
                          disabled={downloadingState}
                          className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 cursor-pointer shadow-md disabled:bg-slate-200 transition"
                        >
                          {downloadingState ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Compiling Vector...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" /> Export High-Res Layout File
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Integrated Design Jury 2.0 section */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-violet-600" />
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">Multi-Agent Design Jury 2.0™</h4>
                            <p className="text-xs text-slate-400 leading-none mt-0.5">Spawns 5 aesthetic design variants reviewed by 6 professional specialized judges</p>
                          </div>
                        </div>
                        <button
                          onClick={handleTriggerJuryVariants}
                          disabled={juryRunning}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white font-mono text-[10px] font-bold rounded-xl scroll-p-1 shadow-sm transition-all"
                        >
                          {juryRunning ? "Deliberating..." : "Engage Jury Election"}
                        </button>
                      </div>

                      {juryResults ? (
                        <div className="space-y-4">
                          <div className="bg-violet-50/60 border border-violet-100 p-4 rounded-xl text-xs text-violet-900 leading-relaxed font-medium">
                            <strong>Supreme Elected Layout Victor</strong>: Variant <span className="font-mono text-pink-600 font-bold">[{juryResults.winnerId.toUpperCase()}]</span> computed with the highest combined coefficient of <span className="underline font-bold text-violet-950">{juryResults.compositeScore}%</span> compliance standards!
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {juryResults.variants.map((v: any, index: number) => (
                              <div 
                                key={index} 
                                className={`p-4 border.solid rounded-xl space-y-2 transition shadow-sm ${
                                  v.variantId === juryResults.winnerId ? 'bg-indigo-50/30 border-2 border-indigo-400' : 'bg-slate-50 border border-slate-200'
                                }`}
                              >
                                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                                  <span className="font-bold text-slate-800 text-xs">{v.variantId.toUpperCase()} STYLE</span>
                                  {v.variantId === juryResults.winnerId && (
                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">VICTOR</span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                                  <div>Base Score: {v.score.total}/100</div>
                                  <div>Combined Jury: {v.compositeJuryScore}%</div>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Judges Feedback Scoreboard</span>
                                  <div className="font-mono text-[9px] text-slate-600 bg-white/60 p-2 rounded border space-y-1">
                                    <div>CD Score: {v.juryScores.creativeDirector}/20 - "{v.juryFeedback.creativeDirector}"</div>
                                    <div>AD Score: {v.juryScores.artDirector}/20 - "{v.juryFeedback.artDirector}"</div>
                                    <div>Brand Compliance: {v.juryScores.brandCompliance}/20</div>
                                    <div>Marketing Psych: {v.juryScores.marketingPsychology}/20</div>
                                    <div>Space Alignment: {v.juryScores.spatialAnalyst}/20</div>
                                    <div>Access Auditor: {v.juryScores.accessibilityAuditor}/20</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic">Deliberate the jury to compile and audit Corporate, Luxury, and Minimal variant designs against compliance guides.</p>
                      )}
                    </div>

                    {/* Integrated Machine Vision Auditing panel */}
                    <div className="bg-slate-900 border border-slate-950 text-white rounded-2xl p-6 shadow-xl space-y-4 font-mono">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
                          <div>
                            <span className="text-xs uppercase text-slate-200 block font-bold">Generative Machine Vision Auditor™</span>
                            <span className="text-[9px] text-slate-500 block">Deploy multimodal Gemini audits to evaluate layout aesthetic</span>
                          </div>
                        </div>
                        <button
                          onClick={handleExecuteVisionAudit}
                          disabled={visionAuditing}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-sans text-xs font-bold rounded-xl shadow transition"
                        >
                          {visionAuditing ? "Scanning design canvas..." : "Run Vision Audit"}
                        </button>
                      </div>

                      {visionAuditResult ? (
                        <div className="space-y-3 font-mono text-xs text-slate-300 bg-slate-950/65 p-4 rounded-xl border border-white/5 leading-relaxed">
                          <div className="pb-2 border-b border-white/10 flex justify-between items-center">
                            <span className="font-bold text-emerald-400">AUDIT VERDICT COMPLETE:</span>
                            <span className="text-xl font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded border border-emerald-500/40">{visionAuditResult.grade}</span>
                          </div>
                          <div>
                            <strong className="text-slate-100">Vibe Verdict Critique:</strong>
                            <p className="mt-1 font-sans text-xs text-slate-300">{visionAuditResult.visionCritique}</p>
                          </div>
                          <div className="pt-2 border-t border-white/5">
                            <strong className="text-slate-100">Recommended Layout Tweaks:</strong>
                            <ul className="list-decimal pl-4 mt-1 font-sans text-xs text-slate-300 space-y-1">
                              {visionAuditResult.suggestions.map((sug: string, idx: number) => (
                                <li key={idx}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs italic">Run computer vision model to retrieve deep multivariable spatial critiques.</p>
                      )}
                    </div>

                    {/* Constraint HUD */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-sans text-slate-900">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Constraint Compliance Engine</span>
                        {validationResult?.isValid ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> COMPLIANT
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> DETECTED ISSUES
                          </span>
                        )}
                      </div>

                      {validationResult?.violations && validationResult.violations.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 block">Identified Structural Violations:</span>
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            {validationResult.violations.map((vi: any, index: number) => (
                              <li key={index} className="flex items-start gap-1.5 p-2 bg-amber-50/50 rounded-lg border border-amber-100 text-slate-900">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>
                                  <strong>[{vi.type.replace('_',' ')}]</strong>: {vi.message} (elements: {vi.elementIds.join(', ')})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Visual alignments verified successfully. Elements stay correctly within canvas borders of format {activeBlueprint.canvasFormat} ({activeBlueprint.dimensions.width}px x {activeBlueprint.dimensions.height}px).
                        </p>
                      )}

                      {validationResult?.repairLogs && validationResult.repairLogs.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Automated Repair Actions</span>
                          <ul className="font-mono text-[10px] text-slate-600 space-y-1">
                            {validationResult.repairLogs.map((log: string, k: number) => (
                              <li key={k} className="flex items-center gap-1 list-none text-indigo-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <strong>REPAIR</strong>: {log}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* PHASE 9C: CONVERSION INTELLIGENCE ENGINE HUD */}
                    <div id="conversion-intelligence-dashboard" className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm space-y-6 font-sans text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-pink-600" />
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">Conversion Intelligence Engine Dashboard™</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Optimizing coordinates blueprint vectors for objective: <span className="font-bold text-pink-600 uppercase">[{campaignGoal}]</span></p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-pink-100 text-pink-700 px-2.5 py-1 rounded font-mono font-bold border border-pink-200">ACTIVE: PHASE 9C</span>
                      </div>

                      {/* MODULE 2: OFFER STRENGTH ANALYZER & MODULE 3: CTA INTELLIGENCE */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Offer Strength */}
                        {offerAnalysis && (
                          <div className={`p-4 rounded-xl border space-y-2.5 transition ${
                            offerAnalysis.overallScore < 70 ? 'bg-amber-50/40 border-amber-200/70' : 'bg-slate-50/70 border-slate-200/50'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-slate-500 block">Module 2 — Offer Strength</span>
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                offerAnalysis.overallScore < 70 ? 'bg-amber-100 text-amber-800' : 'bg-pink-100 text-pink-700'
                              }`}>{offerAnalysis.overallScore}/100 Score</span>
                            </div>
                            
                            <div>
                              <span className="text-slate-400 text-[9px] uppercase font-mono font-bold block">Analysis Grade</span>
                              <p className="text-slate-800 font-bold text-xs mt-0.5">Attractiveness: {offerAnalysis.incentiveAttractiveness}/100 | Friction: {offerAnalysis.frictionRisk}/100</p>
                            </div>

                            {/* Weakness recommendations threshold */}
                            {offerAnalysis.overallScore < 75 && (
                              <div className="bg-amber-50 border border-amber-200/65 p-2 rounded-lg text-[10px] text-amber-900 space-y-1">
                                <span className="font-bold uppercase block text-amber-800 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Recommendation Warnings:
                                </span>
                                <ul className="list-disc pl-3.5 space-y-0.5">
                                  {offerAnalysis.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CTA Intelligence */}
                        {ctaAnalysis && (
                          <div className="bg-slate-50/70 border border-slate-200/50 p-4 rounded-xl space-y-2.5 text-slate-900">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-slate-500 block">Module 3 — CTA Intelligence</span>
                              <span className="text-xs font-mono font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded">{ctaAnalysis.overallScore}/100 Score</span>
                            </div>

                            <div>
                              <span className="text-slate-400 text-[9px] uppercase font-mono font-bold block">Acoustic & Clarity Grade</span>
                              <p className="text-slate-800 font-bold text-xs mt-0.5">Urgency Signal: {ctaAnalysis.components.urgency}/100 | Click Incentive: {ctaAnalysis.components.reward}/100</p>
                            </div>

                            {ctaAnalysis.recommendations.length > 0 && (
                              <div className="bg-slate-100/50 p-2 rounded-lg text-[10px] text-slate-600">
                                <strong>Optimization Tips:</strong> "{ctaAnalysis.recommendations[0]}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* MODULE 4: BUYER PERSONA ALIGNMENT & MODULE 5: CHANNEL RECOMMENDATIONS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Buyer Persona */}
                        {personaAnalysis && (
                          <div className="bg-slate-50/70 border border-slate-200/50 p-4 rounded-xl space-y-2.5 text-slate-900">
                            <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-slate-500 block">Module 4 — Buyer Persona Relevance</span>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800">Target: {personaAnalysis.groupName}</span>
                              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">{personaAnalysis.fitScore}% FIT</span>
                            </div>

                            <div className="text-[11px] text-slate-600 bg-white/75 p-2 rounded border border-slate-100 space-y-1">
                              <div><strong>Pain Points Addressed</strong>: {personaAnalysis.painPointsAddressed.join(', ') || 'N/A'}</div>
                              <div><strong>Friction Risk</strong>: {personaAnalysis.criticism}</div>
                            </div>
                          </div>
                        )}

                        {/* Channel Recommendations */}
                        {channelRecommendations.length > 0 && (
                          <div className="bg-slate-50/70 border border-slate-200/50 p-4 rounded-xl space-y-2 text-slate-900">
                            <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-slate-500 block">Module 5 — Channel Allocation Engine</span>
                            
                            <div className="space-y-1.5">
                              {channelRecommendations.map((rec, i) => (
                                <div key={i} className="flex justify-between items-center text-xs bg-white/70 p-1.5 rounded border border-slate-100">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                    {rec.channel}
                                  </div>
                                  <div className="flex items-center gap-2 font-mono text-[10px]">
                                    <span className="text-slate-400">Match Weight: {rec.suitabilityWeight}%</span>
                                    <span className="text-pink-600 bg-pink-50 px-1 font-bold rounded">{rec.optimalFormat}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* MODULE 6: CONVERSION JURY & MODULE 7: PERFORMANCE FORECASTER */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Conversion Jury */}
                        {conversionJury && (
                          <div className="bg-slate-50/70 border border-slate-200/50 p-4 rounded-xl space-y-2.5 text-slate-900">
                            <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-slate-500 block">Module 6 — Conversion Jury Panel</span>
                            
                            <div className="space-y-2">
                              {conversionJury.members.map((j, i) => (
                                <div key={i} className="text-[10px] bg-white border border-slate-100 p-2 rounded-lg space-y-0.5">
                                  <div className="flex justify-between items-center font-bold text-slate-800">
                                    <span>{j.persona}</span>
                                    <span className="text-pink-600">{j.scoreApproved}/100 Approval</span>
                                  </div>
                                  <p className="text-slate-500 italic">" {j.critiqueFeedbacks} "</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Performance Forecasting */}
                        {performanceForecast && (
                          <div className="bg-slate-50/70 border border-slate-200/50 p-4 rounded-xl space-y-2.5 text-slate-900">
                            <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-slate-500 block">Module 7 — Marketing Performance Forecaster</span>
                            
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-white border rounded-lg p-2 shadow-sm text-slate-900">
                                <span className="text-[8px] text-slate-400 uppercase font-mono block font-bold">Estimated CTR</span>
                                <span className="text-sm font-extrabold text-pink-600 font-mono">{performanceForecast.ctr}%</span>
                              </div>
                              <div className="bg-white border rounded-lg p-2 shadow-sm text-slate-900">
                                <span className="text-[8px] text-slate-400 uppercase font-mono block font-bold">Conversion Rate</span>
                                <span className="text-sm font-extrabold text-pink-600 font-mono">{performanceForecast.conversionRate}%</span>
                              </div>
                              <div className="bg-white border rounded-lg p-2 shadow-sm text-slate-900">
                                <span className="text-[8px] text-slate-400 uppercase font-mono block font-bold">Inferred CPC</span>
                                <span className="text-sm font-extrabold text-slate-700 font-mono">${performanceForecast.cpc}</span>
                              </div>
                              <div className="bg-white border rounded-lg p-2 shadow-sm text-slate-900">
                                <span className="text-[8px] text-slate-400 uppercase font-mono block font-bold">Estimated CPA</span>
                                <span className="text-sm font-extrabold text-slate-700 font-mono">${performanceForecast.cpa}</span>
                              </div>
                            </div>

                            <p className="text-[9px] text-slate-400 italic">Expected Impression Elasticity: {performanceForecast.impressionsRange}. Calculated recursively using weighted buyer persona criteria.</p>
                          </div>
                        )}
                      </div>

                      {/* MODULE 8: A/B TEST GENERATOR™ (SWAPS ACTIVE ELEMENTS COLD) */}
                      {abVariants.length > 0 && (
                        <div className="bg-pink-50/20 border border-pink-100/70 p-4 rounded-xl space-y-3 font-sans">
                          <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-pink-700 block flex items-center gap-1">
                            <Sparkle className="w-3.5 h-3.5" /> Module 8 — A/B Test Alternative Layout Overrides
                          </span>
                          <p className="text-xs text-slate-500 leading-tight">These variations maintain perfect coordinate aspect-ratios. Select one to overwrite active copy elements dynamically:</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {abVariants.map((v, i) => (
                              <button
                                key={i}
                                onClick={() => handleSelectAbVariant(v)}
                                className={`p-3 text-left rounded-xl border transition shadow-sm cursor-pointer flex flex-col justify-between ${
                                  chosenVariantId === v.variantId ? 'bg-pink-100/50 border-pink-500 ring-1 ring-pink-500' : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 w-full">
                                  <span className="font-bold text-xs text-slate-800">{v.variantId}</span>
                                  <span className="text-[8px] font-bold font-mono uppercase bg-slate-100 text-slate-600 px-1 py-0.5 rounded">{v.emphasis}</span>
                                </div>
                                <div className="space-y-1 mt-2 flex-1">
                                  <div className="text-[10px] text-slate-600 truncate font-semibold">HQ Headline: "{v.headlineOverride}"</div>
                                  <div className="text-[10px] text-slate-500 truncate">CTA button: "{v.ctaOverride}"</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* MODULE 9: MARKETING EXPLAINABILITY */}
                      {explainability && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-sans text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <HelpCircle className="w-4 h-4 text-pink-600" />
                            <span>Module 9 — Decision Science & Cognitive Trigger Explainability</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                            <div className="space-y-1">
                              <strong className="text-slate-700 block uppercase text-[9px] tracking-wide font-mono">Why This Layout Coordinates Works:</strong>
                              <p className="text-slate-600 text-xs">{explainability.strategyRationale}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <strong className="text-slate-700 block uppercase text-[9px] tracking-wide font-mono">Cognitive Bias Triggers Injected:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {explainability.psychologicalTriggers.map((trig, idx) => (
                                  <span key={idx} className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded border border-pink-200/50">
                                    {trig}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MODULE 10: LEARNING FEEDBACK LOOP */}
                      <div className="pt-4 border-t border-slate-100 font-sans space-y-4">
                        <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-slate-500 block">Module 10 — Closed-Loop Learning Feedback Panel</span>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-900">
                          <div className="space-y-1 text-center md:text-left">
                            <strong className="text-slate-800 block text-xs">Pre-Launch Confidence Verdict Loop</strong>
                            <p className="text-[11px] text-slate-500 font-medium">Record this layout configuration to update the reinforcement-learning database models.</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            {/* Star rating selector */}
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border text-slate-900">
                              <span className="text-[10px] font-bold font-mono text-slate-400">Scorecard:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    className="p-0.5 focus:outline-none cursor-pointer"
                                  >
                                    <Star className={`w-4 h-4 ${star <= userRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Switches */}
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={publishedVariantFlag} 
                                  onChange={(e) => setPublishedVariantFlag(e.target.checked)}
                                  className="text-pink-600 h-4 w-4 rounded" 
                                />
                                <span>Tag Published</span>
                              </label>
                            </div>

                            <button
                              onClick={handleSaveConversionFeedback}
                              className="px-4 py-2 bg-slate-900 border border-slate-900 text-white font-mono text-[10px] font-bold rounded-xl hover:bg-slate-800 transition shadow-sm cursor-pointer"
                            >
                              Commit Telemetry Loop
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Layout Coordinate Blueprint Mappings Text List */}
                    <div className="bg-slate-900 border border-slate-950 text-white rounded-2xl p-6 space-y-4 shadow-lg font-mono">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Grid className="w-5 h-5 text-gray-400" />
                          <div>
                            <span className="text-xs uppercase text-slate-300 block font-bold">Universal Layout Blueprint Mapping</span>
                            <span className="text-[10px] text-slate-500 block">Blueprint Reference: {activeBlueprint.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {activeBlueprint.elements.map((el, i) => (
                          <div key={i} className="bg-slate-800/70 border border-white/5 rounded-xl p-3 text-xs flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">{el.elementId}</span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-white/10 text-slate-300 rounded font-bold uppercase">{el.type}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-sans mt-1">
                                <strong>Coordinates</strong>: left: <span className="text-slate-200">{el.x}px</span>, top: <span className="text-slate-200">{el.y}px</span>, dimension: <span className="text-slate-200">{el.width}px x {el.height}px</span> (zIndex: {el.zIndex})
                              </div>
                              {el.content && (
                                <div className="text-[10px] text-slate-500 font-sans block bg-slate-950/20 p-2 rounded-md border border-white/5 max-w-lg truncate">
                                  content: "{el.content}"
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right text-[10px] text-slate-500">
                              {el.constraints?.locked && <span className="text-amber-500 block">LOCKED</span>}
                              {el.styles?.fontFamily && <span className="block italic">{el.styles.fontFamily}</span>}
                              {el.styles?.backgroundColor && <span className="block font-bold">{el.styles.backgroundColor}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="text-center p-12 bg-white border border-dashed border-slate-300 rounded-2xl">
                  <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-slate-800 font-bold text-sm">Synchronize Coordinate Blueprint</h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">Select variables, then deploy the creative orchestrator model to compute precise coordinate schemas governed by automatic layout rules.</p>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: SEEDED PATTERNS LIBRARY */}
          {activeSubTab === 'library' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm font-sans text-slate-900">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Available Design Patterns Seed library</span>
              
              <div className="space-y-4">
                {SEEDED_DESIGN_PATTERNS.map((pat, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{pat.industry} - {pat.category} Pattern</h4>
                        <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-bold uppercase block mt-1 w-max">
                          layout structure: {pat.layoutStructure}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 p-1.5 rounded border">ID: {pat.id}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600">
                      <div>
                        <strong>Columns / Rows Grid</strong>: {pat.gridDefinition.columns} x {pat.gridDefinition.rows} (gutter: {pat.gridDefinition.gutter}px)
                      </div>
                      <div>
                        <strong>WhiteSpace breathing ratio</strong>: {Math.round(pat.whiteSpaceRatio * 100)}% margins
                      </div>
                      <div>
                        <strong>CTA Expected Alignment</strong>: {pat.ctaPositioning}
                      </div>
                      <div>
                        <strong>Typography guides</strong>: {pat.typographyScale.fontFamilyHeading} & {pat.typographyScale.fontFamilyBody}
                      </div>
                      <div>
                        <strong>Image Constraints</strong>: {pat.imagePlacementRules.minImages}-{pat.imagePlacementRules.maxImages} photos ({pat.imagePlacementRules.aspectRatios.join(', ')})
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-medium">
                      <strong>Strategist Conversion Strategy</strong>: {pat.conversionStrategy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: AUDIT HISTORY RECORDS */}
          {activeSubTab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-slate-900">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Persistent Design Blueprint Logs</span>
              
              {historyLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : historicalBlueprints.length > 0 ? (
                <div className="space-y-3">
                  {historicalBlueprints.map((hist, k) => (
                    <div key={k} className="border border-slate-100 rounded-xl p-4 text-xs font-sans text-slate-600 space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-800 font-bold block truncate max-w-xs">{hist.creativeType} Blueprint - {hist.industry}</span>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 border rounded text-slate-500">
                          {new Date(hist.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><strong>Reference ID</strong>: <span className="font-mono text-[10px]">{hist.id}</span></div>
                        <div><strong>Format</strong>: {hist.canvasFormat}</div>
                        <div><strong>Elements on Canvas</strong>: {hist.elements?.length || 0} nodes</div>
                        {hist.metadata?.targetPersona && (
                          <div className="col-span-2 text-slate-500"><strong>Target Segment</strong>: {hist.metadata.targetPersona}</div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setActiveBlueprint(hist);
                            const bounds = CANVAS_DIMENSIONS[hist.canvasFormat] || CANVAS_DIMENSIONS['A4 Portrait'];
                            setValidationResult(LayoutConstraintEngine.validateAndRepairLayout(hist.elements || [], hist.canvasFormat, bounds));
                            setDesignScore(DesignScoringFramework.calculateDetailedScore(hist, guideline));
                            setActiveSubTab('blueprint');
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border rounded font-bold font-mono text-[10px] text-slate-700 cursor-pointer shadow-sm"
                        >
                          Restore Coordinates Layout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400 text-xs font-mono">No historical coordinates blueprints in Firestore yet. Make a synthesis schema above.</div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
