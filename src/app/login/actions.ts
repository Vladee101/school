"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getDummyHash, verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { ROLE_HOME } from "@/lib/roles";

const schema = z.object({
  login: z.string().trim().min(1, "Введите логин").max(64),
  password: z.string().min(1, "Введите пароль").max(128),
});

export type LoginState = { error?: string } | undefined;

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { login: parsed.data.login } });
  const ok = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), parsed.data.password);

  // Одинаковое сообщение для неверного пароля, неизвестного и неактивного пользователя.
  if (!user || !ok || !user.isActive) return { error: "Неверный логин или пароль" };

  await createSession(user.id);
  redirect(user.mustChangePassword ? "/change-password" : ROLE_HOME[user.role]);
}
