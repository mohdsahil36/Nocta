import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardContent } from "../content";

/** Calm overview cards — shared panel surface for contrast on the canvas. */
export function DashboardPanels() {
  const { tonight, pulse, tip } = dashboardContent;

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      <Card className="nocta-panel border-0 p-4 shadow-none ring-0 sm:p-6 lg:col-span-2 lg:p-8">
        <CardHeader className="px-0 pt-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {tonight.eyebrow}
          </p>
          <CardTitle className="font-serif text-xl tracking-[-0.03em] text-nocta-ink sm:text-2xl">
            {tonight.title}
          </CardTitle>
          <CardDescription className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {tonight.body}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <span className="inline-flex h-9 items-center rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground">
            {tonight.emptyCta}
          </span>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:gap-4">
        <Card className="nocta-panel border-0 p-4 shadow-none ring-0 sm:p-6">
          <CardHeader className="px-0 pt-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {pulse.eyebrow}
            </p>
            <CardTitle className="text-base text-nocta-ink">
              {pulse.title}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              {pulse.body}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="nocta-panel border-0 p-4 shadow-none ring-0 sm:p-6">
          <CardHeader className="px-0 pt-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {tip.eyebrow}
            </p>
            <CardTitle className="text-base text-nocta-ink">{tip.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              {tip.body}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
