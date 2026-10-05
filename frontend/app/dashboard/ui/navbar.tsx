"use client";

import { PanelLeft, Search } from "lucide-react";

import { ChromeButton } from "@/components/ui/chrome-button";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "cn";

import { dashboardContent } from "../content";
import { AccountMenu } from "./account-menu";

type DashboardNavbarProps = {
  sidebarPinned: boolean;
  onOpenSidebar: () => void;
};

const ICON_BTN = "size-8 rounded-md";

/**
 * Blueprint-style top bar — search + account menu (theme / log out).
 * Search is visual only until cmd-k ships (deferred to v2).
 */
export function DashboardNavbar({
  sidebarPinned,
  onOpenSidebar,
}: DashboardNavbarProps) {
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

        {/* deferred to v2: real cmd-k search — visual match only */}
        <div
          className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-muted-foreground sm:flex"
          title="Search coming soon"
        >
          <Search className="size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[13px]">
            {dashboardContent.navbar.searchPlaceholder}
          </span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] leading-none text-muted-foreground">
            {dashboardContent.navbar.searchHint}
          </kbd>
        </div>
      </div>

      <div className="relative flex shrink-0 items-center">
        <AccountMenu />
      </div>
    </header>
  );
}
