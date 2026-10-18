// উদাহরণ মাত্র: @prisma/client ও একটি Database প্রয়োজন। এই বইয়ের QA-তে
// Prisma Install বা চালানো হয়নি।
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rich = await prisma.customer.findMany({
  where: { account: { balance: { gte: 5_000 } } },
  include: { account: true },
  orderBy: { id: 'asc' },
  take: 20,
});

await prisma.$transaction(async (tx) => {
  await tx.account.update({
    where: { customerId: 1 }, data: { balance: { decrement: 500 } },
  });
  await tx.account.update({
    where: { customerId: 2 }, data: { balance: { increment: 500 } },
  });
});
console.log(rich.length);
