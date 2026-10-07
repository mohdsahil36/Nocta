"use client";

import { useEffect, useRef } from "react";
import { PanelLeft, Search } from "lucide-react";

import { ChromeButton } from "@/components/ui/chrome-button";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "cn";

import { dashboardContent } from "../content";

type DashboardNavbarProps = {
  sidebarPinned: boolean;
  onOpenSidebar: () => void;
};

const ICON_BTN = "size-8 rounded-sm";

function isSearchHotkey(event: KeyboardEvent) {
  if (event.key !== "k" && event.key !== "K") return false;
  return event.metaKey || event.ctrlKey;
}

/**
 * Blueprint-style top bar — search. Account / theme live in the sidebar footer.
 * ⌘K / Ctrl+K focuses search. Query handling deferred to v2.
 */
export function DashboardNavbar({
  sidebarPinned,
  onOpenSidebar,
}: DashboardNavbarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSearchHotkey(event)) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        target !== searchRef.current &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="nocta-navbar relative z-30 flex h-12 w-full shrink-0 items-center gap-3 px-3 tracking-tight sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {!sidebarPinned ? (
          <ChromeButton
            iconOnly
            className={cn("shrink-0", ICON_BTN)}
            aria-label={dashboardContent.actions.openSidebar}
            onClick={onOpenSidebar}
          >
            <AnimatedIcon
              icon={PanelLeft}
              className="size-3.5"
              preset="nudge"
              tone="neutral"
            />
          </ChromeButton>
        ) : null}

        <label
          className={cn(
            "hidden max-w-63 flex-1 items-center gap-2 rounded-sm sm:flex",
            "border border-border bg-background px-2.5 py-1.5 text-muted-foreground",
            "transition-[border-color,box-shadow] duration-150",
            "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
          )}
        >
          <Search className="size-3.5 shrink-0" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            name="nocta-app-search"
            autoComplete="off"
            spellCheck={false}
            placeholder={dashboardContent.navbar.searchPlaceholder}
            aria-label={dashboardContent.navbar.searchPlaceholder}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-[13px] leading-none text-nocta-ink outline-none",
              "placeholder:text-muted-foreground",
            )}
            // deferred to v2: wire query to in-app search / palette
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] leading-none text-muted-foreground">
            {dashboardContent.navbar.searchHint}
          </kbd>
        </label>
      </div>
    </header>
  );
}
