# Technical Debt Register — MarketForge AI™

This document registers code optimization areas and ongoing design considerations, guaranteeing high long-term maintainability of the codebase.

---

## 🔍 Code Health Audits

### 1. Unified Single-File Server Consolidation
- **Description**: The core full-stack routing and controller logic is currently consolidated within `/server.ts` to simplify build pipelines and prevent imports collision.
- **Remediation**: In future iterations, modularize `/server.ts` into isolated controllers (e.g., `/server/routes/campaigns.ts`, `/server/controllers/auth.ts`) once the project expands significantly.
- **Priority**: Low.

### 2. Client-side Local Storage Sync Fallback
- **Description**: If a live Firebase credentials configuration is absent during demo cycles, the `SyncEngine` caches and manages edits via `localStorage`.
- **Remediation**: Seamlessly trigger real database collection synchronizations as soon as full GCP resources are provisioned via the Super Admin Portal.
- **Priority**: Low.

### 3. Native Server Resource Extraction
- **Description**: Core system resource consumption (Memory & CPU) in `telemetry/index.ts` is calculated using process-level memory queries with client fallbacks.
- **Remediation**: Build real-time Docker/Kubernetes container monitoring daemon integrations for production clusters.
- **Priority**: Low.
