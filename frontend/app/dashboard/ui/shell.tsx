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
 * App shell — light canvas with a calm dotted grid (panels float above).
 * Pin / hover sidebar state unchanged.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const reduceMotion = useReducedMotion();
  const [fromAuth] = useState(() => consumeAuthEnter());
  const [pinned, setPinned] = useState(true);
  const [hoverExpand, setHoverExpand] = useState(false);
  const suppressHoverRef = useRef(false);
  const expanded = pinned || hoverExpand;

  const playEnter = fromAuth && !reduceMotion;

  return (
    <motion.div
      className="relative flex min-h-svh w-full gap-3 bg-nocta-canvas p-3 text-nocta-ink transition-[background-color,color] duration-300 ease-out sm:gap-3.5 sm:p-3.5"
      initial={playEnter ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: authEaseOut,
        delay: playEnter ? 0.04 : 0,
      }}
    >
      {/* Light-mode canvas texture — hidden in dark via CSS */}
      <div aria-hidden className="nocta-shell-dotgrid" />

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
          if (!pinned) setHoverExpand(false);
        }}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3 sm:gap-3.5">
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
