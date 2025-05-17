import { PrismaClient } from '../generated/prisma';
import { seedSurveyIntakeQuestions } from './seeds/20250517_1553_add_intake_questions';

const prisma = new PrismaClient();

async function main() {
  await seedSurveyIntakeQuestions(prisma);
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
