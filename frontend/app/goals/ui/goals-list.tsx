"use client";

import { Archive, Pencil, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { formatDeadline } from "@/lib/dates";
import { cn } from "cn";

import { goalsContent, type GoalDraft, type GoalStatus } from "../content";

type GoalsListProps = {
  goals: GoalDraft[];
  /** Which status the list is showing */
  listFilter: GoalStatus;
  onEdit: (goal: GoalDraft) => void;
  onArchive: (goal: GoalDraft) => void;
  onActivate: (goal: GoalDraft) => void;
  /** Escape hatch when the active list is empty */
  onAdd?: () => void;
};

export function GoalsList({
  goals,
  listFilter,
  onEdit,
  onArchive,
  onActivate,
  onAdd,
}: GoalsListProps) {
  const c = goalsContent.screen;
  const visible = goals.filter(
    (g) => (g.status ?? "active") === listFilter,
  );

  if (visible.length === 0) {
    const isArchivedView = listFilter === "archived";
    return (
      <div className="px-5 py-8 sm:px-6">
        <p className="text-sm font-medium text-nocta-ink">
          {isArchivedView ? c.emptyArchivedTitle : c.emptyTitle}
        </p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {isArchivedView ? c.emptyArchivedBody : c.emptyBody}
        </p>
        {!isArchivedView ? (
          <>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {c.emptyResume}
            </p>
            {onAdd ? (
              <button
                type="button"
                onClick={onAdd}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "mt-4 h-8 rounded-md text-xs shadow-none",
                )}
              >
                {c.emptyCta}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {visible.map((goal) => {
        const archived = (goal.status ?? "active") === "archived";
        const key = goal.id ?? `${goal.name}-${goal.nextAction}`;
        return (
          <li
            key={key}
            className={cn(
              "flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6",
              archived && "opacity-80",
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-semibold tracking-tight",
                    archived ? "text-muted-foreground" : "text-nocta-ink",
                  )}
                >
                  {goal.name || "Untitled"}
                </p>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                    archived
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {archived ? c.archivedLabel : c.activeLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {goal.nextAction || "—"}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Weight {goal.weight}
                <span className="mx-1.5 text-border">·</span>
                {formatDeadline(goal.deadline)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(goal)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 gap-1.5 rounded-md text-xs shadow-none",
                )}
              >
                <Pencil className="size-3.5" aria-hidden />
                {c.edit}
              </button>
              {archived ? (
                <button
                  type="button"
                  onClick={() => onActivate(goal)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8 gap-1.5 rounded-md border-border/80 text-xs shadow-none",
                  )}
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  {c.activate}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onArchive(goal)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8 gap-1.5 rounded-md border-border/80 text-xs shadow-none",
                  )}
                >
                  <Archive className="size-3.5" aria-hidden />
                  {c.archive}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
