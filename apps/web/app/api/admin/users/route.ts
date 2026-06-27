import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Types } from "mongoose";

function toSafeUser(u: {
  _id: unknown;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
}) {
  return {
    id: (u._id as Types.ObjectId).toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
  };
}

export async function GET() {
  try {
    await dbConnect();

    const docs = await UserModel.find().lean();
    const users = docs.map(toSafeUser);

    return NextResponse.json({ users }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { id } = body as { id: string };

    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json(
        { message: "Người dùng không tồn tại." },
        { status: 404 }
      );
    }

    user.status = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
    await user.save();

    return NextResponse.json({ user: toSafeUser(user) }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID người dùng không hợp lệ." },
        { status: 400 }
      );
    }

    const result = await UserModel.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { message: "Người dùng không tồn tại." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Xóa người dùng thành công." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
