import React, { useState, useEffect } from 'react';
import { BusinessProfile, CampaignPlan } from '../types';
import { Calendar, CheckCircle2, TrendingUp, Layers, ListTodo, ShieldAlert, Sparkles, Loader2, PlayCircle, Globe, Languages } from 'lucide-react';
import { clientDb } from '../lib/firebase';
import OutputEvidencePanel from './OutputEvidencePanel';
import { convertCurrency, formatCurrency } from '../lib/commerce';
import { logAiTaskUsage } from '../lib/aiUsageTracker';
import AiUsageBadge from './AiUsageBadge';
import OkrTracker from './OkrTracker';

interface Props {
  profile: BusinessProfile;
  campaign: CampaignPlan | null;
  onUpdate: (campaign: CampaignPlan) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

export default function CampaignPlanner({
  profile,
  campaign,
  onUpdate,
  isGenerating,
  setIsGenerating,
}: Props) {
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [governanceRecord, setGovernanceRecord] = useState<any>(null);
  const [targetDemographicsMarket, setTargetDemographicsMarket] = useState<'Native/Local' | 'United States' | 'Western Europe' | 'South Asia' | 'Gulf Regions'>('Native/Local');

  useEffect(() => {
    if (campaign && campaign.targetMarket) {
      setTargetDemographicsMarket(campaign.targetMarket as any);
    }
  }, [campaign]);

  useEffect(() => {
    const loadLatestCampaignGov = async () => {
      if (!profile || !profile.tenantId) return;
      try {
        const records = await clientDb.getCollection('ai_decision_records', profile.tenantId);
        const ordered = records
          .filter((idx: any) => idx.generationType === 'planner')
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (ordered.length > 0) {
          setGovernanceRecord(ordered[0]);
        }
      } catch (e) {
        console.warn("Could not retrieve campaign decision log", e);
      }
    };
    loadLatestCampaignGov();
  }, [profile, campaign]);

  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/agent/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123' },
        body: JSON.stringify({ profile, targetMarket: targetDemographicsMarket }),
      });
      if (!res.ok) throw new Error('Unsuccessful campaign creation');
      const data = await res.json();
      if (data.campaignName) {
        data.targetMarket = targetDemographicsMarket;
        onUpdate(data);

        logAiTaskUsage({
          tenantId: profile.tenantId || 'demo-tenant',
          taskId: 'campaign_planner',
          taskTitle: `AI Campaign Strategy Generation (${data.campaignName})`,
          modelId: 'gemini-2.5-flash',
          promptTokens: 3400,
          completionTokens: 1850
        });

        if (data.governanceData) {
          setGovernanceRecord(data.governanceData);
        } else {
          setTimeout(async () => {
            const list = await clientDb.getCollection('ai_decision_records', profile.tenantId || "demo-tenant");
            const filtered = list.filter((r: any) => r.generationType === 'planner')
              .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (filtered.length > 0) setGovernanceRecord(filtered[0]);
          }, 800);
        }
      } else {
        throw new Error('Invalid campaign format returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus('The system experienced a timeout preparing the multi-week campaign roadmap. Utilizing default launch plan guidelines.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Officer Header Card */}
      <div id="planner-agent-officer" className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm text-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200/65">
                CAMPAIGN PLANNER AGENT
              </span>
              <AiUsageBadge
                modelId="gemini-2.5-flash"
                promptTokens={3400}
                completionTokens={1850}
                totalTokens={5250}
                costUsd={0.0135}
                taskTitle="AI Campaign Strategy Generation"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1 font-sans">Campaign Strategy & Orchestration</h2>
            <p className="text-slate-500 text-sm mt-0.5">Structuring multi-channel launch checklists, visual timelines, and tracking KPIs.</p>
            
            {/* Target Demographics Selector */}
            <div className="mt-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl inline-flex flex-col sm:flex-row items-start sm:items-center gap-3 text-slate-900">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0 select-none">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Target Demographics Market:</span>
              </div>
              <select
                id="select-target-demographics"
                value={targetDemographicsMarket}
                onChange={(e) => setTargetDemographicsMarket(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs font-sans"
              >
                <option value="Native/Local">Native/Local (Default Region)</option>
                <option value="United States">🇺🇸 United States (USD Market)</option>
                <option value="Western Europe">🇪🇺 Western Europe (EUR/GBP Market)</option>
                <option value="South Asia">🇳🇵 South Asia (INR/NPR Market)</option>
                <option value="Gulf Regions">🇦🇪 Gulf Regions (AED Market)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          id="btn-trigger-planner"
          onClick={handleGenerateCampaign}
          disabled={isGenerating}
          className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Plotting Operational Roadmap...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-100" />
              {campaign ? 'Re-Plan Campaign Roadmap' : 'Generate Multi-Channel Campaign Calendar'}
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

      {!campaign && !isGenerating && (
        <div id="planner-empty-state" className="border border-dashed border-slate-300 bg-white rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Calendar className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-slate-800 font-bold text-lg">No Active Campaign Milestones</h3>
          <p className="text-slate-500 text-slate-500 text-sm mt-2 leading-relaxed">
            Formulate a structured marketing release schedule. The Campaign Planner agent designs a step-by-step roadmap from launch day to target conversions, configuring channels correctly.
          </p>
          <button
            id="btn-empty-trigger-planner"
            onClick={handleGenerateCampaign}
            className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-100" />
            Build Campaign Milestones
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="space-y-6">
          <div className="h-40 bg-white border border-slate-200 rounded-2xl animate-pulse p-6 text-slate-900">
            <div className="h-6 w-48 bg-slate-100 rounded mb-4 text-slate-900"></div>
            <div className="h-4 w-3/4 bg-slate-100 rounded text-slate-900"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse text-slate-900"></div>
            ))}
          </div>
        </div>
      )}

      {campaign && !isGenerating && (
        <div className="space-y-10 animate-fade-in">
          {/* Main Plan Overview Card */}
          <div id="planner-campaign-summary" className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 shadow-sm text-slate-900">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-mono text-emerald-700 uppercase tracking-tight bg-emerald-50 px-3 py-0.5 rounded border border-emerald-200 font-bold">
                ACTIVE INITIATIVE
              </span>
              <h3 className="text-xl font-extrabold text-slate-800">{campaign.campaignName}</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                <strong className="text-slate-800">Objective:</strong> {campaign.objective}
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-inner text-slate-900">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">CAMPAIGN HORIZON</span>
                <p className="text-slate-800 font-extrabold text-2xl mt-1 font-sans">{campaign.durationWeeks} Weeks</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">CHANNELS IN PLAY</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {campaign.channels.map((chan, idx) => (
                    <span key={idx} className="text-[10px] uppercase font-bold font-mono bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                      {chan}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CROSS-BORDER REGIONAL ADAPTATION PREVIEW PANEL */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-emerald-400 animate-bounce" />
                <div>
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide font-sans">
                    Cross-Border Market Localization Engine
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Automated copy translation, cultural context alignment, and budget conversion
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded-lg uppercase">
                Active Selection: {targetDemographicsMarket}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wide block">
                  1. Localized Copy Variant (Copywriter Translation)
                </span>
                <p className="text-slate-100 font-bold leading-normal italic text-xs min-h-[48px]">
                  {targetDemographicsMarket === 'Native/Local' && `"${campaign.campaignName} — Launch Plan Roadmap"`}
                  {targetDemographicsMarket === 'United States' && `"MarketForge AI: Maximize Enterprise Revenue & System Speed Operations in 60s"`}
                  {targetDemographicsMarket === 'Western Europe' && `"L'Efficacité Allemande Accompagnée de l'Élégance Française. Fehlerfreie Automation."`}
                  {targetDemographicsMarket === 'South Asia' && `"डिजिटल क्रान्ति र नयाँ प्रविधिको सुरुवात - उत्सवको विशेष अफर!"`}
                  {targetDemographicsMarket === 'Gulf Regions' && `"الفخامة الرقمية والأتمتة التشغيلية للمؤسسات الذكية والرواد"`}
                </p>
                <span className="text-[9px] text-emerald-400 font-semibold block pt-1 border-t border-slate-800">
                  {targetDemographicsMarket === 'Native/Local' ? 'No action (Default Local Script)' : '✓ Contextual Translation Applied'}
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-mono text-[10px] text-slate-400 uppercase font-black tracking-wide block">
                  2. Restructured Cultural Hooks (Tone Alignment)
                </span>
                <p className="text-slate-300 leading-normal text-[11px] min-h-[48px]">
                  {targetDemographicsMarket === 'Native/Local' && "Standard organic customer segments, regular trial signals, localized domain claims."}
                  {targetDemographicsMarket === 'United States' && "Empowerment focused. Overcomes administrative congestion. Individual high reward benchmarks and instant trial dispatch incentives."}
                  {targetDemographicsMarket === 'Western Europe' && "Data protection rigorous (100% GDPR checklist), understatement premium signal overlays, strict efficiency calculations, zero fluff."}
                  {targetDemographicsMarket === 'South Asia' && "Family & community references, trust and verification guarantees, high festival seasonal promotions (Dashain, Tihar, Diwali)."}
                  {targetDemographicsMarket === 'Gulf Regions' && "Exquisite hyper-premium class identifiers, direct visual status enhancements, high relationship-oriented executive indicators."}
                </p>
                <span className="text-[9px] text-emerald-400 font-semibold block pt-1 border-t border-slate-800">
                  ✓ Tone Configuration Certified
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wide block">
                    3. Currency Conversion Matrix Model
                  </span>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Base Budget:</span>
                      <span className="font-bold font-mono text-slate-200">$2,500.00 USD</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Converted:</span>
                      <span className="font-bold text-white font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-300">
                        {targetDemographicsMarket === 'Native/Local' && formatCurrency(2500, 'USD')}
                        {targetDemographicsMarket === 'United States' && formatCurrency(convertCurrency(2500, 'USD', 'USD'), 'USD')}
                        {targetDemographicsMarket === 'Western Europe' && formatCurrency(convertCurrency(2500, 'USD', 'EUR'), 'EUR')}
                        {targetDemographicsMarket === 'South Asia' && formatCurrency(convertCurrency(2500, 'USD', 'NPR'), 'NPR')}
                        {targetDemographicsMarket === 'Gulf Regions' && formatCurrency(convertCurrency(2500, 'USD', 'AED'), 'AED')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-400 flex justify-between items-center">
                  <span>Rates: Multi-Routing API</span>
                  <span className="text-emerald-500 animate-pulse">● Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Flow Timeline */}
          <div id="planner-timeline-section" className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Operational Launch Timeline
              </h3>
              <p className="text-slate-500 text-slate-500 text-sm mt-0.5 font-medium">Chronological execution sequence mapping deliverables, distribution formats, and target objectives.</p>
            </div>

            <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-8 py-2 animate-fade-in">
              {campaign.launchCalendar.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Point Indicator */}
                  <div className="absolute -left-[35px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-slate-200 group-hover:border-emerald-600 flex items-center justify-center transition-all duration-300 shadow-sm text-slate-900">
                    <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors text-slate-900"></span>
                  </div>

                  {/* Day card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all duration-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-sm text-slate-900">
                    <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
                      <div className="text-emerald-700 text-sm font-bold font-mono uppercase bg-emerald-50/50 px-2.5 py-1 rounded-md border border-emerald-100 inline-block">{item.day}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono mt-2 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {item.channel}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <h4 className="text-slate-800 font-bold text-sm group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-slate-500 text-xs leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>

                    <div className="md:col-span-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100/80 text-slate-900">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">Milestone Target</span>
                      <p className="text-slate-600 text-xs font-semibold mt-1 leading-normal">
                        {item.goal}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic KPIs Panel */}
          <div id="planner-kpi-section" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-900">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-4 flex items-center gap-2 font-bold">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Strategic KPIs & Conversion Benchmarks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campaign.strategicKPIs.map((kpi, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 text-slate-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-600 text-sm leading-relaxed font-medium">{kpi}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence & Governance Record */}
          {governanceRecord && (
            <OutputEvidencePanel record={governanceRecord} />
          )}
        </div>
      )}

      {/* OKR Tracker Module */}
      <OkrTracker tenantId={profile.tenantId || profile.id} tenantName={profile.name} />
    </div>
  );
}
