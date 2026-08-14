import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Server, ShieldCheck, RefreshCw } from 'lucide-react';
import { MarketForgeLogo } from './MarketForgeLogo';

interface ConnectingStateProps {
  statusText?: string;
  subText?: string;
  tenantSlug?: string;
  isRetrying?: boolean;
  retryAttempt?: number;
  onManualRetry?: () => void;
}

export const ConnectingState: React.FC<ConnectingStateProps> = ({
  statusText = 'Connecting to MarketForge...',
  subText = 'Establishing secure cloud connection. If the service is warming up from inactivity, this takes just a few seconds.',
  tenantSlug,
  isRetrying = false,
  retryAttempt = 0,
  onManualRetry
}) => {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0F121C]/90 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center"
      >
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <MarketForgeLogo />
        </div>

        {/* Pulse Status Indicator */}
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-indigo-500/20"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute inset-2 rounded-full bg-cyan-500/30"
          />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 relative z-10">
            <Server className="w-5 h-5 text-white animate-pulse" />
          </div>
        </div>

        {/* Primary Status Title */}
        <h1 className="text-xl font-bold text-white tracking-tight mb-2">
          {statusText}
        </h1>

        {tenantSlug && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Workspace: <strong className="text-white">{tenantSlug}</strong></span>
          </div>
        )}

        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
          {subText}
        </p>

        {/* Live Step Progress / Feedback */}
        <div className="space-y-2.5 bg-black/40 border border-white/5 rounded-xl p-3 text-left mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Client Runtime Ready
            </span>
            <span className="text-emerald-400 text-[11px] font-mono">100%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              Cloud Backend Health Probe
            </span>
            <span className="text-indigo-400 text-[11px] font-mono">
              {retryAttempt > 0 ? `Retry #${retryAttempt}` : 'Connecting...'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              Tenant Partition Resolution
            </span>
            <span className="text-slate-500 text-[11px] font-mono">Pending</span>
          </div>
        </div>

        {/* Manual action fallback */}
        {onManualRetry && (
          <button
            onClick={onManualRetry}
            disabled={isRetrying}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>Check Connectivity Now</span>
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Zero-trust isolated multi-tenant architecture</span>
        </div>
      </motion.div>
    </div>
  );
};
