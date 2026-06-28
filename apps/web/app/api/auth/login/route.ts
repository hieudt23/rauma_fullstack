import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      const parsed = await req.json();
      if (!parsed || typeof parsed !== "object") {
        return NextResponse.json(
          { message: "Dữ liệu yêu cầu không hợp lệ." },
          { status: 400 }
        );
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { message: "Dữ liệu yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }

    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email.trim() || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu không được để trống." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).lean();

    if (!user || user.status === "BANNED") {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    const safeUser = {
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
