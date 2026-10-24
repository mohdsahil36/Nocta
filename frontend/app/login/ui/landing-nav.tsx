"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { NoctaMark } from "@/components/ui/nocta-mark";
import { NoctaThemeToggler } from "@/components/ui/nocta-theme-toggler";
import { loginContent } from "../content";
import { navReveal } from "./motion";

type LandingNavProps = {
  scrolled?: boolean;
  reduceMotion: boolean | null;
  onHowItWorks: () => void;
  onFaq: () => void;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onBackToTop?: () => void;
};

export function LandingNav({
  reduceMotion,
  onHowItWorks,
  onFaq,
  onOpenAuth,
  onBackToTop,
}: LandingNavProps) {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800"
      variants={navReveal}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
    >
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <a
          href="#top"
          className="flex items-center gap-2.5 group"
          onClick={(e) => { if (!onBackToTop) return; e.preventDefault(); onBackToTop(); }}
        >
          <NoctaMark className="size-4 shrink-0 text-neutral-950 dark:text-neutral-50 group-hover:text-primary transition-colors" />
          <span className="font-mono text-[0.8125rem] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-neutral-50">
            {loginContent.brand.toLowerCase()}
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full border border-primary/30 bg-primary/8 px-1.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-primary">
            Beta
          </span>
        </a>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-0">
          <button
            type="button"
            onClick={onHowItWorks}
            className="px-4 font-mono text-[0.75rem] font-medium text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={onFaq}
            className="px-4 font-mono text-[0.75rem] font-medium text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right auth */}
        <div className="flex items-center gap-2">
          <NoctaThemeToggler
            aria-label={loginContent.nav.theme}
            className="hidden sm:inline-flex size-8 cursor-pointer items-center justify-center text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors [&_svg]:size-3.5"
          />
          <button
            type="button"
            onClick={() => onOpenAuth("login")}
            className="hidden sm:block font-mono text-[0.75rem] font-medium text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors px-3 py-1.5 cursor-pointer"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth("signup")}
            className="rounded-md bg-primary px-3.5 py-1.5 font-mono text-[0.6875rem] font-semibold tracking-[0.04em] uppercase text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </motion.header>
  );
}
