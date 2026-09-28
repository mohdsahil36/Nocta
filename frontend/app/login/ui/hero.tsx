"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { loginContent } from "../content";
import { fadeUp, stagger } from "./motion";
import { FRAME_PAD, Frame } from "./page-frame";
import { FullRule } from "./section";

type HeroProps = {
  reduceMotion: boolean | null;
  onOpenAuth: () => void;
  onHowItWorks: () => void;
};

/**
 * Hero H1 uses EncryptedText (Aceternity) — subsections use TextGenerateEffect.
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
          className={["pt-24 pb-16 sm:pt-32 sm:pb-24", FRAME_PAD].join(" ")}
          variants={stagger}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
        >
          <h1 className="max-w-4xl font-sans text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.12] font-semibold tracking-[-0.035em] text-foreground">
            {reduceMotion ? (
              c.headline
            ) : (
              <EncryptedText
                text={c.headline}
                playOnMount
                revealDelayMs={32}
                flipDelayMs={42}
                className="font-sans text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.12] font-semibold tracking-[-0.035em]"
                revealedClassName="text-foreground"
                encryptedClassName="text-[color-mix(in_oklab,oklch(0.58_0.11_45)_65%,var(--muted-foreground))] dark:text-[color-mix(in_oklab,oklch(0.78_0.1_55)_55%,var(--muted-foreground))]"
              />
            )}
          </h1>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col gap-8 sm:mt-14 sm:flex-row sm:items-end sm:justify-between"
          >
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {c.body}
            </p>
            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
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

      <FullRule />
      <Frame>
        <div
          className={[
            "flex flex-wrap items-center gap-3 bg-landing-peach/80 py-4",
            FRAME_PAD,
          ].join(" ")}
        >
          <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-[10px] font-semibold tracking-[0.12em] text-background uppercase">
            {c.tryItLabel}
          </span>
          <p className="text-sm text-muted-foreground">{c.tryItHint}</p>
        </div>
      </Frame>
    </section>
  );
}
