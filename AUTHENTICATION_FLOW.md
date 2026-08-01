# ENTERPRISE AUTHENTICATION & SESSION FLOWS
## Secure Identity, Asymmetrical Tokens, Route Protection, & RBAC Validation

This specification outlines the secure authentication and authorization mechanics of the MarketForge platform. It ensures zero UI rendering occurs until authorization claims are fully validated.

---

## 1. Authentication Lifecycle Sequence

```
   [UNAUTHENTICATED CLIENT]
               │ (Enters Credentials / Authenticates)
               ▼
     [GATEWAY AUTH SERVICE] ──(Generates JWT & Checks MFA)──► [SECURE CLIENT]
               │
      (Validates Session)
               ▼
     [JWT CLAIM VERIFICATION] ──(Enables Roles: Owner, Manager, Housekeeper)
               │
    (Injects Tenant Custom CSS)
               ▼
     [FULLY DECORATED CONSOLE]
```

---

## 2. Component Specifications

### A. Route Guarding & Protection Engine
*   **Mechanism**: The React client uses an outer `AuthProvider` context that wraps the routing directory.
*   **Initialization Gate**:
    *   On boot, the provider fires an initial ping to `/api/auth/session` using HTTP-Only cookies.
    *   During the check, the browser displays a subtle, premium loading skeleton screen (resembling Slack's startup fade-in or Vercel's quiet loader).
    *   No structural child grids, sidebars, or dashboards are mounted in memory until the auth state resolves to `AUTHENTICATED`.
*   **Role Redirects**:
    ```typescript
    if (user.role === 'Housekeeper') {
      router.push('/workspace/housekeeping');
    } else {
      router.push('/workspace/dashboard');
    }
    ```

### B. Invitation Verification & Onboarding Link Security
*   On boarding, new employees receive a link matching:
    `https://console.marketforge.com/onboard?token=inv_abc123xyz789&tenantId=tenant_901`
*   **Server-Side Check**:
    When clicked, the backend verifies:
    1.  The token exists, matches the query email, and status is `PENDING`.
    2.  The timestamp is within 72 hours.
    3.  If valid, opens password selection; otherwise, renders an elegant expiration notice with a "Request New Invite" trigger.

### C. Password Reset & Security Validation
*   **Recovery Sequence**:
    1.  User submits email to `/api/auth/reset-request`.
    2.  System generates a temporary, cryptographically randomized 64-character hash token valid for 1 hour.
    3.  Dispatches an HTML recovery email with unique CSS styling to match the tenant's brand.
    4.  Owner resets password, which updates user records and immediately invalidates all active session tokens.

### D. Session Timeout & "Remember Me" Strategy
*   **Active Expiration**: Standard sessions expire after **2 hours** of inactivity.
*   **Remember Me Selection**:
    *   If selected, writes a cryptographically signed refresh token to an HTTP-Only secure cookie (`__Host-marketforge-refresh`) with a **30-day** lifespan.
    *   If silent, the client fetches a new access token every 45 minutes in the background without layout flicker.

### E. Security Level Authorization Checks (RBAC & Tenant isolation)
Every client-side API call automatically includes the tenant context headers inside requests:
```text
Authorization: Bearer <JWT_Token>
X-Tenant-ID: tenant_901
```
The server validates that:
1.  The JWT signature is authentic.
2.  The `tenantId` embedded in the JWT payload matches the `X-Tenant-ID` header.
3.  The active user has appropriate permissions to query the requested endpoint.
