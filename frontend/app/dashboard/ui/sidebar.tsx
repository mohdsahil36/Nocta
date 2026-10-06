"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  LayoutDashboard,
  PanelLeftClose,
  Pin,
  Target,
  type LucideIcon,
} from "lucide-react";

import { cn } from "cn";
import { ChromeButton } from "@/components/ui/chrome-button";
import {
  AnimatedIcon,
  type IconMotionPreset,
} from "@/components/ui/animated-icon";
import { NoctaMark } from "@/components/ui/nocta-mark";
import { dashboardContent } from "../content";
import { AccountMenu } from "./account-menu";

const SIDEBAR_H = "h-svh";
const SIDEBAR_EXPANDED_W = "w-[15rem]";
const EXPANDED_W = "w-[15rem] translate-x-0";
const COLLAPSED_W =
  "max-md:w-[15rem] max-md:-translate-x-full md:w-14 md:translate-x-0";
const HOVER_LEAVE_MS = 280;

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  motion: IconMotionPreset;
};

const TOP_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: dashboardContent.nav.dashboard,
    icon: LayoutDashboard,
    motion: "nudge",
  },
];

const PLAN_NAV: NavItem[] = [
  {
    href: "/goals",
    label: dashboardContent.nav.goals,
    icon: Target,
    motion: "tilt",
  },
  {
    href: "/dashboard#reflect",
    label: dashboardContent.nav.reflect,
    icon: BookOpen,
    motion: "rise",
  },
];

const WORKSPACE_NAV: NavItem[] = [
  {
    href: "/activity",
    label: dashboardContent.nav.activity,
    icon: Activity,
    motion: "wiggle",
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
  if (href === "/goals") {
    return pathname === "/goals" || pathname.startsWith("/goals/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
  collapsed: boolean;
}) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onNavigate}
      className={cn(
        "nocta-nav-pill flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-2.5 tracking-tight",
        collapsed && "mx-auto size-9 justify-center gap-0 rounded-md p-0",
      )}
      data-active={active ? "true" : undefined}
    >
      <span className="nocta-nav-icon flex size-5 shrink-0 items-center justify-center">
        <AnimatedIcon
          icon={Icon}
          active={active}
          preset={item.motion}
          tone="neutral"
          inheritColor
          className="size-4"
        />
      </span>
      {!collapsed ? (
        <span className="truncate text-[13px] leading-none font-medium tracking-tight">
          {item.label}
        </span>
      ) : (
        <span className="sr-only">{item.label}</span>
      )}
    </Link>
  );
}

function SidebarSection({
  label,
  collapsed,
  ariaLabel,
  children,
}: {
  label?: string;
  collapsed: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-b border-border py-2 last:border-b-0",
        collapsed ? "px-1" : "px-2",
      )}
    >
      {!collapsed && label ? (
        <p className="mb-1.5 px-2.5 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
      <nav
        className={cn(
          "flex flex-col gap-0.5",
          collapsed && "w-full items-center",
        )}
        aria-label={ariaLabel}
      >
        {children}
      </nav>
    </section>
  );
}

/**
 * Blueprint-style sidebar — brand row, section groups, flush rail.
 * Pin / hover peek behavior unchanged.
 */
export function DashboardSidebar({
  pinned,
  expanded,
  onPinClose,
  onPinOpen,
  onHoverExpandChange,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const leaveTimerRef = useRef<number | null>(null);
  const collapsed = !expanded;
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (!pinned || !mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pinned]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current != null) {
        window.clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current != null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const startHover = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    clearLeaveTimer();
    onHoverExpandChange(true);
  };

  const endHover = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    // keep rail open while account menu is up
    if (accountMenuOpen) return;
    clearLeaveTimer();
    leaveTimerRef.current = window.setTimeout(() => {
      leaveTimerRef.current = null;
      onHoverExpandChange(false);
    }, HOVER_LEAVE_MS);
  };

  const closeIfMobile = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      onPinClose();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar backdrop"
        tabIndex={pinned ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-nocta-night/40 md:hidden",
          "transition-opacity duration-300 ease-out",
          pinned ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onPinClose}
      />

      <div
        className={cn(
          "hidden shrink-0 md:block",
          pinned ? SIDEBAR_EXPANDED_W : "w-14",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50",
          SIDEBAR_H,
          "overflow-hidden transition-[width,transform] duration-300 ease-out",
          expanded ? EXPANDED_W : COLLAPSED_W,
        )}
        onMouseEnter={startHover}
        onMouseLeave={endHover}
      >
        <aside
          className={cn("nocta-sidebar flex h-full w-full flex-col")}
          data-collapsed={collapsed ? "true" : undefined}
        >
          {/* Brand — icon only when collapsed */}
          <div
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 border-b border-border px-3",
              collapsed && "justify-center px-0",
            )}
          >
            <Link
              href="/dashboard"
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-nocta-ink"
              aria-label={dashboardContent.brand}
              onClick={closeIfMobile}
            >
              <NoctaMark className="size-4" />
            </Link>
            {!collapsed ? (
              <>
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-tight text-nocta-ink">
                  {dashboardContent.brand}
                </span>
                <ChromeButton
                  iconOnly
                  className="size-7 rounded-md"
                  aria-label={
                    pinned
                      ? dashboardContent.actions.closeSidebar
                      : dashboardContent.actions.pinSidebar
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pinned) onPinClose();
                    else onPinOpen();
                  }}
                >
                  <AnimatedIcon
                    icon={pinned ? PanelLeftClose : Pin}
                    className="size-3.5"
                    preset="nudge"
                    tone="neutral"
                  />
                </ChromeButton>
              </>
            ) : null}
          </div>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
              collapsed && "items-center",
            )}
          >
            <SidebarSection collapsed={collapsed} ariaLabel="Primary">
              {TOP_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeIfMobile}
                  collapsed={collapsed}
                />
              ))}
            </SidebarSection>

            <SidebarSection
              collapsed={collapsed}
              label={dashboardContent.sidebar.planLabel}
              ariaLabel="Plan"
            >
              {PLAN_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeIfMobile}
                  collapsed={collapsed}
                />
              ))}
            </SidebarSection>

            <SidebarSection
              collapsed={collapsed}
              label={dashboardContent.sidebar.workspaceLabel}
              ariaLabel="Workspace"
            >
              {WORKSPACE_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeIfMobile}
                  collapsed={collapsed}
                />
              ))}
            </SidebarSection>
          </div>

          <footer
            className={cn(
              "mt-auto shrink-0 border-t border-border px-2 py-2",
              collapsed && "flex justify-center px-1",
            )}
          >
            <AccountMenu
              collapsed={collapsed}
              onExpandSidebar={onPinOpen}
              onMenuOpenChange={(open) => {
                setAccountMenuOpen(open);
                if (open) {
                  clearLeaveTimer();
                  onHoverExpandChange(true);
                }
              }}
            />
          </footer>
        </aside>
      </div>
    </>
  );
}
