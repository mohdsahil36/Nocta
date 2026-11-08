import prisma from "../../lib/prisma.js";

type OutcomeType = "completed" | "partial" | "postponed" | "changed";

type OutcomeLog = {
  userId: string;
  goalId: string;
  planStepId?: string | null;
  outcome: OutcomeType;
};

export async function logOutcome(input: OutcomeLog) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // first check if entry already exists for the current log
  const existing = await prisma.outcomeLog.findFirst({
    where: {
      userId: input.userId,
      goalId: input.goalId,
      updatedAt: { gte: startOfDay, lte: endOfDay },
    },
  });
  // if the entry is found then update its values
  if (existing) {
    await prisma.outcomeLog.update({
      where: {
        id: existing.id,
      },
      data: {
        outcome: input.outcome,
      },
    });
  } else {
    // otherwise create a new entry for the outcome log
    await prisma.outcomeLog.create({
      data: {
        userId: input.userId,
        goalId: input.goalId,
        outcome: input.outcome,
        planStepId: input.planStepId,
      },
    });
  }

  // now reset the neglect time - otherwise the last touched will always keep increasing even if the user has worked on this task
  await prisma.goal.update({
    where: { id: input.goalId },
    data: { lastTouchedAt: new Date() },
  });

  // what is the current status of the task the user is working with
  if (input.planStepId) {
    const stepStatus =
      input.outcome === "completed"
        ? "done"
        : input.outcome === "postponed"
          ? "skipped"
          : null;

    if (stepStatus) {
      await prisma.planStep.update({
        where: { id: input.planStepId },
        data: { status: stepStatus },
      });
    }
  }
}
