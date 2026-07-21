import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import ProductModel, { toProductDTO } from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { validateProductField } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query =
      category && category !== "Tất cả" ? { category } : {};

    const docs = await ProductModel.find(query).lean();
    const products = docs.map(toProductDTO);

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
    if (!(await requireAdmin(req)))
      return NextResponse.json(
        { message: "Không có quyền truy cập." },
        { status: 403 }
      );

    await dbConnect();

    const body = (await req.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);
    const stock = body.stock === undefined ? 0 : Number(body.stock);
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const unit = typeof body.unit === "string" && body.unit.trim() ? body.unit.trim() : "Sản phẩm";
    const image =
      typeof body.image === "string" && body.image.trim()
        ? body.image.trim()
        : `https://picsum.photos/seed/${Date.now()}/400/300`;

    for (const [field, value] of Object.entries({ name, description, price, stock, category, unit, image })) {
      const err = validateProductField(field as never, value);
      if (err) return NextResponse.json({ message: err }, { status: 400 });
    }

    const doc = await ProductModel.create({
      name,
      description,
      price,
      stock,
      category,
      unit,
      image,
    });

    return NextResponse.json({ product: toProductDTO(doc) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Lỗi server. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
