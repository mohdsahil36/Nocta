export type GoalStatus = "active" | "archived";

/** Draft shape matching backend Goal fields */
export type GoalDraft = {
  id?: string;
  name: string;
  weight: number;
  /** ISO date `YYYY-MM-DD` for the date input; empty = no deadline */
  deadline: string;
  nextAction: string;
  status?: GoalStatus;
};

export const emptyGoalDraft = (): GoalDraft => ({
  name: "",
  weight: 3,
  deadline: "",
  nextAction: "",
  status: "active",
});

/** Weight scale for goals — 1 least important, 5 most. */
export const GOAL_WEIGHTS = [1, 2, 3, 4, 5] as const;
export type GoalWeight = (typeof GOAL_WEIGHTS)[number];

export const goalsContent = {
  screen: {
    title: "Goals",
    body: "What you’re working on. Weight, deadline, and next action feed your score — AI never invents the list.",
    back: "Dashboard",
    add: "Add goal",
    emptyTitle: "No goals yet",
    emptyBody: "Add the work that matters. Priority comes from what you enter.",
    emptyCta: "Add your first goal",
    activeLabel: "Active",
    archivedLabel: "Archived",
    filterActive: "Active",
    filterArchived: "Archived",
    emptyArchivedTitle: "No archived goals",
    emptyArchivedBody: "Archive a goal when you’re done with it — it stays here if you need it again.",
    edit: "Edit",
    archive: "Archive",
    activate: "Set active",
    save: "Save goal",
    cancel: "Cancel",
    closeEditor: "Close",
    creating: "New goal",
    editing: "Edit goal",
    emptyResume:
      "You can add goals here anytime — your pick needs at least one.",
    loadError: "Couldn’t load goals.",
    retry: "Try again",
    saving: "Saving…",
    toastSaveSuccess: "Goal saved",
    toastSaveError: "Couldn’t save goal. Try again.",
    toastArchiveSuccess: "Goal archived",
    toastArchiveError: "Couldn’t archive goal. Try again.",
    toastActivateSuccess: "Goal set active",
    toastActivateError: "Couldn’t update goal. Try again.",
  },
  fields: {
    name: "Name",
    nameHint: "A PR, habit, or call you’ve been putting off",
    weight: "Weight",
    weightHint: "1 = least important · 5 = most important",
    weightOptions: [
      { value: 1, label: "1 — Least" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5 — Most" },
    ] as const,
    deadline: "Deadline",
    deadlineHint: "Optional",
    nextAction: "Next action",
    nextActionHint: "The smallest concrete step you already know",
  },
  onboarding: {
    title: "Start with the goals you already have",
    body: "Add several at once — a PR, a habit, a call you’ve been putting off. No fixed life buckets.",
    steps: [
      { id: "intro", label: "Welcome" },
      { id: "goals", label: "Your goals" },
      { id: "review", label: "Review" },
    ] as const,
    introCta: "Add your goals",
    next: "Continue",
    back: "Back",
    addAnother: "Add goal",
    removeGoal: "Remove",
    finish: "Finish",
    finishSaving: "Saving…",
    toastSuccess: "Goals saved",
    toastError: "Couldn’t save goals. Try again.",
    close: "Close setup",
    skip: "Skip for now",
    skipHint:
      "You can close anytime and add goals later from the Goals screen.",
    goalsHint:
      "Add the goals you already have. Continue when each one has a name and next action.",
    reviewEmpty: "Add at least one complete goal to continue.",
    reviewTitle: "Looking good",
    reviewBody: "Double-check the list. Finish when you’re ready.",
  },
};
