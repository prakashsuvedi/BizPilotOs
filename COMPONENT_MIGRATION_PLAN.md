# COMPONENT MIGRATION PLAN
## Strategic Codebase Refactoring & Regression Prevention Strategy

This document details the step-by-step incremental migration plan to refactor the MarketForge React/TypeScript codebase. It ensures we transition safely to our unified design system and navigation architecture while guaranteeing zero regressions to existing Firestore data storage, authentication flows, or business logic.

---

## 1. Migration Goals & Principles

1. **Zero Downtime / Zero Regressions**: The application is actively utilized. Existing functionalities (such as the interactive dashboard, booking systems, marketing campaign creators, and admin settings) must compile cleanly and operate perfectly at every commit.
2. **Incremental Scoping**: We never attempt a massive, multi-file sweep in a single pass. We refactor and test one file/view at a time, verify with build and lint tools, and then commit before proceeding.
3. **Lazy Initialization Safety**: Keep third-party SDKs and Firestore connectors shielded within robust error-boundaries and check-guards to prevent app crashes on missing client tokens.

---

## 2. Refactoring Phases

```
┌────────────────────────────────────────────────────────┐
│  PHASE 1: Foundation Setup (UI_UX_AUDIT / Design System)│
├───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 2: Plain-English Vocabulary Cleanse             │
├───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 3: Sidebar & Global Navigation Consolidation     │
├───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 4: Dashboard (DailyCommandCenter) Modernization  │
├───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 5: Adaptive Business Type (Hotel Terminology)    │
└────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation Setup & Audits (COMPLETED)
* **Actions**: Conduct visual research, document architectural pain points, and define unified design system standards (`DESIGN_SYSTEM.md`, `UI_UX_AUDIT.md`, `NAVIGATION_ARCHITECTURE.md`).
* **Verification**: Ensure no syntax changes exist; app is fully compiled.

### Phase 2: Plain-English Vocabulary Cleanse (COMPLETED)
* **Actions**: Edit major visual panels (`App.tsx`, `LaunchCenter.tsx`, `DailyCommandCenter.tsx`) to systematically replace internal SaaS jargon (e.g., Tenant, Provisioning, Telemetry) with natural Everyday English.
* **Verification**: Run `npm run lint` and `npm run build` to confirm no broken import structures or TS errors.

### Phase 3: Global Header & Sidebar Consolidation (COMPLETED)
* **Actions**: Redesign the sidebar in `LaunchCenter.tsx`. Group the 18 messy tabs into highly scannable human-centered groups. Update active status highlights and introduce custom animations.
* **Verification**: Click through each link to confirm correct view routing and state persistence.

### Phase 4: Daily Command Center Dashboard Overhaul (COMPLETED)
* **Actions**: Redesign the `DailyCommandCenter.tsx` layout. Replace cluttered bento telemetry blocks with the four clean metric cards (Bookings Today, Revenue Today, New Customers, Tasks Due) and a responsive "Today's Priorities" interactive checklist.
* **Verification**: Check stateful task checklist toggles and currency conversion calculations.

### Phase 5: Adaptive Business Customizer (COMPLETED)
* **Actions**: Ensure the vocabulary matches the hospitality business model dynamically (incorporating Bookings, Rooms, Housekeeping, Guests).
* **Verification**: Verify visual layouts adapt perfectly.

---

## 3. Regression Protection Checklist

Before marking any refactoring milestone as "complete", the following checklist must be validated via build tools:

- [x] **Authentication E2E**: User can sign in, log out, and transition between screens seamlessly.
- [x] **State Persistence**: Checklist priority items and setup progress variables persist in React local-state or client storage.
- [x] **Visual Consistency**: No uncoordinated purple gradients, tech larping margin texts, or raw console overlays appear in standard modes.
- [x] **Responsive Adaptability**: Layout shifts flawlessly between Mobile (touch targets >= 44px) and Desktop views.
- [x] **Compilation/Linter Integrity**: The terminal completes building with zero errors.
