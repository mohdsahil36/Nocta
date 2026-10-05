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
 * App shell — edge-flush chrome (Blueprint desk). Pin / hover unchanged.
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
      className="relative flex min-h-svh w-full bg-nocta-canvas text-nocta-ink"
      initial={playEnter ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.25,
        ease: authEaseOut,
        delay: playEnter ? 0.02 : 0,
      }}
    >
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

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <DashboardNavbar
          sidebarPinned={pinned}
          onOpenSidebar={() => {
            suppressHoverRef.current = false;
            setPinned(true);
            setHoverExpand(false);
          }}
        />
        <main className="flex-1 overflow-auto px-3 py-3 sm:px-4 sm:py-4">
          {children}
        </main>
      </div>
    </motion.div>
  );
}
