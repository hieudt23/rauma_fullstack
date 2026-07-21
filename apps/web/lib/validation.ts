const ALLOWED_IMAGE_HOSTS = new Set(["picsum.photos", "images.unsplash.com"]);

const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_CATEGORY_LENGTH = 100;
const MAX_UNIT_LENGTH = 100;
const MAX_PRICE = 1_000_000_000;
const MAX_STOCK = 1_000_000;

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  image?: string;
}

/** Validates a single field's presence/shape without requiring the others (for PATCH). */
export function validateProductField(
  field: keyof ProductInput,
  value: unknown
): string | null {
  switch (field) {
    case "name":
      if (typeof value !== "string" || !value.trim()) return "Tên sản phẩm không hợp lệ.";
      if (value.length > MAX_NAME_LENGTH) return `Tên sản phẩm không được vượt quá ${MAX_NAME_LENGTH} ký tự.`;
      return null;
    case "description":
      if (typeof value !== "string") return "Mô tả sản phẩm không hợp lệ.";
      if (value.length > MAX_DESCRIPTION_LENGTH) return `Mô tả không được vượt quá ${MAX_DESCRIPTION_LENGTH} ký tự.`;
      return null;
    case "price":
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > MAX_PRICE)
        return "Giá sản phẩm không hợp lệ.";
      return null;
    case "stock":
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > MAX_STOCK)
        return "Số lượng tồn kho không hợp lệ.";
      return null;
    case "category":
      if (typeof value !== "string" || !value.trim()) return "Danh mục không hợp lệ.";
      if (value.length > MAX_CATEGORY_LENGTH) return `Danh mục không được vượt quá ${MAX_CATEGORY_LENGTH} ký tự.`;
      return null;
    case "unit":
      if (typeof value !== "string") return "Đơn vị không hợp lệ.";
      if (value.length > MAX_UNIT_LENGTH) return `Đơn vị không được vượt quá ${MAX_UNIT_LENGTH} ký tự.`;
      return null;
    case "image":
      if (value === undefined || value === null || value === "") return null;
      if (typeof value !== "string") return "URL hình ảnh không hợp lệ.";
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(url.hostname)) {
          return "URL hình ảnh phải dùng https và thuộc danh sách host cho phép.";
        }
      } catch {
        return "URL hình ảnh không hợp lệ.";
      }
      return null;
    default:
      return null;
  }
}
