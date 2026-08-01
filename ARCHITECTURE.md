# System Architecture Document — MarketForge AI™

## Architectural Overview

MarketForge AI™ utilizes a highly decoupled, multi-tenant Software-as-a-Service (SaaS) architecture designed to guarantee robust tenant isolation, data protection, and operational efficiency.

The system is structured into two clean layers:

```
+-------------------------------------------------------------------+
|                   Layer 2 — Business Modules                     |
|  (Campaign Planner, Brand Kit, Media Library, Success Center)   |
+-------------------------------------------------------------------+
                                  |
                                  v  (Dependency Injection / API Client)
+-------------------------------------------------------------------+
|                   Layer 1 — Enterprise Core                      |
| (Authentication, EnterpriseAPIClient, SyncEngine, Telemetry)      |
+-------------------------------------------------------------------+
```

---

## Core Components

### 1. Enterprise API Client (`src/lib/EnterpriseAPIClient.ts`)
The universal communication gateway. No components invoke raw `fetch()` directly; instead, they query the `api` instance which implements:
- **Resilience**: Configurable retry policies with exponential backoff delays.
- **Tracing**: Attaches unique `X-Correlation-ID` headers to every outbound frame.
- **Authentication**: Automatically extracts and signs credentials securely.

### 2. Enterprise Sync Engine (`src/lib/SyncEngine.ts`)
Manages asynchronous backend write queues:
- **Deduplication**: Dynamically merges redundant edits to prevent database lock contention.
- **Offline Resiliency**: Detects network dropouts and falls back to an offline local queue, automatically synchronizing changes once connectivity is restored.

### 3. Central Telemetry Core (`src/lib/telemetry/index.ts`)
Collects and aggregates platform diagnostic metrics, calculating latency patterns and error rates for the Super Admin Health dashboard.

### 4. Enterprise Error Framework (`src/lib/errors/index.ts`)
Converts network, authentication, and database anomalies into clear, typed classes containing severity assessments and retryable indicators.
