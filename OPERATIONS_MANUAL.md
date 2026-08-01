# OPERATIONS & RUNTIME MANUAL
## Platform Reliability, Incident Recovery, & Support Procedures

This document outlines the standard operational guidelines, diagnostic steps, and recovery strategies for the MarketForge Enterprise Platform.

---

## 1. Monitoring & Observability Metrics

The platform is continuously monitored through an API and infrastructure observability layer. System metrics are gathered and aggregated automatically:

*   **Platform Health Endpoint**: The system exposes a standardized JSON status route under `/api/health` checking database, cache, and queue latency.
*   **Infrastructure Health Levels**:
    *   `HEALTH_GREEN (100-90)`: Operating normally with response latencies under 150ms.
    *   `HEALTH_YELLOW (89-70)`: Elevated queue processing delays or secondary cache degradation; triggers alerts to staff.
    *   `HEALTH_RED (<70)`: Core database connection failure or authentication API block; immediately alerts the on-call engineer.

---

## 2. Standard Logging Format

All application logs must be structured in a machine-readable JSON format for ingestion by Elasticsearch or Grafana Loki:

```json
{
  "timestamp": "2026-07-05T21:15:30.120Z",
  "level": "ERROR",
  "service": "ReservationService",
  "tenantId": "hotel-aurora-3912",
  "requestId": "req-9a3d-4c12-8e9f",
  "message": "Failed to log customer room booking allocation due to lock timeout",
  "error": {
    "code": "DB_LOCK_TIMEOUT",
    "details": "SELECT ... FOR UPDATE timed out after 3000ms"
  },
  "recovery": {
    "action": "AUTO_RETRY",
    "status": "QUEUED"
  }
}
```

---

## 3. Incident Response Playbook

When an operational failure is reported (e.g., via Slack or PagerDuty), support engineers must follow this three-step protocol:

```
┌────────────────────────────────────────────────────────┐
│  STEP 1: Isolate (Block affected tenant or routing)   │
├───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STEP 2: Analyze Logs (Query requestId in Loki)         │
├───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STEP 3: Remediate (Failover to standby/rebuild cache) │
└────────────────────────────────────────────────────────┘
```

### Incident Recovery Scenarios

#### Scenario A: DB Lock Contention on Bookings
*   **Action**: Force-kill long-running transaction queries blocking lock pools:
    ```sql
    SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND age(query) > interval '5 minutes';
    ```
*   **Client Communication**: Advise customer front desk agents to refresh checkout tabs.

#### Scenario B: Redis Cache Corruption / Desynchronization
*   **Action**: Flush stale memory keys for the affected tenant dynamically:
    ```bash
    redis-cli -h cache-master DEL "tenant:hotel-aurora-3912:room_rates"
    ```

---

## 4. Backup & Restore Procedures

### Automated Hourly DB Backups
An automated pipeline executes a full snapshot copy of database partitions every hour, storing the resulting dump file inside multiple geographical buckets:
```bash
pg_dump -U db_admin -h db-master -d marketforge_prod | gzip > /backups/marketforge_$(date +%F_%H).sql.gz
```

### Recovery Verification Routine
To verify backup viability, a secondary recovery container restores the latest backup dump automatically every 24 hours into an isolated sandbox database, validating schema consistency.

---

## 5. Operations Checklists

### Release Checklist
- [ ] Step 1: Run all Vitest unit and integration suites.
- [ ] Step 2: Ensure Playwright E2E browser flows compile cleanly.
- [ ] Step 3: Run static security code scanning (Snyk / npm audit).
- [ ] Step 4: Validate database migration scripts.
- [ ] Step 5: Verify CDN asset availability.

### Maintenance Checklist
- [ ] Step 1: Verify database disk utilization is under 75%.
- [ ] Step 2: Review Redis cache hit ratios (alert if under 80%).
- [ ] Step 3: Rotate cryptographic access keys in Google Secret Manager.
- [ ] Step 4: Scrub and clear temporary files older than 7 days.
