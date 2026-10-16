import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { Field, cardCls, inputCls } from "@/components/ui";
import { updateOrientationType } from "../actions";

export const metadata = { title: "Описания типов направленности" };

export default async function TypesPage() {
  await requireAdmin();
  const types = await prisma.orientationType.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/professions" className="text-sm text-blue-700 hover:underline">← Профессии</Link>
        <h1 className="mt-2 text-2xl font-bold">Описания типов направленности</h1>
        <p className="text-sm text-gray-600">Эти описания ученики видят в результатах теста. Названия и ключ методики не редактируются.</p>
      </div>
      {types.map((t) => (
        <section key={t.id} className={cardCls}>
          <h2 className="mb-3 font-semibold">{t.name}</h2>
          <ActionForm action={updateOrientationType.bind(null, t.id)} submitLabel="Сохранить">
            <Field label="Описание"><textarea name="description" defaultValue={t.description} required rows={5} className={inputCls} /></Field>
          </ActionForm>
        </section>
      ))}
    </main>
  );
}
