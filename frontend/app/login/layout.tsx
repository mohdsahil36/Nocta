import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Nocta",
  },
  description: "One meaningful action, every night.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh w-full overflow-x-hidden bg-nocta-paper text-foreground">
      {children}
    </div>
  );
}
