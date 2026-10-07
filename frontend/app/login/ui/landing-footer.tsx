"use client";

import type { MouseEvent } from "react";
import { loginContent } from "../content";
import { FRAME_PAD, FRAME_MAX } from "./page-frame";

const LINK =
  "block text-[14px] tracking-tight text-neutral-500 transition-colors duration-150 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100";

type LandingFooterProps = {
  /** Lenis-aware smooth scroll (hash without #). */
  onNavigate?: (id: string) => void;
};

type FooterItem = {
  href: string;
  label: string;
  plain?: boolean;
};

/**
 * Landing footer — light paper + black type in light mode; black bar + light type in dark.
 * Columns span the rail edge-to-edge; wordmark stays full-bleed.
 */
export function LandingFooter({ onNavigate }: LandingFooterProps) {
  const f = loginContent.footer;

  const cols: { n: string; items: FooterItem[] }[] = [
    {
      n: "01",
      items: [
        { href: "#how-it-works", label: loginContent.nav.howItWorks },
        { href: "#faq", label: loginContent.nav.faq },
        { href: "#close", label: loginContent.nav.cta },
      ],
    },
    {
      n: "02",
      items: [{ href: "#top", label: f.tagline, plain: true }],
    },
    {
      n: "03",
      items: [{ href: "#close", label: loginContent.close.trust }],
    },
    {
      n: "04",
      items: [
        { href: "#top", label: "Back to top" },
        { href: "#close", label: loginContent.nav.cta },
      ],
    },
  ];

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    e.stopPropagation();
    const id = href.slice(1);
    if (onNavigate) {
      onNavigate(id);
      return;
    }
    // Fallback if parent didn’t pass Lenis scroll
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <footer
      id="site-footer"
      className="relative z-30 isolate overflow-hidden border-t border-neutral-200 bg-neutral-50 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
    >
      <div
        className={[
          "relative z-10 mx-auto w-full",
          FRAME_MAX,
          FRAME_PAD,
          "pt-12 pb-8 sm:pt-16 sm:pb-10",
        ].join(" ")}
      >
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-10">
          {cols.map((col, i) => {
            const align =
              i === 0
                ? "items-start text-left"
                : i === cols.length - 1
                  ? "items-end text-right max-sm:items-start max-sm:text-left"
                  : "items-center text-center max-sm:items-start max-sm:text-left";

            return (
              <div
                key={col.n}
                className={["flex min-w-0 flex-col", align].join(" ")}
              >
                <p className="font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-600">
                  {col.n}
                </p>
                <ul
                  className={[
                    "mt-4 flex flex-col gap-2.5",
                    i === 0
                      ? "items-start"
                      : i === cols.length - 1
                        ? "items-end max-sm:items-start"
                        : "items-center max-sm:items-start",
                  ].join(" ")}
                >
                  {col.items.map((item) => (
                    <li key={`${col.n}-${item.label}`}>
                      {item.plain ? (
                        <span className={LINK}>{item.label}</span>
                      ) : (
                        <a
                          href={item.href}
                          className={LINK}
                          onClick={(e) => go(e, item.href)}
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden pt-4">
        <div
          className={[
            "relative z-10 mx-auto w-full pb-2 text-center",
            FRAME_MAX,
            FRAME_PAD,
          ].join(" ")}
        >
          <p className="text-[11px] tracking-tight text-neutral-400 dark:text-neutral-500">
            {f.copyright}
          </p>
        </div>

        <p
          aria-hidden
          className="pointer-events-none relative z-1 select-none pb-5 text-center font-sans text-[clamp(5.5rem,18vw,16rem)] leading-[0.82] font-black tracking-tighter whitespace-nowrap text-neutral-950 lowercase dark:text-[#f4f4f2] sm:pb-7"
          style={{ marginBottom: "-0.04em" }}
        >
          {loginContent.brand.toLowerCase()}
        </p>
      </div>
    </footer>
  );
}
