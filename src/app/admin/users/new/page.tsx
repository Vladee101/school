import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { Field, inputCls } from "@/components/ui";
import { createUser } from "../actions";

export const metadata = { title: "Новый пользователь" };

export default async function NewUserPage() {
  await requireAdmin();
  const classes = await prisma.schoolClass.findMany({ orderBy: [{ academicYear: "desc" }, { name: "asc" }] });

  return (
    <main className="max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Новый пользователь</h1>
      <ActionForm action={createUser} submitLabel="Создать">
        <Field label="Роль">
          <select name="role" defaultValue="student" className={inputCls}>
            <option value="student">Ученик</option>
            <option value="teacher">Учитель</option>
            <option value="admin">Администратор</option>
          </select>
        </Field>
        <Field label="ФИО"><input name="fullName" required className={inputCls} /></Field>
        <Field label="Логин" hint="Латиница, цифры, точка, дефис, подчёркивание"><input name="login" required autoComplete="off" className={inputCls} /></Field>
        <Field label="Временный пароль" hint="Минимум 8 символов, буква и цифра. При первом входе пользователь обязан его сменить.">
          <input name="password" type="text" required autoComplete="off" className={inputCls} />
        </Field>
        <Field label="Класс (только для ученика)">
          <select name="classId" defaultValue="" className={inputCls}>
            <option value="">— не выбран —</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>)}
          </select>
        </Field>
        <Field label="Email (необязательно)"><input name="email" type="email" className={inputCls} /></Field>
      </ActionForm>
    </main>
  );
}
