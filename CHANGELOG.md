# Changelog — MarketForge AI™ Sprint 7

All notable changes in this release are documented below.

## [Sprint 7] - 2026-06-26

### Added
- Created `src/lib/errors/index.ts` containing the typed enterprise error framework (`BaseEnterpriseError`, `ValidationError`, `AuthenticationError`, `AuthorizationError`, `RateLimitError`, `RepositoryError`, `IntegrationError`, `AIProviderError`, `StorageError`, `BillingError`, `QuotaError`).
- Created `src/lib/telemetry/index.ts` incorporating central performance metrics, API/DB/AI latency instrumentation, and live system monitoring.
- Created `src/lib/EnterpriseAPIClient.ts` embedding request timeouts, automatic Bearer JWT injections, correlation ID tracing, and normalized HTTP fault translations.
- Created `src/lib/SyncEngine.ts` handling offline-first local queue persistence, backoff retry queues, and event history ledger logging.
- Integrated sync indicators and live audit diagnostics inside the onboarding wizard of the `SuccessCenter` component.

### Changed
- Refactored `SuccessCenter.tsx` state loop to leverage the new central sync states and handle network-offline flags automatically.
- Unified request headers for onboarding, database checkups, and agent coach endpoints to pass secure, formatted JWT traces.

### Fixed
- Fixed critical "Sync Fault: retrying..." loop in the background autosave daemon by introducing proper debounce timeout cleanups and connection-aware execution.
- Resolved TypeScript compilation and strict linter warnings.
