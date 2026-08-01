import { getAdminAuth, getIsRealAdminReady } from './src/lib/firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

async function testFirebaseAdminAuth() {
  const adminAuth = getAdminAuth();
  const isReal = getIsRealAdminReady();

  console.log("=================================================");
  console.log("TESTING FIREBASE AUTHENTICATION FLOW VIA ADMIN SDK");
  console.log("=================================================");
  console.log("Is Admin Ready:", isReal);

  if (!adminAuth || !isReal) {
    console.log("STATUS: NOT VERIFIED (Admin Auth SDK is in simulator fallback mode)");
    return;
  }

  const email = `test-auth-verify-${Date.now()}@scamspike.com`;
  const uid = `test-uid-${Date.now()}`;
  const start = Date.now();

  try {
    // 1. Create User
    console.log(`[1] Creating temporary user: ${email} (UID: ${uid})`);
    const user = await adminAuth.createUser({
      uid,
      email,
      emailVerified: false,
      displayName: "Zero Trust QA Verifier"
    });
    console.log(`[PASS] User created. UID: ${user.uid}, Email: ${user.email}`);

    // 2. Set Custom Claims
    console.log(`[2] Assigning custom claims: { tenantId: 'test-tenant-claims', role: 'owner' }`);
    await adminAuth.setCustomUserClaims(uid, { tenantId: 'test-tenant-claims', role: 'owner' });
    console.log(`[PASS] Claims written.`);

    // 3. Read Claims Back
    console.log(`[3] Retrieving user to verify claims propagation`);
    const retrievedUser = await adminAuth.getUser(uid);
    console.log(`[PASS] Custom claims:`, JSON.stringify(retrievedUser.customClaims));
    if (retrievedUser.customClaims?.tenantId !== 'test-tenant-claims') {
      throw new Error("Claims mismatch or did not propagate!");
    }

    // 4. Generate Verification Link
    console.log(`[4] Generating email verification link`);
    const link = await adminAuth.generateEmailVerificationLink(email);
    console.log(`[PASS] Link generated: ${link}`);

    // 5. Delete User
    console.log(`[5] Cleaning up - Deleting temporary user: ${uid}`);
    await adminAuth.deleteUser(uid);
    console.log(`[PASS] User deleted cleanly.`);

    const duration = Date.now() - start;
    console.log(`=================================================`);
    console.log(`AUTHENTICATION FLOW VERIFIED SUCCESSFULLY IN ${duration}ms`);
    console.log(`=================================================`);
  } catch (error: any) {
    console.error(`[FAIL] Flow failed with exception:`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

testFirebaseAdminAuth();
