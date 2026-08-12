import React, { useState } from 'react';
import { Cpu, Sparkles, Key, Info, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { AI_MODELS_REGISTRY } from '../lib/aiUsageTracker';

interface Props {
  modelId?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  isCustomKey?: boolean;
  taskTitle?: string;
  className?: string;
}

export default function AiUsageBadge({
  modelId = 'gemini-2.5-flash',
  promptTokens = 1250,
  completionTokens = 680,
  totalTokens = 1930,
  costUsd = 0.0003,
  isCustomKey = false,
  taskTitle = 'AI Task Invocations',
  className = ''
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modelSpec = AI_MODELS_REGISTRY.find(m => m.id === modelId) || AI_MODELS_REGISTRY[0];

  const formattedCost = isCustomKey 
    ? '$0.00 (BYOK Free)' 
    : `$${costUsd < 0.0001 ? '<0.0001' : costUsd.toFixed(5)}`;

  return (
    <>
      {/* Compact Badge */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 hover:border-indigo-400 rounded-lg text-[10px] font-mono text-indigo-200 transition cursor-pointer shadow-sm group ${className}`}
        title="Click to view AI API usage, token rate and model transparency"
      >
        <span className="flex items-center gap-1 font-bold text-indigo-300">
          <Cpu className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
          {modelSpec.name}
        </span>
        <span className="text-slate-500">•</span>
        <span className="font-semibold text-slate-300">
          {totalTokens.toLocaleString()} tokens
        </span>
        <span className="text-slate-500">•</span>
        <span className={`font-bold ${isCustomKey ? 'text-emerald-400' : 'text-amber-300'}`}>
          {formattedCost}
        </span>
        <Info className="w-2.5 h-2.5 text-indigo-400 opacity-60 group-hover:opacity-100 shrink-0 ml-0.5" />
      </button>

      {/* Task AI API Usage Transparency Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-[#0f111d] border border-indigo-500/30 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto my-auto p-6 shadow-2xl text-slate-200 space-y-5 relative animate-fade-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">AI API Usage Transparency</h4>
                <p className="text-[11px] text-slate-400 truncate max-w-[260px]">{taskTitle}</p>
              </div>
            </div>

            {/* Model Info Card */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {modelSpec.name}
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] rounded font-bold">
                  {modelSpec.provider}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{modelSpec.recommendedFor}</p>
            </div>

            {/* Token Breakdown Grid */}
            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Prompt Tokens</span>
                <span className="text-sm font-bold text-slate-200">{promptTokens.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block">Rate: ${modelSpec.inputRatePer1k.toFixed(6)} / 1k</span>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Output Tokens</span>
                <span className="text-sm font-bold text-slate-200">{completionTokens.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block">Rate: ${modelSpec.outputRatePer1k.toFixed(6)} / 1k</span>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1 col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase">Total Tokens</span>
                  <span className="text-sm font-bold text-white">{totalTokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase">Task API Cost</span>
                  <span className={`text-sm font-black ${isCustomKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formattedCost}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Status Explanation */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-start gap-2.5 text-xs">
              {isCustomKey ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-200">
                    This task was executed using your tenant’s custom API key (BYOK). $0 overage fee charged by MarketForge OS.
                  </p>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300">
                    Executed via MarketForge OS platform API quota. You can configure your own free Gemini API key in Tenant Settings to bypass quota limits.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Close Transparency Window
            </button>
          </div>
        </div>
      )}
    </>
  );
}
