import argon2 from "argon2";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Минимум 8 символов")
  .max(128, "Максимум 128 символов")
  .regex(/[A-Za-zА-Яа-яЁё]/, "Нужна хотя бы одна буква")
  .regex(/\d/, "Нужна хотя бы одна цифра");

export const hashPassword = (password: string) => argon2.hash(password);

export const verifyPassword = (hash: string, password: string) =>
  argon2.verify(hash, password).catch(() => false);

// Хэш-заглушка: выравнивает время ответа при неизвестном логине.
let dummyHash: Promise<string> | undefined;
export const getDummyHash = () => (dummyHash ??= argon2.hash("dummy-password-1"));
