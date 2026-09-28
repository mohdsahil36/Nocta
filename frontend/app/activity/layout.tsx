import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "../dashboard/ui/shell";

export const metadata: Metadata = {
  title: "Platform activity",
  description: "Platform commits and coding activity from the Nocta repo.",
};

export default function ActivityLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
