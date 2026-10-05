"use client";

/** Legacy Cadence preview copy — unused by Nocta login; kept for local demos. */
const PRODUCT_PREVIEW = {
  live: "Live preview",
  header: "Quiet steps.",
  momentum: "Momentum 12",
  commits: "48",
  quiet: "6",
  repos: "3",
  footnote: "Private by default. No public feed.",
} as const;

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr"] as const;

/** Deterministic fake year of contributions — denser toward recent weeks. */
function buildWeeks(weekCount: number): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < weekCount; w++) {
    const recency = w / Math.max(1, weekCount - 1);
    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      const n =
        Math.sin(w * 1.7 + d * 2.3) * 0.5 +
        Math.cos(w * 0.9 - d) * 0.35 +
        recency * 0.55;
      if (n < 0.05) days.push(0);
      else if (n < 0.28) days.push(1);
      else if (n < 0.52) days.push(2);
      else if (n < 0.78) days.push(3);
      else days.push(4);
    }
    weeks.push(days);
  }
  return weeks;
}

const LEVEL_OPACITY = [0.06, 0.2, 0.4, 0.65, 0.9] as const;

type ContributionGraphProps = {
  compact?: boolean;
  className?: string;
};

/** GitHub-style contribution calendar (monochrome). */
export function ContributionGraph({
  compact = false,
  className = "",
}: ContributionGraphProps) {
  const weekCount = compact ? 12 : 18;
  const weeks = buildWeeks(weekCount);
  const cell = compact ? "h-[9px] w-[9px]" : "h-[11px] w-[11px]";
  const gap = compact ? "gap-[2px]" : "gap-[3px]";

  return (
    <div className={`w-full ${className}`}>
      {!compact ? (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="font-mono text-[11px] text-white/55">
            <span className="text-white/85">47</span> contributions in the last
            year
          </p>
        </div>
      ) : null}

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <div
          className={`grid shrink-0 grid-rows-7 pt-3.5 font-mono text-[9px] leading-none text-white/35 ${gap}`}
        >
          {DAYS.map((label, i) => (
            <span
              key={`d-${i}`}
              className={`flex items-center ${compact ? "h-2.25" : "h-2.75"}`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="mb-1 grid font-mono text-[9px] text-white/35"
            style={{
              gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: weekCount }, (_, i) => {
              const show =
                i === 0 ||
                i === Math.floor(weekCount / 3) ||
                i === Math.floor((weekCount * 2) / 3);
              const monthIdx =
                i === 0
                  ? 0
                  : i === Math.floor(weekCount / 3)
                    ? 1
                    : i === Math.floor((weekCount * 2) / 3)
                      ? 2
                      : 3;
              return (
                <span key={`m-${i}`} className="truncate">
                  {show ? MONTHS[monthIdx] : ""}
                </span>
              );
            })}
          </div>

          <div className={`flex ${gap}`}>
            {weeks.map((week, wi) => (
              <div key={wi} className={`grid grid-rows-7 ${gap}`}>
                {week.map((level, di) => (
                  <span
                    key={`${wi}-${di}`}
                    title={`${level} contributions`}
                    className={`rounded-xs bg-white ${cell}`}
                    style={{ opacity: LEVEL_OPACITY[level] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <p className="font-mono text-[9px] tracking-[0.04em] text-white/30">
          Learn how Cadence counts commits
        </p>
        <div className="flex items-center gap-1 font-mono text-[9px] text-white/35">
          <span>Less</span>
          {LEVEL_OPACITY.map((opacity, i) => (
            <span
              key={i}
              className="inline-block h-2.25 w-2.25 rounded-xs bg-white"
              style={{ opacity }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

/** Live product preview — GitHub contribution graph + cadence stats. */
export function RhythmProductPanel() {
  const product = PRODUCT_PREVIEW;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden border border-white/12 bg-white/4">
      <div className="border-b border-white/10 bg-white/3 px-4 py-2.5">
        <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-white/70 uppercase">
          {product.live}
        </p>
      </div>

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="font-serif text-xl tracking-[-0.03em] text-white">
            {product.header}
          </p>
          <span className="border border-white/25 bg-black/30 px-2 py-1 font-mono text-[10px] tracking-widest text-white/80 uppercase shadow-[2px_2px_0_rgba(255,255,255,0.08)]">
            {product.momentum}
          </span>
        </div>

        <ContributionGraph />

        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {(
            [
              { label: "Commits", value: product.commits },
              { label: "Quiet", value: product.quiet },
              { label: "Scope", value: product.repos },
            ] as const
          ).map((item) => (
            <div
              key={item.label}
              className="border border-white/12 bg-white/3 px-2 py-2"
            >
              <p className="font-mono text-[9px] tracking-[0.12em] text-white/40 uppercase">
                {item.label}
              </p>
              <p className="mt-1 text-[12px] font-medium tracking-[-0.02em] text-white/85">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-3 font-mono text-[10px] leading-4 tracking-[0.04em] text-white/40">
          {product.footnote}
        </p>
      </div>
    </div>
  );
}
