import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PROFESSIONS, TYPE_DESCRIPTIONS } from "./data/professions";

/**
 * Стартовое наполнение справочника профессий. Безопасно запускать повторно:
 * - описание типа заменяется, только если там осталась заглушка из основного сида;
 * - профессия добавляется, только если профессии с таким названием в этом типе ещё нет;
 * - у существующих профессий пустые «предметы» и «как познакомиться» дополняются, заполненное не трогается.
 */
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  let created = 0;
  let filled = 0;
  let typesUpdated = 0;

  for (const [code, description] of Object.entries(TYPE_DESCRIPTIONS)) {
    const type = await prisma.orientationType.findUnique({ where: { code: code as never } });
    if (!type) continue;
    if (type.description.startsWith("Описание типа «")) {
      await prisma.orientationType.update({ where: { id: type.id }, data: { description } });
      typesUpdated++;
    }

    for (const p of PROFESSIONS[code] ?? []) {
      const existing = await prisma.profession.findFirst({ where: { typeId: type.id, name: p.name } });
      if (!existing) {
        await prisma.profession.create({ data: { ...p, typeId: type.id } });
        created++;
      } else if (!existing.subjects || !existing.howToExplore) {
        await prisma.profession.update({
          where: { id: existing.id },
          data: { subjects: existing.subjects ?? p.subjects, howToExplore: existing.howToExplore ?? p.howToExplore },
        });
        filled++;
      }
    }
  }
  console.log(`Типов обновлено: ${typesUpdated}, профессий добавлено: ${created}, дополнено: ${filled}`);
}

main().finally(() => prisma.$disconnect());
