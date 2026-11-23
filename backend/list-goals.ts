import prisma from './src/lib/prisma.js';
async function main() {
  const goals = await prisma.goal.findMany({ select: { id: true, name: true, weight: true, userId: true } });
  console.table(goals);
  await prisma.$disconnect();
}
main();
