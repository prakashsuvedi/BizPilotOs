# ENTERPRISE SCALABILITY & CACHING PLAN
## Scaling to 100,000 Businesses & 10 Million Users

This document outlines the scalability and performance architecture required for MarketForge to operate at enterprise scale across multiple regions, currencies, and timezones.

---

## 1. Database Tier Scaling

### A. Transition to Relational Database Sharding
To scale past Firestore single-document write constraints (10,000 writes/sec per database), MarketForge will transition its transactional core to a multi-tenant PostgreSQL database cluster:
*   **Logical Tenant Isolation**: Enforce PostgreSQL Row-Level Security (RLS) policies on the `tenant_id` column.
*   **Horizontal Sharding**: Shard database tables across separate physical servers using the `tenant_id` as the shard key, ensuring queries are routed directly to the tenant's shard.

### B. Indexing and Optimization Strategy
1.  **Composite Indexes**: Configure composite indexes on high-frequency query patterns (e.g., `(tenant_id, room_status, date_range)`).
2.  **Read-Write Segregation**: Deploy database read replicas. Direct heavy analytical charts and report generation queries to read-replicas, keeping the primary write master free for booking transactions.

---

## 2. Distributed Caching Layer

```
   [CLIENT APPLICATION]
            │ (Query Request)
            ▼
   [DISTRIBUTED REDIS CACHE]  ───(Cache Hit: Returns <10ms)───► [CLIENT]
            │
       (Cache Miss)
            ▼
   [PRIMARY PG DATABASE]
            │
     (Updates Cache)
            ▼
   [REDIS WRITE-BACK]
```

### Caching Implementation Guidelines
*   **Tenant Configurations Cache**: Store hotel business settings and tax configurations in Redis with a 24-hour Time-to-Live (TTL). Invalidate cache on settings updates.
*   **Room Rate Availability Cache**: Cache room rates and vacancy lists with short TTLs (15 minutes). Invalidate immediately when a room is booked or marked dirty.
*   **Session State Cache**: Keep active auth sessions in Redis to support stateless session validation at the API Gateway level.

---

## 3. Background Job & Queue Architecture

To prevent long-running tasks (like marketing newsletter builds or bulk customer report compiles) from blocking Express thread pools:
1.  **BullMQ Task Queuing**: Implement a Redis-backed job queue (BullMQ) to process background tasks asynchronously.
2.  **Isolated Worker Processes**: Run background worker processes in dedicated, auto-scaling container configurations separate from web servers.
3.  **Idempotency Checks**: Guarantee that all event consumers (e.g., email dispatchers or payment processors) are fully idempotent, preventing duplicate execution during network retries.

---

## 4. Scalability Metrics Dashboard

We monitor platform performance and set alerts using objective, enterprise-grade indicators:

| Scale Indicator | Alert Threshold | Scalability Mitigation Action |
| :--- | :--- | :--- |
| **API Latency (p99)** | > 250ms | Trigger horizontal auto-scaling on API microservices; verify Redis cache hit rates. |
| **DB Connection Pool Exhaustion**| > 85% Pool Capacity | Scale PgBouncer connections and spin up additional database read replicas. |
| **Redis Cache Eviction Rate** | > 5% Evictions/sec | Increase Redis memory allocation or adjust cache eviction policies. |
| **Message Queue Latency** | > 60 seconds | Spawn additional background worker containers to process queued tasks. |
| **Web Server CPU Usage** | > 70% average | Trigger horizontal container auto-scaling (add Cloud Run instances). |
