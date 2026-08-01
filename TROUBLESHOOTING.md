# Production Troubleshooting Guide — MarketForge AI™

This guide assists system administrators in locating, analyzing, and resolving issues within the full-stack architecture.

## 🔴 Missing Database/Mock Database Message
- **Symptoms**: The UI states the system is running in "Mock Database Mode" or "Offline Simulation Mode".
- **Resolution**: Provide the required GCP service account credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`) in the Environment manager. The system dynamically connects to the live database when those variables are active.

## 🔴 Outbound Email Dispatch Failures
- **Symptoms**: Emails are queued but never delivered or trigger network timeout states.
- **Resolution**: Check the configured outbound transporter credentials. When using Resend API keys (`RESEND_API_KEY`), the server routes through verified endpoints. Otherwise, ensure SMTP server credentials are valid and port configurations match.

## 🔴 Gemini AI API Rate Limiting or Unauthorized
- **Symptoms**: Ad copy, email campaigns, or Vibe AI Assistant fails with error code `429` or `401`.
- **Resolution**: Verify that the `GEMINI_API_KEY` is set correctly on the server side and has active credit balances with the Google AI Studio Console.

## 🔴 High Memory Utilization Diagnostics
- **Symptoms**: The Diagnostics panel flags RAM usage above 80%.
- **Resolution**: Check for active database listeners or connection pools that may not be released correctly. Use clean primitive dependency parameters in React components to avoid trigger loops.
