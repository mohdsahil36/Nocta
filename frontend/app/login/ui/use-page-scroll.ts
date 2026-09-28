"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

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

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(el, { offset: -64, duration: 1.2 });
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { scrolled, scrollToId };
}
