# API Reference — MarketForge AI™

This manual lists the core backend API routes exposed by the Express full-stack application (`server.ts`).

---

## 🔐 Authentication & Tenant Onboarding

### `POST /api/tenant/onboard`
Triggers transactional, atomic onboarding for a brand new business entity.
-   **Payload**:
    ```json
    {
      "name": "Acme Marketing",
      "email": "owner@acme.com",
      "password": "securepassword",
      "industry": "Ecommerce",
      "plan": "Growth"
    }
    ```
-   **Response**: `200 OK` with the newly provisioned tenant data, workspace profile, default permissions, subscription ledger, and system setup logs.

### `POST /api/tenant/login`
Validates user credentials and synchronizes multi-tenant state.
-   **Payload**:
    ```json
    {
      "tenantId": "acme-marketing",
      "email": "owner@acme.com",
      "password": "securepassword"
    }
    ```
-   **Response**: `200 OK` returning active session token, workspace status, subscription validity, and user RBAC details.

---

## 🤖 AI Orchestration Core

### `POST /api/agent/orchestrate`
Centralized entry point for advanced AI generation grounded in brand context.
-   **Payload**:
    ```json
    {
      "tenantId": "demo-tenant",
      "prompt": "Create a high-impact Facebook ad copy for our new eco-bottle.",
      "brandKitId": "brand_default_123",
      "tone": "energetic"
    }
    ```
-   **Response**: `200 OK` returning highly tailored text copy. Automatically debits credit quota.

---

## 📱 Social Studio & Media Services

### `GET /api/agent/social/posts`
Retrieves scheduled and published posts for the active tenant workspace.
-   **Response**: `200 OK` with list of `SocialPost` records.

### `POST /api/agent/social/posts`
Registers a new scheduled post in the content queue.
-   **Payload**:
    ```json
    {
      "platforms": ["LINKEDIN", "TWITTER"],
      "postType": "IMAGE",
      "caption": "Accelerate growth with MarketForge AI!",
      "scheduledFor": "2026-07-01T10:00:00Z"
    }
    ```
-   **Response**: `201 Created` returning the saved `SocialPost` structure.
