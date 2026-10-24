"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Check,
  CornerDownLeft,
  MoonStar,
  Target,
  Zap,
  BarChart3,
  Clock,
  Activity,
  FileText,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { Ascii } from "ascii.rest/react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { PanelToast } from "@/components/ui/toast";
import { loginContent, type Energy, type Minutes } from "../content";
import { easeOut } from "./motion";
import { PanelLabel, AreaTag } from "./section";
import { useDemoLoop } from "./use-demo-loop";

/* ─── shared primitives ─────────────────────────────────────────── */

const SURFACE =
  "rounded-sm border border-neutral-200 bg-white shadow-none dark:border-neutral-800 dark:bg-neutral-950";

function LiveTitle({
  text,
  size = "section",
}: {
  text: string;
  size?: "section" | "card" | "line";
}) {
  const sizeClass =
    size === "section"
      ? "min-h-[2.6em] sm:min-h-[2.4em] [&_>div>div]:text-3xl sm:[&_>div>div]:text-4xl [&_>div>div]:leading-[1.15] [&_>div>div]:tracking-[-0.03em]"
      : size === "card"
        ? "min-h-[2.4em] [&_>div>div]:text-2xl [&_>div>div]:leading-snug [&_>div>div]:tracking-[-0.02em]"
        : "min-h-[1.4em] [&_>div>div]:text-sm [&_>div>div]:leading-snug";
  return (
    <TextGenerateEffect
      key={text}
      words={text}
      duration={0.38}
      className={["mt-0! [&_>div]:mt-0!", sizeClass].join(" ")}
      wordClassName="font-sans font-semibold text-foreground dark:text-foreground"
    />
  );
}

function useSwap() {
  const reduceMotion = useReducedMotion();
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? undefined : { opacity: 0, y: -6 },
    transition: { duration: 0.35, ease: easeOut },
  } as const;
}

function usePrefersMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/* ─── autosend-style section card ──────────────────────────────── */

type FeatureItem = {
  icon: React.ElementType;
  label: string;
  body: string;
};

const ASCII_ART: Record<string, string> = {
  scoring: `
  ┌──────────────────────────┐
  │  GOAL RANK               │
  │  ████████████░░  86 ★   │
  │  ██████░░░░░░░░  64     │
  │  █████░░░░░░░░░  58     │
  │  ███░░░░░░░░░░░  41     │
  │                          │
  │  deadline · neglect      │
  │  weight   · momentum     │
  └──────────────────────────┘`,

  deadline: `
  Jan ──────────────────────
       goal A  ████████▓ DUE
       goal B  ████░░░░░
       goal C  ██░░░░░░░
  Feb
       goal D  ░░░░░░░░░
  ──────────────────────────
  closer deadline → higher`,

  neglect: `
  last touch ←─────── now
  ·····················●
  7d  ████████████  +40
  3d  ████████░░░░  +25
  1d  ████░░░░░░░░  +12
  0d  ░░░░░░░░░░░░   +0
  ──────────────────────
  neglect adds urgency`,

  momentum: `
  streak     ▁▂▃▅▆▇█ +mo
  ───────────────────────
  week 1  ░░░░░░░  base
  week 2  ████░░░  +8
  week 3  ███████  +15
  week 4  ███████  +22
  ───────────────────────
  consistency compounds`,

  no_ai: `
  scorer.ts
  ──────────────────────
  function rank(goals) {
    return goals
      .map(score)   // TS
      .sort(desc);  // TS
  }
  ──────────────────────
  ✗ no LLM call
  ✗ no randomness
  ✓ deterministic`,

  checkin: `
        ╭─────────────╮
       │  ◷ CHECK-IN  │
       │              │
       │  20m  45m  90m│
       │  ○    ●    ○  │
       │              │
       │  LOW  STD  HI │
       │  □    ■    □  │
       ╰──────────────╯`,

  log: `
  $ nocta log
  > ran 30min, felt steady
  ──────────────────────────
  goal:     Morning run
  time:     30 min
  energy:   Steady
  progress: felt steady
  ──────────────────────────
  [confirm] [edit]`,

  recovery: `
        .  *  .   .  *
     *   .   .  *    .
    .  *   ╭───╮   .  *
      .    │ ☽ │     .
        *  ╰───╯  *
     .    .   .    .
  ─────────────────────
  momentum  ██████░░░`,
};

type SectionCardProps = {
  id?: string;
  num: string;
  category: string;
  heading: string;
  features: FeatureItem[];
  activeIndex: number;
  onSelect: (i: number) => void;
  learnMoreLabel?: string;
  learnMoreHref?: string;
  asciiKey?: keyof typeof ASCII_ART;
  /** Per-tab ASCII art keys — overrides asciiKey when provided */
  asciiKeys?: (keyof typeof ASCII_ART)[];
  /** ascii.rest scene piece name to use as the right panel background */
  scenePiece?: string;
  /** Pass `running` from useDemoLoop to drive the progress bar */
  running?: boolean;
  /** Pass `intervalMs` from useDemoLoop to set progress bar duration */
  intervalMs?: number;
  children: React.ReactNode;
};

function SectionCard({
  id,
  num,
  category,
  heading,
  features,
  activeIndex,
  onSelect,
  learnMoreLabel,
  learnMoreHref = "#how-it-works",
  asciiKey,
  asciiKeys,
  scenePiece,
  running = false,
  intervalMs = 3000,
  children,
}: SectionCardProps) {
  const resolvedAsciiKey = asciiKeys ? asciiKeys[activeIndex] : asciiKey;
  return (
    <div
      id={id}
      className="mx-auto max-w-4xl px-4 sm:px-6 scroll-mt-20"
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="px-8 pt-8 pb-0 sm:px-10 sm:pt-10">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
            <span className="text-primary">{num}</span>
            <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">—</span>
            <span className="text-neutral-500 dark:text-neutral-400">{category}</span>
          </p>
          <h2 className="mt-3 font-heading text-[clamp(1.6rem,3.5vw,2.4rem)] leading-[1.1] font-normal text-neutral-950 dark:text-neutral-50">
            {heading}
          </h2>
        </div>

        {/* 2-col body */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
          {/* Left: feature list */}
          <div className="border-b border-neutral-100 dark:border-neutral-800 lg:border-b-0 lg:border-r">
            {features.map((f, i) => {
              const Icon = f.icon;
              const active = i === activeIndex;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => onSelect(i)}
                  className={[
                    "relative w-full text-left flex items-start gap-4 px-8 py-5 sm:px-10 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 transition-colors duration-150 cursor-pointer outline-none overflow-hidden",
                    active
                      ? "bg-neutral-50 dark:bg-neutral-900/60"
                      : "hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30",
                  ].join(" ")}
                >
                  {/* Progress bar — only on active tab while running */}
                  {active && running && (
                    <motion.div
                      key={`progress-${activeIndex}`}
                      className="absolute bottom-0 left-0 h-[2px] bg-primary origin-left"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: intervalMs / 1000, ease: "linear" }}
                    />
                  )}
                  <Icon
                    className={[
                      "mt-0.5 size-4 shrink-0 transition-colors",
                      active ? "text-primary" : "text-neutral-400",
                    ].join(" ")}
                  />
                  <div className="min-w-0">
                    <p className={[
                      "font-mono text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors",
                      active ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-500",
                    ].join(" ")}>
                      {f.label}
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
                      {f.body}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: demo panel — scene bg or dot grid */}
          <div
            className={[
              "relative flex items-center justify-center p-6 sm:p-8 min-h-64 overflow-hidden",
              scenePiece ? "bg-neutral-950" : "",
            ].join(" ")}
            style={scenePiece ? undefined : {
              backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              backgroundColor: 'rgb(250 250 249)',
            }}
          >
            {/* Scene background — scale to cover full panel */}
            {scenePiece && (
              <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center scale-[1.6] origin-center">
                  <Ascii piece={scenePiece as any} style={{ width: 520, margin: 0, opacity: 0.9 }} />
                </div>
              </div>
            )}
            <AnimatePresence mode="wait">
              {!scenePiece && resolvedAsciiKey && ASCII_ART[resolvedAsciiKey] && (
                <motion.pre
                  key={resolvedAsciiKey}
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.18 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pointer-events-none select-none absolute inset-0 flex items-center justify-center font-mono text-[10px] leading-[1.5] text-neutral-950 overflow-hidden whitespace-pre"
                >
                  {ASCII_ART[resolvedAsciiKey]}
                </motion.pre>
              )}
            </AnimatePresence>
            <div className="relative z-10 w-full flex items-center justify-center">
              {children}
            </div>
          </div>
        </div>

        {/* Footer link */}
        {learnMoreLabel && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 px-8 py-4 sm:px-10">
            <a
              href={learnMoreHref}
              className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-primary hover:underline"
            >
              {learnMoreLabel} →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Stats card ─────────────────────────────────────────────────── */

export function StatsCard() {
  const STATS = [
    { value: "2 min", label: "Avg check-in time", accent: "Time" },
    { value: "100%", label: "Deterministic rank", accent: "Score" },
    { value: "1", label: "Action per session", accent: "Focus" },
    { value: "0×", label: "AI picks the goal", accent: "Control" },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 w-full">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 w-full">
        <div className="grid sm:grid-cols-4 grid-cols-2 divide-x divide-y sm:divide-y-0 divide-neutral-100 dark:divide-neutral-800">
          {STATS.map(({ value, label, accent }) => (
            <div key={label} className="flex flex-col items-start px-7 pt-6 pb-5 gap-0 group min-w-0">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                {accent}
              </span>
              <span className="font-heading text-[2.4rem] leading-none font-normal text-neutral-950 dark:text-neutral-50 tracking-tight tabular-nums">
                {value}
              </span>
              <span className="mt-2 font-mono text-[11px] text-neutral-400 uppercase tracking-wider leading-4">
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-8 py-3 flex items-center justify-between">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Built for builders who study and ship
          </p>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">Live</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── 01 — Goal Scoring ─────────────────────────────────────────── */

const SCORING_FEATURES: FeatureItem[] = [
  { icon: BarChart3, label: "Deadline weight", body: "Goals closer to their deadline score higher — automatically, every check-in." },
  { icon: Clock, label: "Neglect factor", body: "The longer since you last touched a goal, the more its score rises." },
  { icon: TrendingUp, label: "Momentum", body: "Consistent effort on a goal builds momentum and keeps it competitive." },
  { icon: Zap, label: "AI never ranks", body: "The scorer is pure TypeScript. No LLM decides priority — ever." },
];

const ILLUS_CARD = "w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950";
const ILLUS_LABEL = "font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400";
const ILLUS_ROW = "flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 px-5 py-3";

function DeadlineIllus() {
  const goals = [
    { name: "Ship scoring PR", days: 2, pct: 90 },
    { name: "Update portfolio", days: 8, pct: 55 },
    { name: "Read systems book", days: 14, pct: 30 },
    { name: "Call home Sunday", days: 21, pct: 12 },
  ];
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Deadline weight</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Closer deadline → higher score</p>
      </div>
      <ul>
        {goals.map((g) => (
          <li key={g.name} className={ILLUS_ROW}>
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[12px] text-neutral-700 dark:text-neutral-300 truncate">{g.name}</p>
              <div className="mt-1.5 h-1 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${g.pct}%` }} />
              </div>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-neutral-400">{g.days}d</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NeglectIllus() {
  const goals = [
    { name: "Ship scoring PR", last: "7d ago", bonus: "+40", hot: true },
    { name: "Update portfolio", last: "3d ago", bonus: "+25", hot: false },
    { name: "Read systems book", last: "1d ago", bonus: "+12", hot: false },
    { name: "Call home Sunday", last: "today", bonus: "+0", hot: false },
  ];
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Neglect factor</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Longer gap → urgency rises</p>
      </div>
      <ul>
        {goals.map((g) => (
          <li key={g.name} className={ILLUS_ROW}>
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className={["size-2 rounded-full shrink-0", g.hot ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-700"].join(" ")} />
              <span className="text-[12px] text-neutral-700 dark:text-neutral-300 truncate">{g.name}</span>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-mono text-[11px] text-neutral-400">{g.last}</span>
              <span className={["ml-2 font-mono text-[11px]", g.hot ? "text-primary font-semibold" : "text-neutral-400"].join(" ")}>{g.bonus}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MomentumIllus() {
  const weeks = [
    { label: "W1", bars: [1, 0, 1, 0, 1, 0, 0] },
    { label: "W2", bars: [1, 1, 0, 1, 1, 0, 1] },
    { label: "W3", bars: [1, 1, 1, 1, 0, 1, 1] },
    { label: "W4", bars: [1, 1, 1, 1, 1, 1, 1] },
  ];
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Momentum</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Consistency compounds over time</p>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {weeks.map((w) => (
          <div key={w.label} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-neutral-400 w-5 shrink-0">{w.label}</span>
            <div className="flex gap-1 flex-1">
              {w.bars.map((on, i) => (
                <div key={i} className={["flex-1 h-4 rounded-sm transition-colors", on ? "bg-primary/70" : "bg-neutral-100 dark:bg-neutral-800"].join(" ")} />
              ))}
            </div>
            <span className="font-mono text-[10px] text-primary w-7 text-right">{w.bars.filter(Boolean).length}/7</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoAiIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>AI never ranks</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Pure TypeScript. Zero LLM calls.</p>
      </div>
      <div className="px-5 py-4 font-mono text-[11px] leading-6 text-neutral-500 dark:text-neutral-400">
        <p><span className="text-primary">function</span> rank(goals) {"{"}</p>
        <p className="pl-4"><span className="text-neutral-300 dark:text-neutral-600">// score each goal</span></p>
        <p className="pl-4"><span className="text-primary">return</span> goals</p>
        <p className="pl-8">.map(computeScore)</p>
        <p className="pl-8">.sort(byDescending);</p>
        <p>{"}"}</p>
      </div>
      <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 py-3 flex gap-4">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400"><span className="text-red-400">✕</span> no LLM</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400"><span className="text-red-400">✕</span> no random</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-primary"><span>✓</span> deterministic</span>
      </div>
    </div>
  );
}

const SCORING_ILLUS = [DeadlineIllus, NeglectIllus, MomentumIllus, NoAiIllus];

function ScoringDemo({ activeIndex }: { activeIndex: number }) {
  const Illus = SCORING_ILLUS[activeIndex] ?? SCORING_ILLUS[0];
  return (
    <div className="relative w-full flex justify-center min-h-[280px] items-center">
      <AnimatePresence mode="sync">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, position: "absolute" } as any}
          transition={{ duration: 0.25 }}
          className="w-full flex justify-center"
        >
          <Illus />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function GoalsSection() {
  const { index, select, running, intervalMs } = useDemoLoop(SCORING_FEATURES.length, 3500);
  return (
    <SectionCard
      id="how-it-works"
      num="#01"
      category="Goal Scoring"
      heading="Your goals, ranked by what matters most."
      features={SCORING_FEATURES}
      activeIndex={index}
      onSelect={select}
      running={running}
      intervalMs={intervalMs}
      learnMoreLabel="All about goal scoring"
      asciiKeys={["deadline", "neglect", "momentum", "no_ai"]}
      scenePiece="alpine-dawn"
    >
      <ScoringDemo activeIndex={index} />
    </SectionCard>
  );
}

/* ─── 02 — Check-in ─────────────────────────────────────────────── */

const ENERGY_ICON = {
  low: BatteryLow,
  steady: BatteryMedium,
  high: BatteryFull,
};

const CHECKIN_FEATURES: FeatureItem[] = [
  { icon: Clock, label: "Minutes available", body: "Tell Nocta how much time you have — 20, 45, or 90 minutes." },
  { icon: Activity, label: "Energy level", body: "Low, steady, or high. Your energy shapes how the step is sized." },
  { icon: Target, label: "One pick", body: "The top-scored goal becomes a concrete next step sized to your session." },
  { icon: ArrowRight, label: "Swap if needed", body: "Reject the top pick and the next scored goal surfaces instantly." },
];

function stepSize(minutes: Minutes, energy: Energy) {
  if (energy === "low" && minutes === 20) return "rest";
  const tier = minutes === 20 ? 0 : minutes === 45 ? 1 : 2;
  const adjusted = energy === "low" ? tier - 1 : tier;
  return (["small", "medium", "large"] as const)[Math.max(0, adjusted)];
}

function CheckInDemo() {
  const d = loginContent.demo;
  const c = loginContent.checkIn;
  const STEPS: { minutes: Minutes; energy: Energy }[] = [
    { minutes: 45, energy: "steady" },
    { minutes: 90, energy: "high" },
    { minutes: 20, energy: "low" },
    { minutes: 45, energy: "high" },
  ];
  const { index, select } = useDemoLoop(STEPS.length, 2800);
  const [manual, setManual] = useState<{ minutes: Minutes; energy: Energy } | null>(null);
  const step = STEPS[index % STEPS.length];
  const minutes = manual?.minutes ?? step.minutes;
  const energy = manual?.energy ?? step.energy;
  const size = stepSize(minutes, energy);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950">
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-3">
        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">Check-in</p>
      </div>
      <div className="p-5 space-y-4">
        {/* Time */}
        <div>
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">{d.timeLabel}</p>
          <div className="grid grid-cols-3 gap-2">
            {d.minutes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { select(index); setManual({ minutes: m, energy }); }}
                className={["rounded-lg border py-2 font-mono text-[12px] font-medium transition-colors cursor-pointer", m === minutes ? "border-primary bg-primary/10 text-primary" : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300"].join(" ")}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
        {/* Energy */}
        <div>
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">{d.energyLabel}</p>
          <div className="grid grid-cols-3 gap-2">
            {d.energy.map((e) => {
              const Icon = ENERGY_ICON[e.id];
              const on = e.id === energy;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => { select(index); setManual({ minutes, energy: e.id }); }}
                  className={["flex flex-col items-center gap-1 rounded-lg border py-3 font-mono text-[11px] transition-colors cursor-pointer", on ? "border-primary bg-primary/10 text-primary" : "border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-neutral-300"].join(" ")}
                >
                  <Icon className="size-4" />
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Result */}
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">Next step</p>
          <div className="mt-1">
            <LiveTitle text={c.sizes[size]} size="line" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CheckIn per-tab illustrations ── */
function CITimeIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Minutes available</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">How long do you have?</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-2">
          {([20, 45, 90] as const).map((m) => (
            <div key={m} className={["rounded-lg border py-3 text-center font-mono text-[13px] font-medium", m === 45 ? "border-primary bg-primary/10 text-primary" : "border-neutral-200 dark:border-neutral-700 text-neutral-400"].join(" ")}>
              {m}m
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <p className={ILLUS_LABEL + " mb-1"}>Step size</p>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Medium step: one focused block</p>
        </div>
      </div>
    </div>
  );
}

function CIEnergyIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Energy level</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">How are you feeling?</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(["Low", "Steady", "High"] as const).map((e) => (
            <div key={e} className={["rounded-lg border py-3 text-center font-mono text-[12px] font-medium", e === "High" ? "border-primary bg-primary/10 text-primary" : "border-neutral-200 dark:border-neutral-700 text-neutral-400"].join(" ")}>
              {e}
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <p className={ILLUS_LABEL + " mb-1"}>Adjusted step</p>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Large step: full session block</p>
        </div>
      </div>
    </div>
  );
}

function CIPickIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>One pick</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Top-scored goal surfaces</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Tonight's action</span>
          <span className="font-mono text-[11px] font-semibold text-primary">Score 86</span>
        </div>
        <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">Ship the scoring PR</p>
        <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div className="h-full w-[86%] rounded-full bg-primary/70" />
        </div>
        <div className="flex gap-2 text-[11px] font-mono text-neutral-400">
          <span>45 min</span><span>·</span><span>Steady</span><span>·</span><span className="text-primary">deterministic</span>
        </div>
      </div>
    </div>
  );
}

function CISwapIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Swap if needed</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Reject → next goal surfaces</p>
      </div>
      <ul>
        <li className={ILLUS_ROW + " opacity-50"}>
          <span className="text-[12px] line-through text-neutral-400">Ship the scoring PR</span>
          <span className="font-mono text-[10px] text-neutral-300">rejected</span>
        </li>
        <li className={ILLUS_ROW + " bg-primary/5"}>
          <span className="text-[12px] font-medium text-neutral-800 dark:text-neutral-200">Update portfolio case study</span>
          <span className="font-mono text-[11px] text-primary font-semibold">64</span>
        </li>
        <li className={ILLUS_ROW}>
          <span className="text-[12px] text-neutral-400">Finish the systems book</span>
          <span className="font-mono text-[11px] text-neutral-400">58</span>
        </li>
      </ul>
    </div>
  );
}

const CHECKIN_ILLUS = [CITimeIllus, CIEnergyIllus, CIPickIllus, CISwapIllus];

function CheckInTabDemo({ activeIndex }: { activeIndex: number }) {
  const Illus = CHECKIN_ILLUS[activeIndex] ?? CHECKIN_ILLUS[0];
  return (
    <div className="relative w-full flex justify-center min-h-[280px] items-center">
      <AnimatePresence mode="sync">
        <motion.div key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, position: "absolute" } as any} transition={{ duration: 0.25 }} className="w-full flex justify-center">
          <Illus />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function CheckInSection({ rail = false }: { rail?: boolean }) {
  const c = loginContent.checkIn;
  const { index, select, running, intervalMs } = useDemoLoop(CHECKIN_FEATURES.length, 3500);

  if (rail) {
    return (
      <div className="flex flex-col gap-4">
        <CheckInDemo />
      </div>
    );
  }

  return (
    <SectionCard
      num="#02"
      category="Check-in"
      heading="Time and energy first. Always."
      features={CHECKIN_FEATURES}
      activeIndex={index}
      onSelect={select}
      running={running}
      intervalMs={intervalMs}
      learnMoreLabel="All about the check-in"
      asciiKey="checkin"
      scenePiece="kyoto-dusk"
    >
      <CheckInTabDemo activeIndex={index} />
    </SectionCard>
  );
}

/* ─── 03 — Log your session ─────────────────────────────────────── */

const LOG_FEATURES: FeatureItem[] = [
  { icon: FileText, label: "Log a line", body: "Type what you did in plain English. No forms, no dropdowns." },
  { icon: Zap, label: "AI parses it", body: "Nocta extracts the goal, time spent, energy, and progress from your note." },
  { icon: Check, label: "Confirm and save", body: "Review the parsed fields and confirm. You're in control of the log." },
  { icon: MoonStar, label: "Rest counts too", body: "Mark recovery nights. Momentum stays honest — rest doesn't break the streak." },
];

type Parsed = { goal: string | null; time: string | null; energy: string | null; progress: string | null };

const GOAL_KEYWORDS: [RegExp, string][] = [
  [/\b(test|tests|pr|review|scoring)\b/i, "Ship the scoring PR"],
  [/\b(portfolio|case study)\b/i, "Update portfolio case study"],
  [/\b(run|ran|jog|gym)\b/i, "Run three times a week"],
  [/\b(read|chapter|book)\b/i, "Finish the systems book"],
  [/\b(call|called|home|mom|dad)\b/i, "Call home on Sundays"],
];

function parseLog(line: string): Parsed {
  const goal = GOAL_KEYWORDS.find(([re]) => re.test(line))?.[1] ?? null;
  const mins = line.match(/(\d+)\s*(m|min|mins|minutes)\b/i);
  const hours = line.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?)\b/i);
  const time = mins ? `${mins[1]} min` : hours ? `${hours[1]} h` : null;
  const energy = /\b(tired|exhausted|drained|sleepy|low)\b/i.test(line) ? "Low"
    : /\b(great|energi[sz]ed|sharp|high)\b/i.test(line) ? "High"
    : /\b(ok|okay|fine|steady|normal)\b/i.test(line) ? "Steady" : null;
  const clause = line.split(/[,.;]/).map((s) => s.trim()).filter(Boolean).at(-1);
  const progress = clause && clause.length > 3 ? clause.charAt(0).toUpperCase() + clause.slice(1) : null;
  return { goal, time, energy, progress };
}

function LogDemo() {
  const c = loginContent.logParser;
  const prefersMotion = usePrefersMotion();
  const full = c.input;
  const [line, setLine] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [saved, setSaved] = useState(false);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (!prefersMotion) return;
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((res) => { timers.push(window.setTimeout(res, ms)); });
    const run = async () => {
      setLine(""); setParsed(null); setSaved(false);
      await wait(600);
      for (let i = 1; i <= full.length; i++) {
        if (cancelled) return;
        setLine(full.slice(0, i));
        await wait(24);
      }
      await wait(500);
      if (cancelled) return;
      setParsed(parseLog(full));
      await wait(1800);
      if (cancelled) return;
      setSaved(true);
      await wait(1600);
      if (cancelled) return;
      setLine(""); setParsed(null); setSaved(false);
      setLoop((n) => n + 1);
    };
    void run();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [full, prefersMotion, loop]);

  const fields: [keyof Parsed, string][] = [["goal", "Goal"], ["time", "Time"], ["energy", "Energy"], ["progress", "Progress"]];
  const displayParsed = prefersMotion ? parsed : parseLog(full);
  const displayLine = prefersMotion ? line : full;
  const displaySaved = prefersMotion ? saved : true;

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-2 p-3 border-b border-neutral-100 dark:border-neutral-800">
          <input
            value={displayLine}
            onChange={(e) => { setLine(e.target.value); setParsed(null); setSaved(false); }}
            placeholder={c.placeholder}
            className="flex-1 bg-transparent font-mono text-[13px] text-neutral-700 dark:text-neutral-300 outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={() => { if (displayLine.trim()) setParsed(parseLog(displayLine)); }}
            className="rounded-lg bg-primary px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Parse
          </button>
        </div>
        {displayParsed ? (
          <div className="grid grid-cols-2 gap-2 p-3">
            {fields.map(([key, label]) => (
              <div key={key} className={["rounded-lg border px-3 py-2", displayParsed[key] ? "border-primary/20 bg-primary/5" : "border-dashed border-neutral-200 dark:border-neutral-700"].join(" ")}>
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{label}</p>
                <p className={["text-[13px] font-medium truncate mt-0.5", displayParsed[key] ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-300"].join(" ")}>
                  {displayParsed[key] ?? "—"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 border-b border-neutral-100 dark:border-neutral-800">
            <p className="font-mono text-[12px] text-neutral-400">Type what you did and hit Parse</p>
          </div>
        )}
        {displayParsed && (
          <div className="flex justify-end px-3 pb-3">
            {displaySaved ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] font-medium text-primary">
                <Check className="size-3" /> Saved
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="rounded-lg bg-primary px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Looks right →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function LogParserSection({ rail = false }: { rail?: boolean }) {
  const { index, select, running, intervalMs } = useDemoLoop(LOG_FEATURES.length, 3500);
  if (rail) return <LogDemo />;
  return (
    <SectionCard
      num="#03"
      category="Log your session"
      heading="Close the loop — or rest."
      features={LOG_FEATURES}
      activeIndex={index}
      onSelect={select}
      running={running}
      intervalMs={intervalMs}
      learnMoreLabel="All about logging"
      asciiKey="log"
      scenePiece="tokyo-rain"
    >
      <LogTabDemo activeIndex={index} />
    </SectionCard>
  );
}

/* ── Log per-tab illustrations ── */
function LogTypeIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Log a line</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Plain English. No forms.</p>
      </div>
      <div className="p-5">
        <div className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 font-mono text-[12px] text-neutral-700 dark:text-neutral-300">
          ran 30min, felt steady, finished tests
          <span className="ml-0.5 inline-block w-0.5 h-3.5 bg-primary align-middle animate-pulse" />
        </div>
        <p className="mt-3 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">↓ parsing in progress</p>
      </div>
    </div>
  );
}

function LogParseIllus() {
  const fields = [
    { label: "Goal", value: "Morning run" },
    { label: "Time", value: "30 min" },
    { label: "Energy", value: "Steady" },
    { label: "Progress", value: "Finished tests" },
  ];
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>AI parses it</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Fields extracted automatically</p>
      </div>
      <ul>
        {fields.map((f) => (
          <li key={f.label} className={ILLUS_ROW}>
            <span className="font-mono text-[10px] text-neutral-400 uppercase w-20 shrink-0">{f.label}</span>
            <span className="text-[12px] font-medium text-neutral-800 dark:text-neutral-200 flex-1">{f.value}</span>
            <Check className="size-3.5 text-primary" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LogConfirmIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Confirm and save</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">You stay in control</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-[12px]"><span className="text-neutral-400 font-mono">Goal</span><span className="text-neutral-700 dark:text-neutral-300">Morning run</span></div>
          <div className="flex justify-between text-[12px]"><span className="text-neutral-400 font-mono">Time</span><span className="text-neutral-700 dark:text-neutral-300">30 min</span></div>
          <div className="flex justify-between text-[12px]"><span className="text-neutral-400 font-mono">Energy</span><span className="text-neutral-700 dark:text-neutral-300">Steady</span></div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 py-2 text-center font-mono text-[11px] text-neutral-400">Edit</div>
          <div className="flex-1 rounded-lg bg-primary py-2 text-center font-mono text-[11px] font-semibold text-white">Save →</div>
        </div>
      </div>
    </div>
  );
}

function LogRestIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Rest counts too</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Recovery night logged</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <MoonStar className="size-5 text-neutral-500 shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">Rest night marked</p>
            <p className="text-[11px] text-neutral-400">Momentum stays intact</p>
          </div>
        </div>
        <div>
          <p className={ILLUS_LABEL + " mb-2"}>Momentum</p>
          <div className="flex gap-1">
            {[1,1,1,0,1,1,1].map((on, i) => (
              <div key={i} className={["flex-1 h-3 rounded-sm", on ? "bg-primary/60" : "bg-neutral-200 dark:bg-neutral-700"].join(" ")} />
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-primary">streak intact ✓</p>
        </div>
      </div>
    </div>
  );
}

const LOG_ILLUS = [LogTypeIllus, LogParseIllus, LogConfirmIllus, LogRestIllus];

function LogTabDemo({ activeIndex }: { activeIndex: number }) {
  const Illus = LOG_ILLUS[activeIndex] ?? LOG_ILLUS[0];
  return (
    <div className="relative w-full flex justify-center min-h-[280px] items-center">
      <AnimatePresence mode="sync">
        <motion.div key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, position: "absolute" } as any} transition={{ duration: 0.25 }} className="w-full flex justify-center">
          <Illus />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Recovery section ──────────────────────────────────────────── */

const RECOVERY_FEATURES: FeatureItem[] = [
  { icon: MoonStar, label: "Rest nights", body: "Mark a recovery night instead of forcing an action when you're drained." },
  { icon: TrendingUp, label: "Momentum holds", body: "Rest doesn't break your streak. Momentum stays honest across sessions." },
  { icon: RotateCcw, label: "Back on track", body: "The next check-in, Nocta picks up where you left off. No guilt." },
  { icon: Activity, label: "Recovery gate", body: "After several rest nights, Nocta nudges you to re-engage — gently." },
];

export function RecoverySection({ rail = false }: { rail?: boolean }) {
  const c = loginContent.recovery;
  const scenes = c.scenes;
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx];
  const swap = useSwap();
  const reduceMotion = useReducedMotion();
  const segments = 7;
  const { index, select, running, intervalMs } = useDemoLoop(RECOVERY_FEATURES.length, 3500);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % scenes.length), 2800);
    return () => window.clearInterval(id);
  }, [reduceMotion, scenes.length]);

  const Demo = (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-6 py-6 text-center">
      <div className="relative min-h-48">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div key={scene.id} {...swap} className="absolute inset-x-0 top-0">
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{scene.label}</p>
            <span className="mx-auto mt-4 flex size-12 items-center justify-center border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              {scene.kind === "rest" ? (
                <MoonStar className="size-5 text-neutral-700 dark:text-neutral-300" />
              ) : (
                <Check className="size-5 text-primary" />
              )}
            </span>
            <p className="mt-3 text-sm font-semibold text-neutral-950 dark:text-neutral-50">
              {scene.title}
            </p>
            <p className="mx-auto mt-2 max-w-[200px] text-[12px] leading-5 text-neutral-500">
              {scene.body}
            </p>
            <div className="mx-auto mt-4 flex h-1.5 w-40 items-center gap-0.5">
              {Array.from({ length: segments }, (_, i) => (
                <span
                  key={i}
                  className={["h-full flex-1 rounded-full transition-colors duration-300", i < scene.momentumLevel ? "bg-primary/70" : "bg-neutral-200 dark:bg-neutral-700"].join(" ")}
                />
              ))}
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{scene.momentumLabel}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  if (rail) return Demo;

  return (
    <SectionCard
      num="#04"
      category="Recovery"
      heading="Rest honestly. Come back stronger."
      features={RECOVERY_FEATURES}
      activeIndex={index}
      onSelect={select}
      running={running}
      intervalMs={intervalMs}
      learnMoreLabel="All about recovery"
      asciiKey="recovery"
      scenePiece="desert-night"
    >
      <RecoveryTabDemo activeIndex={index} />
    </SectionCard>
  );
}

/* ── Recovery per-tab illustrations ── */
function RecRestIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Rest nights</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Mark recovery instead of forcing it</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 py-3 text-center">
          <MoonStar className="mx-auto size-6 text-neutral-500 mb-1" />
          <p className="font-mono text-[11px] text-neutral-500">Rest tonight</p>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/20 py-3 text-center">
          <Check className="mx-auto size-5 text-primary mb-1" />
          <p className="font-mono text-[11px] text-primary">Rest night logged ✓</p>
        </div>
      </div>
    </div>
  );
}

function RecMomentumIllus() {
  const days = [
    { label: "Mon", kind: "action" },
    { label: "Tue", kind: "action" },
    { label: "Wed", kind: "rest" },
    { label: "Thu", kind: "action" },
    { label: "Fri", kind: "rest" },
    { label: "Sat", kind: "action" },
    { label: "Sun", kind: "action" },
  ];
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Momentum holds</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Rest doesn't reset the streak</p>
      </div>
      <div className="p-5">
        <div className="flex gap-1.5">
          {days.map((d) => (
            <div key={d.label} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={["h-8 w-full rounded-md flex items-center justify-center", d.kind === "action" ? "bg-primary/70" : "bg-neutral-100 dark:bg-neutral-800"].join(" ")}>
                {d.kind === "rest" && <MoonStar className="size-3 text-neutral-400" />}
              </div>
              <span className="font-mono text-[9px] text-neutral-400">{d.label[0]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] text-primary">momentum: 5/7 — holding ✓</p>
      </div>
    </div>
  );
}

function RecBackIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Back on track</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Picks up where you left off</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <p className={ILLUS_LABEL + " mb-1"}>Last session</p>
          <p className="text-[12px] text-neutral-500 line-through">Ship scoring PR — step 2/4</p>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
          <p className={ILLUS_LABEL + " mb-1 text-primary"}>Tonight</p>
          <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">Ship scoring PR — step 2/4</p>
        </div>
      </div>
    </div>
  );
}

function RecGateIllus() {
  return (
    <div className={ILLUS_CARD}>
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
        <p className={ILLUS_LABEL}>Recovery gate</p>
        <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">A gentle nudge after several rests</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex gap-1 mb-1">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className={["flex-1 h-2 rounded-full", i < 3 ? "bg-neutral-200 dark:bg-neutral-700" : "bg-primary/40"].join(" ")} />
          ))}
        </div>
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <p className="text-[12px] text-amber-700 dark:text-amber-400">3 rest nights in a row.</p>
          <p className="text-[12px] text-amber-600 dark:text-amber-500 mt-0.5">Ready to try something small?</p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 py-2 text-center font-mono text-[11px] text-neutral-400">Not yet</div>
          <div className="flex-1 rounded-lg bg-primary py-2 text-center font-mono text-[11px] font-semibold text-white">Let's go →</div>
        </div>
      </div>
    </div>
  );
}

const RECOVERY_ILLUS = [RecRestIllus, RecMomentumIllus, RecBackIllus, RecGateIllus];

function RecoveryTabDemo({ activeIndex }: { activeIndex: number }) {
  const Illus = RECOVERY_ILLUS[activeIndex] ?? RECOVERY_ILLUS[0];
  return (
    <div className="relative w-full flex justify-center min-h-[280px] items-center">
      <AnimatePresence mode="sync">
        <motion.div key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, position: "absolute" } as any} transition={{ duration: 0.25 }} className="w-full flex justify-center">
          <Illus />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── NarrativeBand — keep for path-section compatibility ───────── */
export function NarrativeBand({ which }: { which: "product" | "onboarding" | "process" }) {
  const band = loginContent[which];
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-8 py-8 sm:px-10">
        <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-neutral-400">{band.eyebrow}</p>
        <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-normal text-neutral-950 dark:text-neutral-50">{band.title}</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-neutral-500">{band.body}</p>
      </div>
    </div>
  );
}

/* ─── ScoringSection shim (used by path-section rail) ───────────── */
type RailMeta = {
  rail?: boolean;
  railIndex?: string;
  railEyebrow?: string;
  railTitle?: string;
  railBody?: string;
};

export function ScoringSection({ rail = false }: RailMeta) {
  const { index } = useDemoLoop(4, 2000);
  if (rail) return <ScoringDemo activeIndex={index} />;
  return (
    <SectionCard
      num="#05"
      category="Scoring"
      heading="Priority from fixed rules. Every time."
      features={SCORING_FEATURES}
      activeIndex={index}
      onSelect={() => {}}
      learnMoreLabel="All about scoring"
    >
      <ScoringDemo activeIndex={index} />
    </SectionCard>
  );
}

/* ─── AiSubGrid shim ────────────────────────────────────────────── */
export function AiSubGrid() {
  return null;
}

/* ─── Still wondering? ──────────────────────────────────────────── */
export function StillWondering({ onOpenAuth }: { onOpenAuth: () => void }) {
  const links = [
    { label: "Ask ChatGPT", href: "https://chatgpt.com/?q=What+is+Nocta+productivity+app" },
    { label: "Ask Claude", href: "https://claude.ai/" },
    { label: "Ask Perplexity", href: "https://www.perplexity.ai/" },
    { label: "Ask Gemini", href: "https://gemini.google.com/" },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 dark:divide-neutral-800">
          <div className="px-8 py-10 sm:px-10">
            <h2 className="font-heading text-[clamp(1.6rem,3vw,2rem)] font-normal text-neutral-950 dark:text-neutral-50">
              Still wondering?
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-500">
              See what an AI has to say about Nocta, then make an informed decision.
            </p>
            <Button
              className="mt-6 rounded-lg bg-primary px-5 font-mono text-[11px] font-semibold tracking-[0.06em] uppercase text-white hover:bg-primary/90"
              onClick={onOpenAuth}
            >
              Get started free
            </Button>
          </div>
          <div
            className="grid grid-cols-2 divide-x divide-y divide-neutral-100 dark:divide-neutral-800"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)`,
              backgroundSize: '18px 18px',
              backgroundColor: 'rgb(250 250 249)',
            }}
          >
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-6 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-neutral-900 hover:text-primary transition-colors bg-white/50"
              >
                {label}
                <ArrowRight className="size-3 shrink-0" />
              </a>
            ))}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onOpenAuth(); }}
              className="col-span-2 flex items-center justify-between gap-2 px-6 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-neutral-900 hover:text-primary transition-colors bg-white/50"
            >
              Talk to a human
              <ArrowRight className="size-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
