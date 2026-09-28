"use client";

import { motion, useReducedMotion } from "motion/react";
import { loginContent } from "../content";
import { easeOut } from "./motion";

/** Monumental ghost wordmark — sans only (no cursive). Soft fade into focus. */
export function FooterWordmark() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-36 items-center justify-center overflow-hidden sm:min-h-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-1/4 top-1/2 h-16 -translate-y-1/2 rounded-full bg-nocta-glow/10 blur-3xl"
      />
      <motion.p
        aria-hidden
        className="relative select-none font-sans text-[clamp(4rem,16vw,10rem)] leading-none font-semibold tracking-[-0.06em] text-foreground/10"
        initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(12px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.2, ease: easeOut }}
      >
        {loginContent.brand}
      </motion.p>
    </div>
  );
}
