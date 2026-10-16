export type Role = "student" | "teacher" | "admin";

export const ROLE_HOME: Record<Role, string> = {
  student: "/cabinet",
  teacher: "/teacher",
  admin: "/admin",
};
