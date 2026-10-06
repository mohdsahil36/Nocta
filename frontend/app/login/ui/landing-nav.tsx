"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { NoctaMark } from "@/components/ui/nocta-mark";
import { loginContent } from "../content";
import { navReveal } from "./motion";
import { FRAME_PAD, Frame } from "./page-frame";

type LandingNavProps = {
  scrolled?: boolean;
  reduceMotion: boolean | null;
  onHowItWorks: () => void;
  onFaq: () => void;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onToggleTheme: () => void;
};

/**
 * Landing nav — mark + wordmark; theme · Log in · Get started.
 */
export function LandingNav({
  reduceMotion,
  onHowItWorks,
  onFaq,
  onOpenAuth,
  onToggleTheme,
}: LandingNavProps) {
  return (
    <motion.header
      className={[
        "sticky top-0 z-50 w-full border-b border-border/70",
        "bg-nocta-paper/90 backdrop-blur-xl supports-backdrop-filter:bg-nocta-paper/80",
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
            className="flex min-w-0 items-center gap-2 font-sans text-base font-semibold tracking-[-0.02em] text-foreground"
          >
            <NoctaMark className="size-4 shrink-0 text-primary" />
            <span className="truncate">{loginContent.brand}</span>
          </a>

          <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden cursor-pointer rounded-md px-3 text-muted-foreground hover:bg-muted/60 hover:text-foreground md:inline-flex"
              onClick={onHowItWorks}
            >
              {loginContent.nav.howItWorks}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden cursor-pointer rounded-md px-3 text-muted-foreground hover:bg-muted/60 hover:text-foreground md:inline-flex"
              onClick={onFaq}
            >
              {loginContent.nav.faq}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 cursor-pointer rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              onClick={onToggleTheme}
              aria-label={loginContent.nav.theme}
              title={loginContent.nav.theme}
            >
              <Sun className="size-4 dark:hidden" />
              <Moon className="hidden size-4 dark:block" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-9 cursor-pointer rounded-md px-3 text-sm font-medium sm:inline-flex"
              onClick={() => onOpenAuth("login")}
            >
              {loginContent.nav.login}
            </Button>
            <Button
              size="sm"
              className="ml-0.5 h-9 cursor-pointer rounded-md px-3.5 text-sm font-semibold sm:ml-1"
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
