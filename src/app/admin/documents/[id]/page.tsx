import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { DocumentFields } from "@/components/document-fields";
import { dangerCls } from "@/components/ui";
import { deleteDocument, updateDocument } from "../actions";

export const metadata = { title: "Редактирование документа" };

export default async function EditDocumentPage({ params }: PageProps<"/admin/documents/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) notFound();
  const categories = (await prisma.document.findMany({ distinct: ["category"], select: { category: true } })).map((c) => c.category);

  return (
    <main className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/documents" className="text-sm text-blue-700 hover:underline">← Документы</Link>
        <h1 className="mt-2 text-2xl font-bold">Редактирование документа</h1>
        <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 hover:underline">Открыть текущий PDF</a>
      </div>
      <ActionForm action={updateDocument.bind(null, doc.id)} submitLabel="Сохранить">
        <DocumentFields defaults={doc} categories={categories} />
      </ActionForm>
      <form action={deleteDocument.bind(null, doc.id)} className="border-t border-gray-200 pt-4">
        <ConfirmButton message="Удалить документ и файл без возможности восстановления?" className={dangerCls}>Удалить документ</ConfirmButton>
      </form>
    </main>
  );
}
