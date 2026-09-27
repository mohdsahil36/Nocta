import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "../dashboard/ui/shell";

export const metadata: Metadata = {
  title: "Activity",
  description: "Platform commits and coding activity.",
};

export default function ActivityLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
