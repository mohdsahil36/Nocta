"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

import { loginContent } from "../content";
import { ScoringSection } from "./feature-sections";
import { OptionSwapSection } from "./option-swap";
import { FRAME_PAD, Frame } from "./page-frame";
import { TonightDemo } from "./tonight-demo";

type Panel = {
  key: string;
  stop: string;
  node: ReactNode;
};

/**
 * Actuity pin scroll:
 *   .pl-pin { height: 100vh + (n-1)*80vh }
 *   .pl-viewport { position: sticky; top: 0; height: 100vh; overflow: hidden }
 *   .pl-track { transform: translateX(...) } driven by vertical scroll
 *
 * Only three existing demos live in the pin. Others stay vertical on the page.
 */
export function PathSection() {
  const c = loginContent.path;
  const reduceMotion = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = c.steps;
  const panels: Panel[] = [
    {
      key: "check-in",
      stop: "Check in",
      node: (
        <TonightDemo
          rail
          railIndex={steps[0]!.num}
          railEyebrow={steps[0]!.label}
          railTitle={steps[0]!.title}
          railBody={steps[0]!.detail}
        />
      ),
    },
    {
      key: "score",
      stop: "Score",
      node: (
        <ScoringSection
          rail
          railIndex={steps[1]!.num}
          railEyebrow={steps[1]!.label}
          railTitle={steps[1]!.title}
          railBody={steps[1]!.detail}
        />
      ),
    },
    {
      key: "swap",
      stop: "Swap",
      node: (
        <OptionSwapSection
          rail
          railIndex="03"
          railEyebrow="Step 03 · Swap"
          railTitle={steps[3]!.title}
          railBody={steps[3]!.detail}
        />
      ),
    },
  ];

  const panelCount = panels.length;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 921px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!isDesktop || reduceMotion) return;

    const pin = pinRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!pin || !track || !viewport) return;

    let targetX = 0;
    let currentX = 0;
    let ticking = false;
    let rafScroll = 0;
    let rafSmooth = 0;

    const measureTravel = () =>
      Math.max(0, track.scrollWidth - viewport.clientWidth);

    const paint = () => {
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    };

    const smooth = () => {
      const delta = targetX - currentX;
      if (Math.abs(delta) < 0.4) {
        currentX = targetX;
        paint();
        ticking = false;
        return;
      }
      currentX += delta * 0.14;
      paint();
      rafSmooth = requestAnimationFrame(smooth);
    };

    const sync = () => {
      const pinTop = pin.offsetTop;
      const pinHeight = pin.offsetHeight;
      const viewH = window.innerHeight;
      const scrollable = Math.max(1, pinHeight - viewH);
      const raw = (window.scrollY - pinTop) / scrollable;
      const p = Math.min(1, Math.max(0, raw));

      targetX = -measureTravel() * p;
      setProgress(p);
      setActive(panelCount <= 1 ? 0 : Math.round(p * (panelCount - 1)));

      if (!ticking) {
        ticking = true;
        rafSmooth = requestAnimationFrame(smooth);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafScroll);
      rafScroll = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const ro = new ResizeObserver(onScroll);
    ro.observe(track);
    ro.observe(viewport);

    return () => {
      cancelAnimationFrame(rafScroll);
      cancelAnimationFrame(rafSmooth);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [isDesktop, reduceMotion, panelCount]);

  /** Actuity: 100vh + (n − 1) × 80vh */
  const pinHeight =
    panelCount <= 1
      ? "100vh"
      : `calc(100vh + ${panelCount - 1} * 80vh)`;

  const pinEnabled = isDesktop && reduceMotion !== true;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <Frame>
        <div
          className={[
            "mx-auto max-w-3xl pt-10 text-center sm:pt-12 md:pt-14",
            FRAME_PAD,
          ].join(" ")}
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
            <span className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-neutral-950 dark:bg-neutral-50" />
            {c.index} {c.eyebrow}
          </p>
          <h2 className="mt-3 font-sans text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.12] font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
            {c.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-500">
            {c.body}
          </p>
        </div>
      </Frame>

      {pinEnabled ? (
        <div ref={pinRef} className="relative mt-4" style={{ height: pinHeight }}>
          <div
            ref={viewportRef}
            className="sticky top-0 flex h-screen flex-col justify-center gap-4 overflow-hidden pt-12"
          >
            {/* Stepper — square stops, not pills */}
            <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-6">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {panels.map((panel, i) => {
                  const on = active === i;
                  return (
                    <span
                      key={panel.key}
                      className={[
                        "inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors duration-300 ease-out",
                        on
                          ? "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                          : "border-neutral-200 text-neutral-400 dark:border-neutral-800",
                      ].join(" ")}
                    >
                      <span className="tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{panel.stop}</span>
                    </span>
                  );
                })}
              </div>
              <div className="mx-auto h-px w-full max-w-md bg-neutral-200 dark:bg-neutral-800">
                <div
                  className="h-px origin-left bg-neutral-950 dark:bg-neutral-50"
                  style={{
                    transform: `scaleX(${progress})`,
                    transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
            </div>

            <div
              ref={trackRef}
              className="flex w-max gap-8 will-change-transform px-[max(1.5rem,calc((100vw-1120px)/2))]"
              style={{ transform: "translate3d(0,0,0)" }}
            >
              {panels.map((panel, i) => {
                /** Continuous focus from scroll progress — no hard snap. */
                const t = progress * Math.max(1, panelCount - 1);
                const dist = Math.abs(t - i);
                const focus = Math.max(0, 1 - dist);
                const opacity = 0.38 + focus * 0.62;
                const scale = 0.96 + focus * 0.04;
                const on = active === i;
                return (
                  <div
                    key={panel.key}
                    className={[
                      "box-border w-[min(1120px,calc(100vw-11.25rem))] shrink-0 rounded-sm border bg-white p-6 sm:p-7",
                      "dark:bg-neutral-950",
                      "transition-[border-color,box-shadow] duration-500 ease-out",
                      on
                        ? "border-neutral-900/25 dark:border-neutral-100/25"
                        : "border-neutral-200 dark:border-neutral-800",
                    ].join(" ")}
                    style={{
                      opacity,
                      transform: `scale(${scale})`,
                      transition:
                        "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1), border-color 420ms ease",
                    }}
                  >
                    {panel.node}
                  </div>
                );
              })}
            </div>

            <div
              className="flex items-center justify-center gap-3 text-[11px] tracking-[0.14em] text-neutral-400 uppercase"
              aria-hidden
            >
              <span>scroll</span>
              <span className="relative h-px w-16 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <i
                  className="absolute inset-y-0 left-0 w-full bg-neutral-950 dark:bg-neutral-50"
                  style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
                />
              </span>
              <span className="tabular-nums text-neutral-600 dark:text-neutral-300">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(panelCount).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4 px-4 pb-12 sm:px-6">
          {panels.map((panel) => (
            <div
              key={panel.key}
              className="rounded-sm border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
            >
              {panel.node}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
