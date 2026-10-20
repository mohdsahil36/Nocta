"use client";

import { useState } from "react";
import { Archive, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { buttonVariants } from "@/components/ui/button";
import { DeskLoader } from "@/components/ui/desk-loader";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "cn";

import { goalsContent } from "../content";
import {
  archivePlanStep,
  createPlanStep,
  listPlanSteps,
  type PlanStep,
} from "../functions/plan-steps";

const easeOut = [0.22, 1, 0.36, 1] as const;

function planKey(goalId: string) {
  return ["plan-steps", goalId] as const;
}

/** Plan steps for one goal — list on open; add/archive persist. */
export function PlanSteps({ goalId }: { goalId: string }) {
  const c = goalsContent.plan;
  const reduceMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const {
    data: steps = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: planKey(goalId),
    enabled: open && Boolean(goalId),
    queryFn: () => listPlanSteps(goalId),
  });

  const addMutation = useMutation({
    mutationFn: (nextTitle: string) => {
      const sortOrder =
        steps.reduce((max, step) => Math.max(max, step.sortOrder), -1) + 1;
      return createPlanStep(goalId, { title: nextTitle, sortOrder });
    },
    onSuccess: (created) => {
      setTitle("");
      queryClient.setQueryData<PlanStep[]>(planKey(goalId), (old = []) => [
        ...old,
        created,
      ]);
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
      toast.add({ title: c.toastAddSuccess, type: "success", timeout: 2200 });
    },
    onError: () => {
      toast.add({ title: c.toastAddError, type: "error", timeout: 3200 });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (stepId: string) => archivePlanStep(stepId),
    onSuccess: (archived) => {
      queryClient.setQueryData<PlanStep[]>(planKey(goalId), (old = []) =>
        old.filter((step) => step.id !== archived.id),
      );
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
      toast.add({
        title: c.toastArchiveSuccess,
        type: "success",
        timeout: 2200,
      });
    },
    onError: () => {
      toast.add({ title: c.toastArchiveError, type: "error", timeout: 3200 });
    },
  });

  const addStep = () => {
    const next = title.trim();
    if (!next || addMutation.isPending) return;
    addMutation.mutate(next);
  };

  const busy = addMutation.isPending || archiveMutation.isPending;

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
            <div className="mt-3 rounded-lg border border-border bg-muted/40 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addStep();
                  }}
                  placeholder={c.placeholder}
                  aria-label={c.add}
                  className="h-10 min-w-0 flex-1 rounded-md border-transparent bg-card text-sm shadow-none placeholder:text-muted-foreground/45"
                  autoComplete="off"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={addStep}
                  disabled={!title.trim() || busy}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "h-10 shrink-0 rounded-md px-4 text-sm shadow-none",
                  )}
                >
                  {c.add}
                </button>
              </div>

              {isLoading ? (
                <div className="mt-5 flex min-h-44 items-center justify-center">
                  <DeskLoader size="sm" label={c.loading} />
                </div>
              ) : error ? (
                <div className="mt-5 flex min-h-44 flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-sm text-muted-foreground">{c.loadError}</p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-8 rounded-md text-xs shadow-none",
                    )}
                  >
                    {c.retry}
                  </button>
                </div>
              ) : (
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <section className="flex min-h-44 flex-col">
                    <p className="text-xs font-medium text-nocta-ink">
                      {c.filterActive}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {steps.length}
                      </span>
                    </p>
                    {steps.length === 0 ? (
                      <p className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        {c.empty}
                      </p>
                    ) : (
                      <ol className="mt-2 max-h-64 flex-1 space-y-0.5 overflow-y-auto">
                        {steps.map((step, index) => (
                          <li
                            key={step.id}
                            className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-card"
                          >
                            <span className="w-5 shrink-0 text-center text-xs font-medium text-primary tabular-nums">
                              {index + 1}
                            </span>
                            <p className="min-w-0 flex-1 truncate text-sm text-nocta-ink">
                              {step.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => archiveMutation.mutate(step.id)}
                              disabled={busy}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" }),
                                "h-8 shrink-0 gap-1.5 whitespace-nowrap rounded-md px-2 text-xs text-muted-foreground shadow-none hover:text-nocta-ink",
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

                  <section className="flex min-h-44 flex-col sm:border-l sm:border-border/70 sm:pl-6">
                    <p className="text-xs font-medium text-muted-foreground">
                      {c.filterArchived}
                      <span className="ml-2 font-normal">0</span>
                    </p>
                    <p className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                      {c.emptyArchived}
                    </p>
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
