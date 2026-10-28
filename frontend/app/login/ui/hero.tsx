"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Ascii } from "ascii.rest/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { loginContent } from "../content";
import { fadeUp, stagger } from "./motion";

type HeroProps = {
  reduceMotion: boolean | null;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onHowItWorks: () => void;
};

const QUICK_LINKS = [
  {
    title: "Check-in",
    body: "Tell Nocta your time and energy. It picks one action — sized to fit.",
  },
  {
    title: "Score",
    body: "Deadline, neglect, weight, momentum — deterministic every time.",
  },
  {
    title: "Act or rest",
    body: "One step forward, or an honest recovery night. Both count.",
  },
];

const GOAL_SCORES = [
  { name: "Ship PR", score: 86 },
  { name: "SOLID", score: 62 },
  { name: "DSA", score: 45 },
  { name: "Side proj", score: 28 },
];

const MOMENTUM_DATA = [
  { d: "M", v: 32 },
  { d: "T", v: 48 },
  { d: "W", v: 41 },
  { d: "T", v: 55 },
  { d: "F", v: 63 },
  { d: "S", v: 59 },
  { d: "S", v: 74 },
];

const REASONING_LINES = [
  "Deadline pressure at 0.87 — closes in 11 days.",
  "3 days untouched. Neglect score rising.",
  "Momentum is up from last week (+14).",
];

type Phase = "idle" | "time" | "energy" | "scoring" | "result" | "reasoning" | "outcome";

function HeroCheckIn({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [dots, setDots] = useState("");
  const [visibleLines, setVisibleLines] = useState(0);
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (reduceMotion) { setPhase("result"); return; }

    const SEQ: [Phase, number][] = [
      ["idle", 700],
      ["time", 750],
      ["energy", 800],
      ["scoring", 1600],
      ["result", 2400],
      ["reasoning", 3400],
      ["outcome", 3000],
    ];

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = async () => {
      while (!cancelled) {
        for (const [p, ms] of SEQ) {
          if (cancelled) return;
          setPhase(p);
          if (p === "scoring") setAnimateBars(false);
          await new Promise<void>((res) => { timers.push(setTimeout(res, 80)); });
          if (p === "scoring") setAnimateBars(true);
          await new Promise<void>((res) => { timers.push(setTimeout(res, ms - 80)); });
        }
      }
    };
    void run();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [reduceMotion]);

  useEffect(() => {
    if (phase !== "scoring") return;
    let n = 0;
    const id = setInterval(() => { n = (n + 1) % 4; setDots(".".repeat(n)); }, 300);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "reasoning") { setVisibleLines(0); return; }
    setVisibleLines(0);
    const ts = REASONING_LINES.map((_, i) => setTimeout(() => setVisibleLines(i + 1), i * 700));
    return () => ts.forEach(clearTimeout);
  }, [phase]);

  const showTime = !["idle"].includes(phase);
  const showEnergy = !["idle", "time"].includes(phase);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-white/12 bg-white/98 dark:bg-neutral-900/80 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/8 px-5 py-3">
        <span className="font-mono text-[0.6875rem] font-bold tracking-[0.14em] uppercase text-neutral-950 dark:text-neutral-50">
          nocta
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.625rem] text-neutral-400 dark:text-neutral-500">
            {phase === "outcome" ? "log outcome" : phase === "reasoning" ? "why this?" : phase === "result" ? "tonight's action" : phase === "scoring" ? "ranking goals" : "check-in"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 dark:bg-primary/15 px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-primary">
            <span className={["size-1.5 rounded-full bg-primary", phase === "scoring" || phase === "reasoning" ? "animate-pulse" : ""].join(" ")} />
            {phase === "outcome" ? "done" : phase === "result" || phase === "reasoning" ? "score 86" : "active"}
          </span>
        </div>
      </div>

      {/* Body: 2-column — fixed height so phase transitions don't resize the card */}
      <div className="grid grid-cols-5 h-[22.5rem]">
        {/* Left: inputs — always visible */}
        <div className="col-span-2 border-r border-neutral-100 dark:border-white/8 p-4 space-y-4 flex flex-col overflow-hidden">
          {/* Time picker */}
          <div>
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-2">
              Time
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { label: "20m", hint: "Quick" },
                { label: "45m", hint: "Focus" },
                { label: "90m", hint: "Deep" },
              ] as const).map(({ label, hint }, i) => {
                const active = showTime && i === 1;
                return (
                  <div
                    key={label}
                    className={[
                      "rounded-md border px-1.5 py-2 text-center font-mono text-[0.6875rem] font-medium transition-all duration-300",
                      active
                        ? "border-primary bg-primary/10 dark:bg-primary/15 text-primary"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400",
                    ].join(" ")}
                  >
                    <div>{label}</div>
                    <div className={["text-[0.5625rem] mt-0.5", active ? "text-primary/60" : "text-neutral-400 dark:text-neutral-600"].join(" ")}>{hint}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Energy picker */}
          <div>
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-2">
              Energy
            </p>
            <div className="space-y-1.5">
              {(["Low", "Steady", "High"] as const).map((e) => {
                const active = showEnergy && e === "Steady";
                return (
                  <div
                    key={e}
                    className={[
                      "rounded-md border px-3 py-1.5 font-mono text-[0.6875rem] font-medium transition-all duration-300",
                      active
                        ? "border-primary bg-primary/10 dark:bg-primary/15 text-primary"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400",
                    ].join(" ")}
                  >
                    {e}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step progress — visible in result/reasoning/outcome */}
          <AnimatePresence>
            {(phase === "result" || phase === "reasoning" || phase === "outcome") && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-auto"
              >
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-2">Plan progress</p>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={[
                        "h-1.5 flex-1 rounded-full",
                        i < 3
                          ? "bg-primary"
                          : i === 3
                          ? "bg-primary/40"
                          : "bg-neutral-200 dark:bg-neutral-700",
                      ].join(" ")}
                    />
                  ))}
                </div>
                <p className="mt-1 font-mono text-[0.5625rem] text-neutral-400 dark:text-neutral-500">Step 3 of 6</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: visualization */}
        <div className="col-span-3 p-4 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {/* idle / time / energy: placeholder */}
            {(phase === "idle" || phase === "time" || phase === "energy") && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 flex-col items-center justify-center gap-3"
              >
                <div className="space-y-1.5 w-full">
                  {GOAL_SCORES.map((g) => (
                    <div key={g.name} className="flex items-center gap-2">
                      <span className="w-14 font-mono text-[0.625rem] text-neutral-400 dark:text-neutral-600 truncate">{g.name}</span>
                      <div className="flex-1 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                      <span className="font-mono text-[0.625rem] text-neutral-300 dark:text-neutral-700">—</span>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-[0.625rem] text-neutral-300 dark:text-neutral-600">
                  {phase === "idle" ? "waiting for check-in…" : ""}
                </p>
              </motion.div>
            )}

            {/* scoring: CSS animated bars */}
            {phase === "scoring" && (
              <motion.div
                key="scoring"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-1 flex-col justify-center gap-3"
              >
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-[0.625rem] text-neutral-400 dark:text-neutral-500">
                    Ranking goals{dots}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {GOAL_SCORES.map((g, i) => (
                    <div key={g.name} className="flex items-center gap-2.5">
                      <span className="w-[3.25rem] font-mono text-[0.625rem] text-neutral-500 dark:text-neutral-400 shrink-0 truncate">{g.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: i === 0 ? "rgb(0,109,221)" : `rgba(0,109,221,${0.65 - i * 0.18})` }}
                          initial={{ width: 0 }}
                          animate={animateBars ? { width: `${g.score}%` } : { width: 0 }}
                          transition={{ duration: 0.65, ease: "easeOut", delay: i * 0.08 }}
                        />
                      </div>
                      <span className="font-mono text-[0.625rem] tabular-nums text-neutral-400 dark:text-neutral-500 w-6 text-right">{g.score}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-1">
                  {["Deadline", "Neglect", "Momentum"].map((f) => (
                    <span key={f} className="font-mono text-[0.5625rem] text-neutral-300 dark:text-neutral-600">{f}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* result */}
            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col gap-3"
              >
                <div>
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-1">
                    Tonight's action
                  </p>
                  <p className="text-[1rem] font-semibold text-neutral-950 dark:text-neutral-50 leading-snug">
                    Ship the scoring PR
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-primary">
                      <Check className="size-2.5" /> Score 86
                    </span>
                    <span className="font-mono text-[0.625rem] text-neutral-400 dark:text-neutral-500">
                      45 min · Steady
                    </span>
                  </div>
                </div>
                {/* mini score breakdown */}
                <div className="flex-1 rounded-lg border border-neutral-100 dark:border-neutral-800 p-3 space-y-2">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">Score factors</p>
                  {[
                    { label: "Deadline", val: 87, w: "87%" },
                    { label: "Neglect", val: 72, w: "72%" },
                    { label: "Weight", val: 80, w: "80%" },
                    { label: "Momentum", val: 74, w: "74%" },
                  ].map(({ label, val, w }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-14 font-mono text-[0.5625rem] text-neutral-400 dark:text-neutral-500 shrink-0">{label}</span>
                      <div className="flex-1 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: w }}
                          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                        />
                      </div>
                      <span className="font-mono text-[0.5625rem] text-neutral-400 dark:text-neutral-500 tabular-nums">{val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* reasoning: streamed text + momentum sparkline */}
            {phase === "reasoning" && (
              <motion.div
                key="reasoning"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                      AI reasoning
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {REASONING_LINES.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -4 }}
                        animate={visibleLines > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="text-[0.75rem] leading-5 text-neutral-700 dark:text-neutral-300"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                </div>
                {/* Momentum sparkline — inline SVG, no library */}
                <div className="flex-1 rounded-lg border border-neutral-100 dark:border-neutral-800 p-3">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500 mb-2">Momentum (7d)</p>
                  <svg viewBox="0 0 154 46" className="w-full h-12" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(0,109,221)" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="rgb(0,109,221)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* area */}
                    <path d="M0,38 L22,30 L44,34 L66,22 L88,16 L110,19 L132,10 L154,8 L154,46 L0,46 Z" fill="url(#mg)" />
                    {/* line */}
                    <path d="M0,38 L22,30 L44,34 L66,22 L88,16 L110,19 L132,10 L154,8" fill="none" stroke="rgb(0,109,221)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                    {/* last point dot */}
                    <circle cx="154" cy="8" r="2.5" fill="rgb(0,109,221)" />
                  </svg>
                  <div className="flex justify-between mt-1">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <span key={i} className="font-mono text-[0.5rem] text-neutral-400 dark:text-neutral-600">{d}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* outcome */}
            {phase === "outcome" && (
              <motion.div
                key="outcome"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col gap-3"
              >
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                  How did it go?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["Completed ✓", "Partial", "Deferred", "Rest night"] as const).map((label) => {
                    const active = label === "Completed ✓";
                    return (
                      <motion.div
                        key={label}
                        animate={active ? { scale: [1, 0.96, 1] } : {}}
                        transition={{ delay: 0.7, duration: 0.25 }}
                        className={[
                          "rounded-lg border px-3 py-2.5 font-mono text-[0.6875rem] font-medium text-center transition-all duration-300",
                          active
                            ? "border-primary bg-primary/10 dark:bg-primary/15 text-primary shadow-sm"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400",
                        ].join(" ")}
                      >
                        {label}
                      </motion.div>
                    );
                  })}
                </div>
                {/* weekly snapshot */}
                <div className="flex-1 rounded-lg border border-neutral-100 dark:border-neutral-800 p-3">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500 mb-2">This week</p>
                  <div className="flex items-end gap-1.5 h-10">
                    {[4, 6, 3, 7, 5, 8, 9].map((v, i) => (
                      <motion.div
                        key={i}
                        className={["flex-1 rounded-sm origin-bottom", i === 6 ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-700"].join(" ")}
                        style={{ height: `${v * 10}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <span key={i} className={["flex-1 text-center font-mono text-[0.5rem]", i === 6 ? "text-primary" : "text-neutral-400 dark:text-neutral-600"].join(" ")}>{d}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function Hero({ reduceMotion, onOpenAuth, onHowItWorks }: HeroProps) {
  return (
    <section
      id="top"
      className="relative bg-[#f8f8f6] dark:bg-neutral-950 pt-16 pb-0"
    >
      <motion.div
        className="mx-auto max-w-2xl px-6 text-center"
        variants={stagger}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
      >
        {/* Pill badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 py-1 text-[0.75rem] font-mono text-neutral-600 dark:text-neutral-400 shadow-sm">
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[0.625rem] font-bold text-primary-foreground tracking-wider uppercase">
              Beta
            </span>
            One meaningful next action per check-in.
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-heading text-[clamp(2.8rem,7vw,4.5rem)] leading-[1.08] font-normal tracking-[-0.01em] text-neutral-950 dark:text-neutral-50"
        >
          The score decides.{" "}
          <em className="italic">Not the mood.</em>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-5 mx-auto max-w-lg text-[0.9375rem] leading-7 text-neutral-500 dark:text-neutral-400"
        >
          Check in with the time and energy you have. Nocta scores your goals
          and returns one clear next step — or rest. The score decides, not the AI.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            variant="outline"
            size="lg"
            className="h-10 rounded-lg border-neutral-300 bg-white px-6 font-mono text-xs font-semibold tracking-[0.12em] uppercase text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            onClick={onHowItWorks}
          >
            See how it works
          </Button>
          <Button
            size="lg"
            className="h-10 rounded-lg bg-primary px-6 font-mono text-xs font-semibold tracking-[0.06em] uppercase text-primary-foreground hover:bg-primary/90"
            onClick={() => onOpenAuth("signup")}
          >
            Get started
          </Button>
        </motion.div>
      </motion.div>

      {/* Product card with aurora bg */}
      <motion.div
        variants={fadeUp}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className="mx-auto mt-12 max-w-4xl px-4 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.3)]">
          {/* aurora-fjord — uniform scale so art fills without distortion */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center scale-[1.4] origin-center">
              <Ascii piece="aurora-fjord" style={{ width: 1200, margin: 0, opacity: 0.85 }} />
            </div>
          </div>

          <div className="relative z-10">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3 bg-black/40 backdrop-blur-sm">
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="ml-4 flex-1 rounded-md bg-white/10 px-3 py-1 font-mono text-[0.6875rem] text-white/40">
                nocta.app/check-in
              </span>
            </div>

            {/* Animated check-in — padding so aurora shows at edges */}
            <div className="flex justify-center px-6 py-8 sm:px-16 sm:py-10">
              <div className="w-full max-w-xl">
                <HeroCheckIn reduceMotion={reduceMotion} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick links strip */}
      <div className="mx-auto mt-0 max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800 border border-t-0 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-b-2xl overflow-hidden">
          {QUICK_LINKS.map(({ title, body }, i) => (
            <button
              key={title}
              type="button"
              onClick={onHowItWorks}
              className="flex flex-col gap-2 px-7 py-7 sm:py-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group text-left"
            >
              <span className="font-mono text-[0.6875rem] font-bold text-neutral-950 dark:text-neutral-50 uppercase tracking-[0.12em] group-hover:text-primary transition-colors">
                {String(i + 1).padStart(2, "0")} — {title}
              </span>
              <span className="text-[0.8125rem] leading-5 text-neutral-500 dark:text-neutral-400">
                {body}
              </span>
              <span className="mt-auto pt-2 font-mono text-[0.6875rem] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
