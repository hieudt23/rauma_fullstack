import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import ProductModel from "@/models/Product";
import { Types } from "mongoose";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID sản phẩm không hợp lệ." }, { status: 400 });
    }

    const body = await req.json();
    const allowed = ["name", "description", "price", "stock", "category", "unit", "image"] as const;
    const update: Record<string, unknown> = {};

    for (const field of allowed) {
      if (field in body) {
        update[field] = body[field];
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

    return NextResponse.json({
      product: {
        id: (doc._id as Types.ObjectId).toString(),
        name: doc.name,
        description: doc.description,
        price: doc.price,
        stock: doc.stock,
        category: doc.category,
        unit: doc.unit,
        image: doc.image,
      },
    });
  } catch {
    return NextResponse.json({ message: "Lỗi server. Vui lòng thử lại." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
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
