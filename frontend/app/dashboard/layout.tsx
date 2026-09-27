import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "./ui/shell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "See tonight’s pick, track your goals, and protect rest when you need it.",
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
