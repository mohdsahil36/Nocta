# Nocta — Design Spec

This is the single source of truth for Nocta's visual design. Every UI change, new page, and new component must be grounded here. Read §1–4 before any UI work. Read the relevant surface section (§5–9) before touching that surface.

---

## §1. Design Philosophy

**Calm, direct, adult.** Nocta is a productivity tool, not an entertainment product. Every visual decision should communicate clarity and confidence — not delight for its own sake.

- Momentum over guilt. Empty states offer one action, not apology.
- No hype, no fake social proof, no WIP copy.
- Whitespace is intentional. Breathing room is not wasted space.
- The score decides. UI reflects outcomes, not vibes.

**Design vocabulary:** flat Blueprint desk in-app, editorial/crafted landing. They share the same token system — no visual forking between surfaces.

---

## §2. Token System

### Color

The **single primary** is green. It applies across all surfaces including the landing page — there is no black/white landing override.

```
Light mode (`:root`)
  --primary:            oklch(0.5568 0.1355 155.8120)   /* green */
  --primary-foreground: oklch(0.9213 0.0135 167.1556)
  --background:         #f8f8f6   (warm off-white, page bg)
  --foreground:         neutral-950

Dark mode (`.dark`)
  --primary:            oklch(0.5568 0.1355 155.8120)   /* same green */
  --primary-foreground: oklch(0.9213 0.0135 167.1556)
  --background:         neutral-950
  --foreground:         neutral-50
```

**Never** hardcode hex or rgb for brand colors. Use `bg-primary`, `text-primary`, `border-primary/20` etc.

**Surface hierarchy:**
```
Page bg:      bg-[#f8f8f6]  dark:bg-neutral-950
Cards:        bg-white       dark:bg-neutral-950   border border-neutral-200 dark:border-neutral-800
Dark cards:   bg-neutral-950 border border-neutral-800   (hero, section scenes, footer)
Muted areas:  bg-muted / bg-neutral-50 dark:bg-neutral-900
```

### Typography

```
--font-sans:    Outfit (CSS variable, NOT next/font .className)
--font-heading: Instrument Serif (landing hero/headings only)
--font-mono:    system monospace stack
```

- Body copy: `text-[15px] leading-7 text-neutral-500`
- Section headings: `font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-normal`
- Hero heading: `font-heading text-[clamp(2.8rem,7vw,4.5rem)] leading-[1.08] font-normal`
- Labels / caps: `font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500`
- Monospace UI text: `font-mono text-[11px]–text-[13px]`

### Spacing & Radius

```
Page max-width:    max-w-4xl (896px) with px-4 sm:px-6 gutters
Section gap:       gap-16 (64px) between major sections
Card radius:       rounded-2xl (outer), rounded-xl (inner cards), rounded-lg (buttons/inputs)
Inner padding:     px-8 py-8 sm:px-10  (cards)
                   px-4 py-3            (compact rows)
```

---

## §3. Component Patterns

### Buttons

```
Primary:   bg-primary text-primary-foreground hover:bg-primary/90
           rounded-lg h-10 px-6 font-mono text-xs font-semibold tracking-[0.06em] uppercase

Outline:   border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50
           dark: border-neutral-600 bg-neutral-800 text-neutral-100

Ghost/nav: font-mono text-[12px] text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50
```

**Never** use `text-white` directly on primary buttons — use `text-primary-foreground` so dark mode stays correct.

### Cards

All cards: `rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950`

Dark scene cards (hero, section right panels, footer): `rounded-2xl border border-neutral-800 bg-neutral-950`

### Illustration Cards (section tab demos)

Floating UI mockup cards inside dark scene panels:

```
Outer:  max-w-xs w-full rounded-xl border border-neutral-200 dark:border-neutral-700
        bg-white dark:bg-neutral-900 shadow-lg overflow-hidden

Header: border-b border-neutral-100 dark:border-neutral-800 px-5 py-4
Label:  font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 (ILLUS_LABEL)
Title:  text-sm font-semibold text-neutral-900 dark:text-neutral-50

Body:   p-5 space-y-3
Rows:   ILLUS_ROW = flex items-center justify-between py-1.5
```

### Badges / Pills

```
Primary pill:  bg-primary/10 border border-primary/20 text-primary   font-mono text-[11px] rounded-full px-2 py-0.5
Beta badge:    border border-primary/30 bg-primary/8 text-primary     font-mono text-[9px] uppercase tracking-[0.14em]
Status dot:    size-1.5 rounded-full bg-primary animate-pulse
```

### Toasts & Mutations

Success and error via `toast.add`. Copy in `content.ts`. Never `window.alert`.

### Loading

`DeskLoader` for full-page transitions. `animate-pulse` for inline skeleton states.

---

## §4. Motion & Animation

Library: `motion/react` (`AnimatePresence`, `motion.div`).

```
Page entrance:  stagger + fadeUp  (see app/login/ui/motion.ts)
Tab transitions: AnimatePresence mode="sync"
                 exit: { opacity: 0, position: "absolute" }   ← prevents layout collapse
                 enter: { opacity: 0 } → { opacity: 1 }
                 duration: 0.25s
Progress bars:  motion.div width "0%" → "100%", duration = intervalMs/1000, ease: "linear"
Hero animation: phase-based sequence (idle → time → energy → scoring → result → loop)
```

**Rules:**
- `mode="wait"` collapses container height between exit/enter — always use `mode="sync"` with `position: "absolute"` on exit for tab demos.
- Never animate layout-affecting props (height, padding) on tab switches — use a fixed `min-h` wrapper.
- `reduceMotion` guard on all entrance animations: `initial={reduceMotion ? false : "hidden"}`.

### ascii.rest

Canvas/scene pieces (scenes category): sized with `style={{ width: <px> }}` only, never height.
Text pieces (nature category): sized with width too.

Section panel backgrounds: `scale-[1.6] origin-center` wrapper inside `absolute inset-0 overflow-hidden` to fill panel height.

---

## §5. Landing Page (`app/login/`)

### Layout

```
LandingNav (sticky, z-50)
  └─ Logo | How it works / FAQ | Log in | Sign up

Page: bg-[#f8f8f6] dark:bg-neutral-950, max-w-4xl sections, gap-16

  Hero
  StatsCard
  #01 GoalsSection
  #02 CheckInSection
  #03 LogParserSection
  #04 RecoverySection
  FaqSection
  Close CTA
  LandingFooter
```

### Nav

- Sticky `h-12`, blurred bg.
- Sign up: `bg-primary text-primary-foreground` (green, not black).
- Log in: ghost button.
- Theme toggler in right group.

### Hero

- Dark card `bg-neutral-950 border-neutral-800`, `aurora-fjord` scene (canvas, `width: 900`).
- Browser chrome strip inside.
- `HeroCheckIn` animation floats on top: white frosted card `bg-white/93 backdrop-blur-md`.
- Quick links strip attached below as `rounded-b-2xl`.

### Feature Sections (§01–§04)

Two-panel layout: left = tabs + copy, right = dark scene panel with illustration card.

**Left panel:**
- Section number badge: `font-mono text-[10px] text-primary uppercase tracking-[0.18em]`
- Heading: `font-heading text-[clamp(1.5rem,3.5vw,2rem)] font-normal`
- Tab list: `font-mono text-[12px]`, active = `text-neutral-950 dark:text-neutral-50 font-semibold`
- Progress bar on active tab: 2px green bar fills from left → right over `intervalMs` (3500ms), auto-advances
- No left-border indicator — progress bar is the only active indicator

**Right panel:** `bg-neutral-950 overflow-hidden`

Scene assignments:
```
#01 Goal Scoring  → alpine-dawn
#02 Check-in      → kyoto-dusk
#03 Log Parser    → tokyo-rain
#04 Recovery      → desert-night
```

Scene rendering: `scale-[1.6] origin-center` to fill full panel height.

**Illustration cards:** one distinct `IllusCard` component per tab (4 per section = 16 total). Each animated with `AnimatePresence mode="sync"` inside a `min-h-[280px]` wrapper. All use `ILLUS_CARD`, `ILLUS_LABEL`, `ILLUS_ROW` shared style constants.

| Section | Tab illustrations |
|---|---|
| Goals | DeadlineIllus, NeglectIllus, MomentumIllus, NoAiIllus |
| Check-in | CITimeIllus, CIEnergyIllus, CIPickIllus, CISwapIllus |
| Log | LogTypeIllus, LogParseIllus, LogConfirmIllus, LogRestIllus |
| Recovery | RecRestIllus, RecMomentumIllus, RecBackIllus, RecGateIllus |

### Stats Card

`grid sm:grid-cols-4 grid-cols-2 w-full` — same width as hero card (`max-w-4xl`).

### Footer

Light/dark neutral card: `bg-white dark:bg-neutral-950`, `border-neutral-200 dark:border-neutral-800`.
- Top: brand (logo + beta pill + tagline + status dot) left, nav links right
- Divider: `border-neutral-100 dark:border-neutral-800`
- Bottom bar: copyright left, back-to-top right
- Wordmark: `font-black tracking-[-0.04em] text-neutral-950/[0.05] dark:text-neutral-50/[0.04]` — large, ghost, anchors the card

No ASCII art in the footer.

---

## §6. Dashboard (`app/dashboard/`)

**In-app Blueprint desk.** Flat, functional, no landing craft.

- `MacWindow` chrome: `elevation="flat"` `tone="paper"`
- Sidebar footer: account menu, theme toggler, logout only
- Theme: `themeStore` (not `next-themes`)
- Navigation: `useRouter` / `<Link>`, never `window.location`
- Loading: `DeskLoader`
- Empty states: say what is missing + one action button

---

## §7. Forms & Inputs

- shadcn `Input`, `Select`, `Textarea` — token classes only
- Zod validation on every Express input; Pydantic on every nocta-ai endpoint
- Inline error below the field, `text-destructive text-[12px]`
- Submit buttons show spinner (not disabled text) while busy
- Never disable the whole form — disable only the submit button

---

## §8. Copy Standards

**Voice:** calm, direct, adult. Momentum over guilt.

```
❌  "Confirm these goals. Wiring to the API comes next — for now this stays local."
✅  "Double-check the list. Finish when you're ready."

❌  "Coming soon", "Wiring...", "Stay tuned"
✅  Say what is missing, offer one action

❌  "Score: 86.4 — Amazing! 🎉"
✅  "Score 86"
```

- Empty states: one sentence on what's missing + one CTA label
- Labels: sentence case in UI, UPPERCASE MONO for section headers and data labels
- CTA copy lives in `content.ts` — never inline strings in components

---

## §9. New Surface Checklist

Before shipping any new page or major component:

- [ ] Read DESIGN.md §1–4 and the matching surface section
- [ ] Tokens only — no raw hex, no magic padding, no hardcoded font names
- [ ] `bg-primary text-primary-foreground` on all filled primary buttons
- [ ] Dark mode verified: every text color has a `dark:` variant where needed
- [ ] `reduceMotion` guard on all entrance animations
- [ ] Empty, loading, error states handled — no dead stubs
- [ ] Copy in `content.ts`
- [ ] shadcn components first, custom only when shadcn can't do it
- [ ] No `window.alert` — use `toast.add`
- [ ] Exercise the golden path in a browser before calling it done
