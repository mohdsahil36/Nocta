"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { authEaseOut, consumeAuthEnter } from "@/lib/auth-transition";

import { DashboardNavbar } from "./navbar";
import { DashboardSidebar } from "./sidebar";

type DashboardShellProps = {
  children: ReactNode;
};

/**
 * App shell — soft canvas + pastel wash so dashboard/activity match the landing.
 * Sidebar pin/hover behavior unchanged.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const reduceMotion = useReducedMotion();
  const [fromAuth] = useState(() => consumeAuthEnter());
  const [pinned, setPinned] = useState(false);
  const [hoverExpand, setHoverExpand] = useState(false);
  const suppressHoverRef = useRef(false);
  const expanded = pinned || hoverExpand;

  const playEnter = fromAuth && !reduceMotion;

  return (
    <motion.div
      className="relative flex min-h-svh w-full gap-2.5 bg-nocta-canvas p-2.5 text-nocta-ink transition-[background-color,color] duration-300 ease-out sm:gap-3 sm:p-3"
      initial={playEnter ? { opacity: 0, y: 12, filter: "blur(6px)" } : false}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.42,
        ease: authEaseOut,
        delay: playEnter ? 0.04 : 0,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--landing-sky)_70%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--landing-peach)_45%,transparent),transparent_50%)]"
      />

      <DashboardSidebar
        pinned={pinned}
        expanded={expanded}
        onPinClose={() => {
          suppressHoverRef.current = true;
          setPinned(false);
          setHoverExpand(false);
        }}
        onPinOpen={() => {
          suppressHoverRef.current = false;
          setPinned(true);
          setHoverExpand(false);
        }}
        onHoverExpandChange={(hovering) => {
          if (hovering) {
            if (suppressHoverRef.current || pinned) return;
            setHoverExpand(true);
            return;
          }
          suppressHoverRef.current = false;
          setHoverExpand(false);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-3">
        <DashboardNavbar
          sidebarPinned={pinned}
          onOpenSidebar={() => {
            suppressHoverRef.current = false;
            setPinned(true);
            setHoverExpand(false);
          }}
        />
        <main className="flex-1 px-0.5 pb-1 sm:px-1">{children}</main>
      </div>
    </motion.div>
  );
}
