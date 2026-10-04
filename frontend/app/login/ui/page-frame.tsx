/** Primary column — vertical rails mark this edge. */
export const FRAME_MAX = "max-w-[1080px]";
/** Breakout column — wide hero headline only. */
export const FRAME_MAX_WIDE = "max-w-[1280px]";

export const FRAME_PAD = "px-6 md:px-10";

type FrameProps = {
  children: React.ReactNode;
  className?: string;
  /** Wider than the rail column (wide hero only). */
  wide?: boolean;
};

/** Centers content to the rail column (or the wide breakout). */
export function Frame({ children, className = "", wide = false }: FrameProps) {
  return (
    <div
      className={[
        "relative mx-auto w-full",
        wide ? FRAME_MAX_WIDE : FRAME_MAX,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * Vertical hairlines at the 1080px column edges.
 * Must live inside a `relative overflow-hidden` band that does **not**
 * include the footer — absolute inset lines cannot escape that box.
 */
export function PageFrameRails({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-y-0 left-1/2 z-0 w-full -translate-x-1/2",
        FRAME_MAX,
        className,
      ].join(" ")}
    >
      <div className="absolute inset-y-0 left-0 w-px bg-foreground/5" />
      <div className="absolute inset-y-0 right-0 w-px bg-foreground/5" />
    </div>
  );
}
