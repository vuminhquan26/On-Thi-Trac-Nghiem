<h1 align="center">🎓 Phần mềm Ôn Thi Trắc Nghiệm (Personal Quiz App)</h1>

<p align="center">
  <i>Ứng dụng Desktop hỗ trợ ôn tập và làm bài thi trắc nghiệm offline. Được thiết kế tối ưu cho sinh viên với giao diện trực quan, tốc độ phản hồi nhanh và khả năng lưu trữ dữ liệu an toàn ngay trên máy tính cá nhân.</i>
</p>

---

## 📥 Tải xuống & Cài đặt

**Phiên bản hiện tại:** v1.0.0 (Dành cho Windows)

1. Tải file cài đặt mới nhất: 
   👉 **[Tải xuống On Thi Trac Nghiem Setup 1.0.0.exe](#thay-bang-link-google-drive-cua-ban)**
2. Nhấn đúp chuột vào file `.exe` vừa tải về.
3. Phần mềm sẽ tự động cài đặt và tạo biểu tượng (Shortcut) trên Desktop. Mở lên và sử dụng ngay mà không cần cấu hình phức tạp.

---

## 🚀 Tính năng nổi bật

* **Hoạt động 100% Offline:** Không cần kết nối Internet. Toàn bộ câu hỏi, đáp án và lịch sử làm bài được lưu trữ cục bộ trên máy tính bằng cấu trúc IndexedDB.
* **Quản lý khoa học:** Tổ chức dữ liệu logic theo cấu trúc *Môn học ➔ Bộ câu hỏi ➔ Câu hỏi chi tiết*.
* **Thuật toán trộn đề thi:** Tự động xáo trộn ngẫu nhiên thứ tự câu hỏi và thứ tự đáp án (A, B, C, D) mỗi khi bắt đầu một phiên làm bài mới để đảm bảo tính minh bạch.
* **Chấm điểm tự động:** Hiển thị kết quả ngay lập tức sau khi nộp bài.
* **Backup & Restore (Sao lưu/Phục hồi):** Hỗ trợ xuất/nhập toàn bộ dữ liệu ra file `.json` chỉ với 1 cú click. An toàn khi cài lại Windows hoặc chuyển sang máy tính khác.

---

## 📖 Hướng dẫn sử dụng nhanh

### 1. Thêm mới môn học
* Tại giao diện trang chủ, nhập **Tên môn học** và **Mô tả**.
* Nhấn **Thêm**. Môn học mới sẽ xuất hiện dưới dạng Thẻ (Card). Nhấn **Vào xem** để tiếp tục.

### 2. Tạo đề thi / Bộ câu hỏi
* Trong chi tiết môn học, tạo các bộ câu hỏi (Ví dụ: *Đề thi Giữa kỳ, Đề thi Cuối kỳ*).
* Bấm vào bộ câu hỏi để bắt đầu biên soạn. Hỗ trợ nhập nội dung câu hỏi và đánh dấu các đáp án đúng.

### 3. Bắt đầu thi
* Chọn bộ câu hỏi cần ôn tập và nhấn nút **Bắt đầu thi**.
* Hệ thống sẽ tự động tạo một phiên làm bài mới với bộ đếm câu hỏi.

### 4. Sao lưu dữ liệu (Backup)
* Ở trang chủ, nhấn nút **📥 Backup (Xuất JSON)**.
* Chọn thư mục trên máy tính để lưu trữ file backup (nên tải file này lên Google Drive để cất giữ).
* Để phục hồi dữ liệu, cài phần mềm và chọn **📤 Phục hồi (Nhập file)** rồi trỏ tới file `.json` đã lưu.

---

## 🛠 Công nghệ cốt lõi

Phần mềm được phát triển dựa trên các công nghệ web hiện đại, đóng gói thành Desktop App độc lập:

* **Core:** Vue 3 (Composition API), TypeScript, Vite.
* **UI/UX:** Tailwind CSS, Ant Design Vue, Heroicons.
* **Cơ sở dữ liệu:** Dexie.js (IndexedDB).
* **Đóng gói Desktop:** Electron & electron-builder.

---

## 💻 Dành cho Nhà phát triển (Môi trường Dev)

Nếu bạn muốn tải Source Code về để phát triển thêm tính năng:

```bash
# 1. Clone repository
git clone [https://github.com/vuminhquan/personal-quiz-app.git](https://github.com/vuminhquan/personal-quiz-app.git)

# 2. Cài đặt các gói thư viện
npm install

# 3. Chạy server phát triển (Giao diện Web)
npm run dev

# 4. Đóng gói thành phần mềm .exe (Môi trường Windows Desktop)
npm run build:exe