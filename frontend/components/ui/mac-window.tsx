import type { ReactNode } from "react";

type MacWindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
  /** Soft fill behind the chrome (defaults to paper). */
  tone?: "paper" | "sand" | "sky" | "mint" | "lavender" | "peach";
};

const TONE = {
  paper: "bg-nocta-paper",
  sand: "bg-landing-sand/50",
  sky: "bg-landing-sky/40",
  mint: "bg-landing-mint/40",
  lavender: "bg-landing-lavender/40",
  peach: "bg-landing-peach/40",
} as const;

/**
 * Shared Mac-style chrome for landing demos and app surfaces.
 * Calm frame only — keep interiors quiet; no bold marketing chrome.
 */
export function MacWindow({
  title,
  children,
  className = "",
  tone = "paper",
}: MacWindowProps) {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-foreground/12 bg-nocta-paper shadow-[0_12px_40px_-18px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 items-center gap-2 border-b border-foreground/10 px-3.5",
          TONE[tone],
        ].join(" ")}
      >
        <span aria-hidden className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FF5F57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" />
          <span className="size-2.5 rounded-full bg-[#28C840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" />
        </span>
        <p className="flex-1 truncate text-center text-xs text-muted-foreground">
          {title}
        </p>
        <span className="w-10 shrink-0" aria-hidden />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
