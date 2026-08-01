# ENTERPRISE CUSTOMER LIFECYCLE SPECIFICATION
## End-to-End Multi-Tenant Tenant Onboarding & Activation Blueprint

This document specifies the complete, seamless, and premium customer lifecycle for the MarketForge Enterprise Platform. Every step integrates naturally with the core system components to provide a delightful self-service experience without requiring developer assistance.

---

## 1. The 12-Step Lifecycle Journey Map

```
  [1. Super Admin creates Business]
                │
                ▼
  [2. Package Selection (Basic/Pro/Enterprise)]
                │
                ▼
  [3. Multi-Tenant Provisioning (Firestore, DNS, Mail)]
                │
                ▼
  [4. Owner Invitation Dispatch (Secure Token)]
                │
                ▼
  [5. Email Verification & Cryptographic Link Checks]
                │
                ▼
  [6. Owner Set Password & MFA Onboarding]
                │
                ▼
  [7. First-time Authentication & Session Establishment]
                │
                ▼
  [8. Dynamic Dashboard Load (Adapted to Business Type)]
                │
                ▼
  [9. Custom Branding Configuration (Logo, Accent Colors)]
                │
                ▼
  [10. Team Member Invitation (Role Allocation)]
                │
                ▼
  [11. Role-Based Access Control (RBAC) Validation]
                │
                ▼
  [12. Commencement of Daily Shifts & Live Operations]
```

---

## 2. Step-by-Step Functional Specifications

### Step 1: Super Admin Creates Business
*   **Description**: A Super Admin logs into the centralized administrative portal and creates a new business entity profile.
*   **System Actions**: Allocates a unique, immutable UUID `tenantId` and triggers a transaction block in the database metadata tables.
*   **UX Pattern**: Minimalist, clean multi-step slide-over panel utilizing generous negative space, matching standard Stripe-like billing panels.

### Step 2: Package & Subscription Selection
*   **Description**: Selection of the active operational tier (Basic, Pro, or Enterprise) determining functional limits.
*   **System Actions**: Binds subscription metadata, billing cycles, active feature flags, and transaction caps to the tenant configuration.
*   **UX Pattern**: High-contrast, interactive bento comparison grid.

### Step 3: Tenant Environment Provisioning
*   **Description**: Automated system setup.
*   **System Actions**: Creates isolated collections with secure tenant schemas, registers local subdomains (e.g. `hotel.marketforge.com`), and generates default operational records (default rooms, clean tasks, generic templates).
*   **Failure & Recovery Strategy**: If database provisioning times out, transaction state rolls back immediately, deleting orphaned records, and triggers an alert panel with a "Retry Provisioning" action.

### Step 4: Owner Invitation Dispatch
*   **Description**: Automated dispatch of secure onboarding token.
*   **System Actions**: Generates an asymmetrical cryptographic invitation token with a 72-hour expiration window, records it to the verification table, and triggers an onboarding email via the SMTP server.
*   **Security Control**: Invitation tokens are salted, single-use, and bound strictly to the target owner's email address.

### Step 5: Email Verification Checking
*   **Description**: The client clicks the secure verification link inside their invitation email.
*   **System Actions**: Resolves and verifies the cryptographical token in the database, updating the user state from `PENDING` to `VERIFIED`.

### Step 6: Owner Password Set & MFA Setup
*   **Description**: Owner lands on a premium password creation screen.
*   **UX Pattern**: Single-focused display typography input screen. Prompts the owner to select a strong password (minimum 12 characters, including symbol and numeric checks) and configure standard MFA TOTP codes (Google Authenticator).

### Step 7: First Login & Token Issuance
*   **Description**: The owner completes authentication for the first time.
*   **System Actions**: Issues secure HTTP-Only session cookies containing the cryptographically validated tenant token and role claims.

### Step 8: Tailored Dashboard Initialization
*   **Description**: The primary workspace loads instantly.
*   **System Actions**: Queries the active business model. Adapts widgets to hospitality models (Bookings, Rooms, Housekeeping) or corporate models dynamically. Shows zero technical telemetry metrics to non-technical managers.

### Step 9: White-Label Branding Customization
*   **Description**: Owner customizes branding under settings.
*   **System Actions**: Automatically compiles custom colors, logos, and meta tags, applying them throughout the tenant's workspace and the public reservation website instantly.

### Step 10: Team Member Invitation
*   **Description**: Owner invites managers, front desk agents, and housekeeping staff using standard email addresses.
*   **System Actions**: Verifies package seat limits before allowing additional invitations.

### Step 11: RBAC Validation Gates
*   **Description**: Team members activate accounts, inheriting specific security roles (Manager, Accountant, Housekeeper) that filter visible UI sidebars and enforce server-side route blocks.

### Step 12: Daily Operational Loop
*   **Description**: The hotel starts daily operations (registering guest checkins, allocating rooms, updating task lists). All actions are fully logged in the tenant's secure audit tables.
