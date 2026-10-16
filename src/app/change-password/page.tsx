import { requireUser } from "@/lib/dal";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Смена пароля" };

export default async function ChangePasswordPage() {
  const user = await requireUser(undefined, { allowPasswordChange: true });
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Смена пароля</h1>
      {user.mustChangePassword && <p>Вы вошли с временным паролем. Задайте свой пароль, чтобы продолжить.</p>}
      <ChangePasswordForm />
    </main>
  );
}
