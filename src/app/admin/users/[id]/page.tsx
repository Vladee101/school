import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { Field, cardCls, dangerCls, inputCls } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteUser, resetPassword, updateUser } from "../actions";

export const metadata = { title: "Пользователь" };

const ROLE_LABEL = { student: "Ученик", teacher: "Учитель", admin: "Администратор" } as const;

export default async function EditUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const admin = await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const user = await prisma.user.findUnique({ where: { id }, include: { studentClass: true, taughtClasses: true, _count: { select: { results: true } } } });
  if (!user) notFound();
  const classes = user.role === "student" ? await prisma.schoolClass.findMany({ orderBy: [{ academicYear: "desc" }, { name: "asc" }] }) : [];

  return (
    <main className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-blue-700 hover:underline">← Пользователи</Link>
        <h1 className="mt-2 text-2xl font-bold">{user.fullName}</h1>
        <p className="text-sm text-gray-600">
          {ROLE_LABEL[user.role]} · логин <code>{user.login}</code>
          {user.mustChangePassword && " · ожидает смены временного пароля"}
        </p>
        {user.role === "teacher" && (
          <p className="text-sm text-gray-600">
            Классы: {user.taughtClasses.length ? user.taughtClasses.map((c) => c.name).join(", ") : "не назначены"} (назначаются в разделе «Классы»)
          </p>
        )}
      </div>

      <section className={cardCls}>
        <h2 className="mb-3 font-semibold">Данные</h2>
        <ActionForm action={updateUser.bind(null, user.id)} submitLabel="Сохранить">
          <Field label="ФИО"><input name="fullName" defaultValue={user.fullName} required className={inputCls} /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={user.email ?? ""} className={inputCls} /></Field>
          {user.role === "student" && (
            <Field label="Класс">
              <select name="classId" defaultValue={user.studentClass?.classId ?? ""} required className={inputCls}>
                <option value="" disabled>— выберите —</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>)}
              </select>
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={user.isActive} /> Учётная запись активна
          </label>
        </ActionForm>
      </section>

      <section className={cardCls}>
        <h2 className="mb-3 font-semibold">Сброс пароля</h2>
        <ActionForm action={resetPassword.bind(null, user.id)} submitLabel="Задать временный пароль">
          <Field label="Новый временный пароль" hint="Пользователь будет разлогинен и обязан сменить пароль при входе.">
            <input name="password" type="text" required autoComplete="off" className={inputCls} />
          </Field>
        </ActionForm>
      </section>

      <section className={cardCls}>
        <h2 className="mb-2 font-semibold">Удаление</h2>
        {user.id === admin.id ? (
          <p className="text-sm text-gray-600">Собственную учётную запись удалить нельзя.</p>
        ) : user._count.results > 0 ? (
          <p className="text-sm text-gray-600">
            Удалить нельзя: у пользователя есть результаты тестов ({user._count.results}). Чтобы закрыть доступ, снимите галочку
            «Учётная запись активна».
          </p>
        ) : (
          <form action={deleteUser.bind(null, user.id)}>
            <p className="mb-3 text-sm text-gray-600">
              Учётная запись будет удалена безвозвратно.
              {user.role === "teacher" && user.taughtClasses.length > 0 && ` Классы (${user.taughtClasses.map((c) => c.name).join(", ")}) останутся без учителя.`}
            </p>
            <ConfirmButton message={`Удалить пользователя «${user.fullName}» безвозвратно?`} className={dangerCls}>
              Удалить пользователя
            </ConfirmButton>
          </form>
        )}
      </section>
    </main>
  );
}
