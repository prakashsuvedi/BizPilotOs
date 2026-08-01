import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Activity, 
  Server, 
  Database, 
  TrendingUp, 
  Cpu, 
  HardDrive, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Pause, 
  Sliders, 
  Terminal, 
  ShieldAlert,
  Loader2,
  Trash2,
  Clock
} from 'lucide-react';
import { PlatformAuditLog, TenantConfig } from './SuperAdminPortal';

interface SystemHealthDashboardProps {
  tenants: TenantConfig[];
  audits: PlatformAuditLog[];
  onAddAudit: (type: 'security' | 'role_change' | 'tenant_mutation' | 'brand_override' | 'system', severity: 'low' | 'medium' | 'high', details: string, tenantId?: string) => void;
  onUpdateTenantRequests?: (tenantId: string, extraRequests: number) => void;
}

// Interfaces for live tracking state
interface HealthMetrics {
  timestamp: string;
  totalRequests: number;
  cpuLoad: number;
  memoryUsage: number;
  dbPoolConnections: number;
  demoTenantRequests: number;
  siennaTenantRequests: number;
  solasTenantRequests: number;
  alphaTenantRequests: number;
  avgLatencyMs: number;
}

interface LiveLog {
  id: string;
  time: string;
  tenantId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  latencyMs: number;
  payloadSizeKb: number;
  type: 'api' | 'db' | 'auth' | 'cache' | 'error';
}

const ENDPOINTS_POOL = [
  { method: 'POST', endpoint: '/api/agent/writer', type: 'api' },
  { method: 'POST', endpoint: '/api/agent/planner', type: 'api' },
  { method: 'GET', endpoint: '/api/auth/session', type: 'auth' },
  { method: 'GET', endpoint: '/api/commerce/rates', type: 'cache' },
  { method: 'POST', endpoint: '/api/commerce/invoice', type: 'db' },
  { method: 'PUT', endpoint: '/api/tenant/modules', type: 'db' },
  { method: 'POST', endpoint: '/api/agent/creative/image', type: 'api' },
  { method: 'GET', endpoint: '/api/assets/optimize', type: 'cache' }
] as const;

export default function SystemHealthDashboard({
  tenants,
  audits,
  onAddAudit,
  onUpdateTenantRequests
}: SystemHealthDashboardProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulatedLoadMultiplier, setSimulatedLoadMultiplier] = useState<number>(1.0);
  const [selectedLogTypeFilter, setSelectedLogTypeFilter] = useState<'all' | 'api' | 'db' | 'auth' | 'error'>('all');
  
  // Historical data for Recharts Area/Line charts
  const [history, setHistory] = useState<HealthMetrics[]>(() => {
    const data: HealthMetrics[] = [];
    const baseTime = Date.now() - 12 * 60000;
    for (let i = 0; i <= 12; i++) {
      const timeStr = new Date(baseTime + i * 50000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const mult = 1.0;
      data.push({
        timestamp: timeStr,
        totalRequests: Math.floor((300 + Math.random() * 200) * mult),
        cpuLoad: Math.floor(25 + Math.random() * 20 * mult),
        memoryUsage: Math.floor(52 + Math.random() * 5 * mult),
        dbPoolConnections: Math.floor(12 + Math.random() * 8 * mult),
        demoTenantRequests: Math.floor((70 + Math.random() * 50) * mult),
        siennaTenantRequests: Math.floor((40 + Math.random() * 30) * mult),
        solasTenantRequests: Math.floor((110 + Math.random() * 60) * mult),
        alphaTenantRequests: Math.floor((80 + Math.random() * 60) * mult),
        avgLatencyMs: Math.floor(85 + Math.random() * 45)
      });
    }
    return data;
  });

  // Streaming Live request logs terminal
  const [logs, setLogs] = useState<LiveLog[]>([]);

  // System warning incident triggers
  const [activeWarning, setActiveWarning] = useState<{ id: string; title: string; desc: string; severity: 'warning' | 'critical' } | null>(null);

  // Interval hook to simulate real-time ingress stream
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // 1. Generate live logs
      const logGenerationsCount = Math.floor(1 + Math.random() * 3 * simulatedLoadMultiplier);
      const newLogsList: LiveLog[] = [];
      
      let extraRequestsDemo = 0;
      let extraRequestsSienna = 0;
      let extraRequestsSolas = 0;
      let extraRequestsAlpha = 0;

      for (let i = 0; i < logGenerationsCount; i++) {
        const route = ENDPOINTS_POOL[Math.floor(Math.random() * ENDPOINTS_POOL.length)];
        const matchedTenant = tenants[Math.floor(Math.random() * tenants.length)] || { id: 'demo-tenant' };
        
        // Randomly simulate server errors (higher if load is critical)
        const isError = Math.random() < (0.04 * simulatedLoadMultiplier);
        const status = isError ? (Math.random() > 0.5 ? 500 : 503) : (Math.random() > 0.8 ? 201 : 200);
        
        let latency = Math.floor((40 + Math.random() * 120) * (simulatedLoadMultiplier > 2 ? 1.8 : 1.0));
        if (isError) latency = Math.floor(500 + Math.random() * 1500);

        // Keep local tallies to save to parent configurations if possible
        if (matchedTenant.id === 'demo-tenant') extraRequestsDemo++;
        if (matchedTenant.id === 'sienna-tenant') extraRequestsSienna++;
        if (matchedTenant.id === 'solas-tenant') extraRequestsSolas++;
        if (matchedTenant.id === 'alpha-tenant') extraRequestsAlpha++;

        const newLog: LiveLog = {
          id: `log-${Math.random().toString(36).substring(2, 9)}`,
          time: new Date().toLocaleTimeString([], { hour12: false }),
          tenantId: matchedTenant.id,
          method: route.method,
          endpoint: route.endpoint,
          status,
          latencyMs: latency,
          payloadSizeKb: parseFloat((0.2 + Math.random() * 5.8).toFixed(1)),
          type: isError ? 'error' : route.type
        };

        newLogsList.unshift(newLog);

        // Auto trigger high latency warning
        if (latency > 1500 && !activeWarning) {
          const warningDetails = {
            id: 'warn-101',
            title: 'High Latency Spike Detected',
            desc: `API latency reached ${latency}ms during continuous polling on ${route.endpoint}.`,
            severity: 'warning' as const
          };
          setActiveWarning(warningDetails);
          onAddAudit('system', 'medium', `System Monitor: [Warning] High Response Latency registered: ${latency}ms at ${route.endpoint}`, matchedTenant.id);
        }
      }

      setLogs(prev => [...newLogsList, ...prev].slice(0, 50));

      // 2. Refresh parent counts if update callback is provided
      if (onUpdateTenantRequests) {
        if (extraRequestsDemo > 0) onUpdateTenantRequests('demo-tenant', extraRequestsDemo);
        if (extraRequestsSienna > 0) onUpdateTenantRequests('sienna-tenant', extraRequestsSienna);
        if (extraRequestsSolas > 0) onUpdateTenantRequests('solas-tenant', extraRequestsSolas);
        if (extraRequestsAlpha > 0) onUpdateTenantRequests('alpha-tenant', extraRequestsAlpha);
      }

      // 3. Append to historical analytics timeline
      setHistory(prev => {
        const nextTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const demoBase = Math.floor((70 + Math.random() * 50) * simulatedLoadMultiplier);
        const siennaBase = Math.floor((30 + Math.random() * 40) * simulatedLoadMultiplier);
        const solasBase = Math.floor((100 + Math.random() * 70) * simulatedLoadMultiplier);
        const alphaBase = Math.floor((80 + Math.random() * 60) * simulatedLoadMultiplier);

        const currentTotal = demoBase + siennaBase + solasBase + alphaBase;
        const currentCpu = Math.min(99, Math.floor((15 + (currentTotal / 12) + Math.random() * 8) * (simulatedLoadMultiplier > 1.5 ? 1.4 : 1.0)));
        const currentMem = Math.min(96, Math.floor(54 + (currentCpu / 15) + Math.random() * 1.5));
        const currentDb = Math.min(50, Math.floor(10 + (currentTotal / 24) + Math.random() * 4));

        const nextMetric: HealthMetrics = {
          timestamp: nextTimeStr,
          totalRequests: currentTotal,
          cpuLoad: currentCpu,
          memoryUsage: currentMem,
          dbPoolConnections: currentDb,
          demoTenantRequests: demoBase,
          siennaTenantRequests: siennaBase,
          solasTenantRequests: solasBase,
          alphaTenantRequests: alphaBase,
          avgLatencyMs: Math.floor((65 + (currentCpu * 1.5) + Math.random() * 30))
        };

        // If CPU surpasses 90% and no warning triggered, throw safety threshold audit
        if (currentCpu > 88 && !activeWarning) {
          setActiveWarning({
            id: 'warn-cpu-90',
            title: 'Critical Hardware Capacity Overrun',
            desc: `Platform cumulative CPU Load surpassed 88% threshold. Initiating auto-scaling warm pods.`,
            severity: 'critical'
          });
          onAddAudit('system', 'high', `Capacity Engine: [Critical] Hardware threshold overused. CPU load registered as ${currentCpu}%. Autoscaler booting container pods.`, 'system-core');
        }

        return [...prev.slice(1), nextMetric];
      });

    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying, simulatedLoadMultiplier, tenants, activeWarning, onAddAudit, onUpdateTenantRequests]);

  // Simulate Load Clear and System Reset
  const handleResolveWarning = () => {
    if (activeWarning) {
      onAddAudit('system', 'low', `Resolution Engine: Resolved active incident "${activeWarning.title}" successfully. Telemetry indices stabilized.`, 'system-core');
      setActiveWarning(null);
    }
  };

  const handleInduceLoadSpike = () => {
    setSimulatedLoadMultiplier(3.5);
    onAddAudit('system', 'high', 'Manual Stress test activated in sandbox. Artificial container query volumes increased to 350% baseline metrics.', 'dev-sandbox');
    // Fast append a historical peak
    setHistory(prev => {
      const nextTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return [
        ...prev.slice(1),
        {
          timestamp: nextTimeStr,
          totalRequests: 1450,
          cpuLoad: 92,
          memoryUsage: 89,
          dbPoolConnections: 45,
          demoTenantRequests: 350,
          siennaTenantRequests: 210,
          solasTenantRequests: 480,
          alphaTenantRequests: 410,
          avgLatencyMs: 420
        }
      ];
    });
  };

  // Filter logs for stream display
  const filteredLogs = logs.filter(lg => {
    if (selectedLogTypeFilter === 'all') return true;
    if (selectedLogTypeFilter === 'error') return lg.type === 'error' || lg.status >= 500;
    return lg.type === selectedLogTypeFilter;
  });

  // Calculate current point values
  const currentMetricPoint = history[history.length - 1] || {
    totalRequests: 0,
    cpuLoad: 28,
    memoryUsage: 55,
    dbPoolConnections: 14,
    avgLatencyMs: 90
  };

  // Pie chart tenant distribution rendering data
  const tenantPieData = tenants.map((tn) => ({
    name: tn.name,
    value: tn.apiRequests,
    id: tn.id
  }));

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">

      {/* HEADER CONTROLS BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity className="w-24 h-24 text-indigo-400 animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase animate-pulse">
                REAL-TIME MONITOR
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Socket: WS / Secure Cluster
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-100 tracking-tight">
              Tenant Cluster System Health & Volume Router
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
              This terminal hooks directly into our distributed API load balancer. View real-time container CPU load spikes, query db pool sizes, and analyze live-generated request volumes across isolated tenant workloads securely.
            </p>
          </div>

          {/* Quick Simulation controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 gap-2">
              <span className="text-[10px] text-slate-400 font-bold font-mono">SIM LOAD:</span>
              <span className={`text-xs font-mono font-bold ${simulatedLoadMultiplier > 2.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {simulatedLoadMultiplier.toFixed(1)}x
              </span>
              <input 
                id="sys-load-multiplier-slider"
                type="range" 
                min="0.5" 
                max="4.0" 
                step="0.5" 
                value={simulatedLoadMultiplier} 
                onChange={(e) => setSimulatedLoadMultiplier(parseFloat(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500" 
              />
            </div>

            <button
              id="btn-play-pause-telemetry"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl border border-slate-700 transition"
              title={isPlaying ? 'Pause auto-streaming logs' : 'Resume real-time logs'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-amber-500 animate-ping" />}
            </button>

            <button
              id="btn-trigger-stress-test"
              onClick={handleInduceLoadSpike}
              className="p-2 bg-rose-950 border border-rose-800 inline-flex items-center gap-1.5 text-rose-300 font-bold text-xs rounded-xl hover:bg-rose-900 transition"
              title="Induce simulated high traffic stress test"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              Inc Strain
            </button>
            
            <button
              id="btn-reset-telemetry"
              onClick={() => {
                setSimulatedLoadMultiplier(1.0);
                setLogs([]);
                setActiveWarning(null);
                onAddAudit('system', 'low', 'Manual Reset: Ingress simulation state metrics restored to 1.0x baseline settings.', 'dev-sandbox');
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
              title="Reset metrics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ACTIVE ALERTS AND INCIDENT BOARD */}
        {activeWarning && (
          <div className="mt-4 p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 animate-slide-in bg-rose-950/40 border-rose-800/80">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-900/40 border border-rose-700/50 rounded-lg text-rose-400 text-rose-400 mt-0.5 animate-bounce shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase bg-rose-600/20 text-rose-300 border border-rose-500/20 px-1.5 py-0.5 rounded font-black max-w-max block">
                  SYSTEM STATUS: {activeWarning.severity.toUpperCase()}
                </span>
                <h4 className="text-sm font-black text-rose-100">{activeWarning.title}</h4>
                <p className="text-xs text-rose-200/80 leading-normal">{activeWarning.desc}</p>
              </div>
            </div>

            <button
              id="btn-resolve-active-incident"
              onClick={handleResolveWarning}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs transition duration-150 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              Trigger Incident Resolution
            </button>
          </div>
        )}
      </div>

      {/* CORE FOUR HARDWARE GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Memory status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Sys Memory Allocation</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">{currentMetricPoint.memoryUsage}%</span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">/ 24.0 GB</span>
            </div>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 text-slate-900">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${currentMetricPoint.memoryUsage > 80 ? 'bg-rose-500' : currentMetricPoint.memoryUsage > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${currentMetricPoint.memoryUsage}%` }}
              ></div>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        {/* CPU utilization */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">CPU Core Speed load</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">{currentMetricPoint.cpuLoad}%</span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">/ Multi-Pod</span>
            </div>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 text-slate-900">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${currentMetricPoint.cpuLoad > 80 ? 'bg-rose-500' : currentMetricPoint.cpuLoad > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${currentMetricPoint.cpuLoad}%` }}
              ></div>
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* DB Connection pools */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Active Database Pools</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">{currentMetricPoint.dbPoolConnections}</span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">/ 50 Available</span>
            </div>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 text-slate-900">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${currentMetricPoint.dbPoolConnections > 36 ? 'bg-rose-500' : currentMetricPoint.dbPoolConnections > 25 ? 'bg-amber-500' : 'bg-indigo-500 bg-indigo-500'}`}
                style={{ width: `${(currentMetricPoint.dbPoolConnections / 50) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-600 shrink-0">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Average response latency</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">{currentMetricPoint.avgLatencyMs}ms</span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">API Target: &lt;120ms</span>
            </div>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 text-slate-900">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${currentMetricPoint.avgLatencyMs > 250 ? 'bg-rose-500' : currentMetricPoint.avgLatencyMs > 120 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (currentMetricPoint.avgLatencyMs / 300) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600 shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ENTERPRISE BOS INTEGRATION HUB & CAPABILITY REGISTRY PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: ENTERPRISE INTEGRATION HUB CONNECTORS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                Enterprise Integration Hub Connectors
              </h4>
              <p className="text-slate-500 text-[11px]">Real-time connection status, webhook pathways, and localized rate limit bounds.</p>
            </div>
            <span className="p-1 px-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold font-mono rounded">
              GATEWAY: COMPLIANT
            </span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'stripe', name: 'Stripe Payments Platform', category: 'Payments', version: '2023-10-16', limit: '120 req/m', status: 'CONNECTED', latency: '95ms', color: 'emerald' },
              { id: 'google_workspace', name: 'Google Workspace Client', category: 'Workspace', version: 'v2', limit: '250 req/m', status: 'CONNECTED', latency: '140ms', color: 'emerald' },
              { id: 'slack', name: 'Slack Business Notifier', category: 'Communication', version: 'v1.1', limit: '150 req/m', status: 'CONNECTED', latency: '80ms', color: 'emerald' },
              { id: 'quickbooks', name: 'QuickBooks Accounting Ledger', category: 'Accounting', version: 'v3', limit: '100 req/m', status: 'CONNECTED', latency: '220ms', color: 'emerald' },
              { id: 'cpanel', name: 'cPanel Host Control API', category: 'Hosting', version: 'v2.4', limit: '60 req/m', status: 'DEGRADED', latency: '480ms', color: 'amber' },
              { id: 'whatsapp', name: 'WhatsApp Business API', category: 'Communication', version: 'v12.0', limit: '200 req/m', status: 'UNCONFIGURED', latency: 'N/A', color: 'slate' }
            ].map(conn => (
              <div key={conn.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs transition hover:bg-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase font-mono text-[10px]">
                    {conn.id.substring(0, 2)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-800">{conn.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">v{conn.version}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Cat: <strong>{conn.category}</strong></span>
                      <span>•</span>
                      <span>Limit: <strong>{conn.limit}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right space-y-0.5 font-mono text-[10px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        conn.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : conn.status === 'DEGRADED' ? 'bg-amber-400' : 'bg-slate-300'
                      }`}></span>
                      <span className="font-bold text-slate-700">{conn.status}</span>
                    </div>
                    <span className="text-slate-400 block">Latency: {conn.latency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: ENTERPRISE LEVEL 2 CAPABILITY REGISTRY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Dynamic Level 2 Capabilities Registry
              </h4>
              <p className="text-slate-500 text-[11px]">Granular features registered via Module SDK, mapped by subscription rank tiers.</p>
            </div>
            <span className="p-1 px-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold font-mono rounded">
              REGISTRY: ACTIVE
            </span>
          </div>

          <div className="space-y-3 max-h-[345px] overflow-y-auto pr-1 scrollbar-thin">
            {[
              { cap: 'marketing.campaigns', name: 'Strategic Campaign Scheduler', module: 'marketing', tier: 'Starter', desc: 'Compose, publish and schedule omni-channel campaigns.' },
              { cap: 'marketing.strategy', name: 'AI Creative Director Copilot', module: 'marketing', tier: 'Professional', desc: 'Expert panels and multi-variant content synthesis.' },
              { cap: 'restaurant.table-booking', name: 'Table Layout & Seat Booking', module: 'restaurant', tier: 'Business', desc: 'Manage interactive map reservations and booking queues.' },
              { cap: 'restaurant.kitchen', name: 'Kitchen Screen Order Dispatcher', module: 'restaurant', tier: 'Business', desc: 'Real-time kitchen order pipelines and dispatch updates.' },
              { cap: 'crm.pipeline', name: 'Deal Pipeline Opportunity Stage', module: 'crm', tier: 'Starter', desc: 'Track sales deals through dynamic pipeline stages.' },
              { cap: 'accounting.invoicing', name: 'Automated VAT Invoicing Engine', module: 'accounting', tier: 'Business', desc: 'Generate 13% localized invoices with QuickBooks sync.' },
              { cap: 'warehouse.inventory', name: 'Stock Barcode Management', module: 'warehouse', tier: 'Enterprise', desc: 'Isolated stock ledger and barcode scanning pipelines.' },
              { cap: 'healthcare.patient-records', name: 'HIPAA Compliant Patient Logs', module: 'healthcare', tier: 'Enterprise', desc: 'Highly secure, isolated, and encrypted healthcare folders.' }
            ].map(item => (
              <div key={item.cap} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 transition hover:bg-slate-100/50 text-slate-900">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] bg-slate-200/60 text-slate-600 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                      {item.cap}
                    </span>
                    <h5 className="font-extrabold text-slate-800 text-xs mt-1">{item.name}</h5>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                      item.tier === 'Enterprise' ? 'bg-[#18191A] text-white' : item.tier === 'Business' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {item.tier} REQUIRED
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Provider: <strong>{item.module}</strong></span>
                  </div>
                </div>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECHARTS CHANNELS: API VOLUMES & SYSTEM LOAD DATA VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Real-time API volumes per tenant (AreaChart) (2/3 col spacing) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4 text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Live Ingress Distribution (API Requests / Second)
              </h4>
              <p className="text-slate-500 text-[11px]">Real-time query metrics partitioned by individual tenant authorization spaces.</p>
            </div>
            <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 font-mono rounded font-medium shrink-0 self-start sm:self-auto uppercase">
              Chart Library: Recharts
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSienna" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSolas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px' }}
                  itemStyle={{ fontSize: '11px', padding: '1px 0' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Area type="monotone" name="DemoCorp" dataKey="demoTenantRequests" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDemo)" />
                <Area type="monotone" name="Sienna Clay" dataKey="siennaTenantRequests" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSienna)" />
                <Area type="monotone" name="Solas Sys" dataKey="solasTenantRequests" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorSolas)" />
                <Area type="monotone" name="Bespoke Alpha" dataKey="alphaTenantRequests" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorAlpha)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Cumulative share of total workspace storage or total metrics per tenant (PieChart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 text-slate-900">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              Tenant Query Weight Allocation
            </h4>
            <p className="text-slate-500 text-[11px]">Cumulative breakdown of API queries assigned in workspace storage.</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tenantPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tenantPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '8px' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Absolute Center total info panel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Total Volume</span>
              <span className="text-lg font-black text-slate-700 font-mono tracking-tight">
                {tenants.reduce((accum, curr) => accum + curr.apiRequests, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Legend manual color values */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-sans font-medium">
            {tenantPieData.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span className="truncate">{entry.name}: <span className="font-bold font-mono text-slate-800">{entry.value}</span></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECONDARY GRAPH: LIVE CPU CONTAINER LOAD AND DELIVERABILITY QUEUE SPURTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 3: Line Chart tracking Average response latency against active database connections */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-500" />
                Db Pool Latency Corelation Matrix
              </h4>
              <p className="text-slate-500 text-[11px]">Validates latency changes as pooled connection counts rise.</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis dataKey="avgLatencyMs" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '6px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', paddingTop: '4px' }} />
                <Line type="monotone" name="Latency (ms)" dataKey="avgLatencyMs" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" name="Connections x10" dataKey="dbPoolConnections" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Bar Chart tracking CPU & memory system load histories */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-600" />
                Cluster Node Loads (%)
              </h4>
              <p className="text-slate-500 text-[11px]">Real-time memory allocations matched against operational clock speeds.</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '6px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', paddingTop: '4px' }} />
                <Bar name="CPU Core %" dataKey="cpuLoad" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar name="Memory %" dataKey="memoryUsage" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CLUSTER TELEMETRY LOGS STREAMS TERMINAL */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 text-slate-200 flex flex-col justify-between space-y-3.5 shadow-md">
          <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <h4 className="text-xs font-bold text-slate-200 font-mono tracking-tight uppercase">Live Packet Stream Console</h4>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Filter tags supported</span>
          </div>

          {/* Filter options buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'api', 'db', 'auth', 'error'] as const).map(fl => (
              <button
                key={fl}
                onClick={() => setSelectedLogTypeFilter(fl)}
                className={`px-2 py-0.8 rounded text-[9px] font-mono leading-none border transition cursor-pointer select-none uppercase ${
                  selectedLogTypeFilter === fl
                    ? 'bg-indigo-600 text-white border-transparent'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {fl}
              </button>
            ))}
          </div>

          {/* Log list terminal area */}
          <div className="h-44 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin select-all">
            {filteredLogs.map(lg => {
              const methodColor = lg.method === 'POST' ? 'text-amber-400' : lg.method === 'DELETE' ? 'text-rose-500' : 'text-cyan-400';
              const statusColor = lg.status >= 500 ? 'text-rose-400 font-bold bg-rose-500/10 px-1 rounded' : lg.status >= 300 ? 'text-yellow-400 text-warning-400' : 'text-emerald-400';
              const typeLabel = lg.type === 'error' ? 'ERR' : lg.type.toUpperCase().substring(0, 3);
              const typeColor = lg.type === 'error' ? 'text-rose-400 font-semibold' : 'text-slate-500';
              
              return (
                <div key={lg.id} className="leading-normal hover:bg-slate-900/50 py-0.5 border-b border-white/5 pb-1 block truncate">
                  <span className="text-slate-500 text-[9px] pr-1.5">[{lg.time}]</span>
                  <span className={`${typeColor} pr-1 font-black`}>[{typeLabel}]</span>
                  <span className={`${methodColor} font-bold pr-1`}>{lg.method}</span>
                  <span className="text-slate-300 pr-1.5 font-bold">{lg.endpoint}</span>
                  <span className="text-slate-500 pr-1.5">t:{lg.tenantId.split('-')[0]}</span>
                  <span className="text-slate-400 font-semibold pr-1.5 font-mono">{lg.latencyMs}ms</span>
                  <span className={statusColor}>{lg.status}</span>
                </div>
              );
            })}
            
            {filteredLogs.length === 0 && (
              <div className="text-slate-500 italic py-10 text-center text-xs">
                {isPlaying ? 'Listening on cluster interface... Waiting for logs to stream.' : 'Streaming paused. Resume telemetry checks to stream live packet data.'}
              </div>
            )}
          </div>

          {/* Log terminal baseline status footer */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-600 font-mono uppercase">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Interval: 2500ms
            </span>
            <span>Logs Count: {filteredLogs.length} Buffer Limit: 50</span>
          </div>
        </div>

      </div>

      {/* RE-ALLOCATE AND ADJUST SPECIFIC TENANT TRAFFIC PARAMETERS OVERRIDES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Static Client Workspace Ingress Allocations
          </h4>
          <p className="text-slate-500 text-xs">Regulate cumulative API volumes manually. Sub-tenants are throttled once storage quotas are exceeded.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          {tenants.map(tn => (
            <div key={tn.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3.5 relative overflow-hidden text-slate-900">
              {/* Colored status line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${tn.health === 'Healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              
              <div className="flex justify-between items-start pl-1">
                <div>
                  <h5 className="font-extrabold text-slate-800 truncate font-sans text-xs">{tn.name}</h5>
                  <span className="text-[10px] text-slate-400 font-mono">{tn.domain}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                  tn.plan === 'Enterprise' ? 'bg-[#18191A] text-white' : tn.plan === 'Pro' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/60 text-slate-600'
                }`}>
                  {tn.plan}
                </span>
              </div>

              <div className="space-y-1.5 pl-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Usage Meter:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {tn.apiRequests.toLocaleString()} / {(tn.plan === 'Enterprise' ? 25000 : tn.plan === 'Pro' ? 10000 : 5000).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden text-slate-900">
                  <div 
                    className={`h-full rounded-full ${
                      (tn.apiRequests / (tn.plan === 'Enterprise' ? 25000 : tn.plan === 'Pro' ? 10000 : 5000)) > 0.85 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, (tn.apiRequests / (tn.plan === 'Enterprise' ? 25000 : tn.plan === 'Pro' ? 10000 : 5000)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Health Indicator:</span>
                <span className={`font-bold inline-flex items-center gap-1 ${tn.apiRequests > (tn.plan === 'Enterprise' ? 25000 : tn.plan === 'Pro' ? 10000 : 5000) ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {tn.apiRequests > (tn.plan === 'Enterprise' ? 25000 : tn.plan === 'Pro' ? 10000 : 5500) ? 'Throttled (Quota)' : 'Active (Healthy)'}
                </span>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    if (onUpdateTenantRequests) {
                      onUpdateTenantRequests(tn.id, 500);
                      onAddAudit('tenant_mutation', 'low', `Ingress Overdrive: Allocated extra +500 API calls package to Tenant "${tn.name}".`, tn.id);
                    }
                  }}
                  className="w-full text-center bg-white border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-slate-700 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                >
                  Boost quota (+500)
                </button>
                <button
                  onClick={() => {
                    if (onUpdateTenantRequests) {
                      onUpdateTenantRequests(tn.id, -1000);
                      onAddAudit('tenant_mutation', 'low', `Telemetry Purge: Manually flushed last cached API metrics for Tenant "${tn.name}".`, tn.id);
                    }
                  }}
                  className="px-2.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-lg transition text-[10px] font-bold cursor-pointer"
                  title="Purge transaction history statistics"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
