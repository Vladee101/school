import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { QUESTION_TEXTS } from "../src/lib/klimov-questions";
import { KEY, QUESTION_COUNT, TYPE_CODES, TYPE_NAMES } from "../src/lib/klimov";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Типы направленности. TODO: заменить описания на финальные тексты.
  for (const code of TYPE_CODES) {
    await prisma.orientationType.upsert({
      where: { code },
      update: {},
      create: { code, name: TYPE_NAMES[code], description: `Описание типа «${TYPE_NAMES[code]}» (заполняется администратором).` },
    });
  }

  // Тест и вопросы (тексты — из klimov-questions.ts).
  const test = await prisma.test.upsert({
    where: { type: "klimov_ddo" },
    update: {},
    create: { type: "klimov_ddo", name: "ДДО Климова", description: "Дифференциально-диагностический опросник" },
  });
  for (let n = 1; n <= QUESTION_COUNT; n++) {
    const { scaleA, scaleB } = KEY[n];
    await prisma.question.upsert({
      where: { testId_questionNumber: { testId: test.id, questionNumber: n } },
      update: { scaleA, scaleB },
      create: { testId: test.id, questionNumber: n, optionA: QUESTION_TEXTS[n - 1][0], optionB: QUESTION_TEXTS[n - 1][1], scaleA, scaleB },
    });
  }

  // Начальный администратор из окружения.
  const login = process.env.ADMIN_LOGIN;
  const password = process.env.ADMIN_PASSWORD;
  if (login && password) {
    await prisma.user.upsert({
      where: { login },
      update: {},
      create: { login, fullName: "Администратор", role: "admin", passwordHash: await argon2.hash(password), mustChangePassword: true },
    });
  }
}

main().finally(() => prisma.$disconnect());
