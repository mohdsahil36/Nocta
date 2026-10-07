"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Longer trip → longer animation (clamped), so footer → top doesn’t snap. */
function durationForDistance(distancePx: number) {
  return Math.min(2.6, Math.max(1.2, distancePx / 2200));
}

/** Lenis smooth scroll + modal scroll lock for the login landing page. */
export function usePageScroll(reduceMotion: boolean | null, authOpen: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("nocta-login-scroll");
    return () => {
      document.documentElement.classList.remove("nocta-login-scroll");
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
      syncTouch: false,
      // Nested dialog/form scroll must keep the wheel — don’t let Lenis steal it.
      prevent: (node) =>
        node.closest("[data-lenis-prevent]") != null ||
        node.closest("[data-slot=dialog-content]") != null,
    });
    lenisRef.current = lenis;

    const onScroll = (instance: Lenis) => {
      const next = instance.scroll > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    lenis.on("scroll", onScroll);

    let raf = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!reduceMotion) return;
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (authOpen) {
      lenis?.stop();
      document.documentElement.classList.add("overflow-hidden");
      document.body.classList.add("overflow-hidden");
    } else {
      lenis?.start();
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      lenis?.start();
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    };
  }, [authOpen]);

  const scrollToId = useCallback((id: string) => {
    const lenis = lenisRef.current;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (id === "top") {
      const current = lenis?.scroll ?? window.scrollY;
      if (lenis && !prefersReduced) {
        lenis.scrollTo(0, {
          immediate: false,
          force: true,
          lock: true,
          duration: durationForDistance(current),
          easing: easeOutCubic,
        });
        return;
      }
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    if (lenis && !prefersReduced) {
      const top = el.getBoundingClientRect().top + (lenis.scroll ?? 0);
      const distance = Math.abs((lenis.scroll ?? 0) - (top - 64));
      lenis.scrollTo(el, {
        offset: -64,
        immediate: false,
        force: true,
        lock: true,
        duration: durationForDistance(distance),
        easing: easeOutCubic,
      });
      return;
    }

    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return { scrolled, scrollToId };
}
