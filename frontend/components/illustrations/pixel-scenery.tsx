"use client";

import { cn } from "cn";

/**
 * Hero background image.
 * Soft-masks into the page color at the bottom so the cut into the next section isn’t abrupt.
 */
export function PixelScenery({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden",
        className,
      )}
      style={{
        maskImage:
          "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
      }}
    >
      <div className="absolute inset-0 bg-nocta-night" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/nocta-scenery.jpg"
        alt=""
        sizes="100vw"
        style={{ transform: "scale(1.12)", transformOrigin: "center 40%" }}
        className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.02] saturate-[0.95] dark:brightness-[0.78] dark:contrast-[1.04] dark:saturate-[0.75]"
      />
      {/* Top shade for nav / type contrast */}
      <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-transparent" />
    </div>
  );
}
