import prisma from "../lib/prisma.js";
import { PlanStepStatus } from "../generated/prisma/enums.js";

const RETENTION_DAYS = 45;

export async function purgeArchivedSteps(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const { count } = await prisma.planStep.deleteMany({
    where: {
      status: PlanStepStatus.archived,
      archivedAt: { lt: cutoff },
    },
  });

  if (count > 0) {
    console.log(
      `[purge] deleted ${count} archived step(s) older than ${RETENTION_DAYS} days`,
    );
  }
}

export function startPurgeJob(): void {
  purgeArchivedSteps().catch((err) =>
    console.error("[purge] startup run failed:", err),
  );

  setInterval(
    () => {
      purgeArchivedSteps().catch((err) =>
        console.error("[purge] scheduled run failed:", err),
      );
    },
    24 * 60 * 60 * 1000,
  );
}
