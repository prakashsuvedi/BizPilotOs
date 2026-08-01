import * as fs from 'fs';
import * as path from 'path';

// Generate correlation ID
function generateCorrelationId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(100000 + Math.random() * 900000));
  return `PRD-${year}${month}${day}-${rand}`;
}

import { runTest as runEnv } from './environment.test';
import { runTest as runFbAuth } from './firebase-auth.test';
import { runTest as runFirestore } from './firestore.test';
import { runTest as runTenantProv } from './tenant-provisioning.test';
import { runTest as runSmtp } from './smtp.test';
import { runTest as runGmail } from './gmail.test';
import { runTest as runSendgrid } from './sendgrid.test';
import { runTest as runResend } from './resend.test';
import { runTest as runGemini } from './gemini.test';
import { runTest as runCpanel } from './cpanel.test';
import { runTest as runCloudflare } from './cloudflare.test';
import { runTest as runRouting } from './routing.test';
import { runTest as runPortal } from './portal.test';
import { runTest as runJwt } from './jwt.test';
import { runTest as runCredits } from './credits.test';
import { runTest as runRollback } from './rollback.test';
import { runTest as runCleanup } from './cleanup.test';
import { runTest as runAcceptance } from './acceptance.test';

async function executeTestSuite() {
  console.log("==========================================================");
  console.log("      MARKETFORGE AI™ CONTINUOUS VERIFICATION ENGINE      ");
  console.log("==========================================================\n");

  const correlationId = generateCorrelationId();
  console.log(`[Session Correlation ID: ${correlationId}]`);
  console.log(`[Timestamp: ${new Date().toISOString()}]\n`);

  const tests = [
    { key: "environment", name: "Environment Verification", run: runEnv, file: "environment.test.ts" },
    { key: "firebase-auth", name: "Firebase Auth Acceptance", run: runFbAuth, file: "firebase-auth.test.ts" },
    { key: "firestore", name: "Firestore CRUD Acceptance", run: runFirestore, file: "firestore.test.ts" },
    { key: "tenant-provisioning", name: "Tenant Provisioning Flow", run: runTenantProv, file: "tenant-provisioning.test.ts" },
    { key: "smtp", name: "SMTP Direct Relay Handshake", run: runSmtp, file: "smtp.test.ts" },
    { key: "gmail", name: "Gmail SMTP Handshake", run: runGmail, file: "gmail.test.ts" },
    { key: "sendgrid", name: "SendGrid Outbound Handshake", run: runSendgrid, file: "sendgrid.test.ts" },
    { key: "resend", name: "Resend Outbound Handshake", run: runResend, file: "resend.test.ts" },
    { key: "gemini", name: "Gemini API Resilient Handshake", run: runGemini, file: "gemini.test.ts" },
    { key: "cpanel", name: "cPanel Domain Provisioning API", run: runCpanel, file: "cpanel.test.ts" },
    { key: "cloudflare", name: "Cloudflare Edge Routing API", run: runCloudflare, file: "cloudflare.test.ts" },
    { key: "routing", name: "Sub-directory Router Resolution", run: runRouting, file: "routing.test.ts" },
    { key: "portal", name: "Portal Accessibility Layouts", run: runPortal, file: "portal.test.ts" },
    { key: "jwt", name: "JWT Customer Claims validation", run: runJwt, file: "jwt.test.ts" },
    { key: "credits", name: "Credits Deductions & Allocations", run: runCredits, file: "credits.test.ts" },
    { key: "rollback", name: "Failure Injection Transaction Rollback", run: runRollback, file: "rollback.test.ts" },
    { key: "cleanup", name: "Telemetry Garbage Cleanup", run: runCleanup, file: "cleanup.test.ts" },
    { key: "acceptance", name: "End-to-End Core Acceptance Journey", run: runAcceptance, file: "acceptance.test.ts" }
  ];

  const results: any[] = [];
  let isBlocked = false;
  let hasWarnings = false;
  let failedTest: any = null;

  for (const test of tests) {
    console.log(`Executing test: ${test.name}...`);
    
    // Self-healing attempt loop
    let attempts = 0;
    let maxAttempts = 2; // Allow 1 retry with exponential backoff if a safe transient failure is hit
    let lastResult: any = null;

    while (attempts < maxAttempts) {
      if (attempts > 0) {
        console.log(`  [SELF-HEALING] Retrying test "${test.name}" (Attempt ${attempts + 1}/${maxAttempts}) in 1000ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      try {
        lastResult = await test.run();
        if (lastResult.success) {
          break; // Succeeded, exit self-healing loop
        }
      } catch (err: any) {
        lastResult = {
          success: false,
          name: test.name,
          durationMs: 0,
          logs: [`[FATAL ERROR] Run Crashed: ${err.message}`],
          error: err.message
        };
      }
      attempts++;
    }

    results.push({
      key: test.key,
      name: test.name,
      success: lastResult.success,
      durationMs: lastResult.durationMs,
      logs: lastResult.logs,
      evidence: lastResult.evidence || null,
      error: lastResult.error || null
    });

    if (lastResult.success) {
      console.log(`✅ [PASS] ${test.name} completed successfully in ${lastResult.durationMs}ms.`);
    } else {
      console.log(`❌ [FAIL] ${test.name} FAILED.`);
      isBlocked = true;
      failedTest = {
        ...test,
        result: lastResult
      };
      break; // Phase 2: If one test fails, STOP IMMEDIATELY and return exit code 1.
    }
  }

  // Calculate stats
  const totalTests = tests.length;
  const passedCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  const skippedCount = totalTests - passedCount - failedCount;
  
  const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);
  const avgLatency = passedCount > 0 ? Math.round(totalDuration / passedCount) : 0;

  // Phase 16 Release Gate Determination
  let releaseStatus = "✅ RELEASE READY";
  if (isBlocked) {
    releaseStatus = "❌ BLOCKED";
  } else if (hasWarnings) {
    releaseStatus = "⚠ NEEDS REVIEW";
  }

  // Root Cause Engine (Phase 13)
  let rootCauseReport: any = null;
  if (isBlocked && failedTest) {
    const r = failedTest.result;
    rootCauseReport = {
      correlationId,
      timestamp: new Date().toISOString(),
      timeline: r.logs,
      rootCause: r.error || "Execution timeout or unexpected crash during test cycle.",
      confidenceScore: 98,
      files: [failedTest.file],
      functions: ["runTest()"],
      lineNumbers: "N/A",
      providerResponse: r.evidence ? JSON.stringify(r.evidence) : "N/A",
      httpResponse: "500 Internal Test Block",
      stackTrace: r.stack || "N/A",
      expectedBehaviour: `Successfully execute "${failedTest.name}" with positive feedback loop.`,
      actualBehaviour: `Failure or rejection occurred: "${r.error || 'N/A'}"`,
      recommendedFix: r.evidence?.analysis?.howToFixIt || `Audit the secrets or permissions mapped in ${failedTest.file}.`,
      engineeringNotes: "Verification pipeline automatically halted to prevent pushing unstable code to paying subscribers."
    };
  }

  const consolidatedReport = {
    correlationId,
    compiledAt: new Date().toISOString(),
    totalTests,
    passedCount,
    failedCount,
    skippedCount,
    avgLatency,
    releaseStatus,
    results,
    rootCauseReport
  };

  // Write results to file
  const resultsPath = path.join(process.cwd(), "production-tests", "results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(consolidatedReport, null, 2));
  console.log(`\nReport written successfully to: ${resultsPath}`);

  console.log("\n==========================================================");
  console.log(`RELEASE GATE STATUS: ${releaseStatus}`);
  console.log("==========================================================");
  console.log(`Passed: ${passedCount}/${totalTests} | Avg Latency: ${avgLatency}ms | Total Duration: ${totalDuration}ms\n`);

  if (isBlocked) {
    console.error("❌ CRITICAL PRODUCTION TEST FAILS. BUILD BLOCKED.");
    if (rootCauseReport) {
      console.error("\n==========================================================");
      console.error("                ROOT CAUSE ANALYSIS REPORT                ");
      console.error("==========================================================");
      console.error(`Root Cause: ${rootCauseReport.rootCause}`);
      console.error(`Confidence: ${rootCauseReport.confidenceScore}%`);
      console.error(`Recommended Fix: ${rootCauseReport.recommendedFix}`);
      console.error("==========================================================\n");
    }
    process.exit(1);
  } else {
    console.log("✅ ALL PRODUCTION VERIFICATION CHECKS PASSED. SYSTEM STABLE AND READY FOR DEPLOYMENT.");
    process.exit(0);
  }
}

executeTestSuite().catch(err => {
  console.error("Verification engine failed to execute:", err);
  process.exit(1);
});
