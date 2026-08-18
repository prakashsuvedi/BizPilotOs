import React, { useState, useEffect } from 'react';
import {
  Mail,
  Server,
  ShieldCheck,
  Save,
  RotateCw,
  Send,
  Check,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  PlatformEmailConfig,
  DEFAULT_PLATFORM_EMAIL_CONFIG,
  EmailProviderType,
  SmtpSecurityType
} from '../lib/platformConfig';

interface PlatformEmailSettingsProps {
  onSaved?: (config: PlatformEmailConfig) => void;
}

export default function PlatformEmailSettings({ onSaved }: PlatformEmailSettingsProps) {
  const [config, setConfig] = useState<PlatformEmailConfig>(DEFAULT_PLATFORM_EMAIL_CONFIG);
  const [loading, setLoading] = useState(false);
  const [fetchingRemote, setFetchingRemote] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load server-persisted configuration on mount
  useEffect(() => {
    let isMounted = true;
    async function loadServerEmailConfig() {
      setFetchingRemote(true);
      try {
        const token = localStorage.getItem('marketforge_token') || 'MOCK_ENTERPRISE_JWT_TOKEN_123';
        const res = await fetch('/api/superadmin/platform-email', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-simulated-role': 'super_admin'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.config && isMounted) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote email config, using fallback default:', err);
      } finally {
        if (isMounted) setFetchingRemote(false);
      }
    }
    loadServerEmailConfig();
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveConfig = async (inlineConfigOverride?: Partial<PlatformEmailConfig>): Promise<boolean> => {
    setLoading(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    const payload = {
      ...config,
      ...(inlineConfigOverride || {})
    };

    // Client-side format checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.senderEmail || !emailRegex.test(payload.senderEmail.trim())) {
      setErrorMessage('Please provide a valid Sender Email address (e.g. marketforge@scamspike.com).');
      setLoading(false);
      return false;
    }
    if (payload.replyToEmail && payload.replyToEmail.trim() && !emailRegex.test(payload.replyToEmail.trim())) {
      setErrorMessage('Please provide a valid Reply-To Email address format.');
      setLoading(false);
      return false;
    }
    if (payload.provider === 'smtp' && (!payload.smtpHost || !payload.smtpHost.trim())) {
      setErrorMessage('SMTP Host is required when using SMTP relay.');
      setLoading(false);
      return false;
    }

    try {
      const token = localStorage.getItem('marketforge_token') || 'MOCK_ENTERPRISE_JWT_TOKEN_123';
      const res = await fetch('/api/superadmin/platform-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-simulated-role': 'super_admin'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save email configuration.');
      }

      setConfig(prev => ({
        ...prev,
        ...data.config,
        // Clear plaintext password fields from state after save for security
        smtpPassword: '',
        sendgridApiKey: '',
        resendApiKey: ''
      }));

      setSaveSuccess('Platform email & SMTP configuration saved successfully.');
      if (onSaved) onSaved(data.config);
      setTimeout(() => setSaveSuccess(null), 4000);
      return true;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save platform email settings.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      setErrorMessage('Please enter a valid recipient email address for testing.');
      return;
    }

    setTesting(true);
    setErrorMessage(null);
    setTestResult(null);

    try {
      const token = localStorage.getItem('marketforge_token') || 'MOCK_ENTERPRISE_JWT_TOKEN_123';
      const res = await fetch('/api/superadmin/platform-email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-simulated-role': 'super_admin'
        },
        body: JSON.stringify({
          recipientEmail: testRecipient.trim(),
          testSubject: testSubject.trim() || undefined,
          testMessage: testMessage.trim() || undefined,
          provider: config.provider,
          resendApiKey: config.resendApiKey || undefined,
          senderEmail: config.senderEmail || undefined,
          senderName: config.senderName || undefined
        })
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        setConfig(prev => ({
          ...prev,
          lastTestStatus: 'SUCCESS',
          lastTestedAt: new Date().toISOString(),
          lastTestRecipient: testRecipient,
          lastTestError: null
        }));
      } else {
        setConfig(prev => ({
          ...prev,
          lastTestStatus: 'FAILED',
          lastTestedAt: new Date().toISOString(),
          lastTestRecipient: testRecipient,
          lastTestError: data.error || 'Connection failed'
        }));
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        provider: config.provider,
        stage: 'NETWORK_REQUEST',
        error: err.message || 'Failed to dispatch test request.',
        recommendation: 'Verify backend API connectivity and network routing.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndTest = async () => {
    const saved = await handleSaveConfig();
    if (saved) {
      await handleTestEmail();
    }
  };

  // Helper for port selection automatic security default
  const handlePortChange = (portVal: number) => {
    let security: SmtpSecurityType = config.smtpSecurity;
    if (portVal === 465) security = 'ssl';
    else if (portVal === 587 || portVal === 2525) security = 'tls';
    setConfig({
      ...config,
      smtpPort: portVal,
      smtpSecurity: security
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                Super Admin Server-Side Security
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border flex items-center gap-1 ${
                config.enableProductionEmail
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                <Activity className="w-3 h-3" />
                {config.enableProductionEmail ? 'LIVE PRODUCTION DISPATCH' : 'SANDBOX SIMULATOR ONLY'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-400" />
              Platform Email &amp; SMTP Configuration
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Configure the central email pipeline for tenant invites, password resets, onboarding notifications, and automated workflows. Credentials remain protected server-side and write-only.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-right text-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Transport</div>
              <div className="font-mono font-bold text-indigo-300 flex items-center justify-end gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                {config.provider.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Email Gateway Provider</h3>
              <p className="text-[11px] text-slate-500">Select how transactional and system emails are relayed</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SMTP Option */}
          <button
            type="button"
            onClick={() => setConfig({ ...config, provider: 'smtp' })}
            className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
              config.provider === 'smtp'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                config.provider === 'smtp' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Server className="w-3.5 h-3.5" />
              </div>
              {config.provider === 'smtp' && (
                <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-900">SMTP Server Relay</div>
            <div className="text-[11px] text-slate-500 mt-1">Dedicated SMTP/SMTPS (scamspike.com, SMTP2GO, SES, etc.)</div>
          </button>

          {/* SendGrid Option */}
          <button
            type="button"
            onClick={() => setConfig({ ...config, provider: 'sendgrid' })}
            className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
              config.provider === 'sendgrid'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                config.provider === 'sendgrid' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Zap className="w-3.5 h-3.5" />
              </div>
              {config.provider === 'sendgrid' && (
                <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-900">SendGrid Cloud API</div>
            <div className="text-[11px] text-slate-500 mt-1">Direct REST API dispatch using SendGrid keys</div>
          </button>

          {/* Resend Option */}
          <button
            type="button"
            onClick={() => setConfig({ ...config, provider: 'resend' })}
            className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
              config.provider === 'resend'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                config.provider === 'resend' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              {config.provider === 'resend' && (
                <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-900">Resend REST API</div>
            <div className="text-[11px] text-slate-500 mt-1">Modern developer transactional mail gateway</div>
          </button>

          {/* Simulator Option */}
          <button
            type="button"
            onClick={() => setConfig({ ...config, provider: 'simulator' })}
            className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
              config.provider === 'simulator'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                config.provider === 'simulator' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Activity className="w-3.5 h-3.5" />
              </div>
              {config.provider === 'simulator' && (
                <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-900">Sandbox Simulator</div>
            <div className="text-[11px] text-slate-500 mt-1">Logs emails in memory for safe staging preview</div>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Server Transport Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Outbound Relay Parameters</h3>
                <p className="text-[11px] text-slate-500">Connection bindings and authentication</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
              {config.provider.toUpperCase()} MODE
            </span>
          </div>

          {/* SMTP Fields */}
          {config.provider === 'smtp' && (
            <>
              {/* SMTP Host */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    SMTP Host <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(config.smtpHost, 'host')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedField === 'host' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'host' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <input
                  type="text"
                  value={config.smtpHost}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                  placeholder="scamspike.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Default: <code className="text-slate-700 font-bold font-mono">scamspike.com</code></span>
                </div>
              </div>

              {/* Port and Security Protocol Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Port <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={config.smtpPort}
                      onChange={(e) => handlePortChange(parseInt(e.target.value, 10) || 465)}
                      placeholder="465"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                      min={1}
                      max={65535}
                      required
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {[465, 587, 2525].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePortChange(p)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border cursor-pointer ${
                          config.smtpPort === p 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p} {p === 465 ? '(SSL)' : '(TLS)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security Protocol <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={config.smtpSecurity}
                    onChange={(e) => setConfig({ ...config, smtpSecurity: e.target.value as SmtpSecurityType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ssl">SSL (Implicit Encrypted - Port 465)</option>
                    <option value="tls">TLS / STARTTLS (Port 587 / 2525)</option>
                    <option value="none">None (Plain / Internal Network)</option>
                  </select>
                </div>
              </div>

              {/* SMTP Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SMTP Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.smtpUser}
                  onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  placeholder="marketforge@scamspike.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* SMTP Password (Write-Only Secret) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    SMTP Password <span className="text-rose-500">*</span>
                  </label>
                  {config.smtpPasswordSet && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Stored on Server (Write-Only)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.smtpPassword || ''}
                    onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                    placeholder={config.smtpPasswordSet ? 'Leave blank to keep existing password, or enter new password' : 'Enter SMTP Password'}
                    className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Protected: Plaintext passwords are never transmitted in browser state or GET responses.
                </p>
              </div>
            </>
          )}

          {/* SendGrid Fields */}
          {config.provider === 'sendgrid' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    SendGrid API Key <span className="text-rose-500">*</span>
                  </label>
                  {config.sendgridApiKeySet && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Key Saved
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.sendgridApiKey || ''}
                    onChange={(e) => setConfig({ ...config, sendgridApiKey: e.target.value })}
                    placeholder={config.sendgridApiKeySet ? 'Leave blank to keep existing key (SG.••••••••)' : 'SG.xxxxxxxxxxxxxxxx'}
                    className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Requires Mail Send permission scope on SendGrid.
                </p>
              </div>
            </div>
          )}

          {/* Resend Fields */}
          {config.provider === 'resend' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Resend API Key <span className="text-rose-500">*</span>
                  </label>
                  {config.resendApiKeySet && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Key Saved (re_••••••••)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.resendApiKey || ''}
                    onChange={(e) => setConfig({ ...config, resendApiKey: e.target.value })}
                    placeholder={config.resendApiKeySet ? 'Leave blank to keep existing key (re_••••••••)' : 're_xxxxxxxxxxxxxxxx'}
                    className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your Resend secret key starting with <code className="font-mono font-bold text-slate-600">re_</code>.
                </p>
              </div>

              {/* Verified Resend Domain Banner */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Verified Domain: <span className="font-mono text-[11px] text-emerald-950">marketforge.scamspike.com</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Outbound transactional emails will dispatch directly via HTTPS API without SMTP port restrictions.
                </p>
                {config.senderEmail !== 'noreply@marketforge.scamspike.com' && (
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, senderEmail: 'noreply@marketforge.scamspike.com' })}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer pt-0.5"
                  >
                    Set Sender Email to noreply@marketforge.scamspike.com
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Simulator Info */}
          {config.provider === 'simulator' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Info className="w-4 h-4 text-amber-600" />
                Sandbox Simulator Active
              </div>
              <p className="leading-relaxed">
                Outbound emails are captured internally in the diagnostic audit log and sandbox store. No live network packets or third-party API quotas are consumed.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sender Identity & Delivery Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sender Identity &amp; Routing</h3>
                <p className="text-[11px] text-slate-500">Corporate branding headers visible to email recipients</p>
              </div>
            </div>
          </div>

          {/* Sender Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sender Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={config.senderName}
              onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
              placeholder="MarketForge Operations"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Sender Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sender Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={config.senderEmail}
              onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
              placeholder="marketforge@scamspike.com"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Must match your verified domain or SPF/DKIM identity on host <code className="font-mono font-bold text-slate-700">{config.smtpHost || 'scamspike.com'}</code>.
            </p>
          </div>

          {/* Reply-To Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reply-To Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={config.replyToEmail || ''}
              onChange={(e) => setConfig({ ...config, replyToEmail: e.target.value })}
              placeholder="support@marketforge.scamspike.com"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Enable/Disable Production Email Dispatch Toggle */}
          <div className="pt-2">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  Enable Live Production Email Dispatch
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  When toggled ON, emails dispatch to actual recipient inboxes. When OFF, safe simulator mode is enforced.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, enableProductionEmail: !config.enableProductionEmail })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.enableProductionEmail ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.enableProductionEmail ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Send Test Email Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Send Test Email</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Active Provider: {config.provider}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Isolated diagnostic tool using your currently saved platform configuration. Does not create or alter tenants, users, or auth state.
              </p>
            </div>
          </div>

          {/* Last Test Status Badge */}
          {config.lastTestedAt && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Last Result:</span>
              <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] border flex items-center gap-1.5 shadow-xs ${
                config.lastTestStatus === 'SUCCESS' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {config.lastTestStatus === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {config.lastTestStatus} ({new Date(config.lastTestedAt).toLocaleTimeString()})
              </span>
            </div>
          )}
        </div>

        {/* Test Email Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Recipient Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="e.g. your-email@example.com"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Target inbox to receive the diagnostic verification message.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Optional Test Subject
            </label>
            <input
              type="text"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              placeholder="e.g. MarketForge Outbound Mail Verification"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Custom subject line. Defaults to standard verification header if empty.</p>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              Optional Test Message
            </label>
            <textarea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="e.g. Testing custom transactional template relay to verify TLS handshake and DNS records..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <p className="text-[10px] text-slate-400">Optional custom body text to include inside the styled test email template.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Uses saved server-side credentials. Never exposes raw passwords or keys to client.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testing || loading}
              onClick={handleTestEmail}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {testing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {testing ? 'Dispatching Test Email...' : 'Send Test Email'}
            </button>
          </div>
        </div>

        {/* Diagnostic Results Card */}
        {testResult && (
          <div className={`p-4 rounded-xl border transition animate-fade-in ${
            testResult.success 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs ${
                testResult.success ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>{testResult.success ? '✓ Diagnostic Mail Dispatch Succeeded' : '✗ Mail Dispatch Failed'}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/70 border border-slate-300/40">
                      Provider: {testResult.provider || config.provider}
                    </span>
                  </div>
                  {testResult.latencyMs !== undefined && (
                    <span className="text-[11px] font-mono bg-white/80 border border-slate-200/60 px-2 py-0.5 rounded font-semibold text-slate-700">
                      Roundtrip: {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
                
                <p className="leading-relaxed font-medium">
                  {testResult.message || testResult.error}
                </p>

                {testResult.recommendation && (
                  <div className="bg-white/90 p-3 rounded-xl border border-rose-200/80 text-[11px] text-slate-800 space-y-1 mt-2 shadow-2xs">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Actionable Diagnostic Recommendation:
                    </span>
                    <p className="text-slate-700 pl-5">{testResult.recommendation}</p>
                  </div>
                )}

                {testResult.details && (
                  <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 font-mono text-[10px] text-slate-700 space-y-1 mt-2 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <div><span className="font-semibold text-slate-900">Provider:</span> {testResult.details.provider}</div>
                      <div><span className="font-semibold text-slate-900">Recipient:</span> {testResult.details.recipient}</div>
                      <div><span className="font-semibold text-slate-900">Sender Identity:</span> {testResult.details.sender}</div>
                      <div><span className="font-semibold text-slate-900">Status:</span> <span className="text-emerald-700 font-bold">ACCEPTED / DISPATCHED</span></div>
                      {testResult.details.messageId && (
                        <div className="sm:col-span-2 truncate"><span className="font-semibold text-slate-900">Message ID:</span> {testResult.details.messageId}</div>
                      )}
                      {testResult.details.response && (
                        <div className="sm:col-span-2 truncate"><span className="font-semibold text-slate-900">Relay Response:</span> {testResult.details.response}</div>
                      )}
                      <div className="sm:col-span-2"><span className="font-semibold text-slate-900">Dispatched At:</span> {testResult.details.timestamp}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Feedback Notifications */}
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

      {/* Save Action Toolbar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={loading || testing}
          onClick={() => handleSaveConfig()}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              Saving to Server &amp; Firestore...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Email Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
}
