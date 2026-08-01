export interface FeatureRegistryEntry {
  id: string;
  name: string;
  owner: string;
  frontendComponent: string;
  backendApi: string;
  databaseCollections: string[];
  authentication: string;
  permissions: string;
  dependencies: string[];
  status: 'STABLE' | 'DEPRECATED' | 'BETA';
  lastVerification: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AcceptanceTest {
  id: string;
  name: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: 'PENDING' | 'PASS' | 'FAIL';
  latencyMs?: number;
  rootCause?: string;
  fixApplied?: string;
  retestResult?: string;
}

// Phase 1: Complete Enterprise Feature Inventory (21 Core Systems)
export const FEATURE_REGISTRY: FeatureRegistryEntry[] = [
  {
    id: "FEAT-001",
    name: "Super Admin Control Center",
    owner: "Operations Lead",
    frontendComponent: "SuperAdminPortal.tsx",
    backendApi: "GET/POST /api/admin/*",
    databaseCollections: ["tenants", "users", "audit_logs"],
    authentication: "Firebase Auth (SuperAdmin Role Claim)",
    permissions: "superadminOnly",
    dependencies: ["firebase-admin.ts", "verificationCore.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "HIGH"
  },
  {
    id: "FEAT-002",
    name: "Success Center & Onboarding Coach",
    owner: "Customer Success Team",
    frontendComponent: "SuccessCenter.tsx",
    backendApi: "GET/POST /api/onboarding/*",
    databaseCollections: ["onboarding_sessions", "guide_sessions", "outcome_logs"],
    authentication: "Firebase Auth Client Session",
    permissions: "allAuthenticatedUsers",
    dependencies: ["IntelligenceCore.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-003",
    name: "Enterprise Multi-Tenant Operations Center",
    owner: "DevOps Engineer",
    frontendComponent: "EnterpriseOperationsCenter.tsx",
    backendApi: "POST /api/admin/lifecycle/*",
    databaseCollections: ["tenants", "users", "audit_logs"],
    authentication: "Firebase Auth (SuperAdmin / Admin Role)",
    permissions: "adminOrAbove",
    dependencies: ["consistencyEngine.ts", "orchestration.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "HIGH"
  },
  {
    id: "FEAT-004",
    name: "Ad Studio & Visual Ad Designer",
    owner: "Creative Lead",
    frontendComponent: "AdStudio.tsx",
    backendApi: "POST /api/creative/ad-copy",
    databaseCollections: ["ad_accounts", "ad_properties", "ad_campaigns"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["gemini_api", "image-generation"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-005",
    name: "Consolidated Campaign Generator",
    owner: "Creative Director",
    frontendComponent: "MarketingPackageGenerator.tsx",
    backendApi: "POST /api/campaign/generate-cons",
    databaseCollections: ["campaign_profiles", "campaigns", "content_assets"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["commerce.ts", "globalizationEngine.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "HIGH"
  },
  {
    id: "FEAT-006",
    name: "Social Media Studio & Planner",
    owner: "Marketing Lead",
    frontendComponent: "SocialStudio.tsx",
    backendApi: "POST /api/social/publish",
    databaseCollections: ["social_accounts", "social_posts"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["gemini_api"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-007",
    name: "Email Studio & Campaigns Hub",
    owner: "Marketing Lead",
    frontendComponent: "EmailStudio.tsx",
    backendApi: "POST /api/email/dispatch",
    databaseCollections: ["campaigns", "audit_logs"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["sendgrid-api", "nodemailer"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "HIGH"
  },
  {
    id: "FEAT-008",
    name: "Brand Configuration & Design Tokens",
    owner: "Design Lead",
    frontendComponent: "App.tsx (Global Styles & Modals)",
    backendApi: "POST /api/tenant/brand-config",
    databaseCollections: ["brand_guidelines", "tenants"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantAdmin",
    dependencies: ["design-tokens.css"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "LOW"
  },
  {
    id: "FEAT-009",
    name: "Financial Intelligence OS",
    owner: "Finance Officer",
    frontendComponent: "FinancialIntelligenceEngine.tsx",
    backendApi: "GET /api/finance/metrics",
    databaseCollections: ["outcome_logs", "tenants"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantAdmin",
    dependencies: ["commerce.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "HIGH"
  },
  {
    id: "FEAT-010",
    name: "Revenue Intelligence Engine",
    owner: "Finance Officer",
    frontendComponent: "RevenueIntelligenceOS.tsx",
    backendApi: "GET /api/finance/revenue-projections",
    databaseCollections: ["outcome_logs", "tenants"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantAdmin",
    dependencies: ["FinancialIntelligenceEngine.tsx"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-011",
    name: "Autonomous AI Content Writer",
    owner: "Content Lead",
    frontendComponent: "ContentWriter.tsx",
    backendApi: "POST /api/write/article",
    databaseCollections: ["content_assets", "campaigns"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["gemini_api"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-012",
    name: "Creative Director Agent Interface",
    owner: "Creative Lead",
    frontendComponent: "CreativeDirector.tsx",
    backendApi: "POST /api/creative/review",
    databaseCollections: ["campaigns", "brand_guidelines"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["designIntelligence.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-013",
    name: "Asset Lifecycle Manager",
    owner: "Operations Lead",
    frontendComponent: "AssetLifecycleCenter.tsx",
    backendApi: "POST /api/assets/manage",
    databaseCollections: ["content_assets"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["firebase.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "LOW"
  },
  {
    id: "FEAT-014",
    name: "Enterprise Knowledge Center & Digital Twin",
    owner: "System Architect",
    frontendComponent: "EnterpriseKnowledgeCenter.tsx",
    backendApi: "GET/POST /api/admin/docs/*",
    databaseCollections: ["audit_logs"],
    authentication: "Firebase Auth Client Session",
    permissions: "adminOrAbove",
    dependencies: ["verificationCore.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-015",
    name: "Daily Tactical Command Center",
    owner: "Operations Lead",
    frontendComponent: "DailyCommandCenter.tsx",
    backendApi: "GET /api/tactical/daily-schedule",
    databaseCollections: ["campaigns", "onboarding_sessions"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["SuccessCenter.tsx"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "LOW"
  },
  {
    id: "FEAT-016",
    name: "Login Portal & MFA Identity Gateway",
    owner: "Security Architect",
    frontendComponent: "LoginPortal.tsx",
    backendApi: "POST /api/auth/token-login",
    databaseCollections: ["users", "tenants"],
    authentication: "Firebase Auth Public/Client",
    permissions: "publicAccess",
    dependencies: ["firebase-admin.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "HIGH"
  },
  {
    id: "FEAT-017",
    name: "Goal Strategy Engine",
    owner: "Operations Lead",
    frontendComponent: "GoalStrategyOS.tsx",
    backendApi: "POST /api/strategy/kpis",
    databaseCollections: ["campaigns", "outcome_logs"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantMember",
    dependencies: ["SuccessCenter.tsx"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-018",
    name: "Custom Domain & SSL Provisioner",
    owner: "DevOps Engineer",
    frontendComponent: "CustomDomainCenter.tsx",
    backendApi: "POST /api/domains/setup",
    databaseCollections: ["data_integrations", "tenants"],
    authentication: "Firebase Auth Client Session",
    permissions: "tenantAdmin",
    dependencies: ["cpanel-api"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "HIGH"
  },
  {
    id: "FEAT-019",
    name: "Diagnostics & Self Healing Engine",
    owner: "DevOps Engineer",
    frontendComponent: "ProductionDiagnostics.tsx",
    backendApi: "POST /api/admin/repair/*",
    databaseCollections: ["audit_logs"],
    authentication: "Firebase Auth (SuperAdmin Role)",
    permissions: "superadminOnly",
    dependencies: ["consistencyEngine.ts", "systemHealth"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-020",
    name: "SaaS Localized Billing & Taxes System",
    owner: "Finance Officer",
    frontendComponent: "SuperAdminPortal.tsx (Commerce Panel)",
    backendApi: "POST /api/admin/commerce/rates",
    databaseCollections: ["tenants", "audit_logs"],
    authentication: "Firebase Auth (SuperAdmin Role)",
    permissions: "superadminOnly",
    dependencies: ["commerce.ts", "globalizationEngine.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "MEDIUM"
  },
  {
    id: "FEAT-021",
    name: "Multi-Tenant Audit Logging",
    owner: "Security Architect",
    frontendComponent: "EnterpriseOperationsCenter.tsx (Logs Panel)",
    backendApi: "GET /api/admin/audit-logs",
    databaseCollections: ["audit_logs"],
    authentication: "Firebase Auth Client Session",
    permissions: "adminOrAbove",
    dependencies: ["firebase-admin.ts"],
    status: "STABLE",
    lastVerification: "2026-06-28T04:41:24Z",
    riskLevel: "LOW"
  }
];
