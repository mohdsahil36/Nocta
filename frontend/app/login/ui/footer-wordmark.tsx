"use client";

import { motion, useReducedMotion } from "motion/react";
import { loginContent } from "../content";
import { easeOut } from "./motion";

/** Monumental ghost wordmark — sans only (no cursive). Soft fade into focus. */
export function FooterWordmark() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-28 items-center justify-center overflow-hidden sm:min-h-36">
      <motion.p
        aria-hidden
        className="relative select-none font-sans text-[clamp(3.5rem,14vw,8.5rem)] leading-none font-semibold tracking-[-0.06em] text-foreground/6"
        initial={
          reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(12px)" }
        }
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.2, ease: easeOut }}
      >
        {loginContent.brand}
      </motion.p>
    </div>
  );
}
