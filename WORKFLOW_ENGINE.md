# CONFIGURABLE WORKFLOW ENGINE
## State-Machine Approvals, Hierarchical Escalations, & Custom Triggers

This document specifies the Workflow Engine that manages multistep operational approvals (e.g., procurement requests, high-value refund approvals, or room status changes).

---

## 1. Approval State Machine Model

```
   [RECEPTION / STAFF] (Initiates request, e.g. Refund $250)
            │
            ▼
   [PENDING MANAGER APPROVAL] (Operations Manager checks)
            │
            ├───(Declined: Returns to Draft)───► [STAFF REJECTED]
            ▼
   [PENDING OWNER APPROVAL] (Triggered automatically if > $100 limit)
            │
            ├───(Approved)
            ▼
   [SUCCESSFULLY RESOLVED / EXECUTED]
```

---

## 2. Dynamic Workflow Schema

Workflows are defined as state machines inside a dedicated collection (`/tenants/{tenantId}/workflows/{workflowId}`). This allows business owners to customize approval steps dynamically:

```json
{
  "workflowId": "refund-approval-wf",
  "name": "High-Value Guest Refunds",
  "trigger": "transaction:refund_initiated",
  "conditions": {
    "field": "amount",
    "operator": "greater_than",
    "value": 100
  },
  "steps": [
    {
      "stepIndex": 1,
      "role": "GeneralManager",
      "action": "APPROVE_OR_DENY",
      "timeoutHours": 24,
      "escalationRole": "Owner"
    },
    {
      "stepIndex": 2,
      "role": "Owner",
      "action": "FINAL_APPROVE",
      "timeoutHours": 48,
      "escalationRole": null
    }
  ],
  "status": "ACTIVE"
}
```

---

## 3. Workflow Executive State Tracker

Every active workflow run records its current step, assignee logs, and complete audit history inside a historical logging document:

```typescript
export interface WorkflowRun {
  id: string;
  workflowId: string;
  tenantId: string;
  initiatedBy: string;       // User ID
  currentStepIndex: number;  // Progress index
  payload: any;              // Transaction/item details
  status: "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";
  history: Array<{
    timestamp: string;
    stepIndex: number;
    actorId: string;
    action: "APPROVE" | "DENY" | "ESCALATE";
    comment: string;
  }>;
}
```

---

## 4. UI Dashboard Interaction (UX Guide)

Approving managers receive high-priority action alerts inside a dedicated "Operations Tasks" feed. The card uses standard luxurious styling with prominent action triggers:

```
┌────────────────────────────────────────────────────────┐
│  ⚠️ APPROVAL REQUIRED                                  │
│                                                        │
│  Request: Guest Refund for $250.00                    │
│  Initiated By: Sarah Jenkins (Front Desk Agent)       │
│  Guest: Alice Vanderbilt (Room 304)                    │
│  Reason: Duplicate charge on spa package check out    │
│                                                        │
│  [ DECLINE ]                         [ APPROVE & NEXT ] │
└────────────────────────────────────────────────────────┘
```

*   **Microinteractions**: Hovering over "Approve & Next" triggers a subtle green glow. Clicking the button executes the transition, firing a quiet haptic vibration (on mobile devices) and refreshing the operational queue without full page layout reloads.
