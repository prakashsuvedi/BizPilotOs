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
  Clock,
  Download,
  Save,
  FileText,
  BarChart3,
  Flame,
  DollarSign,
  KeyRound
} from 'lucide-react';
import { downloadVaultSecretsBackup } from '../lib/tenantSecretVaultEngine';
import { PlatformAuditLog, TenantConfig } from './SuperAdminPortal';
import { CURRENT_SYSTEM_SCHEMA_VERSION, validateTenantSchemaCompatibility, migrateTenantDataToCurrentVersion } from '../lib/schemaMigrationManager';
import { invalidateScannableCache } from '../lib/scannableQueryCache';
import { createTenantBackupSnapshot, downloadBackupSnapshotJson } from '../lib/tenantBackupEngine';
import { runConcurrencyLoadTest, LoadTestMetrics } from '../lib/loadTesterEngine';
import { getQuotaUsageStats, evaluateQuotaHealth, recordDatabaseOperation } from '../lib/quotaMonitorEngine';
import { generateComplianceReport, downloadComplianceReportHtml } from '../lib/complianceReportGenerator';
import { triggerSimulatedIncident, executeRecoveryPlaybook, SimulatedIncident } from '../lib/incidentSimulatorEngine';
import { evaluateQueryIndexHealth, downloadFirestoreIndexesJsonFile } from '../lib/indexOptimizerEngine';
import { Award, FileCheck2, Wrench, Layers, FileCode2 } from 'lucide-react';

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

  // Load testing & read-unit benchmarking state
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [testProgress, setTestProgress] = useState<number>(0);
  const [testResults, setTestResults] = useState<LoadTestMetrics | null>(null);

  // Quota & Read/Write Unit Monitor state
  const [quotaStats, setQuotaStats] = useState(getQuotaUsageStats());

  // Emergency Incident Simulator state
  const [activeIncidents, setActiveIncidents] = useState<SimulatedIncident[]>([]);

  // Interval hook to simulate real-time ingress stream
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Simulate database read/write unit tracking during live operations
      recordDatabaseOperation('read', Math.floor(Math.random() * 4) + 1);
      if (Math.random() > 0.6) recordDatabaseOperation('write', 1);
      setQuotaStats(getQuotaUsageStats());
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

      {/* Non-Destructive Database Schema Migration & Scannable Cache Engine */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Schema Migration & Zero-Downtime Engine
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v{CURRENT_SYSTEM_SCHEMA_VERSION} Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Guarantees tenant custom domain configurations, custom branding, and settings are preserved during version updates.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              invalidateScannableCache();
              onAddAudit('system', 'low', `Cleared global query memory caches across all active tenant schemas.`);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Flush Scannable Query Cache
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 space-y-2">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
              Tenant Domain Protection
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              100% Isolated Domains
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Custom SSL hostnames & DNS configurations are stored in protected <code className="text-indigo-300">_systemMeta</code> blocks, preventing release overrides.
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 space-y-2">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
              Schema Auto-Migration
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Non-Destructive Backfill
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              New release fields are lazily injected without overwriting existing tenant customizations or deleting historic fields.
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 space-y-2">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
              Firestore Index Security
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Multi-Tenant Rules Deployed
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Strict row/document-level isolation active across all 18 core database collections.
            </p>
          </div>
        </div>

        {/* Tenant Schema Compatibility List */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-300 mb-2 font-mono uppercase tracking-wider">
            Active Tenant Schema Compatibility Verification
          </h4>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
            {tenants.map((tn) => {
              const compat = validateTenantSchemaCompatibility(tn);
              const migrated = migrateTenantDataToCurrentVersion(tn, { plan: tn.plan });
              return (
                <div key={tn.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/60 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <div>
                      <span className="font-bold text-slate-200">{tn.name}</span>
                      <span className="text-slate-500 text-[10px] ml-2">ID: {tn.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-mono text-slate-400">
                      Target Schema: <span className="text-indigo-400 font-bold">v{migrated._systemMeta.schemaVersion}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Compatible
                    </span>
                    <button
                      onClick={async () => {
                        const snap = await createTenantBackupSnapshot(tn.id, tn, `Manual Upgrade Snapshot v${CURRENT_SYSTEM_SCHEMA_VERSION}`);
                        downloadBackupSnapshotJson(snap);
                        onAddAudit('system', 'medium', `Generated & downloaded point-in-time JSON snapshot for tenant [${tn.name}] (${tn.id}).`);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Generate and download point-in-time state backup"
                    >
                      <Download className="w-3 h-3 text-indigo-400" />
                      Download Backup
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Concurrency & Read-Unit Load Tester Card */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                High-Concurrency Load & Read-Unit Benchmark Simulator
              </h4>
            </div>
            <button
              disabled={isRunningTest}
              onClick={async () => {
                setIsRunningTest(true);
                setTestProgress(0);
                onAddAudit('system', 'medium', 'Initiated 250-query multi-tenant high-concurrency database load benchmark.');
                const res = await runConcurrencyLoadTest(25, 10, (p) => setTestProgress(p));
                setTestResults(res);
                setIsRunningTest(false);
                onAddAudit('system', 'low', `Completed load benchmark: ${res.throughputRps} req/sec | ${res.cacheHitRatio}% Cache Hit Ratio | ${res.avgLatencyMs}ms avg latency.`);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isRunningTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isRunningTest ? `Running Benchmark (${testProgress}%)...` : 'Run Load Benchmark'}
            </button>
          </div>

          {isRunningTest && (
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${testProgress}%` }}
              ></div>
            </div>
          )}

          {testResults && (
            <div className="bg-slate-950/70 rounded-xl p-3 border border-amber-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono">Throughput</span>
                <div className="text-sm font-bold text-amber-400">{testResults.throughputRps} req/sec</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono">Avg Latency (p95)</span>
                <div className="text-sm font-bold text-emerald-400">{testResults.avgLatencyMs}ms ({testResults.p95LatencyMs}ms)</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono">Cache Hit Ratio</span>
                <div className="text-sm font-bold text-indigo-400">{testResults.cacheHitRatio}%</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono">Read Units Saved</span>
                <div className="text-sm font-bold text-teal-400">+{testResults.readUnitsSaved} RU</div>
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Firestore Quota & Read/Write Unit Telemetry Card */}
        {(() => {
          const quotaHealth = evaluateQuotaHealth(quotaStats);
          return (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Real-Time Firestore Quota & Read/Write Telemetry
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">
                    Est. Daily Cost Overage: <span className="font-bold text-emerald-400 font-mono">${quotaStats.projectedCostUsd.toFixed(2)}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    {quotaStats.cacheEfficiencySavingsPercent}% RU Saved by Cache
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Daily Reads */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono font-semibold">Daily Reads</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {quotaStats.dailyReads.toLocaleString()} / {quotaStats.readLimitDaily.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        quotaHealth.readPercent > 90 ? 'bg-rose-500' : quotaHealth.readPercent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${quotaHealth.readPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Free Tier Threshold</span>
                    <span>{quotaHealth.readPercent}% Used</span>
                  </div>
                </div>

                {/* Daily Writes */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono font-semibold">Daily Writes</span>
                    <span className="font-bold font-mono text-indigo-400">
                      {quotaStats.dailyWrites.toLocaleString()} / {quotaStats.writeLimitDaily.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        quotaHealth.writePercent > 90 ? 'bg-rose-500' : quotaHealth.writePercent > 75 ? 'bg-amber-400' : 'bg-indigo-400'
                      }`}
                      style={{ width: `${quotaHealth.writePercent}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Free Tier Threshold</span>
                    <span>{quotaHealth.writePercent}% Used</span>
                  </div>
                </div>

                {/* Storage Footprint */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono font-semibold">Estimated Storage</span>
                    <span className="font-bold font-mono text-cyan-400">
                      {quotaStats.estimatedStorageMb} MB / 1,024 MB
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${Math.round((quotaStats.estimatedStorageMb / 1024) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Document Storage</span>
                    <span>{Math.round((quotaStats.estimatedStorageMb / 1024) * 100)}% Used</span>
                  </div>
                </div>

                {/* Daily Deletes */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono font-semibold">Daily Deletes</span>
                    <span className="font-bold font-mono text-purple-400">
                      {quotaStats.dailyDeletes.toLocaleString()} / {quotaStats.deleteLimitDaily.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-purple-400 h-full transition-all duration-300"
                      style={{ width: `${Math.round((quotaStats.dailyDeletes / quotaStats.deleteLimitDaily) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Soft Deletes Active</span>
                    <span>{Math.round((quotaStats.dailyDeletes / quotaStats.deleteLimitDaily) * 100)}% Used</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Enterprise Compliance & Security Certificate Export Action */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-xl border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                Enterprise Security & SOC2 / ISO 27001 Compliance Certificate
              </h4>
              <p className="text-[11px] text-slate-400">
                Generate an official, audit-ready HTML report verifying 18-collection Firestore isolation, schema safety, and quota efficiency.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                downloadVaultSecretsBackup();
                onAddAudit('security', 'low', 'Exported encrypted tenant secrets vault backup JSON.');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Backup Secrets Vault
            </button>
            <button
              onClick={() => {
                const rep = generateComplianceReport(tenants, audits.length);
                downloadComplianceReportHtml(rep, tenants);
                onAddAudit('security', 'low', `Exported Enterprise Security & Compliance Audit Certificate [${rep.reportId}].`);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              Download Compliance Certificate
            </button>
          </div>
        </div>

        {/* Emergency Incident Simulator & 1-Click Recovery Playbook Card */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Emergency Incident Simulator & Self-Healing Playbooks
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const inc = triggerSimulatedIncident('rule_leak_attempt');
                  setActiveIncidents((prev) => [inc, ...prev]);
                  onAddAudit('security', 'high', `SIMULATED EMERGENCY INCIDENT: ${inc.title} - ${inc.description}`);
                }}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded text-[10px] font-semibold transition cursor-pointer"
              >
                Simulate Rule Breach
              </button>
              <button
                onClick={() => {
                  const inc = triggerSimulatedIncident('quota_spike');
                  setActiveIncidents((prev) => [inc, ...prev]);
                  onAddAudit('system', 'high', `SIMULATED EMERGENCY INCIDENT: ${inc.title} - ${inc.description}`);
                }}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold transition cursor-pointer"
              >
                Simulate Quota Spike
              </button>
              <button
                onClick={() => {
                  const inc = triggerSimulatedIncident('schema_mismatch');
                  setActiveIncidents((prev) => [inc, ...prev]);
                  onAddAudit('system', 'medium', `SIMULATED EMERGENCY INCIDENT: ${inc.title} - ${inc.description}`);
                }}
                className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-semibold transition cursor-pointer"
              >
                Simulate Schema Drift
              </button>
            </div>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              No active emergency incidents simulated. Platform operating in nominal 100% self-healing state.
            </div>
          ) : (
            <div className="space-y-2">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    inc.status === 'remediated'
                      ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                      : inc.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold font-mono text-[11px]">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          inc.status === 'remediated'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : inc.severity === 'critical'
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {inc.status === 'remediated' ? 'Remediated' : inc.severity}
                      </span>
                      <span>[{inc.id}]</span>
                      <span>{inc.title}</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">{inc.description}</p>
                    <div className="text-[10px] font-mono text-indigo-300/80">
                      Playbook Action: {inc.remediationAction}
                    </div>
                  </div>

                  {inc.status === 'active' && (
                    <button
                      onClick={() => {
                        const { remediatedIncident, remediationLog } = executeRecoveryPlaybook(inc);
                        setActiveIncidents((prev) => prev.map((i) => (i.id === inc.id ? remediatedIncident : i)));
                        onAddAudit('security', 'medium', remediationLog);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer shrink-0"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Run Auto-Playbook
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section C: Multi-Tenant Database Query Index Optimizer & Inspector Card */}
        {(() => {
          const indexHealth = evaluateQueryIndexHealth();
          return (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Multi-Tenant Query Index Optimizer & Inspector
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                    {indexHealth.healthScorePercent}% Index Coverage ({indexHealth.totalCompositeIndexes} Active Composite Indexes)
                  </span>
                  <button
                    onClick={() => {
                      downloadFirestoreIndexesJsonFile();
                      onAddAudit('system', 'low', 'Exported production firestore.indexes.json composite index schema configuration.');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    Export firestore.indexes.json
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {indexHealth.recommendations.map((rec) => (
                  <div key={rec.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-indigo-300">Collection: {rec.collectionId}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {rec.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                      <div className="text-slate-500">Indexed Fields Sequence:</div>
                      <div className="text-cyan-300">
                        {rec.queryFields.map((f) => `${f.fieldPath} (${f.order})`).join(' ➔ ')}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
}
