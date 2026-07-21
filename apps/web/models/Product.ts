import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  image: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true, trim: true },
    unit: { type: String, default: "Sản phẩm", trim: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const ProductModel: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ??
  mongoose.model<IProduct>("Product", ProductSchema);

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  image: string;
}

/** Chuyển product doc (lean hoặc hydrated) thành DTO gửi ra client. */
export function toProductDTO(p: {
  _id: unknown;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  image: string;
}): ProductDTO {
  return {
    id: String(p._id),
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category: p.category,
    unit: p.unit,
    image: p.image,
  };
}

export default ProductModel;
