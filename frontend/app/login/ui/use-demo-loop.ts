"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Auto-advance through demo options. Manual interaction pauses the loop
 * so the visitor can take over without fighting the animation.
 * `intervalMs` is the dwell per option — pair with a progress bar of the same duration.
 */
export function useDemoLoop(length: number, intervalMs: number) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const enabled = reduceMotion !== true && !paused && length > 1;

  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => {
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => window.clearTimeout(id);
  }, [enabled, intervalMs, length, index]);

  const pause = () => setPaused(true);

  const select = (next: number) => {
    setPaused(true);
    setIndex(next);
  };

  return {
    index,
    setIndex,
    paused,
    pause,
    select,
    reduceMotion,
    intervalMs,
    /** True while auto-advance is running — drive a section progress bar. */
    running: enabled,
  } as const;
}
