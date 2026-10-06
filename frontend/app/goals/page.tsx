"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { buttonVariants } from "@/components/ui/button";
import { DeskLoader } from "@/components/ui/desk-loader";
import {
  Dialog,
  DialogContent,
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

import {
  emptyGoalDraft,
  goalsContent,
  type GoalDraft,
  type GoalStatus,
} from "./content";
import {
  archiveGoal as archiveGoalRequest,
  createGoal,
  getCurrentUserId,
  listAllGoals,
  unarchiveGoal as unarchiveGoalRequest,
  updateGoal,
} from "./functions/goals";
import { GoalsList } from "./ui/goals-list";

const inputClass =
  "h-9 rounded-md border-border/80 shadow-none placeholder:text-muted-foreground/45";

/**
 * Ongoing Goals desk — list via TanStack Query; create/edit share one Dialog.
 */
export default function GoalsPage() {
  const c = goalsContent.screen;
  const [listFilter, setListFilter] = useState<GoalStatus>("active");
  const [editor, setEditor] = useState<"closed" | "create" | "edit">("closed");
  const [draft, setDraft] = useState<GoalDraft>(emptyGoalDraft);
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient(); // helper to refresh or patch the cached list

  const {
    data: goals = [], // the shell for the data storing
    isLoading, // true while first load is happening
    error, // set when the load fails
    refetch, // run the load again (retry button)
  } = useQuery({
    queryKey: ["goals"], // label so we can find this data later
    queryFn: async () => {
      // how to load it
      const userId = await getCurrentUserId();
      return listAllGoals(userId);
    },
  });

  const openCreate = () => {
    setDraft(emptyGoalDraft());
    setEditor("create");
  };

  const openEdit = (goal: GoalDraft) => {
    setDraft({ ...goal });
    setEditor("edit");
  };

  const closeEditor = () => {
    setEditor("closed");
    setDraft(emptyGoalDraft());
  };

  const saveDraft = async () => {
    if (!draft.name.trim() || !draft.nextAction.trim() || saving) return;

    setSaving(true);
    try {
      if (editor === "create") {
        const userId = await getCurrentUserId();
        await createGoal(userId, { ...draft, status: "active" });
      } else if (editor === "edit" && draft.id) {
        await updateGoal(draft.id, draft);
      } else {
        return;
      }
      // tell tanstack this list is old so it loads again
      await queryClient.invalidateQueries({ queryKey: ["goals"] });
      closeEditor();
      toast.add({ title: c.toastSaveSuccess, type: "success", timeout: 2200 });
    } catch {
      toast.add({ title: c.toastSaveError, type: "error", timeout: 3200 });
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (goal: GoalDraft) => {
    if (!goal.id || saving) return;
    // count actives before the change — switch tab only if this was the last one
    const activeCount = goals.filter(
      (g) => (g.status ?? "active") === "active",
    ).length;
    setSaving(true);
    try {
      await archiveGoalRequest(goal.id);
      // patch cache now so the row moves without waiting on a refetch
      queryClient.setQueryData<GoalDraft[]>(["goals"], (old = []) =>
        old.map((g) =>
          g.id === goal.id ? { ...g, status: "archived" as const } : g,
        ),
      );
      if (activeCount <= 1) setListFilter("archived");
      if (draft.id === goal.id) closeEditor();
      void queryClient.invalidateQueries({ queryKey: ["goals"] }); // soft refresh in background
      toast.add({
        title: c.toastArchiveSuccess,
        type: "success",
        timeout: 2200,
      });
    } catch {
      toast.add({ title: c.toastArchiveError, type: "error", timeout: 3200 });
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (goal: GoalDraft) => {
    if (!goal.id || saving) return;
    // count archived before the change — switch tab only if this was the last one
    const archivedCount = goals.filter((g) => g.status === "archived").length;
    setSaving(true);
    try {
      await unarchiveGoalRequest(goal.id);
      // patch cache now so the row moves without waiting on a refetch
      queryClient.setQueryData<GoalDraft[]>(["goals"], (old = []) =>
        old.map((g) =>
          g.id === goal.id ? { ...g, status: "active" as const } : g,
        ),
      );
      if (archivedCount <= 1) setListFilter("active");
      void queryClient.invalidateQueries({ queryKey: ["goals"] }); // soft refresh in background
      toast.add({
        title: c.toastActivateSuccess,
        type: "success",
        timeout: 2200,
      });
    } catch {
      toast.add({ title: c.toastActivateError, type: "error", timeout: 3200 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="nocta-panel flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-nocta-ink"
          >
            <ArrowLeft className="size-3" aria-hidden />
            {c.back}
          </Link>
          <p className="mt-2 text-lg font-semibold tracking-tight text-nocta-ink sm:text-xl">
            {c.title}
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {c.body}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Goal status"
            className="flex items-center rounded-md border border-border bg-muted/40 p-0.5"
          >
            {(
              [
                { value: "active" as const, label: c.filterActive },
                { value: "archived" as const, label: c.filterArchived },
              ] as const
            ).map(({ value, label }) => {
              const selected = listFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setListFilter(value)}
                  className={cn(
                    "h-7 rounded-md px-2.5 text-xs shadow-none transition-colors",
                    selected
                      ? "bg-card font-medium text-nocta-ink"
                      : "text-muted-foreground hover:text-nocta-ink",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "h-8 rounded-md text-xs shadow-none",
            )}
          >
            {c.add}
          </button>
        </div>
      </div>

      {/* one dialog for Add and Edit — same shell, only draft changes */}
      <Dialog
        open={editor !== "closed"}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <DialogContent
          showCloseButton
          className={cn(
            "flex w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
            "rounded-xl border border-border bg-card text-nocta-ink shadow-none ring-1 ring-border",
          )}
        >
          <DialogHeader className="shrink-0 gap-1 border-b border-border px-5 py-4 pr-12 sm:px-6">
            <DialogTitle className="font-sans text-sm font-semibold tracking-tight text-nocta-ink">
              {editor === "create" ? c.creating : c.editing}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name" className="text-xs text-nocta-ink">
                {goalsContent.fields.name}
              </Label>
              <Input
                id="edit-name"
                value={draft.name}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={goalsContent.fields.nameHint}
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-weight" className="text-xs text-nocta-ink">
                  {goalsContent.fields.weight}
                </Label>
                <Select
                  value={String(draft.weight)}
                  onValueChange={(next) => {
                    if (next == null) return;
                    const n = Number(next);
                    if (n >= 1 && n <= 5) {
                      setDraft((prev) => ({ ...prev, weight: n }));
                    }
                  }}
                >
                  <SelectTrigger
                    id="edit-weight"
                    className={cn(
                      "h-9 w-full rounded-md border-border/80 shadow-none",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {goalsContent.fields.weightOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {goalsContent.fields.weightHint}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="edit-deadline"
                  className="text-xs text-nocta-ink"
                >
                  {goalsContent.fields.deadline}
                </Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={draft.deadline}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
                <p className="text-[11px] text-muted-foreground">
                  {goalsContent.fields.deadlineHint}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-next" className="text-xs text-nocta-ink">
                {goalsContent.fields.nextAction}
              </Label>
              <Input
                id="edit-next"
                value={draft.nextAction}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    nextAction: e.target.value,
                  }))
                }
                placeholder={goalsContent.fields.nextActionHint}
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={
                  saving || !draft.name.trim() || !draft.nextAction.trim()
                }
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "h-8 rounded-md text-xs shadow-none",
                )}
              >
                {saving ? c.saving : c.save}
              </button>
              <button
                type="button"
                onClick={closeEditor}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 rounded-md text-xs shadow-none",
                )}
              >
                {c.cancel}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="nocta-panel overflow-hidden">
        {isLoading ? (
          // still loading the list
          <div className="flex items-center justify-center px-5 py-10 sm:px-6">
            <DeskLoader size="sm" label="Loading goals…" />
          </div>
        ) : error ? (
          // load failed — button runs refetch
          <div className="px-5 py-8 text-center sm:px-6">
            <p className="text-sm text-muted-foreground">{c.loadError}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 h-8 rounded-md text-xs shadow-none",
              )}
            >
              {c.retry}
            </button>
          </div>
        ) : (
          <GoalsList
            goals={goals}
            listFilter={listFilter}
            onEdit={openEdit}
            onArchive={(goal) => void handleArchive(goal)}
            onActivate={(goal) => void handleActivate(goal)}
            onAdd={openCreate}
          />
        )}
      </div>
    </section>
  );
}
