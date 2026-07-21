import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import UserModel, { toUserDTO } from "@/models/User";
import { createSession } from "@/lib/auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const GENERIC_INVALID_CREDENTIALS = {
  message: "Email hoặc mật khẩu không đúng.",
};

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
      return NextResponse.json(GENERIC_INVALID_CREDENTIALS, { status: 401 });
    }

    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - now.getTime()) / 60000
      );
      return NextResponse.json(
        {
          message: `Tài khoản đã bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút.`,
        },
        { status: 423 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const updated = await UserModel.findByIdAndUpdate(
        user._id,
        { $inc: { failedLoginAttempts: 1 } },
        { new: true }
      ).lean();
      const attempts = updated?.failedLoginAttempts ?? 1;

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await UserModel.findByIdAndUpdate(user._id, {
          failedLoginAttempts: 0,
          lockUntil: new Date(Date.now() + LOCK_DURATION_MS),
        });
        return NextResponse.json(
          {
            message: `Tài khoản đã bị tạm khóa 15 phút do đăng nhập sai quá ${MAX_FAILED_ATTEMPTS} lần liên tiếp.`,
          },
          { status: 423 }
        );
      }

      return NextResponse.json(GENERIC_INVALID_CREDENTIALS, { status: 401 });
    }

    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await UserModel.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 0,
        lockUntil: null,
      });
    }

    const safeUser = toUserDTO(user);

    // Cấp phiên có chữ ký (cookie HttpOnly). Đây là bằng chứng danh tính
    // duy nhất mà server tin — không phải object client giữ trong localStorage.
    await createSession({ userId: safeUser.id, role: user.role });

    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
