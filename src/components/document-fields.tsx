import { Field, inputCls } from "@/components/ui";
import { PdfUpload } from "@/components/pdf-upload";

type Defaults = { name: string; category: string; filePath: string; isPublished: boolean };

export function DocumentFields({ defaults, categories }: { defaults?: Defaults; categories: string[] }) {
  return (
    <>
      <Field label="Название"><input name="name" defaultValue={defaults?.name} required className={inputCls} /></Field>
      <Field label="Категория" hint="Выберите из списка или введите новую">
        <input name="category" list="doc-categories" defaultValue={defaults?.category} required className={inputCls} />
        <datalist id="doc-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
      </Field>
      <PdfUpload currentUrl={defaults?.filePath} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={defaults?.isPublished} /> Опубликован (виден всем посетителям)
      </label>
    </>
  );
}
