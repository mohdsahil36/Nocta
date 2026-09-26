"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const chromeClass =
  "h-10 border-border bg-background text-sm font-medium text-foreground shadow-none transition-[background-color,border-color,color,box-shadow] duration-150 ease-out hover:bg-muted hover:text-foreground dark:hover:border-nocta-glow/35 dark:hover:bg-nocta-glow/15 dark:hover:text-nocta-ink dark:hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--nocta-glow)_28%,transparent)]";

type Shared = {
  children: ReactNode;
  className?: string;
  /** Accessible name — required when the visible label is icon-only. */
  "aria-label"?: string;
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
 * One outline style for icon and labeled actions — built on Shadcn `buttonVariants`.
 */
export function ChromeButton({
  children,
  className,
  iconOnly = false,
  href,
  ...rest
}: ChromeButtonProps) {
  const sizeClass = iconOnly ? "size-10 shrink-0 px-0" : "gap-2 px-3";
  const classes = cn(
    buttonVariants({ variant: "outline" }),
    chromeClass,
    sizeClass,
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={rest["aria-label"]}
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
  } = rest as AsButton;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </button>
  );
}
