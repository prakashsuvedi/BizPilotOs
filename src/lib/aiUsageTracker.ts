/**
 * MarketForge OS™ — AI API Usage, Model Rates, BYOK & Token Billing Engine
 * Provides transparent tracking of AI model invocation, token breakdown, rates,
 * tenant custom API keys (BYOK), plan quotas, overage billing, and 30-day sparkline metrics.
 */

export interface AiModelSpec {
  id: string;
  name: string;
  provider: 'Google Gemini' | 'OpenAI' | 'Anthropic';
  inputRatePer1k: number; // Cost in USD per 1,000 input tokens
  outputRatePer1k: number; // Cost in USD per 1,000 output tokens
  contextWindow: string;
  latencyRating: 'Ultra Fast' | 'Fast' | 'Standard' | 'Deep Reasoning';
  recommendedFor: string;
  isDefault?: boolean;
}

export const AI_MODELS_REGISTRY: AiModelSpec[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Google Gemini 2.5 Flash',
    provider: 'Google Gemini',
    inputRatePer1k: 0.000075, // $0.075 / 1M tokens
    outputRatePer1k: 0.000300, // $0.30 / 1M tokens
    contextWindow: '1,000,000 tokens',
    latencyRating: 'Ultra Fast',
    recommendedFor: 'Social studio, ad copy, email drafts, instant marketing assets',
    isDefault: true
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google Gemini',
    inputRatePer1k: 0.001250, // $1.25 / 1M tokens
    outputRatePer1k: 0.005000, // $5.00 / 1M tokens
    contextWindow: '2,000,000 tokens',
    latencyRating: 'Deep Reasoning',
    recommendedFor: 'Autonomous strategy, financial modeling, omnicore labs'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Google Gemini 1.5 Flash',
    provider: 'Google Gemini',
    inputRatePer1k: 0.000075,
    outputRatePer1k: 0.000300,
    contextWindow: '1,000,000 tokens',
    latencyRating: 'Fast',
    recommendedFor: 'Legacy high-throughput tasks, fast batch generation'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google Gemini',
    inputRatePer1k: 0.001250,
    outputRatePer1k: 0.005000,
    contextWindow: '2,000,000 tokens',
    latencyRating: 'Deep Reasoning',
    recommendedFor: 'Complex multi-doc research & long-context synthesis'
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'OpenAI',
    inputRatePer1k: 0.000150,
    outputRatePer1k: 0.000600,
    contextWindow: '128,000 tokens',
    latencyRating: 'Fast',
    recommendedFor: 'Lightweight conversational agents & classification'
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputRatePer1k: 0.002500,
    outputRatePer1k: 0.010000,
    contextWindow: '128,000 tokens',
    latencyRating: 'Standard',
    recommendedFor: 'Multimodal vision & complex reasoning'
  }
];

export interface AiTaskUsageLog {
  id: string;
  tenantId: string;
  taskId: string; // Module / Task identifier
  taskTitle: string; // Description e.g., "AI Campaign Strategy Generation"
  modelUsed: string; // Model ID
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  inputRatePer1k: number;
  outputRatePer1k: number;
  costUsd: number;
  isCustomKeyUsed: boolean;
  executorName?: string;
  executorEmail?: string;
  timestamp: string; // ISO String
}

export interface TenantAiConfig {
  tenantId: string;
  customApiKey: string; // BYOK key value
  provider: 'google_gemini' | 'openai';
  enabled: boolean;
  customKeyValid: boolean;
  monthlyTokenQuota: number; // Included free in plan e.g. 500,000 tokens
  overageRatePer1kTokens: number; // e.g. $0.002 per 1k tokens above quota
  modelBudgetCaps?: Record<string, number>; // Hard monthly USD budget limit per model (e.g. { 'gemini-1.5-pro': 15.00 })
  updatedAt: string;
}

export interface SparklinePoint {
  date: string;
  dayLabel: string;
  tokens: number;
  calls: number;
  costUsd: number;
}

// Default Plan Quotas (Minimum tokens given free at start)
export const PLAN_TOKEN_QUOTAS: Record<string, number> = {
  Trial: 100000, // 100k tokens
  Basic: 250000, // 250k tokens
  Pro: 1000000, // 1M tokens
  Growth: 1000000, // 1M tokens
  Enterprise: 5000000 // 5M tokens
};

export const DEFAULT_OVERAGE_RATE_PER_1K = 0.002; // $0.002 per 1k tokens over quota

const USAGE_STORAGE_KEY = 'marketforge_ai_task_usage_logs_v2';
const CONFIG_STORAGE_KEY = 'marketforge_tenant_ai_configs_v2';

/**
 * Get saved Tenant AI Config or default
 */
export function getTenantAiConfig(tenantId: string, tenantPlan: string = 'Growth'): TenantAiConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[tenantId]) return parsed[tenantId];
    }
  } catch (e) {
    console.warn('Failed to load tenant AI config:', e);
  }

  const quota = PLAN_TOKEN_QUOTAS[tenantPlan] || 1000000;
  return {
    tenantId,
    customApiKey: '',
    provider: 'google_gemini',
    enabled: false,
    customKeyValid: false,
    monthlyTokenQuota: quota,
    overageRatePer1kTokens: DEFAULT_OVERAGE_RATE_PER_1K,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Save Tenant AI Config (BYOK Custom API Key)
 */
export function saveTenantAiConfig(config: TenantAiConfig): void {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[config.tenantId] = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error('Failed to save tenant AI config:', e);
  }
}

/**
 * Get all AI Task Usage Logs (preseeds historical data for last 30 days if empty)
 */
export function getAiTaskUsageLogs(tenantId?: string): AiTaskUsageLog[] {
  let logs: AiTaskUsageLog[] = [];
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (raw) {
      logs = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed loading AI logs:', e);
  }

  if (logs.length === 0) {
    logs = generateSeed30DayUsageLogs(tenantId || 'demo-tenant');
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {}
  }

  if (tenantId) {
    return logs.filter(l => l.tenantId === tenantId);
  }
  return logs;
}

/**
 * Log a new AI task execution
 */
export function logAiTaskUsage(params: {
  tenantId: string;
  taskId: string;
  taskTitle: string;
  modelId?: string;
  promptTokens: number;
  completionTokens: number;
  executorName?: string;
  executorEmail?: string;
}): AiTaskUsageLog {
  const modelId = params.modelId || 'gemini-2.5-flash';
  const modelSpec = AI_MODELS_REGISTRY.find(m => m.id === modelId) || AI_MODELS_REGISTRY[0];
  const config = getTenantAiConfig(params.tenantId);
  
  const isCustomKeyUsed = config.enabled && Boolean(config.customApiKey.trim());
  const totalTokens = params.promptTokens + params.completionTokens;

  // Calculate actual model cost based on prompt & completion rates
  const inputCost = (params.promptTokens / 1000) * modelSpec.inputRatePer1k;
  const outputCost = (params.completionTokens / 1000) * modelSpec.outputRatePer1k;
  const totalCost = inputCost + outputCost;

  const logEntry: AiTaskUsageLog = {
    id: `ailog_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    tenantId: params.tenantId,
    taskId: params.taskId,
    taskTitle: params.taskTitle,
    modelUsed: modelSpec.id,
    promptTokens: params.promptTokens,
    completionTokens: params.completionTokens,
    totalTokens,
    inputRatePer1k: modelSpec.inputRatePer1k,
    outputRatePer1k: modelSpec.outputRatePer1k,
    costUsd: totalCost,
    isCustomKeyUsed,
    executorName: params.executorName || 'Tenant Admin',
    executorEmail: params.executorEmail || 'admin@tenant.com',
    timestamp: new Date().toISOString()
  };

  try {
    const existing = getAiTaskUsageLogs();
    const updated = [logEntry, ...existing].slice(0, 2000); // keep last 2000 logs
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed saving AI usage log:', e);
  }

  return logEntry;
}

/**
 * Computes 30-day sparkline trend data for any tenant
 */
export function get30DaySparklineData(tenantId?: string): {
  data: SparklinePoint[];
  total30DayTokens: number;
  total30DayCalls: number;
  total30DayCostUsd: number;
  growthPercentage: number; // e.g. +18.4%
  customKeyBypassTokens: number;
} {
  const logs = getAiTaskUsageLogs(tenantId);
  const now = new Date();
  const sparklineMap: Record<string, { tokens: number; calls: number; costUsd: number }> = {};

  // Build 30 days map ending today
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    sparklineMap[dateStr] = { tokens: 0, calls: 0, costUsd: 0 };
  }

  let total30DayTokens = 0;
  let total30DayCalls = 0;
  let total30DayCostUsd = 0;
  let customKeyBypassTokens = 0;

  // Aggregate logs into map
  logs.forEach(log => {
    const logDateStr = log.timestamp.split('T')[0];
    if (sparklineMap[logDateStr]) {
      sparklineMap[logDateStr].tokens += log.totalTokens;
      sparklineMap[logDateStr].calls += 1;
      sparklineMap[logDateStr].costUsd += log.costUsd;

      total30DayTokens += log.totalTokens;
      total30DayCalls += 1;
      total30DayCostUsd += log.costUsd;

      if (log.isCustomKeyUsed) {
        customKeyBypassTokens += log.totalTokens;
      }
    }
  });

  const data: SparklinePoint[] = Object.keys(sparklineMap).sort().map(dateStr => {
    const d = new Date(dateStr);
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    return {
      date: dateStr,
      dayLabel,
      tokens: sparklineMap[dateStr].tokens,
      calls: sparklineMap[dateStr].calls,
      costUsd: sparklineMap[dateStr].costUsd
    };
  });

  // Calculate growth: compare second half (last 15 days) vs first half (first 15 days)
  const first15Tokens = data.slice(0, 15).reduce((acc, p) => acc + p.tokens, 0);
  const last15Tokens = data.slice(15, 30).reduce((acc, p) => acc + p.tokens, 0);

  let growthPercentage = 0;
  if (first15Tokens > 0) {
    growthPercentage = Math.round(((last15Tokens - first15Tokens) / first15Tokens) * 1000) / 10;
  } else if (last15Tokens > 0) {
    growthPercentage = 100;
  }

  return {
    data,
    total30DayTokens,
    total30DayCalls,
    total30DayCostUsd,
    growthPercentage,
    customKeyBypassTokens
  };
}

/**
 * Calculates Tenant AI Billing Breakdown
 */
export function getTenantBillingBreakdown(tenantId: string, tenantPlan: string = 'Growth') {
  const config = getTenantAiConfig(tenantId, tenantPlan);
  const sparkline = get30DaySparklineData(tenantId);
  const logs = getAiTaskUsageLogs(tenantId);

  const includedQuota = config.monthlyTokenQuota;
  const platformTokensUsed = sparkline.total30DayTokens - sparkline.customKeyBypassTokens;
  const overageTokens = Math.max(0, platformTokensUsed - includedQuota);
  const overageCostUsd = Math.round((overageTokens / 1000) * config.overageRatePer1kTokens * 100) / 100;

  // Model usage distribution
  const modelDistribution: Record<string, { calls: number; tokens: number; cost: number }> = {};
  logs.forEach(l => {
    if (!modelDistribution[l.modelUsed]) {
      modelDistribution[l.modelUsed] = { calls: 0, tokens: 0, cost: 0 };
    }
    modelDistribution[l.modelUsed].calls += 1;
    modelDistribution[l.modelUsed].tokens += l.totalTokens;
    modelDistribution[l.modelUsed].cost += l.costUsd;
  });

  return {
    config,
    includedQuota,
    totalTokensUsed: sparkline.total30DayTokens,
    platformTokensUsed,
    customKeyTokensUsed: sparkline.customKeyBypassTokens,
    percentQuotaUsed: Math.min(100, Math.round((platformTokensUsed / includedQuota) * 100)),
    overageTokens,
    overageCostUsd,
    totalCalls: sparkline.total30DayCalls,
    totalRawCostUsd: Math.round(sparkline.total30DayCostUsd * 1000) / 1000,
    modelDistribution
  };
}

/**
 * Seed historical 30-day AI task logs for rich visualization out-of-the-box
 */
function generateSeed30DayUsageLogs(tenantId: string): AiTaskUsageLog[] {
  const logs: AiTaskUsageLog[] = [];
  const now = new Date();

  const taskTemplates = [
    { taskId: 'social_studio_post', title: 'AI Social Media Post & Campaign Copy', model: 'gemini-2.5-flash', pTokens: 1250, cTokens: 620 },
    { taskId: 'campaign_planner', title: 'Autonomous AI Campaign Strategy Architecture', model: 'gemini-1.5-pro', pTokens: 3800, cTokens: 1950 },
    { taskId: 'ad_studio_gen', title: 'Multi-Channel Ad Creative Copy Generation', model: 'gemini-2.5-flash', pTokens: 1100, cTokens: 480 },
    { taskId: 'email_newsletter', title: 'AI Email Newsletter & Workflow Automation', model: 'gemini-1.5-flash', pTokens: 1450, cTokens: 820 },
    { taskId: 'website_builder_ai', title: 'AI Website Landing Page Section Generator', model: 'gemini-2.5-flash', pTokens: 2100, cTokens: 1150 },
    { taskId: 'omnicore_lab_agent', title: 'OmniCore Intelligence Research Task Execution', model: 'gemini-1.5-pro', pTokens: 4200, cTokens: 2400 },
    { taskId: 'revenue_intel_audit', title: 'AI Revenue Forecast & Financial Audit', model: 'gemini-1.5-pro', pTokens: 2900, cTokens: 1300 },
    { taskId: 'restaurant_pos_ai', title: 'AI Restaurant Special Promo & Menu Generator', model: 'gemini-2.5-flash', pTokens: 980, cTokens: 410 }
  ];

  // Generate 45 logs across the last 30 days
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - dayOffset);

    // Number of calls for this day (gradually increasing to show trend)
    const callsCount = Math.floor(1 + (30 - dayOffset) * 0.15 + (Math.sin(dayOffset) * 1.5));

    for (let c = 0; c < Math.max(1, callsCount); c++) {
      const template = taskTemplates[(dayOffset + c) % taskTemplates.length];
      const modelSpec = AI_MODELS_REGISTRY.find(m => m.id === template.model) || AI_MODELS_REGISTRY[0];

      const pTokens = Math.round(template.pTokens * (0.85 + Math.random() * 0.3));
      const cTokens = Math.round(template.cTokens * (0.85 + Math.random() * 0.3));
      const totalTokens = pTokens + cTokens;

      const costUsd = (pTokens / 1000) * modelSpec.inputRatePer1k + (cTokens / 1000) * modelSpec.outputRatePer1k;

      // Random timestamp inside that day
      const logTime = new Date(dayDate);
      logTime.setHours(Math.floor(8 + Math.random() * 12), Math.floor(Math.random() * 60));

      logs.push({
        id: `seed_log_${dayOffset}_${c}_${Math.random().toString(36).substr(2, 5)}`,
        tenantId,
        taskId: template.taskId,
        taskTitle: template.title,
        modelUsed: modelSpec.id,
        promptTokens: pTokens,
        completionTokens: cTokens,
        totalTokens,
        inputRatePer1k: modelSpec.inputRatePer1k,
        outputRatePer1k: modelSpec.outputRatePer1k,
        costUsd,
        isCustomKeyUsed: false,
        executorName: 'Tenant Admin',
        executorEmail: 'admin@tenant.com',
        timestamp: logTime.toISOString()
      });
    }
  }

  return logs;
}

export interface ModelBudgetStatus {
  modelId: string;
  capUsd: number | null; // null if no budget cap set
  spentUsd: number;
  percentSpent: number;
  isWarning: boolean; // >= 80%
  isExhausted: boolean; // >= 100%
  isDisabled: boolean;
}

export function getModelBudgetStatus(tenantId: string, modelId: string): ModelBudgetStatus {
  const config = getTenantAiConfig(tenantId);
  const logs = getAiTaskUsageLogs(tenantId);
  const capUsd = config.modelBudgetCaps?.[modelId] ?? null;

  // Calculate spent USD for this model in current 30-day window
  const spentUsd = logs
    .filter(l => l.modelUsed === modelId)
    .reduce((acc, l) => acc + (l.isCustomKeyUsed ? 0 : l.costUsd), 0);

  if (capUsd === null || capUsd <= 0) {
    return {
      modelId,
      capUsd: null,
      spentUsd: Math.round(spentUsd * 1000) / 1000,
      percentSpent: 0,
      isWarning: false,
      isExhausted: false,
      isDisabled: false
    };
  }

  const percentSpent = Math.min(100, Math.round((spentUsd / capUsd) * 100));
  const isExhausted = spentUsd >= capUsd;
  const isWarning = percentSpent >= 80 && !isExhausted;

  return {
    modelId,
    capUsd,
    spentUsd: Math.round(spentUsd * 1000) / 1000,
    percentSpent,
    isWarning,
    isExhausted,
    isDisabled: isExhausted
  };
}

export function isModelDisabledForTenant(tenantId: string, modelId: string): boolean {
  const status = getModelBudgetStatus(tenantId, modelId);
  return status.isDisabled;
}

export interface ProjectionPoint {
  dayLabel: string;
  date: string;
  actualTokens?: number;
  projectedTokens?: number;
  cumulativeActualTokens?: number;
  cumulativeProjectedTokens?: number;
  quotaLine?: number;
  isProjection: boolean;
}

export interface UsageProjectionResult {
  dailyBurnRate: number; // Avg tokens per day based on last 7/14 active days
  remainingQuotaTokens: number;
  daysUntilExhaustion: number | null; // null if burn rate <= 0 or quota infinite
  estimatedExhaustionDate: string | null; // e.g. "August 14, 2026" or "No exhaustion forecasted"
  projectionPoints: ProjectionPoint[];
  willHitLimitThisMonth: boolean;
}

export function getUsageProjectionData(tenantId: string, tenantPlan: string = 'Growth'): UsageProjectionResult {
  const config = getTenantAiConfig(tenantId, tenantPlan);
  const sparkline = get30DaySparklineData(tenantId);
  const quota = config.monthlyTokenQuota;
  
  // Calculate historical daily burn rate over recent 14 days
  const recentPoints = sparkline.data.slice(-14);
  const totalRecentTokens = recentPoints.reduce((sum, p) => sum + p.tokens, 0);
  const dailyBurnRate = Math.round(totalRecentTokens / Math.max(1, recentPoints.length));

  const platformTokensUsed = sparkline.total30DayTokens - sparkline.customKeyBypassTokens;
  const remainingQuotaTokens = Math.max(0, quota - platformTokensUsed);

  let daysUntilExhaustion: number | null = null;
  let estimatedExhaustionDate: string | null = null;
  let willHitLimitThisMonth = false;

  if (dailyBurnRate > 0 && remainingQuotaTokens > 0) {
    daysUntilExhaustion = Math.ceil(remainingQuotaTokens / dailyBurnRate);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysUntilExhaustion);
    
    // Format nicely e.g., "Aug 14, 2026"
    estimatedExhaustionDate = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (daysUntilExhaustion <= 30) {
      willHitLimitThisMonth = true;
    }
  } else if (remainingQuotaTokens <= 0) {
    daysUntilExhaustion = 0;
    estimatedExhaustionDate = "Quota Already Exhausted";
    willHitLimitThisMonth = true;
  } else {
    estimatedExhaustionDate = "No Limit Breach Forecasted";
  }

  // Build combined timeline points: historical 14 days + 14 future projected days
  const projectionPoints: ProjectionPoint[] = [];
  const now = new Date();

  // 1. Add historical actual cumulative points (last 14 days)
  let cumulativeActual = 0;
  const historyStartOffset = 13;
  for (let i = historyStartOffset; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    const point = sparkline.data.find(sp => sp.date === dateStr);
    const dailyTok = point ? point.tokens : 0;
    cumulativeActual += dailyTok;

    projectionPoints.push({
      dayLabel,
      date: dateStr,
      actualTokens: dailyTok,
      cumulativeActualTokens: cumulativeActual,
      quotaLine: quota,
      isProjection: false
    });
  }

  // 2. Add future 14 projection days based on historical daily burn rate
  let runningProjectedCumulative = cumulativeActual;
  for (let f = 1; f <= 14; f++) {
    const d = new Date(now);
    d.setDate(d.getDate() + f);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    
    runningProjectedCumulative += dailyBurnRate;

    projectionPoints.push({
      dayLabel,
      date: dateStr,
      projectedTokens: dailyBurnRate,
      cumulativeProjectedTokens: runningProjectedCumulative,
      quotaLine: quota,
      isProjection: true
    });
  }

  return {
    dailyBurnRate,
    remainingQuotaTokens,
    daysUntilExhaustion,
    estimatedExhaustionDate,
    projectionPoints,
    willHitLimitThisMonth
  };
}

