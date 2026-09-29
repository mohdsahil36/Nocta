import { MacWindow } from "@/components/ui/mac-window";
import { dashboardContent } from "../content";

/**
 * Dashboard home — Mac chrome on each surface; Tonight shows next-step
 * placeholder data (not the login check-in form). Wiring comes later.
 */
export function DashboardPanels() {
  const { tonight, pulse, tip } = dashboardContent;

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-5">
      <MacWindow
        title={tonight.windowTitle}
        tone="mint"
        className="lg:col-span-3"
      >
        <div className="relative overflow-hidden p-5 sm:p-7 lg:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-landing-mint/20 dark:bg-transparent"
          />
          <div className="relative max-w-md">
            <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              {tonight.eyebrow}
            </p>
            <h2 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em] text-nocta-ink sm:text-3xl">
              {tonight.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {tonight.body}
            </p>
            <span className="mt-6 inline-flex h-9 items-center rounded-md border border-foreground/10 bg-nocta-paper px-3.5 text-sm font-medium text-muted-foreground">
              {tonight.emptyCta}
            </span>
          </div>
        </div>
      </MacWindow>

      <div className="flex flex-col gap-3 sm:gap-4 lg:col-span-2">
        <MacWindow title={pulse.windowTitle} tone="sky">
          <div className="relative overflow-hidden p-5 sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-landing-sky/25 dark:bg-transparent"
            />
            <div className="relative">
              <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                {pulse.eyebrow}
              </p>
              <h3 className="mt-2 font-sans text-base font-semibold tracking-[-0.02em] text-nocta-ink">
                {pulse.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pulse.body}
              </p>
            </div>
          </div>
        </MacWindow>

        <MacWindow title={tip.windowTitle} tone="lavender">
          <div className="relative overflow-hidden p-5 sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-landing-lavender/25 dark:bg-transparent"
            />
            <div className="relative">
              <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                {tip.eyebrow}
              </p>
              <h3 className="mt-2 font-sans text-base font-semibold tracking-[-0.02em] text-nocta-ink">
                {tip.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tip.body}
              </p>
            </div>
          </div>
        </MacWindow>
      </div>
    </section>
  );
}
