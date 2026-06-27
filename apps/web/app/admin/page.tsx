"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  TrendingUp,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  LogOut,
  Leaf,
  LayoutDashboard,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@workspace/ui/components/dialog";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
}

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  image: string;
}

type ToastType = { message: string; type: "success" | "error" } | null;

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function Toast({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 ${
        toast.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      )}
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function AddProductDialog({
  onAdded,
}: {
  onAdded: (product: AdminProduct) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    unit: "",
    image: "",
  });
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.price || !form.category.trim()) {
      setError("Tên sản phẩm, giá và danh mục là bắt buộc.");
      return;
    }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setError("Giá sản phẩm phải là số dương hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          stock: Number(form.stock) || 0,
          category: form.category.trim(),
          unit: form.unit.trim() || "Sản phẩm",
          image: form.image.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Thêm sản phẩm thất bại.");
        return;
      }

      onAdded(data.product);
      setOpen(false);
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        unit: "",
        image: "",
      });
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = ["Nước uống", "Đồ ăn vặt", "Rau xanh", "Khác"];

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Thêm sản phẩm mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Package className="w-5 h-5 text-green-600" />
            Thêm Sản Phẩm Mới
          </DialogTitle>
          <DialogDescription>
            Điền thông tin sản phẩm bên dưới. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Vd: Nước ép Rau má đậu xanh"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                placeholder="25000"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock">Số lượng tồn kho</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                placeholder="50"
                value={form.stock}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">
                Danh mục <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
              >
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit">Đơn vị / Quy cách</Label>
              <Input
                id="unit"
                name="unit"
                placeholder="Vd: Chai 330ml"
                value={form.unit}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="image">URL hình ảnh</Label>
              <Input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Mô tả sản phẩm</Label>
              <Input
                id="description"
                name="description"
                placeholder="Mô tả ngắn về sản phẩm..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Đang thêm..." : "Thêm sản phẩm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, setUser } = useApp();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "products">(
    "overview"
  );
  const [toast, setToast] = useState<ToastType>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
    },
    []
  );

  // Auth guard
  useEffect(() => {
    if (user === null) return; // still hydrating
    if (!user || user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [user, router]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      showToast("Không thể tải danh sách người dùng.", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [showToast]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      showToast("Không thể tải danh sách sản phẩm.", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchUsers();
      fetchProducts();
    }
  }, [user, fetchUsers, fetchProducts]);

  const handleToggleBan = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message ?? "Lỗi cập nhật người dùng.", "error");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? data.user : u))
      );
      showToast(
        data.user.status === "BANNED"
          ? "Đã khóa tài khoản người dùng."
          : "Đã mở khóa tài khoản người dùng.",
        "success"
      );
    } catch {
      showToast("Lỗi kết nối. Vui lòng thử lại.", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message ?? "Lỗi xóa người dùng.", "error");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast("Đã xóa người dùng thành công.", "success");
    } catch {
      showToast("Lỗi kết nối. Vui lòng thử lại.", "error");
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Không có quyền truy cập</h2>
          <p className="text-gray-500 mt-2">Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const bannedUsers = users.filter((u) => u.status === "BANNED").length;

  const NAV_ITEMS = [
    { id: "overview", label: "Tổng quan", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "users", label: "Người dùng", icon: <Users className="w-4 h-4" /> },
    { id: "products", label: "Sản phẩm", icon: <Package className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Rau Má Admin</p>
              <p className="text-green-600 text-xs">Control Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span
                className={
                  activeTab === item.id ? "text-green-600" : "text-gray-400"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setUser(null);
              router.push("/");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tổng quan hệ thống
              </h1>
              <p className="text-gray-500 mt-1">
                Xin chào, {user.name}! Đây là trạng thái cửa hàng của bạn.
              </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                {
                  title: "Tổng người dùng",
                  value: users.length,
                  sub: `${activeUsers} đang hoạt động`,
                  icon: <Users className="w-6 h-6" />,
                  color: "blue",
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                },
                {
                  title: "Tổng sản phẩm",
                  value: products.length,
                  sub: "Trong kho hàng",
                  icon: <Package className="w-6 h-6" />,
                  color: "green",
                  bg: "bg-green-50",
                  text: "text-green-600",
                },
                {
                  title: "Doanh thu ước tính",
                  value: "12.4M",
                  sub: "+18% so với tháng trước",
                  icon: <TrendingUp className="w-6 h-6" />,
                  color: "purple",
                  bg: "bg-purple-50",
                  text: "text-purple-600",
                },
                {
                  title: "Tài khoản bị khóa",
                  value: bannedUsers,
                  sub: "Cần xem xét",
                  icon: <ShieldAlert className="w-6 h-6" />,
                  color: "red",
                  bg: "bg-red-50",
                  text: "text-red-600",
                },
              ].map((metric) => (
                <Card
                  key={metric.title}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          {metric.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                          {metric.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {metric.sub}
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 ${metric.bg} ${metric.text} rounded-xl flex items-center justify-center`}
                      >
                        {metric.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Người dùng gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 5).map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium text-sm">
                            {u.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.role === "ADMIN" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.status === "ACTIVE" ? "success" : "destructive"
                              }
                              className="text-xs"
                            >
                              {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-500" />
                    Sản phẩm nổi bật
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Kho</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.slice(0, 5).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium text-sm max-w-[160px]">
                            <span className="line-clamp-1">{p.name}</span>
                          </TableCell>
                          <TableCell className="text-green-600 font-semibold text-sm">
                            {formatPrice(p.price)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={p.stock > 10 ? "success" : "warning"}
                              className="text-xs"
                            >
                              {p.stock}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Quản lý người dùng
                </h1>
                <p className="text-gray-500 mt-1">
                  {users.length} người dùng — {activeUsers} đang hoạt động,{" "}
                  {bannedUsers} bị khóa
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="p-8 text-center text-gray-400">
                    Đang tải...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {u.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.role === "ADMIN" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {u.role === "ADMIN" ? "Quản trị" : "Khách hàng"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.status === "ACTIVE" ? "success" : "destructive"
                              }
                              className="text-xs"
                            >
                              {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleBan(u.id)}
                                disabled={u.role === "ADMIN"}
                                className={`gap-1.5 text-xs h-8 ${
                                  u.status === "ACTIVE"
                                    ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                                    : "border-green-200 text-green-600 hover:bg-green-50"
                                } disabled:opacity-30`}
                              >
                                {u.status === "ACTIVE" ? (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    Khóa
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    Mở khóa
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.role === "ADMIN"}
                                className="gap-1.5 text-xs h-8 disabled:opacity-30"
                              >
                                <Trash2 className="w-3 h-3" />
                                Xóa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Quản lý sản phẩm
                </h1>
                <p className="text-gray-500 mt-1">
                  {products.length} sản phẩm trong kho
                </p>
              </div>
              <AddProductDialog
                onAdded={(product) => {
                  setProducts((prev) => [...prev, product]);
                  showToast("Thêm sản phẩm thành công!", "success");
                }}
              />
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                {loadingProducts ? (
                  <div className="p-8 text-center text-gray-400">
                    Đang tải...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Đơn vị</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Tồn kho</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <div>
                              <p className="font-semibold text-sm text-gray-800 line-clamp-1">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                {p.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {p.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {p.unit}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-600 text-sm">
                              {formatPrice(p.price)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={p.stock > 10 ? "success" : p.stock > 0 ? "warning" : "destructive"}
                              className="text-xs"
                            >
                              {p.stock > 0 ? `${p.stock} sản phẩm` : "Hết hàng"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
