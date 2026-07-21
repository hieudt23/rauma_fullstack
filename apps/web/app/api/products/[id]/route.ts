import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import ProductModel, { toProductDTO } from "@/models/Product";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { validateProductField } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

const FORBIDDEN = NextResponse.json(
  { message: "Không có quyền truy cập." },
  { status: 403 }
);

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    if (!(await requireAdmin(req))) return FORBIDDEN;

    await dbConnect();

    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID sản phẩm không hợp lệ." }, { status: 400 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const allowed = ["name", "description", "price", "stock", "category", "unit", "image"] as const;
    const update: Record<string, unknown> = {};

    for (const field of allowed) {
      if (field in body) {
        let value = body[field];
        if (field === "price" || field === "stock") value = Number(value);
        if (typeof value === "string") value = value.trim();

        const err = validateProductField(field, value);
        if (err) return NextResponse.json({ message: err }, { status: 400 });

        update[field] = value;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "Không có trường nào được cập nhật." }, { status: 400 });
    }

    const doc = await ProductModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!doc) {
      return NextResponse.json({ message: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    return NextResponse.json({ product: toProductDTO(doc) });
  } catch {
    return NextResponse.json({ message: "Lỗi server. Vui lòng thử lại." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    if (!(await requireAdmin(req))) return FORBIDDEN;

    await dbConnect();

    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID sản phẩm không hợp lệ." }, { status: 400 });
    }

    const doc = await ProductModel.findByIdAndDelete(id);
    if (!doc) {
      return NextResponse.json({ message: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    return NextResponse.json({ message: "Đã xóa sản phẩm thành công." });
  } catch {
    return NextResponse.json({ message: "Lỗi server. Vui lòng thử lại." }, { status: 500 });
  }
}
