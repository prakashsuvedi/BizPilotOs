import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

dotenv.config();

async function testEmailDispatch() {
  const to = "prakashsuvedi.backup@gmail.com";
  const subject = "Diagnostic Test Outbound Mail";
  const htmlBody = "<h1>Outbound Diagnostics</h1><p>Testing connection pathways.</p>";
  const displayName = "MarketForge QA System";

  console.log("================================================");
  console.log("EMAIL DISPATCH GATEWAY DIAGNOSTICS");
  console.log("================================================");
  console.log("EMAIL_PROVIDER env:", process.env.EMAIL_PROVIDER);
  console.log("SENDGRID_API_KEY present:", !!process.env.SENDGRID_API_KEY);
  console.log("SENDGRID_FROM_EMAIL:", process.env.SENDGRID_FROM_EMAIL);
  console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);
  console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL);
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS present:", !!process.env.SMTP_PASS);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);

  // SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log("\n[SendGrid] Attempting dispatch...");
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const res = await sgMail.send({
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "no-reply@marketforge.ai",
          name: displayName
        },
        subject,
        html: htmlBody
      });
      console.log("[SendGrid] PASS. Response:", res);
    } catch (err: any) {
      console.error("[SendGrid] FAIL:", err.message);
      if (err.response) {
        console.error("Status Code:", err.response.statusCode);
        console.error("Body:", JSON.stringify(err.response.body));
      }
    }
  }

  // Resend
  if (process.env.RESEND_API_KEY) {
    try {
      console.log("\n[Resend] Attempting dispatch...");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `"${displayName}" <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
          to: [to],
          subject: subject,
          html: htmlBody
        })
      });
      const text = await response.text();
      console.log("[Resend] Status:", response.status, "Response:", text);
    } catch (err: any) {
      console.error("[Resend] FAIL:", err.message);
    }
  }

  // SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log("\n[SMTP] Attempting dispatch...");
      const port = parseInt(process.env.SMTP_PORT || "587");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      const info = await transporter.sendMail({
        from: `"${displayName}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlBody
      });
      console.log("[SMTP] PASS. Info:", info);
    } catch (err: any) {
      console.error("[SMTP] FAIL:", err.message);
    }
  }
}

testEmailDispatch();
