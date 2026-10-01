import { MacWindow } from "@/components/ui/mac-window";
import { dashboardContent } from "../content";

/**
 * Dashboard home — minimal Mac surfaces, quiet copy.
 * Type: body 10–12px, titles 14px.
 */
export function DashboardPanels() {
  const { tonight, pulse, tip } = dashboardContent;

  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-5 lg:gap-3">
      <MacWindow
        title={tonight.windowTitle}
        tone="paper"
        elevation="flat"
        className="lg:col-span-3"
      >
        <div className="max-w-lg p-5 sm:p-6">
          <p className="text-[10px] text-muted-foreground">{tonight.eyebrow}</p>
          <h2 className="mt-2 font-sans text-sm font-semibold tracking-[-0.02em] text-nocta-ink">
            {tonight.title}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {tonight.body}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">{tonight.emptyCta}</p>
        </div>
      </MacWindow>

      <div className="flex flex-col gap-3 lg:col-span-2">
        <MacWindow title={pulse.windowTitle} tone="paper" elevation="flat">
          <div className="p-5 sm:p-6">
            <p className="text-[10px] text-muted-foreground">{pulse.eyebrow}</p>
            <h3 className="mt-2 font-sans text-sm font-semibold tracking-[-0.02em] text-nocta-ink">
              {pulse.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {pulse.body}
            </p>
          </div>
        </MacWindow>

        <MacWindow title={tip.windowTitle} tone="paper" elevation="flat">
          <div className="p-5 sm:p-6">
            <p className="text-[10px] text-muted-foreground">{tip.eyebrow}</p>
            <h3 className="mt-2 font-sans text-sm font-semibold tracking-[-0.02em] text-nocta-ink">
              {tip.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {tip.body}
            </p>
          </div>
        </MacWindow>
      </div>
    </section>
  );
}
