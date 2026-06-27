import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/db";

export async function GET() {
  const safeUsers = users.map(({ password: _pw, ...u }) => u);
  return NextResponse.json({ users: safeUsers }, { status: 200 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id } = body as { id: string };

  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return NextResponse.json({ message: "Người dùng không tồn tại." }, { status: 404 });
  }

  users[idx].status = users[idx].status === "ACTIVE" ? "BANNED" : "ACTIVE";
  const { password: _pw, ...safeUser } = users[idx];
  return NextResponse.json({ user: safeUser }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID người dùng không hợp lệ." }, { status: 400 });
  }

  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return NextResponse.json({ message: "Người dùng không tồn tại." }, { status: 404 });
  }

  users.splice(idx, 1);
  return NextResponse.json({ message: "Xóa người dùng thành công." }, { status: 200 });
}
