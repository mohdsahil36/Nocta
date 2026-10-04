"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { loginContent } from "../content";
import { fadeUp, stagger } from "./motion";
import { FRAME_PAD, Frame } from "./page-frame";

type HeroProps = {
  reduceMotion: boolean | null;
  onOpenAuth: () => void;
  onHowItWorks: () => void;
};

/**
 * Same 1080 column as TRY IT / product (no vertical rails drawn here).
 * Headline + body/CTA row span the full frame — body left, buttons right.
 */
export function Hero({ reduceMotion, onOpenAuth, onHowItWorks }: HeroProps) {
  const c = loginContent.hero;
  return (
    <section id="top" className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--landing-sky)_80%,transparent),transparent_55%),radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--landing-peach)_70%,transparent),transparent_50%)]"
      />
      <Frame>
        <motion.div
          className={[
            "overflow-x-clip pt-24 pb-16 sm:pt-32 sm:pb-24",
            FRAME_PAD,
          ].join(" ")}
          variants={stagger}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
        >
          <h1 className="w-full min-h-[2.5em] font-sans text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.12] font-semibold tracking-[-0.035em] text-foreground sm:min-h-[2.25em]">
            {reduceMotion ? (
              c.headline
            ) : (
              <EncryptedText
                text={c.headline}
                playOnMount
                loop
                loopDelayMs={2800}
                revealDelayMs={32}
                flipDelayMs={42}
                className="max-w-full font-sans text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.12] font-semibold tracking-[-0.035em]"
                revealedClassName="text-foreground"
                encryptedClassName="text-[color-mix(in_oklab,oklch(0.58_0.11_45)_65%,var(--muted-foreground))] dark:text-[color-mix(in_oklab,oklch(0.78_0.1_55)_55%,var(--muted-foreground))]"
              />
            )}
          </h1>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex w-full flex-col gap-8 sm:mt-14 sm:flex-row sm:items-end sm:justify-between"
          >
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {c.body}
            </p>
            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:justify-end">
              <Button
                size="lg"
                className="h-11 rounded-full px-6 text-sm font-semibold"
                onClick={onOpenAuth}
              >
                {c.primaryCta}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="h-11 rounded-full px-6 text-sm font-semibold"
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
 * TRY IT strip — full-bleed peach wash; badge + copy stay on the 1080 rail.
 */
export function HeroTryIt() {
  const c = loginContent.hero;
  return (
    <div className="w-full bg-landing-peach/80">
      <Frame>
        <div
          className={[
            "flex flex-wrap items-center gap-3 py-4",
            FRAME_PAD,
          ].join(" ")}
        >
          <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-[10px] font-semibold tracking-[0.12em] text-background uppercase">
            {c.tryItLabel}
          </span>
          <p className="text-sm text-muted-foreground">{c.tryItHint}</p>
        </div>
      </Frame>
    </div>
  );
}
