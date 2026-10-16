import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { ROLE_HOME } from "@/lib/roles";
import { SCHOOL } from "@/lib/school";

const LINKS = [
  { href: "/news", label: "Новости" },
  { href: "/documents", label: "Документы" },
  { href: "/schedule", label: "Расписание" },
  { href: "/about", label: "О школе" },
];

const linkClass = "block rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const account = user
    ? { href: ROLE_HOME[user.role], label: "Личный кабинет" }
    : { href: "/login", label: "Войти" };

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-bold text-blue-900">
          {SCHOOL.shortName}
        </Link>

        {/* Без JS: мобильное меню на <details> */}
        <details className="group md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            Меню
          </summary>
          <nav className="absolute left-0 right-0 top-full border-b border-gray-200 bg-white p-2 shadow">
            {[...LINKS, account].map((l) => (
              <Link key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
        </details>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <Link href={account.href} className="ml-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {account.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
