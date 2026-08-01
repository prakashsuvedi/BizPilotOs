# Database Schema — MarketForge AI™

This document defines the Firebase Firestore collections and relational data structures used by the application.

---

## 🗄️ Firestore Collections Mapping

All documents must be written with the strict `tenantId` property to enforce multi-tenant isolation.

### 1. `tenants`
Stores the metadata, settings, and subscription plans for active client environments.
```typescript
interface Tenant {
  id: string;             // Document ID
  name: string;
  domain: string;
  ownerEmail: string;
  status: 'active' | 'suspended' | 'trialing';
  plan: 'Starter' | 'Growth' | 'Agency' | 'Enterprise';
  mrr: number;
  trialDaysLeft: number;
  activeUsers: number;
  storageMb: number;
  health: string;
  apiRequests: number;
  knowledgeAssets: number;
  disabledModules: string[];
}
```

### 2. `users`
Profiles registered for authentication, mapped by their unique auth UID.
```typescript
interface User {
  uid: string;            // Document ID
  tenantId: string;       // Tenant Isolation Key
  email: string;
  displayName?: string;
  role: 'owner' | 'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer';
  status: 'active' | 'inactive';
  devices?: Array<{
    deviceId: string;
    os: string;
    lastActive: string;
    ip: string;
  }>;
}
```

### 3. `campaign_profiles`
Unified settings mapping targeted audiences, tones of voice, and brand strategies.
```typescript
interface CampaignProfile {
  id: string;
  tenantId: string;
  name: string;
  industry: string;
  category: string;
  description: string;
  targetAudience: string;
  brandVoice: string;
}
```

### 4. `campaigns`
Active marketing executions containing structured timelines and channels.
```typescript
interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  channels: string[];
  startDate: string;
  endDate: string;
  budget: number;
  conversionGoal: string;
}
```

### 5. `brand_guidelines`
Rules and assets grounding the AI generation outputs.
```typescript
interface BrandGuideline {
  id: string;
  tenantId: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  tagline: string;
  restrictedKeywords: string[];
}
```

### 6. `audit_logs`
Cryptographically auditable transaction logs recording critical tenant modifications.
```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  type: string;           // 'auth' | 'tenant_mutation' | 'ai_orchestration' | 'billing'
  severity: 'low' | 'medium' | 'high' | 'critical';
  actor: string;          // User email or system process
  details: string;
}
```
