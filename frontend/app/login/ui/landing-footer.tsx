"use client";

import { NoctaMark } from "@/components/ui/nocta-mark";
import { loginContent } from "../content";

type LandingFooterProps = {
  onNavigate?: (id: string) => void;
};

const NAV_LINKS = [
  { label: "How it works", id: "how-it-works" },
  { label: "Goal scoring", id: "how-it-works" },
  { label: "Check-in", id: "how-it-works" },
  { label: "Recovery", id: "how-it-works" },
  { label: "FAQ", id: "faq" },
];

export function LandingFooter({ onNavigate }: LandingFooterProps) {
  const go = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    if (!id) return;
    if (onNavigate) { onNavigate(id); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">

        {/* Radial highlight */}
        <div aria-hidden className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(var(--primary)/0.08),transparent)]" />

        <div className="relative z-10">
          {/* Top section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8 px-8 pt-10 pb-8 sm:px-10">

            {/* Brand */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <NoctaMark className="size-4 text-neutral-950 dark:text-neutral-50" />
                <span className="font-mono text-[13px] font-semibold text-neutral-950 dark:text-neutral-50">
                  {loginContent.brand.toLowerCase()}
                </span>
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                  Beta
                </span>
              </div>
              <p className="mt-3 max-w-[200px] font-mono text-[12px] leading-5 text-neutral-400">
                One meaningful next action per check-in.
              </p>
              <div className="mt-5 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                  All systems operational
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap gap-x-8 gap-y-2.5 sm:justify-end">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={(e) => go(e, link.id)}
                  className="font-mono text-[12px] text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors cursor-pointer text-left"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Divider */}
          <div className="mx-8 sm:mx-10 border-t border-neutral-100 dark:border-neutral-800" />

          {/* Bottom bar + wordmark as one unit */}
          <div className="flex items-center justify-between px-8 sm:px-10 pt-3 pb-1">
            <p className="font-mono text-[11px] text-neutral-500">
              © 2026 Nocta
            </p>
            <button
              type="button"
              onClick={(e) => go(e, "top")}
              className="font-mono text-[11px] text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors cursor-pointer"
            >
              Back to top ↑
            </button>
          </div>

          {/* Wordmark */}
          <p
            aria-hidden
            className="pointer-events-none select-none px-4 pb-2 text-center font-sans text-[clamp(5rem,20vw,14rem)] leading-[0.85] font-black tracking-[-0.04em] text-neutral-950/[0.05] dark:text-neutral-50/[0.04] lowercase overflow-hidden"
          >
            {loginContent.brand.toLowerCase()}
          </p>
        </div>
      </div>
    </footer>
  );
}
