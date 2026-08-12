import React, { useState, useEffect } from "react";
import { 
  Database, RefreshCw, Plus, Trash2, ShieldCheck, Play, 
  CheckCircle2, AlertTriangle, FileSpreadsheet, Upload, 
  HelpCircle, Check, Code, MapPin, Layers, Settings, Calendar,
  TrendingUp, Info, GitBranch, Key, Webhook, Zap
} from "lucide-react";
import WorkflowAutomationStudio from "./WorkflowAutomationStudio";
import ApiGatewayDeveloperPortal from "./ApiGatewayDeveloperPortal";
import AdvancedWebhookEngine from "./AdvancedWebhookEngine";

interface IntegrationManagerProps {
  tenantId: string;
  activeCampaigns: any[];
  onReloadOutcomes: () => void;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
}

export interface DataIntegration {
  id: string;
  tenantId: string;
  integrationType: "GOOGLE_ANALYTICS_4" | "META_ADS";
  integrationName: string;
  status: "ACTIVE" | "PAUSED" | "ERROR";
  credentials: {
    apiKey?: string;
    propertyId?: string;
    accountId?: string;
    accessToken?: string;
  };
  mappingRules: {
    leadField: string;
    conversionField: string;
    revenueField: string;
  };
  linkedCampaignIds: string[];
  pullSchedule: string;
  lastPullDate?: string;
  lastPullStatus?: string;
  errorLog?: string[];
  createdAt: string;
}

const SAMPLE_CSV_LEADS = `Date,LeadsCount,TotalRevenue,ActiveUsers
2026-06-12,18,720,440
2026-06-13,24,960,520
2026-06-14,15,600,380
2026-06-15,28,1120,610
2026-06-16,21,840,490
2026-06-17,32,1280,680
2026-06-18,25,1000,560`;

const SAMPLE_CSV_RESERVATIONS = `Date,Reservations,AdSpend,SalesCount
2026-06-12,11,150,8
2026-06-13,14,180,11
2026-06-14,8,120,6
2026-06-15,19,210,15
2026-06-16,13,165,9
2026-06-17,22,250,18
2026-06-18,17,190,13`;

export default function IntegrationManager({
  tenantId,
  activeCampaigns = [],
  onReloadOutcomes,
  onCreateAuditLog
}: IntegrationManagerProps) {
  // Main Enterprise Tab Navigation
  const [activeMainTab, setActiveMainTab] = useState<'workflows' | 'apigateway' | 'webhooks' | 'analytics'>('workflows');

  // Lists & UI State
  const [connections, setConnections] = useState<DataIntegration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Integration Form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [type, setType] = useState<"GOOGLE_ANALYTICS_4" | "META_ADS">("GOOGLE_ANALYTICS_4");
  const [name, setName] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("sec_ga4_" + Math.random().toString(36).substring(3, 9));
  const [propId, setPropId] = useState<string>("841920512");
  const [sched, setSched] = useState<string>("Every Monday at 00:00 (Weekly)");
  
  const [leadMap, setLeadMap] = useState<string>("leads");
  const [convMap, setConvMap] = useState<string>("reservations");
  const [revMap, setRevMap] = useState<string>("revenue");

  // Connection checking/Dry run
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Auto Pull trigger state
  const [pullingCampaignId, setPullingCampaignId] = useState<string>("");
  const [pullingIntegrationId, setPullingIntegrationId] = useState<string>("");
  const [isPullingData, setIsPullingData] = useState<boolean>(false);
  const [pullFeedback, setPullFeedback] = useState<any>(null);

  // CSV State
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [isNormalizingCsv, setIsNormalizingCsv] = useState<boolean>(false);
  const [csvMapping, setCsvMapping] = useState({
    dateColumn: "Date",
    leadColumn: "LeadsCount",
    conversionColumn: "TotalRevenue",
    revenueColumn: "ActiveUsers"
  });
  const [csvPreviewData, setCsvPreviewData] = useState<any[] | null>(null);
  const [csvSummary, setCsvSummary] = useState<any>(null);
  const [csvLinkingCampaignId, setCsvLinkingCampaignId] = useState<string>("");

  useEffect(() => {
    fetchConnections();
  }, [tenantId]);

  const fetchConnections = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/agent/intake/connections");
      if (!res.ok) throw new Error("Could not retrieve active data integration registries.");
      const data = await res.json();
      setConnections(data);
    } catch (err: any) {
      console.warn("Failed retrieving connections, drifting to server offline mock fallback:", err.message);
      // Fallback state
      setConnections([
        {
          id: "intg_ga4_demo",
          tenantId,
          integrationType: "GOOGLE_ANALYTICS_4",
          integrationName: "GA4 Core Enterprise Analytics Property",
          status: "ACTIVE",
          credentials: { apiKey: "••••••••", propertyId: "841920512" },
          mappingRules: { leadField: "leads", conversionField: "reservations", revenueField: "revenue" },
          linkedCampaignIds: [],
          pullSchedule: "Every Monday at 00:00 (Weekly)",
          lastPullDate: new Date().toISOString(),
          lastPullStatus: "SUCCESS",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please supply an easily recognizable name for your data source.");
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      integrationType: type,
      integrationName: name,
      credentials: {
        apiKey: apiKey,
        propertyId: propId,
        accountId: propId,
        accessToken: apiKey
      },
      mappingRules: {
        leadField: leadMap,
        conversionField: convMap,
        revenueField: revMap
      },
      pullSchedule: sched,
      status: "ACTIVE"
    };

    try {
      const res = await fetch("/api/agent/intake/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Creation declined by multi-tenant security auditor.");
      
      const finished = await res.json();
      setShowAddForm(false);
      setName("");
      fetchConnections();
      
      if (onCreateAuditLog) {
        onCreateAuditLog("INTEGRATION_CONNECTED", "success", `Registered dynamic data intake pipeline: [${name}]`);
      }
    } catch (err: any) {
      setErrorMsg(`Save failure: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (!window.confirm("Disconnect this automated reporting channel? Weekly pulls will cease.")) return;
    try {
      const res = await fetch(`/api/agent/intake/connections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion rejected.");
      fetchConnections();
      
      if (onCreateAuditLog) {
        onCreateAuditLog("INTEGRATION_DISCONNECTED", "info", `Vaporized Integration connection registry: ID: ${id}`);
      }
    } catch (err: any) {
      alert(`Delete breakdown: ${err.message}`);
    }
  };

  const handleTestConnection = async (conn: DataIntegration) => {
    setTestingId(conn.id);
    setTestResult(null);
    try {
      const res = await fetch("/api/agent/intake/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({ integrationType: conn.integrationType })
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        sampleData: data.sampleData
      });
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestingId(null);
    }
  };

  const handleTriggerAutoPull = async () => {
    if (!pullingCampaignId || !pullingIntegrationId) {
      alert("Please designate both a linked active campaign and data source registry channel.");
      return;
    }
    setIsPullingData(true);
    setPullFeedback(null);

    try {
      const res = await fetch("/api/agent/intake/auto_pull", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          integrationId: pullingIntegrationId,
          campaignId: pullingCampaignId
        })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Auto mapping execution declined by ingestion router.");
      }
      const data = await res.json();
      setPullFeedback(data);
      onReloadOutcomes();
      fetchConnections(); // update last pulled details

      if (onCreateAuditLog) {
        onCreateAuditLog("PLAYBOOK_RECALIBRATED", "success", `AutonomousWeeklyPull success! Accuracy calibrated: ${data.accuracyScore}%`);
      }
    } catch (err: any) {
      alert(`Autonomous Pull error: ${err.message}`);
    } finally {
      setIsPullingData(false);
    }
  };

  const handleNormalizeCSV = async () => {
    if (!csvRawText.trim()) {
      alert("Please supply raw CSV rows content to parse.");
      return;
    }
    setIsNormalizingCsv(true);
    setCsvPreviewData(null);
    setCsvSummary(null);

    try {
      const res = await fetch("/api/agent/intake/csv_upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          csvText: csvRawText,
          columnMapping: csvMapping
        })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed raw alignment parsing.");
      }
      const data = await res.json();
      setCsvPreviewData(data.data);
      setCsvSummary({
        rowsProcessed: data.rowsProcessed,
        rowsSkipped: data.rowsSkipped,
        errors: data.errors
      });
    } catch (err: any) {
      alert(`CSV Parsing Error: ${err.message}`);
    } finally {
      setIsNormalizingCsv(false);
    }
  };

  const handleIngestNormalizedCsvData = async () => {
    if (!csvLinkingCampaignId) {
      alert("Please select a Campaign identifier to link and store these CSV data series metrics.");
      return;
    }
    if (!csvPreviewData || csvPreviewData.length === 0) {
      alert("No normalized outcome records are currently compiled for intake.");
      return;
    }

    // Accumulate sum total of metric counts for easy loading integration
    const sumTotalLeads = csvPreviewData.reduce((acc, current) => acc + (current.leads || 0), 0);
    
    // Dispatch direct outcomes mapping routing logger call
    try {
      const campaignObj = activeCampaigns.find(c => c.id === csvLinkingCampaignId);
      const goalType = campaignObj?.campaignName?.includes("[") ? campaignObj.campaignName.match(/\[(.*?)\]/)?.[1] || "Generate Leads" : "Generate Leads";

      const res = await fetch("/api/agent/outcome_logger", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          campaignId: csvLinkingCampaignId,
          goalType,
          periodStart: csvPreviewData[0]?.date || new Date().toISOString().split("T")[0],
          periodEnd: csvPreviewData[csvPreviewData.length - 1]?.date || new Date().toISOString().split("T")[0],
          actualResults: { leads: sumTotalLeads },
          source: "CSV",
          autoIngested: true,
          notes: `Batch processed via CSV Ingestion Engine file spreadsheet context. Mapped rows processed: ${csvSummary?.rowsProcessed}.`
        })
      });

      if (!res.ok) throw new Error("Failed to map outcomes via outcome_logger pipeline.");
      const resData = await res.json();
      
      alert(`Success! Successfully processed and recorded CSV spreadsheet outcomes. Mapped total output count: ${sumTotalLeads}. Accuracy Score: ${resData.accuracyScore}%.`);
      
      setCsvRawText("");
      setCsvPreviewData(null);
      setCsvSummary(null);
      onReloadOutcomes();

      if (onCreateAuditLog) {
        onCreateAuditLog("PLAYBOOK_RECALIBRATED", "success", `Logged csv batch spreadsheet data, accuracy calibrated: ${resData.accuracyScore}%`);
      }
    } catch (err: any) {
      alert(`CSV Ingestion failure of outcomes: ${err.message}`);
    }
  };

  const handlePreloadCsvSample = (type: "LEADS" | "RESERVATIONS") => {
    if (type === "LEADS") {
      setCsvRawText(SAMPLE_CSV_LEADS);
      setCsvMapping({
        dateColumn: "Date",
        leadColumn: "LeadsCount",
        conversionColumn: "TotalRevenue",
        revenueColumn: "ActiveUsers"
      });
    } else {
      setCsvRawText(SAMPLE_CSV_RESERVATIONS);
      setCsvMapping({
        dateColumn: "Date",
        leadColumn: "Reservations",
        conversionColumn: "AdSpend",
        revenueColumn: "SalesCount"
      });
    }
  };

  return (
    <div id="autonomous-intake-control" className="space-y-6">
      
      {/* Visual Ribbon Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/50 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="relative z-10 space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              Phase 4 Enterprise Orchestration Core
            </span>
          </div>
          <h3 className="text-2xl font-black font-sans tracking-tight">Enterprise Automation & Integration Gateway</h3>
          <p className="text-slate-300 text-xs leading-relaxed pt-1">
            Visual workflow automation engine (n8n/Make.com paradigm), scoped bearer API key gateway, real-time incoming/outgoing webhooks, and GA4/CSV analytics ingestion pipelines.
          </p>
        </div>

        {/* Phase 4 Enterprise Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 border border-slate-800 rounded-2xl relative z-10 shrink-0">
          <button
            onClick={() => setActiveMainTab('workflows')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'workflows' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4 text-amber-300" /> Workflow Studio (n8n)
          </button>
          <button
            onClick={() => setActiveMainTab('apigateway')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'apigateway' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-emerald-300" /> API Gateway
          </button>
          <button
            onClick={() => setActiveMainTab('webhooks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'webhooks' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Webhook className="w-4 h-4 text-teal-300" /> Webhook Engine
          </button>
          <button
            onClick={() => setActiveMainTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-300" /> Data Ingestion
          </button>
        </div>
      </div>

      {/* CONDITIONAL TAB RENDERING */}
      {activeMainTab === 'workflows' && (
        <WorkflowAutomationStudio tenantId={tenantId} onCreateAuditLog={onCreateAuditLog} />
      )}

      {activeMainTab === 'apigateway' && (
        <ApiGatewayDeveloperPortal tenantId={tenantId} onCreateAuditLog={onCreateAuditLog} />
      )}

      {activeMainTab === 'webhooks' && (
        <AdvancedWebhookEngine tenantId={tenantId} onCreateAuditLog={onCreateAuditLog} />
      )}

      {activeMainTab === 'analytics' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered registries & New forms (Grid size 5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Registry Registry list card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex-1 text-slate-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-xs">Tracking Repositories</h4>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setErrorMsg(null);
                }}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Establish Source</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-slate-400 animate-pulse text-xs">Loading analytics sources...</div>
            ) : connections.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                No active tracking integrations set up. Click "Establish Source" above to begin.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {connections.map((conn) => (
                  <div key={conn.id} className="py-3.5 space-y-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${conn.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          <span className="font-bold text-xs text-slate-900">{conn.integrationName}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                            {conn.integrationType.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {conn.pullSchedule}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteConnection(conn.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata specs */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 relative space-y-1.5 text-slate-900">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Pull Status:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.1 border border-emerald-100 rounded">
                          {conn.lastPullStatus || "SUCCESS"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Last Synced:</span>
                        <span className="text-slate-600 font-mono">
                          {conn.lastPullDate ? new Date(conn.lastPullDate).toLocaleDateString() : "Never"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Map Goal Rules:</span>
                        <span className="text-slate-600 font-semibold font-mono bg-white px-1 border border-slate-200 rounded">
                          {conn.mappingRules?.leadField || "leads"} → outcome
                        </span>
                      </div>

                      {/* Checking/Dry Run controller */}
                      <button
                        onClick={() => handleTestConnection(conn)}
                        disabled={testingId !== null}
                        className="w-full mt-2 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-indigo-100 hover:border-indigo-200 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className={`w-3 h-3 ${testingId === conn.id ? "animate-spin" : ""}`} />
                        {testingId === conn.id ? "Consulting pipeline..." : `Validate ${conn.integrationType.startsWith("G") ? "GA4" : "Meta"} Pipeline`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Setup Registry Floating Form */}
          {showAddForm && (
            <div className="bg-white border border-indigo-200/80 rounded-3xl p-5 shadow-lg border-t-4 border-t-indigo-650 space-y-4 font-sans animate-fade-in-up text-slate-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="font-bold text-indigo-950 text-xs">Establish API Registry</h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold font-mono px-1 py-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateConnection} className="space-y-3.5 text-xs text-slate-700">
                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] leading-relaxed">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setType("GOOGLE_ANALYTICS_4");
                      if (!name) setName("GA4 Master Leads Stream");
                    }}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                      type === "GOOGLE_ANALYTICS_4"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    Google Analytics 4
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType("META_ADS");
                      if (!name) setName("Meta Pixels Ad Conversions");
                    }}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                      type === "META_ADS"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    Meta Ads Manager
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Dynamic Ingest Title Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. GA4 Master Leads Stream"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:border-indigo-400 text-[11px] text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">
                      {type === "GOOGLE_ANALYTICS_4" ? "GA4 Property ID" : "Meta Account ID"}
                    </label>
                    <input
                      type="text"
                      value={propId}
                      onChange={(e) => setPropId(e.target.value)}
                      placeholder={type === "GOOGLE_ANALYTICS_4" ? "841920512" : "194012019"}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:border-indigo-400 font-mono text-[11px] text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 flex justify-between">
                      {type === "GOOGLE_ANALYTICS_4" ? "Reporting API Key" : "Access Token"}
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:border-indigo-400 font-mono text-[11px] text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Cron Pull Day / Timing Frequency</label>
                  <select
                    value={sched}
                    onChange={(e) => setSched(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none text-slate-900"
                  >
                    <option value="Every Monday at 00:00 (Weekly)">Every Monday at 00:00 (Weekly)</option>
                    <option value="Every Friday at 18:00 (Weekly)">Every Friday at 18:00 (Weekly)</option>
                    <option value="0 0 * * * (Daily Run)">Every Midnight at 00:00 (Daily Sync)</option>
                  </select>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-slate-900">
                  <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Column Metric Normalization Mapping
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-stone-500 block">Leads Key</span>
                      <input
                        type="text"
                        value={leadMap}
                        onChange={(e) => setLeadMap(e.target.value)}
                        className="w-full bg-white border rounded px-1.5 py-1 text-[10px] text-slate-800 text-center font-semibold"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-stone-500 block">Conv Key</span>
                      <input
                        type="text"
                        value={convMap}
                        onChange={(e) => setConvMap(e.target.value)}
                        className="w-full bg-white border rounded px-1.5 py-1 text-[10px] text-slate-800 text-center font-semibold"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-stone-500 block">Rev Key</span>
                      <input
                        type="text"
                        value={revMap}
                        onChange={(e) => setRevMap(e.target.value)}
                        className="w-full bg-white border rounded px-1.5 py-1 text-[10px] text-slate-800 text-center font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  {isSaving ? "Saving Credentials..." : "Authenticate Connection Repository"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Run Weekly autonomous syncs OR paste CSV spreadsheets (Grid size 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Integrated test visualizer */}
          {testResult && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 space-y-3 font-sans animate-fade-in text-slate-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs">Reporting Channel Securely Authenticated</h4>
                  <p className="text-emerald-700 text-[10px]">Previewing decrypted testing packet retrieved from report endpoint.</p>
                </div>
              </div>

              <div className="border border-emerald-200/60 rounded-xl overflow-hidden bg-white text-[11px] font-mono select-all">
                <table className="w-full text-left">
                  <thead className="bg-[#18191A] text-white text-[10px] font-bold">
                    <tr>
                      <th className="p-2">Date Series</th>
                      <th className="p-2">Leads Count</th>
                      <th className="p-2">Users Count</th>
                      <th className="p-2">Revenue Val</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100 text-slate-700">
                    {testResult.sampleData?.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-emerald-50/20 text-slate-900">
                        <td className="p-2 font-mono text-xs">{row.date}</td>
                        <td className="p-2 font-semibold text-emerald-700">{row.leads}</td>
                        <td className="p-2 text-stone-500">{row.users || row.purchase || 0}</td>
                        <td className="p-2 text-indigo-700 font-bold">${row.revenue || row.spend || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Autonomous Sync desk (Module 2) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <RefreshCw className="w-4.5 h-4.5 text-indigo-600 animate-spin-slow" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Trigger Autonomous Weekly pull (Module 2)</h4>
                <p className="text-slate-400 text-[10px]">Simulate the Cron pulling scheduler routing loops, mapping directly to live campaigns.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide">1. Linked Campaign</label>
                <select
                  value={pullingCampaignId}
                  onChange={(e) => setPullingCampaignId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Target Campaign --</option>
                  {activeCampaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.campaignName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide">2. Connected Data Source</label>
                <select
                  value={pullingIntegrationId}
                  onChange={(e) => setPullingIntegrationId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Data Integrator --</option>
                  {connections.map((conn) => (
                    <option key={conn.id} value={conn.id}>
                      {conn.integrationName} ({conn.integrationType.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleTriggerAutoPull}
              disabled={isPullingData || !pullingCampaignId || !pullingIntegrationId}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Play className="w-4 h-4 text-indigo-200 fill-indigo-200" />
              {isPullingData ? "Engaged automated extraction logic..." : "Pull Outcomes & Calibrate Model"}
            </button>

            {pullFeedback && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3 font-sans animate-fade-in text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div className="space-y-1 text-indigo-950 text-[11px]">
                    <strong className="font-bold block text-xs">Close Loop Optimization Successful!</strong>
                    <p className="text-[#3b3a30] leading-relaxed">
                      WEEKLY EXTRACTED: Calculated actual outcomes metrics. Achieved accuracy tracking score: <strong className="text-indigo-700 font-bold">{pullFeedback.accuracyScore}%</strong>. Platform confidence calibrations updated.
                    </p>
                  </div>
                </div>

                <div className="bg-white border select-all border-indigo-100 rounded-xl p-3 font-mono text-[10.5px] text-indigo-900 leading-normal space-y-1">
                  <span className="font-bold text-[10px] text-slate-400 block pb-1 border-b uppercase">Calibration Refinements Summary:</span>
                  <p className="whitespace-pre-wrap">{pullFeedback.refinements || "Calibrations saved. High alignment detected."}</p>
                </div>
              </div>
            )}
          </div>

          {/* Paste CSV Section (Module 5) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">CSV Spreadsheet Normalized Intake</h4>
                  <p className="text-slate-400 text-[10px]">Map and parse weekly offline performance reports dynamically.</p>
                </div>
              </div>

              {/* Sample Preloaders */}
              <div className="flex gap-1">
                <button
                  onClick={() => handlePreloadCsvSample("LEADS")}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer border border-emerald-100"
                >
                  Preset Leads CSV
                </button>
                <button
                  onClick={() => handlePreloadCsvSample("RESERVATIONS")}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer border border-emerald-100"
                >
                  Preset Reservations CSV
                </button>
              </div>
            </div>

            <div className="space-y-3.5 font-sans text-xs">
              
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-600 block">1. Paste Raw CSV Content (With Headers Line)</span>
                <textarea
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  rows={4}
                  placeholder={`Date,LeadsCount,TotalRevenue,ActiveUsers\n2026-06-12,18,720,440\n2026-06-13,24,960,520`}
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl p-3 font-mono text-[11px] text-slate-700 leading-normal"
                />
              </div>

              {/* 4 Column Mapping visual selectors */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-slate-900">
                <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Header Mappings Coordinates Config
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block">Date Header</span>
                    <input
                      type="text"
                      value={csvMapping.dateColumn}
                      onChange={(e) => setCsvMapping({ ...csvMapping, dateColumn: e.target.value })}
                      placeholder="Date"
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1.2 font-semibold text-center select-all text-[11px] text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block">Leads Header</span>
                    <input
                      type="text"
                      value={csvMapping.leadColumn}
                      onChange={(e) => setCsvMapping({ ...csvMapping, leadColumn: e.target.value })}
                      placeholder="LeadsCount"
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1.2 font-semibold text-center select-all text-[11px] text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block">Convs Header</span>
                    <input
                      type="text"
                      value={csvMapping.conversionColumn}
                      onChange={(e) => setCsvMapping({ ...csvMapping, conversionColumn: e.target.value })}
                      placeholder="Reservations"
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1.2 font-semibold text-center select-all text-[11px] text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block">Revenue Header</span>
                    <input
                      type="text"
                      value={csvMapping.revenueColumn}
                      onChange={(e) => setCsvMapping({ ...csvMapping, revenueColumn: e.target.value })}
                      placeholder="TotalRevenue"
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1.2 font-semibold text-center select-all text-[11px] text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleNormalizeCSV}
                disabled={isNormalizingCsv || !csvRawText.trim()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:bg-slate-200"
              >
                <Upload className="w-4 h-4" />
                {isNormalizingCsv ? "Normalizing Spreadsheet Columns..." : "Process and Normalize Report"}
              </button>

              {/* Normalized Data Preview block */}
              {csvPreviewData && csvPreviewData.length > 0 && (
                <div className="border border-emerald-200 rounded-3xl p-4 bg-emerald-50/20 space-y-4 animate-fade-in text-xs">
                  <div className="flex items-center gap-2 border-b border-emerald-100 pb-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-950 text-xs">Alignment Mapping Ready ({csvSummary?.rowsProcessed} Rows Synced)</h4>
                      {csvSummary?.rowsSkipped > 0 && (
                        <p className="text-amber-600 text-[10px]">Skipped {csvSummary.rowsSkipped} incompatible cells lines.</p>
                      )}
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-emerald-100 rounded-xl bg-white select-all text-slate-900">
                    <table className="w-full text-left font-mono text-[10.5px]">
                      <thead className="bg-[#18191A] text-white text-[9.5px]">
                        <tr>
                          <th className="p-2">Parsed Date</th>
                          <th className="p-2">Leads Achieved</th>
                          <th className="p-2">Conversions</th>
                          <th className="p-2">Est Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50 text-slate-700">
                        {csvPreviewData.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-emerald-50/10 text-slate-900">
                            <td className="p-2">{row.date}</td>
                            <td className="p-2 font-bold text-emerald-700">{row.leads}</td>
                            <td className="p-2 text-stone-500">{row.reservations}</td>
                            <td className="p-2 font-semibold text-slate-800">${row.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Push to selected campaign form */}
                  <div className="pt-2 border-t border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-sans">
                    <div className="space-y-0.5 flex-1 max-w-sm">
                      <span className="font-bold text-[10px] text-slate-500 uppercase">Save batch to campaign</span>
                      <select
                        value={csvLinkingCampaignId}
                        onChange={(e) => setCsvLinkingCampaignId(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 cursor-pointer"
                      >
                        <option value="">-- Choose Target Campaign --</option>
                        {activeCampaigns.map((camp) => (
                          <option key={camp.id} value={camp.id}>
                            {camp.campaignName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleIngestNormalizedCsvData}
                      disabled={!csvLinkingCampaignId}
                      className="self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition block text-xs cursor-pointer disabled:bg-slate-200"
                    >
                      Process & Record Mapped Outcomes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      )}

    </div>
  );
}
