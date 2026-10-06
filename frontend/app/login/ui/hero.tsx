"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { loginContent } from "../content";
import { fadeUp, stagger } from "./motion";
import { FRAME_PAD, Frame } from "./page-frame";

type HeroProps = {
  reduceMotion: boolean | null;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onHowItWorks: () => void;
};

const brandTypeSize =
  "text-[clamp(2.75rem,8vw,4.5rem)] leading-none font-semibold tracking-[-0.045em] text-left";

/** Type-in (~5 chars × 100ms) + hold before remount loop. */
const TYPEWRITER_LOOP_MS = 3200;

/**
 * Nocta desk hero — brand with looping TypewriterEffect (remount cycle).
 */
export function Hero({ reduceMotion, onOpenAuth, onHowItWorks }: HeroProps) {
  const c = loginContent.hero;
  const [typeCycle, setTypeCycle] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setTypeCycle((n) => n + 1);
    }, TYPEWRITER_LOOP_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section id="top" className="relative isolate scroll-mt-16">
      <div
        aria-hidden
        className="nocta-dusk-field pointer-events-none absolute inset-0"
      />

      <Frame className="relative z-10">
        <motion.div
          className={[
            "flex flex-col pt-12 pb-16 sm:pt-16 sm:pb-20",
            FRAME_PAD,
          ].join(" ")}
          variants={stagger}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
        >
          <motion.div variants={fadeUp} className="min-w-0 max-w-2xl">
            <p className="font-sans text-[11px] font-medium tracking-[0.16em] text-primary uppercase">
              {c.eyebrow}
            </p>

            <div className="mt-5 min-h-[1.05em] font-sans text-foreground">
              {reduceMotion ? (
                <p className={brandTypeSize}>{loginContent.brand}</p>
              ) : (
                <TypewriterEffect
                  key={typeCycle}
                  words={[
                    {
                      text: loginContent.brand,
                      className:
                        "font-sans font-semibold tracking-[-0.045em] text-foreground dark:text-foreground",
                    },
                  ]}
                  className={brandTypeSize}
                  cursorClassName="h-[0.85em] w-[3px] translate-y-[0.08em] rounded-sm bg-primary md:h-[0.85em] lg:h-[0.85em]"
                />
              )}
            </div>

            <h1 className="mt-4 max-w-xl font-sans text-[clamp(1.35rem,3.2vw,1.75rem)] leading-snug font-medium tracking-[-0.025em] text-foreground">
              {c.headline}
            </h1>

            <p className="mt-4 max-w-md font-sans text-base leading-relaxed text-muted-foreground sm:text-[15px]">
              {c.body}
            </p>

            <div className="mt-8 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-11 rounded-lg px-6 text-sm font-semibold"
                onClick={() => onOpenAuth("signup")}
              >
                {c.primaryCta}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-11 rounded-lg px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={onHowItWorks}
              >
                {c.secondaryCta}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </Frame>
    </section>
  );
}

/**
 * TRY IT — quiet ink rail into the demo.
 */
export function HeroTryIt() {
  const c = loginContent.hero;
  return (
    <div className="w-full border-y border-border bg-muted/30">
      <Frame>
        <div
          className={[
            "flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-4",
            FRAME_PAD,
          ].join(" ")}
        >
          <span className="inline-flex h-6 w-fit items-center rounded-md bg-primary px-2.5 text-[10px] font-semibold tracking-[0.14em] text-primary-foreground uppercase">
            {c.tryItLabel}
          </span>
          <p className="text-sm leading-snug text-muted-foreground">
            {c.tryItHint}
          </p>
        </div>
      </Frame>
    </div>
  );
}
