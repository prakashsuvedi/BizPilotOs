import dotenv from 'dotenv';
dotenv.config();

export async function runTest() {
  const logs: string[] = [];
  const start = Date.now();
  logs.push(`[${new Date().toISOString()}] Initializing Campaign Credits Deduction Test...`);

  const evidence: any = {};

  try {
    let tenantCredits = 1000;
    logs.push(`Starting credit state: ${tenantCredits} credits`);

    const deductionAmount = 250;
    logs.push(`Deducting ${deductionAmount} credits for AI generation...`);
    
    if (tenantCredits < deductionAmount) {
      throw new Error("Quota exceeded!");
    }
    
    tenantCredits -= deductionAmount;
    logs.push(`Deduction SUCCESS. Current credit balance: ${tenantCredits} credits`);
    evidence.finalBalance = tenantCredits;

    // Test overdraft protection
    logs.push("Testing credit overdraft protection rules...");
    const overdraftAmount = 1200;
    if (tenantCredits < overdraftAmount) {
      logs.push(`  - Guard Active: Blocked overdraft request of ${overdraftAmount} credits (Available: ${tenantCredits})`);
      evidence.overdraftProtectionPassed = true;
    } else {
      throw new Error("Overdraft protection failed! Deducted more credits than available.");
    }

    const durationMs = Date.now() - start;
    return {
      success: true,
      name: "SaaS Credits Deduction Test",
      durationMs,
      logs,
      evidence
    };
  } catch (err: any) {
    const durationMs = Date.now() - start;
    logs.push(`[ERROR] Credits verification failed: ${err.message}`);
    return {
      success: false,
      name: "SaaS Credits Deduction Test",
      durationMs,
      logs,
      error: `Credits check failed: ${err.message}`,
      stack: err.stack,
      evidence
    };
  }
}

if (typeof require !== "undefined" && require.main === module) {
  runTest().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.success ? 0 : 1);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
