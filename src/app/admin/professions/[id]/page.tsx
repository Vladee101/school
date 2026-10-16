import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { ProfessionFields } from "@/components/profession-fields";
import { updateProfession } from "../actions";

export const metadata = { title: "Редактирование профессии" };

export default async function EditProfessionPage({ params }: PageProps<"/admin/professions/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const profession = await prisma.profession.findUnique({ where: { id } });
  if (!profession) notFound();

  return (
    <main className="max-w-xl">
      <Link href="/admin/professions" className="text-sm text-blue-700 hover:underline">← Профессии</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Редактирование профессии</h1>
      <ActionForm action={updateProfession.bind(null, profession.id)} submitLabel="Сохранить">
        <ProfessionFields defaults={profession} />
      </ActionForm>
    </main>
  );
}
