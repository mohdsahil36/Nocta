# Nocta — Design System

The single source of truth for how Nocta looks and behaves. Read this before building any new page, component, or layout. Screen-specific notes live in `/docs/design/screens/`.

---

## §1. Philosophy

**Calm, direct, adult.** Every visual decision should communicate clarity and confidence.

- Whitespace is intentional. Breathing room is not waste.
- Momentum over guilt. Empty states offer one action, not apology.
- No hype, no WIP copy, no fake social proof, no API jargon in the UI.
- The score decides. UI reflects outcomes — it does not editorialize.
- Ship complete surfaces. No dead stubs, no "coming soon" copy.

**Two design registers — same token system:**
- **Landing page** — editorial craft, Instrument Serif headings, breathing room.
- **In-app Blueprint desk** — flat, functional, dense-but-not-cramped.

They share every color, radius, and spacing token. Never fork the token system.

---

## §2. Color

The primary is **green** — the same token in light and dark mode, on every surface including the landing page. No black/white override.

```
--primary:            oklch(0.5568 0.1355 155.8120)
--primary-foreground: oklch(0.9213 0.0135 167.1556)
--background:         #f8f8f6   (warm off-white)
--foreground:         neutral-950 / neutral-50
```

**Usage rules:**
- `bg-primary text-primary-foreground` on filled buttons — never `text-white`.
- `bg-primary/8` or `bg-primary/10` for subtle tinted surfaces.
- `border-primary/20` for tinted borders.
- `text-primary` for labels, badges, active states.
- Never hardcode hex or `rgb()` for brand colors in className.

**Neutral palette (most UI lives here):**
```
Strong text:     text-neutral-950  dark:text-neutral-50
Body / secondary:text-neutral-500
Muted / hints:   text-neutral-400
Placeholder:     text-neutral-300  dark:text-neutral-600
Borders:         border-neutral-200 dark:border-neutral-800
Hairlines:       border-neutral-100 dark:border-neutral-800
Hover bg:        bg-neutral-50     dark:bg-neutral-900
```

**Accent tones (for icons and indicators only — not backgrounds):**
```
Warm (streak):  text-orange-500  bg-orange-50  dark:bg-orange-950/30
Gold (trophy):  text-amber-500   bg-amber-50   dark:bg-amber-950/30
Danger:         text-destructive
Success:        text-primary (green IS success here)
```

---

## §3. Typography

```
--font-sans:    Outfit       (body, UI, labels)
--font-heading: Instrument Serif  (landing headings only)
--font-mono:    system mono  (labels, badges, code, metadata)
```

**Never use `next/font` `.className` for Outfit.** It is loaded via CSS variable.

**Scale:**

| Role | Class |
|---|---|
| Page heading (landing) | `font-heading text-[clamp(2.8rem,7vw,4.5rem)] leading-[1.08] font-normal` |
| Section heading (landing) | `font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-normal` |
| In-app page title | `text-xl font-semibold tracking-tight` |
| In-app section title | `text-base font-semibold` |
| Body copy | `text-sm leading-6 text-neutral-500` (in-app) / `text-[15px] leading-7` (landing) |
| Mono label / caps | `font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400` |
| Mono metadata | `font-mono text-[11px] text-neutral-400` |
| Mono badge / pill | `font-mono text-[9px]–text-[11px]` |

**Rules:**
- Instrument Serif is landing hero and section headings only. Never inside the app.
- Mono for labels, metadata, counts, badges, keyboard shortcuts, and any data identity (SHA, date, time).
- Never use `text-[12px]` or smaller for body copy. Use mono at that size only.

---

## §4. Spacing & Layout

**Page container:**
```
max-w-4xl mx-auto px-4 sm:px-6     (landing)
px-5 sm:px-8 py-6 sm:py-8          (in-app shell padding, set by shell)
```

**Section rhythm:**
```
gap-16   between major landing sections
gap-6    between in-app page sections
gap-4    between cards within a section
gap-3    between items in a list
gap-2    between tight elements (label + input)
```

**Card padding:**
```
Outer card:      px-6 py-5  (in-app)  /  px-8 py-8 sm:px-10  (landing)
Inner card:      px-5 py-4
Compact row:     px-4 py-3  or  px-5 py-2.5
```

**Border radius:**
```
Page cards:      rounded-2xl
Inner cards:     rounded-xl
Buttons/inputs:  rounded-lg
Badges/pills:    rounded-full  or  rounded-md
Icon tiles:      rounded-xl  (large)  /  rounded-lg  (small)
Heatmap cells:   rounded-[3px]
```

---

## §5. Surface Hierarchy

Every surface has one of these backgrounds. Pick the right tier — never mix tiers within a card.

```
Tier 0 — Page canvas
  Light: bg-[#f8f8f6]
  Dark:  bg-neutral-950 (or bg-nocta-canvas in-app)

Tier 1 — Primary card (most content lives here)
  bg-white dark:bg-neutral-950
  border border-neutral-200 dark:border-neutral-800
  rounded-2xl

Tier 2 — Elevated / dark card (hero, section scenes, footer, feed bg strips)
  bg-neutral-950 border border-neutral-800
  rounded-2xl

Tier 3 — Muted inset (rows, alternate bg, hover states)
  bg-neutral-50 dark:bg-neutral-900  (hover)
  bg-neutral-50/80 dark:bg-neutral-900/60  (sticky header rows inside lists)

Tier 4 — Overlay / dialog
  bg-white dark:bg-neutral-950 with shadow-xl
```

---

## §6. Layout Patterns

These are the approved layouts. Pick one for each new page — don't invent hybrids.

### A. Full-width single column
For simple pages, settings, onboarding steps.
```
<section class="flex flex-col gap-4 w-full">
  [header card]
  [content card]
  [content card]
```

### B. Fixed sidebar + flex content (2-column)
For pages with persistent context (stats, filters) and a primary content area.
```
grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start

Left:  lg:sticky lg:top-4  — context cards (stats, filters, nav)
Right: primary content (feed, list, form)
```
Sidebar width: `280px`–`340px` depending on content density.

### C. Equal split (2-column)
For compare, settings with preview, or feature section demos.
```
grid grid-cols-1 lg:grid-cols-2 gap-6
```

### D. Wide content + narrow metadata (reverse sidebar)
For detail pages (goal detail, plan step).
```
grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4
```

### F. Master-detail (list + detail panel)
For pages where items have meaningful detail (goals, plan steps, settings entries). Eliminates virtualization — the list is always scannable.
```
grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]

Left:  slim list rows (~52px each) — name + key indicators only
       Active row: border-r-2 border-primary bg-primary/8
       Inactive row: hover:bg-neutral-50 dark:hover:bg-neutral-900
Right: full detail panel — heading, metadata, body, actions, expandable sub-content
```
- Filter tabs sit *above* the grid, inside the parent card as a `border-b` header row.
- Selecting a row auto-populates the detail; first row is pre-selected.
- Actions (edit/archive) live in the detail panel, not the list rows.
- Sub-content (e.g. plan steps) expands inline in the detail panel — never in the list row.

### E. Tabs inside a card
For multi-state content within one surface. Progress bar on active tab, no left-border indicator.
```
Left panel: tab list with 2px bottom progress bar
Right panel: illustration / content, AnimatePresence mode="sync"
```

**Card header rule:** section labels that float *above* a card create visual gaps. Put them *inside* the card as a header row with a `border-b` hairline. Floating labels are only acceptable for top-level page section titles (e.g. "Overview"), never for card titles.

---

## §7. Components

### Buttons
Buttons always use `font-sans` (default). Never `font-mono` on a button, tab, or CTA link — that is for data only.

```
Primary:   bg-primary text-primary-foreground hover:bg-primary/90
           rounded-lg px-4 py-2 text-sm font-semibold

Outline:   border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900
           text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800
           rounded-lg px-3 py-1.5 text-xs

Ghost:     text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50
           No background, no border. px-3 py-1.5
```

**Font rule — mono is for data, not chrome:**
```
font-mono  → counts, dates, times, SHAs, badges, section labels (UPPERCASE caps), metadata
font-sans  → buttons, tabs, nav links, CTAs, body copy, headings, dialog titles
```
`card.tsx` and `dialog.tsx` title slots use `font-sans font-semibold tracking-tight`. Never `font-heading` inside the app.

### Icon tiles
Small colored containers for icons inside cards. Always paired with a text label.
```
size-8 rounded-lg   (compact, e.g. stat rows)
size-9 rounded-xl   (standard, e.g. stat cards)

Tones:
  primary:  bg-primary/8 text-primary
  warm:     bg-orange-50 dark:bg-orange-950/30 text-orange-500
  gold:     bg-amber-50 dark:bg-amber-950/30 text-amber-500
  neutral:  bg-neutral-100 dark:bg-neutral-800 text-neutral-500
```

### Badges / Pills
```
Primary pill:  bg-primary/8 border border-primary/20 text-primary
               font-mono text-[9px]–text-[11px] rounded-full px-1.5–px-2 py-0.5

Status dot:    size-1.5 rounded-full bg-primary animate-pulse

Beta badge:    border border-primary/30 bg-primary/8 text-primary
               font-mono text-[9px] uppercase tracking-[0.14em]
```

### Weight bars
5-step importance indicator. Use bars not dots — bars read as a progress scale.
```
5 short bars: h-1 w-2 rounded-sm (compact list rows)
              h-1.5 w-3 rounded-sm (detail panels)
Filled:   bg-primary
Unfilled: bg-neutral-200 dark:bg-neutral-700
gap-1 between bars
```

### Deadline chip
Proximity-colored pill. No border — use filled tinted background only.
```
Overdue  (<0 days):  bg-red-50    dark:bg-red-950/30    text-red-500    + red dot prefix
Urgent   (<7 days):  bg-orange-50 dark:bg-orange-950/30 text-orange-500
Soon     (<14 days): bg-amber-50  dark:bg-amber-950/30  text-amber-500
Normal:              bg-neutral-100 dark:bg-neutral-800  text-neutral-500

rounded-md px-2 py-0.5 font-mono text-[10px] font-medium
```
No color for far-off deadlines — neutral grey only. Reserve color for urgency signals.

### Empty states
One sentence on what is missing + one action. No meta copy.
```
[Icon centered, size-6, text-neutral-300 dark:text-neutral-600]
[text-sm text-neutral-500 mt-3]
[primary action link or button, mt-3]
```

### Loading
`DeskLoader` for full-page and card-level loading. `animate-pulse` on skeleton inline elements. Never show a spinner inside a button — disable only the button.

### Toasts
`toast.add` for success and error. Copy in `content.ts`. Never `window.alert`.

### Tooltips
`relative group` on the trigger. Tooltip: `absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center`. Dark pill + caret arrow. No tooltip library.

---

## §8. Motion

Library: `motion/react`.

```
Entrance:         stagger + fadeUp  (landing only, with reduceMotion guard)
Tab transitions:  AnimatePresence mode="sync"
                  exit:  { opacity: 0, position: "absolute" }  ← no layout collapse
                  enter: opacity 0 → 1, duration 0.25s
Progress bar:     motion.div width "0%" → "100%", duration = intervalMs/1000, ease "linear"
```

**Rules:**
- `reduceMotion` guard on all entrance animations: `initial={reduceMotion ? false : "hidden"}`.
- `mode="wait"` collapses container height — always use `mode="sync"` for tab/panel switches.
- Never animate layout-affecting props (height, padding) during tab switches — use a fixed `min-h` wrapper.
- In-app desk: no entrance animations. Transitions only for state changes (tab, expand, toast).

---

## §9. Data Visualizations

- **Heatmap grids:** rows = day of week (labels on left: M, W, F only), columns = weeks (month labels on top). Cell date format must match the data source — never assume ISO format.
- **Stat tiles:** icon tile left, label + optional hint center, large bold value + mono unit right. Value is tabular-nums.
- **Progress indicators:** `bg-primary/opacity` scale. 4 steps: /30, /55, /80, full.
- Dataviz skill: load before any chart, graph, or dashboard panel.

---

## §10. ascii.rest

Canvas/scene pieces (scenes category) — sized with `style={{ width: <px> }}` only, never height. Use `as any` cast on the `piece` prop when passing a dynamic string.

Fill a panel with a scene:
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute inset-0 flex items-center justify-center scale-[1.6] origin-center">
    <Ascii piece="alpine-dawn" style={{ width: 520, margin: 0, opacity: 0.9 }} />
  </div>
</div>
```

Never use ascii.rest in footers or utility surfaces. Use it only for hero panels and feature section backgrounds.

---

## §11. Copy Standards

**Voice:** calm, direct, adult. Momentum over guilt.

```
❌  "Confirm these goals. Wiring to the API comes next."
✅  "Double-check the list. Finish when you're ready."

❌  "Coming soon", "Wiring...", "Stay tuned"
✅  State what is missing, offer one action

❌  "Score: 86.4 — Amazing! 🎉"
✅  "Score 86"
```

- Labels: UPPERCASE MONO for data headers and section markers. Sentence case for everything else.
- CTA copy lives in `content.ts` — never inline strings in components.
- Empty states: one sentence + one action. Nothing more.
- Error states: state what failed, offer one recovery action (Try again →).

---

## §12. New Page Checklist

Before shipping any new page or major component:

- [ ] Pick a layout pattern from §6 — document the choice
- [ ] Tokens only — no raw hex, no magic padding, no hardcoded font names
- [ ] Surface hierarchy correct — Tier 1 card on Tier 0 canvas, no ad-hoc backgrounds
- [ ] Card labels are inside the card with a `border-b` — not floating above it
- [ ] `bg-primary text-primary-foreground` on all filled primary buttons
- [ ] Dark mode verified for every color token
- [ ] `reduceMotion` guard on all entrance animations
- [ ] Empty, loading, and error states all handled — no dead stubs
- [ ] Copy in `content.ts`
- [ ] shadcn components first; custom only when shadcn can't do it
- [ ] No `window.alert` — use `toast.add`
- [ ] Type-check passes: `npx tsc --noEmit`
- [ ] Exercise the golden path in a browser before marking done
