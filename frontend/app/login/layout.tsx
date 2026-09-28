import type { Metadata } from "next";
import { PageFrameRails } from "./ui/page-frame";

export const metadata: Metadata = {
  title: {
    absolute: "Nocta",
  },
  description: "One meaningful action, every night.",
};

/**
 * time.fyi frame craft:
 * - Page is full-bleed paper (no max-width wrapper)
 * - Vertical rails overlay at 1080px
 * - Sections own FullRule (full viewport) + inner max-w-[1080px] content
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nocta-landing relative min-h-svh w-full bg-nocta-paper text-foreground">
      <PageFrameRails />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
