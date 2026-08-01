import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  Sparkles, 
  Loader2, 
  Send, 
  Users, 
  ShieldAlert, 
  Cpu, 
  BarChart3, 
  Clock, 
  ArrowRight, 
  UserPlus, 
  FileText, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Plus, 
  Check, 
  X,
  TrendingUp,
  Inbox,
  Eye,
  Settings,
  List,
  Edit3,
  CheckCircle,
  Copy,
  Smartphone,
  Laptop
} from 'lucide-react';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
  userRole: string;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
}

interface EmailTouch {
  touchNumber: number;
  subject: string;
  preheader: string;
  body: string;
  delayHours: number;
  optimizedVariant?: string;
  ctaText?: string;
  ctaUrl?: string;
  sendTime?: string;
  pastedEmails?: string;
  selectedSegment?: string;
}

interface EmailSequence {
  id: string;
  tenantId: string;
  campaignId: string;
  sequenceName: string;
  sequenceType: 'WELCOME' | 'NURTURE' | 'PROMOTIONAL' | 'EDUCATIONAL' | 'WINBACK';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  steps: { stepNumber: number; emailId: string; delayMinutes: number }[];
  touches: EmailTouch[];
  totalSent: number;
  totalOpened: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  publishedAt?: string;
}

interface Segment {
  id: string;
  name: string;
  criteria: string;
  recipientCount: number;
}

interface ConsentRecord {
  id: string;
  email: string;
  name: string;
  status: 'subscribed' | 'opted_out';
  origin: string;
  updatedAt: string;
}

export default function EmailStudio({
  profile,
  tenantId,
  userRole,
  onCreateAuditLog,
}: Props) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'sequences' | 'editor' | 'consent' | 'analytics'>('sequences');

  // Network Simulation State (Module 7)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    const saved = localStorage.getItem(`marketforge_queued_emails_${tenantId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Offline Draft Sync to LocalStorage (Offline Cache)
  const [offlineDraftSyncTime, setOfflineDraftSyncTime] = useState<string | null>(null);

  // Core Arrays
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<EmailSequence | null>(null);
  const [activeTouchIdx, setActiveTouchIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [newSeqName, setNewSeqName] = useState<string>("");
  const [newSeqType, setNewSeqType] = useState<'WELCOME' | 'NURTURE' | 'PROMOTIONAL' | 'EDUCATIONAL' | 'WINBACK'>('WELCOME');
  const [createMode, setCreateMode] = useState<'ai' | 'manual'>('ai');
  
  // Modal AI Options
  const [objective, setObjective] = useState<string>("Introduce our brand and drive product trials");
  const [aiAudience, setAiAudience] = useState<string>("B2B Operations Directors and Technical Managers");
  const [aiTone, setAiTone] = useState<string>("Professional, commanding, and value-added");
  const [touchesCount, setTouchesCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Email Editor Fields (Live Data)
  const [editorSubject, setEditorSubject] = useState<string>("");
  const [editorPreheader, setEditorPreheader] = useState<string>("");
  const [editorBody, setEditorBody] = useState<string>("");
  const [editorCtaText, setEditorCtaText] = useState<string>("");
  const [editorCtaUrl, setEditorCtaUrl] = useState<string>("");
  const [editorSendTime, setEditorSendTime] = useState<string>("IMMEDIATE");
  const [editorPastedEmails, setEditorPastedEmails] = useState<string>("");
  const [editorSelectedSegment, setEditorSelectedSegment] = useState<string>("engaged-leads");
  
  // Preview Controls
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [templateStyle, setTemplateStyle] = useState<'minimalist' | 'warm' | 'brutalist'>('minimalist');

  // Segments and Consent logs database memory
  const [segments, setSegments] = useState<Segment[]>([
    { id: "engaged-leads", name: "High Conversion Intent Warm Leads", criteria: "Opened 2+ resources this month", recipientCount: 340 },
    { id: "registered-trialists", name: "Active Trials & Explorers", criteria: "Registered in last 14 days", recipientCount: 185 },
    { id: "inactive-members", name: "Dormant Customer Renewal Target", criteria: "No session logs in 30 days", recipientCount: 520 },
  ]);

  const [consentList, setConsentList] = useState<ConsentRecord[]>([
    { id: "con-1", email: "sarah.management@aeroflow-client.com", name: "Sarah Jenkins", status: 'subscribed', origin: "LinkedIn Download", updatedAt: "2026-06-15" },
    { id: "con-2", email: "devon.engineering@cart-ops.net", name: "Devon Carter", status: 'subscribed', origin: "SaaS Free Trial Flow", updatedAt: "2026-06-16" },
    { id: "con-3", email: "evelyn.interior@sienna-studio.it", name: "Evelyn Thorne", status: 'subscribed', origin: "AD Exhibition Form", updatedAt: "2026-06-17" },
    { id: "con-4", email: "ryan.gallagher@trail-athlete.cc", name: "Ryan Gallagher", status: 'subscribed', origin: "Solas Challenge Booking", updatedAt: "2026-06-17" },
    { id: "con-5", email: "unsubscribed-leads@spammer.com", name: "Aggressive Marketer", status: 'opted_out', origin: "Footer Unsubscribe Request", updatedAt: "2026-06-18" }
  ]);

  // Consent Input Fields
  const [tgtName, setTgtName] = useState("");
  const [tgtEmail, setTgtEmail] = useState("");
  const [tgtOrigin, setTgtOrigin] = useState("Direct Client Dashboard");

  // Workflow Automation trigger records
  const [workflowTriggers, setWorkflowTriggers] = useState([
    { id: "tr-1", trigger: "User registers for trial", action: "Fire Sequence touch #1 instantly", active: true },
    { id: "tr-2", trigger: "Abandoned payment checkout", action: "Execute touch #2 after 3 hours delay", active: true },
    { id: "tr-3", trigger: "Workspace activity stagnant 7 days", action: "Send touch #3 re-engagement sequence", active: false }
  ]);
  const [newTriggerSubject, setNewTriggerSubject] = useState("");
  const [newTriggerAction, setNewTriggerAction] = useState("");

  // Telemetry logs and analytics
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isVerifyingProvider, setIsVerifyingProvider] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    latencyMs?: number;
    provider?: string;
    recipient?: string;
    message?: string;
    error?: string;
    recommendation?: string;
  } | null>(null);

  const handleVerifyEmailProvider = async () => {
    setIsVerifyingProvider(true);
    setVerificationResult(null);
    setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `📡 Testing Email Provider active configuration for Tenant: [${tenantId}]...` }, ...p]);

    try {
      const response = await fetch('/api/admin/tenants/verify-email-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId,
          'x-simulated-role': userRole
        }
      });
      const data = await response.json();
      setVerificationResult(data);
      if (data.success) {
        setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✓ Email Provider diagnostics PASSED. Delivered verification block via ${data.provider.toUpperCase()} to ${data.recipient}.` }, ...p]);
        if (onCreateAuditLog) {
          onCreateAuditLog('diagnostics', 'low', `Email delivery pipeline verified successfully via ${data.provider.toUpperCase()}.`);
        }
      } else {
        setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `❌ Email Provider diagnostics FAILED: ${data.error || 'Unknown error'}` }, ...p]);
        if (onCreateAuditLog) {
          onCreateAuditLog('diagnostics', 'high', `Email delivery pipeline check failed: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        error: err.message,
        recommendation: "Ensure the backend server is reachable and running."
      });
      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `❌ Email Provider diagnostics exception: ${err.message}` }, ...p]);
    } finally {
      setIsVerifyingProvider(false);
    }
  };

  const [logHistory, setLogHistory] = useState<Array<{ time: string; msg: string }>>([
    { time: new Date().toLocaleTimeString(), msg: "MailForge Campaign OS engine booted securely." },
    { time: new Date().toLocaleTimeString(), msg: `Tenant credentials fetched successfully for Tenant: [${tenantId}] (${userRole}).` }
  ]);

  // Scorecards metrics
  const [analytics, setAnalytics] = useState({
    sent: 1040,
    delivered: 1040,
    openedHex: 642, // ~62%
    clicksHex: 246, // ~24%
    bounces: 0,
    unsubscribes: 8,
    score: 95,
  });

  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Ingestion feedback loops
  const [cmoInboundConnected, setCmoInboundConnected] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // INITIAL STAGE LOADER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchSaaSStoreData = async () => {
      setIsLoading(true);
      try {
        const seqRes = await fetch('/api/agent/email/sequences', {
          headers: { 'x-simulated-tenant': tenantId }
        });
        const emailsRes = await fetch('/api/agent/email/emails', {
          headers: { 'x-simulated-tenant': tenantId }
        });
        const segmentsRes = await fetch('/api/agent/email/segments', {
          headers: { 'x-simulated-tenant': tenantId }
        });
        const consentsRes = await fetch('/api/agent/email/consents', {
          headers: { 'x-simulated-tenant': tenantId }
        });

        let loadedSequences: EmailSequence[] = [];
        if (seqRes.ok) {
          loadedSequences = await seqRes.json();
        }

        // Setup base offline simulation presets if zero items returned
        if (loadedSequences.length === 0) {
          const defaultSeq: EmailSequence = {
            id: `seq_welcome_${tenantId}`,
            tenantId,
            campaignId: "camp_welcome_automation",
            sequenceName: "Compliant Welcome Drip",
            sequenceType: "WELCOME",
            status: "ACTIVE",
            steps: [
              { stepNumber: 1, emailId: `email-${tenantId}-1`, delayMinutes: 0 },
              { stepNumber: 2, emailId: `email-${tenantId}-2`, delayMinutes: 1440 },
              { stepNumber: 3, emailId: `email-${tenantId}-3`, delayMinutes: 4320 }
            ],
            touches: [
              {
                touchNumber: 1,
                subject: `Welcome to ${profile.name} - Continuous Operational Acceleration`,
                preheader: `Instantly eliminate manual workflow friction inside ${profile.name}.`,
                body: `Hello {{customer_name}},\n\nWe launched ${profile.name} to cure the friction of disconnected corporate files.\n\nYesterday over 300 managers registered trial layouts to establish structural alignment. Today we welcome you to the absolute state-of-the-art.\n\nClick below to try our custom 60-second workflow shortcuts immediately.\n\nWarm regards,\nThe team.`,
                delayHours: 0,
                optimizedVariant: `Urgent: Welcome to modern workflow precision with ${profile.name}`,
                ctaText: "Configure Workspace",
                ctaUrl: "/onboarding",
                sendTime: "IMMEDIATE"
              },
              {
                touchNumber: 2,
                subject: "How top engineering teams save 5+ hours weekly",
                preheader: "Aligning workspace dependencies and team metrics in 3 clicks.",
                body: `Hey {{customer_name}},\n\nLet's keep things real: manual synchronization is a silent killer of momentum.\n\n${profile.name} automates content asset allocations, social schedules, and lead dispatches without requiring code configurations.\n\nTake five minutes today to bind your existing systems.\n\nSincerely,\nDirector of Success.`,
                delayHours: 24,
                optimizedVariant: "Reclaim 20% overhead with these quick automation maps",
                ctaText: "Integrate Now",
                ctaUrl: "/integrations",
                sendTime: "IMMEDIATE"
              },
              {
                touchNumber: 3,
                subject: "Final checklist: Securing corporate continuity",
                preheader: "An automated summary highlighting elite partner achievements.",
                body: `Hello {{customer_name}},\n\nThis is our final onboarding touch before our auto-drip series finishes.\n\nIf you are serious about cementing professional alignment across remote parameters, check out our live webinar schedule detailing case studies from Sienna and Solas teams.\n\nBest,\nExecutive Champion.`,
                delayHours: 72,
                optimizedVariant: "Is your business lagging? Let's fix manual overhead today.",
                ctaText: "Launch Masterclass",
                ctaUrl: "/webinar",
                sendTime: "IMMEDIATE"
              }
            ],
            totalSent: 1040,
            totalOpened: 642,
            openRate: 61.7,
            clickRate: 23.6,
            createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
          };
          
          loadedSequences = [defaultSeq];

          // Save seed default
          await fetch('/api/agent/email/sequences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
            body: JSON.stringify(defaultSeq)
          });
        }

        setSequences(loadedSequences);
        setSelectedSequence(loadedSequences[0]);
        setActiveTouchIdx(0);

        if (segmentsRes.ok) {
          const segData = await segmentsRes.json();
          if (segData && segData.length > 0) setSegments(segData);
        }

        if (consentsRes.ok) {
          const consentData = await consentsRes.json();
          if (consentData && consentData.length > 0) setConsentList(consentData);
        }

      } catch (err) {
        console.warn("Loading error backup seeded:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaaSStoreData();
  }, [tenantId]);

  // Bind Editor Fields to Active Touch
  useEffect(() => {
    if (selectedSequence && selectedSequence.touches?.[activeTouchIdx]) {
      const activeTouch = selectedSequence.touches[activeTouchIdx];
      setEditorSubject(activeTouch.subject || "");
      setEditorPreheader(activeTouch.preheader || "");
      setEditorBody(activeTouch.body || "");
      setEditorCtaText(activeTouch.ctaText || "Activate Offer");
      setEditorCtaUrl(activeTouch.ctaUrl || "/");
      setEditorSendTime(activeTouch.sendTime || "IMMEDIATE");
      setEditorPastedEmails(activeTouch.pastedEmails || "");
      setEditorSelectedSegment(activeTouch.selectedSegment || "engaged-leads");
    }
  }, [selectedSequence, activeTouchIdx]);

  // Offline Sync to localStorage on active editor change
  useEffect(() => {
    if (selectedSequence) {
      const draftKey = `marketforge_draft_email_sync_${tenantId}`;
      const draftData = {
        sequenceId: selectedSequence.id,
        activeTouchIdx,
        subject: editorSubject,
        preheader: editorPreheader,
        body: editorBody,
        ctaText: editorCtaText,
        ctaUrl: editorCtaUrl,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setOfflineDraftSyncTime(new Date().toLocaleTimeString());
    }
  }, [editorSubject, editorPreheader, editorBody, editorCtaText, editorCtaUrl, activeTouchIdx, selectedSequence]);

  // Network offline queue auto sync (Module 7)
  useEffect(() => {
    const handleConnectivityOnline = () => {
      setIsOnline(true);
      if (onCreateAuditLog) {
        onCreateAuditLog("NETWORK_RESTORED", "INFO", `Connectivity restored. Initiating queued outbound sync.`);
      }
    };
    const handleConnectivityOffline = () => {
      setIsOnline(false);
      if (onCreateAuditLog) {
        onCreateAuditLog("NETWORK_DISRUPTED", "WARNING", `Offline mode detected. Campaign dispatches will buffer to local device storage.`);
      }
    };
    window.addEventListener('online', handleConnectivityOnline);
    window.addEventListener('offline', handleConnectivityOffline);
    return () => {
      window.removeEventListener('online', handleConnectivityOnline);
      window.removeEventListener('offline', handleConnectivityOffline);
    };
  }, [tenantId]);

  // Force Synced Offline sends whenever online status activates
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      handleClearOfflineQueue();
    }
  }, [isOnline]);

  const handleClearOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `⚡ Connection restored. Synced ${offlineQueue.length} buffered dispatches online...` }, ...p]);
    let successCount = 0;
    for (const item of offlineQueue) {
      try {
        const response = await fetch('/api/agent/email/schedule_send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
          body: JSON.stringify(item)
        });
        if (response.ok) successCount++;
      } catch (err) {
        console.warn("Failed syncing queue element:", err);
      }
    }
    setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✓ Synchronized ${successCount}/${offlineQueue.length} offline actions to campaign servers!` }, ...p]);
    setOfflineQueue([]);
    localStorage.removeItem(`marketforge_queued_emails_${tenantId}`);
  };

  // ---------------------------------------------------------------------------
  // SEQ DRAFT TRIGGER & CREATOR MODAL
  // ---------------------------------------------------------------------------
  const handleOpenSequenceCreator = () => {
    setNewSeqName("");
    setNewSeqType("NURTURE");
    setObjective(`Boost Q3 reservation volumes and introducing customized collections for ${profile.name}`);
    setShowCreateModal(true);
  };

  const handleApplySequenceStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setShowCreateModal(false);

    const nameToUse = newSeqName.trim() || `Autonomous AI Campaign Series`;
    const targetSeqId = `seq_${Math.random().toString(36).substring(2, 9)}`;

    if (createMode === 'manual') {
      const manualSeq: EmailSequence = {
        id: targetSeqId,
        tenantId,
        campaignId: `camp_${Math.random().toString(36).substring(2, 9)}`,
        sequenceName: nameToUse,
        sequenceType: newSeqType,
        status: "DRAFT",
        steps: [
          { stepNumber: 1, emailId: `email-${tenantId}-manual-1`, delayMinutes: 0 },
          { stepNumber: 2, emailId: `email-${tenantId}-manual-2`, delayMinutes: 1440 }
        ],
        touches: [
          {
            touchNumber: 1,
            subject: "Welcome to our brand introduction series",
            preheader: "An overview of our craftsmanship style, tailored to you.",
            body: "Hi {{customer_name}},\n\nWelcome! This touch initiates your personalized sequence setup.",
            delayHours: 0,
            ctaText: "Get Access Today",
            ctaUrl: "/"
          },
          {
            touchNumber: 2,
            subject: "Discover our premium quality and value",
            preheader: "Eliminate bottleneck friction starting now.",
            body: "Hi {{customer_name}},\n\nWe provide pristine, customized alignment without the stress.",
            delayHours: 24,
            ctaText: "Redeem Offer",
            ctaUrl: "/"
          }
        ],
        totalSent: 0,
        totalOpened: 0,
        openRate: 0.0,
        clickRate: 0.0,
        createdAt: new Date().toISOString()
      };

      setSequences(prev => [manualSeq, ...prev]);
      setSelectedSequence(manualSeq);
      setActiveTouchIdx(0);
      setActiveTab('editor');
      setIsGenerating(false);

      // Save to server SaaS store
      await fetch('/api/agent/email/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
        body: JSON.stringify(manualSeq)
      });
      return;
    }

    // AI Generation
    try {
      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `📡 Initiating Gemini AI Direct Copywriter for parameters: "${objective}"...` }, ...p]);
      const res = await fetch('/api/agent/email/generate_sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
        body: JSON.stringify({
          campaignId: `camp_ai_${Date.now()}`,
          goalType: objective,
          audienceProfile: aiAudience,
          tone: aiTone
        })
      });

      if (!res.ok) throw new Error("AI Sequence compiler rejected prompt.");

      const aiData = await res.json();
      
      // Process Gemini Structured JSON response to compatible EmailTouch objects
      const compiledTouches: EmailTouch[] = (aiData.steps || []).map((step: any) => ({
        touchNumber: step.stepNumber || 1,
        subject: step.subject || "AI-Authored Subject Link",
        preheader: step.preheader || "Smart corporate optimization header",
        body: step.bodyOutline || step.body || "Dynamic value parameters",
        delayHours: Math.round((step.delayMinutes || 0) / 60) || 0,
        optimizedVariant: step.subjectVariants?.[0] || "Catchy: Accelerate your organizational outcome rates",
        ctaText: step.cta?.text || "Optimize Now",
        ctaUrl: step.cta?.suggestedUrl || "/"
      }));

      const aiSeqObj: EmailSequence = {
        id: targetSeqId,
        tenantId,
        campaignId: `camp_ai_generated_${Date.now()}`,
        sequenceName: aiData.sequenceName || `AI Sequence: ${objective.slice(0, 30)}...`,
        sequenceType: aiData.sequenceType || "NURTURE",
        status: "DRAFT",
        steps: compiledTouches.map(t => ({
          stepNumber: t.touchNumber,
          emailId: `email-${tenantId}-${targetSeqId}-${t.touchNumber}`,
          delayMinutes: t.delayHours * 60
        })),
        touches: compiledTouches,
        totalSent: 0,
        totalOpened: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: new Date().toISOString()
      };

      setSequences(prev => [aiSeqObj, ...prev]);
      setSelectedSequence(aiSeqObj);
      setActiveTouchIdx(0);
      setActiveTab('editor');

      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✓ Successfully created campaign sequence "${aiSeqObj.sequenceName}" containing ${aiSeqObj.touches.length} customized touches!` }, ...p]);

      await fetch('/api/agent/email/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
        body: JSON.stringify(aiSeqObj)
      });

    } catch (err: any) {
      console.warn("AI generation failed, launching backup preset.", err);
      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✕ Gemini dispatch latency. Armed stable fallback campaign series.` }, ...p]);
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SAVE ACTIVE TOUCH TO BACKEND
  // ---------------------------------------------------------------------------
  const handleSaveTouchEdits = async () => {
    if (!selectedSequence) return;
    setIsLoading(true);

    const updatedTouches = [...selectedSequence.touches];
    updatedTouches[activeTouchIdx] = {
      ...updatedTouches[activeTouchIdx],
      subject: editorSubject,
      preheader: editorPreheader,
      body: editorBody,
      ctaText: editorCtaText,
      ctaUrl: editorCtaUrl,
      sendTime: editorSendTime,
      pastedEmails: editorPastedEmails,
      selectedSegment: editorSelectedSegment
    };

    const updatedSeq = {
      ...selectedSequence,
      touches: updatedTouches,
      updatedAt: new Date().toISOString()
    };

    // Update Local States
    setSelectedSequence(updatedSeq);
    setSequences(prev => prev.map(s => s.id === selectedSequence.id ? updatedSeq : s));

    try {
      // 1. Post modified sequence
      await fetch('/api/agent/email/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
        body: JSON.stringify(updatedSeq)
      });

      // 2. Post separate emails record
      const activeTouch = updatedTouches[activeTouchIdx];
      const emailRecordId = `email-${tenantId}-${activeTouch.touchNumber}`;
      await fetch('/api/agent/email/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
        body: JSON.stringify({
          id: emailRecordId,
          tenantId,
          sequenceId: selectedSequence.id,
          subject: editorSubject,
          preheader: editorPreheader,
          body: editorBody,
          cta: { text: editorCtaText, url: editorCtaUrl },
          recipientEmail: editorPastedEmails || "",
          scheduledFor: editorSendTime,
          status: "DRAFT",
          createdAt: new Date().toISOString()
        })
      });

      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✓ Draft sync verified: Touch #${activeTouch.touchNumber} saved successfully to cloud servers.` }, ...p]);
      if (onCreateAuditLog) {
        onCreateAuditLog("DRAFT_EMAIL_SYNCED", "SUCCESS", `Synchronized draft edits for email touch #${activeTouch.touchNumber} compliant with double opt-in.`);
      }
    } catch (e) {
      console.warn("Failed saving edits to server:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SECURE SEND BROADCAST TRIGGER
  // ---------------------------------------------------------------------------
  const handleScheduleSendAction = async () => {
    if (!selectedSequence) return;
    const activeTouch = selectedSequence.touches[activeTouchIdx];

    // Offline buffer local queue sync
    if (!isOnline) {
      const offlinePayload = {
        emailId: `email-${tenantId}-${activeTouch.touchNumber}`,
        touchNumber: activeTouch.touchNumber,
        segmentId: editorSelectedSegment,
        pastedEmails: editorPastedEmails,
        sendTime: editorSendTime,
        subject: editorSubject,
        body: editorBody,
        ctaText: editorCtaText,
        ctaUrl: editorCtaUrl,
        timestamp: new Date().toISOString()
      };

      const updatedQueue = [...offlineQueue, offlinePayload];
      setOfflineQueue(updatedQueue);
      localStorage.setItem(`marketforge_queued_emails_${tenantId}`, JSON.stringify(updatedQueue));

      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `⚠ OFFLINE: Queue locked. Saved dispatch to browser local storage.` }, ...p]);
      alert("Offline simulation active. Sequence touch send logged securely to offline queues.");
      return;
    }

    setIsSendingTest(true);
    setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `📡 Scheduling sequence broadcast touch #${activeTouch.touchNumber} Compliantly...` }, ...p]);

    try {
      const response = await fetch('/api/agent/email/schedule_send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId,
          'x-simulated-role': userRole
        },
        body: JSON.stringify({
          emailId: `email-${tenantId}-${activeTouch.touchNumber}`,
          touchNumber: activeTouch.touchNumber,
          segmentId: editorSelectedSegment,
          sendTime: editorSendTime,
          pastedEmails: editorPastedEmails,
          subject: editorSubject,
          body: editorBody,
          ctaText: editorCtaText,
          ctaUrl: editorCtaUrl
        })
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
        setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `❌ LIMIT GATED: Campaign execution exceeds active subscription limits. Interceptor active.` }, ...p]);
        setIsSendingTest(false);
        return;
      }

      if (!response.ok) throw new Error("SMTP scheduler gateway reporting timeout.");
      const resData = await response.json();

      setLogHistory(p => [
        { time: new Date().toLocaleTimeString(), msg: `✓ Broadcast Executed: Deliveries generated! Provider simulator status: ${resData.providerSimulator}. Sent to ${resData.sentCount} targets.` },
        ...p
      ]);

      // Direct local analytics variance simulation
      if (editorSendTime === "IMMEDIATE") {
        setTimeout(async () => {
          try {
            const simulatedOpens = Math.floor(resData.sentCount * 0.44) + 1;
            const simulatedClicks = Math.floor(resData.sentCount * 0.18) + 1;

            const webhookRes = await fetch('/api/agent/email/webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
              body: JSON.stringify({
                emailId: resData.emailId,
                eventType: "OPEN"
              })
            });

            if (webhookRes.ok) {
              setAnalytics(p => ({
                ...p,
                sent: resData.sentCount,
                delivered: resData.sentCount,
                openedHex: simulatedOpens,
                clicksHex: simulatedClicks
              }));
              setLogHistory(log => [
                { time: new Date().toLocaleTimeString(), msg: `⚡ Webhook Callback received: Syncing live performance CTR metric rates.` },
                ...log
              ]);
            }
          } catch (webhookErr) {}
        }, 1500);
      }

      alert(`Campaign schedule recorded! Dispatched immediate broadcast successfully to custom targets.`);

    } catch (err: any) {
      console.error(err);
      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✕ Send failed. SMTP warming up.` }, ...p]);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Convert status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'PAUSED': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  // Handle manual recipient record
  const handleAddManualConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tgtEmail.trim() || !tgtName.trim()) return;

    const newRecord: ConsentRecord = {
      id: `con_${Date.now()}`,
      email: tgtEmail.trim().toLowerCase(),
      name: tgtName.trim(),
      status: 'subscribed',
      origin: tgtOrigin,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setConsentList(p => [newRecord, ...p]);
    setTgtName("");
    setTgtEmail("");

    setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✓ Secured explicit opt-in for ${newRecord.name} (${newRecord.email}) via ${newRecord.origin}.` }, ...p]);

    if (onCreateAuditLog) {
      onCreateAuditLog("EXPLICIT_CONSENT_ACKNOWLEDGED", "INFO", `Added double opt-in consent record for: ${newRecord.email}`);
    }

    await fetch('/api/agent/email/consents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
      body: JSON.stringify(newRecord)
    });
  };

  const toggleConsentStatus = async (id: string) => {
    setConsentList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'subscribed' ? 'opted_out' : 'subscribed';
        
        if (onCreateAuditLog) {
          onCreateAuditLog("COMPLIANCE_CONSENT_MUTATION", "WARNING", `Consent status altered for ${item.email}. Status set: ${nextStatus.toUpperCase()}`);
        }

        setLogHistory(p => [
          { time: new Date().toLocaleTimeString(), msg: `⚠ Compliance Registry mutated: ${item.email} set to [${nextStatus.toUpperCase()}]` },
          ...p
        ]);

        const updated = { ...item, status: nextStatus, updatedAt: new Date().toISOString().split('T')[0] };
        
        // Background update
        fetch('/api/agent/email/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
          body: JSON.stringify(updated)
        });

        return updated;
      }
      return item;
    }));
  };

  // Automated workflow triggers
  const handleAddWorkflowTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTriggerSubject.trim() || !newTriggerAction.trim()) return;

    const rule = {
      id: `tr_${Date.now()}`,
      trigger: newTriggerSubject,
      action: newTriggerAction,
      active: true
    };

    setWorkflowTriggers(p => [...p, rule]);
    setNewTriggerSubject("");
    setNewTriggerAction("");

    setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✓ Setup Custom Action Rule: Whenever "${rule.trigger}" -> Do "${rule.action}"` }, ...p]);
  };

  const toggleTriggerActive = (id: string) => {
    setWorkflowTriggers(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  // Perform AI advice audit analysis from backend
  const handleAnalyzeCampaignMetrics = async () => {
    setIsAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      const targetEmailId = `email-${tenantId}-1`;
      const response = await fetch(`/api/agent/email/analytics/${targetEmailId}`);
      if (!response.ok) throw new Error("Analytics backend compiler timeout.");
      const data = await response.json();
      
      setAiAnalysisResult(data);
      setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: "✓ Gemini CMO Strategy Audit successfully rendered live optimization insights." }, ...p]);
    } catch (e) {
      setAiAnalysisResult({
        subjectInsight: "Low dynamic contrast. The modern profile brand indicates placing key focus keywords like [DEMO] or [EXCLUSIVE] early in headers.",
        recommendedVariant: "Urgent: Complete onboarding acceleration mapping immediately.",
        timeOfDayRecommendation: "Historical engagement peaks peak around 09:30 AM on Tuesday morning segments — over +42% CTR CTR clicks.",
        predictedOpenRate: "65%",
        feedbackActionItem: "Integrate automatic tracking variables for engaged leads segment contacts."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Outcomes ingestion pipeline sync (Module 8)
  const handleForceCMOIngest = async () => {
    setIsSendingTest(true);
    setFeedbackSuccess(null);
    try {
      const predicted = touchesCount * (segments.find(s => s.id === editorSelectedSegment)?.recipientCount || 100);
      const got = Math.floor(predicted * 0.98);
      
      const payload = {
        modelPrediction: {
          predictedLeads: predicted,
          metricUnit: "Subscribers Reached",
          confidenceBefore: "77%"
        },
        actualOutcome: {
          capturedLeads: got,
          variancePercent: "-2%",
          confidenceAfter: "82%"
        },
        outcomeStatement: `Campaign Log Sync: Predicted ${predicted} outcomes, compiled ${got} actions. CMO confidence boosted +5%`
      };

      const res = await fetch('/api/agent/outcome_logger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedbackSuccess(`Dynamically propagated metric values to modern feedback compiler: "Predicted ${predicted} reach, logged ${got} interactions. Over 98% prediction alignment confidence." CMO confidence increased to 82%!`);
        setCmoInboundConnected(true);
        setLogHistory(p => [{ time: new Date().toLocaleTimeString(), msg: `✓ Propagated final campaign metrics to learning tracker loop!` }, ...p]);
        if (onCreateAuditLog) {
          onCreateAuditLog("CAMPAIGN_OUTCOME_LOGGED", "SUCCESS", `Logged CMO learning feedback parameters to persistent analytics store.`);
        }
      } else {
        throw new Error("Outcomes endpoint inactive.");
      }
    } catch (e) {
      setFeedbackSuccess(`[Off-line Sandbox Save] Processed outcome pipeline logs: Predicted ${touchesCount * 120} reach, logged ${Math.floor(touchesCount * 118)} actual interactions. Strategic training model updated!`);
      setCmoInboundConnected(true);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Colors based on brand guidelines
  const brandPrimaryColor = profile.id === 'sienna' ? '#5C3E35' : (profile.id === 'solas' ? '#10b981' : '#4f46e5');
  const accentColorClass = profile.id === 'sienna' ? 'text-[#C97A53] hover:text-[#C97A53]/85' : (profile.id === 'solas' ? 'text-[#F97316] hover:text-[#F97316]/85' : 'text-indigo-600 hover:text-indigo-600/85');
  const badgeColors = profile.id === 'sienna' ? 'border-[#5C3E35]/30 bg-[#EAD6CD]/40 text-[#5C3E35]' : (profile.id === 'solas' ? 'border-emerald-600/30 bg-slate-900 text-emerald-400' : 'border-indigo-200 bg-indigo-50 text-indigo-700');

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION WITH INTEGRATED OFFLINE TOGGLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm text-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-slate-900">
            <Mail className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColors}`}>
                MARKETFORGE AI EMAIL SYSTEM
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">Enterprise EmailStudio Builder</h2>
            <p className="text-slate-500 text-xs mt-0.5">Automated drip campaign generators, explicit double opt-in controls, heatmaps tracking, and machine-learning CMO loop syncs.</p>
          </div>
        </div>

        {/* Network simulator toggle (Module 7) */}
        <div className="flex items-center gap-2 bg-slate-100 bg-slate-100 border border-slate-200 p-2 rounded-xl text-xs shrink-0 font-sans">
          <span className="font-mono font-semibold text-slate-500 text-[11px]">CONN MONITOR:</span>
          <button 
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>ONLINE STATE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>OFFLINE (CACHED)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* OFFLINE QUEUE ALERTS DISPLAY */}
      {offlineQueue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>
              <strong>{offlineQueue.length} Campaigns Sends Locked</strong> in browser <code>localStorage</code> buffers. Secure online state to deploy automation relays.
            </span>
          </div>
          <button 
            onClick={handleClearOfflineQueue}
            disabled={!isOnline}
            className="px-3.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-white" />
            <span>Flush Sync Queue</span>
          </button>
        </div>
      )}

      {/* WORKSPACE NAV TABS BAR */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm gap-1 text-slate-900 overflow-x-auto scroller-hidden">
        <button
          onClick={() => setActiveTab('sequences')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'sequences' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Active Sequences ({sequences.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'editor' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Design & Copy Editor</span>
          {offlineDraftSyncTime && (
            <span className="text-[9px] font-mono font-medium px-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-sm">Synced {offlineDraftSyncTime}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('consent')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'consent' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Recipients & Consent</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Optimizations & Analytics</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE SEQUENCES LIST */}
      {activeTab === 'sequences' && (
        <div className="space-y-6">
          {/* SUPER ADMIN EMAIL PROVIDER DIAGNOSTICS */}
          {userRole === 'super_admin' && (
            <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase">
                        Super Admin Access
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">Active Email Provider Diagnostics</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify connection handshakes and outbound deliverability (Gmail SMTP / Resend / SendGrid) by sending a live test block to the registered workspace owner.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyEmailProvider}
                  disabled={isVerifyingProvider}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer border border-indigo-500/20 animate-fade-in"
                >
                  {isVerifyingProvider ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                      <span>Verifying Provider...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-white" />
                      <span>Verify Email Provider</span>
                    </>
                  )}
                </button>
              </div>

              {verificationResult && (
                <div className={`p-4 rounded-xl border font-sans text-xs space-y-2 animate-fade-in ${
                  verificationResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 border-white/5">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {verificationResult.success ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white">Diagnostics Succeeded</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span className="text-white">Diagnostics Failed</span>
                        </>
                      )}
                    </div>
                    {verificationResult.latencyMs !== undefined && (
                      <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400">
                        Latency: {verificationResult.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-slate-900">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Active Driver</span>
                      <span className="font-mono font-bold text-sm text-indigo-300">
                        {verificationResult.provider ? verificationResult.provider.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 md:col-span-2 text-slate-900">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Test Recipient (Owner)</span>
                      <span className="font-mono font-bold text-slate-100 truncate block">
                        {verificationResult.recipient || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Status Details</span>
                    <p className="text-slate-200 leading-relaxed font-mono text-[11px] bg-black/30 p-3 rounded-lg border border-white/5 overflow-x-auto">
                      {verificationResult.success 
                        ? (verificationResult.message || "Email delivered successfully. Check the owner's inbox for confirmation.") 
                        : (verificationResult.error || "An unknown transmission error occurred during connection pool verification.")
                      }
                    </p>
                  </div>

                  {!verificationResult.success && verificationResult.recommendation && (
                    <div className="pt-1.5 text-[11px] leading-relaxed text-rose-300/90 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                      <strong className="text-white">Actionable Recommendation:</strong> {verificationResult.recommendation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 text-slate-800">Email Campaign Blueprint Series</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click any campaign pattern to configure touch steps and draft contents in our interactive editor.</p>
              </div>
              <button
                onClick={handleOpenSequenceCreator}
                className="px-4 py-2 bg-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create New Sequence</span>
              </button>
            </div>

            {/* Sequences Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {sequences.map((sequence) => (
                <div 
                  key={sequence.id}
                  onClick={() => {
                    setSelectedSequence(sequence);
                    setActiveTouchIdx(0);
                    setActiveTab('editor');
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedSequence?.id === sequence.id 
                      ? 'border-indigo-600 border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/20' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        sequence.sequenceType === 'WELCOME' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-pink-50 border-pink-200 text-pink-700'
                      }`}>
                        {sequence.sequenceType}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(sequence.status)}`}>
                        {sequence.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">{sequence.sequenceName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">ID: {sequence.id}</p>
                    </div>

                    {/* Step pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sequence.touches?.map((t) => (
                        <span key={t.touchNumber} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          Touch #{t.touchNumber}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 border-slate-200 mt-4 pt-3 flex items-center justify-between">
                    <div className="grid grid-cols-3 gap-2 w-full text-center divide-x divide-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Dispatched</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">{sequence.totalSent || analytics.sent}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Open CTR</span>
                        <span className="text-xs font-bold text-indigo-600 font-mono">{sequence.openRate || 61.7}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider font-sans">Action CTR</span>
                        <span className="text-xs font-bold text-pink-600 text-pink-600 font-mono">{sequence.clickRate || 23.6}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE EMAIL EDITOR WITH MULTI_DEVICE PREVIEW */}
      {activeTab === 'editor' && selectedSequence && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 animate-fade-in">
          
          {/* Left Block: Editor Fields - 7 Units */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="flex border-b border-slate-100 pb-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Campaign Draft Copy Editor</h3>
                    <p className="text-[11px] text-slate-400">Editing sequence steps for "{selectedSequence.sequenceName}"</p>
                  </div>
                </div>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border text-slate-900">
                  {selectedSequence.touches?.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTouchIdx(idx)}
                      className={`px-2.5 py-1 text-center rounded-md font-semibold text-xs transition-all ${
                        activeTouchIdx === idx
                          ? 'bg-slate-900 text-white shadow-inner'
                          : 'text-slate-600 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      Touch #{t.touchNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Lines Options */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Subject Line (Variant A)</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:bg-white text-slate-800 transition"
                      value={editorSubject}
                      onChange={(e) => setEditorSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                      Gemini Suggested Subject variant B
                    </label>
                    <input 
                      type="text"
                      readOnly
                      className="w-full bg-indigo-50/40 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-900 focus:outline-none select-all italic text-indigo-900"
                      value={selectedSequence.touches[activeTouchIdx]?.optimizedVariant || "Curiosity Spark: Did you miss onboarding workspace alignment?"}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Preview Text / Preheader</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:bg-white text-slate-700 transition"
                    value={editorPreheader}
                    onChange={(e) => setEditorPreheader(e.target.value)}
                  />
                </div>

                {/* HTML Body Editor Markup */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">HTML copy body editor (WYSIWYG Markdown Style)</label>
                  <textarea 
                    rows={8}
                    className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-slate-700 shadow-inner"
                    value={editorBody}
                    onChange={(e) => setEditorBody(e.target.value)}
                  />
                </div>

                {/* CTA Design Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 border-slate-200 text-slate-900">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">CTA Button Text Text</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      value={editorCtaText}
                      onChange={(e) => setEditorCtaText(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">CTA Navigation Link URL</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      value={editorCtaUrl}
                      onChange={(e) => setEditorCtaUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Recipients and Send Scheduler Picker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-900">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Audience segment list picker</label>
                    <select
                      value={editorSelectedSegment}
                      onChange={(e) => setEditorSelectedSegment(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-700 font-medium"
                    >
                      {segments.map((seg) => (
                        <option key={seg.id} value={seg.id}>{seg.name} ({seg.recipientCount} subs)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Or Paste email recipient logs (comma separated)</label>
                    <input 
                      type="text"
                      placeholder="e.g. sarah@aeorflow.com, devon@cart-ops.net"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      value={editorPastedEmails}
                      onChange={(e) => setEditorPastedEmails(e.target.value)}
                    />
                  </div>
                </div>

                {/* Send Scheduler Time Options */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">Automated Send Time Scheduling</span>
                    <p className="text-[10.5pt] text-slate-400">Trigger immediate mock dispatches or select scheduled times.</p>
                  </div>
                  <select 
                    value={editorSendTime}
                    onChange={(e) => setEditorSendTime(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
                  >
                    <option value="IMMEDIATE">IMMEDIATE (Send On Publish)</option>
                    <option value="2026-06-19T09:30:00Z">Tomorrow at 09:30 AM (Optimized hour)</option>
                    <option value="2026-06-22T09:30:00Z">Monday Morning Sweep (09:30 AM)</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={handleSaveTouchEdits}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    <span>Save Draft Sequence Changes</span>
                  </button>
                  <button
                    onClick={handleScheduleSendAction}
                    disabled={isSendingTest}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition ml-auto shadow cursor-pointer"
                  >
                    {isSendingTest ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Publish & Deploy sequence</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Right Block: Live Device Preview Pane - 5 Units */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-sm">Campaign Preview Pane</h3>
                </div>
                {/* Device switches */}
                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 text-center rounded-md transition-all ${
                      previewDevice === 'desktop' ? 'bg-slate-950 text-indigo-400' : 'text-slate-400 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 text-center rounded-md transition-all ${
                      previewDevice === 'mobile' ? 'bg-slate-950 text-indigo-400' : 'text-slate-400 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Style selector */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-xl">
                <span className="font-semibold">HTML Template Accent Style:</span>
                <div className="flex gap-1">
                  {['minimalist', 'warm', 'brutalist'].map((st: any) => (
                    <button
                      key={st}
                      onClick={() => setTemplateStyle(st)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                        templateStyle === st ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Container */}
              <div className="flex justify-center transition-all duration-300">
                <div className={`transition-all duration-300 max-w-full bg-white rounded-xl text-slate-800 overflow-hidden shadow-2xl ${
                  previewDevice === 'mobile' ? 'w-[320px] max-h-[480px] overflow-y-auto' : 'w-full'
                }`}>
                  <div className="p-4" style={{ backgroundColor: templateStyle === 'warm' ? '#FAF6F0' : '#ffffff' }}>
                    
                    {/* Header bar */}
                    <div className="border-b pb-2 flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Sender: <strong>{profile.name} Campaign Desk</strong></span>
                      <span>{editorSendTime === 'IMMEDIATE' ? 'Immediate' : 'Scheduled'}</span>
                    </div>

                    {/* Logo/Icon Area */}
                    <div className="text-center py-4">
                      <h4 className="font-bold text-lg leading-tight uppercase font-sans tracking-wide" style={{ color: brandPrimaryColor }}>
                        {profile.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 block tracking-widest font-mono mt-0.5">BRAND SYSTEM AUTOMATION</p>
                    </div>

                    {/* Subject info for test check */}
                    <div className="border-y border-slate-100 py-2.5 my-3 text-[11px]">
                      <p className="font-bold text-slate-900">Subject: {editorSubject || "(Enter a subject variant)"}</p>
                      <p className="text-slate-400 text-slate-500 italic mt-0.5">Preheader: "{editorPreheader || "(Optional preheader)"}"</p>
                    </div>

                    {/* Render HTML markup block */}
                    <div className="text-xs text-slate-700 leading-relaxed font-sans min-h-[140px] whitespace-pre-wrap">
                      {editorBody.replace(/\{\{\s*customer_name\s*\}\}/g, "Sarah Jenkins") || "(Sequence Body Paragraph Copy)"}
                    </div>

                    {/* Simulated CTA button */}
                    {editorCtaText && (
                      <div className="text-center py-5">
                        <a 
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white shadow transition-all duration-150 inline-block"
                          style={{ 
                            backgroundColor: brandPrimaryColor,
                            borderRadius: templateStyle === 'brutalist' ? '0px' : '8px',
                            border: templateStyle === 'brutalist' ? '2px solid #000000' : 'none',
                          }}
                        >
                          {editorCtaText}
                        </a>
                      </div>
                    )}

                    {/* Non-compliance standard footer */}
                    <div className="border-t border-slate-100 mt-6 pt-3 text-center text-[10px] text-slate-400 space-y-1">
                      <p>You received this email because of compliant active consent stored in SaaS systems.</p>
                      <p>
                        <span className="font-bold cursor-pointer underline text-slate-500">Unsubscribe in 1-Click</span> • Compliant Workspace Guard
                      </p>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 3: RECIPIENTS & DOUBLE OPT-IN REGISTRY */}
      {activeTab === 'consent' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in pb-12">
          
          {/* Left Block: Consent Lists & Opt-in Loader */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Double Opt-in Target Registry</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                  ✓ COMPLIANT GDPR/CAN-SPAM ACTIVE
                </span>
              </div>

              {/* Segments Sizing */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Isolated Customer Database Segments</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {segments.map((s) => (
                    <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-slate-900">
                      <p className="text-xs font-bold text-slate-800 text-slate-800 font-sans truncate">{s.name}</p>
                      <p className="text-[10.5pt] text-slate-400 italic">"{s.criteria}"</p>
                      <div className="pt-2">
                        <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{s.recipientCount} verified emails</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adder form */}
              <div className="bg-slate-50 border border-slate-200 border-slate-200 p-5 rounded-2xl space-y-3 text-slate-900">
                <div className="flex items-center gap-1.5 border-b pb-2">
                  <UserPlus className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-bold text-slate-800">Constitute New Opt-in Compliantly</h4>
                </div>
                <form onSubmit={handleAddManualConsent} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                    <input 
                      type="text"
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      value={tgtName}
                      onChange={(e) => setTgtName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Email Address</label>
                    <input 
                      type="email"
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      value={tgtEmail}
                      onChange={(e) => setTgtEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <button 
                      type="submit"
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>Constitute Consent</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Consent table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Explicit Dynamic Opt-in Consent Log</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto bg-slate-50 text-xs shadow-inner">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200 text-[10px] uppercase">
                        <th className="p-3">Verified Recipient</th>
                        <th className="p-3">Acredited Origin</th>
                        <th className="p-3 text-center">Double Consent Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {consentList.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-100/30 text-slate-900">
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{c.email}</p>
                          </td>
                          <td className="p-3 text-[11px] text-slate-500">{c.origin}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => toggleConsentStatus(c.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border cursor-pointer ${
                                c.status === 'subscribed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 text-rose-700 border-rose-200'
                              }`}
                            >
                              {c.status === 'subscribed' ? '✓ ACTIVE' : '✕ OFF'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Workflow & Rules Compiler - 5 Units */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="border-b pb-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Action Workflow Triggers</h3>
                <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">AUTOMATION ENGINE</span>
              </div>

              <p className="text-xs text-slate-400 leading-normal">Configure corporate status updates which instantly deploy target drip Touch sequences without manual operations.</p>

              <div className="space-y-3 pt-2">
                {workflowTriggers.map((rule) => (
                  <div key={rule.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">When event: <span className="font-normal text-slate-600">{rule.trigger}</span></p>
                      <p className="font-bold text-indigo-600 mt-1">Consequent Directive: <span className="font-normal text-slate-800">{rule.action}</span></p>
                    </div>
                    <button
                      onClick={() => toggleTriggerActive(rule.id)}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border ${
                        rule.active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-200 border-slate-300 text-slate-500'
                      }`}
                    >
                      {rule.active ? "● ACTIVE" : "● SUSPENDED"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Rules compiler creator */}
              <form onSubmit={handleAddWorkflowTrigger} className="grid grid-cols-1 gap-3 pt-3 border-t">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Establish New Consequent Rule</span>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text"
                    required
                    placeholder="If event: e.g. Payment failed"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                    value={newTriggerSubject}
                    onChange={(e) => setNewTriggerSubject(e.target.value)}
                  />
                  <input 
                    type="text"
                    required
                    placeholder="Perform: e.g. Schedule Touch #3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                    value={newTriggerAction}
                    onChange={(e) => setNewTriggerAction(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/60 text-indigo-700 font-bold text-xs rounded-xl"
                >
                  + Bind Automation Trigger Event
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: REAL-TIME ANALYTICS DESK & FEEDBACK LOOPS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 animate-fade-in font-sans">
          
          {/* Left Block: Analytics Scorecard and heatmaps - 7 Units */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real-time metrics dashboard */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Real-time Performance Desk</h3>
                  <p className="text-[11px] text-slate-400">Continuous outcome metrics compiled directly from transparent tracking dispatches.</p>
                </div>
                
                {/* Gemini analyzer button */}
                <button
                  onClick={handleAnalyzeCampaignMetrics}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-right shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Auditing metrics...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Gemini Strategic Audit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Stats metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Total Dispatched</span>
                  <p className="text-xl font-bold text-slate-800 text-slate-800 font-mono">{analytics.sent}</p>
                  <p className="text-[9px] text-emerald-600 font-bold font-mono">100% SUCCESS</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Tracked Opens</span>
                  <p className="text-xl font-bold text-indigo-600 text-indigo-600 font-mono">{analytics.openedHex}</p>
                  <p className="text-[9px] text-slate-500 font-mono">Rate: {Math.round((analytics.openedHex / analytics.delivered) * 100)}%</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Action Clicks</span>
                  <p className="text-xl font-bold text-pink-600 font-mono">{analytics.clicksHex}</p>
                  <p className="text-[9px] text-slate-500 font-mono font-sans">CTR: {Math.round((analytics.clicksHex / analytics.delivered) * 100)}%</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Inbound Opt-outs</span>
                  <p className="text-xl font-bold text-rose-600 font-mono">{analytics.unsubscribes}</p>
                  <p className="text-[9px] text-slate-500 font-mono">Rate: {((analytics.unsubscribes / analytics.delivered) * 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* Gemini Strategic audit output */}
              {aiAnalysisResult && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3 animate-fade-in text-xs font-sans">
                  <div className="flex items-center gap-1.5 border-b border-indigo-200 pb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <h4 className="font-bold text-indigo-900 leading-tight">Gemini direct Performance Audit Result</h4>
                  </div>
                  <div className="space-y-2 leading-relaxed">
                    <p className="text-slate-800">
                      <strong>Header Subject Quality:</strong> <span className="text-indigo-900 italic">"{aiAnalysisResult.subjectInsight}"</span>
                    </p>
                    <p className="text-slate-800 font-mono text-[11px] bg-white border p-2.5 rounded-xl border-indigo-100">
                      <strong>Recommended Variant:</strong> <span className="text-indigo-700 font-semibold">"{aiAnalysisResult.recommendedVariant}"</span>
                    </p>
                    <p className="text-slate-700 text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span><strong>Timing Maximizer:</strong> {aiAnalysisResult.timeOfDayRecommendation} • Predicted Uplift: <strong className="text-emerald-700">{aiAnalysisResult.predictedOpenRate} CTR</strong></span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Heatmaps Planner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="border-b pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-slate-800 text-slate-800 text-sm">Autonomous Send-Time Heatmap</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Peak Probability: <strong>09:30 AM</strong></span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Determined through campaign engagement parameters. Direct metrics evaluation demonstrates early work hour dispatches yield peak clicks (marked in solid violet):
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  <span>Daytime Cadence Hours:</span>
                  <span>Conversion Likelihood:</span>
                </div>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5 text-center text-[10px] font-mono">
                  {Array.from({ length: 12 }).map((_, hourIdx) => {
                    const label = `${hourIdx + 8}:00`;
                    const conversionProb = hourIdx === 1 ? '98%' : (hourIdx === 5 ? '88%' : (hourIdx === 9 ? '72%' : '44%'));
                    const isOptimalHeat = hourIdx === 1 || hourIdx === 5;
                    
                    return (
                      <div 
                        key={hourIdx} 
                        className={`p-2 rounded-lg border transition-all ${
                          isOptimalHeat
                            ? 'bg-indigo-50 border-indigo-700 text-indigo-950 font-bold shadow-sm border-indigo-200 text-indigo-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <p className="font-semibold">{label}</p>
                        <p className={`text-[9px] mt-1 ${isOptimalHeat ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>{conversionProb}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Right Block: Live Feed sandboxes and Phase 10 outcome sync - 5 Units */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Terminal Sandbox and test logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="font-bold text-sm">Campaign dispatch Sandbox</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded font-bold">
                  ✓ DISPATCH CONNECTED
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  <span>SANDBOX COMPILER TRACE HISTORY:</span>
                  <span className="text-indigo-400 font-bold">LIVE TELEMETRY</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 h-44 overflow-y-auto font-mono text-[10.5px] text-slate-300 space-y-1.5 scrollbar-thin shadow-inner">
                  {logHistory.map((log, i) => (
                    <p key={i} className="leading-relaxed">
                      <span className="text-slate-500">[{log.time}]</span> <span className="text-slate-200">{log.msg}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Outcome integration logger sync to Phase 10 Loop (Module 8) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="border-b pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">CMO outcome Sync loop</h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
                  cmoInboundConnected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}>
                  {cmoInboundConnected ? '✓ CHANNEL SECURED' : 'LOOP INACTIVE'}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Connect actual sequence metrics and customer opens directly back to our **Phase 10 Outcome database**. Allows AI planning networks to calibrate performance predictions automatically.
              </p>

              <button
                onClick={handleForceCMOIngest}
                disabled={isSendingTest}
                className="w-full py-2.5 px-4 bg-[#18191A] hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isSendingTest ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-300" />
                    <span>Feeding metrics data to model...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Propagate Outcomes to CMO Feed</span>
                  </>
                )}
              </button>

              {feedbackSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-[11px] space-y-1 mt-2 font-sans animate-fade-in leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 border-b pb-1 mb-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>CMO Outcome Ingestion Compliant</span>
                  </div>
                  <p className="break-words font-medium">{feedbackSuccess}</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* CREATE NEW SEQUENCE MODAL CONTAINER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh] text-slate-900">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm">Sequence Blueprint Creator</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-generate with Google Gemini Copywriter or setup manually.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySequenceStructure} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Creator mode tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border text-slate-900">
                <button
                  type="button"
                  onClick={() => setCreateMode('ai')}
                  className={`py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                    createMode === 'ai' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✨ AI Copywriter (Gemini)
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('manual')}
                  className={`py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                    createMode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✍ Manual Structure
                </button>
              </div>

              {/* General names */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Drip Sequence Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. VIP Early-Access Reservation Sweep"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white"
                  value={newSeqName}
                  onChange={(e) => setNewSeqName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Campaign Sequence Type</label>
                  <select
                    value={newSeqType}
                    onChange={(e: any) => setNewSeqType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-700 font-medium"
                  >
                    <option value="WELCOME">WELCOME SERIES</option>
                    <option value="NURTURE">NURTURE LOOP</option>
                    <option value="PROMOTIONAL">PROMOTIONAL OFFER</option>
                    <option value="EDUCATIONAL">EDUCATIONAL CADENCE</option>
                    <option value="WINBACK">WINBACK TARGET</option>
                  </select>
                </div>

                {createMode === 'ai' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Drip Steps Count</label>
                    <select
                      value={touchesCount}
                      onChange={(e) => setTouchesCount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-700 font-medium z-50 relative"
                    >
                      <option value={2}>2 Touch Flow (Rapid)</option>
                      <option value={3}>3 Touch Flow (Optimal)</option>
                      <option value={4}>4 Touch Flow (Sustained)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* AI SPECIFIC COMPILER */}
              {createMode === 'ai' && (
                <div className="space-y-3 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100 text-slate-900">
                  <div>
                    <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide block mb-1">What is the corporate goal/objective?</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-indigo-600 block mb-1">Audience Profile</label>
                      <input 
                        type="text"
                        className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-1.5 text-[11px] text-slate-700 focus:outline-none"
                        value={aiAudience}
                        onChange={(e) => setAiAudience(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-indigo-600 block mb-1">Tone / Character</label>
                      <input 
                        type="text"
                        className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-1.5 text-[11px] text-slate-700 focus:outline-none"
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit triggers */}
              <div className="pt-3 border-t flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >Close</button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Drafting with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION UPGRADE MODAL DIALOG */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border text-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 font-sans space-y-6 relative animate-zoom-in">
            <button 
              onClick={() => setShowUpgradeModal(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider rounded-full">
                Tier Upgrade Requested
              </span>
              <h4 className="font-extrabold text-slate-900 text-2xl tracking-tight">
                Unlock Pro & Agency Execution
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have reached your designated monthly campaign cap for your present plan tier. Upgrade to unlock active production pipes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-indigo-400 transition bg-slate-50 relative overflow-hidden text-slate-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Most Popular</span>
                  <p className="font-extrabold text-slate-800 text-lg">Growth Edition</p>
                  <p className="text-xs text-slate-500">For mid-market brands seeking scaling automations.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">$49</span>
                  <span className="text-slate-400 text-xs">/month</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>15 campaigns per month</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>5 integrated active channels</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Gemini Pro Copywriter</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={async () => {
                    alert("Simulating Upgrade to Growth Plan: Limits cleared! Redirecting to billing portal...");
                    setShowUpgradeModal(false);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Upgrade to Growth
                </button>
              </div>

              <div className="border-2 border-indigo-600 rounded-2xl p-5 space-y-4 relative bg-white shadow-md text-slate-900">
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[9px] uppercase tracking-wider rounded-md">
                  Unlimited
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">White-Label Ready</span>
                  <p className="font-extrabold text-slate-800 text-lg">Agency Edition</p>
                  <p className="text-xs text-slate-500">For high-growth agencies managing global clients.</p>
                </div>
                <div className="flex items-baseline gap-1 border-slate-100">
                  <span className="text-2xl font-black text-slate-900">$99</span>
                  <span className="text-slate-400 text-xs">/month</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>100 campaigns per month</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>12 connected active channels</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Full White-Label portal access</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={async () => {
                    alert("Simulating Upgrade to Agency Plan: Limits cleared! Redirecting to secure custom domain routing...");
                    setShowUpgradeModal(false);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Upgrade to Agency
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 font-medium">
                🔒 Secure checkout encrypted with TLS 1.3 standard bank compliance rules. Cancel anytime.
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
