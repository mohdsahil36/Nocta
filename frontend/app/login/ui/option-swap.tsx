"use client";

import { Shuffle, Undo2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { loginContent } from "../content";
import { easeOut } from "./motion";
import { AreaTag, DeepDive, PanelLabel } from "./section";
import { useDemoLoop } from "./use-demo-loop";

/* 05 — card deck: auto-swaps through options; click pauses. */
export function OptionSwapSection() {
  const c = loginContent.swap;
  const { index, select, reduceMotion } = useDemoLoop(c.options.length, 3400);
  const option = c.options[index];
  const remaining = c.options.length - 1 - index;
  const isLast = remaining === 0;

  return (
    <DeepDive {...c} tone="lavender" layout="split">
      <div className="relative isolate mx-auto max-w-md pb-6">
        {Array.from({ length: remaining }, (_, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute inset-x-0 top-0 bottom-6 rounded-2xl border border-foreground/15 bg-nocta-paper shadow-sm transition-transform duration-300"
            style={{
              transform: `translateY(${(i + 1) * 12}px) scale(${1 - (i + 1) * 0.05})`,
              opacity: 1 - i * 0.35,
              zIndex: -i - 1,
            }}
          />
        ))}

        <div className="relative z-10 rounded-2xl border border-foreground/10 bg-nocta-paper p-5 shadow-md sm:p-6">
          <div className="flex items-center justify-between">
            <PanelLabel>
              {index === 0
                ? loginContent.demo.pickLabel
                : `${c.optionLabel} ${index + 1} ${c.of} ${c.options.length}`}
            </PanelLabel>
            <span className="text-xs text-muted-foreground tabular-nums">
              {option.minutes} min
            </span>
          </div>

          <div
            aria-live="polite"
            className="relative mt-4 min-h-28 overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={option.title}
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: easeOut }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <AreaTag>{option.area}</AreaTag>
                    <p className="mt-3 text-lg leading-snug font-semibold text-foreground">
                      {option.title}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    {option.score}
                  </p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{option.reason}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-foreground/10 pt-4">
            <span className="text-xs text-muted-foreground">
              {isLast ? c.exhausted : `${remaining} ${c.remaining}`}
            </span>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-4"
              onClick={() => select(isLast ? 0 : index + 1)}
            >
              {isLast ? (
                <Undo2 aria-hidden data-icon="inline-start" />
              ) : (
                <Shuffle aria-hidden data-icon="inline-start" />
              )}
              {isLast ? c.back : c.cta}
            </Button>
          </div>
        </div>
      </div>
    </DeepDive>
  );
}
