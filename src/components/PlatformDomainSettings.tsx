import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  Save, 
  RotateCw, 
  ExternalLink, 
  Check, 
  Copy, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Activity, 
  Layers, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Mail
} from 'lucide-react';
import { 
  PlatformDomainConfig, 
  DEFAULT_PLATFORM_CONFIG, 
  getPlatformDomainConfig, 
  savePlatformDomainConfig, 
  isValidHttpUrl 
} from '../lib/platformConfig';
import PlatformEmailSettings from './PlatformEmailSettings';

interface PlatformDomainSettingsProps {
  onSaved?: (config: PlatformDomainConfig) => void;
  defaultTab?: 'domains' | 'email';
}

export default function PlatformDomainSettings({ onSaved, defaultTab = 'domains' }: PlatformDomainSettingsProps) {
  const [activeTab, setActiveTab] = useState<'domains' | 'email'>(defaultTab);
  const [config, setConfig] = useState<PlatformDomainConfig>(() => getPlatformDomainConfig());
  const [loading, setLoading] = useState(false);
  const [fetchingRemote, setFetchingRemote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newAllowedDomain, setNewAllowedDomain] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'healthy' | 'error'>('idle');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Fetch persisted config from server on mount
  useEffect(() => {
    let isMounted = true;
    async function loadServerConfig() {
      setFetchingRemote(true);
      try {
        const token = localStorage.getItem('marketforge_token') || 'MOCK_ENTERPRISE_JWT_TOKEN_123';
        const res = await fetch('/api/superadmin/platform-domain', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-simulated-role': 'super_admin'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.config && isMounted) {
            setConfig(data.config);
            savePlatformDomainConfig(data.config);
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote platform domain config, using cached local config:', err);
      } finally {
        if (isMounted) setFetchingRemote(false);
      }
    }
    loadServerConfig();
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddAllowedDomain = () => {
    if (!newAllowedDomain.trim()) return;
    const trimmed = newAllowedDomain.trim().replace(/\/+$/, '');
    if (!isValidHttpUrl(trimmed, true)) {
      setErrorMessage('Please enter a valid URL (e.g. https://custom.marketforge.ai)');
      return;
    }
    if (config.allowedFrontendDomains.includes(trimmed)) {
      setErrorMessage('This domain is already in the allowed list.');
      return;
    }
    setErrorMessage(null);
    setConfig(prev => ({
      ...prev,
      allowedFrontendDomains: [...prev.allowedFrontendDomains, trimmed]
    }));
    setNewAllowedDomain('');
  };

  const handleRemoveAllowedDomain = (indexToRemove: number) => {
    setConfig(prev => ({
      ...prev,
      allowedFrontendDomains: prev.allowedFrontendDomains.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleTestApiPing = async () => {
    setPingStatus('checking');
    setPingLatency(null);
    const start = performance.now();
    try {
      const url = config.apiBaseUrl.replace(/\/+$/, '') + '/api/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setPingStatus('healthy');
        setPingLatency(latency);
      } else {
        setPingStatus('error');
      }
    } catch {
      setPingStatus('error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    // Client-side quick checks
    if (!config.platformName.trim()) {
      setErrorMessage('Platform Name is required.');
      setLoading(false);
      return;
    }
    if (!isValidHttpUrl(config.primaryPlatformUrl, config.environment === 'development')) {
      setErrorMessage('Primary Platform URL must be a valid URL with HTTPS (or HTTP in development).');
      setLoading(false);
      return;
    }
    if (!isValidHttpUrl(config.apiBaseUrl, config.environment === 'development')) {
      setErrorMessage('API Base URL must be a valid URL (e.g. https://marketforge-api-vpgj.onrender.com).');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('marketforge_token') || 'MOCK_ENTERPRISE_JWT_TOKEN_123';
      const res = await fetch('/api/superadmin/platform-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-simulated-role': 'super_admin'
        },
        body: JSON.stringify(config)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save platform domain configuration.');
      }

      const saved = savePlatformDomainConfig(data.config || config);
      setConfig(saved);
      setSaveSuccess('Platform domain & deployment configuration saved persistently.');
      if (onSaved) onSaved(saved);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset platform domain settings to default production configuration?')) {
      setConfig(DEFAULT_PLATFORM_CONFIG);
      setSaveSuccess('Reset to defaults. Click "Save Platform Configuration" to persist.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('domains')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'domains'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Platform Domain &amp; Deployment
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'email'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email &amp; SMTP Configuration
        </button>
      </div>

      {activeTab === 'email' ? (
        <PlatformEmailSettings />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-indigo-400" />
                    Super Admin Only
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border flex items-center gap-1 ${
                    config.environment === 'production' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    <Activity className="w-3 h-3" />
                    {config.environment.toUpperCase()} ENVIRONMENT
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe className="w-6 h-6 text-indigo-400" />
                  Platform Domain &amp; Deployment Configuration
                </h2>
                <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                  Configure the public platform frontend URL and backend API endpoints dynamically. Changes update CORS rules and application routing references across all modules without touching hardcoded source files.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Core Platform Domain */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Frontend Platform Identity</h3>
                  <p className="text-[11px] text-slate-500">Public web address where tenants and users access the platform</p>
                </div>
              </div>
            </div>

            {/* Platform Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={config.platformName}
                onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
                placeholder="MarketForge OS"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>

            {/* Primary Platform URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Primary Platform URL <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(config.primaryPlatformUrl, 'primaryUrl')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedField === 'primaryUrl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'primaryUrl' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={config.primaryPlatformUrl}
                  onChange={(e) => setConfig({ ...config, primaryPlatformUrl: e.target.value })}
                  placeholder="https://marketforge.scamspike.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Default: <code className="text-slate-700 font-bold font-mono">https://marketforge.scamspike.com</code></span>
                <a 
                  href={config.primaryPlatformUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Open in Tab <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Environment Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Active Deployment Environment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['production', 'staging', 'development'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setConfig({ ...config, environment: env })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer capitalize ${
                      config.environment === env
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      env === 'production' ? 'bg-emerald-400' : env === 'staging' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Backend API Configuration */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Backend API Services</h3>
                  <p className="text-[11px] text-slate-500">Dedicated microservice / Node.js Express API host</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pingStatus === 'healthy' && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Online ({pingLatency}ms)
                  </span>
                )}
                {pingStatus === 'error' && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Unreachable
                  </span>
                )}
              </div>
            </div>

            {/* API Base URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Backend API Base URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestApiPing}
                    disabled={pingStatus === 'checking'}
                    className="text-[11px] text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Activity className={`w-3 h-3 ${pingStatus === 'checking' ? 'animate-spin' : ''}`} />
                    {pingStatus === 'checking' ? 'Testing...' : 'Ping /api/health'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(config.apiBaseUrl, 'apiUrl')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedField === 'apiUrl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'apiUrl' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <input
                type="url"
                value={config.apiBaseUrl}
                onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
                placeholder="https://marketforge-api-vpgj.onrender.com"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                required
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Default: <code className="text-slate-700 font-bold font-mono">https://marketforge-api-vpgj.onrender.com</code>
              </p>
            </div>

            {/* Architecture note */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Zero-Hardcoding Architecture
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                When the API Base URL is saved here, clients dynamically route authenticated requests and AI orchestrations through this host without client rebuilds.
              </p>
            </div>
          </div>
        </div>

        {/* Allowed Secondary Frontend Domains & CORS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Allowed Secondary Frontend Origins & CORS</h3>
                <p className="text-[11px] text-slate-500">Domains authorized to make API and auth calls with origin headers</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://portal.customdomain.com"
              value={newAllowedDomain}
              onChange={(e) => setNewAllowedDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllowedDomain(); } }}
              className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddAllowedDomain}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Allowed Domain
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {config.allowedFrontendDomains.map((domain, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-xl font-mono flex items-center gap-2 shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>{domain}</span>
                {domain === config.primaryPlatformUrl && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">Primary</span>
                )}
                {config.allowedFrontendDomains.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAllowedDomain(index)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                    title="Remove domain"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Saving to Firestore & Server Memory...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Platform Configuration
              </>
            )}
          </button>
        </div>
      </form>
      </>
      )}
    </div>
  );
}
