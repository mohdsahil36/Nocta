"use client";

import { Archive, Pencil, RotateCcw, Target } from "lucide-react";
import { cn } from "cn";

import { formatDeadline, isoToDeadlineInput } from "@/lib/dates";

import { goalsContent, type GoalDraft, type GoalStatus } from "../content";
import { PlanSteps } from "./plan-steps";

/* ─── helpers ──────────────────────────────────────────────────────────── */

function WeightDots({ weight, large = false }: { weight: number; large?: boolean }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Weight ${weight} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            "rounded-sm transition-colors",
            large ? "h-1.5 w-3" : "h-1 w-2",
            n <= weight
              ? "bg-primary"
              : "bg-neutral-200 dark:bg-neutral-700",
          )}
        />
      ))}
    </div>
  );
}

function DeadlineChip({ deadline, large = false }: { deadline: string; large?: boolean }) {
  if (!deadline) return null;
  const d = isoToDeadlineInput(deadline) || deadline;
  const label = formatDeadline(d);
  if (label === "No deadline") return null;

  const daysLeft = Math.floor((new Date(d).getTime() - Date.now()) / 86_400_000);
  const overdue = daysLeft < 0;
  const urgent  = daysLeft >= 0 && daysLeft < 7;
  const soon    = daysLeft >= 7 && daysLeft < 14;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono font-medium",
      large ? "text-[11px]" : "text-[10px]",
      overdue ? "bg-red-50 dark:bg-red-950/30 text-red-500"
      : urgent ? "bg-orange-50 dark:bg-orange-950/30 text-orange-500"
      : soon   ? "bg-amber-50 dark:bg-amber-950/30 text-amber-500"
      :          "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
    )}>
      {overdue && <span className="size-1 rounded-full bg-red-400 shrink-0" />}
      {label}
    </span>
  );
}

/* ─── detail panel ─────────────────────────────────────────────────────── */

function GoalDetail({
  goal,
  onEdit,
  onArchive,
  onActivate,
}: {
  goal: GoalDraft;
  onEdit: (g: GoalDraft) => void;
  onArchive: (g: GoalDraft) => void;
  onActivate: (g: GoalDraft) => void;
}) {
  const c = goalsContent.screen;
  const isArchived = goal.status === "archived";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-7 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn(
                "text-base font-semibold tracking-tight",
                isArchived
                  ? "text-neutral-400 dark:text-neutral-600"
                  : "text-neutral-950 dark:text-neutral-50",
              )}>
                {goal.name}
              </p>
              {isArchived && (
                <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400">
                  Archived
                </span>
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              <WeightDots weight={goal.weight} large />
              <DeadlineChip deadline={goal.deadline} large />
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(goal)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Pencil className="size-3" aria-hidden />
              {c.edit}
            </button>
            {isArchived ? (
              <button
                type="button"
                onClick={() => onActivate(goal)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs text-primary hover:bg-primary/12 transition-colors"
              >
                <RotateCcw className="size-3" aria-hidden />
                {c.activate}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onArchive(goal)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Archive className="size-3" aria-hidden />
                {c.archive}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Next action */}
      {goal.nextAction && (
        <div className="border-b border-neutral-100 dark:border-neutral-800 px-7 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 mb-2">
            Next action
          </p>
          <p className={cn(
            "text-sm leading-6",
            isArchived ? "text-neutral-400" : "text-neutral-700 dark:text-neutral-200",
          )}>
            {goal.nextAction}
          </p>
        </div>
      )}

      {/* Plan steps */}
      {!isArchived && goal.id && (
        <div className="flex-1 px-7 py-5 overflow-auto">
          <PlanSteps goalId={goal.id} />
        </div>
      )}
    </div>
  );
}

/* ─── empty detail placeholder ─────────────────────────────────────────── */

function EmptyDetail({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Target className="size-5 text-neutral-300 dark:text-neutral-600" aria-hidden />
      </div>
      <p className="text-sm text-neutral-500">{goalsContent.screen.emptyTitle}</p>
      <button
        type="button"
        onClick={onAdd}
        className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
      >
        {goalsContent.screen.emptyCta} →
      </button>
    </div>
  );
}

/* ─── main list ─────────────────────────────────────────────────────────── */

type Props = {
  goals: GoalDraft[];
  listFilter: GoalStatus;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (goal: GoalDraft) => void;
  onArchive: (goal: GoalDraft) => void;
  onActivate: (goal: GoalDraft) => void;
  onAdd: () => void;
};

export function GoalsList({
  goals,
  listFilter,
  selectedId,
  onSelect,
  onEdit,
  onArchive,
  onActivate,
  onAdd,
}: Props) {
  const filtered = goals.filter((g) =>
    listFilter === "active"
      ? (g.status ?? "active") === "active"
      : g.status === "archived",
  );

  const selected = filtered.find((g) => g.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="grid min-h-[540px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">

      {/* ── Left: slim list ── */}
      <div className="flex flex-col border-r border-neutral-100 dark:border-neutral-800">
        {filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm text-neutral-500">
              {listFilter === "active"
                ? goalsContent.screen.emptyTitle
                : goalsContent.screen.emptyArchivedTitle}
            </p>
            {listFilter === "active" && (
              <button
                type="button"
                onClick={onAdd}
                className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
              >
                {goalsContent.screen.emptyCta} →
              </button>
            )}
          </div>
        ) : (
          <ul className="flex flex-col py-1">
            {filtered.map((goal) => {
              const active = (selected?.id ?? null) === goal.id;
              return (
                <li key={goal.id ?? goal.name}>
                  <button
                    type="button"
                    onClick={() => goal.id && onSelect(goal.id)}
                    className={cn(
                      "w-full flex flex-col gap-1.5 px-4 py-3.5 text-left transition-colors",
                      active
                        ? "bg-primary/8 border-r-2 border-primary"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-900 border-r-2 border-transparent",
                    )}
                  >
                    <p className={cn(
                      "truncate text-[13px] font-medium leading-5",
                      active
                        ? "text-primary"
                        : "text-neutral-800 dark:text-neutral-200",
                    )}>
                      {goal.name}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <WeightDots weight={goal.weight} />
                      <DeadlineChip deadline={goal.deadline} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Right: detail ── */}
      <div className="min-h-[300px]">
        {selected ? (
          <GoalDetail
            goal={selected}
            onEdit={onEdit}
            onArchive={onArchive}
            onActivate={onActivate}
          />
        ) : (
          <EmptyDetail onAdd={onAdd} />
        )}
      </div>
    </div>
  );
}
