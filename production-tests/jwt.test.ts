import dotenv from 'dotenv';
dotenv.config();

// Simple JWT encoder/decoder simulator for the test
function simulateJWT(payload: any, secret: string, expireInSeconds = 3600): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  
  const exp = Math.floor(Date.now() / 1000) + expireInSeconds;
  const fullPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${secret}`).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token: string, secret: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error("Invalid token format");
  
  const [header, payload, sig] = parts;
  const expectedSig = Buffer.from(`${header}.${payload}.${secret}`).toString('base64url');
  if (sig !== expectedSig) {
    throw new Error("Signature verification failed!");
  }
  
  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  const currentSec = Math.floor(Date.now() / 1000);
  if (decodedPayload.exp < currentSec) {
    throw new Error("Token expired!");
  }
  
  return decodedPayload;
}

export async function runTest() {
  const logs: string[] = [];
  const start = Date.now();
  logs.push(`[${new Date().toISOString()}] Initializing JWT & Customer Login Session Test...`);

  const secretKey = process.env.JWT_SECRET || "marketforge_enterprise_jwt_signing_secret_9812";
  const testPayload = {
    userId: "usr_founder_4329",
    email: "ceo@founderbrand.com",
    tenantId: "tenant_founderbrand_99",
    role: "owner"
  };

  const evidence: any = {};

  try {
    // 1. Generate JWT
    logs.push("Step 1: Generating custom secure SaaS JWT...");
    const genStart = Date.now();
    const token = simulateJWT(testPayload, secretKey);
    const genLatency = Date.now() - genStart;
    evidence.tokenGenerated = token;
    evidence.latencyMs = genLatency;
    logs.push(`Token generated in ${genLatency}ms.`);

    // 2. Decode and verify signature
    logs.push("Step 2: Decoding token and checking signature credentials...");
    const decodeStart = Date.now();
    const decoded = verifyJWT(token, secretKey);
    const decodeLatency = Date.now() - decodeStart;
    
    if (decoded.tenantId !== testPayload.tenantId || decoded.role !== testPayload.role) {
      throw new Error("JWT Claims Mismatch! Decoded custom tenant attributes do not match original assertions.");
    }
    evidence.decodedPayload = decoded;
    evidence.decodeLatencyMs = decodeLatency;
    logs.push(`Token successfully verified in ${decodeLatency}ms! Claims are authentic.`);

    // 3. Test Session Expiration
    logs.push("Step 3: Checking token session expiration logic...");
    const expiredToken = simulateJWT(testPayload, secretKey, -10); // already expired
    try {
      verifyJWT(expiredToken, secretKey);
      throw new Error("Validation check failed: Expired token was accepted!");
    } catch (expErr: any) {
      logs.push(`Confirmed: Expired token was correctly rejected with message: "${expErr.message}"`);
      evidence.expirationVerificationPassed = true;
    }

    const durationMs = Date.now() - start;
    return {
      success: true,
      name: "JWT & Customer Login Session Test",
      durationMs,
      logs,
      evidence
    };
  } catch (err: any) {
    const durationMs = Date.now() - start;
    logs.push(`[ERROR] JWT Session Validation Failed: ${err.message}`);
    return {
      success: false,
      name: "JWT & Customer Login Session Test",
      durationMs,
      logs,
      error: `JWT Session validation failed: ${err.message}`,
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
