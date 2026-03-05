import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

config();

export default defineConfig({
  datasource: {
    // Prisma 7 uses this for migrations and db push
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
  migrations: {
    // This tells Prisma to use ts-node to execute your TypeScript seed file
    seed: 'ts-node --compiler-options {"module":"CommonJS"} ./prisma/seed.ts',
  },
});