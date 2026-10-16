import { describe, expect, it } from "vitest";
import { passwordSchema } from "./password";

describe("passwordSchema", () => {
  it.each(["abc12", "abcdefgh", "12345678", "a".repeat(129) + "1"])("отклоняет %s", (p) => {
    expect(passwordSchema.safeParse(p).success).toBe(false);
  });
  it.each(["abcdefg1", "Пароль2026"])("принимает %s", (p) => {
    expect(passwordSchema.safeParse(p).success).toBe(true);
  });
});
