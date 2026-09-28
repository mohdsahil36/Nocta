import { dashboardContent } from "../content";

/** Overview panels — landing-style eyebrows + soft pastel wells. */
export function DashboardPanels() {
  const { tonight, pulse, tip } = dashboardContent;

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      <article className="nocta-panel relative overflow-hidden p-5 sm:p-7 lg:col-span-2 lg:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-landing-sky/40 dark:bg-transparent"
        />
        <div className="relative">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <span className="mr-2 text-nocta-glow tabular-nums">01</span>
            {tonight.eyebrow}
          </p>
          <h2 className="mt-3 font-sans text-2xl leading-snug font-semibold tracking-[-0.03em] text-nocta-ink sm:text-3xl">
            {tonight.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {tonight.body}
          </p>
          <span className="mt-6 inline-flex h-10 items-center rounded-full border border-foreground/10 bg-nocta-paper px-4 text-sm font-medium text-muted-foreground">
            {tonight.emptyCta}
          </span>
        </div>
      </article>

      <div className="flex flex-col gap-3 sm:gap-4">
        <article className="nocta-panel relative overflow-hidden p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-landing-mint/35 dark:bg-transparent"
          />
          <div className="relative">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <span className="mr-2 text-nocta-glow tabular-nums">02</span>
              {pulse.eyebrow}
            </p>
            <h3 className="mt-3 font-sans text-base font-semibold tracking-[-0.02em] text-nocta-ink">
              {pulse.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {pulse.body}
            </p>
          </div>
        </article>

        <article className="nocta-panel relative overflow-hidden p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-landing-lavender/40 dark:bg-transparent"
          />
          <div className="relative">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <span className="mr-2 text-nocta-glow tabular-nums">03</span>
              {tip.eyebrow}
            </p>
            <h3 className="mt-3 font-sans text-base font-semibold tracking-[-0.02em] text-nocta-ink">
              {tip.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tip.body}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
