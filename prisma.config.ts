import "dotenv/config";
import { defineConfig } from "prisma/config";

// Миграциям нужно прямое подключение (без pgbouncer): у Neon это хост без «-pooler».
const url = process.env.DIRECT_URL ?? (process.env.DATABASE_URL ?? "").replace("-pooler", "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url },
});
