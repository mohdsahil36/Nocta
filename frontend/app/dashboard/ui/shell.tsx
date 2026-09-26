"use client";

import { useRef, useState, type ReactNode } from "react";

import { DashboardNavbar } from "./navbar";
import { DashboardSidebar } from "./sidebar";

type DashboardShellProps = {
  children: ReactNode;
};

/**
 * pinned = manual open/close.
 * hoverExpand = desktop peek only while pointer is over the sidebar hit area.
 * After close, hover peek is suppressed until the pointer leaves the rail
 * (otherwise the click leaves the cursor on the panel and it instantly reopens).
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const [pinned, setPinned] = useState(true);
  const [hoverExpand, setHoverExpand] = useState(false);
  const suppressHoverRef = useRef(false);
  const expanded = pinned || hoverExpand;

  return (
    <div className="relative flex min-h-svh w-full gap-2 bg-nocta-canvas p-2 text-nocta-ink transition-[background-color,color] duration-300 ease-out sm:gap-2.5 sm:p-2.5">
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

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5">
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
    </div>
  );
}
