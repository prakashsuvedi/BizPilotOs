# DEVELOPER EXPERIENCE (DX) ROADMAP
## Streamlining Enterprise SaaS Development, Standards, & Onboarding

This document establishes the strategic developer experience roadmap to ensure the MarketForge codebase remains accessible, easy to understand, and maintainable for new junior engineers, senior software architects, and AI assistant models.

---

## 1. Code Quality Standards & Conventions

To maintain a clean and coherent code architecture across development environments, MarketForge enforces the following standards:

### A. TypeScript & Code Style Rules
*   **Strict Typing**: `noImplicitAny: true` is enforced in `tsconfig.json`. Explicit interfaces or types must be declared for all components, helpers, and API endpoints. No bypasses (`any`) are allowed.
*   **ESLint Configuration**: Strict rules prohibiting unused imports, redundant variables, and unhandled promises.
*   **Component Structure**: Functional React components utilizing primitive-value hooks only (avoiding complex dependency objects that trigger infinite re-renders). All utility files are structured as modular helpers rather than long, coupled component additions.

### B. Directory Reorganization
We recommend organizing the project folder structure cleanly as follows to decrease technical overhead:

```
/src
  /assets         <-- Static assets and global logos
  /components     <-- Reusable UI visual components (Button, Card, Modal)
  /contexts       <-- Global React state contexts (Auth, Theme)
  /features       <-- Domain-specific operational features (Reservations, Guests)
  /hooks          <-- Dedicated state and custom lifecycle hooks
  /lib            <-- Third-party API proxies and Firebase connectors
  /services       <-- Modular background computations and business layers
  /types          <-- Shared typescript interfaces and entity schemas
```

---

## 2. Reusable Visual Component Tokens
Developers are strictly forbidden from writing inline styling, redundant grids, or custom layouts. Standard UI structures must use shared tokens from `/src/components`:

```typescript
// Example: Consuming the unified Card token
import { Card } from "@/components/Card";

export const GuestHighlightCard = () => {
  return (
    <Card title="Guest Information" padding="p-6">
      <p>Clean visual contents using established design parameters.</p>
    </Card>
  );
};
```

---

## 3. Developer Onboarding Pipeline

To enable a junior developer or an external AI coding assistant to set up, build, and test a change locally in under 10 minutes:

### Step 1: Environment Bootstrapping
Clone the repository and run the local development setup command:
```bash
npm install                     # Install all dependencies from package.json
cp .env.example .env            # Copy clean environment variables template
```

### Step 2: Spin Up Local Emulators
Run PostgreSQL and Redis containers locally using Docker Compose to mimic the cloud infrastructure:
```bash
docker compose up -d            # Launches local postgres and redis instances
```

### Step 3: Run Interactive Linting & Compilation Checks
Verify the local codebase before submitting a pull request:
```bash
npm run lint                    # Execute TypeScript and style audits
npm run build                   # Verify complete production compilation
```

---

## 4. Architecture Decision Records (ADRs)

Every major architectural decision, folder restructuring, or core dependency addition must be documented using an ADR template located in `/docs/adr/`:

```
┌────────────────────────────────────────────────────────┐
│  ADR-004: Migrate from Client Storage to PostgreSQL    │
├────────────────────────────────────────────────────────┤
│  Status: PROPOSED                                      │
│  Context: Multi-tenant scaling and transactional safety │
│  Decision: Migrate reservations to postgres with RLS.  │
│  Consequences: Zero double-bookings; SOC2 compliance.   │
└────────────────────────────────────────────────────────┘
```
