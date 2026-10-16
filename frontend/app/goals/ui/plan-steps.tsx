"use client";

import { useState } from "react";
import { Archive, ChevronDown, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { goalsContent } from "../content";

type LocalStep = { id: string; title: string; archived: boolean };

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Layout only — steps stay in this row and are not saved. */
export function PlanSteps() {
  const c = goalsContent.plan;
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<LocalStep[]>([]);

  const addStep = () => {
    const next = title.trim();
    if (!next) return;
    setSteps((prev) => [
      ...prev,
      { id: `${prev.length}-${next}`, title: next, archived: false },
    ]);
    setTitle("");
    setOpen(true);
  };

  const activeSteps = steps.filter((step) => !step.archived);
  const archivedSteps = steps.filter((step) => step.archived);

  const setArchived = (id: string, archived: boolean) => {
    setSteps((prev) =>
      prev.map((item) => (item.id === id ? { ...item, archived } : item)),
    );
  };

  return (
    <div className="mt-4 w-full">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-nocta-ink"
      >
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
        {open ? c.close : c.open}
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="plan-steps"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.3, ease: easeOut }
            }
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addStep();
                  }}
                  placeholder={c.placeholder}
                  aria-label={c.add}
                  className="h-10 min-w-0 flex-1 rounded-md border-border/80 text-sm shadow-none placeholder:text-muted-foreground/45"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={addStep}
                  disabled={!title.trim()}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "h-10 shrink-0 rounded-md px-4 text-sm shadow-none",
                  )}
                >
                  {c.add}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <section className="flex min-h-40 flex-col rounded-md border border-border">
                  <p className="border-b border-border px-3 py-2 text-[11px] font-medium tracking-wide text-nocta-ink uppercase">
                    {c.filterActive}
                  </p>
                  {activeSteps.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                      {c.empty}
                    </p>
                  ) : (
                    <ol className="max-h-64 flex-1 divide-y divide-border overflow-y-auto">
                      {activeSteps.map((step, index) => (
                        <li
                          key={step.id}
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-nocta-ink tabular-nums">
                            {index + 1}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-sm text-nocta-ink">
                            {step.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => setArchived(step.id, true)}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "h-8 shrink-0 gap-1.5 whitespace-nowrap rounded-md px-2 text-xs text-muted-foreground shadow-none",
                            )}
                          >
                            <Archive className="size-3.5" aria-hidden />
                            {c.archive}
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                <section className="flex min-h-40 flex-col rounded-md border border-border bg-muted/30">
                  <p className="border-b border-border px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {c.filterArchived}
                  </p>
                  {archivedSteps.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                      {c.emptyArchived}
                    </p>
                  ) : (
                    <ol className="max-h-64 flex-1 divide-y divide-border overflow-y-auto">
                      {archivedSteps.map((step, index) => (
                        <li
                          key={step.id}
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-muted-foreground tabular-nums">
                            {index + 1}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                            {step.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => setArchived(step.id, false)}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "h-8 shrink-0 gap-1.5 whitespace-nowrap rounded-md px-2 text-xs text-muted-foreground shadow-none",
                            )}
                          >
                            <RotateCcw className="size-3.5" aria-hidden />
                            {c.restore}
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
