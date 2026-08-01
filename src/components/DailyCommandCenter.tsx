import { useCurrency } from '../lib/CurrencyContext';
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Layers, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
  Settings,
  Database,
  Users
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const dummyChartData = [
  { name: '00:00', throughput: 120, precision: 98.4 },
  { name: '04:00', throughput: 180, precision: 98.6 },
  { name: '08:00', throughput: 310, precision: 99.1 },
  { name: '12:00', throughput: 280, precision: 98.9 },
  { name: '16:00', throughput: 420, precision: 99.4 },
  { name: '20:00', throughput: 390, precision: 99.2 },
  { name: '24:00', throughput: 480, precision: 99.5 },
];

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  source: string;
  message: string;
}

export default function DailyCommandCenter({ activeTenant, onOpenSubscription }: { activeTenant?: any, onOpenSubscription?: () => void }) {
  const { formatCurrency } = useCurrency();
  
  const currentPlan = activeTenant?.plan || 'Trial';
  let daysLeftText = '';
  
  if (currentPlan === 'Trial') {
    let trialDaysLeft = activeTenant?.trialDaysLeft || 15;
    if (activeTenant?.createdAt) {
      const createdAt = new Date(activeTenant.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      trialDaysLeft = Math.max(0, 15 - diffDays);
    }
    daysLeftText = `${trialDaysLeft} Days Remaining`;
  } else {
    let subDaysLeft = 30;
    if (activeTenant?.subscriptionEndDate) {
      const endDate = new Date(activeTenant.subscriptionEndDate);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      if (diffTime > 0) {
        subDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        subDaysLeft = 0;
      }
    }
    daysLeftText = `${subDaysLeft} Days Remaining`;
  }
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '06:54:10', type: 'success', source: 'MARKETING_BOT', message: 'Optimized LinkedIn campaign bid structures. CTR increased +1.4%.' },
    { id: '2', timestamp: '06:52:45', type: 'info', source: 'CRON_SERVICE', message: 'Database backup synchronized successfully with Firestore.' },
    { id: '3', timestamp: '06:50:12', type: 'warn', source: 'SEO_ALYZER', message: 'Slight ranking drop on high-intent target keyword: "ai sales agents".' },
    { id: '4', timestamp: '06:48:33', type: 'info', source: 'AD_GENERATOR', message: 'Drafted 12 new creative variation sets for summer product release.' },
  ]);

  const [tasks, setTasks] = useState([
    { id: '1', text: 'Analyze Q3 ad budget allocation models via business intelligence engine', done: true, priority: 'high' },
    { id: '2', text: 'Generate new multi-format content pieces for LinkedIn & Twitter leads', done: false, priority: 'high' },
    { id: '3', text: 'Audit cloud database synchronization speed and cache sizes', done: false, priority: 'medium' },
    { id: '4', text: 'Schedule weekly autonomous agent feedback sessions', done: true, priority: 'low' },
  ]);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('high');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        done: false,
        priority: newTaskPriority,
      }
    ]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Intro Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e101a] border border-white/5 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Executive Cockpit & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time throughput logs, autonomous goals tracking, and cognitive resource allocation indices.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-semibold text-emerald-400 tracking-wider">LIVE DATA FEED ACTIVE</span>
        </div>
      </section>

      {/* Workspace Diagnostic Widget */}
      {activeTenant && (
        <section className="bg-gradient-to-r from-indigo-900/30 to-fuchsia-900/20 border border-indigo-500/20 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-sm text-indigo-300 flex items-center gap-2">
                <Database className="w-4 h-4" /> Workspace Diagnostic: {activeTenant.name}
              </h3>
              <p className="text-[10px] text-indigo-200/70 mt-1">
                Domain: <span className="font-mono text-indigo-200">{activeTenant.domain}</span> • Status: <span className="uppercase text-emerald-400 font-bold">{activeTenant.status}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <div className="bg-indigo-950/40 border border-indigo-500/20 px-3 py-2 rounded-xl">
                <span className="text-slate-400 block text-[9px] mb-0.5">SUBSCRIPTION TIER</span>
                <span className="text-indigo-300 font-bold">{activeTenant.plan} ({formatCurrency(activeTenant.mrr)}/mo)</span>
              </div>
              <div className="bg-indigo-950/40 border border-indigo-500/20 px-3 py-2 rounded-xl">
                <span className="text-slate-400 block text-[9px] mb-0.5">ACTIVE SEATS</span>
                <span className="text-indigo-300 font-bold flex items-center gap-1"><Users className="w-3 h-3" /> {activeTenant.activeUsers} Allocated</span>
              </div>
              <div className="bg-indigo-950/40 border border-indigo-500/20 px-3 py-2 rounded-xl">
                <span className="text-slate-400 block text-[9px] mb-0.5 uppercase">{currentPlan === 'Trial' ? 'TRIAL DAYS' : 'CYCLE DAYS'}</span>
                <span className="text-emerald-400 font-bold">{daysLeftText}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-indigo-500/10 flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Quick Actions:</span>
            <button onClick={onOpenSubscription} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 rounded text-[11px] text-slate-300 font-semibold transition cursor-pointer">
              <Settings className="w-3.5 h-3.5" /> Manage Subscription
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 rounded text-[11px] text-slate-300 font-semibold transition">
              <Users className="w-3.5 h-3.5" /> Invite Members
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 rounded text-[11px] text-slate-300 font-semibold transition">
              <Database className="w-3.5 h-3.5" /> Browse Data Storage
            </button>
          </div>
        </section>
      )}

      {/* Grid of Key Telemetry Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Decision Throughput', value: '142.8 / min', change: '+12.4%', trend: 'up', icon: Cpu, color: 'from-emerald-500 to-teal-500', desc: 'Active AI decisions processed' },
          { title: 'Model Accuracy', value: '99.32%', change: '+0.08%', trend: 'up', icon: CheckCircle2, color: 'from-indigo-500 to-purple-500', desc: 'Autonomous validation rate' },
          { title: 'Resource Lock', value: '38.4 GB', change: '-4.2%', trend: 'down', icon: Layers, color: 'from-amber-500 to-orange-500', desc: 'Cached memory/storage pool' },
          { title: 'Average Latency', value: '42 ms', change: '-8.5%', trend: 'down', icon: Clock, color: 'from-rose-500 to-red-500', desc: 'Sync callback duration' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#0e101a] border border-white/5 rounded-2xl p-5 shadow-xs hover:border-white/10 transition group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{card.title}</span>
                  <span className="text-xl font-mono font-bold text-white tracking-tight">{card.value}</span>
                </div>
                <div className={`p-2.5 rounded-xl bg-white/5 text-slate-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-slate-400 font-medium">{card.desc}</span>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                  card.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Telemetry Plot & Dynamic Goal Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry Chart - 7 columns */}
        <div className="lg:col-span-7 bg-[#0e101a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Pipeline Throughput Trace
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Throughput indexes over 24h timeline execution nodes.</p>
            </div>
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> THROUGHPUT
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace" />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0e101a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  labelClassName="text-slate-400"
                />
                <Area type="monotone" dataKey="throughput" stroke="#6366f1" strokeWidth={1.8} fillOpacity={1} fill="url(#colorThroughput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Task / Goal Planner - 5 columns */}
        <div className="lg:col-span-5 bg-[#0e101a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-white">Daily Operational Goals</h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">
                {tasks.filter(t => t.done).length}/{tasks.length} Completed
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-start gap-2.5 p-3 rounded-xl border transition ${
                    task.done 
                      ? 'bg-white/[0.01] border-white/5 opacity-60' 
                      : 'bg-white/5 border-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={task.done} 
                    onChange={() => toggleTask(task.id)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-transparent text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11.5px] leading-tight font-sans break-words ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.text}
                    </p>
                    <span className={`text-[8.5px] font-bold font-mono px-1 py-0.5 rounded uppercase mt-1.5 inline-block ${
                      task.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Task Creator Form */}
          <form onSubmit={handleAddTask} className="mt-4 pt-3 border-t border-white/5 flex gap-2">
            <input 
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Deploy automated marketing loop..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="bg-[#0e101a] border border-white/10 rounded-xl text-[10px] text-slate-300 font-bold px-2 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="high">HIGH</option>
              <option value="medium">MED</option>
              <option value="low">LOW</option>
            </select>
            <button 
              type="submit"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Execution logs output logs terminal console */}
      <section className="bg-[#07080e] border border-white/10 rounded-2xl p-5 shadow-xs font-mono">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="font-display font-bold text-xs text-white">System Logs & Event Monitor</h3>
          </div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">FILTER: ALL SERVICES</span>
        </div>
        <div className="space-y-1.5 text-[10.5px] max-h-36 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 py-0.5 border-b border-white/[0.01]">
              <span className="text-slate-500 font-medium">[{log.timestamp}]</span>
              <span className={`font-bold ${
                log.type === 'success' ? 'text-emerald-400' : 
                log.type === 'warn' ? 'text-amber-400' : 
                log.type === 'error' ? 'text-rose-400' : 'text-indigo-400'
              }`}>[{log.source}]</span>
              <span className="text-slate-300 flex-1 leading-snug">{log.message}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
