# PACKAGE & SUBSCRIPTION LIMITS ENGINE
## Dynamic Feature Flags, Seat Caps, API Access, & Whitelabel Controls

This specification establishes the package limits engine for the MarketForge Enterprise Platform. All software modules check configuration parameters dynamically to enable or disable interactive visual components without code hardcoding.

---

## 1. Feature Entitlements Matrix

| Feature / Limit | Basic Tier | Pro Tier | Enterprise Tier |
| :--- | :---: | :---: | :---: |
| **Price (Monthly)** | $49 | $149 | $499 |
| **Seat Limits (Users)** | Max 5 | Max 25 | Unlimited |
| **File Storage** | 2 GB | 20 GB | 200 GB |
| **Monthly AI Credits** | 100 | 1,000 | Unlimited |
| **Website Builder** | Basic | Advanced | Custom + Blog |
| **Public Scheduling Web** | ✅ Included | ✅ Included | ✅ Included |
| **Detailed Accounting** | ❌ Disabled | ✅ Included | ✅ Included |
| **Advanced CRM & Email Hub** | ❌ Disabled | ✅ Included | ✅ Included |
| **White-Label Branding** | ❌ Disabled | ❌ Disabled | ✅ Included |
| **Custom Subdomains** | ❌ Disabled | ✅ Included | ✅ Included |
| **Dedicated API Access** | ❌ Disabled | ❌ Disabled | ✅ Included |

---

## 2. Declarative Tier Configurations

Feature toggles are represented as a unified JSON config schema. This schema is checked globally in both frontend wrappers and server controllers:

```typescript
export interface PackageLimitConfig {
  maxUsers: number;
  maxStorageBytes: number;
  aiCreditsMonthly: number;
  hasWebsiteBuilder: boolean;
  hasAccounting: boolean;
  hasCrm: boolean;
  hasWhiteLabel: boolean;
  hasCustomDomain: boolean;
  hasApiAccess: boolean;
}

export const TierDefinitions: Record<string, PackageLimitConfig> = {
  basic: {
    maxUsers: 5,
    maxStorageBytes: 2 * 1024 * 1024 * 1024, // 2 GB
    aiCreditsMonthly: 100,
    hasWebsiteBuilder: true,
    hasAccounting: false,
    hasCrm: false,
    hasWhiteLabel: false,
    hasCustomDomain: false,
    hasApiAccess: false
  },
  pro: {
    maxUsers: 25,
    maxStorageBytes: 20 * 1024 * 1024 * 1024, // 20 GB
    aiCreditsMonthly: 1000,
    hasWebsiteBuilder: true,
    hasAccounting: true,
    hasCrm: true,
    hasWhiteLabel: false,
    hasCustomDomain: true,
    hasApiAccess: false
  },
  enterprise: {
    maxUsers: 9999, // Unlimited
    maxStorageBytes: 200 * 1024 * 1024 * 1024, // 200 GB
    aiCreditsMonthly: 999999, // Unlimited
    hasWebsiteBuilder: true,
    hasAccounting: true,
    hasCrm: true,
    hasWhiteLabel: true,
    hasCustomDomain: true,
    hasApiAccess: true
  }
};
```

---

## 3. Client-Side Rendering Guard Pattern

To prevent visual clutter, the UI sidebar uses React hook wrappers checking user tenant context claims to hide or grey-out locked modules elegantly:

```typescript
import { useTenantSubscription } from "@/hooks/useTenantSubscription";

export const NavigationSidebar = () => {
  const { hasFeature, packageTier } = useTenantSubscription();

  return (
    <nav className="space-y-1">
      <SidebarItem label="Dashboard" href="/workspace" icon={LayoutIcon} />
      <SidebarItem label="Reservations" href="/workspace/bookings" icon={CalendarIcon} />
      
      {/* Dynamic accounting access */}
      {hasFeature("hasAccounting") ? (
        <SidebarItem label="Accounting" href="/workspace/accounting" icon={DollarSignIcon} />
      ) : (
        <LockedSidebarItem label="Accounting" tierRequired="Pro" />
      )}
      
      {/* Dynamic API credentials control */}
      {hasFeature("hasApiAccess") && (
        <SidebarItem label="Developer Portal" href="/workspace/developer" icon={CodeIcon} />
      )}
    </nav>
  );
};
```

---

## 4. Server-Side Enforcement (Middleware Gateways)

Client-side checks are purely for visual feedback. All operational actions are securely double-checked in backend controllers before saving changes:

```typescript
export async function enforceUserSeatLimits(req: Request, res: Response, next: NextFunction) {
  const { tenantId, packageTier } = req.user;
  const currentSeatsCount = await getActiveTenantStaffCount(tenantId);
  const limits = TierDefinitions[packageTier];

  if (currentSeatsCount >= limits.maxUsers) {
    return res.status(403).json({
      error: "LIMIT_EXCEEDED",
      message: `Your active subscription tier (${packageTier}) restricts your workforce workspace to ${limits.maxUsers} users. Please upgrade to add more staff members.`,
      action: "UPGRADE_PLAN"
    });
  }

  next();
}
```
This multi-layered limit architecture secures the system and encourages users to upgrade seamlessly.
