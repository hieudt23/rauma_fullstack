import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import ProductModel from "@/models/Product";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query =
      category && category !== "Tất cả" ? { category } : {};

    const docs = await ProductModel.find(query).lean();

    const products = docs.map((p) => ({
      id: (p._id as Types.ObjectId).toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      unit: p.unit,
      image: p.image,
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, description, price, stock, category, unit, image } = body as {
      name: string;
      description?: string;
      price: number;
      stock?: number;
      category: string;
      unit?: string;
      image?: string;
    };

    if (!name || !price || !category) {
      return NextResponse.json(
        { message: "Tên, giá và danh mục sản phẩm là bắt buộc." },
        { status: 400 }
      );
    }

    const doc = await ProductModel.create({
      name,
      description: description ?? "",
      price: Number(price),
      stock: Number(stock ?? 0),
      category,
      unit: unit ?? "Sản phẩm",
      image: image ?? `https://picsum.photos/seed/${Date.now()}/400/300`,
    });

    const product = {
      id: (doc._id as Types.ObjectId).toString(),
      name: doc.name,
      description: doc.description,
      price: doc.price,
      stock: doc.stock,
      category: doc.category,
      unit: doc.unit,
      image: doc.image,
    };

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
