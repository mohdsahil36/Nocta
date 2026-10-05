"use client";

import Link from "next/link";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

/** Quiet icon chrome — no chip border by default. */
const chromeIconClass =
  "border-transparent bg-transparent text-muted-foreground shadow-none transition-[background-color,color] duration-150 ease-out hover:bg-muted/60 hover:text-foreground";

/**
 * Labeled chrome — outline / muted, not a solid marketing CTA.
 * Primary solid stays for real actions (Continue, etc.) via Button.
 */
const chromeLabelClass =
  "h-9 border border-border/80 bg-transparent text-nocta-ink shadow-none transition-[background-color,border-color] duration-150 ease-out hover:bg-muted/50";

/** Shared across <button> and <Link> — element-agnostic handlers. */
type Shared = {
  children: ReactNode;
  className?: string;
  /** Accessible name — required when the visible label is icon-only. */
  "aria-label"?: string;
  title?: string;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
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
  /** Square icon control (`size-9`) vs padded labeled control. */
  iconOnly?: boolean;
};

/**
 * Shared chrome control for app shells (dashboard header, sidebar, etc.).
 * Icon + labeled stay quiet; use Shadcn Button for primary CTAs.
 */
export function ChromeButton({
  children,
  className,
  iconOnly = false,
  href,
  ...rest
}: ChromeButtonProps) {
  const sizeClass = iconOnly ? "size-9 shrink-0 px-0" : "gap-1.5 px-3";
  const classes = cn(
    buttonVariants({ variant: iconOnly ? "ghost" : "outline" }),
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
