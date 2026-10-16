import { NextResponse, type NextRequest } from "next/server";

// Оптимистичная проверка: только наличие cookie. Реальная проверка прав — в src/lib/dal.ts.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("sid")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/cabinet/:path*", "/teacher/:path*", "/admin/:path*", "/change-password"],
};
