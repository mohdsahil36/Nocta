"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

const easeOut = [0.22, 1, 0.36, 1] as const;

const markSizes = {
  sm: { frame: "size-10", moon: "size-4", star: "size-1" },
  md: { frame: "size-16", moon: "size-7", star: "size-1.5" },
  lg: { frame: "size-20", moon: "size-9", star: "size-2" },
} as const;

export type NoctaLoaderSize = keyof typeof markSizes;

type NoctaLoaderMarkProps = {
  size?: NoctaLoaderSize;
  className?: string;
};

/** Crescent + orbit mark — use alone inside buttons, cards, or empty states. */
export function NoctaLoaderMark({
  size = "md",
  className,
}: NoctaLoaderMarkProps) {
  const reduceMotion = useReducedMotion();
  const s = markSizes[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        s.frame,
        className,
      )}
      aria-hidden
    >
      <motion.span
        className="absolute inset-[-18%] rounded-full bg-nocta-glow/15 blur-xl dark:bg-nocta-glow/20"
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.05, 0.92] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <span className="absolute inset-0 rounded-full border border-nocta-ink/10 dark:border-white/12" />

      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--nocta-glow) 55%, transparent) 70deg, transparent 110deg)",
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 1.35, repeat: Infinity, ease: "linear" }
        }
      />

      <span
        className={cn(
          "relative overflow-hidden rounded-full bg-nocta-ink shadow-[0_0_20px_color-mix(in_oklab,var(--nocta-glow)_28%,transparent)] dark:bg-white",
          s.moon,
        )}
      >
        <span
          className={cn(
            "absolute top-[-12%] right-[-18%] rounded-full bg-nocta-paper dark:bg-nocta-canvas",
            s.moon,
          )}
        />
      </span>

      {!reduceMotion ? (
        <motion.span
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        >
          <span
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nocta-glow shadow-[0_0_10px_var(--nocta-glow)]",
              s.star,
            )}
          />
        </motion.span>
      ) : (
        <span
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nocta-glow",
            s.star,
          )}
        />
      )}
    </div>
  );
}

type NoctaLoaderProps = {
  /**
   * `inline` — mark (+ optional copy) for panels / empty states.
   * `overlay` — full-bleed veil; gated by `open`.
   */
  variant?: "inline" | "overlay";
  /** Required for `overlay` — when false, nothing renders. */
  open?: boolean;
  size?: NoctaLoaderSize;
  title?: string;
  label?: string;
  className?: string;
};

/**
 * Shared Nocta loading UI.
 * - Inline: `<NoctaLoader label="Loading…" />`
 * - Overlay: `<NoctaLoader variant="overlay" open={isLoading} title="Nocta" label="…" />`
 * - Mark only: `<NoctaLoaderMark size="sm" />`
 */
export function NoctaLoader({
  variant = "inline",
  open = true,
  size = "md",
  title,
  label,
  className,
}: NoctaLoaderProps) {
  const reduceMotion = useReducedMotion();
  const labelText = label ?? title ?? "Loading";

  const body = (
    <div
      className={cn(
        "flex flex-col items-center gap-6 px-6",
        variant === "inline" && "gap-4 px-0",
        className,
      )}
    >
      <NoctaLoaderMark size={size} />
      {(title || label) && (
        <div className="flex flex-col items-center gap-1.5 text-center">
          {title ? (
            <p className="font-sans text-2xl tracking-[-0.03em] font-semibold text-nocta-ink dark:text-foreground">
              {title}
            </p>
          ) : null}
          {label ? (
            <p className="text-sm text-muted-foreground">{label}</p>
          ) : null}
        </div>
      )}
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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="nocta-loader-overlay"
          role="status"
          aria-live="polite"
          aria-label={labelText}
          className="fixed inset-0 z-100 flex items-center justify-center bg-nocta-paper/92 backdrop-blur-md dark:bg-nocta-canvas/92"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22, ease: easeOut }}
        >
          {body}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
