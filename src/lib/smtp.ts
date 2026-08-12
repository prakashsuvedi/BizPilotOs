import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Supported failure types for our SMTP diagnostic mapper.
 */
export type SmtpFailureType =
  | 'TLS Failure'
  | 'SPF Failure'
  | 'Authentication Failure'
  | 'Network/Timeout Failure'
  | 'DNS Resolution Failure'
  | 'Quota Exceeded'
  | 'Unknown Failure';

export interface SmtpDiagnosticResult {
  failureType: SmtpFailureType;
  rootCause: string;
  whyItHappened: string;
  actionableFix: string;
  failedConfigValue: string;
  docUrl: string;
}

/**
 * Detailed SMTP Error Mapper. Analyzes raw outbound SMTP/Nodemailer exceptions
 * and extracts precise root causes, explanations, and instructions to resolve them.
 *
 * @param err The raw error thrown by nodemailer or network layer.
 * @param configValue Diagnostic info showing the attempted SMTP host configuration.
 */
export function mapSmtpError(err: any, configValue: string): SmtpDiagnosticResult {
  const errMsg = String(err.message || err).toLowerCase();
  const errCode = String(err.code || '').toLowerCase();

  // 1. Authentication Failure
  if (
    errMsg.includes('authentication failed') ||
    errMsg.includes('auth') ||
    errMsg.includes('535') ||
    errMsg.includes('unauthorized') ||
    errMsg.includes('credentials') ||
    errCode === 'eauth'
  ) {
    return {
      failureType: 'Authentication Failure',
      rootCause: 'Invalid SMTP Credentials',
      whyItHappened: 'The SMTP server rejected the username/password combination or the API token provided in the configuration.',
      actionableFix: 'Check that your SMTP_USER and SMTP_PASS environment variables are correct. If using an external mail relay like SendGrid, ensure you are using the exact username "apikey" and a valid, active API key as the password.',
      failedConfigValue: configValue,
      docUrl: 'https://nodemailer.com/smtp/#authentication',
    };
  }

  // 2. TLS / SSL Failure
  if (
    errMsg.includes('certificate') ||
    errMsg.includes('tls') ||
    errMsg.includes('ssl') ||
    errMsg.includes('self-signed') ||
    errMsg.includes('handshake') ||
    errMsg.includes('version') ||
    errMsg.includes('secure') ||
    errCode.includes('tls') ||
    errCode.includes('ssl')
  ) {
    return {
      failureType: 'TLS Failure',
      rootCause: 'TLS/SSL Cryptographic Handshake Mismatch',
      whyItHappened: 'The client and SMTP server failed to establish a secure TLS session due to a cipher suite mismatch, self-signed certificate rejection, or incorrect port security bindings.',
      actionableFix: 'Verify SMTP_PORT. Port 465 requires "secure: true" (implicit SMTPS), while port 587 requires "secure: false" with STARTTLS upgrade. If testing with a self-signed dev certificate, you can temporarily allow it by setting "tls.rejectUnauthorized = false" in your nodemailer options.',
      failedConfigValue: configValue,
      docUrl: 'https://nodemailer.com/smtp/secure/',
    };
  }

  // 3. SPF / DKIM / Sender Verification Failure
  if (
    errMsg.includes('sender identity') ||
    errMsg.includes('sender-identity') ||
    errMsg.includes('550') ||
    errMsg.includes('unverified') ||
    errMsg.includes('sender address rejected') ||
    errMsg.includes('spf') ||
    errMsg.includes('dkim') ||
    errMsg.includes('dmarc')
  ) {
    return {
      failureType: 'SPF Failure',
      rootCause: 'Sender Address or SPF/DKIM Policy Block',
      whyItHappened: 'The SMTP server rejected the dispatch because the "From" address is not verified by the sender account, or the host fails outbound SPF, DKIM, or DMARC authentication policies.',
      actionableFix: 'Ensure that the "SMTP_FROM_EMAIL" address exactly matches a single verified sender identity or domain verified in your SMTP provider dashboard (e.g., SendGrid -> Settings -> Sender Authentication). Also check your domain DNS settings to ensure SPF/DKIM records align with your SMTP relay IPs.',
      failedConfigValue: configValue,
      docUrl: 'https://sendgrid.com/docs/for-developers/sending-email/sender-identity/',
    };
  }

  // 4. Network / Firewall Timeout
  if (
    errMsg.includes('timeout') ||
    errMsg.includes('etimedout') ||
    errMsg.includes('connection reset') ||
    errMsg.includes('econnrefused') ||
    errMsg.includes('timed out') ||
    errCode === 'etimedout' ||
    errCode === 'econnrefused'
  ) {
    return {
      failureType: 'Network/Timeout Failure',
      rootCause: 'Outbound TCP Connection Block / Network Timeout',
      whyItHappened: 'The connection to the SMTP server host timed out or was actively refused. Cloud providers (like AWS, Google Cloud, DigitalOcean) frequently block outbound TCP port 25, 465, or 587 by default to prevent spam.',
      actionableFix: 'Check that outbound connections to your SMTP port are permitted by your network security groups, firewalls, or hosting environment. If using port 25 or 587 and encountering blocks, use port 465 or transition to a Web API-based delivery service (like SendGrid/Resend HTTP APIs).',
      failedConfigValue: configValue,
      docUrl: 'https://nodemailer.com/smtp/secure/#firewall',
    };
  }

  // 5. DNS Resolution Failure
  if (
    errMsg.includes('enotfound') ||
    errMsg.includes('dns') ||
    errMsg.includes('getaddrinfo') ||
    errCode === 'enotfound'
  ) {
    return {
      failureType: 'DNS Resolution Failure',
      rootCause: 'SMTP Hostname DNS Resolution Failed',
      whyItHappened: 'The local DNS resolver on your container or hosting environment failed to resolve the SMTP server host into an IP address.',
      actionableFix: 'Ensure that your "SMTP_HOST" value is correct and does not contain a protocol prefix (e.g., use "smtp.sendgrid.net" instead of "smtp://smtp.sendgrid.net" or "https://smtp.sendgrid.net"). Verify that your system has functioning DNS servers configured.',
      failedConfigValue: configValue,
      docUrl: 'https://nodemailer.com/smtp/',
    };
  }

  // 6. Quota / Volume Exceeded
  if (
    errMsg.includes('quota') ||
    errMsg.includes('limit') ||
    errMsg.includes('rate limit') ||
    errMsg.includes('421') ||
    errMsg.includes('451') ||
    errMsg.includes('too many requests')
  ) {
    return {
      failureType: 'Quota Exceeded',
      rootCause: 'Outbound SMTP Volume Quota Exceeded',
      whyItHappened: 'The SMTP host has throttled or blocked your account because the daily or hourly outbound email volume limits have been exceeded.',
      actionableFix: 'Upgrade your SMTP provider plan (e.g., moving from SendGrid Free to a Paid plan), space out your bulk transactions, or contact support to request an increase in your sending threshold.',
      failedConfigValue: configValue,
      docUrl: 'https://sendgrid.com/docs/ui/sending-email/billing-and-limits/',
    };
  }

  // Default: Unknown / Unclassified Failure
  return {
    failureType: 'Unknown Failure',
    rootCause: 'Unhandled SMTP Transport Exception',
    whyItHappened: `The mailer returned an unhandled error: ${err.message || err}`,
    actionableFix: 'Audit your detailed SMTP parameters, verify that the target port accepts standard SMTP connections, and check raw client logs for protocol errors.',
    failedConfigValue: configValue,
    docUrl: 'https://nodemailer.com/smtp/',
  };
}

/**
 * Creates a standard Nodemailer transport based on environment variables.
 */
export function createSmtpTransporter(): nodemailer.Transporter {
  const host = (process.env.SMTP_HOST && !process.env.SMTP_HOST.includes("sendgrid")) ? process.env.SMTP_HOST : 'scamspike.com';
  const portStr = process.env.SMTP_PORT || '465';
  const port = parseInt(portStr, 10);
  const user = process.env.SMTP_USER || 'marketforge@scamspike.com';
  const pass = process.env.SMTP_PASS || 'MkForge_2026_SecurePass!';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 8000,
  });
}

/**
 * Sends an email using SMTP with active diagnostic mapping on failure.
 */
export async function sendSmtpEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; messageId?: string; diagnostic?: SmtpDiagnosticResult }> {
  const from = options.from || process.env.SMTP_FROM_EMAIL || 'marketforge@scamspike.com';
  const host = process.env.SMTP_HOST || 'scamspike.com';

  try {
    const transporter = createSmtpTransporter();

    const info = await transporter.sendMail({
      from: `"MarketForge" <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    const diagnostic = mapSmtpError(err, `${host}:${process.env.SMTP_PORT || '465'}`);
    return {
      success: false,
      diagnostic,
    };
  }
}
