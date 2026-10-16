import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { ROLE_HOME } from "@/lib/roles";
import { LoginForm } from "./login-form";

export const metadata = { title: "Вход" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role]);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Вход в портал</h1>
      <LoginForm />
    </main>
  );
}
