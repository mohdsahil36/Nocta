"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { cn } from "cn";

import { emptyGoalDraft, goalsContent, type GoalDraft } from "../content";
import { createGoal, getCurrentUserId } from "../functions/goals";

const inputClass =
  "h-9 rounded-md border-border/80 shadow-none placeholder:text-muted-foreground/45";

type StepId = (typeof goalsContent.onboarding.steps)[number]["id"];

type GoalsOnboardingModalProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (goals: GoalDraft[]) => void;
  dismissHref?: string;
};

/** Empty goal row for the form. */
function emptyRow(): GoalDraft {
  return { ...emptyGoalDraft(), id: `local-${Date.now()}-${Math.random()}` };
}

/**
 * One state array (`goals`) holds every row.
 * Inputs write into that state. Finish POSTs each filled row.
 */
export function GoalsOnboardingModal({
  open,
  onOpenChange,
  onComplete,
  dismissHref = "/goals",
}: GoalsOnboardingModalProps) {
  const router = useRouter();
  const o = goalsContent.onboarding;
  const f = goalsContent.fields;

  const [step, setStep] = useState<StepId>("intro");
  // All goals live here until Finish
  const [goals, setGoals] = useState<GoalDraft[]>(() => [emptyRow()]);
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = o.steps.findIndex((s) => s.id === step);
  const canContinue =
    goals.length > 0 &&
    goals.every((g) => g.name.trim() && g.nextAction.trim());

  const dismiss = () => {
    onOpenChange?.(false);
    router.push(dismissHref);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      dismiss();
      return;
    }
    onOpenChange?.(true);
  };

  /** Write one field on one goal into state. */
  const setField = (
    id: string | undefined,
    field: keyof GoalDraft,
    value: string | number,
  ) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    );
  };

  const finish = async () => {
    // Keep only rows with name + next action
    const ready = goals.filter((g) => g.name.trim() && g.nextAction.trim());
    if (ready.length === 0 || submitting) return;

    setSubmitting(true);
    try {
      const userId = await getCurrentUserId();
      for (const goal of ready) {
        await createGoal(userId, goal);
      }
      onComplete?.(ready);
      onOpenChange?.(false);
      toast.add({ title: o.toastSuccess, type: "success", timeout: 2200 });
      router.push("/dashboard");
    } catch {
      toast.add({ title: o.toastError, type: "error", timeout: 3200 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-nocta-night/50 supports-backdrop-filter:backdrop-blur-sm"
        className={cn(
          "flex max-h-[min(42rem,92svh)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
          "rounded-xl border border-border bg-card text-nocta-ink shadow-none ring-1 ring-border",
        )}
      >
        <DialogHeader className="relative shrink-0 gap-3 border-b border-border px-5 py-4 pr-12 sm:px-6 sm:pr-14">
          <button
            type="button"
            onClick={dismiss}
            aria-label={o.close}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "absolute top-3.5 right-3.5 size-8 rounded-md text-muted-foreground shadow-none hover:text-nocta-ink",
            )}
          >
            <X className="size-4" aria-hidden />
          </button>

          <DialogTitle className="font-sans text-lg font-semibold tracking-tight text-nocta-ink">
            {o.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {o.body}
          </DialogDescription>

          <nav aria-label="Onboarding steps" className="pt-2">
            <ol className="grid grid-cols-3 gap-2">
              {o.steps.map((s, i) => {
                const active = s.id === step;
                const done = i < stepIndex;
                const isLast = i === o.steps.length - 1;
                return (
                  <li
                    key={s.id}
                    className="relative flex flex-col items-center gap-2"
                  >
                    {!isLast ? (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-3.5 left-[calc(50%+0.875rem)] right-[calc(-50%+0.875rem)] h-px",
                          done ? "bg-primary" : "bg-border",
                        )}
                      />
                    ) : null}
                    <span
                      className={cn(
                        "relative z-1 flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums transition-colors duration-150",
                        done &&
                          "border-primary bg-primary text-primary-foreground",
                        active &&
                          !done &&
                          "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                        !active &&
                          !done &&
                          "border-border bg-card text-muted-foreground",
                      )}
                      aria-current={active ? "step" : undefined}
                    >
                      {done ? (
                        <Check
                          className="size-3.5"
                          aria-hidden
                          strokeWidth={2.5}
                        />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-center text-[11px] font-medium tracking-tight",
                        (active || done) && "text-nocta-ink",
                        !active && !done && "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {step === "intro" ? (
            <p className="text-sm text-muted-foreground">{o.skipHint}</p>
          ) : null}

          {step === "goals" ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{o.goalsHint}</p>

              <ul className="flex flex-col gap-3">
                {goals.map((goal, index) => (
                  <li
                    key={goal.id}
                    className="rounded-lg border border-border/80 bg-background/50 px-4 py-4 sm:px-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                        Goal {index + 1}
                      </p>
                      {goals.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setGoals((prev) =>
                              prev.filter((g) => g.id !== goal.id),
                            )
                          }
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "h-7 gap-1 rounded-md px-2 text-xs text-muted-foreground shadow-none hover:text-nocta-ink",
                          )}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          {o.removeGoal}
                        </button>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor={`goal-${goal.id}-name`}
                          className="text-xs text-nocta-ink"
                        >
                          {f.name}
                        </Label>
                        <Input
                          id={`goal-${goal.id}-name`}
                          value={goal.name}
                          onChange={(e) =>
                            setField(goal.id, "name", e.target.value)
                          }
                          placeholder={f.nameHint}
                          className={inputClass}
                          autoComplete="off"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label
                            htmlFor={`goal-${goal.id}-weight`}
                            className="text-xs text-nocta-ink"
                          >
                            {f.weight}
                          </Label>
                          <Select
                            value={String(goal.weight)}
                            onValueChange={(v) => {
                              if (v == null) return;
                              setField(goal.id, "weight", Number(v));
                            }}
                          >
                            <SelectTrigger
                              id={`goal-${goal.id}-weight`}
                              className="h-9 w-full rounded-md border-border/80 shadow-none"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                              {f.weightOptions.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={String(opt.value)}
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label
                            htmlFor={`goal-${goal.id}-deadline`}
                            className="text-xs text-nocta-ink"
                          >
                            {f.deadline}
                          </Label>
                          <Input
                            id={`goal-${goal.id}-deadline`}
                            type="date"
                            value={goal.deadline}
                            onChange={(e) =>
                              setField(goal.id, "deadline", e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor={`goal-${goal.id}-next`}
                          className="text-xs text-nocta-ink"
                        >
                          {f.nextAction}
                        </Label>
                        <Input
                          id={`goal-${goal.id}-next`}
                          value={goal.nextAction}
                          onChange={(e) =>
                            setField(goal.id, "nextAction", e.target.value)
                          }
                          placeholder={f.nextActionHint}
                          className={inputClass}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setGoals((prev) => [...prev, emptyRow()])}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-9 w-full gap-1.5 rounded-md border-dashed border-border/80 text-xs shadow-none",
                )}
              >
                <Plus className="size-3.5" aria-hidden />
                {o.addAnother}
              </button>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold tracking-tight text-nocta-ink">
                  {o.reviewTitle}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {o.reviewBody}
                </p>
              </div>

              {goals.filter((g) => g.name.trim() && g.nextAction.trim())
                .length === 0 ? (
                <p className="text-sm text-muted-foreground">{o.reviewEmpty}</p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {goals
                    .filter((g) => g.name.trim() && g.nextAction.trim())
                    .map((g) => (
                      <li key={g.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-nocta-ink">
                          {g.name}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {g.nextAction}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Weight {g.weight}
                          {g.deadline ? ` · Due ${g.deadline}` : ""}
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3 sm:px-6">
          {step === "intro" ? (
            <>
              <button
                type="button"
                onClick={dismiss}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mr-auto h-8 rounded-md text-xs shadow-none",
                )}
              >
                {o.skip}
              </button>
              <button
                type="button"
                onClick={() => setStep("goals")}
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "h-9 rounded-md shadow-none",
                )}
              >
                {o.introCta}
              </button>
            </>
          ) : null}

          {step === "goals" ? (
            <>
              <button
                type="button"
                onClick={() => setStep("intro")}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mr-auto h-8 rounded-md text-xs shadow-none",
                )}
              >
                {o.back}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 rounded-md text-xs text-muted-foreground shadow-none",
                )}
              >
                {o.close}
              </button>
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep("review")}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "h-8 rounded-md text-xs shadow-none",
                )}
              >
                {o.next}
              </button>
            </>
          ) : null}

          {step === "review" ? (
            <>
              <button
                type="button"
                onClick={() => setStep("goals")}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mr-auto h-8 rounded-md text-xs shadow-none",
                )}
              >
                {o.back}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 rounded-md text-xs text-muted-foreground shadow-none",
                )}
              >
                {o.close}
              </button>
              <button
                type="button"
                disabled={!canContinue || submitting}
                onClick={() => void finish()}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "h-8 rounded-md text-xs shadow-none",
                )}
              >
                {submitting ? o.finishSaving : o.finish}
              </button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use GoalsOnboardingModal */
export function GoalsOnboarding() {
  return <GoalsOnboardingModal open onOpenChange={() => undefined} />;
}
