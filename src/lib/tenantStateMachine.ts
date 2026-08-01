// MarketForge AI - Enterprise Tenant State Machine (Phase 1 Redesign & 22-Step Split)
// Implements transactional verified lifecycle states, logs, measurements, retries, and rollback tracking.

import { generateCorrelationId, logProductionExecution } from "./enterpriseDebug";

export enum TenantLifecycleState {
  STEP_01_VALIDATE_REQUEST = "STEP_01_VALIDATE_REQUEST",
  STEP_02_VALIDATE_WORKSPACE_NAME = "STEP_02_VALIDATE_WORKSPACE_NAME",
  STEP_03_RESERVE_WORKSPACE = "STEP_03_RESERVE_WORKSPACE",
  STEP_04_VERIFY_RESERVATION = "STEP_04_VERIFY_RESERVATION",
  STEP_05_CREATE_FIREBASE_USER = "STEP_05_CREATE_FIREBASE_USER",
  STEP_06_READ_FIREBASE_USER = "STEP_06_READ_FIREBASE_USER",
  STEP_07_ASSIGN_CLAIMS = "STEP_07_ASSIGN_CLAIMS",
  STEP_08_READ_CLAIMS = "STEP_08_READ_CLAIMS",
  STEP_09_CREATE_FIRESTORE_TENANT = "STEP_09_CREATE_FIRESTORE_TENANT",
  STEP_10_READ_FIRESTORE_TENANT = "STEP_10_READ_FIRESTORE_TENANT",
  STEP_11_CREATE_FIRESTORE_USER = "STEP_11_CREATE_FIRESTORE_USER",
  STEP_12_READ_FIRESTORE_USER = "STEP_12_READ_FIRESTORE_USER",
  STEP_13_GENERATE_VERIFICATION_LINK = "STEP_13_GENERATE_VERIFICATION_LINK",
  STEP_14_VERIFY_LINK = "STEP_14_VERIFY_LINK",
  STEP_15_CONNECT_EMAIL_PROVIDER = "STEP_15_CONNECT_EMAIL_PROVIDER",
  STEP_16_AUTHENTICATE_EMAIL_PROVIDER = "STEP_16_AUTHENTICATE_EMAIL_PROVIDER",
  STEP_17_RENDER_TEMPLATE = "STEP_17_RENDER_TEMPLATE",
  STEP_18_SEND_EMAIL = "STEP_18_SEND_EMAIL",
  STEP_19_VERIFY_PROVIDER_ACCEPTED = "STEP_19_VERIFY_PROVIDER_ACCEPTED",
  STEP_20_INITIALIZE_PORTAL = "STEP_20_INITIALIZE_PORTAL",
  STEP_21_VERIFY_PORTAL = "STEP_21_VERIFY_PORTAL",
  STEP_22_ACTIVATE_TENANT = "STEP_22_ACTIVATE_TENANT"
}

export interface StateTransitionTrace {
  state: TenantLifecycleState;
  timestamp: string;
  durationMs: number;
  retryCount: number;
  correlationId: string;
  message: string;
  success: boolean;
  errorDetails?: string;
  rollbackStrategy?: string;
}

export interface TenantProgressTracker {
  tenantId: string;
  correlationId: string;
  currentState: TenantLifecycleState;
  stepIndex: number;
  history: StateTransitionTrace[];
  isRollingBack: boolean;
  rollbackLog: string[];
}

// In-Memory global registry of provisioning jobs for real-time visual progress monitoring
export const activeProvisioningStates: Record<string, TenantProgressTracker> = {};

export function initializeProgressTracker(tenantId: string): TenantProgressTracker {
  const correlationId = generateCorrelationId();
  const tracker: TenantProgressTracker = {
    tenantId,
    correlationId,
    currentState: TenantLifecycleState.STEP_01_VALIDATE_REQUEST,
    stepIndex: 0,
    history: [
      {
        state: TenantLifecycleState.STEP_01_VALIDATE_REQUEST,
        timestamp: new Date().toISOString(),
        durationMs: 0,
        retryCount: 0,
        correlationId,
        message: "Provisioning state machine initialized.",
        success: true,
        rollbackStrategy: "None needed at init."
      }
    ],
    isRollingBack: false,
    rollbackLog: []
  };
  activeProvisioningStates[tenantId] = tracker;
  return tracker;
}

export async function transitionLifecycleState(
  tenantId: string,
  targetState: TenantLifecycleState,
  message: string,
  executeTaskWithRetry: () => Promise<void>,
  rollbackAction?: string
): Promise<void> {
  let tracker = activeProvisioningStates[tenantId];
  if (!tracker) {
    tracker = initializeProgressTracker(tenantId);
  }

  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 3;
  let success = false;
  let lastError: Error | null = null;

  tracker.currentState = targetState;
  const steps = Object.values(TenantLifecycleState);
  tracker.stepIndex = steps.indexOf(targetState);

  while (retryCount < maxRetries && !success) {
    try {
      // Execute the task block linked to this step transition
      await executeTaskWithRetry();
      success = true;
    } catch (err: any) {
      retryCount++;
      lastError = err;
      console.warn(`[State Machine] Retrying stage ${targetState} for ${tenantId} (${retryCount}/${maxRetries}): ${err.message}`);
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200)); // transient pause before retry
      }
    }
  }

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  const trace: StateTransitionTrace = {
    state: targetState,
    timestamp: new Date().toISOString(),
    durationMs,
    retryCount,
    correlationId: tracker.correlationId,
    message: success ? message : `Stage failed after ${retryCount} retries: ${lastError?.message}`,
    success,
    errorDetails: success ? undefined : lastError?.message,
    rollbackStrategy: rollbackAction || "Standard cascade rollback stack."
  };

  tracker.history.push(trace);

  // Write details to Enterprise Production Execution Logs
  await logProductionExecution({
    correlationId: tracker.correlationId,
    timestamp: trace.timestamp,
    durationMs,
    module: "TenantStateMachine",
    functionName: `transitionTo(${targetState})`,
    input: JSON.stringify({ tenantId, targetState }),
    output: JSON.stringify({ success, message: trace.message }),
    retryCount,
    rollbackStatus: success ? "None" : "Pending",
    finalResult: success ? "SUCCESS" : "FAIL",
    errorDetails: trace.errorDetails
  });

  if (!success) {
    tracker.isRollingBack = true;
    tracker.rollbackLog.push(`[Failure trigger at ${targetState}] Initiating full cascade rollback stack.`);
    if (lastError) {
      lastError.message = `State machine transition failed at state ${targetState}: ${lastError.message}`;
      throw lastError;
    } else {
      throw new Error(`State machine transition failed at state ${targetState}: unknown`);
    }
  }
}
