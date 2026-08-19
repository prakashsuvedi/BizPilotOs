/**
 * MARKETFORGE OS - CORE ARCHITECTURE & FEATURE LOCK REGISTRY
 * 
 * CRITICAL DIRECTIVE:
 * This file serves as the single immutable source of truth and regression protection lock
 * for all core business domains, auth roles, multi-tenant boundaries, and system routes.
 * Modifying or bypassing these rules in future edits without explicit user mandate is prohibited.
 */

export interface LockedFeatureManifest {
  version: string;
  lockedAt: string;
  immutableCoreDomains: string[];
  roleHierarchy: Record<string, { level: number; scope: 'platform' | 'tenant'; permissions: string[] }>;
  routeInvariants: Record<string, { target: string; requiresRole?: string[] }>;
  protectedEndpoints: string[];
}

export const FEATURE_LOCK_MANIFEST: LockedFeatureManifest = {
  version: "2026.2.0-LOCKED",
  lockedAt: "2026-08-19T00:00:00.000Z",
  
  // Core Business Domains Locked Against Unsolicited Modifications
  immutableCoreDomains: [
    "MULTI_TENANT_ISOLATION_ROUTING",
    "SUPERADMIN_GLOBAL_CONTROL_PLANE",
    "TENANT_SELF_SERVICE_REGISTRATION",
    "DYNAMIC_BUSINESS_TYPE_LANDING_PAGES",
    "RESTAURANT_TABLE_QR_ORDERING_ENGINE",
    "HOTEL_ROOM_RESERVATION_SYSTEM",
    "TOURS_BOOKING_EXPERIENCE_OS",
    "OMNICORE_AD_AND_CAMPAIGN_LABS",
    "EMAIL_STUDIO_DISPATCH_AND_SMTP_RELAY",
    "LIVE_PAYMENT_GATEWAYS_STRIPE_ESEWA_KHALTI",
    "FIRST_VISIT_PASSWORD_CHANGE_AND_NOTIFICATION"
  ],

  // Role Hierarchy & Strict Isolation Map
  roleHierarchy: {
    super_admin: {
      level: 100,
      scope: "platform",
      permissions: ["platform:all", "tenants:crud", "billing:global", "smtp:manage", "users:global_manage"]
    },
    owner: {
      level: 80,
      scope: "tenant",
      permissions: ["workspace:admin", "modules:all_assigned", "staff:manage", "billing:tenant", "customization:all"]
    },
    admin: {
      level: 70,
      scope: "tenant",
      permissions: ["workspace:manage", "modules:all_assigned", "staff:manage"]
    },
    writer: {
      level: 50,
      scope: "tenant",
      permissions: ["workspace:read", "content:write", "campaigns:manage", "orders:create"]
    },
    viewer: {
      level: 20,
      scope: "tenant",
      permissions: ["workspace:read", "reports:view"]
    }
  },

  // Immutable Route Invariants
  routeInvariants: {
    "/admin": {
      target: "SUPER_ADMIN_PORTAL",
      requiresRole: ["super_admin"]
    },
    "/": {
      target: "PLATFORM_ROOT_OR_TENANT_WORKSPACE"
    },
    "/:tenantSlug": {
      target: "TENANT_LANDING_OR_WORKSPACE"
    },
    "/:tenantSlug?action=workspace": {
      target: "TENANT_COMMAND_CENTER"
    },
    "/:tenantSlug?mode=qr_menu": {
      target: "MOBILE_TABLE_QR_ORDERING_APP"
    }
  },

  // Protected REST API Endpoints with Verified Contract Specifications
  protectedEndpoints: [
    // Authentication & Identity
    "POST /api/tenant/login",
    "POST /api/admin/login",
    "POST /api/tenant/verify-session",
    "POST /api/tenant/password-reset",
    "POST /api/user/change-password",
    "POST /api/user/change-credentials",
    "POST /api/tenant/onboard-credentials",
    
    // SuperAdmin Tenant Lifecycle
    "GET /api/superadmin/tenants",
    "POST /api/superadmin/tenants",
    "PUT /api/superadmin/tenants/:id",
    "DELETE /api/superadmin/tenants/:id",
    "POST /api/admin/database/clean-tenant-data",
    
    // Email Delivery & Diagnostic
    "GET /api/superadmin/platform-email",
    "POST /api/superadmin/platform-email",
    "POST /api/superadmin/test-email-live",
    "POST /api/email/dispatch-broadcast",
    
    // Tenant Self-Service & Subscription
    "POST /api/tenants/signup",
    "GET /api/tenant/details",
    "POST /api/tenant/branding",
    "POST /api/payments/checkout",
    "GET /api/payments/nepal/verify",
    "POST /api/webhooks/stripe",
    "POST /api/webhooks/esewa",
    "POST /api/webhooks/khalti"
  ]
};

/**
 * Validates whether an incoming user role is allowed to access a requested scope
 */
export function validateRoleBoundary(userRole: string, requiredScope: 'platform' | 'tenant'): boolean {
  if (userRole === 'super_admin') return true;
  if (requiredScope === 'platform') return false;
  return ['owner', 'admin', 'writer', 'viewer'].includes(userRole);
}

/**
 * Returns clean sanitized landing page config for business type
 */
export function getSafeBusinessTemplate(businessType: string) {
  const types: Record<string, { defaultTheme: string; defaultHero: string; defaultBadges: string[] }> = {
    restaurant: {
      defaultTheme: "culinary",
      defaultHero: "Authentic Dining & Gourmet Cuisine",
      defaultBadges: ["Chef Specials", "Online Table Booking", "QR Smart Menu"]
    },
    hotel: {
      defaultTheme: "hospitality",
      defaultHero: "Luxury Suites & Unforgettable Getaways",
      defaultBadges: ["Instant Room Reservation", "Concierge Service", "VIP Lounge"]
    },
    tours: {
      defaultTheme: "adventure",
      defaultHero: "Guided Expeditions & Cultural Treks",
      defaultBadges: ["Certified Guides", "Custom Itineraries", "24/7 Support"]
    },
    retail: {
      defaultTheme: "commerce",
      defaultHero: "Curated Artisan & Lifestyle Collection",
      defaultBadges: ["Fast Delivery", "Handcrafted Quality", "Secure Checkout"]
    },
    services: {
      defaultTheme: "professional",
      defaultHero: "Next-Gen Enterprise Solutions & Consulting",
      defaultBadges: ["Strategic Advisory", "Custom Implementation", "24/7 SLA"]
    }
  };

  return types[businessType] || types.services;
}
