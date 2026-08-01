# NAVIGATION & INFORMATION ARCHITECTURE
## Simplify Navigation, Progressive Disclosure, & Adaptive Flow Maps

This document outlines the refactored Information Architecture (IA) and navigation pathways implemented to make the MarketForge platform highly intuitive and responsive.

---

## 1. Navigational Philosophy

### A. Progressive Disclosure
To prevent cognitive overload, advanced features and raw database components are nested under submenus or settings instead of cluttering the global screen.
* **Level 1 (Direct Scan)**: The primary sidebar displays only daily operations, core objects (bookings, guests, rooms, reports), and help. This answers: *"What do I do right now?"* and *"How is my business doing?"* within 5 seconds.
* **Level 2 (Deep Dive)**: Detailed analytics, custom channel content builders, manual database imports, and subscription plan settings are tucked into secondary dashboards or individual tabs.

### B. No Deep Nesting
We enforce a strict **maximum depth of 2 levels** for all navigation configurations. The sidebar remains sticky, clean, and easily collapse-friendly for mobile/tablet screen sizes.

---

## 2. Sidebar Navigation Map

The primary left-aligned navigation sidebar has been redesigned for a high-end corporate presence, organizing related items into intuitive groups with clear, humble visual labels:

```
┌──────────────────────────────────────────┐
│  MarketForge                              │
│  Active Business: Grand Vista Resort      │
├──────────────────────────────────────────┤
│                                          │
│  [!] OVERVIEW & DAILY PLANNER            │
│  ● Overview Dashboard (Daily CommandCenter)│
│                                          │
│  [🏨] HOSPITALITY WORKSPACE               │
│  ● Bookings & Reservations               │
│  ● Guest Profiles & Intake                │
│  ● Room & Bed Inventory                  │
│  ● Housekeeping & Maintenance            │
│                                          │
│  [🚀] GROWTH & SYSTEM CONNECTS           │
│  ● Marketing Channel Campaigns           │
│  ● Automated Smart Actions (Automations) │
│  ● Team Profiles & Invites               │
│                                          │
│  [⚙️] WORKSPACE CONTROLS                 │
│  ● Workspace Settings                    │
│  ● Help Center                           │
│                                          │
└──────────────────────────────────────────┘
```

---

## 3. Detailed Navigational Mappings

Below is the structured breakdown of each primary sidebar path, showing what information it exposes and the progressive disclosure rules:

### 1. Overview Dashboard (`DailyCommandCenter` / `home`)
* **Primary Target**: Business owner and shift administrators.
* **Value Proffered**: Single-screen summary answering 4 core business questions (performance today, tasks needing immediate attention, recent activity, next steps).
* **Click Path**: Accessible in 1 click. Default entrance screen upon successful authentication.

### 2. Bookings & Reservations (`GoalStrategyOS`)
* **Primary Target**: Front Desk Staff and Managers.
* **Value Proffered**: Visual calendar view and structured searchable tabular overview of all booked guests, confirm states, and amounts.
* **Progressive Disclosure**: Detailed checkout forms, guest specific logs, and billing terms are presented inside secondary slide-out overlays.

### 3. Guest Profiles (`SuccessCenter`)
* **Primary Target**: CRM and Engagement leads.
* **Value Proffered**: Database of guest histories, preferences, and feedback.
* **Simplified Vocab**: Replaced "Client Profile Vector" or "Contact Node" with straightforward **Guest Profiles**.

### 4. Room Inventory & Housekeeping
* **Primary Target**: Hospitality Operations Team.
* **Value Proffered**: Real-time status trackers (Clean, Dirty, Under Maintenance) of physical assets, and assigning tasks to staff members.

### 5. Automated Smart Actions (`autonomous_engine`)
* **Primary Target**: Growth and Automation managers.
* **Value Proffered**: Simple rules engine to notify team members on new bookings, guest checkins, and payments.
* **Simplified Vocab**: Replaced "Orchestration State Machine Engine" or "Saga Log System" with **Automated Smart Actions**.

---

## 4. Adaptive Visual Context Strategy (The Hotel Pivot)
MarketForge is built with multi-tenant agility. The workspace dynamically adapts to the selected Business Type. Under the current **Hotel** priority, the system uses hospitality terminology throughout:
* **Bookings** instead of "Schedules/Leads"
* **Guests** instead of "Entities/Tenants"
* **Rooms** instead of "Slices"
* **Housekeeping** instead of "Maintenance Cron Logs"
* **Front Desk** instead of "Console Shell"

This makes the platform feel tailor-made for lodging and service teams, bypassing sterile developer SaaS vocabulary.
