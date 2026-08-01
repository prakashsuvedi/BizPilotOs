# MULTI-TENANT ARCHITECTURE SPECIFICATION
## Provisioning Pipelines, Schema Isolation, Security Rules, & Safe Rollback Engines

This document specifies the database, network, and security layer architectures that ensure absolute isolation across tenants, high scalability, and robust transactional rollback mechanics.

---

## 1. Tenant Environment Schema Layout

```
                        [FIREBASE SECURITY RULES]
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   [TENANT A: HOTEL AURORA]                 [TENANT B: COSMO GYM]
   - Path: /tenants/tenant_001              - Path: /tenants/tenant_002
   - Users: [User_1, User_2]                - Users: [User_3]
   - Bookings, Tasks, Public Web            - Class Schedules, Web Assets
```

---

## 2. Dynamic Tenant Provisioning Workflow

When a Super Admin creates a new business, the system executes an atomic transaction containing the following modules:

### Phase A: Core Metadata Provisioning
1.  Generate unique, immutable `tenantId` (UUID v4).
2.  Write metadata record to central administrative registry (`/tenants/{tenantId}`).
3.  Inject default tenant settings:
    ```json
    {
      "tenantId": "tenant_aurora_901",
      "businessName": "Aurora Hotel",
      "packageTier": "pro",
      "status": "PROVISIONING",
      "createdAt": "2026-07-05T21:20:00Z"
    }
    ```

### Phase B: Default Data Structure Hydration
Automatically create standard reference documents inside sub-collections under the tenant scope:
*   `/tenants/{tenantId}/settings/branding` -> default layout colors, neutral slate themes, standard placeholder logos.
*   `/tenants/{tenantId}/modules/config` -> default dashboard widgets enabled for the selected package.
*   `/tenants/{tenantId}/roles/config` -> standard permissions inheritance lists.

### Phase C: Initial User & Invitation Dispatch
1.  Record owner registration template into tenant staff lists.
2.  Dispatch onboarding email using template custom tags.

---

## 3. Transactional Safety & Rollback Engine

To prevent orphaned or corrupted half-created tenants, the provisioning code runs inside an isolated atomic transactional executor block:

```typescript
export async function executeProvisioningPipeline(provisioningData: ProvisioningPayload) {
  const rollbackStack: Array<() => Promise<void>> = [];
  
  try {
    // 1. Write metadata
    await writeMetadata(provisioningData);
    rollbackStack.push(async () => { await deleteMetadata(provisioningData.tenantId); });
    
    // 2. Hydrate default schemas
    await hydrateDefaultSchemas(provisioningData.tenantId);
    rollbackStack.push(async () => { await cleanDefaultSchemas(provisioningData.tenantId); });
    
    // 3. Register domain mapping
    await registerDomainMapping(provisioningData.subdomain);
    rollbackStack.push(async () => { await removeDomainMapping(provisioningData.subdomain); });
    
    // 4. Update status
    await markProvisioningComplete(provisioningData.tenantId);
    
  } catch (error) {
    console.error("Provisioning pipeline failed! Executing rollbacks safely...", error);
    
    // Unwind all successful steps in reverse sequence
    for (let i = rollbackStack.length - 1; i >= 0; i--) {
      try {
        await rollbackStack[i]();
      } catch (rollbackError) {
        console.error("Critical Rollback item failed! System is desynchronized.", rollbackError);
      }
    }
    
    throw new Error(`Provisioning Failed: ${error.message}`);
  }
}
```

---

## 4. Multi-Tenant Firestore Security Rules

To enforce database-level boundaries (preventing Tenant B from querying Tenant A's documents, even if Client-side filters are compromised), Firestore security policies enforce:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Validates user has active authenticated session
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Validates user's tenant token matches the document's tenant scope
    function belongsToTenant(tenantId) {
      return isAuthenticated() && request.auth.token.tenantId == tenantId;
    }

    // Rules for individual tenant sub-records
    match /tenants/{tenantId}/bookings/{bookingId} {
      allow read, write: if belongsToTenant(tenantId);
    }
    
    match /tenants/{tenantId}/staff/{userId} {
      allow read: if belongsToTenant(tenantId);
      allow write: if belongsToTenant(tenantId) && request.auth.token.role == 'Owner';
    }
  }
}
```
This architecture guarantees that the multi-tenant SaaS foundation remains secure, reliable, and compliant at any scale.
