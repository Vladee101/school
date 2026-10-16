import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { ClassFields } from "@/components/class-fields";
import { createClass } from "../actions";

export const metadata = { title: "Новый класс" };

export default async function NewClassPage() {
  await requireAdmin();
  return (
    <main className="max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Новый класс</h1>
      <ActionForm action={createClass} submitLabel="Создать">
        <ClassFields />
      </ActionForm>
    </main>
  );
}
