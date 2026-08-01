import React from 'react';
import { Zap, ArrowRight, Clock } from 'lucide-react';

interface TrialBannerProps {
  trialDaysLeft: number;
  onUpgradeClick: () => void;
}

export default function TrialBanner({ trialDaysLeft, onUpgradeClick }: TrialBannerProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-[#0e101a] border border-indigo-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-indigo-500/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            Your Trial Ends in {trialDaysLeft} Days
            <span className="bg-indigo-500 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-white tracking-widest animate-pulse">Action Required</span>
          </h4>
          <p className="text-xs text-indigo-200/70 mt-0.5">
            Upgrade now to keep your AI agents active and retain all workspace data.
          </p>
        </div>
      </div>
      <button
        onClick={onUpgradeClick}
        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
      >
        <Zap className="w-3.5 h-3.5" />
        Upgrade Workspace
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
