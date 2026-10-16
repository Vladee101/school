import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { btnCls } from "@/components/ui";

export const metadata = { title: "Пользователи" };

const ROLE_LABEL = { student: "Ученик", teacher: "Учитель", admin: "Администратор" } as const;
const FILTERS = [
  { value: undefined, label: "Все" },
  { value: "student", label: "Ученики" },
  { value: "teacher", label: "Учителя" },
  { value: "admin", label: "Администраторы" },
] as const;

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  await requireAdmin();
  const raw = (await searchParams).role;
  const role = raw === "student" || raw === "teacher" || raw === "admin" ? raw : undefined;

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
    include: { studentClass: { include: { class: true } } },
  });

  return (
    <main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <Link href="/admin/users/new" className={btnCls}>Создать пользователя</Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/users?role=${f.value}` : "/admin/users"}
            className={`rounded-full border px-3 py-1 ${f.value === role ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-300 bg-white"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">ФИО</th>
              <th className="p-3">Логин</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Класс</th>
              <th className="p-3">Статус</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium">{u.fullName}</td>
                <td className="p-3">{u.login}</td>
                <td className="p-3">{ROLE_LABEL[u.role]}</td>
                <td className="p-3">{u.studentClass?.class.name ?? "—"}</td>
                <td className="p-3">{u.isActive ? "Активен" : <span className="text-red-600">Отключён</span>}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/users/${u.id}`} className="text-blue-700 hover:underline">Изменить</Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Пользователей нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
