"use client";

import { useState } from "react";
import { ChevronDown, Info, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

import {
  dashboardContent,
  type CheckInEnergy,
  type CheckInMinutes,
} from "../content";

const EASE = [0.22, 1, 0.36, 1] as const;

type ChoiceProps<T extends string | number> = {
  label: string;
  value: T;
  options: readonly { id: T; label: string; hint: string }[];
  onChange: (next: T) => void;
};

/**
 * Blue-selection tiles — quiet idle border, primary wash when active.
 * Label + one hint. No checks, rings, or meters.
 */
function ChoiceGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: ChoiceProps<T>) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 grid grid-cols-3 gap-2"
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
              className={cn(
                "flex min-h-16 flex-col items-start justify-center gap-1 rounded-sm border-2 px-3 py-2.5 text-left outline-none transition-colors duration-150",
                "focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-card ring-1 ring-inset ring-border hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold tracking-tight",
                  active ? "text-nocta-ink" : "text-nocta-ink/85",
                )}
              >
                {o.label}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-snug",
                  active ? "text-primary/80" : "text-muted-foreground",
                )}
              >
                {o.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type CheckInSelection = {
  minutes: CheckInMinutes;
  energy: CheckInEnergy;
  revealed: boolean;
};

type CheckInPanelProps = {
  selection: CheckInSelection;
  onSelectionChange: (next: CheckInSelection) => void;
};

/** Desk check-in — large choices, clear primary action, pick hierarchy. */
export function CheckInPanel({
  selection,
  onSelectionChange,
}: CheckInPanelProps) {
  const c = dashboardContent.checkIn;
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.28;
  const { minutes, energy, revealed } = selection;
  const preview = c.preview;
  const [alsoOpen, setAlsoOpen] = useState(false);

  const setMinutes = (m: CheckInMinutes) =>
    onSelectionChange({ ...selection, minutes: m });
  const setEnergy = (e: CheckInEnergy) =>
    onSelectionChange({ ...selection, energy: e });
  const reveal = () => {
    setAlsoOpen(false);
    onSelectionChange({ ...selection, revealed: true });
  };
  const adjust = () => {
    setAlsoOpen(false);
    onSelectionChange({ ...selection, revealed: false });
  };

  const timeLabel =
    c.minutes.find((m) => m.id === minutes)?.label ?? `${minutes} min`;
  const energyLabel =
    c.energy.find((e) => e.id === energy)?.label ?? energy;
  const sessionChip = c.todaySummary(timeLabel, energyLabel);

  return (
    <div className="nocta-panel overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {!revealed ? (
          <motion.div
            key="form"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration, ease: EASE }}
            className="flex flex-col"
          >
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <p className="text-sm font-semibold tracking-tight text-nocta-ink">
                {c.title}
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {c.body}
              </p>
            </div>

            <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
              <ChoiceGroup
                label={c.timeLabel}
                value={minutes}
                options={c.minutes}
                onChange={setMinutes}
              />
              <ChoiceGroup
                label={c.energyLabel}
                value={energy}
                options={c.energy}
                onChange={setEnergy}
              />
            </div>

            <div className="border-t border-border px-5 py-4 sm:px-6">
              <Button
                type="button"
                className="h-10 w-full rounded-md text-sm shadow-none sm:h-9 sm:w-auto sm:min-w-44 sm:px-5"
                onClick={reveal}
              >
                {c.submit}
              </Button>
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                {c.submitHint}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pick"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration, ease: EASE }}
            className="flex flex-col"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5 sm:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {c.pickLabel}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {sessionChip}
                </p>
              </div>
              <button
                type="button"
                onClick={adjust}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground",
                  "outline-none transition-colors duration-150 hover:bg-muted hover:text-nocta-ink",
                  "focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                {c.adjust}
              </button>
            </div>

            <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
              <div>
                <p className="text-xl font-semibold tracking-tight text-nocta-ink sm:text-2xl">
                  {preview.nextAction}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span className="text-sm text-muted-foreground">
                    {preview.goalName}
                  </span>
                  <span
                    className="inline-flex items-center rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary"
                    aria-label={`${c.scoreLabel} ${preview.score}`}
                  >
                    {c.scoreLabel} {preview.score}
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-sm border border-border bg-muted/30 px-3.5 py-3">
                <Info
                  aria-hidden
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {c.whyLabel}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-nocta-ink/80">
                    {preview.why}
                  </p>
                </div>
              </div>

              <div className="rounded-sm border border-border">
                <button
                  type="button"
                  aria-expanded={alsoOpen}
                  onClick={() => setAlsoOpen((o) => !o)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left",
                    "outline-none transition-colors duration-150 hover:bg-muted/40",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50",
                  )}
                >
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {c.alsoScored}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-200",
                      !alsoOpen && "-rotate-90",
                    )}
                    aria-hidden
                  />
                </button>

                <AnimatePresence initial={false}>
                  {alsoOpen ? (
                    <motion.div
                      key="also"
                      initial={
                        reduceMotion
                          ? false
                          : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={
                        reduceMotion
                          ? undefined
                          : { height: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.28, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <ul className="divide-y divide-border border-t border-border">
                        {preview.others.map((o, i) => (
                          <motion.li
                            key={o.name}
                            initial={
                              reduceMotion
                                ? false
                                : { opacity: 0, y: 6 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: reduceMotion ? 0 : 0.2,
                              delay: reduceMotion ? 0 : i * 0.04,
                              ease: EASE,
                            }}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
                          >
                            <span className="truncate text-nocta-ink/80">
                              {o.name}
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              {o.score}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
