# QA VALIDATION & SYSTEM TESTING PYRAMID
## Automated Multi-Tier Verification, Compliance Scans, & Deployment Gates

This document defines the Quality Assurance validation matrix for MarketForge, ensuring zero regressions across all core features.

---

## 1. Automated Test Coverage Blueprint

```
                      [PLAYWRIGHT END-TO-END FLOWS]
                         - Verification Rate: 10%
                                     │
                                     ▼
                      [INTEGRATION MIDDLEWARE TESTS]
                         - Verification Rate: 30%
                                     │
                                     ▼
                      [VITEST UNIT CODE TESTING]
                         - Verification Rate: 60%
```

---

## 2. Dynamic Verification Test Suites

### A. Unit Testing Plan (Vitest + React Testing Library)
*   **Target Components**: Custom hooks (`useAuth`, `useTenantSubscription`), helper utilities (currency converters, date range checkers).
*   **Coverage Threshold**: Minimum **85% code coverage** required for PR merges.
*   **Sample Assertion**:
    ```typescript
    test("calculates pro seat limits accurately", () => {
      const isWithinLimits = checkSeatCapacity({
        activeSeats: 12,
        maxSeats: 25
      });
      expect(isWithinLimits).toBe(true);
    });
    ```

### B. Integration Testing Plan (Supertest + Express API Server)
*   **Target Endpoints**: `/api/auth/session`, `/api/tenant/branding`, `/api/workflow/approve`.
*   **Verification Vectors**: Validates cookie-based token validation, multi-tenant database queries, and role-based block filters.
*   **Security Check**: Attempts to query Tenant A records using a Tenant B session token to verify the query block handles errors correctly.

### C. End-to-End Testing Plan (Playwright Browser Automation)
*   **Target Journeys**: Full tenant lifecycle (Super Admin creation, subscription selection, owner password set, dynamic workspace load, branding configuration, custom domain publishing, invite member).
*   **Viewport Matrices**: Simulates standard Desktop (`1440x900`), Tablet (`1024x768`), and Mobile (`375x812`) screens.

---

## 3. Specialized Auditing & Scans

### A. Web Accessibility Audits (WCAG 2.1 AA Compliance)
1.  **Automation Checkers**: Automated `axe-core` sweeps integrated directly inside Playwright test scripts.
2.  **Keyboard Navigation sweeps**: Validates that all interactive controls, buttons, form inputs, and modal closers are focusable using standard Tab sequences.
3.  **Color Contrast Compliance**: Script sweeps check typography-to-background contrast ratios (minimum 4.5:1 ratio for normal UI text elements).

### B. Security & Vulnerability Analysis
1.  **Static Analysis (SAST)**: Automated code scans utilizing Snyk or SonarQube to identify potential code execution pathways, injection vectors, or weak cryptography.
2.  **Package Audits**: Daily automated scans of the `package.json` manifest using `npm audit` to detect outdated, vulnerable, or compromised external dependencies.

---

## 4. Multi-Stage Deployment Gate Controls

To ensure absolute system stability, no updates are pushed to production without passing the automated build gate checklist:

```bash
# Automated deployment validation sequence
npm run clean             # 1. Clear temporary build caches
npm run lint              # 2. Enforce strict typescript styles
npm run test:unit         # 3. Execute unit coverage suite
npm run test:integration  # 4. Verify API routing controllers
npm run test:e2e          # 5. Run Playwright E2E suites
npm run build             # 6. Verify production-ready compilation
```
This QA validation roadmap ensures that every functional feature added to MarketForge operates reliably, securely, and within spec indefinitely.
