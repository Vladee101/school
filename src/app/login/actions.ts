"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { zodFail } from "@/lib/form-state";
import { prisma } from "@/lib/db";
import { getDummyHash, verifyPassword } from "@/lib/password";
import { clearFailedLogins, isLoginBlocked, recordFailedLogin } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { ROLE_HOME } from "@/lib/roles";

const schema = z.object({
  login: z.string().trim().min(1, "Введите логин").max(64),
  password: z.string().min(1, "Введите пароль").max(128),
});

export type LoginState = { error?: string; field?: string } | undefined;

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { login, password } = parsed.data;
  const ip = await clientIp();

  if (await isLoginBlocked(login, ip)) {
    return { error: "Слишком много неудачных попыток входа. Попробуйте через 15 минут.", field: "login" };
  }

  const user = await prisma.user.findUnique({ where: { login } });
  const ok = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), password);

  // Одинаковое сообщение для неверного пароля, неизвестного и неактивного пользователя.
  if (!user || !ok || !user.isActive) {
    await recordFailedLogin(login, ip);
    return { error: "Неверный логин или пароль", field: "login,password" };
  }

  await clearFailedLogins(login);
  await createSession(user.id);
  redirect(user.mustChangePassword ? "/change-password" : ROLE_HOME[user.role]);
}
