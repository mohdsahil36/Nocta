"use client";

import Link from "next/link";
import { useEffect, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Moon,
  PanelLeftClose,
  Pin,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "cn";
import { ChromeButton } from "@/components/ui/chrome-button";
import { dashboardContent } from "../content";

/** Collapsed rail = icon column. Must stay in sync. */
const ICON_COL = "3.5rem";
/** Full class strings — Tailwind won't emit `md:${var}` template classes. */
const EXPANDED_W = "w-[15.5rem] translate-x-0";
const COLLAPSED_W =
  "max-md:w-[15.5rem] max-md:-translate-x-[calc(100%+0.5rem)] md:w-14 md:translate-x-0";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: dashboardContent.nav.tonight,
    icon: Sparkles,
  },
  {
    href: "/dashboard#goals",
    label: dashboardContent.nav.goals,
    icon: Target,
  },
  {
    href: "/dashboard#reflect",
    label: dashboardContent.nav.reflect,
    icon: BookOpen,
  },
  {
    href: "/activity",
    label: dashboardContent.nav.activity,
    icon: Activity,
  },
];

type DashboardSidebarProps = {
  pinned: boolean;
  expanded: boolean;
  onPinClose: () => void;
  onPinOpen: () => void;
  onHoverExpandChange: (hovering: boolean) => void;
};

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href.startsWith("/dashboard#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Clip-expand sidebar. Every row is `icon-col | content` so a `w-14` clip
 * shows only centered icons. Shell suppresses hover-reopen right after close.
 */
export function DashboardSidebar({
  pinned,
  expanded,
  onPinClose,
  onPinOpen,
  onHoverExpandChange,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (!pinned || !mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pinned]);

  const startHover = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    onHoverExpandChange(true);
  };

  const endHover = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    onHoverExpandChange(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar backdrop"
        tabIndex={pinned ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-nocta-night/50 backdrop-blur-sm md:hidden",
          "transition-opacity duration-300 ease-out",
          pinned ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onPinClose}
      />

      {/* Reserves layout width — must animate with the panel or content jitters */}
      <div
        className={cn(
          "hidden shrink-0 transition-[width] duration-300 ease-out md:block",
          pinned ? "w-62" : "w-14",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "z-50",
          "fixed inset-y-2 left-2 md:absolute md:inset-y-2 md:left-2",
          "overflow-hidden transition-[width,transform] duration-300 ease-out",
          expanded ? EXPANDED_W : COLLAPSED_W,
          !pinned && expanded && "md:z-60",
        )}
        onMouseEnter={startHover}
        onMouseLeave={endHover}
      >
        <aside
          className={cn(
            "nocta-sidebar flex h-full min-h-[calc(100svh-1rem)] w-62 flex-col py-3 md:min-h-full",
            !pinned && expanded && "md:shadow-lg",
          )}
          data-collapsed={expanded ? undefined : "true"}
        >
          <div
            className="mb-4 grid items-center"
            style={{ gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)` }}
          >
            <div className="flex items-center justify-center">
              <Link
                href="/dashboard"
                className="flex size-8 items-center justify-center rounded-lg bg-nocta-ink text-nocta-paper shadow-sm"
                aria-label={dashboardContent.brand}
                onClick={() => {
                  if (window.matchMedia("(max-width: 767px)").matches) {
                    onPinClose();
                  }
                }}
              >
                <Moon className="size-3.5" aria-hidden />
              </Link>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-2 pr-3">
              <div className="min-w-0">
                <p className="text-[10px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {dashboardContent.sidebar.eyebrow}
                </p>
                <p className="mt-1 truncate font-serif text-lg leading-none tracking-[-0.03em] text-nocta-ink">
                  {dashboardContent.brand}
                </p>
              </div>

              {pinned ? (
                <ChromeButton
                  iconOnly
                  className="size-8 shrink-0 rounded-lg"
                  aria-label={dashboardContent.actions.closeSidebar}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinClose();
                  }}
                >
                  <PanelLeftClose className="size-4" />
                </ChromeButton>
              ) : (
                <ChromeButton
                  iconOnly
                  className="size-8 shrink-0 rounded-lg"
                  aria-label="Keep sidebar open"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinOpen();
                  }}
                >
                  <Pin className="size-3.5" />
                </ChromeButton>
              )}
            </div>
          </div>

          <div
            className="mb-3 grid items-center"
            style={{ gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)` }}
            aria-hidden
          >
            <div className="flex justify-center">
              <div className="h-px w-6 bg-border/80" />
            </div>
            <div className="pr-3">
              <div className="h-px w-full bg-border/80" />
            </div>
          </div>

          <p
            className="mb-2 truncate pr-3 text-[10px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase"
            style={{ paddingLeft: ICON_COL }}
          >
            {dashboardContent.sidebar.navLabel}
          </p>

          <nav
            className={cn("flex flex-1 flex-col gap-1", expanded && "px-2")}
            aria-label="Primary"
          >
            {NAV.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  onClick={() => {
                    if (window.matchMedia("(max-width: 767px)").matches) {
                      onPinClose();
                    }
                  }}
                  className="nocta-nav-pill grid h-10 items-center rounded-lg"
                  style={{
                    gridTemplateColumns: `${ICON_COL} minmax(0, 1fr)`,
                  }}
                  data-active={active ? "true" : undefined}
                >
                  <span className="nocta-nav-icon flex size-8 items-center justify-center justify-self-center rounded-lg">
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                  </span>
                  <span className="flex items-center truncate pr-3 text-sm leading-none">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div
            className={cn("mt-auto pt-3", expanded ? "px-2" : "px-0")}
            style={expanded ? undefined : { paddingLeft: ICON_COL }}
          >
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <p className="font-serif text-sm leading-snug tracking-[-0.02em] text-nocta-ink">
                {dashboardContent.sidebar.tagline}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {dashboardContent.sidebar.taglineSupport}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
