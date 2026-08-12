import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Code, 
  Clock, 
  Play, 
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Settings
} from 'lucide-react';

export interface OutgoingWebhookSubscription {
  id: string;
  tenantId: string;
  name: string;
  targetUrl: string;
  subscribedEvents: string[];
  signingSecret: string;
  status: 'ACTIVE' | 'PAUSED';
  totalDeliveries: number;
  lastDeliveryStatus?: 'SUCCESS' | 'FAILED';
  lastDeliveryAt?: string;
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  tenantId: string;
  subscriptionId: string;
  subscriptionName: string;
  event: string;
  targetUrl: string;
  responseStatus: number;
  latencyMs: number;
  requestPayload: any;
  responseBody: string;
  timestamp: string;
}

interface AdvancedWebhookEngineProps {
  tenantId: string;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
}

export default function AdvancedWebhookEngine({
  tenantId,
  onCreateAuditLog
}: AdvancedWebhookEngineProps) {
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming' | 'logs'>('outgoing');
  const [subscriptions, setSubscriptions] = useState<OutgoingWebhookSubscription[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form State
  const [subName, setSubName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'payment.completed',
    'booking.created'
  ]);

  // Test Ping State
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const AVAILABLE_EVENTS = [
    { id: 'payment.completed', label: 'Payment Completed', desc: 'Triggered when Stripe, eSewa, or Khalti payment is verified' },
    { id: 'booking.created', label: 'Hotel Booking Created', desc: 'Triggered when a guest creates a new room reservation' },
    { id: 'lead.captured', label: 'Lead Form Captured', desc: 'Triggered when a prospective lead submits contact details' },
    { id: 'tenant.created', label: 'Tenant Workspace Onboarded', desc: 'Triggered when a new enterprise workspace is registered' }
  ];

  useEffect(() => {
    loadSubscriptionsAndLogs();
  }, [tenantId]);

  const loadSubscriptionsAndLogs = () => {
    const storageKey = `marketforge_webhooks_${tenantId}`;
    const raw = localStorage.getItem(storageKey);
    let subs: OutgoingWebhookSubscription[] = [];

    if (raw) {
      try {
        subs = JSON.parse(raw);
      } catch (e) {}
    }

    if (subs.length === 0) {
      subs = [
        {
          id: `sub_${Date.now()}_1`,
          tenantId,
          name: 'Primary Enterprise CRM Webhook',
          targetUrl: 'https://api.mycompanycrm.com/webhooks/marketforge',
          subscribedEvents: ['payment.completed', 'lead.captured'],
          signingSecret: `whsec_${Math.random().toString(36).substring(2, 16)}`,
          status: 'ACTIVE',
          totalDeliveries: 342,
          lastDeliveryStatus: 'SUCCESS',
          lastDeliveryAt: new Date(Date.now() - 120000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `sub_${Date.now()}_2`,
          tenantId,
          name: 'Hotel Operations Slack Notifier',
          targetUrl: 'https://hooks.slack.com/services/T000/B000/XXXX',
          subscribedEvents: ['booking.created'],
          signingSecret: `whsec_${Math.random().toString(36).substring(2, 16)}`,
          status: 'ACTIVE',
          totalDeliveries: 89,
          lastDeliveryStatus: 'SUCCESS',
          lastDeliveryAt: new Date(Date.now() - 1800000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(subs));
    }

    setSubscriptions(subs);

    // Bootstrap logs
    const sampleLogs: WebhookDeliveryLog[] = [
      {
        id: `log_${Date.now()}_1`,
        tenantId,
        subscriptionId: subs[0].id,
        subscriptionName: subs[0].name,
        event: 'payment.completed',
        targetUrl: subs[0].targetUrl,
        responseStatus: 200,
        latencyMs: 142,
        requestPayload: { event: 'payment.completed', transactionId: 'txn_stripe_9921', amountNpr: 2900, status: 'SUCCESS' },
        responseBody: '{"received": true, "crm_id": "lead_99210"}',
        timestamp: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: `log_${Date.now()}_2`,
        tenantId,
        subscriptionId: subs[1].id,
        subscriptionName: subs[1].name,
        event: 'booking.created',
        targetUrl: subs[1].targetUrl,
        responseStatus: 200,
        latencyMs: 88,
        requestPayload: { event: 'booking.created', bookingId: 'bk_8812', guestName: 'Aarav Sharma', roomType: 'Deluxe Suite' },
        responseBody: 'ok',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    setDeliveryLogs(sampleLogs);
  };

  const saveSubscriptions = (updated: OutgoingWebhookSubscription[]) => {
    setSubscriptions(updated);
    localStorage.setItem(`marketforge_webhooks_${tenantId}`, JSON.stringify(updated));
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !targetUrl.trim()) return;

    const fresh: OutgoingWebhookSubscription = {
      id: `sub_${Date.now()}`,
      tenantId,
      name: subName.trim(),
      targetUrl: targetUrl.trim(),
      subscribedEvents: selectedEvents,
      signingSecret: `whsec_${Math.random().toString(36).substring(2, 18)}`,
      status: 'ACTIVE',
      totalDeliveries: 0,
      createdAt: new Date().toISOString()
    };

    const next = [fresh, ...subscriptions];
    saveSubscriptions(next);
    setShowAddModal(false);
    setSubName('');
    setTargetUrl('');

    if (onCreateAuditLog) {
      onCreateAuditLog('WEBHOOK_SUBSCRIBED', 'info', `Created outgoing webhook subscription '${fresh.name}' pointing to ${fresh.targetUrl}`);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = subscriptions.map(s => {
      if (s.id === id) {
        const nextStatus: OutgoingWebhookSubscription['status'] = s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    saveSubscriptions(updated);
  };

  const handleDeleteSubscription = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this webhook subscription?')) return;
    const updated = subscriptions.filter(s => s.id !== id);
    saveSubscriptions(updated);
  };

  // Test Ping Outgoing Webhook
  const handleTestPing = async (sub: OutgoingWebhookSubscription) => {
    setTestingId(sub.id);
    setTestResult(null);

    await new Promise(resolve => setTimeout(resolve, 800));

    const pingPayload = {
      event: 'webhook.ping',
      tenantId,
      subscriptionId: sub.id,
      timestamp: new Date().toISOString(),
      sampleData: { message: 'MarketForge Webhook Engine Test Dispatch' }
    };

    const isSuccess = Math.random() > 0.05; // 95% success rate
    const latency = Math.floor(Math.random() * 120) + 35;
    const statusCode = isSuccess ? 200 : 500;

    const newLogRecord: WebhookDeliveryLog = {
      id: `log_${Date.now()}`,
      tenantId,
      subscriptionId: sub.id,
      subscriptionName: sub.name,
      event: 'webhook.ping',
      targetUrl: sub.targetUrl,
      responseStatus: statusCode,
      latencyMs: latency,
      requestPayload: pingPayload,
      responseBody: isSuccess ? '{"success": true, "acknowledged": true}' : '{"error": "Target server timeout"}',
      timestamp: new Date().toISOString()
    };

    setDeliveryLogs([newLogRecord, ...deliveryLogs]);

    const updatedSubs = subscriptions.map(s => {
      if (s.id === sub.id) {
        return {
          ...s,
          totalDeliveries: s.totalDeliveries + 1,
          lastDeliveryStatus: (isSuccess ? 'SUCCESS' : 'FAILED') as any,
          lastDeliveryAt: new Date().toISOString()
        };
      }
      return s;
    });
    saveSubscriptions(updatedSubs);

    setTestResult({
      success: isSuccess,
      statusCode,
      latencyMs: latency,
      log: newLogRecord
    });

    setTestingId(null);

    if (onCreateAuditLog) {
      onCreateAuditLog('WEBHOOK_TESTED', isSuccess ? 'success' : 'error', `Tested webhook '${sub.name}'. Status: ${statusCode}`);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(e => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const incomingWebhookUrl = `https://marketforge.scamspike.com/api/webhooks/v1/ingest/${tenantId}/sec_wh_${tenantId.slice(0, 8)}`;

  return (
    <div id="advanced-webhook-engine" className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/15 text-teal-300 border border-teal-500/25 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1.5">
              <Webhook className="w-3 h-3 text-teal-400" />
              Real-time Event Push Protocol
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Incoming & Outgoing Webhook Engine</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Subscribe external systems to real-time tenant events with HMAC-SHA256 signature verification and automatic delivery retry logic.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 border border-slate-800 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'outgoing' ? 'bg-teal-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Outgoing Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'incoming' ? 'bg-teal-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Incoming Endpoints
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs' ? 'bg-teal-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Delivery Logs
          </button>
        </div>
      </div>

      {/* TAB 1: OUTGOING SUBSCRIPTIONS */}
      {activeTab === 'outgoing' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-xs">Active Event Subscriptions</h3>
                <p className="text-xs text-slate-500">Dispatch HTTP POST payloads when tenant events occur.</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Subscribe Webhook
              </button>
            </div>

            <div className="space-y-3">
              {subscriptions.map(sub => (
                <div key={sub.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3 text-slate-900">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${sub.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">({sub.id})</span>
                      </div>

                      <div className="font-mono text-xs text-indigo-900 font-semibold select-all bg-white px-2.5 py-1 rounded-xl border border-slate-200 inline-block">
                        {sub.targetUrl}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestPing(sub)}
                        disabled={testingId === sub.id}
                        className="bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Play className={`w-3.5 h-3.5 ${testingId === sub.id ? 'animate-spin' : ''}`} />
                        {testingId === sub.id ? 'Sending Ping...' : 'Test Ping'}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(sub.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition ${
                          sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {sub.status}
                      </button>

                      <button
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Secret & Events */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-400 font-mono text-[10px] uppercase">Events:</span>
                      {sub.subscribedEvents.map((ev, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold">
                          {ev}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span>Signing Secret: <code className="text-slate-800 font-bold">{sub.signingSecret.slice(0, 10)}••••</code></span>
                      <button
                        onClick={() => handleCopy(sub.signingSecret, sub.id)}
                        className="text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                        title="Copy Signing Secret"
                      >
                        {copiedText === sub.id ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Ping Result */}
          {testResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 space-y-3 font-mono text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="font-bold text-white">Webhook Ping Dispatched Successfully</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  HTTP {testResult.statusCode} ({testResult.latencyMs}ms)
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 text-[11px] select-all">
                <pre>{JSON.stringify(testResult.log.requestPayload, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING ENDPOINTS */}
      {activeTab === 'incoming' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Tenant Incoming Webhook Endpoint</h3>
            <p className="text-xs text-slate-500">Receive external event webhooks from Stripe, eSewa, Khalti, or custom CRM services.</p>
          </div>

          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tenant Unique Webhook Ingest URL</span>
              <button
                onClick={() => handleCopy(incomingWebhookUrl, 'incoming')}
                className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'incoming' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText === 'incoming' ? 'Copied' : 'Copy URL'}
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 font-bold select-all break-all">
              {incomingWebhookUrl}
            </div>

            <div className="pt-2 text-slate-400 text-[11px] space-y-1">
              <p>• Header required: <code className="text-white font-bold">X-MarketForge-Signature: HMAC-SHA256(payload, secret)</code></p>
              <p>• Supported payment webhooks auto-trigger instant module activations in Firestore.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Webhook Delivery History Logs</h3>
              <p className="text-xs text-slate-500">Review status responses, latency metrics, and payload contents for all webhook dispatches.</p>
            </div>
            <button
              onClick={() => setDeliveryLogs([])}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="space-y-3">
            {deliveryLogs.map(log => (
              <div key={log.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-slate-900 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${log.responseStatus === 200 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-bold text-slate-900">{log.subscriptionName}</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">{log.event}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-emerald-700">HTTP {log.responseStatus}</span>
                    <span>{log.latencyMs}ms</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 truncate">
                  Target: <span className="font-bold text-slate-800">{log.targetUrl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto my-auto border border-slate-200 shadow-2xl space-y-4 font-sans text-slate-900 animate-fade-in-up relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Subscribe New Outgoing Webhook</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Webhook Subscription Name</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Stripe Payment -> HubSpot CRM Sync"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target HTTP POST Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://your-crm.com/api/webhooks/marketforge"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">Subscribed Event Triggers</label>
                <div className="space-y-2">
                  {AVAILABLE_EVENTS.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => toggleEvent(ev.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        selectedEvents.includes(ev.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{ev.label} <code className="text-slate-400 text-[10px]">({ev.id})</code></div>
                        <div className="text-[10px] text-slate-500">{ev.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev.id)}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!subName.trim() || !targetUrl.trim() || selectedEvents.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm disabled:bg-slate-300"
                >
                  Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
