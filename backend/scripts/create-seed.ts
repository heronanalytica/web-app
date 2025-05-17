import * as fs from 'fs';
import * as path from 'path';

const seedName = process.argv[2];

if (!seedName) {
  console.error(
    '❌ Please provide a seed name. Example: `npm run create-seed add-users`',
  );
  process.exit(1);
}

const now = new Date();
const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
const time = now.toTimeString().slice(0, 5).replace(/:/g, ''); // HHmm
const dateTimePrefix = `${date}_${time}`;
const folderName = `${dateTimePrefix}_${seedName}`;
const seedPath = path.join('prisma', 'seeds', folderName);

if (fs.existsSync(seedPath)) {
  console.error(`❌ Seed "${folderName}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(seedPath, { recursive: true });

const indexFile = path.join(seedPath, 'index.ts');
fs.writeFileSync(
  indexFile,
  `import { PrismaClient } from 'generated/prisma'

export async function seed_${seedName.replace(/-/g, '_')}(prisma: PrismaClient) {
  // TODO: implement seeding logic for ${seedName}
}
`,
);

console.log(`✅ Created seed folder: ${seedPath}`);
