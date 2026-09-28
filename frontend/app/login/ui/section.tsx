import type { ReactNode } from "react";
import { FRAME_PAD, Frame } from "./page-frame";

type Point = { title: string; body: string };

/** Shared 2-col split inside a single section card (not across page bands). */
export const COL_SPLIT = "md:grid-cols-2";

/**
 * Full-viewport horizontal hairline — use sparingly (hero / close),
 * not between every feature (that welded columns together).
 */
export function FullRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={["relative z-20 h-px w-full bg-foreground/10", className].join(
        " ",
      )}
    >
      <div className="pointer-events-none absolute inset-0 mx-auto max-w-270">
        <span className="absolute top-1/2 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25" />
        <span className="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25" />
      </div>
    </div>
  );
}

type SectionHeaderProps = {
  index?: string;
  eyebrow: string;
  title: string;
  body?: string;
  wide?: boolean;
  align?: "left" | "center";
  /** Live / encrypted title replaces the static H2 text when set. */
  titleSlot?: ReactNode;
};

/** Index + eyebrow + title — no decorative icons. */
export function SectionHeader({
  index,
  eyebrow,
  title,
  body,
  wide = false,
  align = "left",
  titleSlot,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={[
        wide ? "max-w-3xl" : "max-w-xl",
        centered ? "mx-auto text-center" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {index ? (
          <span className="mr-2 text-nocta-glow tabular-nums">{index}</span>
        ) : null}
        {eyebrow}
      </p>
      <h2 className="mt-4 min-h-[2.6em] font-sans text-3xl leading-[1.15] font-semibold tracking-[-0.03em] text-foreground sm:min-h-[2.4em] sm:text-4xl">
        {titleSlot ?? title}
      </h2>
      {body ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {body}
        </p>
      ) : null}
    </div>
  );
}

const TONE = {
  paper: { copy: "bg-nocta-paper", panel: "bg-landing-sand/70" },
  mist: { copy: "bg-muted/40", panel: "bg-landing-sky/70" },
  sky: { copy: "bg-landing-sky/50", panel: "bg-nocta-paper" },
  mint: { copy: "bg-landing-mint/50", panel: "bg-nocta-paper" },
  peach: { copy: "bg-landing-peach/50", panel: "bg-nocta-paper" },
  lavender: { copy: "bg-landing-lavender/50", panel: "bg-nocta-paper" },
  glow: { copy: "bg-nocta-glow/5", panel: "bg-landing-mint/60" },
  canvas: { copy: "bg-nocta-canvas", panel: "bg-landing-peach/50" },
} as const;

export type BandTone = keyof typeof TONE;

/** split = copy|panel · flip = panel|copy · normal = title/body then full-width content */
export type BandLayout = "split" | "flip" | "stack" | "normal";

type DeepDiveProps = {
  id?: string;
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  points?: readonly Point[];
  tone?: BandTone;
  layout?: BandLayout;
  titleSlot?: ReactNode;
  children: ReactNode;
};

function CopyBlock({
  index,
  eyebrow,
  title,
  body,
  points,
  titleSlot,
  className = "",
  headerWide = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  points?: readonly Point[];
  titleSlot?: ReactNode;
  className?: string;
  headerWide?: boolean;
}) {
  return (
    <div className={className}>
      <SectionHeader
        index={index}
        eyebrow={eyebrow}
        title={title}
        body={body}
        wide={headerWide}
        titleSlot={titleSlot}
      />
      {points?.length ? (
        <ul className="mt-10 space-y-5">
          {points.map((p) => (
            <li key={p.title} className="flex gap-3">
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-nocta-glow/80"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {p.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Outer spacing shell — hairline above, then inset card content. */
export function SectionShell({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <FullRule />
      <section
        id={id}
        className={["scroll-mt-16 py-12 sm:py-16", className].join(" ")}
      >
        <Frame>
          <div className={FRAME_PAD}>{children}</div>
        </Frame>
      </section>
    </>
  );
}

const CARD =
  "overflow-hidden rounded-2xl border border-foreground/12 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.28)]";

/**
 * Text-only band — title + paragraph, no illustration panel.
 */
export function TextBand({
  id,
  index,
  eyebrow,
  title,
  body,
}: {
  id?: string;
  index?: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <SectionShell id={id}>
      <div
        className={[CARD, "bg-nocta-paper px-6 py-12 sm:px-10 sm:py-14"].join(
          " ",
        )}
      >
        <SectionHeader
          index={index}
          eyebrow={eyebrow}
          title={title}
          body={body}
          wide
        />
      </div>
    </SectionShell>
  );
}

/**
 * Feature band — each section is its own card so columns don’t weld band-to-band.
 */
export function DeepDive({
  id,
  index,
  eyebrow,
  title,
  body,
  points,
  tone = "paper",
  layout = "split",
  titleSlot,
  children,
}: DeepDiveProps) {
  const t = TONE[tone];
  const copyPad = "p-8 sm:p-10 md:p-12";
  const panelPad = "flex items-center p-8 sm:p-10 md:p-12";

  if (layout === "stack" || layout === "normal") {
    return (
      <SectionShell id={id}>
        <div className="flex flex-col gap-6">
          <div className={[CARD, "bg-nocta-paper", copyPad].join(" ")}>
            <CopyBlock
              index={index}
              eyebrow={eyebrow}
              title={title}
              body={body}
              points={points}
              titleSlot={titleSlot}
              className="max-w-2xl"
              headerWide
            />
          </div>
          {/* Demo sits in its own chrome (often MacWindow) — no second welded panel. */}
          <div className="mx-auto w-full max-w-2xl">{children}</div>
        </div>
      </SectionShell>
    );
  }

  if (layout === "flip") {
    return (
      <SectionShell id={id}>
        <div className={[CARD, "grid", COL_SPLIT].join(" ")}>
          <div
            className={[
              panelPad,
              t.panel,
              "border-b border-foreground/10 md:border-r md:border-b-0",
            ].join(" ")}
          >
            <div className="w-full">{children}</div>
          </div>
          <CopyBlock
            index={index}
            eyebrow={eyebrow}
            title={title}
            body={body}
            points={points}
            titleSlot={titleSlot}
            className={[t.copy, copyPad].join(" ")}
          />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell id={id}>
      <div className={[CARD, "grid", COL_SPLIT].join(" ")}>
        <CopyBlock
          index={index}
          eyebrow={eyebrow}
          title={title}
          body={body}
          points={points}
          titleSlot={titleSlot}
          className={[t.copy, copyPad].join(" ")}
        />
        <div
          className={[
            panelPad,
            t.panel,
            "border-t border-foreground/10 md:border-t-0 md:border-l",
          ].join(" ")}
        >
          <div className="w-full">{children}</div>
        </div>
      </div>
    </SectionShell>
  );
}

export function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

export function AreaTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full bg-nocta-glow/10 px-2 text-[11px] font-medium text-foreground/80">
      {children}
    </span>
  );
}
