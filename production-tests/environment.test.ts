import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { getAdminDb, getAdminAuth, getIsRealAdminReady } from '../src/lib/firebase-admin';

export async function runTest() {
  const logs: string[] = [];
  const start = Date.now();
  logs.push(`[${new Date().toISOString()}] Initializing Environment Validator...`);

  try {
    const envs = process.env;

    // 1. Check Node Version
    const nodeVersion = process.version;
    logs.push(`Node Version: ${nodeVersion}`);
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion < 18) {
      throw {
        missingVariable: "NODE_VERSION",
        expectedFormat: ">= v18.0.0",
        reason: `Current version ${nodeVersion} is outdated. Modern Express & @google/genai requires Node 18+ for native fetch and module support.`,
        howToFix: "Upgrade Node.js in your hosting container, environment, or package engine.",
        docRef: "https://nodejs.org/"
      };
    }

    // 2. Check Package versions
    const pkgPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath)) {
      throw {
        missingVariable: "package.json",
        expectedFormat: "File presence in project root",
        reason: "package.json file is completely missing, which prevents dependency analysis.",
        howToFix: "Restore package.json to the workspace root directory.",
        docRef: "https://docs.npmjs.com/cli/v10/configuring-npm/package-json"
      };
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    logs.push(`Verified package.json presence. App version: ${pkg.version || '0.0.0'}`);

    // 3. Verify Firebase Configuration
    const fbConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
    const hasFbConfig = fs.existsSync(fbConfigPath);
    logs.push(`Firebase Applet Config file: ${hasFbConfig ? "PRESENT" : "MISSING"}`);

    const isFbReal = getIsRealAdminReady();
    logs.push(`Firebase Admin SDK Status: ${isFbReal ? "LIVE INTEGRATION" : "SIMULATED BACKUP"}`);

    // 4. Verify SMTP & Email configs
    const emailProvider = envs.EMAIL_PROVIDER || 'simulator';
    logs.push(`Configured Email Provider: ${emailProvider}`);

    if (emailProvider === 'smtp' || emailProvider === 'gmail') {
      const requiredSmtp = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
      for (const key of requiredSmtp) {
        if (!envs[key]) {
          throw {
            missingVariable: key,
            expectedFormat: key === 'SMTP_PORT' ? "Integer (e.g. 587 or 465)" : "Non-empty string",
            reason: `Email provider is set to '${emailProvider}', but the essential SMTP secret ${key} is unconfigured.`,
            howToFix: `Provide the credentials inside your environment dashboard settings or .env file as ${key}=value.`,
            docRef: "https://nodemailer.com/smtp/"
          };
        }
      }
    } else if (emailProvider === 'sendgrid') {
      if (!envs.SENDGRID_API_KEY) {
        throw {
          missingVariable: "SENDGRID_API_KEY",
          expectedFormat: "SG.xxxxxxxxxx API Key",
          reason: "Email provider is configured for SendGrid, but no SENDGRID_API_KEY secret exists.",
          howToFix: "Generate a SendGrid API token with Full Access mail permissions and assign it to the SENDGRID_API_KEY environment variable.",
          docRef: "https://sendgrid.com/docs/for-developers/sending-email/api-key/"
        };
      }
    } else if (emailProvider === 'resend') {
      if (!envs.RESEND_API_KEY) {
        throw {
          missingVariable: "RESEND_API_KEY",
          expectedFormat: "re_xxxxxxxx API Key",
          reason: "Email provider is configured for Resend, but no RESEND_API_KEY secret exists.",
          howToFix: "Generate a Resend API token and configure it as the RESEND_API_KEY environment variable.",
          docRef: "https://resend.com/docs/dashboard/api-keys"
        };
      }
    }

    // 5. Verify Gemini API Key
    const geminiKey = envs.GEMINI_API_KEY;
    logs.push(`Gemini API Key: ${geminiKey ? "PRESENT" : "MISSING (Simulated fallback only)"}`);
    if (!geminiKey) {
      throw {
        missingVariable: "GEMINI_API_KEY",
        expectedFormat: "AIzaSy... Google API key",
        reason: "No Gemini AI key configured. Critical marketing and brand intelligence features will fail to process.",
        howToFix: "Go to Google AI Studio, create an API Key, and set GEMINI_API_KEY in your hosting dashboard variables.",
        docRef: "https://ai.google.dev/gemini-api/docs/api-key"
      };
    }

    // 6. Verify cPanel
    const cpanelHost = envs.CPANEL_HOST;
    const cpanelUser = envs.CPANEL_USER;
    const cpanelToken = envs.CPANEL_API_TOKEN;
    logs.push(`cPanel Configuration: ${cpanelHost ? "Host: " + cpanelHost : "Unconfigured"}`);

    // 7. Verify Port
    logs.push(`Target Binding Port: 3000 (Required for internal ingress proxying)`);

    const durationMs = Date.now() - start;
    return {
      success: true,
      name: "Environment Validation",
      durationMs,
      logs,
      evidence: {
        nodeVersion,
        emailProvider,
        isFirebaseReal: isFbReal,
        hasGeminiKey: !!geminiKey,
        hasCpanelToken: !!cpanelToken
      }
    };
  } catch (err: any) {
    const durationMs = Date.now() - start;
    if (err.missingVariable) {
      logs.push(`[ERROR] Missing Configuration: ${err.missingVariable}`);
      return {
        success: false,
        name: "Environment Validation",
        durationMs,
        logs,
        error: `Missing Variable: ${err.missingVariable}\nExpected Format: ${err.expectedFormat}\nReason: ${err.reason}\nHow to Fix: ${err.howToFix}\nReference: ${err.docRef}`,
        evidence: err
      };
    }
    return {
      success: false,
      name: "Environment Validation",
      durationMs,
      logs,
      error: err.message || err,
      stack: err.stack
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
