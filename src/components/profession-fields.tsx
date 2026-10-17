import { prisma } from "@/lib/db";
import { Field, inputCls } from "@/components/ui";

type Defaults = { name: string; description: string; subjects: string | null; howToExplore: string | null; typeId: number; isActive: boolean };

export async function ProfessionFields({ defaults }: { defaults?: Defaults }) {
  const types = await prisma.orientationType.findMany({ orderBy: { id: "asc" } });
  return (
    <>
      <Field label="Название"><input name="name" defaultValue={defaults?.name} required className={inputCls} /></Field>
      <Field label="Тип направленности">
        <select name="typeId" defaultValue={defaults?.typeId ?? ""} required className={inputCls}>
          <option value="" disabled>— выберите —</option>
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label="Описание"><textarea name="description" defaultValue={defaults?.description} required rows={5} className={inputCls} /></Field>
      <Field label="Полезные школьные предметы" hint="Через запятую, например: математика, физика, информатика">
        <input name="subjects" defaultValue={defaults?.subjects ?? ""} className={inputCls} />
      </Field>
      <Field label="Как познакомиться с профессией" hint="Кружки, конкурсы, практика, с чего начать">
        <textarea name="howToExplore" defaultValue={defaults?.howToExplore ?? ""} rows={3} className={inputCls} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={defaults?.isActive ?? true} /> Активна (показывается в рекомендациях)
      </label>
    </>
  );
}
