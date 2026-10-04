"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

/** Quiet icon chrome — transparent by default; callers may pass a chip surface. */
const chromeIconClass =
  "border-transparent bg-transparent text-nocta-ink shadow-none transition-[background-color,border-color,color,box-shadow] duration-150 ease-out hover:border-border/40 hover:bg-muted/55 hover:text-foreground dark:hover:border-border dark:hover:bg-muted/50";

/**
 * Labeled chrome — medium-blue primary + white text in both themes.
 * Locked size: h-10 · gap-1.5 · px-3.5 (override only with care).
 */
const chromeLabelClass =
  "h-10 border-transparent bg-primary text-primary-foreground shadow-none transition-[background-color,color] duration-150 ease-out hover:bg-primary/88 hover:text-primary-foreground";

type Shared = {
  children: ReactNode;
  className?: string;
  /** Accessible name — required when the visible label is icon-only. */
  "aria-label"?: string;
  title?: string;
  onMouseEnter?: ComponentProps<"button">["onMouseEnter"];
  onMouseLeave?: ComponentProps<"button">["onMouseLeave"];
};

type AsButton = Shared & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: ComponentProps<"button">["onClick"];
  disabled?: boolean;
};

type AsLink = Shared & {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
};

export type ChromeButtonProps = (AsButton | AsLink) & {
  /** Square icon control (`size-10`) vs padded labeled control. */
  iconOnly?: boolean;
};

/**
 * Shared chrome control for app shells (dashboard header, sidebar, etc.).
 * Icon = quiet; labeled = solid primary blue + white (light and dark).
 */
export function ChromeButton({
  children,
  className,
  iconOnly = false,
  href,
  ...rest
}: ChromeButtonProps) {
  const sizeClass = iconOnly ? "size-10 shrink-0 px-0" : "gap-1.5 px-3.5";
  const classes = cn(
    buttonVariants({ variant: iconOnly ? "ghost" : "default" }),
    iconOnly ? chromeIconClass : chromeLabelClass,
    sizeClass,
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={rest["aria-label"]}
        title={rest.title}
        onMouseEnter={rest.onMouseEnter}
        onMouseLeave={rest.onMouseLeave}
      >
        {children}
      </Link>
    );
  }

  const {
    type = "button",
    onClick,
    disabled,
    "aria-label": ariaLabel,
    title,
    onMouseEnter,
    onMouseLeave,
  } = rest as AsButton;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={ariaLabel}
      title={title}
      className={classes}
    >
      {children}
    </button>
  );
}
