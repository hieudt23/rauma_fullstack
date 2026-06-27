import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu không được để trống." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    if (user.status === "BANNED") {
      return NextResponse.json(
        { message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ." },
        { status: 403 }
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
  } catch {
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
