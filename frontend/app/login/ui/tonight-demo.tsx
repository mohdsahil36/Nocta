"use client";

import { useState } from "react";
import { Bed, Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { loginContent, type Energy, type Minutes } from "../content";
import { easeOut } from "./motion";
import { MacWindow } from "./mac-window";
import { AreaTag, COL_SPLIT, DeepDive, PanelLabel, SectionShell } from "./section";
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

type RailMeta = {
  rail?: boolean;
  railIndex?: string;
  railEyebrow?: string;
  railTitle?: string;
  railBody?: string;
};

/** Interactive check-in → one recommended action, inside a Mac window. */
export function TonightDemo({
  rail = false,
  railIndex,
  railEyebrow,
  railTitle,
  railBody,
}: RailMeta = {}) {
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

  const windowNode = (
    <MacWindow title={demo.windowTitle} tone={rail ? "paper" : "sand"}>
      {/* Mobile stacks check-in over pick — lock column mins so auto-loop doesn't reflow. */}
      <div className={["grid md:min-h-0", COL_SPLIT].join(" ")}>
        <div
          className={[
            rail
              ? "flex flex-col gap-5 p-4 sm:p-5"
              : "flex flex-col gap-8 p-6 sm:p-8 md:p-10",
            rail ? "bg-neutral-100/80 dark:bg-neutral-900/50" : "bg-landing-sand/60",
          ].join(" ")}
        >
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

        <div
          className={[
            rail
              ? "flex min-h-0 flex-col gap-4 border-t border-foreground/10 p-4 sm:p-5 md:border-t-0 md:border-l"
              : "flex min-h-120 flex-col gap-5 border-t border-foreground/10 p-6 sm:min-h-0 sm:p-8 md:border-t-0 md:border-l md:p-10",
            rail ? "bg-white dark:bg-neutral-950" : "bg-landing-sky/70",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <PanelLabel>{demo.pickLabel}</PanelLabel>
            <span className="text-xs text-muted-foreground">
              {demo.oneAction}
            </span>
          </div>

          <div
            aria-live="polite"
            className={[
              "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border",
              rail
                ? "border-neutral-200 bg-neutral-100/80 dark:border-neutral-700 dark:bg-neutral-900/60"
                : "border-nocta-glow/25 bg-nocta-glow/8",
            ].join(" ")}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={key}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="flex flex-1 flex-col gap-3 p-4 sm:p-5"
              >
                {pick ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <AreaTag>{demo.goal.area}</AreaTag>
                          <span className="text-xs text-muted-foreground">
                            {demo.goal.title}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] text-muted-foreground">
                          {demo.scoreLabel}
                        </p>
                        <p className="text-2xl leading-none font-semibold text-foreground tabular-nums sm:text-3xl">
                          {demo.goal.score}
                        </p>
                      </div>
                    </div>
                    <p className="text-base leading-snug font-semibold text-foreground sm:text-lg">
                      {pick.step}
                    </p>
                    <p className="mt-auto flex items-start gap-2 pt-1 text-sm leading-5 text-muted-foreground">
                      <Info
                        aria-hidden
                        className="mt-0.5 size-3.5 shrink-0 text-foreground/70"
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
                      <Bed aria-hidden className="size-4 text-foreground/70" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {demo.recovery.title}
                      </span>
                    </div>
                    <p className="text-base leading-snug font-semibold text-foreground sm:text-lg">
                      {demo.recovery.step}
                    </p>
                    <p className="mt-auto pt-1 text-sm leading-5 text-muted-foreground">
                      {demo.recovery.reason}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">{demo.alsoScored}</p>
            <ul className="mt-2 divide-y divide-foreground/10 rounded-sm border border-foreground/10 bg-nocta-paper">
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
  );

  if (rail) {
    return (
      <DeepDive
        index={railIndex ?? "01"}
        eyebrow={railEyebrow ?? loginContent.checkIn.eyebrow}
        title={railTitle ?? loginContent.checkIn.title}
        body={railBody ?? loginContent.checkIn.body}
        rail
      >
        {windowNode}
      </DeepDive>
    );
  }

  return <SectionShell id="try-it">{windowNode}</SectionShell>;
}
