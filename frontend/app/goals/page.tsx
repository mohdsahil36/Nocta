"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

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
import useAuthStore from "@/app/store/authStore";
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

export default function GoalsPage() {
  const c = goalsContent.screen;
  const [listFilter, setListFilter] = useState<GoalStatus>("active");
  const [editor, setEditor] = useState<"closed" | "create" | "edit">("closed");
  const [draft, setDraft] = useState<GoalDraft>(emptyGoalDraft);
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();
  const authReady = useAuthStore((s) => s.ready);
  const userId = useAuthStore((s) => s.userId);

  const { data: goals = [], isLoading: goalsLoading, error, refetch } = useQuery({
    queryKey: ["goals", userId],
    enabled: authReady && !!userId,
    queryFn: async () => listAllGoals(userId!),
  });

  const isLoading = !authReady || (Boolean(userId) && goalsLoading);
  const signedOut = authReady && !userId;

  const activeCount   = goals.filter((g) => (g.status ?? "active") === "active").length;
  const archivedCount = goals.filter((g) => g.status === "archived").length;
  const overdueCount  = goals.filter((g) => {
    if ((g.status ?? "active") !== "active" || !g.deadline) return false;
    return new Date(g.deadline).getTime() < Date.now();
  }).length;

  const openCreate = () => { setDraft(emptyGoalDraft()); setEditor("create"); };
  const openEdit   = (goal: GoalDraft) => { setDraft({ ...goal }); setEditor("edit"); };
  const closeEditor = () => { setEditor("closed"); setDraft(emptyGoalDraft()); };

  const saveDraft = async () => {
    if (!draft.name.trim() || !draft.nextAction.trim() || saving) return;
    setSaving(true);
    try {
      if (editor === "create") {
        const uid = await getCurrentUserId();
        await createGoal(uid, { ...draft, status: "active" });
      } else if (editor === "edit" && draft.id) {
        await updateGoal(draft.id, draft);
      } else return;
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
    setSaving(true);
    try {
      await archiveGoalRequest(goal.id);
      queryClient.setQueryData<GoalDraft[]>(["goals"], (old = []) =>
        old.map((g) => g.id === goal.id ? { ...g, status: "archived" as const } : g),
      );
      if (activeCount <= 1) setListFilter("archived");
      if (draft.id === goal.id) closeEditor();
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.add({ title: c.toastArchiveSuccess, type: "success", timeout: 2200 });
    } catch {
      toast.add({ title: c.toastArchiveError, type: "error", timeout: 3200 });
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (goal: GoalDraft) => {
    if (!goal.id || saving) return;
    setSaving(true);
    try {
      await unarchiveGoalRequest(goal.id);
      queryClient.setQueryData<GoalDraft[]>(["goals"], (old = []) =>
        old.map((g) => g.id === goal.id ? { ...g, status: "active" as const } : g),
      );
      if (archivedCount <= 1) setListFilter("active");
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.add({ title: c.toastActivateSuccess, type: "success", timeout: 2200 });
    } catch {
      toast.add({ title: c.toastActivateError, type: "error", timeout: 3200 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex w-full flex-col gap-0">

      {/* ── Single card wrapping everything ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">

        {/* Top bar: title + add button */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-0.5">Workspace</p>
            <h1 className="text-lg font-semibold text-foreground leading-tight">{c.title}</h1>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
            <Plus className="size-3.5" aria-hidden />
            {c.add}
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 border-b border-border px-6 py-2.5">
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{activeCount}</span> active
          </span>
          {archivedCount > 0 && (
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{archivedCount}</span> archived
            </span>
          )}
          {overdueCount > 0 && (
            <span className="ml-auto font-mono text-[11px] text-red-500 tabular-nums">
              ⚠ {overdueCount} overdue
            </span>
          )}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <DeskLoader size="sm" label="Loading goals…" />
          </div>
        ) : signedOut || error ? (
          <div className="px-6 py-20 text-center">
            <p className="text-sm text-muted-foreground">{c.loadError}</p>
            <button type="button" onClick={() => void refetch()} className="mt-3 font-mono text-[11px] text-primary hover:underline underline-offset-4 cursor-pointer">
              {c.retry} →
            </button>
          </div>
        ) : (
          <GoalsList
            goals={goals}
            onEdit={openEdit}
            onArchive={(g) => void handleArchive(g)}
            onActivate={(g) => void handleActivate(g)}
            onAdd={openCreate}
          />
        )}
      </div>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={editor !== "closed"} onOpenChange={(open) => { if (!open) closeEditor(); }}>
        <DialogContent
          showCloseButton
          className="flex w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl rounded-2xl border border-border bg-card shadow-xl"
        >
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pr-12">
            <DialogTitle className="text-sm font-semibold tracking-tight text-foreground">
              {editor === "create" ? c.creating : c.editing}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {goalsContent.fields.name}
              </Label>
              <Input
                id="edit-name"
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder={goalsContent.fields.nameHint}
                className="h-9 rounded-lg shadow-none"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Weight */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-weight" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {goalsContent.fields.weight}
                </Label>
                <Select
                  value={String(draft.weight)}
                  onValueChange={(next) => {
                    const n = Number(next);
                    if (n >= 1 && n <= 5) setDraft((p) => ({ ...p, weight: n }));
                  }}
                >
                  <SelectTrigger id="edit-weight" className="h-9 w-full rounded-lg shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {goalsContent.fields.weightOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="font-mono text-[10px] text-muted-foreground">{goalsContent.fields.weightHint}</p>
              </div>

              {/* Deadline */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-deadline" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {goalsContent.fields.deadline}
                </Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={draft.deadline}
                  onChange={(e) => setDraft((p) => ({ ...p, deadline: e.target.value }))}
                  className="h-9 rounded-lg shadow-none"
                />
                <p className="font-mono text-[10px] text-muted-foreground">{goalsContent.fields.deadlineHint}</p>
              </div>
            </div>

            {/* Next action */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-next" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {goalsContent.fields.nextAction}
              </Label>
              <Input
                id="edit-next"
                value={draft.nextAction}
                onChange={(e) => setDraft((p) => ({ ...p, nextAction: e.target.value }))}
                placeholder={goalsContent.fields.nextActionHint}
                className="h-9 rounded-lg shadow-none"
                autoComplete="off"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={saving || !draft.name.trim() || !draft.nextAction.trim()}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                {saving ? c.saving : c.save}
              </button>
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                {c.cancel}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
