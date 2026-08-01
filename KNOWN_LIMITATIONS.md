# Known Limitations — MarketForge AI™

This document lists known operational boundaries and architectural trade-offs within the **v1.0 Beta** sandbox environment.

---

## ⚠️ Known Limits & Workarounds

### 1. Headless Authentication Execution
-   **Description**: Automated readiness testing and headless validation suites cannot complete standard Google OAuth popups due to lack of a browser window environment.
-   **Workaround**: Headless test suites automatically simulate valid JWT authentication states using authorized secure service account credentials.

### 2. Multi-tenant Client-side Sync State
-   **Description**: In simulated local sandboxes, client-side data is synced via `localStorage` values. Clearing the browser cache will reset simulated custom tenant list states to default preset profiles.
-   **Workaround**: Active workspaces are synced with Cloud Firestore. Users are encouraged to click **Save to Database** to ensure durable, long-term persistence.

### 3. File Upload and Storage Density
-   **Description**: Direct binary media file storage (e.g., actual `.mp4`, `.png` uploads) is managed on client-side simulation buffers unless a Cloud Storage bucket is configured.
-   **Workaround**: Large files are converted to high-efficiency WebP formats and kept in memory or mock reference strings to ensure performance remains rapid.
