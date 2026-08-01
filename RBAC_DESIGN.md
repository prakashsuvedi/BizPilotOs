# ROLE-BASED ACCESS CONTROL (RBAC) DESIGN
## Heirarchical Permissions, Component Protection Gates, & Server Enforcement

This specification outlines the security and permissions inheritance hierarchy of the MarketForge platform. It ensures that staff access levels are strictly verified at both the UI layer and the backend server database controllers.

---

## 1. Security Hierarchy & Role Ingestion

Permissions flow downward through a standard business hierarchy. Higher positions automatically inherit core operational privileges:

```
  [1. Owner] (Full system, Billing, Custom Subdomains)
       │
       ▼
  [2. General Manager] (Full Operations, Staff Management)
       │
       ▼
  [3. Operations Manager] (Housekeeping Assignment, Bookings)
       │
       ▼
  [4. Front Desk Agents] (Read/Write Bookings, Guest Checkins)
       │
       ▼
  [5. Housekeeper / Staff] (Read/Write assigned tasks, clean status)
```

---

## 2. Granular Permissions Declarations

Every user-triggered operation requires a specific security claim:

```typescript
export type PermissionClaim =
  | "tenant:write_branding"   // Change logo/colors
  | "tenant:manage_billing"  // Change subscription package
  | "staff:invite"           // Invite new workforce members
  | "staff:suspend"          // Disable accounts
  | "bookings:create"        // New booking
  | "bookings:cancel"        // Void reservation
  | "housekeeping:update"    // Mark room clean/dirty
  | "accounting:read"        // View financial summaries
  | "accounting:write";      // Edit transactions
```

### Static Role Mapping Table
```typescript
export const RolePermissionsMap: Record<string, PermissionClaim[]> = {
  Housekeeper: ["housekeeping:update"],
  FrontDesk: ["bookings:create", "housekeeping:update"],
  Accountant: ["accounting:read", "accounting:write"],
  OperationsManager: ["bookings:create", "bookings:cancel", "housekeeping:update", "staff:invite"],
  GeneralManager: [
    "bookings:create",
    "bookings:cancel",
    "housekeeping:update",
    "staff:invite",
    "staff:suspend",
    "accounting:read"
  ],
  Owner: [
    "tenant:write_branding",
    "tenant:manage_billing",
    "staff:invite",
    "staff:suspend",
    "bookings:create",
    "bookings:cancel",
    "housekeeping:update",
    "accounting:read",
    "accounting:write"
  ]
};
```

---

## 3. UI Component Shielding Pattern

To prevent visual noise, inaccessible screens, buttons, and links are dynamically wrapped inside an authorization validation block:

```typescript
import { useAuth } from "@/hooks/useAuth";
import { PermissionClaim } from "@/types/auth";

interface ShieldProps {
  claim: PermissionClaim;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthShield = ({ claim, children, fallback = null }: ShieldProps) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(claim)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Usage Example in Layout Header
<AuthShield claim="tenant:manage_billing">
  <button id="billing-settings-btn" className="btn-primary">
    Subscription settings
  </button>
</AuthShield>
```

---

## 4. Server Controller Protection

All API requests are double-checked server-side at the middleware level. Claims are parsed directly from validated session cookies:

```typescript
export function requirePermission(claim: PermissionClaim) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    const permissions = RolePermissionsMap[userRole] || [];

    if (!permissions.includes(claim)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: `Your user role (${userRole}) does not have the required clearance (${claim}) to complete this action.`
      });
    }

    next();
  };
}
```
This architecture ensures robust protection against malicious request tampering or lateral privilege escalation.
