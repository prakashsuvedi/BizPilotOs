# Project Structure — MarketForge AI™

This directory layout details the layout of files and subcomponents inside the workspace.

## 📂 Root Directory Configurations
- `/server.ts` — Main Express server routing all API operations, mail delivery systems, and Gemini API queries.
- `/package.json` — System dependencies and build configurations.
- `/firestore.rules` — Rules defining security parameters of collections.

## 📂 React Source Code (`/src/`)
- `/src/App.tsx` — Root React entry point. Directs routing flows and mounts main workspaces.
- `/src/main.tsx` — Direct DOM entry point loading Inter and JetBrains fonts.
- `/src/index.css` — Standard CSS style file with custom themes.

### 📂 Shared UI Components (`/src/components/`)
- `/src/components/SuperAdminPortal.tsx` — Platform-wide control center hosting tenants, feature flags, global pricing indexes.
- `/src/components/EnterpriseKnowledgeCenter.tsx` — Interactive project map, architecture, deployment plans, and Digital Twin assistants.
- `/src/components/SuccessCenter.tsx` — Multi-step onboarding workspace guides and courses.
- `/src/components/AdStudio.tsx` — Content copywriting assistant.
- `/src/components/EmailStudio.tsx` — Campaign mail dispatcher.
- `/src/components/RevenueIntelligenceOS.tsx` — Revenue and local currency invoice generator.
