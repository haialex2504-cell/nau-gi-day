# TESTING GUIDE — NẤU GÌ ĐÂY PWA

> **Cập nhật lần cuối:** Tháng 4/2026 — Sau khi hoàn tất migration từ Supabase Auth → Firebase Auth  
> **Stack:** Next.js 15 · Firebase Auth + Firestore · Supabase Storage (ảnh) · PWA

---

## ⚙️ Môi trường test
- **Local:** `npm run dev` → http://localhost:3000 (sẽ redirect về `/vi` hoặc `/en`)
- **Auth:** Firebase Email/Password · Google OAuth · Email Link (Passwordless)
- **DB:** Cloud Firestore (Yêu thích, Công thức cá nhân) + In-memory cache (Công thức công khai)
- **Storage (ảnh):** Supabase Storage (bucket `recipe-images`)

**Tài khoản test:**  
Vào **Firebase Console → Authentication** để tạo tài khoản test trước khi chạy các flow có đăng nhập.

---

## 🗺️ Cấu trúc Navigation
App có **BottomNavBar** với 4 tab chính:
| Tab | Route | Mô tả |
|-----|-------|--------|
| Trang chủ | `/vi/` | Tìm kiếm + Cảm hứng |
| Yêu thích | `/vi/my-recipes` | Yêu thích + Của tôi (khi đăng nhập) |
| Thêm Món | `/vi/add-recipe` | Tạo/Sửa công thức cá nhân |
| Hồ sơ | Slide-up Sheet | Thông tin user + Đăng xuất |

---

## ✅ FLOW 1 — Trang Chủ & Tìm Kiếm Nguyên Liệu

**Mục đích:** Kiểm tra thuật toán tìm kiếm bằng nguyên liệu + hệ thống đồng nghĩa.

**Bước kiểm tra:**
1. Mở trang chủ (`/vi/`)
2. Nhập nguyên liệu vào ô tìm kiếm: `cà chua trứng`
3. Enter hoặc bấm Search
4. Quan sát trang Kết quả (`/vi/results?ingredients=...`)

**Kết quả mong đợi:**
- [x] Trang chủ tải không lỗi, có 5 ô Cảm hứng (Nhanh, Tiệc, Ăn sáng, Ăn vặt, Healthy)
- [x] Kết quả được xếp hạng theo số nguyên liệu khớp (nhiều nhất lên đầu)
- [x] Đồng nghĩa hoạt động: nhập `xà lách` tìm được cả công thức có `rau diếp`
- [x] Công thức cá nhân của người khác KHÔNG xuất hiện

**Dữ liệu test khuyến nghị:**
```
cà chua trứng      → Trứng sốt cà chua, ...
thịt heo gừng      → Thịt kho gừng, ...
quả tắc            → Gà kho tắc, ...
```

---

## ✅ FLOW 2 — Chi Tiết Công Thức

**Mục đích:** Kiểm tra hiển thị đầy đủ dữ liệu công thức.

**Bước kiểm tra:**
1. Từ trang Kết quả hoặc Trang chủ, bấm vào 1 thẻ công thức
2. Quan sát trang Chi tiết (`/vi/recipe/[id]`)
3. Bấm nút Back (←) để quay lại

**Kết quả mong đợi:**
- [x] Hiển thị: Ảnh bìa, Tên công thức (H1), Thời gian, Khẩu phần, Calo
- [x] Danh sách Nguyên liệu đầy đủ
- [x] Các Bước thực hiện đánh số thứ tự
- [x] Nút Tim (❤️) hiển thị đúng trạng thái (đã/chưa yêu thích)
- [x] Nút Chia sẻ và Sao chép công thức hoạt động
- [x] Nếu là tác giả công thức: Nút Sửa (✏️) xuất hiện
- [x] Nút Back quay về trang trước đó (không bị lỗi routing)
- [x] Không có ảnh bị 404 (kiểm tra trong DevTools → Network)

---

## ✅ FLOW 3 — Cảm Hứng (Inspiration Filters)

**Mục đích:** Kiểm tra bộ lọc thể loại từ trang chủ.

**Bước kiểm tra:**
1. Từ trang chủ, bấm vào từng ô cảm hứng

**Kết quả mong đợi với từng bộ lọc:**
| Bộ lọc | URL | Điều kiện lọc | Kiểm tra |
|--------|-----|--------------|---------|
| ⚡ Nhanh | `?q=quick` | `cooking_time <= 15 phút` | Tất cả kết quả ≤ 15 phút |
| 🔥 Tiệc | `?q=party` | Category: `an-vat`, `khai-vi` hoặc Sub: `nuong`, `chien` | Hợp lý với tiệc |
| 🍞 Ăn sáng | `?q=breakfast` | Category: `an-sang`, `pho-bun`, `xoi-com-chien`,... | Có bún, phở, cháo, xôi |
| 🍦 Ăn vặt | `?q=snack` | Category: `an-vat`, `trang-mieng-che` | Có chè, bánh, snack |
| 🌿 Healthy | `?q=healthy` | Category: `salad-goi`, `an-chay` hoặc calories < 400 | Thấp calo / chay |

- [x] Mỗi bộ lọc trả về kết quả phù hợp (không rỗng)
- [x] Kết quả có thể mở chi tiết bình thường

---

## ✅ FLOW 4 — Yêu Thích (Chế độ Khách / Chưa đăng nhập)

**Mục đích:** Kiểm tra tính năng Yêu thích lưu cục bộ (LocalStorage).

**Bước kiểm tra:**
1. Không đăng nhập (hoặc đăng xuất)
2. Vào 3 thẻ công thức khác nhau, bấm nút Tim ❤️ cho mỗi thẻ
3. Vào tab **Yêu thích** ở BottomNavBar
4. Chuyển sang tab **"YÊU THÍCH"** (không phải tab "Tất cả")

**Kết quả mong đợi:**
- [x] Nút Tim chuyển màu (đỏ/rỗng) ngay lập tức khi bấm
- [x] Trang Yêu thích hiển thị đủ 3 món đã tim
- [x] Banner cảnh báo vàng xuất hiện: *"Dữ liệu chỉ lưu trên máy này. Đăng nhập để đồng bộ."* → đây là ĐÚNG, không phải lỗi
- [x] Bấm vào banner → điều hướng sang trang Đăng nhập
- [x] Tab "CỦA TÔI" KHÔNG xuất hiện khi chưa đăng nhập

**Lưu ý:** Tab "Tất cả" và "YÊU THÍCH" hiển thị với `!isLoggedIn` — banner CHỈ xuất hiện ở tab **"YÊU THÍCH"**.

---

## ✅ FLOW 5 — Đăng Nhập Firebase

**Mục đích:** Kiểm tra luồng Xác thực đa bước (Smart Login).

### Flow 5a: Email chưa tồn tại → Đăng Ký tự động
1. Vào `/vi/login`
2. Nhập Email **mới** (chưa có trong hệ thống)
3. Bấm **Tiếp tục** → Hệ thống check email trên Firebase
4. Màn hình chuyển sang bước **Tạo mật khẩu** (password_new)
5. Nhập mật khẩu ≥ 6 ký tự + xác nhận lại
6. Bấm **Tạo tài khoản**

**Kết quả mong đợi:**
- [x] Tự động đăng nhập ngay sau khi tạo, redirect về trang chủ
- [x] BottomNavBar → tab Hồ sơ hiển thị thông tin user

### Flow 5b: Email đã có → Đăng Nhập
1. Nhập Email đã tồn tại → Bấm **Tiếp tục**
2. Màn hình chuyển sang bước **Nhập mật khẩu** (password_existing)
3. Nhập mật khẩu → Bấm **Đăng nhập**

**Kết quả mong đợi:**
- [x] Đăng nhập thành công, redirect về trang trước đó (nếu có `returnUrl`)
- [x] Session được lưu trong Cookie (kiểm tra DevTools → Application → Cookies)

### Flow 5c: Đăng nhập Google
1. Bấm nút **Đăng nhập bằng Google**
2. Chọn tài khoản Google

**Kết quả mong đợi:**
- [x] Popup Google OAuth mở
- [x] Đăng nhập thành công, session được tạo

### Flow 5d: Email Link (Passwordless)
1. Bấm **Gửi link đăng nhập qua Email**
2. Kiểm tra hộp thư → bấm link trong email

**Kết quả mong đợi:**
- [x] Email được gửi (kiểm tra hộp thư)
- [x] Bấm link → đăng nhập thành công

---

## ✅ FLOW 6 — Migration Yêu Thích Khi Đăng Nhập

**Mục đích:** Kiểm tra dữ liệu cục bộ được đồng bộ lên Firestore khi đăng nhập.

**Bước kiểm tra (chạy SAU FLOW 4):**
1. Đang là Khách với 3 món đã tim trong LocalStorage
2. Đăng nhập bằng tài khoản Firebase (FLOW 5)
3. Ngay sau khi đăng nhập, vào tab **Yêu thích**

**Kết quả mong đợi:**
- [x] **3 món cũ vẫn còn** — không bị mất khi đăng nhập
- [x] Banner cảnh báo vàng **BIẾN MẤT** (đã đăng nhập, không cần cảnh báo nữa)
- [x] Firestore → `users/{uid}/favorites` có đủ 3 document của 3 món vừa migrate
- [x] LocalStorage được cập nhật đồng bộ với dữ liệu Firestore

---

## ✅ FLOW 7 — Tạo Công Thức Cá Nhân

**Mục đích:** Kiểm tra CRUD công thức cá nhân + upload ảnh.

**Điều kiện:** Đã đăng nhập.

**Bước kiểm tra:**
1. Bấm tab **Thêm Món** (+) ở BottomNavBar
2. Điền thông tin:
   - Tên: `Món Test QA`
   - Ảnh: Upload 1 ảnh bất kỳ
   - Thời gian: `20`
   - Độ khó: `Dễ`
   - Nguyên liệu: `trứng gà` / `2 quả`
   - Bước làm: `Đập trứng vào chảo, chiên chín.`
3. Bấm **Lưu công thức**

**Kết quả mong đợi:**
- [x] Redirect về `/vi/my-recipes` ngay sau khi lưu
- [x] "Món Test QA" xuất hiện trong tab **"CỦA TÔI"**
- [x] Ảnh hiển thị đúng (từ Supabase Storage, không bị 404)
- [x] Vào chi tiết công thức: Nút Sửa (✏️) xuất hiện vì là tác giả
- [x] Firestore: `recipes/{id}` có `is_personal: true`, `user_id: {uid}`

**Kiểm tra quyền riêng tư:**
- Đăng xuất → Tìm kiếm "Món Test QA" → **KHÔNG** tìm thấy (công thức cá nhân ẩn với người khác)

---

## ✅ FLOW 8 — Sửa Công Thức

**Mục đích:** Kiểm tra luồng chỉnh sửa công thức cá nhân.

**Bước kiểm tra:**
1. Mở chi tiết công thức do mình tạo (FLOW 7)
2. Bấm nút Sửa (✏️)
3. Thay đổi tên thành `Món Test QA v2`
4. Bấm **Cập nhật công thức**

**Kết quả mong đợi:**
- [x] Redirect về trang Yêu thích, thấy tên mới `Món Test QA v2`
- [x] Chỉ tác giả mới thấy nút Sửa — người khác KHÔNG thấy

---

## ✅ FLOW 9 — Đăng Xuất & Trạng Thái Khách

**Mục đích:** Kiểm tra việc xóa session và trạng thái UI sau khi đăng xuất.

**Bước kiểm tra:**
1. Đang đăng nhập → Bấm tab **Hồ sơ** ở BottomNavBar
2. Bấm **Đăng xuất**
3. Quan sát redirect và trạng thái UI

**Kết quả mong đợi:**
- [x] Sau đăng xuất: Redirect về `/vi/login` hoặc trang chủ
- [x] Tab Hồ sơ → Hiển thị nút **Đăng nhập** (không còn thông tin user)
- [x] Tab Yêu thích → Tab "CỦA TÔI" BIẾN MẤT
- [x] Cookie session bị xóa (kiểm tra DevTools → Application → Cookies)
- [x] LocalStorage Yêu thích về trạng thái Khách (hoặc rỗng)

---

## ✅ FLOW 10 — Tính Năng Chia Sẻ

**Mục đích:** Kiểm tra Web Share API và modal chia sẻ.

**Bước kiểm tra:**
1. Mở chi tiết bất kỳ công thức
2. Bấm nút Chia sẻ (share icon)
3. Thử nút **Sao chép liên kết**

**Kết quả mong đợi:**
- [x] Modal Chia sẻ xuất hiện với thông tin công thức
- [x] Nút "Sao chép liên kết" → Toast xác nhận "Đã sao chép"
- [x] Trên thiết bị di động: Web Share API mở native share sheet

---

## ✅ FLOW 11 — Đa Ngôn Ngữ (i18n)

**Mục đích:** Kiểm tra hỗ trợ Tiếng Việt / Tiếng Anh.

**Bước kiểm tra:**
1. Truy cập `/en` (tiếng Anh)
2. Truy cập `/vi` (tiếng Việt)

**Kết quả mong đợi:**
- [x] Toàn bộ giao diện chuyển ngôn ngữ đúng
- [x] Route `/` tự redirect về ngôn ngữ mặc định
- [x] Nội dung công thức (tên, mô tả) giữ nguyên — chỉ UI được dịch

---

## 🐛 Checklist Lỗi Phổ Biến

| # | Kịch bản | Kết quả đúng |
|---|----------|-------------|
| 1 | Bấm Tim khi CHƯA đăng nhập | Lưu vào LocalStorage, KHÔNG báo lỗi |
| 2 | Bấm Thêm Món khi chưa đăng nhập | Hiện modal "Đăng nhập để tiếp tục" |
| 3 | Truy cập `/vi/add-recipe` khi chưa đăng nhập | Hiện banner thông báo, KHÔNG crash |
| 4 | Nhập email sai format ở trang đăng nhập | Thông báo lỗi tiếng Việt |
| 5 | Mật khẩu < 6 ký tự khi đăng ký | Thông báo lỗi rõ ràng |
| 6 | Mật khẩu confirm không khớp | Thông báo lỗi, không tạo tài khoản |
| 7 | Đăng nhập sai mật khẩu | Firebase trả lỗi, hiện thông báo |
| 8 | Lưu công thức khi chưa nhập tên | Validation báo lỗi |
| 9 | Ảnh từ Supabase Storage | Hiển thị đúng (domain đã whitelist trong `next.config.ts`) |
| 10 | Đăng xuất → Vào Hồ sơ | Thấy giao diện Khách, không phải giao diện đăng nhập |

---

## 🏗️ Kiến trúc Auth hiện tại

```
Firebase Auth (Client)
  └── AuthContext.tsx        ← Singleton Provider (layout.tsx)
        └── useFirebaseAuth.ts  ← Business Logic
              └── useAuth.ts    ← Public Alias (các component dùng hook này)

Firebase Firestore
  └── FavoritesContext.tsx   ← Singleton Provider (layout.tsx)
        └── useFirebaseFavorites.ts ← Public Alias

Server-side
  └── firebase-auth.ts (Server Action) → getSessionUser() ← dùng trong Page Server Components

Ảnh: Supabase Storage (bucket: recipe-images)
```

---

## 🚫 Những thứ ĐÃ XÓA (không cần test nữa)

- ~~Supabase Auth (signIn, signOut)~~
- ~~`/login-firebase` (trang test cũ)~~
- ~~`useFavorites.ts` (legacy hook)~~
- ~~`ProfileMenu.tsx` (component cũ)~~
- ~~`actions/auth.ts` (Supabase Server Actions)~~
- ~~`utils/supabase/server.ts` và `client.ts`~~
