import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { NewsFields } from "@/components/news-fields";
import { createNews } from "../actions";

export const metadata = { title: "Новая новость" };

export default async function NewNewsPage() {
  await requireAdmin();
  return (
    <main className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Новая новость</h1>
      <ActionForm action={createNews} submitLabel="Создать"><NewsFields /></ActionForm>
    </main>
  );
}
