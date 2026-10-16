import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { NewsFields } from "@/components/news-fields";
import { dangerCls } from "@/components/ui";
import { deleteNews, updateNews } from "../actions";

export const metadata = { title: "Редактирование новости" };

export default async function EditNewsPage({ params }: PageProps<"/admin/news/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const item = await prisma.news.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <main className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/news" className="text-sm text-blue-700 hover:underline">← Новости</Link>
        <h1 className="mt-2 text-2xl font-bold">Редактирование новости</h1>
      </div>
      <ActionForm action={updateNews.bind(null, item.id)} submitLabel="Сохранить">
        <NewsFields defaults={item} />
      </ActionForm>
      <form action={deleteNews.bind(null, item.id)} className="border-t border-gray-200 pt-4">
        <ConfirmButton message="Удалить новость без возможности восстановления?" className={dangerCls}>Удалить новость</ConfirmButton>
      </form>
    </main>
  );
}
