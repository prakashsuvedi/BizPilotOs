import { getAdminDb, getIsRealAdminReady } from "./firebase-admin";
import { mapSmtpError } from "./smtp";

// ==========================================
// PHASE 1: ENTERPRISE DEBUG SYSTEM & LOGS
// ==========================================

export interface ProductionExecutionLog {
  correlationId: string;
  timestamp: string;
  durationMs: number;
  module: string;
  functionName: string;
  input: string; // JSON string or text
  output: string; // JSON string or text
  externalRequest?: string;
  externalResponse?: string;
  retryCount: number;
  rollbackStatus: "None" | "Pending" | "Completed" | "Failed";
  finalResult: "SUCCESS" | "FAIL" | "PENDING";
  errorDetails?: string;
}

// Generate an Enterprise correlation ID matching the pattern PRD-YYYYMMDD-XXXXXX
export function generateCorrelationId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(100000 + Math.random() * 900000));
  return `PRD-${year}${month}${day}-${rand}`;
}

// Global log storage in memory (always back up Firestore)
export const inMemoryExecutionLogs: ProductionExecutionLog[] = [];

export async function logProductionExecution(log: ProductionExecutionLog): Promise<void> {
  console.log(`[Enterprise Log] [${log.correlationId}] Module: ${log.module} | Fn: ${log.functionName} | Result: ${log.finalResult}`);
  inMemoryExecutionLogs.push(log);
  
  const isFbReal = getIsRealAdminReady();
  if (isFbReal) {
    try {
      const db = getAdminDb();
      await db.collection("production_execution_logs").doc(log.correlationId).set(log);
    } catch (err: any) {
      console.warn(`[Enterprise Debug] Failed to save execution log ${log.correlationId} to Firestore:`, err.message);
    }
  }
}

// ==========================================
// PHASE 4: SMTP ROOT CAUSE ANALYZER
// ==========================================

export interface SmtpFailureAnalysis {
  rootCause: string;
  whyItHappened: string;
  howToFixIt: string;
  failedConfigValue: string;
  docUrl: string;
}

export function analyzeSmtpError(err: any, configValue: string): SmtpFailureAnalysis {
  const diag = mapSmtpError(err, configValue);
  return {
    rootCause: `${diag.failureType}: ${diag.rootCause}`,
    whyItHappened: diag.whyItHappened,
    howToFixIt: diag.actionableFix,
    failedConfigValue: diag.failedConfigValue,
    docUrl: diag.docUrl
  };
}

// ==========================================
// PHASE 5: GEMINI ROOT CAUSE ANALYZER
// ==========================================

export interface GeminiFailureAnalysis {
  rootCause: string;
  whyItHappened: string;
  howToFixIt: string;
  currentModel: string;
  suggestedModel: string;
  fallbackUsed: boolean;
}

export function analyzeGeminiError(err: any, attemptedModel: string): GeminiFailureAnalysis {
  const errMsg = String(err.message || err).toLowerCase();
  
  if (errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("high demand") || errMsg.includes("temporarily unavailable")) {
    return {
      rootCause: "Temporary Upstream High Demand (HTTP 503 UNAVAILABLE)",
      whyItHappened: "The requested model is experiencing a temporary spike in traffic. The API key is authentic, and fallback models or automatic retries handle the request.",
      howToFixIt: "Requests automatically route to available cluster models like gemini-3.1-flash-lite or retry with exponential backoff.",
      currentModel: attemptedModel,
      suggestedModel: "gemini-3.1-flash-lite",
      fallbackUsed: true
    };
  }

  if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("resource_exhausted")) {
    return {
      rootCause: "API Quota Limit Exceeded (Rate / Daily Limit)",
      whyItHappened: "The configured Gemini API Key has hit either its Requests-Per-Minute (RPM) or Daily Tokens-Per-Minute (TPM) limit on the active tier.",
      howToFixIt: "Upgrade to a paid enterprise plan via the Google AI Studio console or integrate backoff/queuing logic.",
      currentModel: attemptedModel,
      suggestedModel: "gemini-3.7-flash",
      fallbackUsed: true
    };
  }

  if (errMsg.includes("api key") || errMsg.includes("unauthorized") || errMsg.includes("key not found") || errMsg.includes("401") || errMsg.includes("invalid api key")) {
    return {
      rootCause: "Invalid or Missing Gemini API Key",
      whyItHappened: "The server failed to authenticate requests because the GEMINI_API_KEY environment variable is invalid, empty, or placeholder text.",
      howToFixIt: "Enter an active, authentic Gemini API key under the Secrets panel in the Settings menu.",
      currentModel: attemptedModel,
      suggestedModel: "gemini-3.7-flash",
      fallbackUsed: true
    };
  }

  if (errMsg.includes("region") || errMsg.includes("unsupported location") || errMsg.includes("403") && errMsg.includes("location")) {
    return {
      rootCause: "Regional Territory Restriction",
      whyItHappened: "Google AI Studio restricts API request traffic from certain geographical IP addresses or Cloud regions.",
      howToFixIt: "Use a Google Cloud VPN/Proxy or deploy your Cloud Run container inside a supported US/EU region.",
      currentModel: attemptedModel,
      suggestedModel: "gemini-3.7-flash",
      fallbackUsed: true
    };
  }

  if (errMsg.includes("model") || errMsg.includes("not found") || errMsg.includes("invalid model")) {
    return {
      rootCause: "Invalid or Deprecated Model Identifier",
      whyItHappened: "The requested model ID is deprecated, disabled, or spelled incorrectly in the API payload parameters.",
      howToFixIt: "Ensure you use modern Google AI Studio models like 'gemini-3.7-flash' or 'gemini-3.1-pro-preview' as specified in the standard guidelines.",
      currentModel: attemptedModel,
      suggestedModel: "gemini-3.7-flash",
      fallbackUsed: true
    };
  }

  return {
    rootCause: "Generic Gemini API Handshake Exception",
    whyItHappened: `An unexpected API failure occurred: ${err.message || err}`,
    howToFixIt: "Consult official Google AI Studio developer documentation or verify network routing conditions.",
    currentModel: attemptedModel,
    suggestedModel: "gemini-3.7-flash",
    fallbackUsed: true
  };
}

// Resilient model fallback implementation
export const GEMINI_MODEL_FALLBACK_CHAIN = [
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview"
];

// Execute a resilient Gemini generation
export async function executeResilientGemini(
  aiClient: any,
  payload: { contents: any; config?: any },
  initialModel: string = "gemini-3.7-flash"
): Promise<{ text: string; modelUsed: string; errorTrace?: string }> {
  if (!aiClient) {
    throw new Error("Gemini AI client is uninitialized. Verify API keys in your environment.");
  }

  const modelsToTry = [
    initialModel,
    ...GEMINI_MODEL_FALLBACK_CHAIN.filter(m => m !== initialModel)
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini Resilience Engine] Attempting inference with model: ${model}`);
      const response = await aiClient.models.generateContent({
        model: model,
        contents: payload.contents,
        config: payload.config
      });
      if (response && response.text) {
        return {
          text: response.text,
          modelUsed: model
        };
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback Warning] Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All fallback models in the Gemini resilience chain failed.");
}
