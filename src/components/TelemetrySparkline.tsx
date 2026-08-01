import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Cpu, Key, ArrowUpRight, BarChart2, ShieldCheck, ChevronRight } from 'lucide-react';
import { get30DaySparklineData, getTenantAiConfig } from '../lib/aiUsageTracker';

interface Props {
  tenantId: string;
  tenantPlan?: string;
  onOpenFullTelemetry: () => void;
}

export default function TelemetrySparkline({ tenantId, tenantPlan = 'Growth', onOpenFullTelemetry }: Props) {
  const [telemetryData, setTelemetryData] = useState(() => get30DaySparklineData(tenantId));
  const [config, setConfig] = useState(() => getTenantAiConfig(tenantId, tenantPlan));
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  useEffect(() => {
    const refresh = () => {
      setTelemetryData(get30DaySparklineData(tenantId));
      setConfig(getTenantAiConfig(tenantId, tenantPlan));
    };
    refresh();
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, [tenantId, tenantPlan]);

  const { data, total30DayTokens, growthPercentage } = telemetryData;

  // Format tokens count cleanly e.g. 842.5K or 1.2M
  const formatTokenCount = (tokens: number) => {
    if (tokens >= 1000000) {
      return (tokens / 1000000).toFixed(2) + 'M';
    }
    if (tokens >= 1000) {
      return (tokens / 1000).toFixed(1) + 'K';
    }
    return tokens.toString();
  };

  // Generate SVG path coordinates for 30-day sparkline graph
  const maxTokens = Math.max(...data.map(d => d.tokens), 100);
  const width = 200;
  const height = 42;
  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (d.tokens / maxTokens) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

  return (
    <div className="px-3.5 py-3 bg-[#0d0f1a] border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl transition duration-200 shadow-xl space-y-2.5 relative group">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-wider font-mono">
            AI API TELEMETRY
          </span>
        </div>
        <button
          onClick={onOpenFullTelemetry}
          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-200 flex items-center gap-0.5 cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/20 transition"
        >
          Rates & Logs <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Main Metric Stats */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-lg font-black text-white font-mono tracking-tight">
            {formatTokenCount(total30DayTokens)}
          </span>
          <span className="text-[9px] text-slate-400 ml-1 font-mono">tokens / 30d</span>
        </div>

        <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono flex items-center gap-0.5 ${
          growthPercentage >= 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
        }`}>
          <TrendingUp className="w-2.5 h-2.5" />
          {growthPercentage >= 0 ? `+${growthPercentage}%` : `${growthPercentage}%`}
        </div>
      </div>

      {/* Mini Sparkline Chart SVG */}
      <div className="relative pt-1 cursor-pointer" onClick={onOpenFullTelemetry} title="Click to view 30-day AI API token breakdown">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-11 overflow-visible">
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill Area under curve */}
          <path d={areaD} fill="url(#sparklineGrad)" />

          {/* Line Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing current endpoint */}
          {data.length > 0 && (
            <circle
              cx={width}
              cy={height - (data[data.length - 1].tokens / maxTokens) * (height - 8) - 4}
              r="3"
              className="fill-indigo-400 animate-pulse"
            />
          )}
        </svg>

        {/* Hover overlay hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-indigo-950/70 backdrop-blur-[2px] rounded-lg">
          <span className="text-[9px] font-bold text-indigo-200 flex items-center gap-1 font-mono">
            <BarChart2 className="w-3 h-3 text-indigo-400" /> Open AI Usage Center
          </span>
        </div>
      </div>

      {/* Footer Key Status */}
      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-mono">
        <div className="flex items-center gap-1 text-slate-400">
          <Key className="w-3 h-3 text-amber-400 shrink-0" />
          <span>API Key:</span>
        </div>
        {config.enabled && config.customApiKey.trim() ? (
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" /> BYOK Active
          </span>
        ) : (
          <span className="text-slate-300 font-medium">Platform Free Tier</span>
        )}
      </div>
    </div>
  );
}
