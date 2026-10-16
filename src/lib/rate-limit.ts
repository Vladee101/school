import { prisma } from "@/lib/db";

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILS_PER_LOGIN = 5;
export const MAX_FAILS_PER_IP = 30;

const loginKey = (login: string) => `l:${login.trim().toLowerCase()}`;
const ipKey = (ip: string) => `i:${ip}`;

async function countRecent(key: string, now: Date) {
  return prisma.loginAttempt.count({ where: { key, createdAt: { gt: new Date(now.getTime() - LOGIN_WINDOW_MS) } } });
}

/** true, если вход для этого логина/IP временно заблокирован из-за череды неудачных попыток. */
export async function isLoginBlocked(login: string, ip: string, now = new Date()) {
  const [byLogin, byIp] = await Promise.all([countRecent(loginKey(login), now), countRecent(ipKey(ip), now)]);
  return byLogin >= MAX_FAILS_PER_LOGIN || byIp >= MAX_FAILS_PER_IP;
}

export async function recordFailedLogin(login: string, ip: string) {
  await prisma.loginAttempt.createMany({ data: [{ key: loginKey(login) }, { key: ipKey(ip) }] });
  // Попутная чистка старых записей, отдельного планировщика не нужно.
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
}

export async function clearFailedLogins(login: string) {
  await prisma.loginAttempt.deleteMany({ where: { key: loginKey(login) } });
}
