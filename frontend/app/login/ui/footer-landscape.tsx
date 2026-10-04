"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";

/**
 * Ironclad-style dithered mountains — blue canvas stipple, soft crest into paper.
 * Avoids SVG pattern currentColor bugs that rendered as muddy charcoal.
 */
export function FooterLandscape({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const CELL = 3;

    /** Layered angular peaks → 0 (sky) … 1 (deep valley). */
    const elevation = (nx: number, ny: number) => {
      const peak = (cx: number, h: number, w: number) => {
        const d = Math.abs(nx - cx) / w;
        return Math.max(0, 1 - d) * h;
      };

      const ridge =
        peak(0.12, 0.42, 0.18) +
        peak(0.32, 0.72, 0.16) +
        peak(0.48, 0.55, 0.14) +
        peak(0.62, 0.88, 0.15) +
        peak(0.78, 0.5, 0.14) +
        peak(0.92, 0.68, 0.16);

      // Crest near the top so almost the full band is dithered bg
      const crest = 0.04 + ridge * 0.16;
      if (ny < crest) return 0;

      const depth = (ny - crest) / (1 - crest);
      const slope = Math.min(1, depth * 1.35);
      // Valleys between peaks read darker
      const valley = 1 - Math.min(1, ridge * 0.85);
      return Math.min(1, slope * (0.45 + valley * 0.55));
    };

    const paint = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, Math.floor(width));
      const ch = Math.max(1, Math.floor(height));

      if (
        canvas.width !== Math.floor(cw * dpr) ||
        canvas.height !== Math.floor(ch * dpr)
      ) {
        canvas.width = Math.floor(cw * dpr);
        canvas.height = Math.floor(ch * dpr);
        canvas.style.width = `${cw}px`;
        canvas.style.height = `${ch}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      // Opaque base so page rails never show through the footer band
      ctx.globalAlpha = 1;
      ctx.fillStyle = "oklch(0.94 0.025 245)";
      ctx.fillRect(0, 0, cw, ch);

      // Soft paper → blue wash (no hard seam / hairline)
      const wash = ctx.createLinearGradient(0, 0, 0, ch);
      wash.addColorStop(0, "oklch(0.99 0.004 240)");
      wash.addColorStop(0.18, "oklch(0.96 0.02 245)");
      wash.addColorStop(0.45, "oklch(0.91 0.03 246)");
      wash.addColorStop(1, "oklch(0.86 0.035 248)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, cw, ch);

      const cols = Math.ceil(cw / CELL);
      const rows = Math.ceil(ch / CELL);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = x / cols;
          const ny = y / rows;
          const e = elevation(nx, ny);
          if (e <= 0.02) continue;

          // Ordered-ish dither threshold from cell coords
          const thresh = ((x * 7 + y * 13) % 16) / 16;
          const density = e * 0.92 + 0.08;
          if (density < thresh * 0.55 + 0.12) continue;

          // Blue night steps: mist → sky → ink → deep night
          let fill: string;
          if (e < 0.28) fill = "oklch(0.72 0.05 245)";
          else if (e < 0.48) fill = "oklch(0.55 0.07 248)";
          else if (e < 0.7) fill = "oklch(0.4 0.06 250)";
          else fill = "oklch(0.26 0.045 252)";

          // Feather the crest so peaks dissolve into paper (no hard cut)
          const crestFade = Math.min(1, e * 3.2);
          ctx.globalAlpha = 0.35 + crestFade * 0.6;
          ctx.fillStyle = fill;
          // Tiny “x” mark — denser reading than a solid block
          const px = x * CELL;
          const py = y * CELL;
          const s = CELL - 1;
          ctx.fillRect(px + 1, py, 1, s);
          ctx.fillRect(px, py + 1, s, 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    paint();
    const ro = new ResizeObserver(() => paint());
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full [image-rendering:pixelated]"
      />
    </div>
  );
}
