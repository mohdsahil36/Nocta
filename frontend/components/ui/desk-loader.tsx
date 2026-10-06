"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

const sizes = {
  sm: "size-5 border-2",
  md: "size-7 border-2",
  lg: "size-9 border-[2.5px]",
} as const;

export type DeskLoaderSize = keyof typeof sizes;

type DeskLoaderProps = {
  /**
   * `inline` — ring (+ optional label) in a panel.
   * `overlay` — full-bleed veil; gated by `open`.
   */
  variant?: "inline" | "overlay";
  /** Required for `overlay` — when false, nothing renders. */
  open?: boolean;
  size?: DeskLoaderSize;
  /** Calm status line under the ring (Outfit / muted). */
  label?: string;
  className?: string;
};

function subscribe() {
  return () => {};
}

/** True in the browser, false during SSR — no useEffect setState. */
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Shared loading UI — primary hairline ring, no brand moon / glow.
 * Overlay portals to `document.body` so chrome (sidebar) cannot stack above it.
 */
export function DeskLoader({
  variant = "inline",
  open = true,
  size = "md",
  label,
  className,
}: DeskLoaderProps) {
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const labelText = label ?? "Loading";

  const body = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 font-sans",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full border-muted border-t-primary",
          sizes[size],
          !reduceMotion && "animate-spin",
        )}
      />
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={labelText}
        className="flex items-center justify-center"
      >
        {body}
      </div>
    );
  }

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="desk-loader-overlay"
          role="status"
          aria-live="polite"
          aria-label={labelText}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-nocta-paper/92 dark:bg-nocta-canvas/92"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {body}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
