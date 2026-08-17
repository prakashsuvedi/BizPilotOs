import React, { useState, useEffect } from 'react';
import { getPlatformUrl } from '../lib/platformConfig';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity, 
  Code, 
  Terminal, 
  Lock, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Cpu, 
  Zap, 
  FileCode,
  Sliders,
  RefreshCw
} from 'lucide-react';

export interface ApiKeyRecord {
  id: string;
  tenantId: string;
  name: string;
  keySecret: string;
  scopes: string[];
  rateLimitReqPerMin: number;
  totalCalls: number;
  lastUsedAt?: string;
  createdAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface ApiRequestLog {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  ipAddress: string;
  keyName: string;
  timestamp: string;
}

interface ApiGatewayDeveloperPortalProps {
  tenantId: string;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
}

export default function ApiGatewayDeveloperPortal({
  tenantId,
  onCreateAuditLog
}: ApiGatewayDeveloperPortalProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [requestLogs, setRequestLogs] = useState<ApiRequestLog[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form State
  const [keyName, setKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(120);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'read:analytics',
    'write:bookings',
    'execute:ai'
  ]);

  // Code Snippet Generator State
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/leads');
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'nodejs' | 'python' | 'php'>('curl');

  const AVAILABLE_SCOPES = [
    { id: 'read:analytics', label: 'Read Analytics Data', desc: 'Query campaign conversion rates and dashboard stats' },
    { id: 'write:bookings', label: 'Create Hotel Bookings', desc: 'Submit guest room reservations and check-in dates' },
    { id: 'manage:tenants', label: 'Tenant Administration', desc: 'Read and update tenant profile and white-label settings' },
    { id: 'trigger:webhooks', label: 'Trigger Webhooks', desc: 'Dispatch outgoing webhooks and ingest payloads' },
    { id: 'execute:ai', label: 'Execute Gemini AI', desc: 'Access MarketForge server-side Gemini intelligence models' }
  ];

  useEffect(() => {
    loadKeysAndLogs();
  }, [tenantId]);

  const loadKeysAndLogs = () => {
    const keyStorageKey = `marketforge_apikeys_${tenantId}`;
    const rawKeys = localStorage.getItem(keyStorageKey);
    let keysList: ApiKeyRecord[] = [];

    if (rawKeys) {
      try {
        keysList = JSON.parse(rawKeys);
      } catch (e) {}
    }

    if (keysList.length === 0) {
      keysList = [
        {
          id: `key_${Date.now()}_1`,
          tenantId,
          name: 'Primary Enterprise Production Key',
          keySecret: `mk_live_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`,
          scopes: ['read:analytics', 'write:bookings', 'execute:ai'],
          rateLimitReqPerMin: 300,
          totalCalls: 1420,
          lastUsedAt: new Date(Date.now() - 120000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'ACTIVE'
        },
        {
          id: `key_${Date.now()}_2`,
          tenantId,
          name: 'Staging & Webhook Integration Key',
          keySecret: `mk_test_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`,
          scopes: ['trigger:webhooks', 'read:analytics'],
          rateLimitReqPerMin: 60,
          totalCalls: 280,
          lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'ACTIVE'
        }
      ];
      localStorage.setItem(keyStorageKey, JSON.stringify(keysList));
    }

    setApiKeys(keysList);

    // Bootstrap Request Logs
    const sampleLogs: ApiRequestLog[] = [
      { id: 'req_1', method: 'POST', endpoint: '/api/v1/leads', statusCode: 201, latencyMs: 42, ipAddress: '199.195.143.10', keyName: 'Primary Enterprise Production Key', timestamp: new Date(Date.now() - 15000).toISOString() },
      { id: 'req_2', method: 'GET', endpoint: '/api/v1/analytics', statusCode: 200, latencyMs: 18, ipAddress: '199.195.143.10', keyName: 'Primary Enterprise Production Key', timestamp: new Date(Date.now() - 45000).toISOString() },
      { id: 'req_3', method: 'POST', endpoint: '/api/v1/ai/generate', statusCode: 200, latencyMs: 185, ipAddress: '103.21.244.12', keyName: 'Primary Enterprise Production Key', timestamp: new Date(Date.now() - 120000).toISOString() },
      { id: 'req_4', method: 'POST', endpoint: '/api/v1/bookings', statusCode: 200, latencyMs: 64, ipAddress: '45.115.60.22', keyName: 'Staging & Webhook Integration Key', timestamp: new Date(Date.now() - 300000).toISOString() }
    ];
    setRequestLogs(sampleLogs);
  };

  const saveKeys = (updated: ApiKeyRecord[]) => {
    setApiKeys(updated);
    localStorage.setItem(`marketforge_apikeys_${tenantId}`, JSON.stringify(updated));
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    const freshKey: ApiKeyRecord = {
      id: `key_${Date.now()}`,
      tenantId,
      name: keyName.trim(),
      keySecret: `mk_live_${Math.random().toString(36).substring(2, 14)}_${Math.random().toString(36).substring(2, 14)}`,
      scopes: selectedScopes,
      rateLimitReqPerMin: rateLimit,
      totalCalls: 0,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    const next = [freshKey, ...apiKeys];
    saveKeys(next);
    setShowNewKeyModal(false);
    setKeyName('');

    if (onCreateAuditLog) {
      onCreateAuditLog('API_KEY_GENERATED', 'info', `Generated API Key '${freshKey.name}' with scopes [${selectedScopes.join(', ')}]`);
    }
  };

  const handleRevokeKey = (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this API key? External clients using it will be blocked immediately.')) return;
    const updated = apiKeys.map(k => k.id === id ? { ...k, status: 'REVOKED' as const } : k);
    saveKeys(updated);

    if (onCreateAuditLog) {
      onCreateAuditLog('API_KEY_REVOKED', 'warning', `Revoked API Key ID: ${id}`);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  // Generate working code snippet based on endpoint & language
  const activeKey = apiKeys.find(k => k.status === 'ACTIVE')?.keySecret || 'mk_live_your_api_key_here';
  
  const generateSnippet = () => {
    const baseUrl = getPlatformUrl();
    if (selectedLang === 'curl') {
      return `curl -X POST "${baseUrl}${selectedEndpoint}" \\
  -H "Authorization: Bearer ${activeKey}" \\
  -H "X-Tenant-ID: ${tenantId}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenantId": "${tenantId}",
    "source": "api_gateway",
    "timestamp": "${new Date().toISOString()}"
  }'`;
    }

    if (selectedLang === 'javascript') {
      return `const response = await fetch("${baseUrl}${selectedEndpoint}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${activeKey}",
    "X-Tenant-ID": "${tenantId}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    tenantId: "${tenantId}",
    source: "api_gateway"
  })
});

const data = await response.json();
console.log("API Response:", data);`;
    }

    if (selectedLang === 'nodejs') {
      return `const axios = require('axios');

async function callMarketForgeApi() {
  const res = await axios.post('${baseUrl}${selectedEndpoint}', {
    tenantId: '${tenantId}',
    source: 'node_sdk'
  }, {
    headers: {
      'Authorization': 'Bearer ${activeKey}',
      'X-Tenant-ID': '${tenantId}'
    }
  });

  console.log('Result:', res.data);
}

callMarketForgeApi();`;
    }

    if (selectedLang === 'python') {
      return `import requests

url = "${baseUrl}${selectedEndpoint}"
headers = {
    "Authorization": "Bearer ${activeKey}",
    "X-Tenant-ID": "${tenantId}",
    "Content-Type": "application/json"
}
payload = {
    "tenantId": "${tenantId}",
    "source": "python_script"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }

    return `<?php
$ch = curl_init("${baseUrl}${selectedEndpoint}");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer ${activeKey}",
    "X-Tenant-ID: ${tenantId}",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "tenantId" => "${tenantId}",
    "source" => "php_client"
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;
  };

  return (
    <div id="api-gateway-portal" className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#18191A] border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              API Gateway & Rate Limiting Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">API Gateway & Developer Portal</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Provision scoped Bearer API tokens, configure rate limits, inspect real-time HTTP traffic, and generate SDK code snippets.
          </p>
        </div>

        <button
          onClick={() => setShowNewKeyModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg transition cursor-pointer shrink-0 relative z-10"
        >
          <Plus className="w-4 h-4" /> Provision API Token
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: API Keys Table & Rate Limits (Grid 7) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-xs">Active Bearer API Tokens</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{apiKeys.filter(k => k.status === 'ACTIVE').length} Tokens Active</span>
            </div>

            <div className="space-y-3">
              {apiKeys.map(key => (
                <div key={key.id} className={`p-4 rounded-2xl border space-y-3 transition ${
                  key.status === 'ACTIVE' ? 'bg-slate-50/80 border-slate-200' : 'bg-rose-50/50 border-rose-200 opacity-60'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${key.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <h4 className="font-bold text-xs text-slate-900">{key.name}</h4>
                      </div>

                      {/* Secret Copy Box */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 font-mono text-[11px] select-all">
                        <code className="text-indigo-900 font-semibold">{key.keySecret.slice(0, 18)}••••••••••••</code>
                        <button
                          onClick={() => handleCopy(key.keySecret, key.id)}
                          className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          title="Copy API Token"
                        >
                          {copiedText === key.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {key.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-[10px] font-bold text-rose-600 hover:bg-rose-100/60 px-2.5 py-1 rounded-lg border border-rose-200 transition cursor-pointer"
                      >
                        Revoke Key
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">REVOKED</span>
                    )}
                  </div>

                  {/* Metadata & Scopes */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[10px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-400 uppercase font-mono">Scopes:</span>
                      {key.scopes.map((scope, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-mono font-semibold">
                          {scope}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 font-mono">
                      <span>Rate Limit: {key.rateLimitReqPerMin} req/min</span>
                      <span>Total Calls: {key.totalCalls}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time API Request Log Inspector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-xs">Live API Request Stream</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                ● Listening on Gateway
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-900 text-white text-[10px]">
                  <tr>
                    <th className="p-2.5">Method & Endpoint</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-right">Latency</th>
                    <th className="p-2.5 text-right">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {requestLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] mr-2 ${
                          log.method === 'POST' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {log.method}
                        </span>
                        {log.endpoint}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.statusCode < 300 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-indigo-600">{log.latencyMs}ms</td>
                      <td className="p-2.5 text-right text-slate-400">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Code Snippet Generator (Grid 5) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="font-bold text-white text-xs">SDK Code Snippet Generator</h3>
              </div>

              <button
                onClick={() => handleCopy(generateSnippet(), 'snippet')}
                className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText === 'snippet' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">1. Endpoint</label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="/api/v1/leads">/api/v1/leads (Create Lead)</option>
                  <option value="/api/v1/analytics">/api/v1/analytics (Fetch Stats)</option>
                  <option value="/api/v1/bookings">/api/v1/bookings (Create Room Booking)</option>
                  <option value="/api/v1/ai/generate">/api/v1/ai/generate (Gemini AI)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">2. Language / SDK</label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="curl">cURL CLI</option>
                  <option value="javascript">JavaScript (Fetch API)</option>
                  <option value="nodejs">Node.js (Axios)</option>
                  <option value="python">Python (requests)</option>
                  <option value="php">PHP (cURL)</option>
                </select>
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto select-all">
              <pre>{generateSnippet()}</pre>
            </div>
          </div>
        </div>

      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 font-sans text-slate-900 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Provision New Bearer API Token</h3>
              <button onClick={() => setShowNewKeyModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Key Description / Client Name</label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Mobile App Integration Client"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rate Limit (Requests per Minute)</label>
                <input
                  type="number"
                  min={10}
                  max={2000}
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">Granular Permission Scopes</label>
                <div className="space-y-2">
                  {AVAILABLE_SCOPES.map(s => (
                    <div
                      key={s.id}
                      onClick={() => toggleScope(s.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        selectedScopes.includes(s.id) ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{s.label} <code className="text-slate-400 text-[10px]">({s.id})</code></div>
                        <div className="text-[10px] text-slate-500">{s.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(s.id)}
                        onChange={() => {}}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewKeyModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!keyName.trim() || selectedScopes.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm disabled:bg-slate-300"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
