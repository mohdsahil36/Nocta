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
  Lightbulb,
  MoonStar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { PanelToast } from "@/components/ui/toast";
import { loginContent, type Energy, type Minutes } from "../content";
import { easeOut } from "./motion";
import { MacWindow } from "./mac-window";
import {
  AreaTag,
  COL_SPLIT,
  DeepDive,
  PanelLabel,
  SectionHeader,
  SectionShell,
  TextBand,
} from "./section";
import { useDemoLoop } from "./use-demo-loop";

const SURFACE =
  "rounded-2xl border border-foreground/10 bg-nocta-paper shadow-sm";

/** Subsection live titles — TextGenerateEffect (hero uses EncryptedText). */
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
    initial: reduceMotion ? false : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? undefined : { opacity: 0, y: -4 },
    transition: { duration: 0.22, ease: easeOut },
  } as const;
}

/** SSR-safe: false until hydrated so auto-demos match server HTML. */
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

/* 01 — evolving nights: encrypted live title · panel shows why it shifted */
export function GoalsSection() {
  const c = loginContent.goals;
  const scenes = c.scenes;
  const [sceneIdx, setSceneIdx] = useState(0);
  const scene = scenes[sceneIdx];
  const swap = useSwap();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setSceneIdx((i) => (i + 1) % scenes.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, scenes.length]);

  return (
    <DeepDive
      index={c.index}
      eyebrow={c.eyebrow}
      title={c.title}
      body={c.body}
      points={c.points}
      tone="sky"
      layout="flip"
      titleSlot={<LiveTitle text={scene.title} />}
    >
      <div className={SURFACE}>
        <div className="flex items-center justify-between gap-3 border-b border-foreground/10 px-5 py-3">
          <PanelLabel>{c.liveLabel}</PanelLabel>
          <div className="flex items-center gap-1.5">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={s.badge}
                aria-pressed={i === sceneIdx}
                onClick={() => setSceneIdx(i)}
                className={[
                  "size-2 cursor-pointer rounded-full transition-colors",
                  i === sceneIdx
                    ? "bg-nocta-glow"
                    : "bg-foreground/15 hover:bg-foreground/30",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
        {/* Reserved height + sync crossfade — scene copy length must not reflow the card. */}
        <div className="relative min-h-40 sm:min-h-36">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={scene.id}
              {...swap}
              className="absolute inset-x-0 top-0 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <AreaTag>{scene.area}</AreaTag>
                <span className="text-xs text-muted-foreground">
                  {scene.badge}
                </span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
                {scene.detail}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
                  <div
                    className={[
                      "h-full rounded-full",
                      scene.idleDays >= 6
                        ? "bg-nocta-glow/70"
                        : "bg-foreground/20",
                    ].join(" ")}
                    style={{
                      width: `${Math.min(100, Math.max(8, scene.idleDays * 10))}%`,
                    }}
                  />
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {scene.due}
                  {scene.idleDays > 0
                    ? ` · ${c.lastTouchedLabel} ${scene.idleDays}d`
                    : ""}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DeepDive>
  );
}

/* 02 — phone-style sheet with stepped time track + battery energy */
const ENERGY_ICON = {
  low: BatteryLow,
  steady: BatteryMedium,
  high: BatteryFull,
};

function stepSize(minutes: Minutes, energy: Energy) {
  if (energy === "low" && minutes === 20) return "rest";
  const tier = minutes === 20 ? 0 : minutes === 45 ? 1 : 2;
  const adjusted = energy === "low" ? tier - 1 : tier;
  return (["small", "medium", "large"] as const)[Math.max(0, adjusted)];
}

export function CheckInSection() {
  const c = loginContent.checkIn;
  const d = loginContent.demo;
  const STEPS: { minutes: Minutes; energy: Energy }[] = [
    { minutes: 45, energy: "steady" },
    { minutes: 90, energy: "high" },
    { minutes: 20, energy: "low" },
    { minutes: 45, energy: "high" },
    { minutes: 20, energy: "steady" },
    { minutes: 90, energy: "steady" },
  ];
  const { index, select } = useDemoLoop(STEPS.length, 3000);
  const [manual, setManual] = useState<{
    minutes: Minutes;
    energy: Energy;
  } | null>(null);

  const step = STEPS[index % STEPS.length];
  const minutes = manual?.minutes ?? step.minutes;
  const energy = manual?.energy ?? step.energy;
  const size = stepSize(minutes, energy);
  const selectedIndex = d.minutes.indexOf(minutes);

  const setMinutes = (m: Minutes) => {
    select(index);
    setManual({ minutes: m, energy });
  };
  const setEnergy = (e: Energy) => {
    select(index);
    setManual({ minutes, energy: e });
  };

  return (
    <DeepDive {...c} tone="mint" layout="normal">
      <MacWindow title={`${loginContent.brand} · Check-in`} tone="mint">
        <div className="mx-auto w-full max-w-md p-6 sm:p-8">
          <div
            aria-hidden
            className="mx-auto h-1 w-10 rounded-full bg-foreground/15"
          />
          <div className="mt-5 text-center">
            <LiveTitle text={c.question} size="card" />
            <p className="mt-2 text-sm text-muted-foreground">{c.sheetLead}</p>
          </div>

          <p className="mt-6 text-xs font-medium text-muted-foreground">
            {d.timeLabel}
          </p>
          <div
            role="radiogroup"
            aria-label={d.timeLabel}
            className="relative mt-3 grid grid-cols-3"
          >
            <div
              aria-hidden
              className="absolute inset-x-[16.66%] top-2 h-0.5 rounded-full bg-foreground/10"
            />
            <div
              aria-hidden
              className="absolute top-2 left-[16.66%] h-0.5 rounded-full bg-nocta-glow/70 transition-[width] duration-200"
              style={{ width: `${selectedIndex * 33.33}%` }}
            />
            {d.minutes.map((m, i) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={m === minutes}
                onClick={() => setMinutes(m)}
                className="relative flex cursor-pointer flex-col items-center gap-2 outline-none focus-visible:[&>span:first-child]:ring-2 focus-visible:[&>span:first-child]:ring-ring/50"
              >
                <span
                  className={[
                    "size-4.5 rounded-full border-2 transition-colors duration-150",
                    i <= selectedIndex
                      ? "border-nocta-glow"
                      : "border-foreground/15",
                    m === minutes ? "bg-nocta-glow" : "bg-nocta-paper",
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-sm tabular-nums",
                    m === minutes
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {m} min
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs font-medium text-muted-foreground">
            {d.energyLabel}
          </p>
          <div
            role="radiogroup"
            aria-label={d.energyLabel}
            className="mt-3 grid grid-cols-3 gap-2"
          >
            {d.energy.map((e) => {
              const Icon = ENERGY_ICON[e.id];
              const on = e.id === energy;
              return (
                <button
                  key={e.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setEnergy(e.id)}
                  className={[
                    "flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
                    on
                      ? "border-nocta-glow/35 bg-nocta-glow/10 text-foreground"
                      : "border-foreground/10 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden
                    className={on ? "size-5 text-nocta-glow" : "size-5"}
                  />
                  {e.label}
                </button>
              );
            })}
          </div>

          <div
            aria-live="polite"
            className="mt-6 min-h-16 rounded-2xl bg-muted/50 px-4 py-3"
          >
            <p className="text-[11px] text-muted-foreground">
              {c.previewLabel}
            </p>
            <div className="mt-0.5">
              <LiveTitle text={c.sizes[size]} size="line" />
            </div>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            {c.sheetHint}
          </p>
        </div>
      </MacWindow>
    </DeepDive>
  );
}

/** Narrative bands: product → onboarding → tonight's loop. */
export function NarrativeBand({
  which,
}: {
  which: "product" | "onboarding" | "process";
}) {
  const band = loginContent[which];
  return (
    <TextBand
      id={which}
      index={band.index}
      eyebrow={band.eyebrow}
      title={band.title}
      body={band.body}
    />
  );
}

/* 03 — opt-in factors: tap to apply → score rises */
const FACTOR_TINT = [
  "bg-nocta-glow/80",
  "bg-landing-mint",
  "bg-landing-peach",
  "bg-landing-lavender",
];

export function ScoringSection() {
  const c = loginContent.scoring;
  return (
    <DeepDive {...c} tone="peach" layout="flip">
      <ScoringDemoShell />
    </DeepDive>
  );
}

function ScoringDemoShell() {
  const c = loginContent.scoring;
  const reduceMotion = useReducedMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const inView = useInView(surfaceRef, { amount: 0.35, once: false });
  /** Apply each factor, hold at 100 to celebrate, then clear. */
  const stepCount = c.rows.length + 2;
  const { index, pause } = useDemoLoop(stepCount, 1500);
  const [manual, setManual] = useState<Set<string> | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const step = index % stepCount;
  const appliedCount = Math.min(step, c.rows.length);
  const autoOn = new Set(c.rows.slice(0, appliedCount).map((r) => r.factor));
  const on = manual ?? autoOn;

  const total = c.rows.reduce(
    (sum, r) => (on.has(r.factor) ? sum + r.points : sum),
    0,
  );
  const perfect = total >= 100;
  const celebrate = perfect && inView;

  // Brief overlay toast — open/dismiss only in timers (no sync setState in effect).
  useEffect(() => {
    if (!celebrate) return;
    const showId = window.setTimeout(() => setToastOpen(true), 0);
    const hideId = window.setTimeout(() => setToastOpen(false), 2400);
    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(hideId);
    };
  }, [celebrate]);

  const pressFactor =
    manual == null &&
    reduceMotion !== true &&
    appliedCount > 0 &&
    step <= c.rows.length
      ? (c.rows[appliedCount - 1]?.factor ?? null)
      : null;

  const toggle = (factor: string) => {
    pause();
    setManual((prev) => {
      const base = prev ?? new Set(on);
      const next = new Set(base);
      if (next.has(factor)) next.delete(factor);
      else next.add(factor);
      return next;
    });
  };

  return (
    <div
      ref={surfaceRef}
      className={[
        SURFACE,
        "relative overflow-hidden transition-shadow duration-300",
        perfect
          ? "ring-1 ring-nocta-glow/40 shadow-[0_0_0_1px_color-mix(in_oklab,var(--nocta-glow)_25%,transparent)]"
          : "",
      ].join(" ")}
    >
      <PanelToast
        open={celebrate && toastOpen}
        title={c.celebrate}
        description={c.celebrateBody}
        type="success"
      />
      {perfect ? (
        <motion.div
          aria-hidden
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--nocta-glow)_28%,transparent),transparent_70%)]"
        />
      ) : null}

      <div className="relative flex items-end justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <PanelLabel>{c.totalLabel}</PanelLabel>
          <p className="mt-1 truncate text-sm text-foreground">
            {loginContent.demo.goal.title}
          </p>
        </div>
        <div className="flex h-16 w-24 shrink-0 flex-col items-end justify-end text-right">
          <motion.p
            key={total}
            initial={reduceMotion ? false : { opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: easeOut }}
            aria-live="polite"
            className={[
              "w-full text-right text-5xl leading-none font-semibold tracking-[-0.03em] tabular-nums",
              perfect ? "text-nocta-glow" : "text-foreground",
            ].join(" ")}
          >
            {total}
          </motion.p>
          <p
            className={[
              "mt-1 h-4 w-full text-right text-xs font-semibold tracking-[0.08em] text-nocta-glow uppercase transition-opacity duration-200",
              perfect ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden={!perfect}
          >
            {c.celebrate}
          </p>
        </div>
      </div>

      <div className="relative mx-5 mt-3 h-11">
        <p
          className={[
            "absolute inset-x-0 top-0 rounded-xl border px-3.5 py-2.5 text-sm leading-snug transition-opacity duration-200",
            perfect
              ? "border-nocta-glow/25 bg-nocta-glow/10 text-foreground opacity-100"
              : "pointer-events-none border-transparent opacity-0",
          ].join(" ")}
          aria-hidden={!perfect}
        >
          {c.celebrateBody}
        </p>
      </div>

      <div
        aria-hidden
        className="relative mx-5 mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-foreground/5"
      >
        {c.rows.map((r, i) => (
          <motion.div
            key={r.factor}
            className={["h-full", FACTOR_TINT[i]].join(" ")}
            initial={false}
            animate={{ width: on.has(r.factor) ? `${r.points}%` : "0%" }}
            transition={{ duration: 0.35, ease: easeOut }}
          />
        ))}
      </div>

      <ul className="relative mt-4 border-t border-foreground/10">
        {c.rows.map((r, i) => {
          const applied = on.has(r.factor);
          const pressing = pressFactor === r.factor;
          return (
            <li
              key={r.factor}
              className="border-b border-foreground/10 last:border-b-0"
            >
              <motion.button
                type="button"
                aria-pressed={applied}
                onClick={() => toggle(r.factor)}
                key={pressing ? `${r.factor}-press-${appliedCount}` : r.factor}
                initial={pressing && !reduceMotion ? { scale: 0.97 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 0.28, ease: easeOut }}
                className={[
                  "grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3 text-left outline-none transition-colors duration-150 focus-visible:bg-foreground/5",
                  applied || pressing
                    ? "bg-foreground/3"
                    : "hover:bg-foreground/3",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "flex size-5 items-center justify-center rounded-md border transition-colors",
                    applied
                      ? `${FACTOR_TINT[i]} border-transparent text-nocta-paper`
                      : "border-foreground/20 bg-nocta-paper",
                  ].join(" ")}
                >
                  {applied ? (
                    <Check className="size-3 text-foreground" />
                  ) : null}
                </span>
                <span>
                  <span className="block text-sm text-foreground">
                    {r.factor}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {r.detail}
                    {" · "}
                    {applied ? c.apply : c.pending}
                  </span>
                </span>
                <span
                  className={[
                    "text-sm font-medium tabular-nums",
                    applied ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  +{r.points}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
      <p className="relative border-t border-foreground/10 px-5 py-3 text-xs text-muted-foreground">
        {c.hint} {c.footnote}
      </p>
    </div>
  );
}

/* Decide tabs + proof well; auto-advance + manual tab select (no Replay) */
const AI_WELL = [
  "bg-landing-mint",
  "bg-landing-mint",
  "bg-landing-sky",
] as const;
const AI_ACCENT = [
  "border-primary/30 bg-primary/10",
  "border-foreground/10 bg-landing-mint",
  "border-foreground/10 bg-landing-sky",
] as const;

/** Reserved height so tab swaps don't collapse the mobile layout (mobile-first). */
const AI_PANEL_MIN_H = "min-h-88 md:min-h-80";

export function AiSubGrid() {
  const c = loginContent.ai;
  const tabCount = c.cells.length;
  const TAB_MS = 3200;
  const {
    index: active,
    select,
    paused,
    reduceMotion,
    running,
  } = useDemoLoop(tabCount, TAB_MS);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [generator, timeFit, reasoning] = c.cells;
  const scenes = generator.scenes;
  const scene = scenes[sceneIdx % scenes.length];
  const maxMinutes = 90;
  const well = AI_WELL[active];

  /** Within the generator tab, cycle rewrite examples; tabs advance via useDemoLoop. */
  useEffect(() => {
    if (reduceMotion || active !== 0 || paused) return;
    const id = window.setInterval(() => {
      setSceneIdx((i) => (i + 1) % scenes.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [reduceMotion, active, scenes.length, paused]);

  const liveTitle =
    active === 0
      ? scene.to
      : active === 1
        ? timeFit.fits[1].step
        : reasoning.quote;

  const step = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: easeOut, delay },
        };

  return (
    <SectionShell>
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-foreground/12 bg-nocta-paper p-8 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.28)] sm:p-10">
          <SectionHeader
            index={c.index}
            eyebrow={c.liveEyebrow}
            title={c.title}
            body={c.body}
            wide
            titleSlot={
              <LiveTitle key={`${active}-${liveTitle}`} text={liveTitle} />
            }
          />
        </div>

        <MacWindow title={c.windowTitle} tone="mint">
          <div className={["grid", COL_SPLIT].join(" ")}>
            <div role="tablist" aria-label={c.title} className="bg-nocta-paper">
              {c.cells.map((item, i) => {
                const on = i === active;
                return (
                  <button
                    key={item.title}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => {
                      select(i);
                      setSceneIdx(0);
                    }}
                    className={[
                      "flex w-full cursor-pointer items-start border-b border-foreground/10 px-6 py-6 text-left outline-none transition-colors duration-150 last:border-b-0 sm:px-8",
                      on ? "bg-foreground/3" : "hover:bg-foreground/2",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={[
                          "block text-base font-semibold tracking-[-0.01em]",
                          on ? "text-foreground" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {item.title}
                      </span>
                      <span
                        className={[
                          "mt-1 block text-sm leading-6",
                          on
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60",
                        ].join(" ")}
                      >
                        {item.body}
                      </span>
                      {/* Section dwell progress — fills, then auto-loop advances. */}
                      <span
                        aria-hidden
                        className="mt-4 block h-0.5 w-full overflow-hidden rounded-full bg-foreground/10"
                      >
                        {on && running ? (
                          <motion.span
                            key={`tab-progress-${active}`}
                            className="block h-full rounded-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: TAB_MS / 1000,
                              ease: "linear",
                            }}
                          />
                        ) : (
                          <span
                            className={[
                              "block h-full rounded-full bg-primary transition-[width] duration-150",
                              on ? "w-10" : "w-0",
                            ].join(" ")}
                          />
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className={[
                "relative border-t border-foreground/10 p-8 sm:p-10 md:border-t-0 md:border-l",
                AI_PANEL_MIN_H,
                well,
              ].join(" ")}
            >
              {/* Absolute crossfade — keeps reserved height; no mode="wait" collapse. */}
              <div
                role="tabpanel"
                className={["relative w-full", AI_PANEL_MIN_H].join(" ")}
                aria-live="polite"
              >
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div
                    key={active}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.22, ease: easeOut }}
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="w-full">
                      {active === 0 ? (
                        <div className="mx-auto flex max-w-sm flex-col gap-3">
                          <motion.div
                            key={`from-${sceneIdx}`}
                            {...step(0)}
                            className={[
                              SURFACE,
                              "border px-4 py-4",
                              AI_ACCENT[0],
                            ].join(" ")}
                          >
                            <PanelLabel>From your score</PanelLabel>
                            <p className="mt-2 min-h-10 text-sm font-medium text-foreground">
                              {scene.from}
                            </p>
                            <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">
                              {scene.why}
                            </p>
                          </motion.div>
                          <span aria-hidden className="ml-3 text-nocta-glow">
                            <ArrowRight className="size-4 rotate-90" />
                          </span>
                          <motion.div
                            key={`to-${sceneIdx}`}
                            {...step(0.12)}
                            className={[
                              SURFACE,
                              "border border-dashed border-foreground/20 bg-nocta-paper/90 px-4 py-4",
                            ].join(" ")}
                          >
                            <PanelLabel>{c.liveEyebrow}</PanelLabel>
                            <p className="mt-2 min-h-10 text-sm font-semibold text-foreground">
                              {scene.to}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              Rewrites when accomplishments, rest or focus shift
                            </p>
                          </motion.div>
                        </div>
                      ) : null}

                      {active === 1 ? (
                        <ul
                          className={[
                            SURFACE,
                            "mx-auto max-w-sm space-y-4 p-5",
                          ].join(" ")}
                        >
                          {timeFit.fits.map((f, i) => (
                            <motion.li key={f.minutes} {...step(i * 0.12)}>
                              <div className="flex items-baseline justify-between gap-3 text-xs">
                                <span
                                  className={[
                                    "min-h-8 flex-1",
                                    i === 1
                                      ? "font-medium text-foreground"
                                      : "text-muted-foreground",
                                  ].join(" ")}
                                >
                                  {f.step}
                                </span>
                                <span className="shrink-0 text-muted-foreground tabular-nums">
                                  {f.minutes}
                                </span>
                              </div>
                              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-foreground/5">
                                <motion.div
                                  className={[
                                    "h-full rounded-full",
                                    i === 1
                                      ? "bg-nocta-glow/75"
                                      : "bg-foreground/15",
                                  ].join(" ")}
                                  initial={reduceMotion ? false : { width: 0 }}
                                  animate={{
                                    width: `${(parseInt(f.minutes, 10) / maxMinutes) * 100}%`,
                                  }}
                                  transition={{
                                    duration: 0.55,
                                    ease: easeOut,
                                    delay: reduceMotion ? 0 : 0.12 + i * 0.1,
                                  }}
                                />
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      ) : null}

                      {active === 2 ? (
                        <div className="mx-auto max-w-sm">
                          <motion.div
                            {...step(0)}
                            className={[
                              "rounded-2xl rounded-bl-md border bg-nocta-paper px-5 py-4 shadow-sm",
                              AI_ACCENT[2],
                            ].join(" ")}
                          >
                            <PanelLabel>Why this pick</PanelLabel>
                            <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">
                              Built from deadlines, neglect, rest days and focus
                              — not a preset list of actions.
                            </p>
                          </motion.div>
                          <motion.div
                            {...step(0.28)}
                            className="mt-4 flex flex-wrap gap-1.5"
                          >
                            {loginContent.demo.goal.facts.map((fact) => (
                              <AreaTag key={fact}>{fact}</AreaTag>
                            ))}
                            <AreaTag>{reasoning.fit}</AreaTag>
                          </motion.div>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </MacWindow>
      </div>
    </SectionShell>
  );
}

/* 06 — command bar → parsed tokens → confirm */
type Parsed = {
  goal: string | null;
  time: string | null;
  energy: string | null;
  progress: string | null;
};

const GOAL_KEYWORDS: [RegExp, string][] = [
  [/\b(test|tests|pr|review|scoring)\b/i, "Ship the scoring PR"],
  [/\b(portfolio|case study)\b/i, "Update portfolio case study"],
  [/\b(run|ran|jog|gym)\b/i, "Run three times a week"],
  [/\b(read|chapter|book)\b/i, "Finish the systems book"],
  [/\b(call|called|home|mom|dad)\b/i, "Call home on Sundays"],
  [/\b(sketch|draw|drew)\b/i, "Sketch for 20 minutes"],
];

function parseLog(line: string): Parsed {
  const goal = GOAL_KEYWORDS.find(([re]) => re.test(line))?.[1] ?? null;
  const mins = line.match(/(\d+)\s*(m|min|mins|minutes)\b/i);
  const hours = line.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?)\b/i);
  const time = mins ? `${mins[1]} min` : hours ? `${hours[1]} h` : null;
  const energy = /\b(tired|exhausted|drained|sleepy|low)\b/i.test(line)
    ? "Low"
    : /\b(great|energi[sz]ed|sharp|high)\b/i.test(line)
      ? "High"
      : /\b(ok|okay|fine|steady|normal)\b/i.test(line)
        ? "Steady"
        : null;
  const clause = line
    .split(/[,.;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .at(-1);
  const progress =
    clause && clause.length > 3
      ? clause.charAt(0).toUpperCase() + clause.slice(1)
      : null;
  return { goal, time, energy, progress };
}

export function LogParserSection() {
  const c = loginContent.logParser;
  const prefersMotion = usePrefersMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const inView = useInView(surfaceRef, { amount: 0.35, once: false });
  const full = c.input;
  const [line, setLine] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [saved, setSaved] = useState(false);
  const [phase, setPhase] = useState<
    "type" | "press-parse" | "reveal" | "press-confirm" | "success" | "clear"
  >("type");
  const [manual, setManual] = useState(false);
  const [loop, setLoop] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);

  const animate = prefersMotion && !manual;
  const lineShown = animate ? line : manual ? line : full;
  const parsedShown = animate ? parsed : manual ? parsed : parseLog(full);
  const savedShown = animate ? saved : manual ? saved : true;
  const phaseShown = animate ? phase : "success";

  /** Loop: type → click Parse → cards → click Looks right → saved → clear. */
  useEffect(() => {
    if (!animate) return;

    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const run = async () => {
      setPhase("type");
      setLine("");
      setParsed(null);
      setSaved(false);
      await wait(400);
      for (let i = 1; i <= full.length; i++) {
        if (cancelled) return;
        setLine(full.slice(0, i));
        await wait(26);
      }
      if (cancelled) return;

      setPhase("press-parse");
      await wait(520);
      if (cancelled) return;

      setPhase("reveal");
      setParsed(parseLog(full));
      await wait(1400);
      if (cancelled) return;

      setPhase("press-confirm");
      await wait(480);
      if (cancelled) return;

      setPhase("success");
      setSaved(true);
      await wait(1800);
      if (cancelled) return;

      setPhase("clear");
      await wait(450);
      if (cancelled) return;

      setLine("");
      setParsed(null);
      setSaved(false);
      setLoop((n) => n + 1);
    };

    void run();
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [full, animate, loop]);

  const shouldToast = Boolean(savedShown && inView && (animate || manual));

  // Brief overlay — open/dismiss only in timers (no sync setState in effect).
  useEffect(() => {
    if (!shouldToast) return;
    const showId = window.setTimeout(() => setToastOpen(true), 0);
    const hideId = window.setTimeout(() => setToastOpen(false), 2400);
    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(hideId);
    };
  }, [shouldToast]);

  const onParse = (e: React.FormEvent) => {
    e.preventDefault();
    setManual(true);
    if (!lineShown.trim()) return;
    setSaved(false);
    setParsed(parseLog(lineShown));
    setPhase("reveal");
  };

  const fields = parsedShown
    ? ([
        ["goal", parsedShown.goal],
        ["time", parsedShown.time],
        ["energy", parsedShown.energy],
        ["progress", parsedShown.progress],
      ] as const)
    : ([
        ["goal", null],
        ["time", null],
        ["energy", null],
        ["progress", null],
      ] as const);

  const showCards = parsedShown != null && phaseShown !== "clear";
  const parsePressed = phaseShown === "press-parse" && animate;
  const confirmPressed = phaseShown === "press-confirm" && animate;

  return (
    <DeepDive {...c} tone="lavender" layout="normal">
      <div ref={surfaceRef} className="relative overflow-hidden">
        <MacWindow title={c.windowTitle} tone="lavender">
          <div className="relative flex min-h-88 flex-col gap-4 p-4 sm:min-h-80 sm:p-5">
            <PanelToast
              open={shouldToast && toastOpen}
              align="start"
              title={c.saved}
              description="Your log is confirmed."
              type="success"
            />
            <form
              onSubmit={onParse}
              className={[SURFACE, "flex items-center gap-2 p-2 pl-4"].join(
                " ",
              )}
            >
              <label htmlFor="nocta-log-line" className="sr-only">
                {c.inputLabel}
              </label>
              <input
                id="nocta-log-line"
                value={lineShown}
                onChange={(e) => {
                  setManual(true);
                  setLine(e.target.value);
                  setParsed(null);
                  setSaved(false);
                }}
                placeholder={c.placeholder}
                maxLength={140}
                className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <motion.div
                animate={parsePressed ? { scale: 0.92 } : { scale: 1 }}
                transition={{ duration: 0.12 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  className={[
                    "rounded-xl px-3 transition-shadow",
                    parsePressed ? "ring-2 ring-nocta-glow/50 shadow-md" : "",
                  ].join(" ")}
                  disabled={!lineShown.trim()}
                >
                  {c.parse}
                  <CornerDownLeft aria-hidden data-icon="inline-end" />
                </Button>
              </motion.div>
            </form>

            <div
              aria-live="polite"
              className="relative min-h-52 flex-1 sm:min-h-48"
            >
              <AnimatePresence mode="sync" initial={false}>
                {showCards ? (
                  <motion.div
                    key={`cards-${loop}-${parsedShown?.goal ?? "x"}`}
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    exit={animate ? { opacity: 0 } : undefined}
                    transition={{ duration: 0.25, ease: easeOut }}
                    className="absolute inset-0"
                  >
                    <dl className="grid grid-cols-2 gap-2">
                      {fields.map(([key, value], i) => (
                        <motion.div
                          key={key}
                          initial={
                            animate ? { opacity: 0, y: 12, scale: 0.96 } : false
                          }
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.32,
                            ease: easeOut,
                            delay: animate ? 0.06 + i * 0.09 : 0,
                          }}
                          className={[
                            "min-h-16 rounded-xl border px-3.5 py-2.5",
                            value
                              ? "border-nocta-glow/25 bg-nocta-glow/5"
                              : "border-dashed border-foreground/20",
                          ].join(" ")}
                        >
                          <dt className="text-[11px] text-muted-foreground">
                            {c.fieldLabels[key]}
                          </dt>
                          <dd
                            className={[
                              "mt-0.5 truncate text-sm",
                              value
                                ? "font-medium text-foreground"
                                : "text-muted-foreground",
                            ].join(" ")}
                          >
                            {value ?? c.unknown}
                          </dd>
                        </motion.div>
                      ))}
                    </dl>

                    <div className="mt-3 flex min-h-11 items-center justify-end gap-2">
                      <AnimatePresence mode="sync" initial={false}>
                        {savedShown || phaseShown === "success" ? (
                          <motion.div
                            key="saved"
                            initial={animate ? { opacity: 0, y: 6 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            exit={animate ? { opacity: 0 } : undefined}
                            className="inline-flex items-center gap-1.5 rounded-full border border-nocta-glow/30 bg-nocta-glow/10 px-3 py-1.5 text-sm font-medium text-foreground"
                          >
                            <Check
                              aria-hidden
                              className="size-4 text-nocta-glow"
                            />
                            {c.saved}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="confirm"
                            animate={
                              confirmPressed ? { scale: 0.94 } : { scale: 1 }
                            }
                            transition={{ duration: 0.12 }}
                          >
                            <Button
                              size="lg"
                              className={[
                                "rounded-full px-4",
                                confirmPressed
                                  ? "ring-2 ring-nocta-glow/50"
                                  : "",
                              ].join(" ")}
                              onClick={() => {
                                setManual(true);
                                setSaved(true);
                                setPhase("success");
                              }}
                            >
                              {c.confirm}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {manual && savedShown ? (
                        <Button
                          variant="ghost"
                          size="lg"
                          className="rounded-full"
                          onClick={() => {
                            setSaved(false);
                            setPhase("reveal");
                          }}
                        >
                          {c.edit}
                        </Button>
                      ) : null}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    exit={animate ? { opacity: 0 } : undefined}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-foreground/15 bg-landing-lavender/30 px-4 text-center"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {phaseShown === "type"
                        ? "Type what you did…"
                        : "Parse a line to fill the fields"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.fieldLabels.goal} · {c.fieldLabels.time} ·{" "}
                      {c.fieldLabels.energy} · {c.fieldLabels.progress}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </MacWindow>
      </div>
    </DeepDive>
  );
}

/* 07 — rest ↔ action nights; momentum gauge (no broken / greyed-out state) */
export function RecoverySection() {
  const c = loginContent.recovery;
  const scenes = c.scenes;
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx];
  const swap = useSwap();
  const reduceMotion = useReducedMotion();
  const segments = 7;

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % scenes.length),
      2800,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, scenes.length]);

  return (
    <DeepDive
      index={c.index}
      eyebrow={c.eyebrow}
      title={c.title}
      body={c.body}
      points={c.points}
      tone="glow"
      layout="flip"
      titleSlot={<LiveTitle text={scene.title} />}
    >
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-foreground/10 bg-nocta-paper px-6 py-10 text-center shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 size-56 -translate-x-1/2 -translate-y-1/3 rounded-full bg-nocta-glow/15 blur-3xl"
        />
        {/* Fixed chrome + reserved copy height — rest/action body length must not jump. */}
        <div className="relative min-h-56 sm:min-h-52">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={scene.id}
              {...swap}
              className="absolute inset-x-0 top-0"
            >
              <PanelLabel>{scene.label}</PanelLabel>
              <span
                className={[
                  "mx-auto mt-5 flex size-16 items-center justify-center rounded-full border",
                  scene.kind === "rest"
                    ? "border-primary/30 bg-landing-mint"
                    : "border-primary/30 bg-landing-sky",
                ].join(" ")}
              >
                {scene.kind === "rest" ? (
                  <MoonStar aria-hidden className="size-7 text-primary" />
                ) : (
                  <Check aria-hidden className="size-7 text-primary" />
                )}
              </span>
              <p className="mx-auto mt-5 min-h-16 max-w-xs text-sm leading-6 text-muted-foreground">
                {scene.body}
              </p>
              <div
                className="mx-auto mt-7 flex h-2 w-full max-w-48 items-center gap-1"
                aria-label={scene.momentumLabel}
              >
                {Array.from({ length: segments }, (_, i) => {
                  const filled = i < scene.momentumLevel;
                  return (
                    <span
                      key={i}
                      aria-hidden
                      className={[
                        "h-full flex-1 rounded-sm transition-colors duration-300",
                        filled ? "bg-primary/70" : "bg-primary/15",
                      ].join(" ")}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-medium text-foreground">
                {scene.momentumLabel}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DeepDive>
  );
}

/* 08 — weekly column chart + insight notes */
export function ReflectionSection() {
  const c = loginContent.reflection;
  const max = Math.max(...c.week.map((d) => d.minutes));
  const acted = c.week.filter((d) => d.kind === "action").length;
  const rested = c.week.filter((d) => d.kind === "recovery").length;
  const totalMinutes = c.week.reduce((s, d) => s + d.minutes, 0);

  return (
    <DeepDive {...c} tone="canvas" layout="normal">
      <div className={[SURFACE, "mx-auto w-full max-w-2xl"].join(" ")}>
        <dl className="grid grid-cols-3 border-b border-foreground/10">
          {[
            [c.legend.action, acted],
            [c.legend.recovery, rested],
            [c.legend.minutes, totalMinutes],
          ].map(([label, value], i) => (
            <div
              key={String(label)}
              className={[
                "px-5 py-4",
                i > 0 ? "border-l border-foreground/10" : "",
              ].join(" ")}
            >
              <dt className="text-[11px] text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-xl font-semibold text-foreground tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="p-5">
          <div className="grid h-32 grid-cols-7 items-end gap-2">
            {c.week.map((d) => (
              <div
                key={d.day}
                className="flex h-full flex-col items-center justify-end gap-2"
              >
                {d.kind === "action" ? (
                  <div
                    className="w-full rounded-md bg-foreground/15"
                    style={{
                      height: `${Math.max(12, (d.minutes / max) * 100)}%`,
                    }}
                  />
                ) : d.kind === "recovery" ? (
                  <div className="h-3 w-full rounded-md border border-dashed border-nocta-glow/60 bg-nocta-glow/15" />
                ) : (
                  <div className="h-1 w-full rounded-full bg-foreground/10" />
                )}
                <span className="text-[11px] text-muted-foreground">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
          <ul className="mt-5 flex flex-col gap-2.5 border-t border-foreground/10 pt-5">
            {c.insights.map((line) => (
              <li
                key={line}
                className="flex gap-2.5 text-sm leading-6 text-foreground"
              >
                <Lightbulb
                  aria-hidden
                  className="mt-1 size-3.5 shrink-0 text-nocta-glow"
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DeepDive>
  );
}
