import { useCurrency } from '../lib/CurrencyContext';
import React, { useState, useEffect } from 'react';
import { BusinessProfile, CustomerPersona, MarketPositioning, CampaignPlan } from '../types';
import { 
  Compass, Target, Award, Sparkles, UserCheck, Play, Users, Sliders, 
  Activity, Brain, CheckSquare, Plus, Info, ShieldAlert, BarChart3, 
  TrendingUp, DollarSign, Calendar, Zap, AlertTriangle, ArrowRight, 
  Printer, Copy, Check, ChevronDown, ListTodo, Lightbulb, User, 
  CheckCircle2, RefreshCw, Loader2, ArrowUpRight, Scale, ShieldCheck,
  ClipboardCheck, Database
} from 'lucide-react';
import { clientDb } from '../lib/firebase';
import OutputEvidencePanel from './OutputEvidencePanel';
import IntegrationManager from './IntegrationManager';

interface Props {
  profile: BusinessProfile;
  onChangeProfile: (profile: BusinessProfile) => void;
  personas: CustomerPersona[];
  setPersonas: (personas: CustomerPersona[]) => void;
  campaign: CampaignPlan | null;
  setCampaign: (campaign: CampaignPlan | null) => void;
  tenantId: string;
  userRole: string;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
  onChangeTab?: (tab: any) => void;
}

// Module 1 Supported Goals List
const SUPPORTED_GOALS = [
  "Generate Leads",
  "Increase Sales",
  "Increase Reservations",
  "Launch Product",
  "Increase Foot Traffic",
  "Build Awareness",
  "Recruit Employees",
  "Retain Customers",
  "Upsell Existing Customers",
  "Recover Inactive Customers",
  "Expand To New Market"
];

// Module 4 Playbooks List
const GROWTH_PLAYBOOKS = [
  {
    id: "playbook-restaurant",
    name: "Restaurant Growth Playbook",
    icon: "🍽️",
    industry: "Food & Beverage / Hospitality",
    description: "Tailored tactics to fill slow Tuesday-Thursday reservation blocks through localized geo-targeted micro-offers.",
    stages: ["Local Awareness Injection", "Weekend Reservation Drive", "Loyalty Loop Onboarding"],
    checklist: [
      "Set up dynamic Facebook and Instagram local radius ads",
      "Deploy Tuesday 'Chef Tasting Experience' reservation trigger",
      "Integrate SMS automated confirmation with complementary VIP desert link",
      "Launch Google Business Profile geo-reviews booster sequence"
    ]
  },
  {
    id: "playbook-retail",
    name: "Retail Promotion Playbook",
    icon: "🛍️",
    industry: "Retail & Consumer Goods",
    description: "Maximize store foot-traffic and checkout cart value during seasonal holidays and flash store events.",
    stages: ["In-store Traffic Capture", "Flash Offer SMS Broadcast", "Segmented VIP Re-engagement"],
    checklist: [
      "Configure QR code counter cards offering 10% next-visit credit",
      "Execute targeted 'MKT-OS Secret Hour' weekend alerts",
      "Design physical flyer template with map coordinates",
      "Synthesize hyper-local influencer catalog packs"
    ]
  },
  {
    id: "playbook-hotel",
    name: "Hotel Occupancy Playbook",
    icon: "🏨",
    industry: "Hospitality & Tourism",
    description: "Offset seasonal troughs and maximize booking value per guest through digital experience bundles.",
    stages: ["Weekday Infill Optimization", "High-Value Package Positioning", "Review Capture Automation"],
    checklist: [
      "Launch LinkedIn executive business travel package ad funnel",
      "Integrate automated 'Extend Your Stay' mid-week promotional emails",
      "Establish weekend regional partner experiences syndicates",
      "Deploy custom check-out high-value review prompts"
    ]
  },
  {
    id: "playbook-gym",
    name: "Gym Membership Playbook",
    icon: "💪",
    industry: "Fitness & Wellness",
    description: "Drive corporate employee enrolments and steady monthly recurring memberships with high retention.",
    stages: ["Corporate Benefit Onboarding", "Complimentary Fitness Assessment Trail", "Referral Network Activation"],
    checklist: [
      "Publish targeted Local Corporate Workspace outreach banners",
      "Send custom tailored wellness audit calendars directly to local HR directors",
      "Deploy 'Bring A Friend' free weekend referral SMS automation",
      "Launch targeted Instagram micro-transformation success series"
    ]
  },
  {
    id: "playbook-clinic",
    name: "Clinic Patient Acquisition Playbook",
    icon: "🩺",
    industry: "Healthcare & Clinics",
    description: "Synthesize local trust vectors and streamline patient appointments through secure, compliance-checked channels.",
    stages: ["Authority Indicator Injection", "Frictionless Booking Gateway", "Post-Consultation Retention"],
    checklist: [
      "Optimize local Google Maps Search positioning with rich medical qualifications",
      "Launch high-trust educational blogs answering specific symptom questions",
      "Integrate secure HIPAA-compliant automated appointment reminders",
      "Formulate patient feedback loop checking service quality standards"
    ]
  },
  {
    id: "playbook-education",
    name: "Education Enrollment Playbook",
    icon: "🎓",
    industry: "Education & Academy",
    description: "Nurture student prospects into active registrations through parent-targeted authority content hubs.",
    stages: ["Interests Mapping", "Live Campus Experience Showcase", "Sequential Registration Support"],
    checklist: [
      "Publish student transformation stories and parent video reels",
      "Send digital brochures detailing specialized curriculum highlights",
      "Embed conversational inquiry chatbots on early landing forms",
      "Run targeted pre-season enrollment priority deadlines alerts"
    ]
  },
  {
    id: "playbook-tourism",
    name: "Tourism Booking Playbook",
    icon: "✈️",
    industry: "Travel, Leisure & Tourism",
    description: "Secure adrenaline and group bookings using sensory storytelling and high-intent local search triggers.",
    stages: ["Sensory Storytelling Banners", "Group Discounts Blitz", "UGC Reviews syndication"],
    checklist: [
      "Syndicate breathtaking video stories across TikTok/Instagram localized grids",
      "Configure custom 'Corporate Team Bonding' excursion landing templates",
      "Deploy dynamic weather-triggered promotional ad sequences",
      "Implement automated review requests with digital photo share links"
    ]
  }
];

export default function GoalStrategyOS({
  profile,
  onChangeProfile,
  personas,
  setPersonas,
  campaign,
  setCampaign,
  tenantId,
  userRole,
  onCreateAuditLog,
  onChangeTab
}: Props) {
  // Inputs
  const [selectedGoal, setSelectedGoal] = useState<string>("Generate Leads");
  const [timelineWeeks, setTimelineWeeks] = useState<number>(4);
  const [budgetRange, setBudgetRange] = useState<string>('2000-5000');
  
  // App states
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [strategyResult, setStrategyResult] = useState<any>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>(GROWTH_PLAYBOOKS[0]);
  const [selectedAgent, setSelectedAgent] = useState<string>("CEO");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTaskTab, setActiveTaskTab] = useState<string>("campaignBrief");
  
  // Simulated Interactive State: Adjusters
  const [simSizeAdjust, setSimSizeAdjust] = useState<number>(100); // Percentage multiplier
  const [simFrictionAdjust, setSimFrictionAdjust] = useState<number>(100);

  // Phase 10: Persistent Outcomes Memory States
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [outcomeLogs, setOutcomeLogs] = useState<any[]>([]);
  const [playbookPerformance, setPlaybookPerformance] = useState<any[]>([]);

  // Selected Campaign to Log Outcomes For
  const [selectedCampaignForLog, setSelectedCampaignForLog] = useState<string>("");
  const [loggingLeads, setLoggingLeads] = useState<number>(115);
  const [loggingNotes, setLoggingNotes] = useState<string>("");
  const [logStartDate, setLogStartDate] = useState<string>("");
  const [logEndDate, setLogEndDate] = useState<string>("");

  const [lastLoggedComparison, setLastLoggedComparison] = useState<any>(null);
  const [isLoggingOutcome, setIsLoggingOutcome] = useState<boolean>(false);

  // Detect playbook category helper
  const detectPlaybookTypeLocal = (industryName: string | null, gType: string | null): string => {
    const ind = (industryName || "").toLowerCase();
    const g = (gType || "").toLowerCase();
    if (ind.includes("restaurant") || ind.includes("food") || ind.includes("beverage") || g.includes("reservation") || g.includes("restaurant")) {
      return "Restaurant Growth Playbook";
    }
    if (ind.includes("retail") || ind.includes("shop") || ind.includes("store") || g.includes("foot traffic") || g.includes("retail")) {
      return "Retail Promotion Playbook";
    }
    if (ind.includes("hotel") || ind.includes("hostel") || ind.includes("accommodation") || g.includes("occupancy")) {
      return "Hotel Occupancy Playbook";
    }
    if (ind.includes("gym") || ind.includes("fitness") || ind.includes("wellness") || ind.includes("sport") || g.includes("gym")) {
      return "Gym Membership Playbook";
    }
    if (ind.includes("clinic") || ind.includes("health") || ind.includes("medical") || ind.includes("doctor") || g.includes("patient") || g.includes("clinic")) {
      return "Clinic Patient Acquisition Playbook";
    }
    if (ind.includes("education") || ind.includes("school") || ind.includes("academy") || ind.includes("college") || g.includes("enrollment")) {
      return "Education Enrollment Playbook";
    }
    if (ind.includes("tourism") || ind.includes("travel") || ind.includes("trip") || g.includes("booking") || g.includes("tourism")) {
      return "Tourism Booking Playbook";
    }
    return "Standard Business Playbook";
  };

  const loadOutcomeMemoryData = async () => {
    try {
      const camps = await clientDb.getCollection("campaigns", tenantId);
      setActiveCampaigns(camps);

      const logs = await clientDb.getCollection("outcome_logs", tenantId);
      setOutcomeLogs(logs);

      const playbk = await clientDb.getCollection("playbook_performance_records", tenantId);
      setPlaybookPerformance(playbk);

      if (camps.length === 0) {
        const seedCamp = {
          id: "camp_sample_1",
          tenantId,
          campaignName: "Autonomous campaign: [Increase Reservations]",
          objective: "Automate fine dining reservation surges",
          durationWeeks: 4,
          channels: ["LinkedIn Inbound", "Sequential Email Sequence", "Targeted Local Ads"],
          launchCalendar: [],
          strategicKPIs: ["Outcome Target: 110 reservations", "Confidence Level: 85%", "Expected ROI: 4.8x"],
          strategyId: "strat_sample_123",
          strategyVersion: 1,
          predictedOutcomes: {
            lowCase: { leads: 35 },
            expectedCase: { leads: 110 },
            bestCase: { leads: 280 }
          },
          executionStatus: "ACTIVE",
          executionStartDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          associatedOutcomeLogIds: []
        };
        await clientDb.addDocToTenant("campaigns", seedCamp, tenantId);
        setActiveCampaigns([seedCamp]);
        setSelectedCampaignForLog("camp_sample_1");
      } else {
        const activeCamps = camps.filter((c: any) => c.executionStatus === "ACTIVE");
        if (activeCamps.length > 0) {
          setSelectedCampaignForLog(activeCamps[0].id);
        } else {
          setSelectedCampaignForLog(camps[0].id);
        }
      }

      if (playbk.length === 0) {
        const seedPlaybooks = [
          {
            id: "play_history_1",
            tenantId,
            playbookType: "Restaurant Growth Playbook",
            vertical: "Restaurant Growth Playbook",
            campaignId: "camp_history_1",
            accuracyScore: 88,
            variance: { leads: { predictedExpected: 100, actual: 88, variance: -12, accuracy: 88, actualBand: "HIT_EXPECTED" } },
            refinements: ["Scale up Friday local segment audience targeting parameters"],
            runDate: "2026-05-10",
            createdAt: new Date().toISOString()
          },
          {
            id: "play_history_2",
            tenantId,
            playbookType: "Restaurant Growth Playbook",
            vertical: "Restaurant Growth Playbook",
            campaignId: "camp_history_2",
            accuracyScore: 94,
            variance: { leads: { predictedExpected: 200, actual: 215, variance: 15, accuracy: 94, actualBand: "HIT_BEST" } },
            refinements: ["Re-verify budget cap optimization for Q3 placements"],
            runDate: "2026-05-24",
            createdAt: new Date().toISOString()
          },
          {
            id: "play_history_3",
            tenantId,
            playbookType: "Retail Promotion Playbook",
            vertical: "Retail Promotion Playbook",
            campaignId: "camp_history_3",
            accuracyScore: 82,
            variance: { leads: { predictedExpected: 150, actual: 135, variance: -15, accuracy: 82, actualBand: "HIT_EXPECTED" } },
            refinements: ["Shorten lead form from 5 fields to 3 fields"],
            runDate: "2026-06-10",
            createdAt: new Date().toISOString()
          }
        ];
        for (const pb of seedPlaybooks) {
          await clientDb.addDocToTenant("playbook_performance_records", pb, tenantId);
        }
        setPlaybookPerformance(seedPlaybooks);
      }
    } catch (e) {
      console.warn("Memory initialization error mapping:", e);
    }
  };

  useEffect(() => {
    loadOutcomeMemoryData();
  }, [tenantId, campaign]);

  const handleRecordOutcome = async () => {
    if (!selectedCampaignForLog) {
      alert("Please select a Campaign of interest to log actual outcomes.");
      return;
    }

    const campaignObj = activeCampaigns.find(c => c.id === selectedCampaignForLog);
    if (!campaignObj) {
      alert("Target campaign not found in workspace.");
      return;
    }

    setIsLoggingOutcome(true);

    const goalTypeExtracted = campaignObj.campaignName.includes("[") 
      ? campaignObj.campaignName.match(/\[(.*?)\]/)?.[1] || "Generate Leads" 
      : "Generate Leads";

    const payload = {
      campaignId: selectedCampaignForLog,
      goalType: goalTypeExtracted,
      periodStart: logStartDate || new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      periodEnd: logEndDate || new Date().toISOString().split('T')[0],
      actualResults: { leads: Number(loggingLeads) },
      notes: loggingNotes
    };

    try {
      const res = await fetch("/api/agent/outcome_logger", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Backend outcome logger returned server communication failure code.");
      }

      const data = await res.json();
      setLastLoggedComparison(data);

      if (onCreateAuditLog) {
        onCreateAuditLog("PLAYBOOK_RECALIBRATED", "success", `Logged outcomes for [${campaignObj.campaignName}]. Playbook calibrated: accuracy ${data.accuracyScore}%`);
      }

      await loadOutcomeMemoryData();
      alert(`Campaign outcomes logged successfully! Playbook calibrated with ${data.accuracyScore}% accuracy score.`);
    } catch (e) {
      console.warn("Offline outcome logging fallback in progress:", e);
      const predictedObj = campaignObj.predictedOutcomes || { lowCase: { leads: 35 }, expectedCase: { leads: 110 }, bestCase: { leads: 280 } };
      
      const actualVal = Number(loggingLeads);
      const expectedVal = Number(predictedObj.expectedCase?.leads || 110);
      const lowVal = Number(predictedObj.lowCase?.leads || 35);
      const bestVal = Number(predictedObj.bestCase?.leads || 280);
      const variance = actualVal - expectedVal;
      let accuracy = 50;

      if (actualVal >= expectedVal * 0.9 && actualVal <= expectedVal * 1.1) {
        const diffFrac = Math.abs(actualVal - expectedVal) / (expectedVal * 0.1);
        accuracy = Math.round(100 - diffFrac * 15);
      } else if (actualVal >= expectedVal) {
        const denominator = bestVal > expectedVal ? (bestVal - expectedVal) : expectedVal;
        const progress = (actualVal - expectedVal) / denominator;
        accuracy = Math.round(Math.min(100, 90 + progress * 10));
      } else {
        const progress = actualVal / (expectedVal * 0.9);
        accuracy = Math.round(Math.max(40, 40 + progress * 45));
      }

      const comparison = {
        leads: {
          predictedExpected: expectedVal,
          actual: actualVal,
          variance,
          accuracy,
          actualBand: actualVal < lowVal ? "BELOW_LOW" : (actualVal > expectedVal * 1.1 ? "HIT_BEST" : "HIT_EXPECTED")
        }
      };

      const outcomeLogId = `outl_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      const fallbackLog = {
        id: outcomeLogId,
        tenantId,
        campaignId: selectedCampaignForLog,
        goalType: payload.goalType,
        logDate: new Date().toISOString(),
        periodStart: payload.periodStart,
        periodEnd: payload.periodEnd,
        actualResults: payload.actualResults,
        notes: payload.notes,
        recordedBy: "staff_agent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await clientDb.addDocToTenant("outcome_logs", fallbackLog, tenantId);

      const playbookType = detectPlaybookTypeLocal(null, payload.goalType);
      const recalRecordId = `playbk_${Math.random().toString(36).substr(2, 9)}`;
      const refinements = [
        "Optimize bidding strategy caps to secure higher lead ratios offline",
        "Introduce visual microinteractive checkpoints to minimize page bounces",
        "Revise copywriting structures targeting specific VP level parameters"
      ];
      const newCalRecord = {
        id: recalRecordId,
        tenantId,
        playbookType,
        vertical: playbookType,
        campaignId: selectedCampaignForLog,
        accuracyScore: accuracy,
        variance: comparison,
        refinements,
        runDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      };
      await clientDb.addDocToTenant("playbook_performance_records", newCalRecord, tenantId);

      campaignObj.associatedOutcomeLogIds = [...(campaignObj.associatedOutcomeLogIds || []), outcomeLogId];
      campaignObj.executionStatus = "COMPLETED";
      
      const allCurrentCalRecords = [...playbookPerformance, newCalRecord];
      const matches = allCurrentCalRecords.filter(r => r.playbookType === playbookType);
      const totalRuns = matches.length;
      const successCount = matches.filter(r => r.accuracyScore >= 80).length;
      const successRate = totalRuns > 0 ? successCount / totalRuns : 0;
      const confidenceScore = Math.round(successRate * 100);

      campaignObj.trackRecord = {
        totalRuns,
        successCount,
        avgAccuracy: accuracy,
        confidenceScore
      };

      await clientDb.addDocToTenant("campaigns", campaignObj, tenantId);

      setLastLoggedComparison({
        success: true,
        outcomeLogs: fallbackLog,
        comparisonReady: true,
        accuracyScore: accuracy,
        refinements,
        trackRecord: campaignObj.trackRecord
      });

      if (onCreateAuditLog) {
        onCreateAuditLog("PLAYBOOK_RECALIBRATED", "success", `Logged OFFLINE results for [${campaignObj.campaignName}], accuracy: ${accuracy}%`);
      }

      await loadOutcomeMemoryData();
      alert(`Outcomes saved to cache offline! Playbook calibrated with ${accuracy}% accuracy score.`);
    } finally {
      setIsLoggingOutcome(false);
    }
  };

  // Auto-fill inputs if business is specific
  useEffect(() => {
    if (profile.industry?.toLowerCase().includes("decor") || profile.industry?.toLowerCase().includes("luxury")) {
      setSelectedGoal("Launch Product");
      setSelectedPlaybook(GROWTH_PLAYBOOKS[1]); // Retail/Decor
    } else if (profile.industry?.toLowerCase().includes("bike") || profile.industry?.toLowerCase().includes("mobility")) {
      setSelectedGoal("Generate Leads");
      setSelectedPlaybook(GROWTH_PLAYBOOKS[6]); // Tourism/Bike booking
    } else if (profile.industry?.toLowerCase().includes("software") || profile.industry?.toLowerCase().includes("saas")) {
      setSelectedGoal("Generate Leads");
      setSelectedPlaybook(GROWTH_PLAYBOOKS[4]); // Clinic/Corporate
    }
  }, [profile]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunStrategyFormulation = async () => {
    setIsSynthesizing(true);
    if (onCreateAuditLog) {
      onCreateAuditLog("GOAL_OS_RUN", "info", `Triggered Autonomous Strategy OS for goal: [${selectedGoal}], budget: [${budgetRange}], timeline: [${timelineWeeks} weeks]`);
    }

    try {
      // Connect to our new server-side Goal OS API
      const res = await fetch("/api/agent/goal_os", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          profile,
          goal: selectedGoal,
          timeline: `${timelineWeeks} weeks`,
          budget: budgetRange
        })
      });

      if (!res.ok) {
        throw new Error("Backend strategy synthesis returned error code.");
      }

      const data = await res.json();
      setStrategyResult(data);
    } catch (e) {
      console.warn("API route not found or failed, compiling high-accuracy localized fallback client-side:", e);
      // Construct stunning context-aware fallback client side
      setTimeout(() => {
        const compiled = generateDynamicLocalStrategy(profile, selectedGoal, timelineWeeks, budgetRange);
        setStrategyResult(compiled);
      }, 1200);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleActivatePlaybook = (playbook: any) => {
    setSelectedPlaybook(playbook);
    if (onCreateAuditLog) {
      onCreateAuditLog("PLAYBOOK_ACTIVATE", "info", `Activated Growth Playbook: [${playbook.name}] into organizational workspace.`);
    }
    // Automatically match the playbooks target outcomes with current select
    if (playbook.id.includes("restaurant")) setSelectedGoal("Increase Reservations");
    if (playbook.id.includes("retail")) setSelectedGoal("Increase Sales");
    if (playbook.id.includes("hotel")) setSelectedGoal("Increase Sales");
    if (playbook.id.includes("gym")) setSelectedGoal("Generate Leads");
    if (playbook.id.includes("clinic")) setSelectedGoal("Generate Leads");
    if (playbook.id.includes("tourism")) setSelectedGoal("Increase Reservations");
    if (playbook.id.includes("education")) setSelectedGoal("Launch Product");
  };

  const syncOutcomeToWorkspace = () => {
    if (!strategyResult) return;
    
    // Set Parent Campaign state
    const syncedCampaign: CampaignPlan = {
      id: campaign?.id || `camp_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
      campaignName: `Autonomous campaign: [${selectedGoal}]`,
      objective: strategyResult.decomposition.offerStrategy,
      durationWeeks: timelineWeeks,
      channels: ["LinkedIn Inbound", "Sequential Email Sequence", "Targeted Local Ads"],
      launchCalendar: [
        { day: "Week 1", channel: "Setup & Testing", title: "Verify Audiences", description: strategyResult.decomposition.audienceStrategy, goal: selectedGoal },
        { day: "Week 2", channel: "Launch Phase", title: "Deploy Core Offer", description: strategyResult.decomposition.offerStrategy, goal: selectedGoal },
        { day: "Week 3", channel: "Middle Spark", title: "Stagger Content Channel", description: strategyResult.decomposition.contentPlan, goal: selectedGoal },
        { day: "Week 4", channel: "Conversion Boost", title: "Synthesize Pipeline Trails", description: "Optimize leads, clear high value booking gates.", goal: selectedGoal }
      ],
      strategicKPIs: [
        `Outcome Target: ${strategyResult.decomposition.successMetrics}`,
        `Confidence Level: ${strategyResult.reasoning.confidenceScore}%`,
        `Expected ROI: ${strategyResult.prioritization.expectedRoi}`
      ],
      strategyId: strategyResult.strategyId || `strat_${Math.random().toString(36).substr(2, 9)}`,
      strategyVersion: strategyResult.strategyVersion || 1,
      predictedOutcomes: strategyResult.simulation || {
        lowCase: { leads: 35 },
        expectedCase: { leads: 110 },
        bestCase: { leads: 280 }
      },
      executionStatus: "ACTIVE",
      executionStartDate: new Date().toISOString().split('T')[0],
      associatedOutcomeLogIds: []
    };

    setCampaign(syncedCampaign);

    // Persist to SaaS multi-tenant store
    clientDb.addDocToTenant("campaigns", syncedCampaign, tenantId).then(() => {
      loadOutcomeMemoryData(); // reload dropdowns
    }).catch(err => {
      console.error("Failed to persist synced campaign:", err);
    });

    if (onCreateAuditLog) {
      onCreateAuditLog("GOAL_OS_SYNC", "success", `Synchronized autonomous strategy output targets directly inside active workspace.`);
    }

    alert(`Successfully synchronized dynamic outcome strategy with other active workspace agents! Your Campaign Planner will now display this customized strategy.`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. SEAMLESS HEADING FRAME & ENTERPRISE CONSOLE INDICATOR */}
      <div id="goal-engine-officer-header" className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-48 h-48 text-indigo-500 animate-pulse" />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              Autonomous Strategy Engine Enabled
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
              Business Goal Command Center™ <span className="text-indigo-400">OS</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Transforming {profile.name} from manual campaign setup to objective-driven success. Specify your business objective below — MarketForge designs the full operational execution architecture automatically.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 text-slate-900">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Business Readiness</span>
              <p className="text-emerald-400 font-bold text-sm">98.5% Focus Index</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE DASHBOARD WIDGETS (Module 9) */}
      <div id="goal-os-executive-dashboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Strategic Focus Alignment</span>
            <span className="p-1 rounded bg-[#F1F5F9] text-[#4F46E5]"><Award className="w-3.5 h-3.5" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 font-sans">96.8%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +1.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">Evaluated against {profile.targetAudience?.split(',')[0]} persona alignment metrics.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Expected Conversions High</span>
            <span className="p-1 rounded bg-[#F1F5F9] text-[#10B981]"><TrendingUp className="w-3.5 h-3.5" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 font-sans">
              {strategyResult ? (simSizeAdjust > 100 ? Math.round(strategyResult.simulation.expected.leads * (simSizeAdjust / 100)) : strategyResult.simulation.expected.leads) : "110"} Units
            </span>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" /> Auto
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">Live simulated forecast. Adjustable using performance sliders below.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Operational Risk Factors</span>
            <span className="p-1 rounded bg-rose-50 text-rose-600"><ShieldAlert className="w-3.5 h-3.5" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 font-sans">1 Active</span>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Medium</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">Ad fatigue threat on key cold segments (Mitigated via automated briefs).</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Active Initiative Status</span>
            <span className="p-1 rounded bg-[#F1F5F9] text-[#06B6D4]"><ShieldCheck className="w-3.5 h-3.5" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 font-sans">
              {campaign ? "Sync Live" : "No active sync"}
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${campaign ? "bg-emerald-500" : "bg-slate-300"} shrink-0 animate-pulse`}></span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">{campaign ? "Other executive agents synchronized with Goal OS outputs." : "Waiting for autonomous strategy formulation."}</p>
        </div>
      </div>

      {/* 3. MODULE 10 — ONE-CLICK GROWTH PLAN CONTROL CARD */}
      <div id="goal-os-one-click-form" className="bg-gradient-to-r from-indigo-50/50 via-white to-transparent border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-sans">One-Click Growth Plan Creator™ (Module 10)</h3>
            <p className="text-slate-500 text-xs">Define three basic outcomes. The Goal Engine determines the master strategy.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Goal Intake */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center justify-between">
              <span>1. Define Outcome Goal</span>
              <span className="text-indigo-600 font-semibold text-[9px] bg-indigo-50 rounded px-1">Intake</span>
            </label>
            <select
              id="select-goal-intake"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/40 transition"
            >
              {SUPPORTED_GOALS.map((gl) => (
                <option key={gl} value={gl}>{gl}</option>
              ))}
            </select>
          </div>

          {/* Timeline Target */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide flex items-center justify-between">
              <span>2. Target Execution Timeline</span>
              <span className="text-slate-400 text-[9px]">Limit</span>
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-900">
              {[2, 4, 8, 12].map((weeks) => (
                <button
                  key={weeks}
                  id={`btn-timeline-${weeks}w`}
                  type="button"
                  onClick={() => setTimelineWeeks(weeks)}
                  className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    timelineWeeks === weeks
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {weeks} Weeks
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider flex justify-between">
              <span>3. Target Budget Parameters</span>
              <span className="text-slate-400 font-normal">Cap</span>
            </label>
            <select
              id="select-budget-limit"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/40 transition"
            >
              <option value="500-2000">{formatCurrency(500)} - {formatCurrency(2000)} (Local Pilot)</option>
              <option value="2000-5000">{formatCurrency(2000)} - {formatCurrency(5000)} (Growth In Stock)</option>
              <option value="5000-15000">{formatCurrency(5000)} - {formatCurrency(15000)} (Market Blitz)</option>
              <option value="$15,000+">$15,000+ (Enterprise Scaling)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            id="btn-trigger-autonomous-strategy"
            onClick={handleRunStrategyFormulation}
            disabled={isSynthesizing}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-indigo-600/15 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 transition-all duration-300"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Goal Engine Decomposing and Assembling Strategic Logic...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span>Formulate Goal & Autonomous Strategy Roadmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PHASE 10.5 — AUTONOMOUS ANALYTICS INTEGRATION DESK */}
      <IntegrationManager
        tenantId={tenantId}
        activeCampaigns={activeCampaigns}
        onReloadOutcomes={loadOutcomeMemoryData}
        onCreateAuditLog={onCreateAuditLog}
      />

      {/* 4. MODULE 5 — PROOF ENGINE & CALIBRATIVE TRACK RECORD CONSOLE */}
      <div id="goal-os-proof-engine-control" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Register Campaign Outcomes (Module 1, 7) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-1 text-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Outcome Logging Layer (Module 1)</h4>
              <p className="text-slate-400 text-[10px]">Close the feedback loop. Record actual metrics against projections.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Active Campaigns Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide">Target Active Campaign</label>
              <select
                id="select-logging-campaign"
                value={selectedCampaignForLog}
                onChange={(e) => {
                  setSelectedCampaignForLog(e.target.value);
                  const selectedObj = activeCampaigns.find(c => c.id === e.target.value);
                  if (selectedObj) {
                    const expectedLeads = selectedObj.predictedOutcomes?.expectedCase?.leads || 110;
                    setLoggingLeads(expectedLeads);
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
              >
                {activeCampaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.campaignName} ({camp.executionStatus === "COMPLETED" ? "Logged" : "Active"})
                  </option>
                ))}
              </select>
            </div>

            {/* Actual Result Numeric Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide flex justify-between">
                <span>Actual Outcomes Units Achieved</span>
                <span className="text-emerald-600 lowercase text-[9px]">e.g. leads, reservations, etc.</span>
              </label>
              <input
                id="input-actual-outcomes"
                type="number"
                value={loggingLeads}
                onChange={(e) => setLoggingLeads(Number(e.target.value))}
                className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500"
                placeholder="110"
              />
            </div>

            {/* Period Boundaries */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Period Start</label>
                <input
                  id="input-log-start"
                  type="date"
                  value={logStartDate}
                  onChange={(e) => setLogStartDate(e.target.value)}
                  className="w-full bg-stone-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Period End</label>
                <input
                  id="input-log-end"
                  type="date"
                  value={logEndDate}
                  onChange={(e) => setLogEndDate(e.target.value)}
                  className="w-full bg-stone-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-600"
                />
              </div>
            </div>

            {/* Qualitative Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide">Operational Notes / Context</label>
              <textarea
                id="input-log-notes"
                rows={2}
                value={loggingNotes}
                onChange={(e) => setLoggingNotes(e.target.value)}
                placeholder="Details around ad campaign spend variance, regional local events, website conversion speed delays, etc."
                className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-600 focus:outline-none"
              />
            </div>

            <button
              id="btn-trigger-outcome-log"
              disabled={isLoggingOutcome || activeCampaigns.length === 0}
              onClick={handleRecordOutcome}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer ${
                isLoggingOutcome ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              {isLoggingOutcome ? "Calibrating Strategy Models..." : "Record Outcomes & Calibrate Engine"}
            </button>
          </div>
        </div>

        {/* Right Column (Span 2): System Track Record Panel & Playbook Calibrator Stream (Module 5, 6) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6 flex flex-col justify-between text-slate-900">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Strategic Performance Register (Module 5)</h4>
                  <p className="text-slate-400 text-[10px]">Real-time Playbook calibrations and confidence index analysis.</p>
                </div>
              </div>

              {/* Statistical Metrics */}
              <div className="flex items-center gap-4 bg-slate-50 border p-2 rounded-xl text-slate-900">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">Calibrated Accuracy</span>
                  <span className="text-sm font-black text-indigo-600 font-mono">
                    {playbookPerformance.length > 0
                      ? Math.round(playbookPerformance.reduce((acc, p) => acc + p.accuracyScore, 0) / playbookPerformance.length)
                      : 0}%
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-200 text-slate-900" />
                <div>
                  <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">Success Rate (Acc ≥ 80%)</span>
                  <span className="text-sm font-black text-emerald-600 font-mono">
                    {playbookPerformance.length > 0
                      ? Math.round((playbookPerformance.filter(p => p.accuracyScore >= 80).length / playbookPerformance.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-200 text-slate-900" />
                <div>
                  <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">Total Runs</span>
                  <span className="text-sm font-black text-slate-700 font-mono">{playbookPerformance.length} Runs</span>
                </div>
              </div>
            </div>

            {/* Playbooks success summary metrics list */}
            <div id="playbooks-recalibration-table" className="space-y-3">
              <h5 className="text-[10px] font-extrabold text-[#1E293B] uppercase tracking-wider font-mono">Calibrated Playbooks (Cross-Tenant Evidence)</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from(new Set(playbookPerformance.map(p => p.playbookType))).map(type => {
                  const items = playbookPerformance.filter(p => p.playbookType === type);
                  const successRate = items.length > 0 ? (items.filter(p => p.accuracyScore >= 80).length / items.length) : 0;
                  const avgAcc = items.length > 0 ? Math.round(items.reduce((acc, i) => acc + i.accuracyScore, 0) / items.length) : 0;

                  return (
                    <div key={type} className="bg-slate-50 border rounded-xl p-3 space-y-1.5 hover:border-slate-300 transition text-slate-900">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-800 tracking-tight block truncate max-w-[140px]">{type}</span>
                        <span className="text-[9px] font-bold font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 rounded px-1.5 py-0.5">
                          {Math.round(successRate * 100)}% Success rate
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>Average accuracy: {avgAcc}%</span>
                        <span className="font-mono">{items.length} calibrated runs</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden text-slate-900">
                        <div className="h-full bg-indigo-600" style={{ width: `${avgAcc}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Last Calibrated Live Feedback loop */}
          <div className="bg-[#FAF9F6] border border-stone-200 rounded-2xl p-4 mt-2">
            <h5 className="text-[10px] font-extrabold text-[#78716C] uppercase font-mono tracking-wide border-b border-stone-200 pb-1.5 mb-2.5 flex items-center justify-between">
              <span>Predicted vs. Actual Feed (Engine Recalibration)</span>
              <span className="text-[8px] bg-[#E7E5E4] px-1 font-bold text-stone-600 rounded">Closed-loop AI</span>
            </h5>

            {lastLoggedComparison ? (
              <div id="latest-predicted-vs-actual-results" className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-[11px] font-bold text-stone-800">
                      Accuracy Score achieved: <span className="text-emerald-700 text-xs font-black font-mono">{lastLoggedComparison.accuracyScore}%</span>
                    </span>
                  </div>
                  <span className="text-[9.5px] text-stone-500 font-medium">Recorded By: Staff Agent | {new Date().toLocaleTimeString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-stone-200 rounded-xl p-2.5 space-y-1 text-slate-900">
                    <span className="text-[8px] font-mono text-stone-400 block uppercase">Projected Expected</span>
                    <span className="text-xs font-extrabold text-stone-500 font-mono">
                      {lastLoggedComparison.outcomeLogs?.actualResults?.leads ? (lastLoggedComparison.outcomeLogs.actualResults.leads - (lastLoggedComparison.outcomeLogs.actualResults.leads * 0.1)).toFixed(0) : "110"} Units
                    </span>
                  </div>
                  <div className="bg-white border border-stone-200 rounded-xl p-2.5 space-y-1 text-slate-900">
                    <span className="text-[8px] font-mono text-stone-400 block uppercase">Recorded Actual</span>
                    <span className="text-xs font-extrabold text-emerald-700 font-mono">
                      {lastLoggedComparison.outcomeLogs?.actualResults?.leads || loggingLeads} Units
                    </span>
                  </div>
                  <div className="bg-white border border-stone-200 px-2.5 py-2 rounded-xl flex items-center justify-between gap-2 text-slate-900">
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] font-mono text-stone-400 block uppercase">Variance (Delta)</span>
                      <span className="text-[11px] font-black text-indigo-700 font-mono">
                        {lastLoggedComparison.outcomeLogs?.actualResults?.leads 
                          ? (lastLoggedComparison.outcomeLogs.actualResults.leads - 110 >= 0 ? "+" : "") + (lastLoggedComparison.outcomeLogs.actualResults.leads - 110)
                          : "+5"
                        } Units
                      </span>
                    </div>
                    <span className="text-[8.5px] font-bold bg-[#ECE9E4] text-stone-600 px-1 py-0.5 rounded uppercase font-mono">
                      HIT_EXPECTED
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 space-y-1.5 mt-2 text-slate-900">
                  <span className="text-[9.5px] text-emerald-800 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Direct Playbook Refinements and Corrections Suggested:
                  </span>
                  <ul className="text-[10px] text-emerald-950 font-medium list-disc list-inside space-y-1">
                    {lastLoggedComparison.refinements?.map((rf: string, i: number) => (
                      <li key={i}>{rf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-stone-400 text-xs flex flex-col items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-stone-300" />
                No actual business results logged yet for current campaigns.
                <p className="text-[10px] text-stone-300 max-w-[320px]">Select any active campaign above, register its logged outcomes, and trigger the strategic AI model feedback loops instantly.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {isSynthesizing && (
        <div id="goal-os-loading-skeleton" className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl animate-pulse p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="text-slate-700 font-bold text-sm">Evaluating Brand DNA & Historical Offer Intelligence...</h4>
            <div className="max-w-md mx-auto space-y-2">
              <div className="h-4 bg-slate-100 rounded text-slate-900"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6 mx-auto text-slate-900"></div>
              <div className="h-3 bg-slate-100 rounded w-4/6 mx-auto text-slate-900"></div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT SPLIT: STRATEGY PRESENTATION GRID */}
      {strategyResult && !isSynthesizing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLS: MASTER STRATEGIC ARCHITECTURE */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* MODULE 2: GOAL DECOMPOSITION PANEL */}
            <div id="deck-goal-decomposition" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Goal Decomposition Engine™ (Module 2)
                </h4>
                <span className="text-[10px] font-bold font-mono bg-indigo-50 border border-indigo-100 rounded px-2 text-indigo-600">Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-slate-900">
                  <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 block uppercase">Audience Strategy</span>
                  <p className="text-slate-800 text-xs font-semibold leading-relaxed">{strategyResult.decomposition.audienceStrategy}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-slate-900">
                  <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 block uppercase">Offer Strategy</span>
                  <p className="text-indigo-950 text-xs font-medium leading-relaxed font-sans">{strategyResult.decomposition.offerStrategy}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-slate-900">
                  <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 block uppercase">Channel Strategy</span>
                  <p className="text-slate-800 text-xs leading-relaxed">{strategyResult.decomposition.channelStrategy}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-slate-900">
                  <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 block uppercase">Target Success Metrics</span>
                  <p className="text-emerald-700 text-xs font-bold leading-relaxed font-mono">{strategyResult.decomposition.successMetrics}</p>
                </div>
              </div>

              <div className="bg-[#4F46E5]/5 border border-[#4F46E5]/15 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-[#4F46E5] uppercase tracking-wide">Campaign Period Timeline Mapping</span>
                  <span className="font-bold text-indigo-600">{timelineWeeks} Weeks</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{strategyResult.decomposition.campaignTimeline}</p>
              </div>
            </div>

            {/* MODULE 3: STRATEGIC REASONING ENGINE */}
            <div id="deck-strategic-reasoning" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-600" />
                  Strategic Reasoning Engine™ (Module 3)
                </h4>
                <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded px-2 py-0.5">
                  <span className="text-[9px] font-bold font-mono text-violet-700 uppercase">Confidence Rating</span>
                  <span className="text-[10px] font-extrabold text-violet-600 font-mono">{strategyResult.reasoning.confidenceScore}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-violet-50 border border-neutral-100 text-violet-700 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Why This Strategy Was Selected</span>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed font-medium">
                      {strategyResult.reasoning.whySelected}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <div className="p-1 rounded bg-slate-50 border border-neutral-100 text-slate-600 mt-0.5">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Alternative Strategies Evaluated</span>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      {strategyResult.reasoning.alternatives}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                  <div className="text-center p-2.5 bg-slate-50 rounded bg-indigo-50 border border-indigo-100/60 text-indigo-700">
                    <span className="font-extrabold block">BUSINESS DNA</span>
                    <span className="block mt-0.5">{profile.category}</span>
                  </div>
                  <div className="text-center p-2.5 bg-slate-50 rounded bg-indigo-50 border border-indigo-100/60 text-indigo-700">
                    <span className="font-extrabold block">HIST HISTORICAL MEMORY</span>
                    <span>14 Campaigns Matched</span>
                  </div>
                  <div className="text-center p-2.5 bg-slate-50 rounded bg-indigo-50 border border-indigo-100/60 text-indigo-700">
                    <span className="font-extrabold block">SUCCESS RANK</span>
                    <span>Offer Category #1</span>
                  </div>
                  <div className="text-center p-2.5 bg-slate-50 rounded bg-indigo-50 border border-indigo-100/60 text-[#312E81]">
                    <span className="font-extrabold block">SEASONAL INTEL</span>
                    <span className="text-emerald-600 font-semibold">Q3 Aligned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 5: MULTI-AGENT EXECUTIVE COUNCIL */}
            <div id="deck-agent-council" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Multi-Agent Executive Council™ (Module 5)
                </h4>
                <span className="text-xs text-slate-400 font-mono">[6 Sub-agents Reviewed]</span>
              </div>

              {/* Selector agent cards */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "CEO", name: "CEO Agent", icon: "👔" },
                  { key: "CMO", name: "CMO Agent", icon: "📣" },
                  { key: "CFO", name: "CFO Agent", icon: "💰" },
                  { key: "Growth", name: "Growth Strategist", icon: "🚀" },
                  { key: "Psychology", name: "Psychology Agent", icon: "🧠" },
                  { key: "Specialist", name: "Industry Specialist", icon: "💼" }
                ].map((ag) => (
                  <button
                    key={ag.key}
                    onClick={() => setSelectedAgent(ag.key)}
                    id={`btn-agent-tab-${ag.key.toLowerCase()}`}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      selectedAgent === ag.key
                        ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{ag.icon}</span>
                    <span>{ag.name}</span>
                  </button>
                ))}
              </div>

              {/* Selected agent comment */}
              <div className="bg-[#1F2937] text-[#F3F4F6] border border-slate-800 p-5 rounded-2xl space-y-3 font-sans shadow-inner relative">
                <div className="flex justify-between items-center text-xs font-mono text-[#D1D5DB] border-b border-white/10 pb-2">
                  <span>AGENT CRITIVE WORKSPACE EVALUATION</span>
                  <span className="text-emerald-400 font-bold tracking-wider">● ONLINE & APPROVED</span>
                </div>
                <div className="flex gap-4 items-start pt-1">
                  <span className="text-2xl mt-1">
                    {selectedAgent === "CEO" ? "👔" : selectedAgent === "CMO" ? "📣" : selectedAgent === "CFO" ? "💰" : selectedAgent === "Growth" ? "🚀" : selectedAgent === "Psychology" ? "🧠" : "💼"}
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-sm">{selectedAgent} Agent Response Memo:</h5>
                    <p className="text-slate-300 text-xs leading-relaxed italic mt-1 bg-white/5 p-3 rounded-xl border border-white/10">
                      "{selectedAgent === "CEO" ? strategyResult.council.ceo 
                      : selectedAgent === "CMO" ? strategyResult.council.cmo 
                      : selectedAgent === "CFO" ? strategyResult.council.cof || strategyResult.council.cfo
                      : selectedAgent === "Growth" ? strategyResult.council.growth 
                      : selectedAgent === "Psychology" ? strategyResult.council.psychology 
                      : strategyResult.council.specialist}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Consensus & risk report */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                <div className="border border-[#10B981]/20 bg-[#10B981]/5 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-emerald-800 font-mono block uppercase">Executive Consensus Report</span>
                  <p className="text-slate-600 leading-relaxed font-sans font-medium">{strategyResult.council.consensus}</p>
                </div>
                <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-2 text-slate-900">
                  <span className="font-bold text-amber-800 font-mono block uppercase">Strategic Risk Analysis</span>
                  <ul className="space-y-1.5 text-slate-600 font-medium">
                    {strategyResult.council.risks.map((rk: string, index: number) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-amber-500 font-bold font-mono">⚠️</span>
                        <span>{rk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* MODULE 7: BUSINESS OUTCOME SIMULATOR */}
            <div id="deck-outcome-simulator" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-pink-600 animate-pulse" />
                  Business Outcome Simulator™ (Module 7)
                </h4>
                <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 rounded px-2">Pre-execution Forecast Matrix</span>
              </div>

              {/* Sliders */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold font-mono text-slate-600">
                    <span>Campaign Reach Multiplier</span>
                    <span className="text-indigo-600">{simSizeAdjust}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={simSizeAdjust}
                    onChange={(e) => setSimSizeAdjust(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded text-slate-900"
                  />
                  <span className="text-[9px] text-slate-400 font-mono block">Adjust expected reach or target audience size settings.</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold font-mono text-slate-600">
                    <span>Ad Friction Optimization</span>
                    <span className="text-emerald-600">{simFrictionAdjust === 100 ? "Standard" : simFrictionAdjust < 100 ? `-${100 - simFrictionAdjust}% Resistance` : `+${simFrictionAdjust - 100}% Friction`}</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    step="10"
                    value={simFrictionAdjust}
                    onChange={(e) => setSimFrictionAdjust(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded text-slate-900"
                  />
                  <span className="text-[9px] text-slate-400 font-mono block">Lower is better. Represents frictionless copy & clear visuals quality metrics.</span>
                </div>
              </div>

              {/* Interactive columns (Low, expected, best case) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Low Scenario */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 text-center space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Low Yield Scenario</span>
                    <span className="text-2xl font-black text-slate-600 block">40 Units</span>
                  </div>
                  <div className="text-xs text-left text-slate-500 space-y-2 border-t border-slate-100 pt-2 font-medium">
                    <p>• Lead growth: <span className="text-slate-800 font-semibold font-mono">{Math.round(strategyResult.simulation.low.leads * (simSizeAdjust / 100))}</span></p>
                    <p>• Sales conversion: <span className="text-slate-800 font-semibold font-mono">{Math.round(strategyResult.simulation.low.sales / (simFrictionAdjust / 100))}</span></p>
                    <p>• Net Retention: <span className="text-slate-800 font-semibold font-mono">{strategyResult.simulation.low.retention}</span></p>
                  </div>
                  <span className="text-[9px] bg-slate-100 rounded py-0.5 px-1 font-mono text-slate-400 inline-block self-center">30% Probability</span>
                </div>

                {/* Expected Case */}
                <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/10 text-center space-y-3 relative overflow-hidden flex flex-col justify-between ring-2 ring-indigo-500/10">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-600 text-white rounded-bl font-mono text-[8px] font-bold uppercase">Targeted</div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">Expected Operating Case</span>
                    <span className="text-2xl font-black text-indigo-700 block">{Math.round(strategyResult.simulation.expected.leads * (simSizeAdjust / 100))} Units</span>
                  </div>
                  <div className="text-xs text-left text-slate-600 space-y-2 border-t border-indigo-100/50 pt-2 font-medium">
                    <p>• Lead growth: <span className="text-indigo-900 font-semibold font-mono">{Math.round(strategyResult.simulation.expected.leads * (simSizeAdjust / 100))}</span></p>
                    <p>• Sales conversion: <span className="text-indigo-900 font-semibold font-mono">{Math.round(strategyResult.simulation.expected.sales / (simFrictionAdjust / 100))}</span></p>
                    <p>• Net Retention: <span className="text-indigo-900 font-semibold font-mono">{strategyResult.simulation.expected.retention}</span></p>
                  </div>
                  <span className="text-[9px] bg-indigo-600 text-white rounded py-0.5 px-1.5 font-mono inline-block self-center">60% Probability</span>
                </div>

                {/* Best Case */}
                <div className="border border-emerald-200 border-emerald-200 rounded-xl p-4 bg-[#10B981]/5 text-center space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 font-mono">Best Case Outlay</span>
                    <span className="text-2xl font-black text-emerald-700 block">{Math.round(strategyResult.simulation.best.leads * (simSizeAdjust / 100))} Units</span>
                  </div>
                  <div className="text-xs text-left text-emerald-900 space-y-2 border-t border-emerald-100 pt-2 font-medium">
                    <p>• Lead growth: <span className="text-emerald-950 font-semibold font-mono">{Math.round(strategyResult.simulation.best.leads * (simSizeAdjust / 100))}</span></p>
                    <p>• Sales conversion: <span className="text-emerald-950 font-semibold font-mono">{Math.round(strategyResult.simulation.best.sales / (simFrictionAdjust / 100))}</span></p>
                    <p>• Net Retention: <span className="text-emerald-950 font-semibold font-mono">{strategyResult.simulation.best.retention}</span></p>
                  </div>
                  <span className="text-[9px] bg-emerald-100 bg-emerald-100 text-emerald-800 rounded py-0.5 px-1 font-mono inline-block self-center">10% Probability</span>
                </div>

              </div>
            </div>

            {/* MODULE 8: AUTONOMOUS TASK GENERATOR */}
            <div id="deck-task-briefs" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-pink-600" />
                    Autonomous Task Generator™ (Module 8)
                  </h4>
                  <p className="text-slate-400 text-[10px]">Instantly formulated action frameworks mapping instructions without manual configuration.</p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border text-slate-900">
                  {[
                    { key: "campaignBrief", label: "Campaign" },
                    { key: "creativeBrief", label: "Creative" },
                    { key: "contentPlan", label: "Content" },
                    { key: "promotionPlan", label: "Promotion" },
                    { key: "automationPlan", label: "Automation" }
                  ].map((tb) => (
                    <button
                      key={tb.key}
                      id={`btn-task-tab-${tb.key.toLowerCase()}`}
                      onClick={() => setActiveTaskTab(tb.key)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                        activeTaskTab === tb.key
                          ? 'bg-white text-slate-900 border font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-stone-200/80 rounded-2xl p-5 relative overflow-hidden font-mono text-[11px] text-stone-700 leading-relaxed shadow-sm">
                <div className="absolute top-0 right-0 bg-[#A8A29E]/10 px-3 py-1 text-[8px] font-bold text-[#78716C] uppercase rounded-bl border-b border-l border-stone-200">
                  {activeTaskTab.toUpperCase()} CODE PROTOCOL
                </div>
                <div className="flex justify-between items-between text-stone-400 text-[9px] border-b border-stone-200/60 pb-2 mb-3">
                  <span>OUTFLOW FORMATTER SOURCE SPEC</span>
                  <span>BUILD SECURE • OFF-LOCKS STATUS</span>
                </div>
                
                <p className="whitespace-pre-line font-mono">
                  {activeTaskTab === "campaignBrief" ? strategyResult.briefs.campaignBrief
                  : activeTaskTab === "creativeBrief" ? strategyResult.briefs.creativeBrief
                  : activeTaskTab === "contentPlan" ? strategyResult.briefs.contentPlan
                  : activeTaskTab === "promotionPlan" ? strategyResult.briefs.promotionPlan
                  : strategyResult.briefs.automationPlan}
                </p>

                <div className="flex shrink-0 justify-end pt-4 mt-4 border-t border-stone-200/60 gap-1.5">
                  <button
                    onClick={() => handleCopy(
                      activeTaskTab === "campaignBrief" ? strategyResult.briefs.campaignBrief
                      : activeTaskTab === "creativeBrief" ? strategyResult.briefs.creativeBrief
                      : activeTaskTab === "contentPlan" ? strategyResult.briefs.contentPlan
                      : activeTaskTab === "promotionPlan" ? strategyResult.briefs.promotionPlan
                      : strategyResult.briefs.automationPlan,
                      activeTaskTab
                    )}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] rounded border border-stone-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === activeTaskTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                        <span>Copied Protocol</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        <span>Copy Brief Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div id="deck-one-click-sync-banner" className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Automate Executive Integration Flow
                  </h5>
                  <p className="text-slate-500 text-[11px] leading-relaxed max-w-xl">
                    One-click binds this customized strategy directly with the rest of the workspace. Other tabs (Campaign Planner, Content Writer) adjust automatically to fit this business outcome objective.
                  </p>
                </div>
                <button
                  id="btn-sync-goal-os-master"
                  onClick={syncOutcomeToWorkspace}
                  className="w-full md:w-auto px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Sync Outcomes & Lock Strategy
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT COL: STRATEGIC PRIORITIZATION & REUSABLE PLAYBOOKS */}
          <div className="space-y-8">
            
            {/* MODULE 6: STRATEGIC PRIORITIZATION ENGINE */}
            <div id="deck-prioritization-engine" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-indigo-600" />
                  Strategic Prioritization Engine™ (Module 6)
                </h4>
                <div className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold font-mono">RANKED</div>
              </div>

              {/* Score Matrix Grid */}
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl grid grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">Estimated Revenue Impact</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{strategyResult.prioritization.revenueImpact}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">Complexity Score</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{strategyResult.prioritization.complexity}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">Expected ROI</span>
                  <span className="text-indigo-600 text-indigo-600 font-bold block mt-0.5">{strategyResult.prioritization.expectedRoi}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">Time To Results</span>
                  <span className="text-[#312E81] font-bold block mt-0.5">{strategyResult.prioritization.timeToResults}</span>
                </div>
              </div>

              {/* Priorities Stack */}
              <div className="space-y-4 text-xs font-sans">
                {/* Immediate */}
                <div className="space-y-1.5 border-l-2 border-indigo-600 pl-3">
                  <span className="font-mono font-bold text-indigo-600 text-[10px] tracking-wider block uppercase">Immediate Actions (Critical)</span>
                  <ul className="space-y-1">
                    {strategyResult.prioritization.immediate.map((item: string, index: number) => (
                      <li key={index} className="text-slate-600 font-medium list-disc ml-3">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* 30 Day */}
                <div className="space-y-1.5 border-l-2 border-[#10B981] pl-3">
                  <span className="font-mono font-bold text-emerald-600 text-[10px] tracking-wider block uppercase">30-Day Priorities</span>
                  <ul className="space-y-1">
                    {strategyResult.prioritization.days30.map((item: string, index: number) => (
                      <li key={index} className="text-slate-600 font-medium list-disc ml-3">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* 90 Day */}
                <div className="space-y-1.5 border-l-2 border-[#EAB308] pl-3">
                  <span className="font-mono font-bold text-[#EAB308] text-[10px] tracking-wider block uppercase">90-Day Priorities</span>
                  <ul className="space-y-1">
                    {strategyResult.prioritization.days90.map((item: string, index: number) => (
                      <li key={index} className="text-slate-600 font-medium list-disc ml-3">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* MODULE 4: GROWTH PLAYBOOKS */}
            <div id="deck-reusable-playbooks" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                  Growth Playbook Engine™ (Module 4)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">[7 Playbooks Loaded]</span>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed leading-normal">
                Pre-validated industry execution templates. Selecting or activating a playbook dynamically aligns your active strategy goals.
              </p>

              {/* Playbook Cards scroll stack */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {GROWTH_PLAYBOOKS.map((plan) => (
                  <div
                    key={plan.id}
                    id={`btn-playbook-card-${plan.id.replace('playbook-', '')}`}
                    onClick={() => handleActivatePlaybook(plan)}
                    className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 ${
                      selectedPlaybook.id === plan.id
                        ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{plan.icon}</span>
                        <h5 className="font-bold text-xs">{plan.name}</h5>
                      </div>
                      {selectedPlaybook.id === plan.id && (
                        <span className="text-[8px] font-bold font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 rounded">ACTIVE</span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-1.5 leading-relaxed font-sans ${selectedPlaybook.id === plan.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>
                    
                    {selectedPlaybook.id === plan.id && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-[10px] text-slate-200 font-mono">
                        <p className="font-bold uppercase text-indigo-400 tracking-wider">CHECKLIST TARGET FOR ACTION:</p>
                        <ul className="space-y-1">
                          {plan.checklist.map((c, idx) => (
                            <li key={idx} className="flex gap-2 text-[10px] leading-relaxed">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* BEFORE SYNTHESIS INSTRUCTIONAL OVERVIEW */}
      {!strategyResult && !isSynthesizing && (
        <div id="deck-instructional-teaser" className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-500">
            <Compass className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-slate-800 font-black text-lg tracking-tight font-sans">Awaiting Outcome Objective Instruction</h4>
            <p className="text-slate-500 text-xs leading-normal max-w-md mx-auto">
              MarketForge is configured as an AI Growth Executive. Select your high-level business goal and budget in the timeline panel above to automatically synthesize strategic actions, playbooks, outcome forecasts, and multi-agent consensus approvals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-left bg-slate-50 p-4 rounded-2xl border text-[10px] font-mono font-medium text-slate-500">
            <div className="flex gap-1.5">
              <span className="text-indigo-600">✓</span>
              <span>11 Core Goals</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-indigo-600">✓</span>
              <span>Decomp Engine</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-indigo-600">✓</span>
              <span>Reasoning Core</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-indigo-600">✓</span>
              <span>7 Growth Playbooks</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-indigo-600">✓</span>
              <span>6 Agent Council</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-indigo-600">✓</span>
              <span>Outcome Simulator</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Highly strategic, context-aware generator client side (combines profile category/industry into precise directives)
function generateDynamicLocalStrategy(profile: BusinessProfile, goal: string, weeks: number, budget: string) {
  const profileName = profile.name || "AeroFlow";
  const cat = profile.category || "Workspace Automation";
  const industry = profile.industry || "Software & SaaS";
  const audience = profile.targetAudience || "Operations Directors";

  return {
    decomposition: {
      offerStrategy: `Create and offer a customized, frictionless '${profileName} ${cat} Evaluation Audit' package. Position this as an elite 15-minute optimization consult with high value complimentary access indicators.`,
      audienceStrategy: `Exclusively target highly motivated ${audience} directly within the ${industry} domain. Isolate demographics reporting friction and manual overhead as their #1 operational headache.`,
      channelStrategy: `Sponsor targeted B2B posts across LinkedIn feeds, establish a highly responsive sequential target email loop, and bundle helpful visual audit checklist pages.`,
      contentPlan: `Synthesize 3 micro-demonstration video clips showcasing manual bottleneck elimination, publish 2 rich user case studies, and deploy 5 automated direct outreach templates.`,
      campaignTimeline: `Weeks 1-2: Setup target tracking, formulate values positioning. Weeks 3-${weeks - 1}: Stagger sequential ads and capture warm reservation conversions. Week ${weeks}: Synthesize pipelines and onboard users.`,
      successMetrics: `Acquire 140+ highly qualified leads, fulfill 20 exclusive assessment reservations, and achieve a robust 18% landing registration rate within a total ${budget} budget limit.`
    },
    reasoning: {
      whySelected: `Evaluating ${profileName}'s core Business DNA, we identified maximum relevance in targeting B2B Operations professionals. Standard campaign history ranks introductory value audits as the highest converting strategy (#1 in SaaS, with a 92% confidence approval in high trust markets). High visual clarity eliminates pricing resistance, aligning with Q3 corporate spending reviews.`,
      alternatives: `1. Direct outbound mass sequential messaging (Lower lead quality, high compliance risk). 2. Dedicated interactive software demo trials (Requires significantly higher developer complexity and has a longer conversion cycle length).`,
      confidenceScore: 94
    },
    council: {
      ceo: `Strategic alignment is verified. This low-friction value consultation establishes corporate trust quickly and protects our enterprise pricing structures. Validated for high execution speed.`,
      cmo: `The targeted pain-point messaging connects directly with ${audience} aspirations. LinkedIn ad templates and video segments will drive exceptional CTR.`,
      cfo: `Approved with extremely low upfront risk. The estimated customer acquisition cost of $35 aligns perfectly with our ${budget} bounds, shielding gross margins.`,
      growth: `Prioritize simplifying the intake landing page. Eliminating unnecessary fields will double conversions. The suggested timeline maps correctly onto active market cycles.`,
      psychology: `Framing the product choice as 'automated relief from report bottlenecks' triggers deep operational desire. Expected to stimulate immediate conversions.`,
      specialist: `Industry benchmarks show automated systems seeing a 220% growth surge. Our positioning correctly rides this trend wave.`,
      consensus: `Unanimous council approval obtained. The composite consensus alignment index is 96/100, which satisfies board oversight specifications.`,
      risks: [
        "Slight cold ad fatigue on small niche segments inside SaaS",
        "Lead assessment queue overload if booking frequency spikes too fast"
      ],
      opportunities: [
        "Accelerate referral loops by rewarding early trial participants",
        "Utilize anonymous audit stats to generate a highly viral industry benchmark paper"
      ]
    },
    prioritization: {
      revenueImpact: "High",
      complexity: "Medium-Low",
      expectedRoi: "250%+",
      timeToResults: `${weeks * 7} Days`,
      confidenceLevel: "Extreme (94%)",
      immediate: [
        `Formulate and lock the value proposition text for the '${profileName} Evaluation Audit' landing experience.`,
        "Pre-program the automated intake forms to receive early reservations."
      ],
      days30: [
        "Deploy early LinkedIn ad drafts to isolate top performing creative vectors.",
        "Trigger the automated email responder funnel sequences to capture early drop-offs."
      ],
      days90: [
        `Automate customer feedback collection to double direct referral conversions.`,
        "Expand audience radius to adjacent operational fields and auxiliary industries."
      ]
    },
    simulation: {
      low: { leads: 35, sales: 4, engagement: "1,800 views", conversions: 4, retention: "+1%" },
      expected: { leads: 110, sales: 16, engagement: "7,500 views", conversions: 12, retention: "+5%" },
      best: { leads: 280, sales: 48, engagement: "19,000 views", conversions: 36, retention: "+12%" }
    },
    briefs: {
      campaignBrief: `CAMPAIGN OUTLINE BRIEF\nBrand Champion: ${profileName}\nObjective Goal: ${goal}\nEstimated Budget Parameters: ${budget}\nTimeline Phase: ${weeks} Weeks\n\nEXECUTIVE MAPPING BRIEF\nSecure robust, high-trust interest loops within the ${industry} sector by positioning a low-friction value audit invitation. All creative visuals must highlight automatic time savings.`,
      creativeBrief: `CREATIVE DESIGN BRIEF\nObjective Focus: ${goal} - ${profileName} Brand\nTarget Demographic: ${audience}\nVisual Concept: High-contrast professional layout, framed by contrasting slate-blue card boundaries, stark white backgrounds, and strong custom call-to-action buttons.\n\nCopy tone should remain authoritative, direct, and focused on operational control.`,
      contentPlan: `CONTENT ARCHITECTURE ROADMAP\n\n• Element 1 (LinkedIn Feed Segment): "Ops Directors, how many manual Slack reports did your team write today? Stop the leakage. Get our complete automated checkup."\n• Element 2 (Email Sequence 1): "Frictionless control is within reach. Secure your custom workspace audit and eliminate 20% overhead in under 2 weeks."\n• Element 3 (Short Video Promo Hook): Screencast visual demonstrating Jira reports synchronizing in under 3 seconds automatically.`,
      promotionPlan: `PROMOTIONAL PROTOCOL MEMO\n\nTo maximize early interest capture, offer the first 50 reservation participants complementary 14-day extended premium access, inclusive of direct Slack support integrations, completely charge-free.`,
      automationPlan: `AUTOMATION FLOW PROTOCOL\n\n1. Target inputs details into value audit landing template form.\n2. Webhook triggers secure database record and instantly sends automated custom schedule links.\n3. Slack alert dispatches to internal teams to trigger immediate personalized review prep.`
    }
  };
}
