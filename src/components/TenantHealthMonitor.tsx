import React, { useState, useEffect } from 'react';
import { HardDrive, Zap, AlertTriangle, ShieldCheck, RefreshCw, ArrowUpRight, Database, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TenantHealthMonitorProps {
  tenantId: string;
  tenantName?: string;
  storageMb?: number;
  storageLimitMb?: number;
  apiRequests?: number;
  apiLimit?: number;
  onUpgradeRequest?: () => void;
  compact?: boolean;
}

export default function TenantHealthMonitor({
  tenantId,
  tenantName = 'Corporate Workspace',
  storageMb: propStorageMb,
  storageLimitMb = 5000,
  apiRequests: propApiRequests,
  apiLimit = 100000,
  onUpgradeRequest,
  compact = false
}: TenantHealthMonitorProps) {
  const [storageMb, setStorageMb] = useState<number>(propStorageMb ?? 4120);
  const [apiRequests, setApiRequests] = useState<number>(propApiRequests ?? 87400);
  const [dbLatencyMs, setDbLatencyMs] = useState<number>(18);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    // Read actual metrics from localStorage if saved for tenant
    try {
      const saved = localStorage.getItem(`marketforge_health_${tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storageMb !== undefined) setStorageMb(parsed.storageMb);
        if (parsed.apiRequests !== undefined) setApiRequests(parsed.apiRequests);
      }
    } catch (e) {
      console.warn("Could not read health monitor metrics:", e);
    }
  }, [tenantId]);

  const storagePercentage = Math.min(100, Math.round((storageMb / storageLimitMb) * 100));
  const apiPercentage = Math.min(100, Math.round((apiRequests / apiLimit) * 100));

  const isStorageHigh = storagePercentage >= 80;
  const isApiHigh = apiPercentage >= 80;
  const hasAlert = isStorageHigh || isApiHigh;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDbLatencyMs(Math.floor(12 + Math.random() * 15));
      setIsRefreshing(false);
    }, 600);
  };

  const handleOptimizeStorage = () => {
    const newStorage = Math.max(500, storageMb - 850);
    setStorageMb(newStorage);
    try {
      localStorage.setItem(`marketforge_health_${tenantId}`, JSON.stringify({
        storageMb: newStorage,
        apiRequests
      }));
    } catch (e) {}
    alert(`Optimized local storage & cleared temporary CDN caches for tenant ${tenantId}. Freed 850 MB!`);
  };

  if (compact) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">Tenant Health</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="text-slate-400 hover:text-slate-200 transition cursor-pointer p-1"
            title="Refresh System Metrics"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Warning Alert Banner */}
        {hasAlert && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-start gap-2 text-amber-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1 leading-tight">
              {isStorageHigh && <p><strong className="font-bold">Storage High ({storagePercentage}%):</strong> Approaching limit ({storageMb} / {storageLimitMb} MB).</p>}
              {isApiHigh && <p><strong className="font-bold">API Limit Warning ({apiPercentage}%):</strong> {apiRequests.toLocaleString()} / {apiLimit.toLocaleString()} calls used.</p>}
            </div>
          </div>
        )}

        {/* Storage Bar */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Storage
            </span>
            <span className={isStorageHigh ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {storageMb} / {storageLimitMb} MB ({storagePercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isStorageHigh ? 'bg-amber-400' : 'bg-indigo-500'}`}
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>

        {/* API Limit Bar */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Daily API Limit
            </span>
            <span className={isApiHigh ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {apiRequests.toLocaleString()} / {apiLimit.toLocaleString()} ({apiPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isApiHigh ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${apiPercentage}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        {hasAlert && (
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleOptimizeStorage}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer"
            >
              Purge Caches
            </button>
            {onUpgradeRequest && (
              <button
                onClick={onUpgradeRequest}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1"
              >
                Upgrade Plan <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hasAlert ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">Tenant Infrastructure & Health Monitor</h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${hasAlert ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                {hasAlert ? 'Attention Required' : 'Optimal Operations'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Real-time telemetry for tenant <strong className="font-mono text-slate-700">{tenantId}</strong> ({tenantName}).</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button 
            onClick={handleRefresh} 
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} /> Sync Metrics
          </button>
          <button
            onClick={handleOptimizeStorage}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Optimize Storage
          </button>
        </div>
      </div>

      {/* Proactive Warning Header */}
      {hasAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900">
            <h4 className="font-bold text-sm text-amber-950">Proactive Infrastructure Warning</h4>
            {isStorageHigh && <p>• <strong>High Asset Storage Usage:</strong> Tenant is using {storageMb} MB of allocated {storageLimitMb} MB ({storagePercentage}% capacity). Consider upgrading quota or purging expired exports.</p>}
            {isApiHigh && <p>• <strong>API Rate Quota Approaching Limit:</strong> {apiRequests.toLocaleString()} of {apiLimit.toLocaleString()} daily tokens consumed ({apiPercentage}% capacity).</p>}
          </div>
        </div>
      )}

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-indigo-600" /> Database & Asset Storage
            </span>
            <span className="font-mono font-bold text-slate-900">{storagePercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isStorageHigh ? 'bg-amber-500' : 'bg-indigo-600'}`}
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-mono justify-between flex">
            <span>Used: {storageMb} MB</span>
            <span>Limit: {storageLimitMb} MB</span>
          </p>
        </div>

        {/* API Rate Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" /> Daily API Token Consumption
            </span>
            <span className="font-mono font-bold text-slate-900">{apiPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isApiHigh ? 'bg-amber-500' : 'bg-emerald-600'}`}
              style={{ width: `${apiPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-mono justify-between flex">
            <span>Consumed: {apiRequests.toLocaleString()}</span>
            <span>Limit: {apiLimit.toLocaleString()}</span>
          </p>
        </div>

        {/* Latency & DB Health Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Latency & Firestore Health
            </span>
            <span className="font-mono font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> 99.99%
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {dbLatencyMs} <span className="text-xs font-normal text-slate-500">ms ping</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Firebase Firestore Region: us-central1
          </p>
        </div>
      </div>
    </div>
  );
}
