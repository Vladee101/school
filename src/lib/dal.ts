import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { findSession } from "@/lib/session";
import { ROLE_HOME, type Role } from "@/lib/roles";

export const requireAdmin = () => requireUser(["admin"]);

export const getCurrentUser = cache(async () => (await findSession())?.user ?? null);

/**
 * Серверная проверка доступа. Вызывать в каждой странице, server action и route handler.
 * Недопустимая роль -> редирект в свой раздел; нет входа -> /login.
 */
export async function requireUser(roles?: Role[], opts: { allowPasswordChange?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword && !opts.allowPasswordChange) redirect("/change-password");
  if (roles && !roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}
