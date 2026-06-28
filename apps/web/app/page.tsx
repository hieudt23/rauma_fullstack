"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Leaf,
  Zap,
  ShieldCheck,
  Plus,
  Minus,
  Trash2,
  LogOut,
  User,
  Globe,
  Camera,
  Phone,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  SheetRoot,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";
import { Input } from "@workspace/ui/components/input";
import { useApp, type AppProduct } from "@/context/AppContext";

const CATEGORIES = ["Tất cả", "Nước uống", "Đồ ăn vặt", "Rau xanh"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: AppProduct;
  onAddToCart: (p: AppProduct) => void;
}) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200">
            <Leaf className="w-16 h-16 text-green-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant="success"
            className="text-xs font-semibold shadow-sm"
          >
            {product.unit}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
            {product.name}
          </h3>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-green-600">
            {formatPrice(product.price)}
          </span>
          <Badge variant="outline" className="text-xs">
            Còn {product.stock}
          </Badge>
        </div>
        <Button
          onClick={handleAdd}
          className={`w-full mt-1 transition-all duration-200 ${
            added
              ? "bg-green-500 text-white scale-95"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          size="sm"
        >
          {added ? "Đã thêm ✓" : "Thêm vào giỏ"}
        </Button>
      </div>
    </div>
  );
}

function CartSheet() {
  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useApp();

  return (
    <SheetRoot>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-green-50 transition-colors">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1">
              {cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Giỏ hàng ({cartCount} sản phẩm)
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
            <ShoppingCart className="w-16 h-16 opacity-30" />
            <p className="text-sm">Giỏ hàng đang trống</p>
            <p className="text-xs">Thêm sản phẩm để bắt đầu mua sắm</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={() => {}}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{product.unit}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-4 border-t space-y-3 bg-white">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Tạm tính:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Phí vận chuyển sẽ được tính khi đặt hàng
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white h-11 text-base font-semibold rounded-xl"
                onClick={() => {
                  alert(
                    `Đặt hàng thành công!\nTổng tiền: ${formatPrice(cartTotal)}\n\nCảm ơn bạn đã mua sắm tại Đặc Sản Rau Má! 🌿`
                  );
                  clearCart();
                }}
              >
                Đặt hàng ngay
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                Xóa giỏ hàng
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </SheetRoot>
  );
}

export default function StorefrontPage() {
  const { user, setUser, addToCart } = useApp();
  const [products, setProducts] = useState<AppProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== "Tất cả") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-gray-800 text-lg leading-tight">
                Rau Má<br />
                <span className="text-green-600 text-xs font-medium">Đặc Sản Việt</span>
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-green-500/30 focus-visible:border-green-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Quick Select */}
            <div className="hidden md:flex items-center gap-1">
              {CATEGORIES.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-green-100 text-green-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Cart + User */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <CartSheet />
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                    <User className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      {user.name.split(" ").pop()}
                    </span>
                  </div>
                  {user.role === "ADMIN" && (
                    <Link href="/admin">
                      <Button size="sm" variant="outline" className="text-xs">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <button
                    onClick={() => setUser(null)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-xs backdrop-blur-sm">
              🌿 Đặc sản thiên nhiên Việt Nam
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Tinh Hoa Đặc Sản Việt
              <span className="block text-green-200 mt-1">
                Tươi Ngon Mỗi Ngày
              </span>
            </h1>
            <p className="text-green-100 text-lg mb-8 leading-relaxed">
              Rau má sạch VietGAP, nem chua Thanh Hóa chính gốc — hương vị
              truyền thống, chất lượng đảm bảo, giao tận cửa.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-green-700 hover:bg-green-50 font-semibold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Mua sắm ngay
              </Button>
              <Button
                variant="ghost"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-700 h-12 px-8 rounded-xl font-semibold transition-all"
                size="lg"
              >
                Liên hệ ngay
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg">
            {[
              { icon: <Leaf className="w-5 h-5" />, label: "100% Sạch Hữu Cơ" },
              { icon: <Zap className="w-5 h-5" />, label: "Giao Hàng Tốc Hành" },
              { icon: <ShieldCheck className="w-5 h-5" />, label: "Đạt Chuẩn ATVSTP" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
              >
                <div className="text-green-200">{icon}</div>
                <span className="text-xs font-medium text-white/90 text-center leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT CATALOG */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Sản Phẩm Đặc Sản
          </h2>
          <p className="text-gray-500">
            Được tuyển chọn từ những vùng đất tốt nhất Việt Nam
          </p>
        </div>

        <TabsRoot
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="bg-gray-100">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm font-medium"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat}>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border bg-gray-50 animate-pulse"
                    >
                      <div className="aspect-[4/3] bg-gray-200 rounded-t-2xl" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-8 bg-gray-200 rounded mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg">Không tìm thấy sản phẩm</p>
                  <p className="text-sm mt-1">Thử từ khóa khác nhé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </TabsRoot>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">
                  Rau Má Đặc Sản Việt
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Chúng tôi cung cấp các sản phẩm từ rau má và đặc sản nem chua
                Thanh Hóa chất lượng cao, cam kết vệ sinh an toàn thực phẩm,
                giao hàng nhanh toàn quốc.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm">
                {["Trang chủ", "Sản phẩm", "Giới thiệu", "Liên hệ"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="hover:text-green-400 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                  0909 123 456
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                  contact@raumaviet.vn
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  123 Đường Nguyễn Trãi, Q.1, TP.HCM
                </li>
              </ul>
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Email của bạn"
                  className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 text-sm h-9"
                />
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0 h-9 w-9 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
            © 2026 Rau Má Đặc Sản Việt. Bảo lưu mọi quyền.
          </div>
        </div>
      </footer>
    </div>
  );
}
