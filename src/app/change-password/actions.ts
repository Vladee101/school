"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { hashPassword, passwordSchema, verifyPassword } from "@/lib/password";
import { createSession, destroyAllSessions } from "@/lib/session";
import { ROLE_HOME } from "@/lib/roles";

const schema = z
  .object({ current: z.string().min(1, "Введите текущий пароль"), next: passwordSchema, confirm: z.string() })
  .refine((v) => v.next === v.confirm, { message: "Пароли не совпадают", path: ["confirm"] });

export type ChangePasswordState = { error?: string } | undefined;

export async function changePassword(_: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const user = await requireUser(undefined, { allowPasswordChange: true });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (!(await verifyPassword(user.passwordHash, parsed.data.current))) return { error: "Текущий пароль неверен" };
  if (parsed.data.current === parsed.data.next) return { error: "Новый пароль должен отличаться от текущего" };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.next), mustChangePassword: false },
  });
  await destroyAllSessions(user.id);
  await createSession(user.id);
  redirect(ROLE_HOME[user.role]);
}
