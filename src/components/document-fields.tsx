import { Field, inputCls } from "@/components/ui";
import { CategoryField } from "@/components/category-field";
import { PdfUpload } from "@/components/pdf-upload";

type Defaults = { name: string; category: string; filePath: string; isPublished: boolean };

export function DocumentFields({ defaults, categories }: { defaults?: Defaults; categories: string[] }) {
  return (
    <>
      <Field label="Название"><input name="name" defaultValue={defaults?.name} required className={inputCls} /></Field>
      <CategoryField categories={categories} defaultValue={defaults?.category} />
      <PdfUpload currentUrl={defaults?.filePath} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={defaults?.isPublished} /> Опубликован (виден всем посетителям)
      </label>
    </>
  );
}
