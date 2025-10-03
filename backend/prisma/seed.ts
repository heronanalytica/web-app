import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // TODO: Run seed scripts
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
