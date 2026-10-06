/** Date-input YYYY-MM-DD → ISO datetime for the API (empty → null). */
export function deadlineToIso(deadline: string): string | null {
  if (!deadline.trim()) return null;
  return new Date(`${deadline}T23:59:59.000Z`).toISOString();
}

/** API ISO / Date string → YYYY-MM-DD for `<input type="date">`. */
export function isoToDeadlineInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

/** YYYY-MM-DD → short locale label for list UI (empty → "No deadline"). */
export function formatDeadline(deadline: string): string {
  if (!deadline) return "No deadline";
  try {
    return new Date(`${deadline}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
}
