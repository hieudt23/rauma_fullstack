import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import { AppProvider } from "@/context/AppContext";
import { cn } from "@workspace/ui/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Đặc Sản Rau Má & Nem Chua | Tinh Hoa Việt",
  description:
    "Cửa hàng đặc sản rau má và nem chua chất lượng cao, đảm bảo vệ sinh an toàn thực phẩm.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={cn("antialiased", fontMono.variable, geist.variable)}
    >
      <body className="font-sans bg-white text-gray-900">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
