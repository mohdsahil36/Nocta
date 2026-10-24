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

type Phase = "idle" | "time" | "energy" | "scoring" | "result";

function HeroCheckIn({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (reduceMotion) { setPhase("result"); return; }

    const SEQ: [Phase, number][] = [
      ["idle", 700],
      ["time", 750],
      ["energy", 750],
      ["scoring", 1300],
      ["result", 3000],
    ];

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = async () => {
      let cursor = 0;
      while (!cancelled) {
        for (const [p, ms] of SEQ) {
          if (cancelled) return;
          setPhase(p);
          await new Promise<void>((res) => {
            timers.push(setTimeout(res, ms));
          });
          cursor++;
        }
      }
    };
    void run();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [reduceMotion]);

  // Dots animation while scoring
  useEffect(() => {
    if (phase !== "scoring") return;
    let n = 0;
    const id = setInterval(() => { n = (n + 1) % 4; setDots(".".repeat(n)); }, 280);
    return () => clearInterval(id);
  }, [phase]);

  const showTime = phase === "time" || phase === "energy" || phase === "scoring" || phase === "result";
  const showEnergy = phase === "energy" || phase === "scoring" || phase === "result";

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/20 bg-white/93 backdrop-blur-md shadow-2xl">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Time picker */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2.5">
            How long do you have?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[20, 45, 90].map((m) => {
              const active = showTime && m === 45;
              return (
                <div
                  key={m}
                  className={[
                    "rounded-lg border py-2.5 text-center font-mono text-[12px] font-medium transition-all duration-300",
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-neutral-300 text-neutral-600",
                  ].join(" ")}
                >
                  {m}m
                </div>
              );
            })}
          </div>
        </div>

        {/* Energy picker */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2.5">
            Your energy tonight?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["Low", "Steady", "High"] as const).map((e) => {
              const active = showEnergy && e === "Steady";
              return (
                <div
                  key={e}
                  className={[
                    "rounded-lg border py-2.5 text-center font-mono text-[12px] font-medium transition-all duration-300",
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-neutral-300 text-neutral-600",
                  ].join(" ")}
                >
                  {e}
                </div>
              );
            })}
          </div>
        </div>

        {/* Result area — fixed height prevents card resize */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 h-[100px] overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === "scoring" && (
              <motion.div
                key="scoring"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <p className="font-mono text-[12px] text-neutral-500">
                  Scoring your goals{dots}
                </p>
              </motion.div>
            )}
            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1.5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  Tonight's action
                </p>
                <p className="text-[17px] font-semibold text-neutral-950 dark:text-neutral-50 leading-snug">
                  Ship the scoring PR
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    <Check className="size-2.5" /> Score 86
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    45 min · Steady
                  </span>
                </div>
              </motion.div>
            )}
            {(phase === "idle" || phase === "time" || phase === "energy") && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-[12px] text-neutral-400"
              >
                {phase === "idle" ? "Select your time and energy →" : ""}
              </motion.p>
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
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 py-1 text-[12px] font-mono text-neutral-600 dark:text-neutral-400 shadow-sm">
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground tracking-wider uppercase">
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
          className="mt-5 mx-auto max-w-lg text-[15px] leading-7 text-neutral-500 dark:text-neutral-400"
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
          {/* aurora-fjord — colored canvas scene, width in px per ascii.rest rules */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <Ascii
              piece="aurora-fjord"
              style={{ width: 900, margin: 0, opacity: 0.9 }}
            />
          </div>

          <div className="relative z-10">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3 bg-black/40 backdrop-blur-sm">
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="ml-4 flex-1 rounded-md bg-white/10 px-3 py-1 font-mono text-[11px] text-white/40">
                nocta.app/check-in
              </span>
            </div>

            {/* Animated check-in */}
            <div className="flex items-center justify-center px-10 py-20 sm:px-20 sm:py-24 min-h-96">
              <HeroCheckIn reduceMotion={reduceMotion} />
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
              <span className="font-mono text-[11px] font-bold text-neutral-950 dark:text-neutral-50 uppercase tracking-[0.12em] group-hover:text-primary transition-colors">
                {String(i + 1).padStart(2, "0")} — {title}
              </span>
              <span className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
                {body}
              </span>
              <span className="mt-auto pt-2 font-mono text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
