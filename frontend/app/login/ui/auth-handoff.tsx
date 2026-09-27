"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { authEaseOut } from "@/lib/auth-transition";
import { loginContent } from "../content";

type AuthHandoffProps = {
  open: boolean;
};

/** Full-bleed calm loader shown while auth resolves and the page hands off. */
export function AuthHandoff({ open }: AuthHandoffProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="auth-handoff"
          role="status"
          aria-live="polite"
          aria-label={loginContent.auth.handoff}
          className="fixed inset-0 z-100 flex items-center justify-center bg-nocta-paper/92 backdrop-blur-md dark:bg-nocta-canvas/92"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22, ease: authEaseOut }}
        >
          <div className="flex flex-col items-center gap-6 px-6">
            <div className="relative flex size-16 items-center justify-center">
              {/* Soft ambient wash */}
              <motion.span
                aria-hidden
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

              {/* Orbital track */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full border border-nocta-ink/10 dark:border-white/12"
              />

              {/* Sweeping arc */}
              <motion.span
                aria-hidden
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

              {/* Crescent moon */}
              <span
                aria-hidden
                className="relative size-7 overflow-hidden rounded-full bg-nocta-ink shadow-[0_0_20px_color-mix(in_oklab,var(--nocta-glow)_28%,transparent)] dark:bg-white"
              >
                <span className="absolute top-[-12%] right-[-18%] size-7 rounded-full bg-nocta-paper dark:bg-nocta-canvas" />
              </span>

              {/* Orbiting star */}
              {!reduceMotion ? (
                <motion.span
                  aria-hidden
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nocta-glow shadow-[0_0_10px_var(--nocta-glow)]" />
                </motion.span>
              ) : (
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nocta-glow"
                />
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="font-serif text-2xl tracking-[-0.03em] text-nocta-ink dark:text-foreground">
                {loginContent.brand}
              </p>
              <p className="text-sm text-muted-foreground">
                {loginContent.auth.handoff}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
