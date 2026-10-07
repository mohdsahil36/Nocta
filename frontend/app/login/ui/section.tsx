import type { ReactNode } from "react";
import { FRAME_MAX, FRAME_PAD, Frame } from "./page-frame";

type Point = { title: string; body: string };

/** Shared 2-col split inside a single section card (not across page bands). */
export const COL_SPLIT = "md:grid-cols-2";

/**
 * Full-viewport horizontal hairline — nodes sit on the primary rail column.
 * Rails stay behind content; rules only mark section seams.
 */
export function FullRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={["relative z-1 h-px w-full bg-foreground/5", className].join(
        " ",
      )}
    >
      <div
        className={[
          "pointer-events-none absolute inset-0 mx-auto",
          FRAME_MAX,
        ].join(" ")}
      >
        <span className="absolute top-1/2 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/15" />
        <span className="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/15" />
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
          <span className="mr-2 tabular-nums text-foreground">{index}</span>
        ) : null}
        {eyebrow}
      </p>
      <h2 className="mt-3 font-sans text-2xl leading-[1.15] font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
        {titleSlot ?? title}
      </h2>
      {body ? (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      ) : null}
    </div>
  );
}

/** Landing tones resolve to paper / light grey via `.nocta-landing` CSS vars. */
const TONE = {
  paper: { copy: "bg-nocta-paper", panel: "bg-neutral-100/80 dark:bg-neutral-900/50" },
  mist: { copy: "bg-neutral-50 dark:bg-neutral-900/40", panel: "bg-nocta-paper" },
  sky: { copy: "bg-neutral-50 dark:bg-neutral-900/40", panel: "bg-nocta-paper" },
  mint: { copy: "bg-neutral-50 dark:bg-neutral-900/40", panel: "bg-nocta-paper" },
  peach: { copy: "bg-neutral-50 dark:bg-neutral-900/40", panel: "bg-nocta-paper" },
  lavender: { copy: "bg-neutral-50 dark:bg-neutral-900/40", panel: "bg-nocta-paper" },
  glow: { copy: "bg-neutral-50 dark:bg-neutral-900/40", panel: "bg-nocta-paper" },
  canvas: { copy: "bg-nocta-canvas", panel: "bg-nocta-paper" },
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
  /** Use the wide breakout frame (past the rail column). */
  wide?: boolean;
  /**
   * Actuity-style story card: outlined index + copy + demo, no SectionShell.
   * Used inside the horizontal story rail.
   */
  rail?: boolean;
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
        <ul className="mt-6 space-y-4">
          {points.map((p) => (
            <li key={p.title} className="flex gap-3">
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 bg-foreground"
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
  wide = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Wider than the rail column; opaque cards cover rails at the breakout. */
  wide?: boolean;
}) {
  return (
    <>
      <FullRule />
      <section
        id={id}
        className={[
          "relative z-2 scroll-mt-16 py-8 sm:py-10",
          className,
        ].join(" ")}
      >
        <Frame wide={wide}>
          <div className={FRAME_PAD}>{children}</div>
        </Frame>
      </section>
    </>
  );
}

const CARD =
  "overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-none dark:border-neutral-800 dark:bg-neutral-950";

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
        className={[CARD, "bg-nocta-paper px-6 py-8 sm:px-8 sm:py-10"].join(
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
  wide = false,
  rail = false,
  titleSlot,
  children,
}: DeepDiveProps) {
  const t = TONE[tone];
  const copyPad = "p-6 sm:p-7 md:p-8";
  const panelPad = "flex items-center p-6 sm:p-7 md:p-8";
  const demoWidth = wide ? "mx-auto w-full" : "mx-auto w-full max-w-2xl";

  if (rail) {
    return (
      <article
        id={id}
        data-story-panel
        className="grid h-full w-full grid-rows-[auto_1fr] gap-4 sm:grid-cols-[0.9fr_1.1fr] sm:grid-rows-1 sm:items-center sm:gap-6"
      >
        <div className="min-w-0 order-2 sm:order-1">
          <p
            aria-hidden
            className="font-sans text-[clamp(1.75rem,4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em] text-neutral-950 tabular-nums dark:text-neutral-50"
          >
            {index}
          </p>
          <p className="mt-2 text-[10px] font-medium tracking-[0.14em] text-neutral-500 uppercase">
            {eyebrow}
          </p>
          <h3 className="mt-2 font-sans text-lg font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-xl">
            {titleSlot ?? title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {body}
          </p>
          {points?.length ? (
            <ul className="mt-3 space-y-1">
              {points.slice(0, 3).map((p) => (
                <li
                  key={p.title}
                  className="text-[12px] text-neutral-500 before:mr-2 before:text-neutral-950 before:content-['·'] dark:before:text-neutral-50"
                >
                  {p.title}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="order-1 flex min-w-0 items-center justify-center sm:order-2">
          <div className="w-full origin-center scale-[0.88] sm:scale-[0.92]">
            {children}
          </div>
        </div>
      </article>
    );
  }

  if (layout === "stack" || layout === "normal") {
    return (
      <SectionShell id={id} wide={wide}>
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
          <div className={demoWidth}>{children}</div>
        </div>
      </SectionShell>
    );
  }

  if (layout === "flip") {
    return (
      <SectionShell id={id} wide={wide}>
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
    <SectionShell id={id} wide={wide}>
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
    <span className="inline-flex h-5 items-center border border-neutral-300 bg-neutral-100 px-2 text-[11px] font-medium text-foreground/80 dark:border-neutral-700 dark:bg-neutral-900">
      {children}
    </span>
  );
}
