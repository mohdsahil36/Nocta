/** Shared column width for landing rails + content alignment (time.fyi-inspired). */
export const FRAME_MAX = "max-w-[1080px]";

export const FRAME_PAD = "px-6 md:px-10";

/** Centers content to the same 1080px column the rails mark. */
export function Frame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={["relative mx-auto w-full", FRAME_MAX, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * Vertical hairlines at the 1080px column edges (full page height).
 * Horizontals are full-viewport and cross these rails.
 */
export function PageFrameRails({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-y-0 left-1/2 z-30 w-full -translate-x-1/2",
        FRAME_MAX,
        className,
      ].join(" ")}
    >
      <div className="absolute inset-y-0 left-0 w-px bg-foreground/10" />
      <div className="absolute inset-y-0 right-0 w-px bg-foreground/10" />
    </div>
  );
}
