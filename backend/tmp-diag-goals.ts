import { PrismaClient } from "./src/generated/prisma/client.js";
import { GoalStatus } from "./src/generated/prisma/enums.js";
import { z } from "zod";

const prisma = new PrismaClient();

const listGoalsQuerySchema = z.object({
  userId: z.string().min(1),
  status: z.enum(GoalStatus).optional().default(GoalStatus.active),
});

async function main() {
  const goals = await prisma.goal.findMany({
    select: { id: true, userId: true, name: true, status: true },
    take: 50,
  });
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
    take: 50,
  });
  console.log(
    JSON.stringify(
      {
        GoalStatus,
        parseActive: listGoalsQuerySchema.safeParse({
          userId: "abc",
          status: "active",
        }),
        parseMissing: listGoalsQuerySchema.safeParse({ userId: "abc" }),
        userCount: users.length,
        users,
        goalCount: goals.length,
        goals,
      },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
