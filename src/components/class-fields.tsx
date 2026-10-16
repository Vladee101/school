import { prisma } from "@/lib/db";
import { Field, inputCls } from "@/components/ui";

/** Общие поля формы класса (создание и правка). */
export async function ClassFields({ defaults }: { defaults?: { name: string; academicYear: string; teacherId: number | null } }) {
  const teachers = await prisma.user.findMany({ where: { role: "teacher", isActive: true }, orderBy: { fullName: "asc" } });
  return (
    <>
      <Field label="Название" hint="Например, 9А"><input name="name" defaultValue={defaults?.name} required className={inputCls} /></Field>
      <Field label="Учебный год" hint="Формат 2026/2027">
        <input name="academicYear" defaultValue={defaults?.academicYear} placeholder="2026/2027" required className={inputCls} />
      </Field>
      <Field label="Учитель">
        <select name="teacherId" defaultValue={defaults?.teacherId ?? ""} className={inputCls}>
          <option value="">— не назначен —</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
        </select>
      </Field>
    </>
  );
}
