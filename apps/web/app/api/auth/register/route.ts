import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Types } from "mongoose";

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === 11000
  );
}

function isValidationError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: unknown }).name === "ValidationError"
  );
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

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

    const name = typeof body.name === "string" ? body.name : "";
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name.trim() || !email.trim() || !password) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return NextResponse.json(
        { message: "Email đã được sử dụng. Vui lòng chọn email khác." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const safeUser = {
      id: (newUser._id as Types.ObjectId).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json(
      { message: "Đăng ký thành công!", user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { message: "Email đã được sử dụng. Vui lòng chọn email khác." },
        { status: 400 }
      );
    }

    if (isValidationError(error)) {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Dữ liệu không hợp lệ.";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
