import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email và mật khẩu không được để trống." },
      { status: 400 }
    );
  }

  const found = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!found) {
    return NextResponse.json(
      { message: "Email hoặc mật khẩu không đúng." },
      { status: 401 }
    );
  }

  if (found.status === "BANNED") {
    return NextResponse.json(
      { message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ." },
      { status: 403 }
    );
  }

  const { password: _pw, ...safeUser } = found;
  return NextResponse.json({ user: safeUser }, { status: 200 });
}
