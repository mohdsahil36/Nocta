import { cn } from "cn";

type NoctaMarkProps = {
  className?: string;
  /** Accessible name when the mark stands alone (omit if parent has aria-label). */
  title?: string;
};

/**
 * Nocta brand mark — crescent + single star (one action, night).
 * Prefer this over Lucide Moon in chrome.
 */
export function NoctaMark({ className, title }: NoctaMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className ?? "size-4")}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <path
        d="M14.85 3.2A9 9 0 1 0 20.8 15.15 7.4 7.4 0 0 1 14.85 3.2Z"
        fill="currentColor"
      />
      <circle cx="17.6" cy="5.4" r="1.35" fill="currentColor" />
    </svg>
  );
}
