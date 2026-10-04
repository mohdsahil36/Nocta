"use client";

import { Moon } from "lucide-react";

import { loginContent } from "../content";
import { FooterLandscape } from "./footer-landscape";
import { FRAME_PAD, Frame } from "./page-frame";

const LINK =
  "text-[13px] tracking-tight text-foreground/70 transition-colors duration-150 hover:text-foreground";

/**
 * Minimal brand/nav chrome; most of the footer height is the dithered bg.
 */
export function LandingFooter() {
  return (
    <footer
      id="site-footer"
      className="relative z-30 isolate overflow-hidden bg-nocta-paper"
    >
      <Frame>
        <div
          className={[
            "relative z-10 grid gap-4 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:items-center sm:gap-8 sm:py-5",
            FRAME_PAD,
          ].join(" ")}
        >
          <div className="min-w-0 max-w-sm text-left">
            <a
              href="#top"
              className="inline-flex items-center gap-2 text-foreground transition-opacity duration-150 hover:opacity-80"
            >
              <span className="flex size-6 items-center justify-center rounded-sm bg-nocta-ink text-nocta-paper">
                <Moon className="size-3" aria-hidden />
              </span>
              <span className="font-sans text-sm font-semibold tracking-tight">
                {loginContent.brand}
              </span>
            </a>
            <p className="mt-1.5 text-xs leading-snug tracking-tight text-muted-foreground">
              {loginContent.footer.tagline}
            </p>
          </div>

          <nav
            className="grid grid-cols-2 gap-6 sm:justify-self-end sm:gap-10"
            aria-label="Footer"
          >
            <div>
              <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground/70 uppercase">
                {loginContent.footer.exploreLabel}
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                <li>
                  <a href="#how-it-works" className={LINK}>
                    {loginContent.nav.howItWorks}
                  </a>
                </li>
                <li>
                  <a href="#faq" className={LINK}>
                    {loginContent.nav.faq}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground/70 uppercase">
                {loginContent.footer.startLabel}
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                <li>
                  <a href="#close" className={LINK}>
                    {loginContent.nav.cta}
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </Frame>

      {/* Most of the (shorter) footer is landscape */}
      <div className="relative z-10 min-h-44 bg-landing-sky sm:min-h-52 md:min-h-60">
        <FooterLandscape />

        <Frame>
          <div
            className={[
              "relative z-10 flex flex-col gap-1.5 pt-1 pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-4",
              FRAME_PAD,
            ].join(" ")}
          >
            <p className="text-[11px] tracking-tight text-foreground/55">
              {loginContent.footer.copyright}
            </p>
            <p className="text-[11px] tracking-tight text-foreground/55">
              {loginContent.close.trust}
            </p>
          </div>
        </Frame>

        <a
          href="#top"
          aria-label="Back to top"
          className="absolute right-4 bottom-3 z-10 flex size-7 items-center justify-center rounded-full bg-nocta-ink text-[10px] font-semibold tracking-tight text-nocta-paper shadow-sm transition-transform duration-150 hover:scale-105 sm:right-6 sm:bottom-3.5"
        >
          N
        </a>
      </div>
    </footer>
  );
}
