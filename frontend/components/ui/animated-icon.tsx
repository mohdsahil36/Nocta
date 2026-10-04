"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "cn";

export type IconMotionPreset =
  | "nudge"
  | "rise"
  | "tilt"
  | "spin"
  | "pulse"
  | "wiggle";

/** Accent family — theme tokens only. */
export type IconTone = "neutral" | "glow" | "warm" | "mint" | "danger";

type AnimatedIconProps = {
  icon: LucideIcon;
  /** Visual size classes — default matches sidebar nav. */
  className?: string;
  preset?: IconMotionPreset;
  /** Accent shade for the glyph (always on — not hover-gated). */
  tone?: IconTone;
  /**
   * When true (e.g. inverted active nav pill), keep `currentColor`
   * so the icon matches the chip instead of fighting it.
   */
  inheritColor?: boolean;
  /** Quiet idle loop when the control is selected / active. */
  active?: boolean;
};

type LoopPose = {
  x?: number[];
  y?: number[];
  rotate?: number[];
  scale?: number[];
};

const ACTIVE_LOOP: Record<IconMotionPreset, LoopPose> = {
  nudge: { scale: [1, 1.05, 1], x: [0, 1, 0] },
  rise: { y: [0, -1, 0], scale: [1, 1.04, 1] },
  tilt: { rotate: [0, -6, 0], scale: [1, 1.04, 1] },
  spin: { rotate: [0, 8, 0] },
  pulse: { scale: [1, 1.08, 1] },
  wiggle: { rotate: [0, 5, -5, 0] },
};

const REST = { x: 0, y: 0, rotate: 0, scale: 1 };

/** Glyph uses its accent shade at rest. */
const TONE_FG: Record<IconTone, string> = {
  neutral: "text-nocta-ink",
  glow: "text-nocta-glow",
  warm: "text-nocta-accent-warm",
  mint: "text-nocta-accent-mint",
  danger: "text-destructive",
};

/** Soft light chip wash behind the accent glyph. */
export const ICON_TONE_BG: Record<IconTone, string> = {
  neutral: "bg-[color-mix(in_oklab,var(--muted)_28%,white)]",
  glow: "bg-[color-mix(in_oklab,var(--nocta-glow)_14%,white)]",
  warm: "bg-[color-mix(in_oklab,var(--nocta-accent-warm)_14%,white)]",
  mint: "bg-[color-mix(in_oklab,var(--nocta-accent-mint)_14%,white)]",
  danger: "bg-[color-mix(in_oklab,var(--destructive)_12%,white)]",
};

/**
 * Lucide icon with accent shade + optional soft idle when `active`.
 * No hover motion / color flip. Honors reduced motion.
 */
export function AnimatedIcon({
  icon: Icon,
  className,
  preset = "rise",
  tone = "neutral",
  inheritColor = false,
  active = false,
}: AnimatedIconProps) {
  const reduceMotion = useReducedMotion();
  const colorClass = inheritColor ? "text-current" : TONE_FG[tone];

  const iconClass = cn("size-3.5 shrink-0", colorClass, className);

  if (reduceMotion || !active) {
    return <Icon className={iconClass} aria-hidden />;
  }

  return (
    <motion.span
      className="inline-flex origin-center"
      initial={false}
      animate={ACTIVE_LOOP[preset]}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className={iconClass} aria-hidden />
    </motion.span>
  );
}
