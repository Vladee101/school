import { Field, inputCls } from "@/components/ui";

type Defaults = { title: string; shortText: string; content: string; isPublished: boolean; publishedAt: Date | null };

const toDateInput = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Moscow" }).format(d) : "";

export function NewsFields({ defaults }: { defaults?: Defaults }) {
  return (
    <>
      <Field label="Заголовок"><input name="title" defaultValue={defaults?.title} required className={inputCls} /></Field>
      <Field label="Краткое описание" hint="Показывается в списке новостей">
        <textarea name="shortText" defaultValue={defaults?.shortText} required rows={2} className={inputCls} />
      </Field>
      <Field label="Полный текст"><textarea name="content" defaultValue={defaults?.content} required rows={10} className={inputCls} /></Field>
      <Field label="Дата публикации" hint="Если пусто, при публикации ставится сегодняшняя дата">
        <input name="publishedDate" type="date" defaultValue={toDateInput(defaults?.publishedAt ?? null)} className={inputCls} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={defaults?.isPublished} /> Опубликована (видна всем посетителям)
      </label>
    </>
  );
}
