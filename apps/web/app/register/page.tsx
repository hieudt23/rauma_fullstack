"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Địa chỉ email không hợp lệ.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
        return;
      }

      setSuccess("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800 text-xl leading-tight">
                Rau Má Đặc Sản
              </p>
              <p className="text-green-600 text-xs font-medium">Tinh Hoa Việt</p>
            </div>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl shadow-green-100/50 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
          <CardHeader className="px-8 pt-8 pb-2 text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Tạo tài khoản
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Đăng ký để trải nghiệm mua sắm tại Rau Má Đặc Sản.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-gray-700">
                  Họ và tên
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Nguyễn Văn A"
                    className="pl-10 h-11 border-gray-200 focus-visible:border-green-400 focus-visible:ring-green-500/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@example.com"
                    className="pl-10 h-11 border-gray-200 focus-visible:border-green-400 focus-visible:ring-green-500/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Ít nhất 6 ký tự"
                    className="pl-10 pr-10 h-11 border-gray-200 focus-visible:border-green-400 focus-visible:ring-green-500/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    className="pl-10 pr-10 h-11 border-gray-200 focus-visible:border-green-400 focus-visible:ring-green-500/20"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-snug">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-snug">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-200 transition-all hover:shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Đang tạo tài khoản...
                  </span>
                ) : (
                  "Tạo tài khoản"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-500">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="text-green-600 font-medium hover:text-green-700 transition-colors"
                >
                  Đăng nhập
                </Link>
              </p>
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-green-600 transition-colors block"
              >
                ← Quay về trang chủ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
