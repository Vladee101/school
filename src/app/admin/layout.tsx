import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { logout } from "../logout-action";

const NAV = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/classes", label: "Классы" },
  { href: "/admin/news", label: "Новости" },
  { href: "/admin/documents", label: "Документы" },
  { href: "/admin/professions", label: "Профессии" },
  { href: "/teacher", label: "Результаты учеников" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser(["admin"]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">Администратор: {user.fullName}</p>
        <form action={logout}>
          <button className="text-sm text-blue-700 hover:underline">Выйти</button>
        </form>
      </div>
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-gray-200 pb-3">
        {NAV.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50">
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
