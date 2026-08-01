# TECHNICAL DEBT REGISTER
## Quantitative Risk & Refactoring Catalog

This document registers and monitors the core architectural and code-level debt items present in the current MarketForge platform, establishing remediation strategies and business risk classifications.

---

## 1. Summary Registry

| ID | Debt Item Description | Affected Modules | Severity | Risk of Ignoring | Est. Fix Time | Suggested Refactor Path |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **TD-01** | Client-Side Multi-Tenant Data Filtering | `/src/lib/firebase.ts`, `/src/lib/SyncEngine.ts` | 🔴 **CRITICAL** | Data leakage across hotel tenants; massive security compliance risk. | 24 Hours | Enforce query-level tenant filters on all queries and secure Firestore with server-enforced rules. |
| **TD-02** | Monolithic Diagnostic Code Coupling | `/src/components/ProductionDiagnostics.tsx` | 🟡 **MEDIUM** | Bundle bloat; slow compilation; fragile, hard-to-maintain files. | 18 Hours | Break down into specialized utility components inside `/src/components/diagnostics/*`. |
| **TD-03** | LocalStorage Unencrypted PII Cache Fallback | `/src/lib/firebase.ts`, `/src/lib/repositories.ts` | 🔴 **CRITICAL** | Leakage of customer profiles on shared front desk terminals. | 6 Hours | Implement client-side AES-256 encryption on all local caching arrays or disable local fallback in multi-user modes. |
| **TD-04** | Client-Side Email & Notification Triggering | `/src/components/LaunchCenter.tsx`, `/src/lib/smtp.ts` | 🟠 **HIGH** | Web browsers executing direct SMTP connections can leak mail server credentials. | 12 Hours | Create an isolated backend `/api/notifications/send` API endpoint to proxy all outbound communications. |
| **TD-05** | Missing Atomic Reservation Locks | `/src/components/GoalStrategyOS.tsx`, `/src/lib/commerce.ts` | 🟠 **HIGH** | Overbooking of hotel rooms during concurrent checkout requests. | 16 Hours | Wrap reservations in Firestore transaction blocks on the backend to enforce concurrency control. |
| **TD-06** | Hardcoded Global Currency Symbol | `/src/components/DailyCommandCenter.tsx` | 🟡 **MEDIUM** | Inability to support multi-currency multi-national hotel brands. | 8 Hours | Connect financial metrics to a currency localization hook powered by browser locale mappings. |
| **TD-07** | Absence of Global Error Boundaries | `/src/App.tsx`, `/src/main.tsx` | 🟡 **MEDIUM** | Minor component rendering errors crash the entire platform screen. | 4 Hours | Wrap the main workspace grid in a robust React `ErrorBoundary` component to capture and recover gracefully. |

---

## 2. Detailed Debt Analysis & Remediation Plans

### TD-01: Client-Side Multi-Tenant Data Filtering
*   **Description**: Tenant isolation is currently managed by loading records into browser memory and applying array filter operations (e.g. `.filter(item => item.tenantId === currentTenant)`).
*   **Business Impact**: Severe breach of privacy. Competitor organizations can access other tenants' guest registries and financial summaries by editing local variables.
*   **Technical Impact**: Heavy memory consumption and network overhead on large data sets.
*   **Suggested Refactor**:
    1.  Update database queries to pass `where("tenantId", "==", currentTenant)` at the driver level.
    2.  Write strict Firestore Security Rules that block reads or writes if the document's `tenantId` does not match the authenticated user token:
        ```javascript
        match /reservations/{reservationId} {
          allow read, write: if request.auth != null && resource.data.tenantId == request.auth.token.tenantId;
        }
        ```

### TD-03: LocalStorage Unencrypted PII Cache Fallback
*   **Description**: In simulated offline environments, the platform persists full guest records, checkin dates, and payment logs to browser local storage in clear text.
*   **Business Impact**: Disastrous security audits and compliance failure (GDPR/SOC2).
*   **Technical Impact**: Plain-text JSON arrays are viewable by any user via browser developer tools.
*   **Suggested Refactor**:
    *   Introduce a lightweight cryptographic wrapper around standard local storage operations:
        ```typescript
        export const secureSetItem = (key: string, value: any) => {
          const encrypted = aesEncrypt(JSON.stringify(value), getLocalPassphrase());
          localStorage.setItem(key, encrypted);
        };
        ```
    *   Or, disable automatic offline caching entirely for devices flagged as shared terminals.

### TD-05: Missing Atomic Reservation Locks
*   **Description**: The platform reserves physical room allocations through straightforward document updates (`setDoc`) without transaction isolation checks.
*   **Business Impact**: Poor customer service and operational chaos due to double bookings.
*   **Technical Impact**: Vulnerability to race conditions during high-volume periods.
*   **Suggested Refactor**:
    *   Wrap reservations in transaction blocks to guarantee exclusive write access during booking sequences:
        ```typescript
        await runTransaction(db, async (transaction) => {
          const roomRef = doc(db, "rooms", roomId);
          const roomSnap = await transaction.get(roomRef);
          if (roomSnap.data().status !== "AVAILABLE") {
            throw new Error("Room already reserved");
          }
          transaction.update(roomRef, { status: "BOOKED" });
          transaction.set(newReservationRef, reservationData);
        });
        ```
