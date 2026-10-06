"use client";

import { useState } from "react";

import { DashboardPanels } from "@/app/dashboard/ui/dashboard-panels";
import { GoalsOnboardingModal } from "../ui/onboarding";

/**
 * Preview / first-login entry: desk behind, onboarding modal centered.
 * Close / skip → `/goals` (handled inside the modal). Finish → dashboard.
 * Human: redirect here when active goals === 0.
 */
export default function GoalsOnboardingPage() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <DashboardPanels />
      <GoalsOnboardingModal
        open={open}
        onOpenChange={setOpen}
        dismissHref="/goals"
      />
    </>
  );
}
