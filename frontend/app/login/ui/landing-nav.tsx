"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { loginContent } from "../content";
import { navReveal } from "./motion";
import { FRAME_PAD, Frame } from "./page-frame";

type LandingNavProps = {
  scrolled: boolean;
  reduceMotion: boolean | null;
  onHowItWorks: () => void;
  onFaq: () => void;
  onOpenAuth: () => void;
  onToggleTheme: () => void;
};

/** Frosted glass nav across the full viewport; content aligned to the 1080 frame. */
export function LandingNav({
  scrolled,
  reduceMotion,
  onHowItWorks,
  onFaq,
  onOpenAuth,
  onToggleTheme,
}: LandingNavProps) {
  return (
    <motion.header
      className={[
        "sticky top-0 z-50 w-full border-b border-foreground/10",
        "bg-nocta-paper/65 backdrop-blur-2xl supports-backdrop-filter:bg-nocta-paper/50",
        scrolled ? "shadow-[0_8px_30px_color-mix(in_oklab,var(--foreground)_4%,transparent)]" : "",
      ].join(" ")}
      variants={navReveal}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
    >
      <Frame>
        <div
          className={[
            "flex h-14 w-full items-center justify-between gap-3 sm:h-16",
            FRAME_PAD,
          ].join(" ")}
        >
          <a
            href="#top"
            className="cursor-pointer font-sans text-base font-semibold tracking-[-0.02em] text-foreground sm:text-lg"
          >
            {loginContent.brand}
          </a>

          <nav className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden cursor-pointer rounded-md px-3 text-muted-foreground hover:bg-foreground/5 hover:text-foreground sm:inline-flex"
              onClick={onHowItWorks}
            >
              {loginContent.nav.howItWorks}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden cursor-pointer rounded-md px-3 text-muted-foreground hover:bg-foreground/5 hover:text-foreground sm:inline-flex"
              onClick={onFaq}
            >
              {loginContent.nav.faq}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 cursor-pointer rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              onClick={onToggleTheme}
              aria-label={loginContent.nav.theme}
              title={loginContent.nav.theme}
            >
              <Sun className="size-4 dark:hidden" />
              <Moon className="hidden size-4 dark:block" />
            </Button>
            <Button
              size="sm"
              className="ml-1 h-9 cursor-pointer rounded-full px-4 text-sm font-semibold"
              onClick={onOpenAuth}
            >
              {loginContent.nav.cta}
            </Button>
          </nav>
        </div>
      </Frame>
    </motion.header>
  );
}
