"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { loginContent } from "../content";
import { fadeUp, stagger } from "./motion";
import { FRAME_PAD, Frame } from "./page-frame";

type HeroProps = {
  reduceMotion: boolean | null;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onHowItWorks: () => void;
};

/** Brand: lighter weight, larger size than the headline. */
const brandTypeSize =
  "text-[clamp(3.5rem,11vw,5.5rem)] leading-none font-medium tracking-[-0.055em]";

const headlineTypeSize =
  "text-[clamp(2.25rem,5.4vw,3rem)] leading-[1.15] font-semibold tracking-[-0.035em]";

/** Smooth wipe (~2.6s) then hold before a calm replay. */
const TYPEWRITER_DURATION_S = 2.6;
const TYPEWRITER_DELAY_S = 0.2;
const TYPEWRITER_HOLD_MS = 8000;
const TYPEWRITER_LOOP_MS = Math.ceil(
  (TYPEWRITER_DURATION_S + TYPEWRITER_DELAY_S) * 1000 + TYPEWRITER_HOLD_MS,
);

/**
 * Actuity-leaning B&W hero — brand first, smooth headline reveal.
 */
export function Hero({ reduceMotion, onOpenAuth, onHowItWorks }: HeroProps) {
  const c = loginContent.hero;
  const [typeCycle, setTypeCycle] = useState(0);

  const headlineWords = c.headline.split(/\s+/).map((text) => ({
    text,
    className:
      "font-sans font-semibold tracking-[-0.035em] text-neutral-950 dark:text-neutral-50",
  }));

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setTypeCycle((n) => n + 1);
    }, TYPEWRITER_LOOP_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[min(78svh,44rem)] scroll-mt-16 flex-col bg-white dark:bg-neutral-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(0 0 0 / 0.18) 0.55px, transparent 0.65px)",
          backgroundSize: "14px 14px",
        }}
      />

      <Frame className="relative z-10 flex flex-1 flex-col">
        <motion.div
          className={[
            "flex flex-1 flex-col items-center justify-center pt-16 pb-10 text-center sm:pt-20 sm:pb-14",
            FRAME_PAD,
          ].join(" ")}
          variants={stagger}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
        >
          <motion.div variants={fadeUp} className="min-w-0 max-w-3xl">
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] text-neutral-500 uppercase">
              ◇ {c.eyebrow}
            </p>

            <p
              className={[
                "mt-4 font-sans text-neutral-950 dark:text-neutral-50",
                brandTypeSize,
              ].join(" ")}
            >
              {loginContent.brand}
            </p>

            <h1 className="mt-5 flex min-h-[2.4em] justify-center px-1 font-sans text-neutral-950 dark:text-neutral-50">
              {reduceMotion ? (
                <span className={headlineTypeSize}>{c.headline}</span>
              ) : (
                <TypewriterEffectSmooth
                  key={typeCycle}
                  words={headlineWords}
                  className={headlineTypeSize}
                  duration={TYPEWRITER_DURATION_S}
                  delay={TYPEWRITER_DELAY_S}
                  cursorClassName="bg-neutral-950 dark:bg-neutral-50"
                />
              )}
            </h1>

            <p className="mx-auto mt-3 max-w-lg font-sans text-[15px] leading-relaxed text-neutral-500">
              {c.body}
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button
                size="lg"
                className="h-11 rounded-sm bg-neutral-950 px-6 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                onClick={() => onOpenAuth("signup")}
              >
                {c.primaryCta}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-11 rounded-sm px-4 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
                onClick={onHowItWorks}
              >
                {c.secondaryCta}
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <p
          className={[
            "pb-6 text-center text-[10px] font-medium tracking-[0.32em] text-neutral-400 uppercase",
            FRAME_PAD,
          ].join(" ")}
        >
          {c.scrollCue}
        </p>
      </Frame>
    </section>
  );
}

/** Optional rail — not used on the shortened landing. */
export function HeroTryIt() {
  const c = loginContent.hero;
  return (
    <div className="w-full border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <Frame>
        <div
          className={[
            "flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-4",
            FRAME_PAD,
          ].join(" ")}
        >
          <span className="inline-flex h-6 w-fit items-center rounded-sm bg-neutral-950 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-white uppercase dark:bg-neutral-50 dark:text-neutral-950">
            {c.tryItLabel}
          </span>
          <p className="text-sm leading-snug text-neutral-500">{c.tryItHint}</p>
        </div>
      </Frame>
    </div>
  );
}
