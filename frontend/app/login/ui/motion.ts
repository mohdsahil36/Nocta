import type { Variants } from "motion/react";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: easeOut },
  },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.45 },
  },
};

export const sceneryReveal: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.15, ease: easeOut },
  },
};

export const navReveal: Variants = {
  hidden: { opacity: 0, y: -14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOut, delay: 0.2 },
  },
};

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: easeOut },
  },
};

/** Ghost wordmark — from nothing into soft focus */
export const watermarkReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(20px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.8,
      ease: easeOut,
      delay: 0.25,
      opacity: { duration: 2, ease: easeOut, delay: 0.15 },
      filter: { duration: 2.1, ease: easeOut, delay: 0.1 },
    },
  },
};

export const SHELL = "mx-auto w-full max-w-xl px-4 sm:max-w-2xl sm:px-6";
