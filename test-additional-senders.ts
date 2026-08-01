import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

async function testAdditionalSenders() {
  const to = "prakashsuvedi.backup@gmail.com";
  const subject = "Diagnostic Sender Verification Test - Round 2";
  const htmlBody = "<h1>Outbound Diagnostics</h1><p>Testing more sender addresses.</p>";

  const senders = [
    "prakash@nepalai.tech",
    "info@nepalai.tech",
    "studio@nepalai.tech",
    "prakashsuvedi@gmail.com",
    "noreply@nepalai.tech",
    "no-reply@nepalai.tech",
    "contact@scamspike.com",
    "onboarding@marketforge.ai",
    "info@marketforge.ai",
    "prakash@scamspike.com"
  ];

  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY is missing!");
    return;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  for (const sender of senders) {
    try {
      console.log(`Trying Sender: ${sender}...`);
      await sgMail.send({
        to,
        from: {
          email: sender,
          name: "MarketForge Test"
        },
        subject: `${subject} - [${sender}]`,
        html: htmlBody
      });
      console.log(`>>> [SUCCESS] Sender [${sender}] is verified and works!`);
      return;
    } catch (err: any) {
      if (err.response && err.response.body && err.response.body.errors) {
        const errMsg = err.response.body.errors[0].message;
        console.log(`❌ [FAILED] [${sender}]: ${errMsg}`);
      } else {
        console.log(`❌ [FAILED] [${sender}]: ${err.message}`);
      }
    }
  }
}

testAdditionalSenders();
