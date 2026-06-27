import { NextRequest, NextResponse } from "next/server";
import { products, type Product } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const result =
    category && category !== "Tất cả"
      ? products.filter((p) => p.category === category)
      : products;

  return NextResponse.json({ products: result }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, price, stock, category, unit, image } = body as Omit<
    Product,
    "id"
  >;

  if (!name || !price || !category) {
    return NextResponse.json(
      { message: "Tên, giá và danh mục sản phẩm là bắt buộc." },
      { status: 400 }
    );
  }

  const newProduct: Product = {
    id: `p${Date.now()}`,
    name,
    description: description ?? "",
    price: Number(price),
    stock: Number(stock ?? 0),
    category,
    unit: unit ?? "Sản phẩm",
    image: image ?? `https://picsum.photos/seed/${Date.now()}/400/300`,
  };

  products.push(newProduct);
  return NextResponse.json({ product: newProduct }, { status: 201 });
}
