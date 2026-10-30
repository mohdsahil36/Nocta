"use client";

import { useState } from "react";
import { Archive, ChevronRight, MoreHorizontal, Pencil, RotateCcw, Target } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

import { formatDeadline, isoToDeadlineInput } from "@/lib/dates";

import { goalsContent, type GoalDraft } from "../content";
import { PlanSteps } from "./plan-steps";

/* ─── importance config ────────────────────────────────────────────────── */

const IMPORTANCE: Record<number, { label: string; dot: string; badge: string }> = {
  5: { label: "Critical", dot: "bg-red-500",    badge: "text-red-500" },
  4: { label: "High",     dot: "bg-orange-400", badge: "text-orange-400" },
  3: { label: "Medium",   dot: "bg-amber-400",  badge: "text-amber-400" },
  2: { label: "Low",      dot: "bg-blue-400",   badge: "text-blue-400" },
  1: { label: "Minimal",  dot: "bg-muted-foreground/40", badge: "text-muted-foreground/60" },
};

/* ─── deadline chip ─────────────────────────────────────────────────────── */

function DeadlineChip({ deadline }: { deadline: string }) {
  if (!deadline) return null;
  const d = isoToDeadlineInput(deadline) || deadline;
  const label = formatDeadline(d);
  if (label === "No deadline") return null;

  const daysLeft = Math.floor((new Date(d).getTime() - Date.now()) / 86_400_000);
  const overdue = daysLeft < 0;
  const urgent  = daysLeft >= 0 && daysLeft < 7;

  return (
    <span className={cn(
      "font-mono text-[11px] tabular-nums whitespace-nowrap",
      overdue ? "text-red-500" : urgent ? "text-orange-400" : "text-muted-foreground",
    )}>
      {overdue && "⚠ "}{label}
    </span>
  );
}

/* ─── goal row ──────────────────────────────────────────────────────────── */

function GoalRow({
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
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const c = goalsContent.screen;
  const isArchived = goal.status === "archived";
  const imp = IMPORTANCE[goal.weight] ?? IMPORTANCE[1];

  return (
    <li className="border-b border-border last:border-0">
      <div
        className={cn(
          "group relative flex items-center gap-4 px-5 py-3.5 transition-colors",
          !isArchived && "cursor-pointer hover:bg-muted/25",
          expanded && "bg-muted/15",
        )}
        onClick={() => !isArchived && goal.id && setExpanded((v) => !v)}
      >
        <span className={cn("size-2 shrink-0 rounded-full", imp.dot)} title={imp.label} />

        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-sm font-medium leading-snug",
            isArchived ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground",
          )}>
            {goal.name}
          </p>
          {goal.nextAction && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
              {goal.nextAction}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <span className={cn("hidden md:block text-xs font-medium", imp.badge)}>{imp.label}</span>
          <DeadlineChip deadline={goal.deadline} />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-8 z-20 min-w-[130px] rounded-xl border border-border bg-popover py-1 shadow-lg"
                  >
                    <button type="button" onClick={() => { setMenuOpen(false); onEdit(goal); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                      <Pencil className="size-3.5 text-muted-foreground" /> {c.edit}
                    </button>
                    {isArchived ? (
                      <button type="button" onClick={() => { setMenuOpen(false); onActivate(goal); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors">
                        <RotateCcw className="size-3.5" /> {c.activate}
                      </button>
                    ) : (
                      <button type="button" onClick={() => { setMenuOpen(false); onArchive(goal); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                        <Archive className="size-3.5 text-muted-foreground" /> {c.archive}
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {!isArchived && (
            <ChevronRight className={cn("size-3.5 text-muted-foreground/40 transition-transform duration-200", expanded && "rotate-90")} aria-hidden />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && !isArchived && goal.id && (
          <motion.div
            key="steps"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 bg-muted/10 px-12 py-5">
              <PlanSteps goalId={goal.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ─── main ──────────────────────────────────────────────────────────────── */

type Props = {
  goals: GoalDraft[];
  onEdit: (goal: GoalDraft) => void;
  onArchive: (goal: GoalDraft) => void;
  onActivate: (goal: GoalDraft) => void;
  onAdd: () => void;
};

export function GoalsList({ goals, onEdit, onArchive, onActivate, onAdd }: Props) {
  const active   = goals.filter((g) => (g.status ?? "active") === "active");
  const archived = goals.filter((g) => g.status === "archived");

  if (active.length === 0 && archived.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Target className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{goalsContent.screen.emptyTitle}</p>
        <button type="button" onClick={onAdd} className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {goalsContent.screen.emptyCta}
        </button>
      </div>
    );
  }

  return (
    <ul>
      {active.map((goal) => (
        <GoalRow key={goal.id ?? goal.name} goal={goal} onEdit={onEdit} onArchive={onArchive} onActivate={onActivate} />
      ))}
      {archived.length > 0 && (
        <>
          <li className="flex items-center gap-3 px-5 py-2.5 border-y border-border bg-muted/20">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Archived · {archived.length}</span>
          </li>
          {archived.map((goal) => (
            <GoalRow key={goal.id ?? goal.name} goal={goal} onEdit={onEdit} onArchive={onArchive} onActivate={onActivate} />
          ))}
        </>
      )}
    </ul>
  );
}
