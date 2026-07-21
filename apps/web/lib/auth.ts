import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

// Import động để `next/headers` (chỉ chạy ở Node runtime) không bị bundle vào
// proxy chạy trên edge — nơi getSession luôn được gọi kèm `req`.
async function cookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 2; // 2 giờ

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET chưa được cấu hình (cần chuỗi ngẫu nhiên >= 16 ký tự)."
    );
  }
  return new TextEncoder().encode(secret);
}

export interface Session {
  userId: string;
  role: "USER" | "ADMIN";
}

/**
 * Ký một JWT chứa danh tính và đặt vào cookie HttpOnly.
 * Vì token do server ký, client không thể tự sửa `role`.
 */
export async function createSession(payload: Session): Promise<void> {
  const token = await new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getSecret());

  (await cookieStore()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Đọc và xác minh phiên. Truyền `req` khi gọi từ proxy/route handler;
 * bỏ trống khi gọi từ Server Component.
 * Trả về null nếu không có token, chữ ký sai, hoặc đã hết hạn.
 */
export async function getSession(req?: NextRequest): Promise<Session | null> {
  const token = req
    ? req.cookies.get(COOKIE_NAME)?.value
    : (await cookieStore()).get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role === "ADMIN" ? "ADMIN" : "USER";
    return { userId: String(payload.userId ?? ""), role };
  } catch {
    return null;
  }
}

/** Xóa cookie phiên (đăng xuất thật sự phía server). */
export async function destroySession(): Promise<void> {
  (await cookieStore()).delete(COOKIE_NAME);
}

/**
 * Tiện ích dùng trong route handler: trả về session nếu là ADMIN, ngược lại null.
 */
export async function requireAdmin(req: NextRequest): Promise<Session | null> {
  const session = await getSession(req);
  if (!session || session.role !== "ADMIN") return null;
  return session;
}
