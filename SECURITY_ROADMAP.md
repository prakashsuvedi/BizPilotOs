# SECURITY IMPROVEMENT PLAN
## Secure SaaS Foundations, Compliance, & Risk Mitigation Strategy

This document details the Security Improvement Plan for MarketForge to protect sensitive customer data and ensure compliance with SOC2, GDPR, and PCI-DSS standards.

---

## 1. Security Architecture Summary

```
   [CLIENT BROWSER]
          │ (TLS 1.3 Encryption)
          ▼
   [EDGE WAF SHIELD]
          │ (DDoS Protection, Webhook Signature Verification)
          ▼
   [STRICT STATELESS API GATEWAY]
          │ (RS256 JWT Signature Checking)
          ▼
   [SECURE INTERNAL DATABASE LAYER]
          │ (Row-Level Security / Encrypted Backups)
          ▼
   [ENCRYPTED COLD STORAGE]
```

---

## 2. Actionable Security Objectives

### A. Authentication & IAM (Identity & Access Management)
1.  **Transition to Cryptographic JWTs**: Deprecate simulated client session states. Implement asymmetric RS256 JWT signature verification on all API endpoints.
2.  **Enforce Multi-Factor Authentication (MFA)**: Require mandatory TOTP (Google Authenticator) or hardware keys (WebAuthn) for administrator logins and core configuration adjustments.
3.  **Role-Based Access Control (RBAC)**: Validate permissions server-side on every API request:
    *   `Super Admin`: Global infrastructure settings, billing configurations.
    *   `Hotel Manager`: Room allocation settings, staff profiles, financial summaries.
    *   `Front Desk Agent`: Read-write reservations, guest check-in profiles.
    *   `Housekeeper`: Read-write room cleanliness statuses.

### B. Secrets & Configuration Management
1.  **Cloud Secret Manager Integration**: Strip all API tokens, database passwords, and mail server credentials from `.env` files. Move secrets into Google Cloud Secret Manager or AWS Secrets Manager.
2.  **Environment Isolation**: Use separate GCP Projects or AWS Accounts for Development, Staging, and Production environments to prevent development scripts from affecting live production data.

### C. Data Protection & Regulatory Compliance
1.  **AES-256 Storage Encryption**: Enforce complete storage disk encryption using customer-managed keys (CMEK) via Cloud KMS.
2.  **GDPR Anonymization System**: Implement automated scrubbing routines to delete customer PII across all active databases and historical logs on guest "Right to be Forgotten" requests.
3.  **PCI-DSS Offloading**: Integrate Stripe Elements so credit card details are input into iframe containers hosted directly by Stripe, ensuring sensitive payment data never touches MarketForge databases.

---

## 3. Threat Mitigation Matrix

| Attack Vector | Business Risk | Implemented Security Control | Priority |
| :--- | :--- | :--- | :---: |
| **Cross-Site Scripting (XSS)** | Thief steals session cookies to impersonate administrators. | Sanitize all dynamic templates using `DOMPurify` and set strict `Content-Security-Policy` headers. | **HIGH** |
| **DDoS Attacks** | Enterprise system is taken offline during busy booking periods. | Deploy Cloudflare WAF or AWS Shield at the application edge to rate-limit traffic. | **HIGH** |
| **SQL Injection (SQLi)** | Attackers extract database schemas and full guest lists. | Enforce parameterized queries using the Drizzle ORM and disable dynamic SQL string assembly. | **CRITICAL** |
| **Cross-Site Request Forgery (CSRF)**| Unauthorized booking cancellations or user additions. | Enforce `SameSite=Strict` and `Secure` flags on all session cookies. | **MEDIUM** |
| **Insecure Webhook Receivers** | Faked payments or bookings injected via spoofed API calls. | Require SHA256 cryptographic signature checks on all payment and external notification webhooks. | **HIGH** |
| **Broken Object Level Authorization**| One hotel user editing the reservations of a different hotel brand. | Strict server-side verification: check `tenantId` from JWT token on every database transaction. | **CRITICAL** |
