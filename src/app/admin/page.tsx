import { requireUser } from "@/lib/dal";
import { logout } from "../logout-action";

export const metadata = { title: "Панель администратора" };

export default async function Page() {
  const user = await requireUser(["admin"]);
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Панель администратора</h1>
      <p className="mt-2">{user.fullName}</p>
      <form action={logout} className="mt-4"><button className="rounded border px-3 py-1">Выйти</button></form>
    </main>
  );
}
