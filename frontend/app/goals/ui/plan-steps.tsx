"use client";

import { useState } from "react";
import { Archive, ChevronDown } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { goalsContent } from "../content";

type LocalStep = { id: string; title: string };

/** Layout only — steps stay in this panel and are not saved. */
export function PlanSteps() {
  const c = goalsContent.plan;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<LocalStep[]>([]);

  const addStep = () => {
    const next = title.trim();
    if (!next) return;
    setSteps((prev) => [...prev, { id: `${prev.length}-${next}`, title: next }]);
    setTitle("");
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-7 gap-1 rounded-md px-2 text-xs text-muted-foreground shadow-none",
        )}
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
          aria-hidden
        />
        {open ? c.close : c.open}
      </button>
      {open ? (
        <div className="mt-2 rounded-md border border-border bg-muted/30 px-3 py-3">
          <p className="text-xs font-medium text-nocta-ink">{c.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{c.body}</p>
          {steps.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">{c.empty}</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-1.5">
              {steps.map((step, index) => (
                <li
                  key={step.id}
                  className="flex items-center justify-between gap-2"
                >
                  <p className="min-w-0 text-xs text-nocta-ink">
                    <span className="mr-2 text-muted-foreground">{index + 1}</span>
                    {step.title}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setSteps((prev) => prev.filter((item) => item.id !== step.id))
                    }
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "h-7 shrink-0 gap-1 rounded-md px-2 text-[11px] text-muted-foreground shadow-none",
                    )}
                  >
                    <Archive className="size-3" aria-hidden />
                    {c.archive}
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addStep();
              }}
              placeholder={c.placeholder}
              className="h-8 rounded-md border-border/80 text-xs shadow-none placeholder:text-muted-foreground/45"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={addStep}
              disabled={!title.trim()}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 shrink-0 rounded-md border-border/80 text-xs shadow-none",
              )}
            >
              {c.add}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
