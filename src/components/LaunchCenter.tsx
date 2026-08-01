import React, { useState } from 'react';
import { 
  Rocket, 
  Play, 
  Square, 
  RotateCw, 
  Sparkles, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Terminal,
  Cpu,
  Loader2
} from 'lucide-react';

interface Parameter {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'range';
  value: string;
  options?: string[];
  min?: number;
  max?: number;
}

export default function LaunchCenter() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeWorkflow, setActiveWorkflow] = useState('agent_prospector');
  const [logOutputs, setLogOutputs] = useState<string[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([
    { id: '1', name: 'creativity_node', label: 'Model Temperature', type: 'range', value: '0.7', min: 0.1, max: 1.0 },
    { id: '2', name: 'target_platform', label: 'Target Channels', type: 'select', value: 'LinkedIn', options: ['LinkedIn', 'Twitter', 'Search Ads', 'All Channels'] },
    { id: '3', name: 'execution_runs', label: 'Execution Run Cycles', type: 'select', value: '10', options: ['5', '10', '25', '100'] },
    { id: '4', name: 'context_prompt', label: 'Autonomous System Role Prompt', type: 'text', value: 'Identify enterprise SaaS buyers with matching high-intent job profiles.' }
  ]);

  const workflows = [
    { id: 'agent_prospector', title: 'Intent Prospector Grid', desc: 'Queries social platforms for lead engagement profiles.', icon: Cpu },
    { id: 'creative_forge', title: 'Ad Creative Auto-Forge', desc: 'Compiles creative layout versions and copies.', icon: Sparkles },
    { id: 'seo_indexing_monitor', title: 'SEO Velocity Indexer', desc: 'Crawls index rankings and pushes sitemap updates.', icon: Rocket },
  ];

  const handleRunWorkflow = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setLogOutputs([]);

    const steps = [
      'Bootstrapping agent context models...',
      'Injecting hyperparameters and prompt parameters...',
      'Connecting to outbound social platform hooks...',
      'Synthesizing target segment identifiers...',
      'Refining multi-language content variations...',
      'Synchronizing completed datasets to Firestore schema...',
      'Workflow completed with total code status 200.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }

        // Add log outputs periodically
        if (currentStep < steps.length && prev >= (currentStep + 1) * 14) {
          setLogOutputs((old) => [...old, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
          currentStep++;
        }

        return prev + 2;
      });
    }, 100);
  };

  const handleStopWorkflow = () => {
    setIsRunning(false);
    setProgress(0);
    setLogOutputs((old) => [...old, `[${new Date().toLocaleTimeString()}] ❌ Workflow execution aborted by supervisor.`]);
  };

  const updateParameter = (id: string, value: string) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, value } : p));
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <section className="bg-[#0e101a] border border-white/5 p-6 rounded-2xl shadow-sm">
        <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-400" /> Pipeline Launch Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure hyperparameter models, select target pipelines, and launch production workflows on the OmniCore grid.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Workflow Selection & Parameters - 7 columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Select Workflow */}
          <div className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" /> 1. Select Target Workflow
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {workflows.map((flow) => {
                const Icon = flow.icon;
                const isSelected = activeWorkflow === flow.id;
                return (
                  <button
                    key={flow.id}
                    onClick={() => !isRunning && setActiveWorkflow(flow.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition ${
                      isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block">{flow.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal">{flow.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Parameters */}
          <div className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" /> 2. Pipeline Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.map((param) => (
                <div key={param.id} className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{param.label}</label>
                  {param.type === 'range' && (
                    <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-slate-900">
                      <input 
                        type="range" 
                        min={param.min} 
                        max={param.max} 
                        step="0.1" 
                        value={param.value} 
                        disabled={isRunning}
                        onChange={(e) => updateParameter(param.id, e.target.value)}
                        className="flex-1 accent-indigo-500 bg-white/10 h-1 rounded-lg cursor-pointer text-slate-900"
                      />
                      <span className="text-xs font-mono text-slate-300 font-bold w-6 text-right">{param.value}</span>
                    </div>
                  )}
                  {param.type === 'select' && (
                    <select
                      value={param.value}
                      disabled={isRunning}
                      onChange={(e) => updateParameter(param.id, e.target.value)}
                      className="w-full bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {param.options?.map(opt => (
                        <option key={opt} value={opt} className="bg-[#0e101a]">{opt}</option>
                      ))}
                    </select>
                  )}
                  {param.type === 'text' && (
                    <input 
                      type="text" 
                      value={param.value} 
                      disabled={isRunning}
                      onChange={(e) => updateParameter(param.id, e.target.value)}
                      className="w-full bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Active Runner Panel & Log Outputs - 5 columns */}
        <div className="lg:col-span-5 bg-[#0e101a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" /> Interactive Execution Console
            </h3>

            {/* Run state controls */}
            <div className="flex gap-3">
              <button
                onClick={handleRunWorkflow}
                disabled={isRunning}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer ${
                  isRunning 
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> RUNNING PIPELINE...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> INITIATE WORKFLOW
                  </>
                )}
              </button>
              {isRunning && (
                <button
                  onClick={handleStopWorkflow}
                  className="px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Square className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>EXECUTION VELOCITY:</span>
                  <span className="text-indigo-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 text-slate-900">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Live Terminal outputs */}
            <div className="flex-1 bg-[#07080e] rounded-xl border border-white/5 p-4 font-mono text-[10px] text-slate-400 space-y-2 overflow-y-auto min-h-[180px] max-h-[220px]">
              {logOutputs.length === 0 ? (
                <div className="text-center text-slate-600 py-12">
                  <span>Console idle. Launch workflow above to trace live logs.</span>
                </div>
              ) : (
                logOutputs.map((log, i) => (
                  <div key={i} className="leading-snug text-slate-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>GRID SYSTEM ACTIVE</span>
            <span>NODE: SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
