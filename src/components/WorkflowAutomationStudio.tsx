import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  GitBranch, 
  Layers, 
  Settings, 
  Bot, 
  Mail, 
  MessageSquare, 
  Database, 
  Globe, 
  DollarSign, 
  ArrowRight, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles,
  ChevronRight,
  Code,
  ShieldCheck,
  FileText,
  Linkedin,
  Facebook,
  Share2,
  FileSpreadsheet,
  Link,
  Key,
  LogIn,
  ExternalLink,
  Smartphone,
  Send
} from 'lucide-react';

export interface WorkflowNode {
  id: string;
  type: 'TRIGGER' | 'CONDITION' | 'ACTION' | 'AI_AGENT' | 'DELAY';
  name: string;
  category: string;
  config: {
    event?: string;
    conditionField?: string;
    operator?: string;
    value?: string;
    actionType?: string;
    recipient?: string;
    template?: string;
    prompt?: string;
    delayMinutes?: number;
    webhookUrl?: string;
    integrationProvider?: string;
    connectedAccountId?: string;
  };
  status?: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  outputPayload?: any;
}

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  triggerType: string;
  nodes: WorkflowNode[];
  lastRunAt?: string;
  totalRuns: number;
  successRate: number;
  createdAt: string;
  category?: 'Social Media' | 'Payment & Billing' | 'Hotel & Booking' | 'CRM & Sales' | 'AI Support';
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'SUCCESS' | 'FAILED';
  startedAt: string;
  durationMs: number;
  stepLogs: {
    nodeId: string;
    nodeName: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    input: any;
    output: any;
    executionMs: number;
  }[];
}

export interface ConnectedAccount {
  id: string;
  provider: 'linkedin' | 'meta_messenger' | 'whatsapp' | 'google_sheets' | 'gmail' | 'hubspot' | 'stripe_esewa' | 'slack';
  accountName: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  connectedAt: string;
  accountEmailOrId: string;
}

const STARTER_TEMPLATES: Omit<WorkflowDefinition, 'id' | 'tenantId' | 'createdAt' | 'totalRuns' | 'successRate'>[] = [
  {
    name: 'LinkedIn Lead Gen Form -> Gemini AI Personalization -> Auto InMail & CRM Sync',
    description: 'When a new lead submits a LinkedIn Lead Gen Form, Gemini AI automatically researches the company profile, crafts a personalized B2B outreach message, and syncs the record to HubSpot/Salesforce.',
    status: 'ACTIVE',
    triggerType: 'LinkedIn Lead Captured',
    category: 'Social Media',
    nodes: [
      {
        id: 'node-1',
        type: 'TRIGGER',
        name: 'Trigger: LinkedIn Lead Gen Form Submitted',
        category: 'LinkedIn Integration',
        config: { event: 'linkedin.lead_form_submit', integrationProvider: 'linkedin' }
      },
      {
        id: 'node-2',
        type: 'AI_AGENT',
        name: 'Gemini AI: Research Company & Draft VIP Outreach Pitch',
        category: 'AI Processing',
        config: { prompt: 'Analyze lead title and company. Draft a tailored 3-sentence value proposition for hospitality / SaaS enterprise.' }
      },
      {
        id: 'node-3',
        type: 'ACTION',
        name: 'Action: Send Automated LinkedIn InMail / Direct Message',
        category: 'LinkedIn Messaging',
        config: { actionType: 'LINKEDIN_SEND_MESSAGE', recipient: '{{linkedinMemberId}}', integrationProvider: 'linkedin' }
      },
      {
        id: 'node-4',
        type: 'ACTION',
        name: 'Action: Create Deal Record in HubSpot / CRM',
        category: 'CRM Sync',
        config: { actionType: 'CRM_CREATE_DEAL', recipient: 'HubSpot API', integrationProvider: 'hubspot' }
      }
    ]
  },
  {
    name: 'Meta Messenger 24/7 AI Sales Concierge & Booking Assistant',
    description: 'Instantly responds to Facebook Page & Instagram Direct Messages using Gemini AI to answer pricing questions, check room availability, and collect customer contact details.',
    status: 'ACTIVE',
    triggerType: 'Messenger Message Received',
    category: 'AI Support',
    nodes: [
      {
        id: 'node-1',
        type: 'TRIGGER',
        name: 'Trigger: Incoming Meta Messenger / IG DM',
        category: 'Meta Integration',
        config: { event: 'meta.messenger_receive', integrationProvider: 'meta_messenger' }
      },
      {
        id: 'node-2',
        type: 'AI_AGENT',
        name: 'Gemini AI: Analyze Intent & Retrieve Room Availability',
        category: 'AI Sales Assistant',
        config: { prompt: 'Act as a 5-star hotel concierge. Answer room rates in NPR/USD, check check-in availability, and offer quick booking link.' }
      },
      {
        id: 'node-3',
        type: 'ACTION',
        name: 'Action: Dispatch Messenger Quick Reply with Booking Link',
        category: 'Meta Messenger',
        config: { actionType: 'META_SEND_MESSAGE', recipient: '{{senderPsid}}', integrationProvider: 'meta_messenger' }
      }
    ]
  },
  {
    name: 'Stripe/eSewa Payment -> Auto WhatsApp Receipt & Module Activation',
    description: 'When a new payment is verified via Stripe, eSewa, or Khalti webhook, automatically activate tenant modules, log transaction in Firestore, and send a WhatsApp receipt.',
    status: 'ACTIVE',
    triggerType: 'Payment Received (Stripe/eSewa/Khalti)',
    category: 'Payment & Billing',
    nodes: [
      {
        id: 'node-1',
        type: 'TRIGGER',
        name: 'Trigger: Incoming Payment Event Verified',
        category: 'Payment Gateway',
        config: { event: 'payment.completed', integrationProvider: 'stripe_esewa' }
      },
      {
        id: 'node-2',
        type: 'CONDITION',
        name: 'Check: Payment Status == SUCCESS',
        category: 'Logic Filter',
        config: { conditionField: 'status', operator: 'equals', value: 'SUCCESS' }
      },
      {
        id: 'node-3',
        type: 'AI_AGENT',
        name: 'Gemini AI: Generate Personalized Thank-You & Receipt Summary',
        category: 'AI Processing',
        config: { prompt: 'Compose a warm luxury customer receipt note in NPR/USD with invoice download link.' }
      },
      {
        id: 'node-4',
        type: 'ACTION',
        name: 'Action: Send WhatsApp Business Confirmation Receipt',
        category: 'WhatsApp Business',
        config: { actionType: 'WHATSAPP_DISPATCH', recipient: '{{customerPhone}}', integrationProvider: 'whatsapp' }
      }
    ]
  },
  {
    name: 'Google Sheets Live Lead Sync -> Gemini Intent Scoring -> WhatsApp Hot Lead Alert',
    description: 'Monitors new rows in a Google Sheet (from website forms or ad campaigns), scores intent with Gemini AI, and sends immediate alerts to sales agents on WhatsApp & Slack.',
    status: 'ACTIVE',
    triggerType: 'Google Sheets Row Added',
    category: 'CRM & Sales',
    nodes: [
      {
        id: 'node-1',
        type: 'TRIGGER',
        name: 'Trigger: New Row Inserted in Google Sheet',
        category: 'Google Workspace',
        config: { event: 'googlesheets.row_added', integrationProvider: 'google_sheets' }
      },
      {
        id: 'node-2',
        type: 'AI_AGENT',
        name: 'Gemini AI: Evaluate Budget & Assign Conversion Score (1-100)',
        category: 'AI Scoring',
        config: { prompt: 'Analyze lead role, budget, and region to determine hot/warm lead classification.' }
      },
      {
        id: 'node-3',
        type: 'CONDITION',
        name: 'Filter: Conversion Score >= 80',
        category: 'Routing Filter',
        config: { conditionField: 'score', operator: 'greater_than', value: '80' }
      },
      {
        id: 'node-4',
        type: 'ACTION',
        name: 'Action: Dispatch Hot Lead Alert to WhatsApp & Slack',
        category: 'Multi-Channel Alert',
        config: { actionType: 'WHATSAPP_DISPATCH', recipient: '+977-9800000000', integrationProvider: 'whatsapp' }
      }
    ]
  },
  {
    name: 'Gmail Incoming Client Inquiry -> Gemini AI Auto-Drafting & Follow-Up Sequencer',
    description: 'Triggers when a prospect emails your support or sales inbox. Gemini drafts an intelligent reply based on your knowledge base and schedules a 3-day follow-up if unreplied.',
    status: 'ACTIVE',
    triggerType: 'Gmail Email Received',
    category: 'AI Support',
    nodes: [
      {
        id: 'node-1',
        type: 'TRIGGER',
        name: 'Trigger: Incoming Client Email in Gmail Inbox',
        category: 'Gmail Integration',
        config: { event: 'gmail.message_received', integrationProvider: 'gmail' }
      },
      {
        id: 'node-2',
        type: 'AI_AGENT',
        name: 'Gemini AI: Generate High-Converting Solution Response',
        category: 'AI Email Assistant',
        config: { prompt: 'Draft a professional, clear, and persuasive reply addressing client questions.' }
      },
      {
        id: 'node-3',
        type: 'ACTION',
        name: 'Action: Create Draft in Gmail or Auto-Reply',
        category: 'Gmail Action',
        config: { actionType: 'GMAIL_SEND_REPLY', recipient: '{{senderEmail}}', integrationProvider: 'gmail' }
      },
      {
        id: 'node-4',
        type: 'DELAY',
        name: 'Delay: Wait 72 Hours for Reply',
        category: 'Timer',
        config: { delayMinutes: 4320 }
      },
      {
        id: 'node-5',
        type: 'ACTION',
        name: 'Action: Send Gentle Follow-Up Email if Unopened',
        category: 'Email Sequencer',
        config: { actionType: 'GMAIL_SEND_FOLLOWUP', recipient: '{{senderEmail}}', integrationProvider: 'gmail' }
      }
    ]
  },
  {
    name: 'New Hotel Booking -> AI Welcome Concierge & Post-Stay Survey',
    description: 'Triggers when a guest creates a room reservation. Generates an AI welcome itinerary, sends check-in guidance via WhatsApp, and schedules a post-stay review survey.',
    status: 'ACTIVE',
    triggerType: 'New Booking Created',
    category: 'Hotel & Booking',
    nodes: [
      {
        id: 'node-1',
        type: 'TRIGGER',
        name: 'Trigger: Guest Reservation Created',
        category: 'Hotel Management',
        config: { event: 'booking.created' }
      },
      {
        id: 'node-2',
        type: 'AI_AGENT',
        name: 'Gemini AI: Tailor Room & Local Concierge Guide',
        category: 'AI Assistant',
        config: { prompt: 'Create custom tourist & dining recommendations based on room type and stay dates.' }
      },
      {
        id: 'node-3',
        type: 'ACTION',
        name: 'Action: Send VIP Welcome Email with PDF Itinerary',
        category: 'Email Dispatch',
        config: { actionType: 'EMAIL_SEND', recipient: '{{guestEmail}}' }
      },
      {
        id: 'node-4',
        type: 'DELAY',
        name: 'Delay: Wait 48 Hours Post Checkout',
        category: 'Timer',
        config: { delayMinutes: 2880 }
      },
      {
        id: 'node-5',
        type: 'ACTION',
        name: 'Action: Send Review Request & NPS Survey',
        category: 'Feedback Loop',
        config: { actionType: 'EMAIL_SEND', recipient: '{{guestEmail}}' }
      }
    ]
  }
];

interface WorkflowAutomationStudioProps {
  tenantId: string;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
}

export default function WorkflowAutomationStudio({
  tenantId,
  onCreateAuditLog
}: WorkflowAutomationStudioProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'history' | 'templates' | 'accounts'>('canvas');
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  
  // Connected Accounts State
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [authInputEmail, setAuthInputEmail] = useState('');
  const [authApiKey, setAuthApiKey] = useState('');

  // Execution Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<ExecutionLog | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionLog[]>([]);

  // New Node Form state
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeType, setNewNodeType] = useState<WorkflowNode['type']>('ACTION');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState('Communication');
  const [newNodeProvider, setNewNodeProvider] = useState<string>('none');

  useEffect(() => {
    loadWorkflows();
    loadConnectedAccounts();
  }, [tenantId]);

  const loadConnectedAccounts = () => {
    const key = `marketforge_accounts_${tenantId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setConnectedAccounts(JSON.parse(raw));
        return;
      } catch (e) {}
    }

    const defaultAccounts: ConnectedAccount[] = [
      {
        id: 'acc_linkedin_1',
        provider: 'linkedin',
        accountName: 'Company LinkedIn Page',
        status: 'CONNECTED',
        connectedAt: new Date().toISOString(),
        accountEmailOrId: 'marketing@enterprise.com'
      },
      {
        id: 'acc_messenger_1',
        provider: 'meta_messenger',
        accountName: 'Facebook Business Page Concierge',
        status: 'CONNECTED',
        connectedAt: new Date().toISOString(),
        accountEmailOrId: 'page_id_881920112'
      },
      {
        id: 'acc_whatsapp_1',
        provider: 'whatsapp',
        accountName: 'WhatsApp Business API (+977)',
        status: 'CONNECTED',
        connectedAt: new Date().toISOString(),
        accountEmailOrId: '+977-9801122334'
      },
      {
        id: 'acc_sheets_1',
        provider: 'google_sheets',
        accountName: 'Google Sheets Master CRM',
        status: 'CONNECTED',
        connectedAt: new Date().toISOString(),
        accountEmailOrId: 'leads@googleworkspace.com'
      }
    ];

    setConnectedAccounts(defaultAccounts);
    localStorage.setItem(key, JSON.stringify(defaultAccounts));
  };

  const saveConnectedAccounts = (updated: ConnectedAccount[]) => {
    setConnectedAccounts(updated);
    localStorage.setItem(`marketforge_accounts_${tenantId}`, JSON.stringify(updated));
  };

  const handleConnectAccount = (provider: ConnectedAccount['provider'], providerLabel: string) => {
    const freshAccount: ConnectedAccount = {
      id: `acc_${provider}_${Date.now()}`,
      provider,
      accountName: `${providerLabel} (${authInputEmail || 'Connected Profile'})`,
      status: 'CONNECTED',
      connectedAt: new Date().toISOString(),
      accountEmailOrId: authInputEmail || authApiKey.slice(0, 8) || 'oauth_user_active'
    };

    const next = [...connectedAccounts, freshAccount];
    saveConnectedAccounts(next);
    setShowConnectModal(null);
    setAuthInputEmail('');
    setAuthApiKey('');

    if (onCreateAuditLog) {
      onCreateAuditLog('ACCOUNT_CONNECTED', 'info', `Connected ${providerLabel} integration account.`);
    }
  };

  const loadWorkflows = () => {
    const key = `marketforge_workflows_${tenantId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setWorkflows(parsed);
        if (parsed.length > 0 && !selectedWorkflow) {
          setSelectedWorkflow(parsed[0]);
        }
        return;
      } catch (e) {}
    }

    const initial: WorkflowDefinition[] = STARTER_TEMPLATES.map((tmpl, idx) => ({
      ...tmpl,
      id: `wf_${Date.now()}_${idx}`,
      tenantId,
      totalRuns: Math.floor(Math.random() * 80) + 18,
      successRate: 98.6,
      createdAt: new Date().toISOString()
    }));

    setWorkflows(initial);
    setSelectedWorkflow(initial[0]);
    localStorage.setItem(key, JSON.stringify(initial));
  };

  const saveWorkflows = (updated: WorkflowDefinition[]) => {
    setWorkflows(updated);
    localStorage.setItem(`marketforge_workflows_${tenantId}`, JSON.stringify(updated));
  };

  const handleCreateNewWorkflow = () => {
    const fresh: WorkflowDefinition = {
      id: `wf_${Date.now()}`,
      tenantId,
      name: 'New Custom Automation Flow',
      description: 'Event-driven workflow triggered via API, Webhooks, LinkedIn, or Meta Messenger.',
      status: 'ACTIVE',
      triggerType: 'Incoming Webhook Event',
      category: 'Social Media',
      nodes: [
        {
          id: `node_${Date.now()}_1`,
          type: 'TRIGGER',
          name: 'Trigger: Incoming Lead / Message Event',
          category: 'Webhook Ingest',
          config: { event: 'custom.event' }
        },
        {
          id: `node_${Date.now()}_2`,
          type: 'AI_AGENT',
          name: 'Gemini AI: Intelligently Analyze Payload',
          category: 'AI Processing',
          config: { prompt: 'Extract actionable insights and determine priority level.' }
        },
        {
          id: `node_${Date.now()}_3`,
          type: 'ACTION',
          name: 'Action: Notify Team & Save Record',
          category: 'Notification',
          config: { actionType: 'EMAIL_SEND', recipient: 'team@tenant.com' }
        }
      ],
      totalRuns: 0,
      successRate: 100,
      createdAt: new Date().toISOString()
    };

    const next = [...workflows, fresh];
    saveWorkflows(next);
    setSelectedWorkflow(fresh);

    if (onCreateAuditLog) {
      onCreateAuditLog('WORKFLOW_CREATED', 'info', `Created automation workflow: ${fresh.name}`);
    }
  };

  const handleAddNodeToWorkflow = () => {
    if (!selectedWorkflow || !newNodeName.trim()) return;

    const freshNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: newNodeType,
      name: newNodeName.trim(),
      category: newNodeCategory,
      config: {
        event: 'custom.step',
        prompt: newNodeType === 'AI_AGENT' ? 'Process data using Gemini AI...' : undefined,
        integrationProvider: newNodeProvider !== 'none' ? newNodeProvider : undefined
      }
    };

    const updatedWf = {
      ...selectedWorkflow,
      nodes: [...selectedWorkflow.nodes, freshNode]
    };

    const updatedList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    saveWorkflows(updatedList);
    setSelectedWorkflow(updatedWf);

    setNewNodeName('');
    setShowAddNodeModal(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;
    const updatedNodes = selectedWorkflow.nodes.filter(n => n.id !== nodeId);
    const updatedWf = { ...selectedWorkflow, nodes: updatedNodes };
    const updatedList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    saveWorkflows(updatedList);
    setSelectedWorkflow(updatedWf);
  };

  const handleToggleWorkflowStatus = (wfId: string) => {
    const updatedList = workflows.map(w => {
      if (w.id === wfId) {
        const nextStatus: WorkflowDefinition['status'] = w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...w, status: nextStatus };
      }
      return w;
    });
    saveWorkflows(updatedList);
    if (selectedWorkflow?.id === wfId) {
      setSelectedWorkflow(updatedList.find(w => w.id === wfId) || null);
    }
  };

  const handleDeleteWorkflow = (wfId: string) => {
    if (!window.confirm('Are you sure you want to delete this automation workflow?')) return;
    const updated = workflows.filter(w => w.id !== wfId);
    saveWorkflows(updated);
    setSelectedWorkflow(updated.length > 0 ? updated[0] : null);
  };

  // Run Real-Time Simulation / Execution Sandbox
  const handleRunSimulation = async () => {
    if (!selectedWorkflow || selectedWorkflow.nodes.length === 0) return;

    setIsSimulating(true);
    setSimLogs(null);

    const resetNodes = selectedWorkflow.nodes.map(n => ({ ...n, status: 'RUNNING' as const }));
    setSelectedWorkflow({ ...selectedWorkflow, nodes: resetNodes });

    const stepLogs: ExecutionLog['stepLogs'] = [];
    let overallStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';

    for (let i = 0; i < selectedWorkflow.nodes.length; i++) {
      const node = selectedWorkflow.nodes[i];
      await new Promise(resolve => setTimeout(resolve, 550));

      const isSuccess = Math.random() > 0.03; 
      const stepMs = Math.floor(Math.random() * 240) + 35;

      const nodeOutput = {
        nodeId: node.id,
        timestamp: new Date().toISOString(),
        details: `Executed step '${node.name}'`,
        payload: {
          tenantId,
          status: 'PROCESSED',
          stepResult: node.type === 'AI_AGENT' 
            ? 'Gemini AI generated response payload with high confidence' 
            : 'Action dispatched successfully via connected account.'
        }
      };

      stepLogs.push({
        nodeId: node.id,
        nodeName: node.name,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        input: { event: node.config.event || 'TRIGGER_PAYLOAD', tenantId },
        output: nodeOutput,
        executionMs: stepMs
      });

      if (!isSuccess) {
        overallStatus = 'FAILED';
      }

      const updatedNodes = selectedWorkflow.nodes.map((n, idx) => {
        if (idx === i) {
          return { ...n, status: isSuccess ? ('SUCCESS' as const) : ('FAILED' as const), outputPayload: nodeOutput };
        }
        return n;
      });
      setSelectedWorkflow({ ...selectedWorkflow, nodes: updatedNodes });
    }

    const totalDuration = stepLogs.reduce((acc, curr) => acc + curr.executionMs, 0);

    const logRecord: ExecutionLog = {
      id: `exec_${Date.now()}`,
      workflowId: selectedWorkflow.id,
      workflowName: selectedWorkflow.name,
      status: overallStatus,
      startedAt: new Date().toISOString(),
      durationMs: totalDuration,
      stepLogs
    };

    setSimLogs(logRecord);
    setExecutionHistory(prev => [logRecord, ...prev]);

    const updatedList = workflows.map(w => {
      if (w.id === selectedWorkflow.id) {
        return {
          ...w,
          totalRuns: w.totalRuns + 1,
          lastRunAt: new Date().toISOString()
        };
      }
      return w;
    });
    saveWorkflows(updatedList);

    setIsSimulating(false);

    if (onCreateAuditLog) {
      onCreateAuditLog('WORKFLOW_EXECUTED', overallStatus === 'SUCCESS' ? 'success' : 'error', `Executed automation run for '${selectedWorkflow.name}'.`);
    }
  };

  const handleUseTemplate = (template: typeof STARTER_TEMPLATES[0]) => {
    const fresh: WorkflowDefinition = {
      id: `wf_${Date.now()}`,
      tenantId,
      name: template.name,
      description: template.description,
      status: 'ACTIVE',
      triggerType: template.triggerType,
      category: template.category,
      nodes: template.nodes.map((n, idx) => ({ ...n, id: `node_${Date.now()}_${idx}` })),
      totalRuns: 0,
      successRate: 100,
      createdAt: new Date().toISOString()
    };

    const next = [...workflows, fresh];
    saveWorkflows(next);
    setSelectedWorkflow(fresh);
    setActiveTab('canvas');

    if (onCreateAuditLog) {
      onCreateAuditLog('WORKFLOW_CREATED', 'info', `Adopted template: ${template.name}`);
    }
  };

  return (
    <div id="workflow-automation-studio" className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              n8n & Make.com Automation Paradigm
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Visual Workflow Automation Studio</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Build event-driven automations for LinkedIn leads, Meta Messenger AI, WhatsApp receipts, Google Sheets live sync, and Gemini agents.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 border border-slate-800 rounded-2xl relative z-10 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'canvas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" /> Canvas Editor
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Pre-built Templates ({STARTER_TEMPLATES.length})
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'accounts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-300" /> Connected Accounts ({connectedAccounts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Run History
          </button>
        </div>
      </div>

      {/* MAIN TAB 1: CANVAS EDITOR */}
      {activeTab === 'canvas' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column: Workflows Selection Panel */}
          <div className="xl:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-xs">Automation Flow Registry</h3>
                </div>
                <button
                  onClick={handleCreateNewWorkflow}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Flow
                </button>
              </div>

              <div className="space-y-2">
                {workflows.map(wf => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                      selectedWorkflow?.id === wf.id
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                        : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${wf.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{wf.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{wf.description}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWorkflowStatus(wf.id);
                        }}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition ${
                          wf.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {wf.status}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/40">
                      <span>{wf.nodes.length} Nodes Configured</span>
                      <span>{wf.totalRuns} Executions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Node Flow Canvas & Execution Visualizer */}
          <div className="xl:col-span-8 space-y-6">
            {selectedWorkflow ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
                
                {/* Selected Workflow Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedWorkflow.name}
                        onChange={(e) => {
                          const updated = { ...selectedWorkflow, name: e.target.value };
                          setSelectedWorkflow(updated);
                          saveWorkflows(workflows.map(w => w.id === updated.id ? updated : w));
                        }}
                        className="text-base font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 rounded"
                      />
                    </div>
                    <p className="text-xs text-slate-500 px-1">{selectedWorkflow.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer disabled:bg-slate-300"
                    >
                      <Play className={`w-3.5 h-3.5 fill-white ${isSimulating ? 'animate-spin' : ''}`} />
                      {isSimulating ? 'Executing Step Nodes...' : 'Test Run Flow'}
                    </button>

                    <button
                      onClick={() => setShowAddNodeModal(true)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Node
                    </button>

                    <button
                      onClick={() => handleDeleteWorkflow(selectedWorkflow.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Node Canvas / Visual Sequence List */}
                <div className="space-y-4 relative py-2">
                  <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    Visual Step Sequence (Execution Flow)
                  </div>

                  <div className="space-y-3 relative">
                    {selectedWorkflow.nodes.map((node, index) => {
                      const isLast = index === selectedWorkflow.nodes.length - 1;
                      
                      return (
                        <div key={node.id} className="relative group">
                          {/* Connector Line */}
                          {!isLast && (
                            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200 group-hover:bg-indigo-300 transition z-0" />
                          )}

                          <div className={`relative z-10 border rounded-2xl p-4 transition flex items-start justify-between gap-4 ${
                            node.status === 'SUCCESS' ? 'bg-emerald-50/60 border-emerald-300' :
                            node.status === 'FAILED' ? 'bg-rose-50/60 border-rose-300' :
                            node.status === 'RUNNING' ? 'bg-indigo-50/60 border-indigo-400 animate-pulse' :
                            'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                          }`}>
                            <div className="flex items-start gap-3.5">
                              {/* Node Icon Box */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-sm ${
                                node.config.integrationProvider === 'linkedin' ? 'bg-blue-600' :
                                node.config.integrationProvider === 'meta_messenger' ? 'bg-indigo-600' :
                                node.config.integrationProvider === 'whatsapp' ? 'bg-emerald-600' :
                                node.config.integrationProvider === 'google_sheets' ? 'bg-teal-600' :
                                node.type === 'TRIGGER' ? 'bg-indigo-600' :
                                node.type === 'CONDITION' ? 'bg-amber-600' :
                                node.type === 'AI_AGENT' ? 'bg-purple-600' :
                                node.type === 'DELAY' ? 'bg-slate-700' :
                                'bg-teal-600'
                              }`}>
                                {node.config.integrationProvider === 'linkedin' ? <Linkedin className="w-5 h-5" /> :
                                 node.config.integrationProvider === 'meta_messenger' ? <Facebook className="w-5 h-5" /> :
                                 node.config.integrationProvider === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> :
                                 node.config.integrationProvider === 'google_sheets' ? <FileSpreadsheet className="w-5 h-5" /> :
                                 node.type === 'TRIGGER' ? <Zap className="w-5 h-5" /> :
                                 node.type === 'CONDITION' ? <GitBranch className="w-5 h-5" /> :
                                 node.type === 'AI_AGENT' ? <Bot className="w-5 h-5" /> :
                                 node.type === 'DELAY' ? <Clock className="w-5 h-5" /> :
                                 <ArrowRight className="w-5 h-5" />}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                    Step {index + 1}: {node.type}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-400">{node.category}</span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">{node.name}</h4>

                                {/* Config details */}
                                <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded-xl border border-slate-200/80 mt-1 max-w-xl">
                                  {node.type === 'TRIGGER' && `Listening for event: ${node.config.event}`}
                                  {node.type === 'CONDITION' && `If ${node.config.conditionField} ${node.config.operator || '=='} '${node.config.value}'`}
                                  {node.type === 'AI_AGENT' && `Prompt: "${node.config.prompt}"`}
                                  {node.type === 'ACTION' && `Execute: ${node.config.actionType} -> Target: ${node.config.recipient || 'System API'}`}
                                  {node.type === 'DELAY' && `Pause pipeline execution for ${node.config.delayMinutes || 60} mins`}
                                </div>

                                {/* Execution Output preview if ran */}
                                {node.outputPayload && (
                                  <div className="mt-2 text-[10px] font-mono bg-slate-900 text-emerald-400 p-2.5 rounded-xl space-y-1 border border-slate-800">
                                    <span className="text-slate-400 block font-sans font-bold uppercase text-[9px]">Node Execution Result:</span>
                                    <pre className="whitespace-pre-wrap">{JSON.stringify(node.outputPayload, null, 2)}</pre>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteNode(node.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Remove Node"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulation Execution Result Box */}
                {simLogs && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-3 font-mono animate-fade-in text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                        <span className="font-bold text-white">Flow Test Execution Completed ({simLogs.durationMs}ms)</span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {simLogs.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] max-h-40 overflow-y-auto">
                      {simLogs.stepLogs.map((step, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/50 text-slate-300">
                          <span>✓ Step {idx + 1}: {step.nodeName}</span>
                          <span className="text-emerald-400">{step.executionMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-400 space-y-3">
                <GitBranch className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                <h4 className="font-bold text-slate-700 text-sm">No Automation Flow Selected</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Select an existing workflow from the left sidebar or click "New Flow" to build your custom automation pipeline.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MAIN TAB 2: CONNECTED ACCOUNTS & OAUTH */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-emerald-600" /> Integration Accounts & Connected OAuth
                </h3>
                <p className="text-xs text-slate-500">Connect your LinkedIn, Meta Facebook Page, WhatsApp Business, Google Sheets, or Gmail credentials with 1-click login.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              
              {/* LinkedIn Connection Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">LinkedIn Business</h4>
                      <p className="text-[10px] text-slate-500">InMail & Lead Form Ingest</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <button
                  onClick={() => setShowConnectModal('linkedin')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> Re-Connect LinkedIn Account
                </button>
              </div>

              {/* Meta Messenger Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Facebook className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Meta Messenger / IG</h4>
                      <p className="text-[10px] text-slate-500">Facebook Page Concierge</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <button
                  onClick={() => setShowConnectModal('meta_messenger')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> Connect Meta Page with Login
                </button>
              </div>

              {/* WhatsApp Business Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">WhatsApp Business API</h4>
                      <p className="text-[10px] text-slate-500">Automated Receipts & Alerts</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <button
                  onClick={() => setShowConnectModal('whatsapp')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Key className="w-3.5 h-3.5" /> Connect WhatsApp Credentials
                </button>
              </div>

              {/* Google Workspace / Sheets Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Google Sheets & Gmail</h4>
                      <p className="text-[10px] text-slate-500">Sheets Ingest & Inbox Sequencer</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <button
                  onClick={() => setShowConnectModal('google_sheets')}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign in with Google
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MAIN TAB 3: WORKFLOW LIBRARY / STARTER TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2 text-slate-900">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Pre-built Automation Blueprint Library
            </h3>
            <p className="text-xs text-slate-500">Adopt highly used, production-tested templates for social media lead generation, Meta Messenger AI, WhatsApp receipts, and Google Sheets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STARTER_TEMPLATES.map((tmpl, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-300 transition text-slate-900">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 inline-block">
                      {tmpl.triggerType}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {tmpl.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{tmpl.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{tmpl.description}</p>

                  <div className="pt-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Included Step Nodes:</span>
                    <ul className="space-y-1 text-xs text-slate-700 font-mono">
                      {tmpl.nodes.map((n, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-indigo-600 font-bold">→</span>
                          <span>{n.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleUseTemplate(tmpl)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Adopt Blueprint & Connect APIs
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN TAB 4: EXECUTION HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Automation Run Audit History</h3>
              <p className="text-xs text-slate-500">Trace step-by-step inputs, output payloads, and execution latency for every workflow run.</p>
            </div>
            <button
              onClick={() => setExecutionHistory([])}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          {executionHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No recent workflow runs recorded in this session. Execute a "Test Run Flow" on the canvas to inspect real-time logs here.
            </div>
          ) : (
            <div className="space-y-3">
              {executionHistory.map(log => (
                <div key={log.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-bold text-xs text-slate-900">{log.workflowName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({log.id})</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                      <span>{new Date(log.startedAt).toLocaleTimeString()}</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded font-bold text-slate-700">{log.durationMs}ms</span>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-700">
                    {log.stepLogs.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/60">
                        <span>Node {idx + 1}: {step.nodeName}</span>
                        <span className="text-emerald-700 font-bold">{step.status} ({step.executionMs}ms)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connect Integration Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 font-sans text-slate-900 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Connect {showConnectModal.toUpperCase()} Integration
              </h3>
              <button onClick={() => setShowConnectModal(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Email / Business Page ID</label>
                <input
                  type="text"
                  value={authInputEmail}
                  onChange={(e) => setAuthInputEmail(e.target.value)}
                  placeholder="e.g. sales@enterprise.com or page_id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">API Token / OAuth Secret (Optional)</label>
                <input
                  type="password"
                  value={authApiKey}
                  onChange={(e) => setAuthApiKey(e.target.value)}
                  placeholder="Paste access token or leave blank for OAuth popup"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowConnectModal(null)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConnectAccount(showConnectModal as any, showConnectModal.toUpperCase())}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Authenticate & Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 font-sans text-slate-900 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Step Node to Canvas</h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Node Type</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="ACTION">Action Node (Send Email, WhatsApp, InMail, HTTP)</option>
                  <option value="AI_AGENT">Gemini AI Node (Summarize, Score, Classify)</option>
                  <option value="CONDITION">Condition Node (If / Else Filter)</option>
                  <option value="DELAY">Delay Node (Timer Wait)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Integration Provider</label>
                <select
                  value={newNodeProvider}
                  onChange={(e) => setNewNodeProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="none">Internal Custom Logic</option>
                  <option value="linkedin">LinkedIn Business</option>
                  <option value="meta_messenger">Meta Messenger / IG</option>
                  <option value="whatsapp">WhatsApp Business API</option>
                  <option value="google_sheets">Google Sheets</option>
                  <option value="gmail">Gmail</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Node Name / Title</label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="e.g. LinkedIn InMail VIP Personalization"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category Tag</label>
                <input
                  type="text"
                  value={newNodeCategory}
                  onChange={(e) => setNewNodeCategory(e.target.value)}
                  placeholder="e.g. Social Media / AI Processing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddNodeModal(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNodeToWorkflow}
                disabled={!newNodeName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm disabled:bg-slate-300"
              >
                Insert Node into Canvas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

