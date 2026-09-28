"use client";

import { cn } from "cn";

/**
 * Full-bleed hero background image.
 * Hard bottom edge; light top/bottom wash for type only — no section blend.
 */
export function PixelScenery({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden bg-nocta-night",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/nocta-scenery.jpg"
        alt=""
        sizes="100vw"
        style={{ transform: "scale(1.08)", transformOrigin: "center 42%" }}
        className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.05] saturate-[1.02] dark:brightness-[0.82] dark:contrast-[1.02] dark:saturate-[0.85]"
      />
      {/* Soft vignette for type — keeps the photo visible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_42%,rgb(0_0_0/0.45)_100%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/40" />
    </div>
  );
}
