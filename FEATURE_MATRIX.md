# Feature Matrix — MarketForge AI™

This document lists the complete feature spectrum of MarketForge AI™, pairing business capabilities with their technical code paths.

---

## 🛠️ Feature Directory & Technical Paths

| Feature Category | Feature Name | Client View File | Backend Engine / Route |
|---|---|---|---|
| **Campaign Operations** | Campaign Generator | `/src/components/CampaignPlanner.tsx` | `POST /api/agent/planner` |
| **Brand Consistency** | Tone & Vibe Rules | `/src/components/CreativeDirector.tsx` | `POST /api/agent/creative` |
| **Search Optimization**| Content SEO Scoring | `/src/components/AdStudio.tsx` | `POST /api/agent/seo` |
| **Customer Mailers** | Sequences & Segments | `/src/components/EmailStudio.tsx` | `/api/email/*` |
| **Engagement Planning** | Social Queue | `/src/components/SocialStudio.tsx` | `GET/POST /api/agent/social/posts` |
| **Asset Lifecycle** | Optimization | `/src/components/AssetLifecycleCenter.tsx`| `/src/lib/renderEngine.ts` |
| **Context Extraction**  | Document Scraping | `/src/components/KnowledgeCenter.tsx` | `POST /api/agent/knowledge` |
| **Financial Routing**  | Multi-country Taxes | `/src/components/RevenueIntelligenceOS.tsx` | `/src/lib/commerce.ts` |
| **Operational Control** | Core Health | `/src/components/SystemHealthDashboard.tsx` | `/api/health` |
| **Unified Controls** | Onboarding Wizard | `/src/components/SuccessCenter.tsx` | `/api/onboarding/session` |

---

## 🔒 Security & Tenant Auditing
- **Endpoint Protection**: Evaluated across `/src/middleware/auth.ts`.
- **System Metrics**: Aggregated and monitored continuously in `/src/lib/telemetry/index.ts`.
