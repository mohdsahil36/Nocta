"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { NoctaMark } from "@/components/ui/nocta-mark";
import { NoctaThemeToggler } from "@/components/ui/nocta-theme-toggler";
import { loginContent } from "../content";
import { navReveal } from "./motion";
import { FRAME_PAD, Frame } from "./page-frame";

type LandingNavProps = {
  scrolled?: boolean;
  reduceMotion: boolean | null;
  onHowItWorks: () => void;
  onFaq: () => void;
  onOpenAuth: (mode?: "login" | "signup") => void;
};

/**
 * Landing nav — mark + wordmark; theme · Log in · Get started.
 */
export function LandingNav({
  reduceMotion,
  onHowItWorks,
  onFaq,
  onOpenAuth,
}: LandingNavProps) {
  return (
    <motion.header
      className={[
        "sticky top-0 z-50 w-full border-b border-neutral-200/80",
        "bg-white/90 backdrop-blur-xl supports-backdrop-filter:bg-white/80",
        "dark:border-neutral-800 dark:bg-neutral-950/90 dark:supports-backdrop-filter:bg-neutral-950/80",
      ].join(" ")}
      variants={navReveal}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
    >
      <Frame>
        <div
          className={[
            "flex h-14 w-full items-center justify-between gap-2 sm:gap-3",
            FRAME_PAD,
          ].join(" ")}
        >
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2 font-sans text-base font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50"
          >
            <NoctaMark className="size-4 shrink-0 text-neutral-950 dark:text-neutral-50" />
            <span className="truncate">{loginContent.brand.toLowerCase()}</span>
          </a>

          <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden cursor-pointer rounded-md px-3 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 md:inline-flex dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
              onClick={onHowItWorks}
            >
              {loginContent.nav.howItWorks}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden cursor-pointer rounded-md px-3 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 md:inline-flex dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
              onClick={onFaq}
            >
              {loginContent.nav.faq}
            </Button>
            <NoctaThemeToggler
              aria-label={loginContent.nav.theme}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-neutral-50 [&_svg]:size-4"
            />
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-9 cursor-pointer rounded-md px-3 text-sm font-medium text-neutral-700 sm:inline-flex dark:text-neutral-200"
              onClick={() => onOpenAuth("login")}
            >
              {loginContent.nav.login}
            </Button>
            <Button
              size="sm"
              className="ml-0.5 h-9 cursor-pointer rounded-lg bg-neutral-950 px-3.5 text-sm font-semibold text-white hover:bg-neutral-800 sm:ml-1 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
              onClick={() => onOpenAuth("signup")}
            >
              {loginContent.nav.cta}
            </Button>
          </nav>
        </div>
      </Frame>
    </motion.header>
  );
}
