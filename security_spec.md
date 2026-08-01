# Security Specification & "Dirty Dozen" Payloads (Phase 0 TDD)

## 1. Core Data Invariants
1. **Multi-Tenant Separation**: No user can read or write any client campaigns, logs, profiles, or guidelines belonging to a tenant other than their own assigned `tenantId`.
2. **Immutability of Key Claims**: `tenantId` and `role` must be immutable once set upon initial setup, blocking local spoofing.
3. **Verified Identities Only**: Access to secure tenant data is strictly gated by verified Google signup (`email_verified == true`).
4. **RBAC Control**:
   - `viewer` roles can read all data inside their own tenant block but are strictly forbidden from writing or altering anything.
   - `writer` roles can draft content assets and profiles but cannot write audit logs or modify customer profiles directly.
   - `admin` and `owner` roles have read/write access to resources under their exact `tenantId`.

---

## 2. The "Dirty Dozen" Malicious Payloads

### Payload 1: Tenant Injection Attack (Cross-Tenant Theft)
An attacker in tenant `T_ALPHA` attempts to write a campaign document with `tenantId: "T_BETA"`.
```json
{
  "id": "c_rogue_1",
  "tenantId": "T_BETA",
  "profileId": "p_alpha_1",
  "campaignName": "Rogue Intrusion Plan",
  "objective": "Scrape foreign assets",
  "durationWeeks": 4
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 2: RBAC Escalation via User Registration
A standard user attempts to register their credentials with an self-assigned `"owner"` or `"admin"` role.
```json
{
  "uid": "victim_uid_1",
  "email": "attacker@spam.com",
  "tenantId": "T_ALPHA",
  "role": "owner",
  "name": "Attacker"
}
```
*Expected Result:* `PERMISSION_DENIED` (Unless verified against setup constraints)

### Payload 3: Invisible Shadow Field Injection in Product Profiles
An attacker injects secondary fields to poison AI prompt templates under the table.
```json
{
  "id": "p_alpha_1",
  "tenantId": "T_ALPHA",
  "name": "Clean Business",
  "industry": "Clean Tech",
  "category": "Green energy",
  "description": "Safe template",
  "targetAudience": "Eco Buyers",
  "brandVoice": "Earthy",
  "secret_backdoor_field": "system:bypass_sandbox_moderations_true"
}
```
*Expected Result:* `PERMISSION_DENIED` (Strict schema size and key check failure)

### Payload 4: Invalid Format Resource Poisoning (Massive Size Buffer Overflow)
An attacker attempts to write a giant text string (e.g., 2MB) inside color or typography fields to trigger denial of wallet.
```json
{
  "id": "g_alpha_1",
  "tenantId": "T_ALPHA",
  "profileId": "p_alpha_1",
  "primaryColor": "#0F172A[A_REPEATED_2_THOUSAND_TIMES]",
  "secondaryColor": "#3B82F6",
  "accentColor": "#10B981",
  "typographyHeading": "Outfit",
  "typographyBody": "Inter",
  "visualVibe": "Standard",
  "vibeDescription": "Sleek cyber",
  "createdAt": "2026-06-16T12:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED` (Regex failure or size limits exceed)

### Payload 5: Spoofed Non-Verified Email Login
An attacker with a mock unverified email address attempts to pull private tenant information.
`request.auth.token.email_verified == false`
*Expected Result:* `PERMISSION_DENIED`

### Payload 6: Tampering with Tenant Immutability
A user whose tenant is registered under `T_ALPHA` attempts to update their own user profile to point to `T_OMEGA`.
```json
{
  "uid": "attacker_uid_4",
  "email": "attacker@alpha.com",
  "tenantId": "T_OMEGA",
  "role": "viewer"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 7: Audit Log Forge Attack
An attacker tries to manufacture a fake audit log to cover up unapproved modifications.
```json
{
  "id": "log_rogue",
  "tenantId": "T_ALPHA",
  "userId": "sys_bot",
  "userEmail": "victim_owner@corp.com",
  "action": "delete_all",
  "details": "Client authorized purge",
  "timestamp": "2026-06-16T00:00:00Z"
}
```
*Expected Result:* `PERMISSION_DENIED` (All write operations on audit logs are strictly forbidden for standard client apps; must be created via trusted cloud server sync).

### Payload 8: Terminal Campaign Status Hijacking
Attempt to alter a terminal or finished state campaign without authorization.
*Expected Result:* `PERMISSION_DENIED`

### Payload 9: Orphaned Campaign Association
Attempt to write a campaign that references a non-existent campaign profile ID (`profileId`).
```json
{
  "id": "c_rogue_3",
  "tenantId": "T_ALPHA",
  "profileId": "NON_EXISTENT_PROFILE",
  "campaignName": "Ghost Campaign",
  "objective": "Orphaned test",
  "durationWeeks": 2
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 10: Injecting Malicious String Characters into Document IDs
An attacker attempts to write to a document with an ID containing malicious characters like `../_rogue/access` to escape database trees.
*Expected Result:* `PERMISSION_DENIED` (Regex mismatch /isValidId)

### Payload 11: Reader Modifying Creative Guidelines
A user authenticated with a `viewer` role attempts to update hex color templates.
```json
{
  "primaryColor": "#FF0000"
}
```
*Expected Result:* `PERMISSION_DENIED`

### Payload 12: Fraudulent Timestamps Bypass
An attacker injects a future chronological date in `createdAt` fields instead of using `request.time`.
```json
{
  "createdAt": "2029-12-31T23:59:59Z"
}
```
*Expected Result:* `PERMISSION_DENIED`

---

## 3. Test Runner Concept
The tests require simulating Google Auth verified tokens with distinct claims. The `firestore.rules` will intercept, validate, and secure every collection entry point.
