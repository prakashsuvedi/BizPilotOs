# MARKETFORGE DESIGN SYSTEM
## Premium, Simple, & Clean Enterprise Design Specifications

This document defines the unified visual design language, foundations, and reusable component tokens for the MarketForge platform. Every screen, view, and dialog must consume these standardized patterns to maintain an elite, cohesive, high-end SaaS feel.

---

## 1. Visual Foundations

### A. Color Palette
To create a calming, confident, and professional experience, we employ soft neutrals as the foundation, paired with one dominant indigo primary brand color and specialized, high-contrast status colors.

| Token | CSS / Tailwind Class | Visual Purpose |
| :--- | :--- | :--- |
| **Primary Brand** | `indigo-600` (`#4f46e5`) | Primary action buttons, active navigation states, focus rings. |
| **Primary Hover** | `indigo-700` (`#4338ca`) | Hover states for primary actions. |
| **Dark Slate (Display)** | `slate-900` (`#0f172a`) | Primary headings, prominent labels, dark container backdrops. |
| **Medium Neutral** | `slate-650` / `slate-700` | Standard body copy, subheadings, labels. |
| **Light Neutral (Surface)** | `slate-50` (`#f8fafc`) | Card backgrounds, list item alternates, table headers. |
| **Border Neutral** | `slate-200` (`#e2e8f0`) | Subdued boundaries, divider lines, outline controls. |
| **Success Green** | `emerald-600` (`#059669`) | Positive indicators, complete states, uptrend metrics. |
| **Warning Amber** | `amber-500` (`#f59e0b`) | Pending states, attention-required reminders. |
| **Critical Red** | `rose-600` (`#e11d48`) | High-priority alerts, canceled states, destructive actions. |

### B. Typography Pairings
Elegant typography is the single most critical vehicle for establishing a premium feel. We pair structural display headings with highly readable sans-serif controls:

* **Primary Display (Headings & Large Metrics)**: `Space Grotesk` or `Outfit`
  * *Styling*: `font-sans font-bold tracking-tight text-slate-900`
  * *Purpose*: Large dashboard metrics, card titles, hero headers.
* **Secondary & Body (General UI)**: `Inter`
  * *Styling*: `font-sans font-normal text-slate-700`
  * *Purpose*: Body paragraphs, form labels, sidebars, button text.
* **Monospaced Accents (Data & Reports)**: `JetBrains Mono`
  * *Styling*: `font-mono text-xs text-slate-500`
  * *Purpose*: Timestamps, currency values, numeric tables, identifiers.

### C. Spacing & Visual Rhythm
Avoid identical padding everywhere. Establish rhythm through intentional density:
* **Global App Margins**: `p-6` to `p-8` for spacious desktop screens.
* **Card Interior Padding**: `p-6` (24px) or `p-8` for primary bento-boxes.
* **Inline Elements / Controls**: `py-2 px-4` for comfortable touch targets.
* **Item Dividers**: Consistent spacing scales (e.g., `space-y-4` or `space-y-6`).

### D. Corners & Shadows
* **Corner Radius**: High-importance dashboard cards and main views use `rounded-3xl` (24px). Smaller buttons and input controls use `rounded-xl` (12px) to keep structural boundaries clean and sharp.
* **Subtle Elevation**: Keep shadows extremely light. Avoid muddy dark shadows. Use Tailwind's `shadow-xs` or a custom soft elevation: `shadow-[0_2px_8px_rgba(15,23,42,0.04)]`.

---

## 2. Reusable Component Blueprints

### A. Buttons

#### 1. Primary Action Button
* *Visuals*: Solid deep Indigo, smooth rounded corners, bold human-readable text, with subtle entrance transition.
* *Markup blueprint*:
  ```html
  <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]">
    Primary Action
  </button>
  ```

#### 2. Secondary Outline Button
* *Visuals*: Ghost or light neutral fill with Slate border. Subtle hover feedback.
* *Markup blueprint*:
  ```html
  <button class="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
    Secondary Action
  </button>
  ```

#### 3. Inline Text Link
* *Visuals*: Pure text with trailing arrow. Indigo or Slate color accent.
* *Markup blueprint*:
  ```html
  <button class="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
    <span>View details</span>
    <span>&rarr;</span>
  </button>
  ```

### B. Cards & Metric Displays

#### 1. Standard Content Card
* *Visuals*: Crisp white background, thin Slate outline border, generous inner padding, rounded-3xl corners, and custom spacing.
* *Blueprint*:
  ```html
  <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
    <h3 class="text-sm font-bold text-slate-900">Card Title</h3>
    <p class="text-xs text-slate-500 leading-relaxed">Clean visual layout showing actionable metadata.</p>
  </div>
  ```

#### 2. Metric Highlight Card
* *Visuals*: Features a big bold number, dynamic percentage badge, and clean micro trendlines.
* *Blueprint*:
  ```html
  <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
    <div class="flex justify-between items-start">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bookings Today</span>
      <span class="text-emerald-650 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">+12%</span>
    </div>
    <div class="mt-4 flex items-baseline gap-2">
      <span class="text-3xl font-bold text-slate-900">24</span>
    </div>
  </div>
  ```

### C. Tables & Data Layouts
Tables should remain light and readable with clear alignment:
* **Headers**: Subtle text, uppercase tracking, aligned precisely with content columns.
* **Row Hover States**: Soft background highlights (`hover:bg-slate-50/50`) to ease horizontal scanning.
* **Responsive Scroll**: Horizontal overflow-x control for tablet/mobile views.

### D. Status Badges
Status indicators must use high-contrast color mappings with matching borders:
* **Confirmed / Active**: Green text with transparent green background.
  * `text-emerald-700 bg-emerald-50 border border-emerald-100`
* **Pending / Caution**: Yellow-orange text with transparent background.
  * `text-amber-700 bg-amber-50 border border-amber-100`
* **Canceled / Critical**: Red text with transparent background.
  * `text-rose-700 bg-rose-50 border border-rose-100`
* **Completed / Standard**: Indigo/Blue text with transparent background.
  * `text-indigo-750 bg-indigo-50 border border-indigo-100`

### E. Forms & Inputs
Form inputs must have explicit height alignment, soft neutral background, focus outline states, and clear labels:
```html
<div class="space-y-1.5 text-left">
  <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Business Name</label>
  <input type="text" placeholder="e.g. Grand Vista Resort" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition" />
</div>
```

---

## 3. Screen States

### A. Supportive Empty States
Every empty screen or section must explain what it is, why it's important, what the next action is, and offer a primary button.
* **Blueprint**:
  ```html
  <div class="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
    <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
      <FolderOpen class="w-6 h-6" />
    </div>
    <h3 class="text-sm font-bold text-slate-900">No Reservations Yet</h3>
    <p class="text-xs text-slate-500 max-w-sm leading-relaxed">Reservations help you manage guest schedules and room availability. Create your first booking manually to get started.</p>
    <button class="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl transition">Create Reservation</button>
  </div>
  ```

### B. Micro-Loading State Skeletons
Use clean pulse animations in place of intrusive spinning wheels for minor loading screens.
```html
<div class="animate-pulse space-y-3">
  <div class="h-4 bg-slate-200 rounded w-1/3"></div>
  <div class="h-3 bg-slate-200 rounded w-full"></div>
  <div class="h-3 bg-slate-200 rounded w-5/6"></div>
</div>
```
