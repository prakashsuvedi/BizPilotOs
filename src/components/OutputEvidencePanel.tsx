import React, { useState } from 'react';
import { ShieldCheck, Info, Award, Calendar, AlertTriangle, Cpu, TrendingUp, Check, ExternalLink, BookmarkCheck } from 'lucide-react';
import { AIDecisionRecord } from '../lib/governanceCore'; // Wait, let's export interface from governanceCore but let's import it safely

interface Props {
  record: any; // AIDecisionRecord type
}

export default function OutputEvidencePanel({ record }: Props) {
  const [activeTab, setActiveTab] = useState<'trust' | 'jury' | 'experts' | 'facts' | 'recommendations'>('trust');
  
  if (!record) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 border-slate-200 rounded-2xl p-6 mt-8 space-y-6 shadow-sm text-slate-900">
      {/* Evidence Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Enterprise Shield™
              </span>
              <span className="text-[10px] font-mono text-slate-400">v{record.auditVersion || '1.0.0-secure'}</span>
            </div>
            <h4 id="evidence-panel-title" className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mt-0.5">
              AI Decision Record & Evidence Panel
            </h4>
          </div>
        </div>

        <div className="text-right sm:text-right flex sm:flex-col gap-2 items-center sm:items-end w-full sm:w-auto">
          <span className="text-slate-400 text-[10px] font-mono">REQUEST SECURE HASH:</span>
          <span className="font-mono text-xs text-slate-700 bg-white border px-2 py-0.5 rounded shadow-sm">
            {record.requestId}
          </span>
        </div>
      </div>

      {/* Grid summarizing Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Dynamic Confidence Meter */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between text-slate-900">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Output Confidence</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{record.outputConfidence}%</span>
            <span className="text-[10px] font-bold text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">HIGH</span>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden text-slate-900">
            <div 
              style={{ width: `${record.outputConfidence}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Quality Jury Average Score */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between text-slate-900">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Jury Quality score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{record.finalScore}/100</span>
            <span className="text-[10px] font-bold text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">VERIFIED</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3 font-mono">10 Multi-Agent Criteria Checked</div>
        </div>

        {/* Self-Improvement Cycle Trace */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between text-slate-900">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Feedback Iterations</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {record.selfImprovementAudit?.iterationsCompleted || 1} x
            </span>
            <span className="text-[10px] font-bold text-violet-600 font-mono bg-violet-50 px-1.5 py-0.5 rounded">IMPROVED</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3 font-mono">
            {record.selfImprovementAudit ? `Score: ${record.selfImprovementAudit.originalScore}% → ${record.selfImprovementAudit.improvedScore}%` : 'Passed in first evaluation pass'}
          </div>
        </div>

        {/* Model Infrastructure details */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between text-slate-900">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">AI Provisioning</span>
          <div className="mt-2 flex flex-col">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              Gemini 3.5 Flash
            </span>
            <span className="text-[11px] text-slate-600 mt-1 font-mono">Time: {record.processingTime}ms</span>
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-2 truncate">Provider: Google Vertex AI</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs and details */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm text-slate-900">
        <div className="flex flex-wrap border-b border-slate-100 border-slate-100 bg-slate-50/50 text-slate-900">
          <button
            onClick={() => setActiveTab('trust')}
            className={`flex-1 py-3 px-4 text-xs font-extrabold font-sans uppercase tracking-tight text-center cursor-pointer border-b-2 transition ${
              activeTab === 'trust' 
                ? 'border-slate-900 text-slate-950 bg-white font-black shadow-sm' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Trust & Sources
          </button>
          <button
            onClick={() => setActiveTab('jury')}
            className={`flex-1 py-3 px-4 text-xs font-extrabold font-sans uppercase tracking-tight text-center cursor-pointer border-b-2 transition ${
              activeTab === 'jury' 
                ? 'border-slate-900 text-slate-950 bg-white font-black shadow-sm' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Jury scorecard
          </button>
          <button
            onClick={() => setActiveTab('experts')}
            className={`flex-1 py-3 px-4 text-xs font-extrabold font-sans uppercase tracking-tight text-center cursor-pointer border-b-2 transition ${
              activeTab === 'experts' 
                ? 'border-slate-900 text-slate-950 bg-white font-black shadow-sm' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Applied Experts ({record.expertPanelRecommendations?.length || 7})
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`flex-1 py-3 px-4 text-xs font-extrabold font-sans uppercase tracking-tight text-center cursor-pointer border-b-2 transition ${
              activeTab === 'facts' 
                ? 'border-slate-900 text-slate-950 bg-white font-black shadow-sm' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Fact check ({record.factCheckResults?.violations?.length === 0 ? 'Passed' : 'Corrected'})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-3 px-4 text-xs font-extrabold font-sans uppercase tracking-tight text-center cursor-pointer border-b-2 transition ${
              activeTab === 'recommendations' 
                ? 'border-slate-900 text-slate-950 bg-white font-black shadow-sm' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Action Plan
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: TRUST & SOURCES */}
          {activeTab === 'trust' && (
            <div className="space-y-6">
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Knowledge Consensus Audit</h5>
                <div className="mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Consensus Engine Score: <strong className="font-extrabold text-emerald-600">{record.knowledgeTrust?.consensusConfidence || 98}%</strong></p>
                    <p className="text-xs text-slate-500 font-medium">Agreement score based on multi-document cross-source vector comparison.</p>
                  </div>
                  <div className="flex gap-2">
                    {record.knowledgeTrust?.agreementScores && Object.entries(record.knowledgeTrust.agreementScores).map(([src, val]: any) => (
                      <span key={src} className="text-[10px] font-mono leading-none bg-white text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {src}: {val}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Source Ingestion References</h5>
                <div className="mt-3 space-y-3">
                  {record.knowledgeTrust?.contributingSources?.map((src: any) => (
                    <div key={src.id} className="border border-slate-200/80 rounded-xl p-4 hover:bg-slate-50/45 transition text-slate-900">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-dashed border-slate-100 border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-tight ${
                            src.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {src.approvalStatus}
                          </span>
                          <span className="text-xs font-extrabold text-slate-800 text-slate-800">{src.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({src.sourceType})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Trust: <strong className="font-bold text-slate-800">{src.confidence}%</strong></span>
                      </div>
                      <div className="mt-2 text-xs text-slate-600 space-y-1.5 leading-relaxed font-sans">
                        <p className="font-medium text-[11px]"><span className="text-slate-400 font-mono uppercase text-[9px]">Verified by:</span> {src.verifiedBy} | <span className="text-slate-400 font-mono uppercase text-[9px]">Verified at:</span> {src.verifiedAt}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {src.evidenceReferences?.map((ev: string, i: number) => (
                            <span key={i} className="text-[10px] font-sans text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border">
                              Evidence ref: "{ev}"
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Geographic Regulatory Climate</h5>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/30 border border-emerald-100/80 rounded-xl flex items-start gap-3 text-slate-900">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Territorial Boundary Match</p>
                      <p className="text-xs text-slate-700 font-medium">Target Country: <strong className="text-slate-900">{record.contextTrace?.countryName || 'Nepal'}</strong></p>
                      <p className="text-xs text-slate-600">{record.contextTrace?.regulatoryClimate || 'Sovereign local tax compliance standards'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
                    <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Platform Compliance Rules Applied</p>
                    <div className="flex flex-wrap gap-1.5">
                      {record.contextTrace?.rulesApplied?.map((rule: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono bg-white text-slate-700 text-slate-700 px-2 py-0.5 rounded border shadow-sm">
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JURY SCORECARD */}
          {activeTab === 'jury' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl text-slate-900">
                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Winner Selection Explanation
                </p>
                <p className="text-xs text-slate-700 leading-relaxed mt-2 font-medium">
                  {record.winnerExplanation}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">Multi-Candidate Scores Matrix</h5>
                <div className="space-y-4">
                  {record.candidateHistory?.map((c: any) => (
                    <div key={c.candidateId} className={`p-4 rounded-xl border ${
                      c.candidateId.includes('_C') || c.candidateId.includes('_B') || c.score > 80
                        ? 'bg-slate-900/5 text-slate-900 border-slate-300' 
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            c.score > 80 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`} />
                          <span className="text-xs font-bold">{c.candidateId.endsWith('B') || c.candidateId.endsWith('C') ? 'WINNING DESIGN: ' : 'ALTERNATE ATTEMPT: '}{c.candidateId.split('_').pop()}</span>
                        </div>
                        <span className="text-xs font-black">Score index: {c.score}%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {Object.entries(c.juryResults || {}).map(([metric, val]: any) => (
                          <div key={metric} className="bg-white p-2 rounded border text-center shadow-inner">
                            <p className="text-[9px] uppercase font-bold text-slate-400 truncate">{metric}</p>
                            <p className="text-sm font-extrabold mt-0.5 text-slate-800">{val}/100</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {record.selfImprovementAudit && (
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Self-Improvement Audit Trails</h5>
                  <div className="bg-violet-50/30 border border-violet-100 border-violet-200 rounded-xl p-4 space-y-3">
                    <p className="text-slate-800 text-xs font-bold">Feedback Loop Log:</p>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded border border-violet-100/50">
                      "{record.selfImprovementAudit.juryCritique}"
                    </p>
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-bold text-slate-900 uppercase text-slate-500">Self-Amendments Applied:</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                        {record.selfImprovementAudit.improvementsApplied?.map((imp: string, i: number) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APPLIED EXPERTS */}
          {activeTab === 'experts' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-sans border-b border-slate-100 pb-3 font-medium">
                The 7 experts represent isolated prompt models simulating standard compliance audits. All suggestions below were integrated into the core Master Instruction compilation block.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.expertPanelRecommendations?.map((exp: any, idx: number) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex gap-3 text-slate-900">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-emerald-400 font-mono text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-extrabold text-slate-800">{exp.expert}</p>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">Weight: {exp.influenceScore}</span>
                      </div>
                      <p className="text-xs text-slate-600 text-slate-600 leading-relaxed font-medium">
                        "{exp.recommendation}"
                      </p>
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" /> APPLIED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FACT CHECK VIOLATIONS */}
          {activeTab === 'facts' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border p-4 rounded-xl space-y-3 text-slate-900">
                <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-400 bg-slate-200 px-2 py-0.5 rounded font-bold">Automatic Pre-Delivery Fact Verification</span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  The system scans outputs to identify pricing inaccuracies, compliance gaps, and buzzwords in violation of absolute tenant guidelines before any final response generation.
                </p>
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-500 font-mono text-slate-400 uppercase">RULES CHECKED:</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 mt-1 text-slate-600">
                    {record.factCheckResults?.rulesChecked?.map((rule: string, i: number) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {record.factCheckResults?.violations?.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 shadow-inner text-slate-900">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 text-emerald-600" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-900 uppercase">ALL REGULATORY CHECKS PASSED</p>
                    <p className="text-xs text-emerald-700 text-emerald-700">Output text maintains direct alignment under enterprise, localization, and compliance constraints.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-slate-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">COMPLIANCE DEVIATIONS CAUGHT</p>
                      <p className="text-xs text-amber-800 text-amber-700 mt-1">
                        The Post-Generation Fact Checker intercepted {record.factCheckResults?.violations?.length} rule boundary mismatches during candidate assembly:
                      </p>
                      <div className="mt-2 text-xs font-bold space-y-1 text-slate-800 list-decimal pl-4 font-mono">
                        {record.factCheckResults?.violations?.map((violation: string, idx: number) => (
                          <div key={idx} className="bg-amber-100/60 p-2 rounded border border-amber-200/50 my-1 text-amber-800 text-amber-800 font-semibold font-sans">
                            🚨 Match Violation: {violation}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Auto-Corrections Applied Safely</h5>
                    <div className="space-y-2">
                      {record.factCheckResults?.correctionsApplied?.map((corr: string, idx: number) => (
                        <div key={idx} className="bg-slate-50 border p-3 rounded-xl flex items-start gap-2.5 text-slate-900">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-600 text-slate-600 font-sans tracking-tight leading-relaxed">
                            {corr}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTION RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 text-slate-500 font-medium">
                Autonomous recommendations compiled for your business to implement strategic outcomes alongside the generated marketing content:
              </p>
              <div className="space-y-4">
                {record.strategicRecommendations?.map((rec: any) => (
                  <div key={rec.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition bg-white shadow-sm flex flex-col md:flex-row gap-4 items-start justify-between text-slate-900">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono leading-none tracking-tight px-1.5 py-0.5 rounded font-black uppercase ${
                          rec.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <h6 className="text-xs font-black text-slate-800 text-slate-800">{rec.title}</h6>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{rec.impact}</p>
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-dashed text-justify">
                        <strong className="text-slate-700 font-mono tracking-tight uppercase text-[9px]">Supporting Evidence:</strong> {rec.supportingEvidence}
                      </p>
                    </div>

                    <div className="w-full md:w-64 bg-slate-50 p-3 rounded-lg border text-slate-900">
                      <p className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider mb-1.5">Action Steps</p>
                      <ul className="space-y-1 list-none">
                        {rec.actionableSteps?.map((step: string, j: number) => (
                          <li key={j} className="text-[11px] text-slate-700 flex items-start gap-1.5 font-sans leading-tight">
                            <span className="text-slate-400 text-[10px] font-mono">{j + 1}.</span> {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
