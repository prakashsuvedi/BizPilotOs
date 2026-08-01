import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

async function testMultipleSenders() {
  const to = "prakashsuvedi.backup@gmail.com";
  const subject = "Diagnostic Sender Verification Test";
  const htmlBody = "<h1>Outbound Diagnostics</h1><p>Testing different sender addresses.</p>";

  const senders = [
    "marketforge@scamspike.com",
    "onboarding@scamspike.com",
    "no-reply@scamspike.com",
    "noreply@scamspike.com",
    "system@scamspike.com",
    "info@scamspike.com",
    "admin@scamspike.com",
    "support@scamspike.com",
    "prakash@scamspike.com",
    "prakashsuvedi.backup@gmail.com"
  ];

  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY is missing!");
    return;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  console.log("=========================================");
  console.log("TESTING SENDGRID SENDER IDENTITIES");
  console.log("=========================================");

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
      return; // Stop if we find one that works!
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

testMultipleSenders();
