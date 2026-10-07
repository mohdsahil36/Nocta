import { Plus } from "lucide-react";
import { loginContent } from "../content";
import { COL_SPLIT, SectionHeader, SectionShell } from "./section";

export function FaqSection() {
  const c = loginContent.faq;
  return (
    <SectionShell id="faq">
      <div className="overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
        <div className={["grid", COL_SPLIT].join(" ")}>
          <div className="bg-neutral-50 p-6 sm:p-7 md:p-8 dark:bg-neutral-900/40">
            <div className="md:sticky md:top-24">
              <SectionHeader eyebrow={c.eyebrow} title={c.title} />
            </div>
          </div>
          <div className="border-t border-foreground/10 bg-nocta-paper md:border-t-0 md:border-l">
            {c.items.map((item) => (
              <details
                key={item.q}
                className="group border-b border-foreground/10 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-left text-base font-medium text-foreground outline-none transition-colors hover:bg-foreground/3 focus-visible:bg-foreground/5 sm:px-7 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground sm:px-7">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
