import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Nocta",
  },
  description: "One meaningful action, every night.",
};

/**
 * time.fyi frame craft:
 * - Page is full-bleed paper (no max-width wrapper)
 * - Vertical rails at 1080 in the content band (not the footer) — see page.tsx
 * - Hero + features share that column so content does not break the rails
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nocta-landing relative min-h-svh w-full bg-nocta-paper text-foreground">
      {children}
    </div>
  );
}
