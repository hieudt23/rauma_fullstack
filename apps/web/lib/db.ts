export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  image: string;
}

export const users: User[] = [
  {
    id: "u1",
    name: "Quản Trị Viên",
    email: "admin@ecommerce.com",
    password: "admin123",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "u2",
    name: "Nguyễn Văn Khách",
    email: "customer@ecommerce.com",
    password: "user123",
    role: "USER",
    status: "ACTIVE",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Nước ép Rau má đậu xanh",
    description:
      "Thức uống lành mạnh từ rau má tươi kết hợp đậu xanh nguyên chất, giải nhiệt tự nhiên, thanh lọc cơ thể hiệu quả. Không chất bảo quản, 100% nguyên liệu tự nhiên VietGAP.",
    price: 25000,
    stock: 50,
    category: "Nước uống",
    unit: "Chai 330ml",
    image: "https://images.unsplash.com/photo-1723960676433-7f1f233f218f?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "p2",
    name: "Trà rau má sấy khô cao cấp",
    description:
      "Rau má Việt Nam sấy lạnh theo công nghệ hiện đại, giữ nguyên hương vị và dưỡng chất quý. Pha trà uống mỗi ngày bổ sung vitamin K, C và khoáng chất thiết yếu.",
    price: 45000,
    stock: 30,
    category: "Nước uống",
    unit: "Hộp 100g",
    image: "https://images.unsplash.com/photo-1594134858547-8b126843389e?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "p3",
    name: "Rau má tươi đóng gói VietGAP",
    description:
      "Rau má trồng theo tiêu chuẩn hữu cơ VietGAP, thu hái mỗi buổi sáng sớm, đóng gói hút chân không giữ tươi ngon lên đến 7 ngày. Đảm bảo an toàn vệ sinh thực phẩm.",
    price: 18000,
    stock: 100,
    category: "Rau xanh",
    unit: "Bịch 200g",
    image: "https://images.unsplash.com/photo-1776257217010-1c2e92207f2a?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "p4",
    name: "Nem chua Thanh Hóa đặc sản",
    description:
      "Nem chua truyền thống Thanh Hóa chính gốc, làm từ thịt heo tươi chọn lọc kỹ, gói lá chuối và lá đinh lăng. Vị chua thanh, giòn sần sật, cay nhẹ đặc trưng miền Trung.",
    price: 35000,
    stock: 40,
    category: "Đồ ăn vặt",
    unit: "Gói 10 cái",
    image: "https://images.unsplash.com/photo-1600891965483-0a429ebf9076?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "p5",
    name: "Nem chua chiên giòn tỏi ớt",
    description:
      "Nem chua chiên vàng giòn rụm, tẩm ướp tỏi và ớt tươi thơm nức, ăn kèm nước chấm chua ngọt đặc biệt. Món ăn vặt cực kỳ hấp dẫn, thích hợp tiệc tùng và nhậu.",
    price: 28000,
    stock: 25,
    category: "Đồ ăn vặt",
    unit: "Hộp 8 cái",
    image: "https://images.unsplash.com/photo-1736604522360-608c09900076?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "p6",
    name: "Nước rau má mật ong chanh tươi",
    description:
      "Sự kết hợp hoàn hảo giữa rau má tươi, mật ong nguyên chất Tây Nguyên và chanh tươi vắt. Thức uống giải nhiệt tuyệt vời, tốt cho da, tăng cường hệ miễn dịch tự nhiên.",
    price: 30000,
    stock: 60,
    category: "Nước uống",
    unit: "Chai 350ml",
    image: "https://images.unsplash.com/photo-1608158454932-bec5a8364a30?w=800&h=600&fit=crop&q=80",
  },
];
