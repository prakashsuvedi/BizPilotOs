# MarketForge AI™ — Enterprise Developer Experience & Architecture Manual

This manual serves as the primary technical specification and onboarding reference for developers building on the MarketForge AI SaaS Operating System.

## Table of Contents
1. [Core Architectural Philosophy](#1-core-architectural-philosophy)
2. [Layer 1 vs Layer 2 Boundaries](#2-layer-1-vs-layer-2-boundaries)
3. [The Enterprise Repository Pattern](#3-the-enterprise-repository-pattern)
4. [Central Services & Dependency Injection](#4-central-services--dependency-injection)
5. [Granular Role-Based Access Control (RBAC)](#5-granular-role-based-access-control-rbac)
6. [The Domain Event Bus](#6-the-domain-event-bus)
7. [The Metadata-Driven Workflow Engine](#7-the-metadata-driven-workflow-engine)
8. [Automatic Multi-Tenant Provisioning](#8-automatic-multi-tenant-provisioning)
9. [Future Module SDK (Plugging in Layer 2 Verticals)](#9-future-module-sdk-plugging-in-layer-2-verticals)
10. [Coding & Folder Standards](#10-coding--folder-standards)

---

## 1. Core Architectural Philosophy
MarketForge AI is built using a strict modular architecture optimized for maximum security, zero cross-tenant data leaks, and rapid extensibility. Every vertical operation is decoupled from infrastructure logic. 

Key design mandates:
* **Tenant Isolation**: Every database interaction MUST be scoped to a strict `tenantId`. Global queries are strictly forbidden.
* **Server-Proxied Keys**: No private API keys or service credentials should ever land in client code.
* **Zero Placeholders**: Do not build mock components or faked functions. Write real integrations or graceful errors.

---

## 2. Layer 1 vs Layer 2 Boundaries
The codebase is physically partitioned into two distinct conceptual layers:

```
+------------------------------------------------------------+
|                Layer 2: Business Modules                   |
|  (Marketing, Restaurant, CRM, Hotel, Healthcare, etc.)     |
+------------------------------------------------------------+
                             │
                             ▼  [Consumes via Module SDK]
+------------------------------------------------------------+
|                Layer 1: Enterprise Core                    |
|  (Auth, RBAC, Repos, Event Bus, Workflows, Diagnostics)    |
+------------------------------------------------------------+
```

* **Layer 1 (Core)**: Exposes authentication hooks, persistent databases, logging mechanisms, feature flags, diagnostics, and subscription filters.
* **Layer 2 (Verticals)**: Registers dynamically via metadata manifests, custom navigation elements, setting inputs, AI agents, and custom sub-views.

---

## 3. The Enterprise Repository Pattern
We abstract Firestore collections behind dedicated repository singletons inside `/src/lib/repositories.ts` to guarantee transactional security, validation, and multi-tenant isolation.

### Creating a Repository Definition
Every new collection MUST inherit from `BaseRepository<T>`:

```typescript
import { BaseRepository } from './repositories';

export interface CustomRecord {
  id: string;
  tenantId: string;
  propertyName: string;
  createdAt: string;
}

export class CustomRecordRepository extends BaseRepository<CustomRecord> {
  constructor() {
    super('custom_records', {
      validate: (data) => {
        const errors = [];
        if (!data.propertyName) errors.push('propertyName is required');
        return { isValid: errors.length === 0, errors };
      }
    });
  }
}

export const customRecordRepo = new CustomRecordRepository();
```

---

## 4. Central Services & Dependency Injection
All integrations (Gemini, Mail servers, cPanel/WHM gateways) are proxied through standard services in `/src/lib/services.ts`.

Example: Sending an automated system notification with a fallback local audit channel:
```typescript
import { NotificationEngine } from './services';

await NotificationEngine.dispatch({
  tenantId: 'your-tenant-id',
  userId: 'user-uid',
  title: 'Order Completed',
  message: 'The billing pipeline processed the order safely.',
  channel: 'in_app'
});
```

---

## 5. Granular Role-Based Access Control (RBAC)
Never check strings like `role === 'admin'` inside a React UI. Centralize your permission evaluations via the `AuthorizationEngine` inside `/src/lib/services.ts`:

```typescript
import { AuthorizationEngine } from '../lib/services';

const canEdit = AuthorizationEngine.canPerform(currentUserRole, 'write:campaigns');
if (!canEdit) {
  // Disable button or show authorization alert
}
```

Standard roles supported: `owner`, `super_admin`, `admin`, `manager`, `marketing_manager`, `sales`, `content_creator`, `finance`, `viewer`.

---

## 6. The Domain Event Bus
Modules do not write to other modules. They emit decoupled standard domain events to our centralized Event Bus:

```typescript
import { EventBus } from '../lib/services';

// Trigger decoupled campaign publish action
await EventBus.publish('CAMPAIGN_PUBLISHED', tenantId, userId, {
  campaignId: 'camp_123',
  campaignName: 'Summer Launch'
});
```

Subscribed modules hook into this asynchronously without causing coupling.

---

## 7. The Metadata-Driven Workflow Engine
The onboarding pipeline is a fully metadata-driven engine:
* Fetch current steps from `/src/lib/services.ts` `WorkflowEngine`.
* Call `WorkflowEngine.advanceStep()` to progress state and trigger state history updates.

---

## 8. Automatic Multi-Tenant Provisioning
When a new organization registers, they bypass manual database setups.
The `TenantEngine.autoProvision()` function safely sets up a brand new workspace:
1. Creates `tenants` metadata records.
2. Registers the initial owner in `users`.
3. Creates default custom `brand_guidelines`.
4. Provisions a default Starter `subscriptions` containing initial AI Credits.
5. Injects initialization system audit logs.

---

## 9. Future Module SDK (Plugging in Layer 2 Verticals)
The Module SDK at `/src/lib/sdk.ts` provides complete programmatic boundaries to mount future systems without altering the core.

### Example: Writing a Restaurant Management Module Manifest
```typescript
import { EnterpriseCoreSDK, BusinessModuleSpec } from '../lib/sdk';

const RestaurantModule: BusinessModuleSpec = {
  manifest: {
    id: 'restaurant',
    name: 'Restaurant POS & Kitchen Operations',
    description: 'Manage menus, seat layouts, kitchen queues, and live ordering pipelines.',
    version: '1.0.0',
    author: 'MarketForge AI Core Team',
    requiredTier: 'Business',
    status: 'active',
    icon: 'Utensils'
  },
  navigation: [
    {
      id: 'restaurant-orders',
      label: 'Live Kitchen Orders',
      path: '/restaurant/orders',
      icon: 'ListOrdered',
      group: 'operations',
      rolesAllowed: ['owner', 'admin', 'manager']
    }
  ],
  permissions: [
    {
      id: 'write:restaurant_menu',
      name: 'Manage Food Menu',
      description: 'Allows updating or deleting menu records and inventory pricing.',
      category: 'Restaurant Operations',
      defaultRolesWithAccess: ['owner', 'admin', 'manager']
    }
  ],
  aiAgents: [
    {
      id: 'kitchen-optimizer',
      name: 'Sous-Chef Copilot',
      roleDescription: 'Predicts food preparation delays and recommends seat rotations.',
      systemDirective: 'Analyze table latency logs and provide actionable rotative steps.',
      recommendedModel: 'gemini-2.0-flash',
      temperature: 0.2
    }
  ],
  databaseSchema: [
    {
      collectionName: 'restaurant_orders',
      isTenantIsolated: true
    }
  ]
};

// Register module dynamically!
EnterpriseCoreSDK.registerModule(RestaurantModule);
```

---

## 10. Coding & Folder Standards
* **Types First**: Declare all data interfaces inside `/src/types.ts` or module SDK specs.
* **Component Modularity**: Put subcomponents inside `/src/components/` and prefix by parent module where needed.
* **Imports**: Use named imports for React components and standard lucide icons. Keep imports strictly structured.
* **Linter Compliance**: Ensure type safety by running `npm run lint` regularly. Never deploy a build with unchecked lints or compiler logs.
