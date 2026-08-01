# TEAM WORKFORCE & TEAM MANAGEMENT
## Scalable Directory Structure, Seat Limits, & Employee Metadata Sheets

This document specifies the Workforce Directory and staff organizational structures. It is fully integrated with subscription seat limits and strict data privacy filters.

---

## 1. Employee Resource Definition

Every workspace user record must be stored in the tenant context containing standard metadata properties to ensure seamless personnel tracking:

```typescript
export interface EmployeeProfile {
  id: string;                // Unique User Identifier
  tenantId: string;          // Scoped Tenant ID
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;         // Cloud-stored high-contrast profile picture
  department: "Management" | "Operations" | "Housekeeping" | "Finance" | "FrontDesk" | "Support";
  designation: string;       // e.g. "Senior Housekeeper", "Finance Director"
  reportingManagerId: string | null; // Direct hierarchy tracking
  employmentStatus: "Active" | "OnLeave" | "Suspended" | "Terminated";
  joiningDate: string;       // ISO Timestamp
  lastActive: string;        // System activity tracker
  permissions: string[];     // Direct functional claims override
}
```

---

## 2. Dynamic Team Directory Layout (UX Guide)

The directory layout matches the clean aesthetics of Linear or Figma:

```
┌────────────────────────────────────────────────────────────────────────┐
│  TEAM WORKFORCE  [+ Invite Member]   [Seat Status: 12/25 Active]       │
├────────────────────────────────────────────────────────────────────────┤
│  🔍 Search staff...                  [All Departments ▾]  [Active ▾]  │
├────────────────────────────────────────────────────────────────────────┤
│  Name             Department       Manager         Status     Joined   │
│  ────────────────────────────────────────────────────────────────────  │
│  👤 Elena Rostova  Housekeeping     Elena R. (Self) Active     Jan 2026 │
│  👤 David Miller   Operations       Marcus V.       Active     Feb 2026 │
└────────────────────────────────────────────────────────────────────────┘
```

*   **Header Indicators**: Display an elegant progress tracker showing seat consumption (e.g., `12 of 25 seats utilized`). If seats approach 100%, render a subtle, warm orange prompt recommending the owner upgrade to the next tier.
*   **Hierarchical Layout**: Render direct visual reporting indicators. Senior managers can see a collapsible organization structure showing reporting relationships clearly.

---

## 3. Workplace Verification & Invites

To add employees without direct manual setup:
1.  **Form Input**: Admin inputs Name, Email, Department, and Designation.
2.  **Seat Verification**: The system checks active seat count. If approved, writes a placeholder employee document.
3.  **Onboarding Invite**: Sends an automated onboarding email containing a unique invitation link.
4.  **Completion**: When the employee clicks the link and creates a password, their status transitions to `Active` and they land on the workspace dashboard immediately.
