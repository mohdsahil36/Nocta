"use client";

import type { MouseEvent } from "react";
import { loginContent } from "../content";
import { FRAME_PAD, Frame } from "./page-frame";

const LINK =
  "block text-[14px] tracking-tight text-neutral-400 transition-colors duration-150 hover:text-neutral-100";

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
 * Actuity-style black footer — evenly spaced columns + full-bleed brand wordmark.
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
    if (!onNavigate || !href.startsWith("#")) return;
    e.preventDefault();
    onNavigate(href.slice(1));
  };

  return (
    <footer
      id="site-footer"
      className="relative z-30 isolate overflow-hidden bg-neutral-950 text-neutral-100"
    >
      <Frame>
        <div
          className={[
            "relative z-10 grid grid-cols-2 gap-x-6 gap-y-10 pt-12 pb-8 sm:grid-cols-4 sm:gap-8 sm:pt-16 sm:pb-10",
            FRAME_PAD,
          ].join(" ")}
        >
          {cols.map((col) => (
            <div key={col.n} className="min-w-0 text-center sm:text-left">
              <p className="font-mono text-[11px] tracking-[0.14em] text-neutral-600">
                {col.n}
              </p>
              <ul className="mt-4 flex flex-col items-center gap-2.5 sm:items-start">
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
          ))}
        </div>
      </Frame>

      <div className="relative overflow-hidden pt-4">
        <Frame>
          <div
            className={["relative z-10 pb-2 text-center", FRAME_PAD].join(" ")}
          >
            <p className="text-[11px] tracking-tight text-neutral-500">
              {f.copyright}
            </p>
          </div>
        </Frame>

        <p
          aria-hidden
          className="pointer-events-none relative z-[1] select-none pb-5 text-center font-sans text-[clamp(5.5rem,18vw,16rem)] leading-[0.82] font-black tracking-[-0.05em] whitespace-nowrap text-[#f4f4f2] lowercase sm:pb-7"
          style={{ marginBottom: "-0.04em" }}
        >
          {loginContent.brand.toLowerCase()}
        </p>
      </div>
    </footer>
  );
}
