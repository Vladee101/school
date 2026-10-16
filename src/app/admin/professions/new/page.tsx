import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { ProfessionFields } from "@/components/profession-fields";
import { createProfession } from "../actions";

export const metadata = { title: "Новая профессия" };

export default async function NewProfessionPage() {
  await requireAdmin();
  return (
    <main className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Новая профессия</h1>
      <ActionForm action={createProfession} submitLabel="Создать"><ProfessionFields /></ActionForm>
    </main>
  );
}
