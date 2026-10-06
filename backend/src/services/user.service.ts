import prisma from "../lib/prisma.js";

/** Create Prisma User on first auth, or bump updatedAt / refresh email on later logins. */
export async function ensureUser(id: string, email: string) {
  return prisma.user.upsert({
    where: { id },
    create: { id, email },
    update: { email },
  });
}
