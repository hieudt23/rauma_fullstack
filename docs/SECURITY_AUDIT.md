# Báo cáo phân tích lỗ hổng bảo mật — rauma_fullstack

Ngày: 2026-07-21
Phạm vi: `apps/web` (Next.js 16 App Router, MongoDB/Mongoose, bcryptjs)

---

## Tóm tắt mức độ

| # | Lỗ hổng | Mức độ | Vị trí |
|---|---------|--------|--------|
| 1 | API không có xác thực/phân quyền phía server | **CRITICAL** | `app/api/admin/*`, `app/api/products/*` |
| 2 | Cơ chế "phiên đăng nhập" chỉ nằm ở client (localStorage), server không cấp/kiểm tra token | **CRITICAL** | `context/AppContext.tsx`, tất cả route |
| 3 | Rò rỉ dữ liệu người dùng (PII) qua `GET /api/admin/users` | **CRITICAL** | `app/api/admin/users/route.ts` |
| 4 | Tài khoản admin mặc định cắm cứng trong code | **HIGH** | `lib/dbConnect.ts` |
| 5 | Chuỗi kết nối MongoDB chứa credential thật, quản lý secret yếu | **HIGH** | `.env.local` |
| 6 | Seed database chạy trong luồng request/production | **HIGH** | `lib/dbConnect.ts` |
| 7 | Không rate-limit theo IP; lockout theo tài khoản → DoS + account enumeration | **MEDIUM** | `app/api/auth/login/route.ts`, `register` |
| 8 | Thiếu security headers, CSP, CSRF, HTTPS enforcement, middleware | **MEDIUM** | toàn dự án |
| 9 | Thiếu validate kiểu dữ liệu đầu vào (products), field `image` URL không kiểm soát | **MEDIUM** | `app/api/products/*` |
| 10 | Lộ tồn tại tài khoản (user enumeration) khi đăng ký | **LOW** | `register/route.ts` |
| 11 | Rò rỉ thông điệp lỗi Mongoose ra client | **LOW** | `register/route.ts` |
| 12 | Phụ thuộc thư viện cần kiểm tra (`@types/mongoose` deprecated, chạy `npm audit`) | **LOW** | `package.json` |

---

## 1. CRITICAL — API không có xác thực/phân quyền phía server

Toàn bộ các route API thao tác ghi/xóa dữ liệu **không hề kiểm tra danh tính hay quyền hạn**:

- `GET/PUT/DELETE /api/admin/users` — bất kỳ ai cũng có thể liệt kê toàn bộ user, ban/unban, xóa user.
- `POST /api/products`, `PATCH/DELETE /api/products/[id]` — bất kỳ ai cũng tạo/sửa/xóa sản phẩm.

"Bảo vệ" duy nhất là ở phía client trong `app/admin/page.tsx`:

```ts
if (!user || user.role !== "ADMIN") {
  router.push("/login");
}
```

Đây chỉ là kiểm tra trên trình duyệt, **hoàn toàn không ngăn được request trực tiếp tới API**. Kẻ tấn công chỉ cần:

```bash
# Xóa bất kỳ user nào mà không cần đăng nhập
curl -X DELETE "https://<domain>/api/admin/users?id=<userId>"

# Liệt kê toàn bộ user + email
curl "https://<domain>/api/admin/users"

# Xóa toàn bộ sản phẩm
curl -X DELETE "https://<domain>/api/products/<id>"
```

**Hướng khắc phục**
- Áp dụng phân quyền phía server cho MỌI route nhạy cảm. Tạo helper `requireAuth(req)` và `requireAdmin(req)` đọc từ session/token đã ký (xem mục 2), trả 401/403 nếu không hợp lệ.
- Dùng Next.js `middleware.ts` để chặn `/api/admin/*` và `/admin/*` ở tầng edge trước khi vào handler.
- Nguyên tắc "deny by default": route mặc định yêu cầu xác thực, chỉ mở công khai những endpoint đọc cần thiết (ví dụ `GET /api/products`).

---

## 2. CRITICAL — Không có phiên đăng nhập thật; danh tính do client tự khai

`POST /api/auth/login` xác thực mật khẩu đúng, nhưng chỉ trả về một object user rồi client lưu vào `localStorage`:

```ts
// AppContext.tsx
const AUTH_SESSION_KEY = "auth_session";
localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(u));
```

Server **không cấp cookie/JWT/session nào**, và các request sau đó không mang theo bằng chứng danh tính. Hệ quả: kẻ tấn công tự "trở thành admin" bằng cách chỉnh localStorage trong DevTools:

```js
localStorage.setItem("auth_session",
  JSON.stringify({ id:"x", name:"x", email:"x", role:"ADMIN", status:"ACTIVE" }));
```

Đây là lỗi thiết kế xác thực căn bản (Broken Authentication). Kết hợp với mục 1, hệ thống thực chất không có bảo vệ nào ở server.

**Hướng khắc phục**
- Cấp phiên phía server: JWT ký bằng secret (thư viện `jose`) hoặc dùng thư viện có sẵn như **NextAuth/Auth.js** / **Lucia**.
- Lưu token trong cookie `HttpOnly; Secure; SameSite=Strict` — **không** để trong `localStorage` (tránh bị JS/XSS đọc trộm).
- Mọi route đọc danh tính từ cookie đã xác thực chữ ký, không bao giờ tin `role` do client gửi lên.
- Đặt thời hạn token ngắn + refresh token; hỗ trợ thu hồi (logout thực sự).

---

## 3. CRITICAL — Rò rỉ dữ liệu người dùng (PII)

`GET /api/admin/users` trả về danh sách toàn bộ user (tên, email, vai trò, trạng thái) mà không cần xác thực. Đây là rò rỉ PII và bản đồ tài khoản cho kẻ tấn công (biết ai là ADMIN để nhắm mục tiêu).

**Hướng khắc phục**: bọc endpoint bằng `requireAdmin` (mục 1–2); cân nhắc phân trang và chỉ trả trường tối thiểu cần thiết.

---

## 4. HIGH — Tài khoản admin mặc định cắm cứng

`lib/dbConnect.ts` tự seed admin khi DB rỗng:

```ts
bcrypt.hash("Admin@123", 12)
// email: admin@ecommerce.com  role: ADMIN
```

Bất kỳ ai đọc source (hoặc đoán) đều đăng nhập được bằng `admin@ecommerce.com / Admin@123`.

**Hướng khắc phục**
- Không seed tài khoản đặc quyền với mật khẩu cố định. Nếu cần khởi tạo admin, đọc từ biến môi trường bí mật và **bắt buộc đổi mật khẩu lần đăng nhập đầu**.
- Tách seed ra script chạy thủ công (không trong luồng runtime), chỉ dùng cho môi trường dev.

---

## 5. HIGH — Quản lý secret yếu / credential MongoDB lộ

`.env.local` chứa chuỗi kết nối MongoDB Atlas với username + password thật:

```
mongodb+srv://hieudthe200490_db_user:KGvRWo1EZh419yfR@cluster0.deiaqmq.mongodb.net/...
```

`.gitignore` đã loại `.env*` (tốt, hiện chưa bị commit), nhưng:
- Credential vẫn nằm plaintext trên đĩa và đã lộ trong quá trình làm việc → **cần đổi (rotate) ngay**.
- Dòng trong file thiếu tiền tố `MONGODB_URI=` nên `process.env.MONGODB_URI` sẽ `undefined` → vừa là bug cấu hình, vừa cho thấy quy trình quản lý secret chưa chuẩn.
- DB user dường như có quyền rộng.

**Hướng khắc phục**
- **Xoay vòng mật khẩu DB ngay** trên MongoDB Atlas.
- Sửa `.env.local` thành `MONGODB_URI=mongodb+srv://...`.
- Dùng secret manager của môi trường triển khai (Vercel Environment Variables) thay vì file trên đĩa cho production.
- Cấp DB user theo nguyên tắc tối thiểu quyền (chỉ đọc/ghi trên `rauma_db`), giới hạn IP allowlist trên Atlas.

---

## 6. HIGH — Seed database chạy trong luồng kết nối/production

`dbConnect()` gọi `seedDatabase()` mỗi lần thiết lập kết nối. Việc ghi dữ liệu như một tác dụng phụ của việc kết nối là rủi ro (chèn dữ liệu ngoài ý muốn, race condition, khó kiểm soát ở production).

**Hướng khắc phục**: tách seed thành lệnh riêng (`npm run seed`), chỉ chạy có chủ đích ở dev/staging; `dbConnect` chỉ nên kết nối.

---

## 7. MEDIUM — Rate limit chưa đủ; lockout gây DoS và account enumeration

Login có lockout theo tài khoản (5 lần sai → khóa 15 phút). Điểm yếu:
- **Không rate-limit theo IP**: brute-force nhiều tài khoản khác nhau, spam `register`, spam tạo product vẫn thoải mái.
- **Lockout theo tài khoản = DoS**: kẻ tấn công cố tình đăng nhập sai 5 lần để **khóa tài khoản nạn nhân** (nếu biết/đoán email).
- Không có captcha, không có backoff theo IP.

**Hướng khắc phục**
- Thêm rate limit theo IP + theo tài khoản (ví dụ `@upstash/ratelimit` với Redis, hoặc middleware) cho `login`, `register`, và các endpoint ghi.
- Cân nhắc captcha/adaptive challenge sau vài lần thất bại thay vì khóa cứng.
- Ghi log và cảnh báo khi có mẫu brute-force.

---

## 8. MEDIUM — Thiếu security headers, CSP, CSRF, middleware

Không có `middleware.ts`, không cấu hình security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options), không có bảo vệ CSRF, không ép HTTPS.

**Hướng khắc phục**
- Thêm headers trong `next.config.ts` (`headers()`), tối thiểu: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
- Khi chuyển sang cookie phiên: dùng `SameSite=Strict/Lax` + token CSRF cho các request thay đổi trạng thái.

---

## 9. MEDIUM — Thiếu validate kiểu dữ liệu đầu vào (products)

`POST /api/products` và `PATCH /api/products/[id]` nhận `body` và ép kiểu tối thiểu. Field `image` là URL do người dùng cung cấp, không kiểm soát; các field khác không giới hạn độ dài. React tự escape nội dung nên nguy cơ XSS thấp, nhưng URL/độ dài không kiểm soát vẫn là rủi ro (lưu trữ rác, SSRF gián tiếp nếu sau này fetch ảnh phía server).

**Hướng khắc phục**
- Dùng schema validation (ví dụ **Zod**) cho mọi body: kiểm kiểu, khoảng giá trị, độ dài tối đa.
- Với `image`: chỉ chấp nhận URL `https` thuộc danh sách host cho phép (đồng bộ với `next.config.ts remotePatterns`).

---

## 10–11. LOW — User enumeration & rò rỉ lỗi Mongoose

- `register` trả riêng "Email đã được sử dụng" → cho phép dò email tồn tại. (Login đã dùng thông điệp chung — tốt.)
- `register` trả nguyên `message` của `ValidationError` ra client → rò rỉ chi tiết nội bộ.

**Hướng khắc phục**: cân nhắc phản hồi trung tính khi đăng ký (ví dụ luôn "đã gửi email xác thực"); map lỗi validation sang thông điệp chung, log chi tiết ở server.

---

## 12. LOW — Phụ thuộc thư viện

`@types/mongoose@^5.11.96` đã deprecated (Mongoose tự cung cấp types). Các version như `mongoose ^9`, `next 16.2.6`, `lucide-react ^1.21.0` cần đối chiếu với bản phát hành thực tế.

**Hướng khắc phục**: chạy `npm audit` / `npm outdated` định kỳ, bật Dependabot; gỡ `@types/mongoose`.

---

## Thứ tự ưu tiên khắc phục

1. (Ngay lập tức) Rotate credential MongoDB; gỡ tài khoản admin mặc định.
2. Xây dựng xác thực phía server thật (JWT/cookie HttpOnly hoặc Auth.js) — mục 2.
3. Thêm phân quyền + middleware cho mọi route nhạy cảm — mục 1 & 3.
4. Rate limit theo IP + sửa cơ chế lockout — mục 7.
5. Validate đầu vào (Zod), security headers, tách seed — mục 6, 8, 9.
6. Dọn dependency, giảm rò rỉ thông tin — mục 10–12.
