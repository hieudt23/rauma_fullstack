import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Lớp bảo vệ phía server: chặn mọi truy cập vào khu vực quản trị
 * (trang /admin và API /api/admin/*) trước khi request tới handler.
 * Danh tính lấy từ cookie phiên đã ký, không thể giả mạo từ client.
 */
export async function proxy(req: NextRequest) {
  const session = await getSession(req);
  const path = req.nextUrl.pathname;

  if (!session || session.role !== "ADMIN") {
    if (path.startsWith("/api")) {
      return NextResponse.json(
        { message: "Không có quyền truy cập." },
        { status: 403 }
      );
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
