import React, { useState, useEffect } from 'react';
import { BusinessProfile, CustomerPersona, MarketPositioning } from '../types';
import { User, Target, Compass, Award, ShieldAlert, ArrowRight, Copy, Check, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { clientDb } from '../lib/firebase';
import OutputEvidencePanel from './OutputEvidencePanel';

interface Props {
  profile: BusinessProfile;
  personas: CustomerPersona[];
  positioning: MarketPositioning | null;
  onUpdate: (personas: CustomerPersona[], positioning: MarketPositioning) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

export default function AgentStrategist({
  profile,
  personas,
  positioning,
  onUpdate,
  isGenerating,
  setIsGenerating,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [governanceRecord, setGovernanceRecord] = useState<any>(null);

  useEffect(() => {
    // Prime of latest decision records for strategist type
    const loadLatestGovernance = async () => {
      if (!profile || !profile.tenantId) return;
      try {
        const records = await clientDb.getCollection('ai_decision_records', profile.tenantId);
        const ordered = records
          .filter((idx: any) => idx.generationType === 'strategist')
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (ordered.length > 0) {
          setGovernanceRecord(ordered[0]);
        }
      } catch (e) {
        console.warn("Could not retrieve strategic decision log", e);
      }
    };
    loadLatestGovernance();
  }, [profile, positioning]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSynthesize = async () => {
    setIsGenerating(true);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/agent/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123' },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error('Failed to run strategic generator');
      const data = await res.json();
      if (data.personas && data.positioning) {
        onUpdate(data.personas, data.positioning);
        if (data.governanceData) {
          setGovernanceRecord(data.governanceData);
        } else {
          // Fallback if not inside payload: pull live from collection
          setTimeout(async () => {
            const list = await clientDb.getCollection('ai_decision_records', profile.tenantId || "demo-tenant");
            const filtered = list.filter((r: any) => r.generationType === 'strategist')
              .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (filtered.length > 0) setGovernanceRecord(filtered[0]);
          }, 800);
        }
      } else {
        throw new Error('Incomplete data response from strategist');
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus('The workspace was unable to compile the AI Strategy report. Utilizing localized fallback templates.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Officer Header Card */}
      <div id="strategist-agent-officer" className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm text-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-200/60">
                ACTIVE STRATEGIST AGENT
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1 font-sans">Strategic Intelligence Synthesis</h2>
            <p className="text-slate-500 text-sm mt-0.5">Analysing target demographics, competitive SWOT parameters, and positioning thesis.</p>
          </div>
        </div>

        <button
          id="btn-trigger-strategist"
          onClick={handleSynthesize}
          disabled={isGenerating}
          className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Synthesizing Brand Intelligence...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              {positioning ? 'Re-Synthesize Strategy' : 'Synthesize Customer Personas & Market Positioning'}
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

      {!positioning && !isGenerating && (
        <div id="strategist-empty-state" className="border border-dashed border-slate-300 bg-white rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Target className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-slate-800 font-bold text-lg">No Brand Strategy Synthesized Yet</h3>
          <p className="text-slate-500 text-sm mt-2">
            Deploy the Marketing Strategist Agent to conduct comprehensive customer research, map user stories, and formulate your enterprise-grade SWOT analysis guidelines.
          </p>
          <button
            id="btn-empty-trigger-strategist"
            onClick={handleSynthesize}
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-slate-800 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-white/80" />
            Synthesize Market Data
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="space-y-6">
          <div className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse p-6 text-slate-900">
            <div className="h-6 w-36 bg-slate-100 rounded mb-4 text-slate-900"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded text-slate-900"></div>
              <div className="h-4 w-5/6 bg-slate-100 rounded text-slate-900"></div>
              <div className="h-4 w-4/6 bg-slate-100 rounded text-slate-900"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-60 bg-white border border-slate-200 rounded-2xl animate-pulse text-slate-900"></div>
            <div className="h-60 bg-white border border-slate-200 rounded-2xl animate-pulse text-slate-900"></div>
          </div>
        </div>
      )}

      {positioning && !isGenerating && (
        <div className="space-y-10">
          {/* Section 1: Customer Personas */}
          <div id="strategist-personas-section" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Target Customer Personas
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">Highly targeted profiles outlining pain points, aspirations, and triggers.</p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">2 Segments Mapped</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personas.map((persona, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-400/80 hover:shadow-md transition-all duration-300 text-slate-900">
                  <div className="p-6 bg-gradient-to-r from-indigo-50/30 to-transparent border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{persona.name}</h4>
                      <p className="text-indigo-600 text-xs font-mono mt-0.5 font-bold uppercase">{persona.role}</p>
                    </div>
                    <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200 font-bold text-sm">
                      0{idx + 1}
                    </span>
                  </div>

                  <div className="p-6 space-y-4 text-sm">
                    {/* Demographics */}
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-mono font-bold">Demographics</span>
                      <p className="text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-1.50 font-mono text-xs font-medium">{persona.demographics || "US Suburbs / Professional Sector"}</p>
                    </div>

                    {/* Pain Points */}
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-mono font-bold">Core Pain Points</span>
                      <ul className="mt-2 space-y-2">
                        {persona.painPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span>
                            <span className="text-slate-600 font-medium">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Goals */}
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-mono font-bold">Key Goals & Targets</span>
                      <ul className="mt-2 space-y-2">
                        {persona.goals.map((g, gIdx) => (
                          <li key={gIdx} className="flex items-start gap-2.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2"></span>
                            <span className="text-slate-600 font-medium">{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Channels & Triggers */}
                    <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-mono font-bold">Top Channels</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {persona.preferredChannels.map((ch, cIdx) => (
                            <span key={cIdx} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-semibold uppercase">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-mono font-bold">Buying Trigger</span>
                        <p className="text-slate-600 text-xs mt-1.5 leading-relaxed font-medium line-clamp-2" title={persona.buyingTriggers}>
                          {persona.buyingTriggers}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Market Positioning Matrix */}
          <div id="strategist-positioning-section" className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Positioning Frame & Value Proposition
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">Corporate taglines, elevator thesis, and competitive barrier design.</p>
              </div>
            </div>

            {/* Tagline and Elevator Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 lg:col-span-1 flex flex-col justify-between text-slate-900">
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-200/65">
                    MASTER TAGLINE
                  </span>
                  <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-4 leading-relaxed font-sans italic">
                    "{positioning.tagline}"
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(positioning.tagline, 'tagline')}
                  className="mt-6 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copiedKey === 'tagline' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      Copy Tagline
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between text-slate-900">
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    ELEVATOR PITCH
                  </span>
                  <p className="text-slate-600 text-sm leading-relaxed mt-4 font-medium">
                    {positioning.elevatorPitch}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(positioning.elevatorPitch, 'elevator')}
                  className="mt-6 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition self-end cursor-pointer"
                >
                  {copiedKey === 'elevator' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      Copied Pitch
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      Copy Elevator Pitch
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SWOT Bento Grid */}
            <div id="strategist-swot-matrix" className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">SWOT Analysis Framework</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/30 border border-emerald-200 rounded-xl p-5 hover:bg-emerald-100/40 transition shadow-sm text-slate-900">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-3 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    STRENGTHS
                  </div>
                  <ul className="space-y-2 text-slate-600 text-xs font-medium">
                    {positioning.swotAnalysis.strengths.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-emerald-600 font-mono font-bold">↳</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/30 border border-rose-200 rounded-xl p-5 hover:bg-rose-100/40 transition shadow-sm">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-3 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    WEAKNESSES
                  </div>
                  <ul className="space-y-2 text-slate-600 text-xs font-medium">
                    {positioning.swotAnalysis.weaknesses.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-rose-600 font-mono font-bold">↳</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-cyan-50/30 border border-cyan-200 rounded-xl p-5 hover:bg-cyan-100/40 transition shadow-sm">
                  <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs mb-3 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    OPPORTUNITIES
                  </div>
                  <ul className="space-y-2 text-slate-600 text-xs font-medium">
                    {positioning.swotAnalysis.opportunities.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-cyan-600 font-mono font-bold">↳</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-amber-50/30 border border-amber-200 rounded-xl p-5 hover:bg-amber-100/40 transition shadow-sm text-slate-900">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-3 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 bg-amber-500"></span>
                    THREATS
                  </div>
                  <ul className="space-y-2 text-slate-600 text-xs font-medium">
                    {positioning.swotAnalysis.threats.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-amber-600 font-mono font-bold">↳</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Value Prop & Competitor Defense Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50/30 transition text-slate-900">
                <span className="text-slate-400 text-slate-400 text-xs font-bold font-mono tracking-wider uppercase block">Enterprise Value Proposition</span>
                <p className="text-slate-700 text-sm mt-2 leading-relaxed font-sans font-medium">{positioning.valueProposition}</p>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50/30 transition text-slate-900">
                <span className="text-slate-400 text-slate-400 text-xs font-bold font-mono tracking-wider uppercase block">De-positioning Competitors Defense</span>
                <p className="text-slate-700 text-sm mt-2 leading-relaxed font-sans font-medium">{positioning.competitorDefenses}</p>
              </div>
            </div>

            {/* Evidence & Governance Record */}
            {governanceRecord && (
              <OutputEvidencePanel record={governanceRecord} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
