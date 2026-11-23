"use client";

import { useState } from "react";
import { Archive, ChevronDown, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DeskLoader } from "@/components/ui/desk-loader";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "cn";

import { goalsContent } from "../content";
import {
  archivePlanStep,
  createPlanStep,
  deletePlanStep,
  listPlanSteps,
  type PlanStep,
  listArchivedPlanSteps,
  restorePlanStep,
} from "../functions/plan-steps";
import { generateGoalSyllabus, type SyllabusStep } from "../functions/syllabus";

const easeOut = [0.22, 1, 0.36, 1] as const;

function planKey(goalId: string) {
  return ["plan-steps", goalId] as const;
}

export function PlanSteps({ goalId }: { goalId: string }) {
  const c = goalsContent.plan;
  const reduceMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [preview, setPreview] = useState<SyllabusStep[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const {
    data: steps = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: planKey(goalId),
    enabled: Boolean(goalId),
    queryFn: () => listPlanSteps(goalId),
  });

  const {
    data: archivedSteps = [],
    isLoading: isLoadingArchived,
    // refetch: refetchArchived,
  } = useQuery({
    queryKey: ["plan-steps-archived", goalId],
    enabled: archivedOpen && Boolean(goalId),
    queryFn: () => listArchivedPlanSteps(goalId),
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
      void queryClient.invalidateQueries({
        queryKey: ["plan-steps-archived", goalId],
      });
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

  const restoreMutation = useMutation({
    mutationFn: (stepId: string) => restorePlanStep(goalId, stepId),
    onSuccess: (unarchived) => {
      queryClient.setQueryData<PlanStep[]>(
        ["plan-steps-archived", goalId],
        (old = []) => old.filter((step) => step.id !== unarchived.id),
      );
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
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

  const deleteMutation = useMutation({
    mutationFn: (stepId: string) => deletePlanStep(stepId),
    onSuccess: (deleted) => {
      queryClient.setQueryData<PlanStep[]>(
        ["plan-steps-archived", goalId],
        (old = []) => old.filter((s) => s.id !== deleted.id),
      );
      toast.add({ title: c.toastDeleteSuccess, type: "success", timeout: 2200 });
    },
    onError: () => {
      toast.add({ title: c.toastDeleteError, type: "error", timeout: 3200 });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateGoalSyllabus(goalId),
    onSuccess: (result) => {
      setPreview(result.steps);
      setSelected(new Set(result.steps.map((s) => s.title)));
    },
    onError: () => {
      toast.add({ title: c.toastGenerateError, type: "error", timeout: 3200 });
    },
  });

  const savePlanMutation = useMutation({
    mutationFn: async (toSave: SyllabusStep[]) => {
      for (let i = 0; i < toSave.length; i++) {
        await createPlanStep(goalId, {
          title: toSave[i].title,
          sortOrder: steps.length + i,
        });
      }
    },
    onSuccess: () => {
      setPreview(null);
      setSelected(new Set());
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
      toast.add({
        title: c.toastGenerateSuccess,
        type: "success",
        timeout: 2200,
      });
    },
    onError: () => {
      toast.add({ title: c.toastGenerateError, type: "error", timeout: 3200 });
    },
  });

  const clearAndRegenerateMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(steps.map((s) => archivePlanStep(s.id)));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKey(goalId) });
      generateMutation.mutate();
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

  const busy =
    addMutation.isPending ||
    archiveMutation.isPending ||
    restoreMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Plan steps
          </p>
          {steps.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary tabular-nums">
              {steps.length}
            </span>
          )}
        </div>
        {steps.length > 0 && !preview && (
          <button
            type="button"
            onClick={() => clearAndRegenerateMutation.mutate()}
            disabled={clearAndRegenerateMutation.isPending || generateMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {clearAndRegenerateMutation.isPending || generateMutation.isPending ? (
              <>
                <span className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                {c.generating}
              </>
            ) : (
              c.regeneratePlan
            )}
          </button>
        )}
        {steps.length === 0 && !preview && (
          <button
            type="button"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 font-mono text-[11px] text-primary transition-colors hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending ? (
              <>
                <span className="size-3 animate-spin rounded-full border border-primary border-t-transparent" />
                {c.generating}
              </>
            ) : (
              c.generatePlan
            )}
          </button>
        )}
      </div>

      {preview && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {c.generatedTitle}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {c.generatedBody}
            </p>
          </div>
          {preview.length === 0 ? (
            <p className="text-sm text-muted-foreground">{c.generatedEmpty}</p>
          ) : (
            <ol className="flex flex-col gap-1">
              {preview.map((step) => (
                <li
                  key={step.title}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={selected.has(step.title)}
                    onClick={() => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(step.title)) {
                          next.delete(step.title);
                        } else {
                          next.add(step.title);
                        }
                        return next;
                      });
                    }}
                    className="mt-1 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {step.title}
                      </p>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                        {step.level}
                      </span>
                    </div>
                    {step.subtopics && step.subtopics.length > 0 && (
                      <ul className="flex flex-col gap-0.5 pl-1">
                        {step.subtopics.map((sub) => (
                          <li key={sub} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                            {sub}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreview((prev) => prev?.filter((s) => s.title !== step.title) ?? null)}
                    className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                    title="Remove from plan"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const toSave = preview.filter((s) => selected.has(s.title));
                savePlanMutation.mutate(toSave);
              }}
              disabled={selected.size === 0 || savePlanMutation.isPending}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {savePlanMutation.isPending
                ? c.confirmGenerating
                : c.confirmGenerated}
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setSelected(new Set());
              }}
              disabled={savePlanMutation.isPending}
              className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {c.cancelGenerated}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <DeskLoader size="sm" label={c.loading} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted-foreground">{c.loadError}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="font-mono text-[11px] text-primary hover:underline underline-offset-4"
          >
            {c.retry}
          </button>
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">{c.empty}</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-1">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <span className="w-5 shrink-0 text-center font-mono text-[11px] font-medium text-primary tabular-nums">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm text-foreground leading-snug">
                {step.title}
              </p>
              <button
                type="button"
                onClick={() => archiveMutation.mutate(step.id)}
                disabled={busy}
                title={c.archive}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
              >
                <Archive className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addStep();
          }}
          placeholder={c.placeholder}
          aria-label={c.add}
          className="h-9 flex-1 rounded-lg border-border bg-muted/40 text-sm shadow-none placeholder:text-muted-foreground/50 focus-visible:bg-card"
          autoComplete="off"
          disabled={busy}
        />
        <button
          type="button"
          onClick={addStep}
          disabled={!title.trim() || busy}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={c.add}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>

      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setArchivedOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              archivedOpen && "rotate-180",
            )}
            aria-hidden
          />
          {c.filterArchived}
          {archivedSteps.length > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] tabular-nums">
              {archivedSteps.length}
            </span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {archivedOpen && (
            <motion.div
              key="archived"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.25, ease: easeOut }
              }
              className="overflow-hidden"
            >
              <div className="pt-3">
                <p className="mb-2 font-mono text-[10px] text-muted-foreground/60">
                  {c.archivedNotice}
                </p>
                {isLoadingArchived ? (
                  <div className="flex items-center justify-center py-6">
                    <DeskLoader size="sm" label={c.loading} />
                  </div>
                ) : archivedSteps.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {c.emptyArchived}
                  </p>
                ) : (
                  <ol className="flex flex-col gap-1">
                    {archivedSteps.map((step) => (
                      <li
                        key={step.id}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/40"
                      >
                        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                          {step.title}
                        </p>
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => restoreMutation.mutate(step.id)}
                            disabled={busy || deleteMutation.isPending}
                            title={c.restore}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
                          >
                            <RotateCcw className="size-3" aria-hidden />
                            {c.restore}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(step.id)}
                            disabled={busy || deleteMutation.isPending}
                            title={c.deleteStep}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed"
                          >
                            <Trash2 className="size-3" aria-hidden />
                            {c.deleteStep}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
