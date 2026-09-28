"use client";

import { useState } from "react";
import { Bed, Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { loginContent, type Energy, type Minutes } from "../content";
import { easeOut } from "./motion";
import { MacWindow } from "./mac-window";
import { AreaTag, COL_SPLIT, PanelLabel, SectionShell } from "./section";
import { useDemoLoop } from "./use-demo-loop";

const demo = loginContent.demo;

/** Scripted check-in states the Mac window walks through on a loop. */
const TONIGHT_STEPS: { minutes: Minutes; energy: Energy }[] = [
  { minutes: 45, energy: "steady" },
  { minutes: 90, energy: "high" },
  { minutes: 20, energy: "low" },
  { minutes: 45, energy: "high" },
  { minutes: 20, energy: "steady" },
  { minutes: 90, energy: "steady" },
];

function pickTonight(minutes: Minutes, energy: Energy) {
  if (energy === "low" && minutes === 20) return null;
  const effective: Minutes =
    energy === "low" ? (minutes === 90 ? 45 : 20) : minutes;
  return {
    step: demo.goal.steps[effective],
    reason: `${demo.goal.facts.join(" · ")} · fits ${minutes} min`,
  };
}

type SegmentProps<T extends string | number> = {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (next: T) => void;
};

function Segment<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SegmentProps<T>) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2.5 grid grid-cols-3 gap-1 rounded-xl bg-foreground/5 p-1"
      >
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={String(o.id)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={[
                "h-9 cursor-pointer rounded-lg text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "bg-nocta-paper text-foreground shadow-sm dark:bg-muted"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Interactive check-in → one recommended action, inside a Mac window. */
export function TonightDemo() {
  const reduceMotion = useReducedMotion();
  const { index, select } = useDemoLoop(TONIGHT_STEPS.length, 3200);
  const [manual, setManual] = useState<{
    minutes: Minutes;
    energy: Energy;
  } | null>(null);

  const step = TONIGHT_STEPS[index % TONIGHT_STEPS.length];
  const minutes = manual?.minutes ?? step.minutes;
  const energy = manual?.energy ?? step.energy;
  const pick = pickTonight(minutes, energy);
  const key = pick ? pick.step : "recovery";

  const setMinutes = (m: Minutes) => {
    select(index);
    setManual({ minutes: m, energy });
  };
  const setEnergy = (e: Energy) => {
    select(index);
    setManual({ minutes, energy: e });
  };

  return (
    <SectionShell id="how-it-works">
      <MacWindow title={demo.windowTitle} tone="sand">
        <div className={["grid", COL_SPLIT].join(" ")}>
          <div className="flex flex-col gap-8 bg-landing-sand/60 p-6 sm:p-8 md:p-10">
            <PanelLabel>{demo.checkIn}</PanelLabel>
            <Segment
              label={demo.timeLabel}
              value={minutes}
              options={demo.minutes.map((m) => ({ id: m, label: `${m} min` }))}
              onChange={setMinutes}
            />
            <Segment
              label={demo.energyLabel}
              value={energy}
              options={demo.energy}
              onChange={setEnergy}
            />
          </div>

          <div className="flex flex-col gap-5 border-t border-foreground/10 bg-landing-sky/70 p-6 sm:p-8 md:border-t-0 md:border-l md:p-10">
            <div className="flex items-center justify-between">
              <PanelLabel>{demo.pickLabel}</PanelLabel>
              <span className="text-xs text-muted-foreground">
                {demo.oneAction}
              </span>
            </div>

            <div
              aria-live="polite"
              className="relative min-h-48 overflow-hidden rounded-2xl border border-nocta-glow/25 bg-nocta-glow/8 p-5 sm:p-6"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={key}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="absolute inset-5 sm:inset-6"
                >
                  {pick ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <AreaTag>{demo.goal.area}</AreaTag>
                            <span className="truncate text-xs text-muted-foreground">
                              {demo.goal.title}
                            </span>
                          </div>
                          <p className="mt-3 text-lg leading-snug font-semibold text-foreground sm:text-xl">
                            {pick.step}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] text-muted-foreground">
                            {demo.scoreLabel}
                          </p>
                          <p className="text-3xl font-semibold text-foreground tabular-nums">
                            {demo.goal.score}
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                        <Info
                          aria-hidden
                          className="size-3.5 shrink-0 text-nocta-glow"
                        />
                        <span>
                          <span className="font-medium text-foreground">
                            {demo.whyLabel}:
                          </span>{" "}
                          {pick.reason}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Bed aria-hidden className="size-4 text-nocta-glow" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {demo.recovery.title}
                        </span>
                      </div>
                      <p className="mt-3 text-lg leading-snug font-semibold text-foreground sm:text-xl">
                        {demo.recovery.step}
                      </p>
                      <p className="mt-5 text-sm text-muted-foreground">
                        {demo.recovery.reason}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">{demo.alsoScored}</p>
              <ul className="mt-2 divide-y divide-foreground/10 rounded-xl border border-foreground/10 bg-nocta-paper">
                {demo.others.map((o) => (
                  <li
                    key={o.title}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <AreaTag>{o.area}</AreaTag>
                      <span className="truncate text-muted-foreground">
                        {o.title}
                      </span>
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {o.score}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </MacWindow>
    </SectionShell>
  );
}
