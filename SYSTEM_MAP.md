# System Map — MarketForge AI™

This document outlines the conceptual boundaries and network layers governing the entire platform architecture.

```
+--------------------------------------------------------------+
|                     1. Browser React UI                      |
|  - Components: Onboarding, AdStudio, EmailStudio             |
|  - State: SyncEngine, Local storage fallback                 |
+--------------------------------------------------------------+
                               |
                               | (HTTPS REST / JWT authenticated)
                               v
+--------------------------------------------------------------+
|                     2. Express Web Server                    |
|  - Router: /api/admin/*, /api/onboarding/*                   |
|  - Middlewares: Tenant isolator, Token verifier             |
+--------------------------------------------------------------+
                               |
       +-----------------------+-----------------------+
       |                                               |
       v                                               v
+----------------------------+           +----------------------------+
|  3. AI Orchestrator Core   |           |    4. SaaS Repositories     |
| - Gemini API Key proxy     |           | - getFromSaaSStore         |
| - Safety filters, prompts  |           | - saveToSaaSStore          |
+----------------------------+           +----------------------------+
       |                                               |
       v                                               v
+----------------------------+           +----------------------------+
|    Outbound Email Hub      |           |     Firestore Database     |
| - Resend / SMTP Delivery   |           | - remixed-firestore        |
+----------------------------+           +----------------------------+
```

## 🔒 Security Isolation Points
- **Client/Server separation**: API Keys are NEVER shared with the browser interface.
- **Tenant boundaries**: No cross-tenant document can be fetched; the tenant ID is validated server-side for all queries.
