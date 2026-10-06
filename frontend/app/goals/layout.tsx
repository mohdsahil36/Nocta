import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "../dashboard/ui/shell";

export const metadata: Metadata = {
  title: "Goals",
  description: "Add, edit, and archive the goals Nocta scores each check-in.",
};

export default function GoalsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
