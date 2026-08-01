# ENTERPRISE RELEASE & DEPLOYMENT PLAN
## Progressive Code Promotion, Rollback Playbooks, & Hotfix Standards

This document establishes the strategic, multi-tier release and deployment playbook for the MarketForge Enterprise Platform.

---

## 1. Code Promotion & Environments

MarketForge strictly isolates runtime environments to safeguard customer production workspaces:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   DEVELOPMENT   │ ───► │     STAGING     │ ───► │   PRODUCTION    │
│  (Sandbox DB)   │      │   (Restore DB)  │      │ (Active/Active) │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

*   **Development**: Volatile local emulators and sandbox databases used for code construction and visual polish.
*   **Staging**: A mirror of the production environment. Daily restored database dumps are used here to run integration tests under real-world conditions.
*   **Production**: High-availability, active-active regional database clusters utilizing strict firewall isolations and Cloud KMS encryption keys.

---

## 2. Progressive Deployment Gates

To promote code from Staging to Production, deployments must complete three sequential validation phases:

### Phase A: Automated Build and CI Auditing
The pipeline executes syntax checks, security scanning, and unit suites automatically on pull request merges:
```bash
npm run lint         # Checks styles and typescript rules
npm run build        # Compiles production-ready artifacts
```

### Phase B: Feature Flag Controls
All major refactorings, API changes, and premium visual updates are guarded behind feature flag checks:
```typescript
if (flags.isFeatureEnabled("NEW_RESERVATION_FLOW")) {
  renderNewBookingFlow();
} else {
  renderStandardBookingFlow();
}
```
Deployments are rolled out progressively to small client pools (e.g. 5% of hotel locations) to verify stability.

### Phase C: Live Smoke Tests
Following code execution in the cloud containers, automated smoke test scripts verify:
1.  **Authentication**: Test accounts can successfully log in and retrieve session values.
2.  **Database Connection**: Read/write loops to Firestore and PostgreSQL verify correct credentials.
3.  **Third-Party API Access**: Connections to payment systems (Stripe) and AI gateways function properly.

---

## 3. Rapid Rollback Playbook

If a deployment fails smoke tests, exhibits elevated error spikes (>1% of operations), or triggers service downtime:

```
┌────────────────────────────────────────────────────────┐
│  STEP 1: Route Traffic Back (Instant DNS/Proxy Swap)   │
├───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STEP 2: Invalidate Cache (Flush Redis memory stores)  │
├───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STEP 3: Post-Mortem Analysis (Isolate fault in Loki)  │
└────────────────────────────────────────────────────────┘
```

1.  **Revert Routing Instantly**: Switch container routing instantly back to the previous stable blue-version release via the API Gateway or Kubernetes Service config.
2.  **Flush Active Cache**: Flush all Redis collections to clear out any corrupted data schemas created by the failed build.
3.  **Lock Migrations (If Relational)**: If database schemas changed, run the automated downgrade migration scripts:
    ```bash
    npm run db:migrate:rollback
    ```

---

## 4. Hotfix Procedures

Critical production bugs (e.g., payment failure, database locking blocks) must bypass standard weekly release pipelines:
1.  **Isolate Hotfix Branch**: Branch directly from the active `main` release tag (e.g., `git checkout -b hotfix/payment-retry`).
2.  **Apply Minimal Fix**: Do not bundle extra visual updates or secondary features into a hotfix. Keep changes strictly localized.
3.  **Run Quick Test Gate**: Execute local unit and smoke suites, bypassing long-running integration tasks if verified by senior QA teams.
4.  **Promote and Release**: Deploy directly to production, document in the active CHANGELOG, and merge changes back to development branches immediately.
