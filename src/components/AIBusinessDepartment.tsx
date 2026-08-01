import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  Cpu, 
  Building2, 
  TrendingUp, 
  Database, 
  ArrowUpRight,
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  leaderAgent: string;
  activeAgents: number;
  health: 'Optimal' | 'Degraded' | 'Critical';
  budgetPercent: number;
  outputTrend: string;
  focusArea: string;
}

export default function AIBusinessDepartment() {
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Strategic Marketing Unit', leaderAgent: 'Athena-Model-X', activeAgents: 6, health: 'Optimal', budgetPercent: 35, outputTrend: '+18.4%', focusArea: 'Organic & Paid lead channels' },
    { id: '2', name: 'Sales Pipeline Optimization', leaderAgent: 'Hermes-Negotiator-V2', activeAgents: 4, health: 'Optimal', budgetPercent: 25, outputTrend: '+24.1%', focusArea: 'Cold funnel lead nurture loops' },
    { id: '3', name: 'Customer Success Botnet', leaderAgent: 'Solomon-CS-Agent', activeAgents: 8, health: 'Degraded', budgetPercent: 20, outputTrend: '-2.5%', focusArea: 'Real-time incident response' },
    { id: '4', name: 'Product R&D Analytics', leaderAgent: 'DaVinci-Synthesizer', activeAgents: 3, health: 'Optimal', budgetPercent: 20, outputTrend: '+12.8%', focusArea: 'Code generation auto-audits' }
  ]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <section className="bg-[#0e101a] border border-white/5 p-6 rounded-2xl shadow-sm">
        <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-400" /> AI Business Departments
        </h2>
        <p className="text-xs text-slate-400 mt-1">Monitor autonomous agent department branches, operational health status, active budgets, and computational resources allocated to divisions.</p>
      </section>

      {/* Stats Bento Grid Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Division Clusters</span>
            <span className="text-lg font-mono font-bold text-white block">4 Operational Units</span>
          </div>
        </div>
        <div className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Agent Workforce</span>
            <span className="text-lg font-mono font-bold text-white block">21 Active Instances</span>
          </div>
        </div>
        <div className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cognitive Resource Efficiency</span>
            <span className="text-lg font-mono font-bold text-white block">98.41% Optimal</span>
          </div>
        </div>
      </div>

      {/* Main Department List Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-white group-hover:text-indigo-400 transition">{dept.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5 block">{dept.focusArea}</span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                  dept.health === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  dept.health === 'Degraded' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {dept.health}
                </span>
              </div>

              {/* Department details */}
              <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-white/5 font-mono text-[10.5px]">
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase">Division Leader</span>
                  <span className="text-slate-200 font-semibold">{dept.leaderAgent}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase">Agent Workforces</span>
                  <span className="text-slate-200 font-semibold">{dept.activeAgents} bots active</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase">Quarterly Budget Share</span>
                  <span className="text-slate-200 font-semibold">{dept.budgetPercent}% pool allocation</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase">Throughput velocity</span>
                  <span className={`font-bold ${dept.outputTrend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {dept.outputTrend}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom interactive slider inside card */}
            <div className="mt-5 pt-3.5 border-t border-white/5 space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>COMPUTATIONAL POOL:</span>
                <span className="text-indigo-400 font-bold">{dept.budgetPercent * 1.5} CORES</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden text-slate-900">
                <div 
                  className="bg-indigo-500 h-full transition-all"
                  style={{ width: `${dept.budgetPercent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
