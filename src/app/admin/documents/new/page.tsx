import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { DocumentFields } from "@/components/document-fields";
import { createDocument } from "../actions";

export const metadata = { title: "Новый документ" };

export default async function NewDocumentPage() {
  await requireAdmin();
  const categories = (await prisma.document.findMany({ distinct: ["category"], select: { category: true } })).map((c) => c.category);
  return (
    <main className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Новый документ</h1>
      <ActionForm action={createDocument} submitLabel="Сохранить"><DocumentFields categories={categories} /></ActionForm>
    </main>
  );
}
