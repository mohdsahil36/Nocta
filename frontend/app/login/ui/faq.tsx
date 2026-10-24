"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { loginContent } from "../content";

export function FaqSection() {
  const c = loginContent.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      {/* Header row */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-8 py-8 sm:px-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          {c.eyebrow}
        </p>
        <h2 className="mt-2 font-heading text-[clamp(1.6rem,3vw,2rem)] font-normal text-neutral-950 dark:text-neutral-50">
          {c.title}
        </h2>
      </div>

      {/* Q&A list — click to expand one at a time */}
      <div>
        {c.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-start justify-between gap-6 px-8 py-5 sm:px-10 text-left group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span className="shrink-0 font-mono text-[10px] font-semibold text-primary mt-0.5 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={[
                    "text-[14px] font-medium leading-6 transition-colors",
                    isOpen ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-700 dark:text-neutral-300",
                  ].join(" ")}>
                    {item.q}
                  </span>
                </div>
                <span className={[
                  "shrink-0 size-5 flex items-center justify-center rounded-full border transition-all mt-0.5",
                  isOpen
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-400 group-hover:border-neutral-300",
                ].join(" ")}>
                  {isOpen
                    ? <Minus className="size-3" />
                    : <Plus className="size-3" />
                  }
                </span>
              </button>

              {isOpen && (
                <div className="px-8 pb-6 sm:px-10 pl-[68px]">
                  <p className="text-[14px] leading-6 text-neutral-500 dark:text-neutral-400">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
