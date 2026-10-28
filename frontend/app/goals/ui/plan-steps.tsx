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
  listArchivedPlanSteps,
  restorePlanStep,
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

  const {
    data: archivedSteps = [],
    isLoading: isLoadingArchived,
    error: archivedError,
    refetch: refetchArchived,
  } = useQuery({
    queryKey: ["plan-steps-archived", goalId],
    enabled: open && Boolean(goalId),
    queryFn: () => listArchivedPlanSteps(goalId),
  });

  const addMutation = useMutation({
    mutationFn: (nextTitle: string) => {
      // figure out where the new step should go — put it at the end
      const sortOrder =
        steps.reduce((max, step) => Math.max(max, step.sortOrder), -1) + 1;
      return createPlanStep(goalId, { title: nextTitle, sortOrder });
    },
    onSuccess: (created) => {
      // empty the input box
      setTitle("");
      // add the new step to the list right away without waiting for a reload
      queryClient.setQueryData<PlanStep[]>(planKey(goalId), (old = []) => [
        ...old,
        created,
      ]);
      // reload the list from the server to make sure everything is in sync
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
      // show the user a success message
      toast.add({ title: c.toastAddSuccess, type: "success", timeout: 2200 });
    },
    onError: () => {
      // something went wrong — let the user know
      toast.add({ title: c.toastAddError, type: "error", timeout: 3200 });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (stepId: string) => archivePlanStep(stepId),
    onSuccess: (archived) => {
      // take the step off the active list straight away
      queryClient.setQueryData<PlanStep[]>(planKey(goalId), (old = []) =>
        old.filter((step) => step.id !== archived.id),
      );
      // reload the active list from the server to stay in sync
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
      // show the user a success message
      toast.add({
        title: c.toastArchiveSuccess,
        type: "success",
        timeout: 2200,
      });
    },
    onError: () => {
      // something went wrong — let the user know
      toast.add({ title: c.toastArchiveError, type: "error", timeout: 3200 });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (stepId: string) => restorePlanStep(stepId), // restore plan step returns status with and id inside unarchived
    onSuccess: (unarchived) => {
      // remove the restored step from the archived cache so it disappears from the archived column instantly
      // old is the current archived data which is present in the query client from useQuery for the plan steps archived key check line 49 onwards
      queryClient.setQueryData<PlanStep[]>(
        ["plan-steps-archived", goalId],
        (old = []) => old.filter((step) => step.id !== unarchived.id),
      );
      // refetch active steps so the restored step appears at the end of the active list
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
      // confirm to the user that the restore succeeded
      toast.add({
        title: c.toastRestoreSuccess,
        type: "success",
        timeout: 2200,
      });
    },
    onError: () => {
      toast.add({ title: c.toastRestoreError, type: "error", timeout: 3200 });
    },
  });

  const addStep = () => {
    const next = title.trim();
    if (!next || addMutation.isPending) return;
    addMutation.mutate(next);
  };

  const busy = addMutation.isPending || archiveMutation.isPending || restoreMutation.isPending;

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
                                buttonVariants({
                                  variant: "ghost",
                                  size: "sm",
                                }),
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
                      <span className="ml-2 font-normal">{archivedSteps.length}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {c.archivedNotice}
                    </p>
                    {isLoadingArchived ? (
                      <div className="mt-5 flex flex-1 items-center justify-center">
                        <DeskLoader size="sm" label={c.loading} />
                      </div>
                    ) : archivedError ? (
                      <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
                        <p className="text-sm text-muted-foreground">{c.loadError}</p>
                        <button
                          type="button"
                          onClick={() => void refetchArchived()}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "h-8 rounded-md text-xs shadow-none",
                          )}
                        >
                          {c.retry}
                        </button>
                      </div>
                    ) : archivedSteps.length === 0 ? (
                      <p className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        {c.emptyArchived}
                      </p>
                    ) : (
                      <ol className="mt-2 max-h-64 flex-1 space-y-0.5 overflow-y-auto">
                        {archivedSteps.map((step) => (
                          <li
                            key={step.id}
                            className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-card"
                          >
                            <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                              {step.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => restoreMutation.mutate(step.id)}
                              disabled={busy}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" }),
                                "h-8 shrink-0 gap-1.5 whitespace-nowrap rounded-md px-2 text-xs text-muted-foreground shadow-none hover:text-nocta-ink",
                              )}
                            >
                              {c.restore}
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
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
