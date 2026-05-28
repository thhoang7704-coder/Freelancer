# 05 — FEATURE MODULES SPECIFICATION

> [!IMPORTANT]
> **Định nghĩa Module Nghiệp vụ & Cấu trúc Phân quyền**
> Tài liệu này liệt kê chi tiết các module chức năng cốt lõi của nền tảng Freelancer, sơ đồ định tuyến (Routing) và ma trận phân quyền (Access Matrix) tương thích với cấu hình phân quyền `@PreAuthorize` của Spring Boot.

---

## 🧭 Bản đồ Định tuyến Hệ thống (System Router Map)

Hệ thống React Router v6 phân bổ các trang theo 4 phân vùng giao diện rõ rệt:

```
/ (Public Portal)
├── /projects (Khám phá danh sách dự án)
├── /companies (Danh sách doanh nghiệp tuyển dụng)
├── /login (Trang đăng nhập)
└── /register (Trang đăng ký tài khoản)

/freelancer/ (Phân vùng Freelancer - Bảo vệ bởi FreelancerGuard)
├── /freelancer/dashboard (Thống kê hiệu quả làm việc)
├── /freelancer/projects (Các dự án đang tham gia)
├── /freelancer/tasks (Danh sách nhiệm vụ được giao)
└── /freelancer/wallet (Số dư ví & Rút tiền mặt)

/company/ (Phân vùng Doanh nghiệp - Bảo vệ bởi CompanyGuard)
├── /company/dashboard (Thống kê chi phí & tiến độ)
├── /company/projects (Quản lý dự án đăng tuyển)
├── /company/projects/create (Tạo mới dự án tuyển dụng)
├── /company/teams (Quản lý nhóm làm việc & Leader)
└── /company/wallet (Quản lý ví nạp VNPay)

/admin/ (Phân vùng Admin - Bảo vệ bởi AdminGuard)
├── /admin/dashboard (Biểu đồ tổng quan hệ thống)
├── /admin/companies (Duyệt hồ sơ doanh nghiệp PENDING)
├── /admin/projects (Duyệt dự án PENDING)
└── /admin/payments (Theo dõi đối soát nạp rút tiền)
```

---

## 🔒 Ma trận Phân quyền & Khả năng Truy cập (Access Matrix)

Dưới đây là bảng phân chia chi tiết quyền thực thi các hành động nghiệp vụ giữa 4 nhóm vai trò người dùng trong hệ thống:

| Nghiệp vụ / Hành động | `USER` | `FREELANCER` | `COMPANY` | `ADMIN` | Ghi chú từ Backend |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Xem dự án công khai** | 🟢 | 🟢 | 🟢 | 🟢 | Endpoint không yêu cầu xác thực (`/projects`) |
| **Ứng tuyển dự án (`Apply`)**| 🔴 | 🟢 | 🔴 | 🔴 | `POST /project-applications` - Chỉ Freelancer |
| **Tạo mới dự án tuyển dụng**| 🔴 | 🔴 | 🟢 | 🔴 | `POST /projects` - Chỉ Doanh nghiệp |
| **Phê duyệt doanh nghiệp** | 🔴 | 🔴 | 🔴 | 🟢 | `PUT /admin/companies/{companyId}/status` - Chỉ Admin |
| **Khóa / Mở đăng ký dự án** | 🔴 | 🔴 | 🟢 | 🔴 | `PUT /companies/{projectId}/lock` |
| **Tạo nhiệm vụ dự án (`Task`)**| 🔴 | 🟡 *(Leader)* | 🔴 | 🔴 | Chỉ Freelancer đóng vai trò là `Leader` của dự án |
| **Giao nhiệm vụ (`Assign Task`)**| 🔴 | 🟡 *(Leader)* | 🔴 | 🔴 | Leader giao nhiệm vụ cho thành viên trong Team |
| **Nhận nhiệm vụ mở (`Claim`)**| 🔴 | 🟢 | 🔴 | 🔴 | Thành viên tự nhận Open Task trong dự án |
| **Thực hiện rút tiền từ ví** | 🔴 | 🟢 | 🔴 | 🔴 | `POST /wallets/withdraw` - Chỉ Freelancer |
| **Nạp tiền ví qua VNPay** | 🔴 | 🔴 | 🟢 | 🔴 | `POST /payments/project/{projectId}/initiate` - Chỉ Doanh nghiệp |

---

## 🎨 Quy chuẩn Màu sắc Trạng thái (Status Badges)

Để đảm bảo mỹ thuật premium đồng nhất cho toàn hệ thống, các cờ trạng thái trả về từ Database phải được ánh xạ trực tiếp sang các Component **Tag** hoặc **Badge** của Ant Design có phối màu nền tương ứng:

### 1. Trạng thái Dự án (Project Status)
| Trạng thái | Mã màu CSS | Component AntD Class khuyến nghị | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- | :--- |
| **`OPEN`** | `blue` | `<Tag color="processing">OPEN</Tag>` | Dự án vừa đăng, đang mở nhận hồ sơ ứng tuyển |
| **`CLOSED`** | `default`| `<Tag color="default">CLOSED</Tag>` | Đã đóng nhận ứng tuyển, đang chốt nhân sự |
| **`IN_PROGRESS`**| `warning` | `<Tag color="warning">IN PROGRESS</Tag>`| Dự án đang trong quá trình phát triển tích cực |
| **`COMPLETED`** | `success` | `<Tag color="success">COMPLETED</Tag>` | Đã hoàn thành dự án, bàn giao sản phẩm |

### 2. Trạng thái Nhiệm vụ (Task Status)
| Trạng thái | Mã màu CSS | Component AntD Class khuyến nghị | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- | :--- |
| **`TODO`** | `cyan` | `<Tag color="cyan">TO DO</Tag>` | Nhiệm vụ vừa tạo, chưa có người thực hiện |
| **`IN_PROGRESS`**| `purple` | `<Tag color="purple">IN PROGRESS</Tag>`| Thành viên đang tích cực triển khai |
| **`DONE`** | `success` | `<Tag color="success">DONE</Tag>` | Nhiệm vụ đã hoàn thành xuất sắc |

### 3. Trạng thái Thanh toán & Duyệt (Approval Status)
| Trạng thái | Mã màu CSS | Component AntD Class khuyến nghị | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- | :--- |
| **`PENDING`** | `gold` | `<Tag color="gold">PENDING</Tag>` | Đang chờ Admin phê duyệt / Đang chờ xử lý |
| **`APPROVED`** | `success` | `<Tag color="success">APPROVED</Tag>` | Đã được Admin phê duyệt kích hoạt |
| **`REJECTED`** | `error` | `<Tag color="error">REJECTED</Tag>` | Yêu cầu bị Admin từ chối phê duyệt |

---

## 📦 Chi tiết các Module Nghiệp vụ Cốt lõi

### 1. Module Quản lý Dự án (Project Module)
Nghiệp vụ cốt lõi xử lý chu kỳ sống của một dự án Freelance từ khi đăng tuyển đến khi hoàn thành:
*   **Trang Danh sách dự án công khai:** Thiết kế dạng Grid Card hiển thị tiêu đề, tên công ty tuyển dụng, ngân sách (`Budget`), số lượng thành viên tối đa và kỹ năng yêu cầu. Hỗ trợ thanh tìm kiếm (Debounced Search) kết hợp bộ lọc đa chiều (Kỹ năng, Ngân sách, Doanh nghiệp).
*   **Trang Chi tiết dự án:** Giao diện chia 2 cột. Cột trái hiển thị mô tả chi tiết dự án và yêu cầu công nghệ. Cột phải hiển thị thông tin Doanh nghiệp tuyển dụng, danh sách thành viên hiện tại trong nhóm làm việc, và các tác vụ tương tác (Ứng tuyển đối với Freelancer thường, Tạo Task đối với Leader).

### 2. Module Đội ngũ & Thành viên (Team Module)
Quản lý nhóm làm việc phối hợp triển khai dự án do Company thiết lập:
*   **Quản lý đội ngũ (Company View):** Doanh nghiệp duyệt các đơn ứng tuyển và thêm (`Add`) thành viên vào Đội nhóm dự án. Thiết lập một Freelancer làm Trưởng nhóm (`Leader`) để ủy quyền quản lý công việc hàng ngày.
*   **Hợp tác nội bộ (Freelancer View):** Hiển thị danh sách đồng đội cùng ảnh đại diện (Avatar), cờ phân loại ai là Leader của nhóm để dễ dàng liên hệ.

### 3. Module Nhiệm vụ (Task Module)
Bảng Kanban và Danh sách quản lý công việc hàng ngày:
*   **Nhiệm vụ Mở (`OPEN` Task):** Nhiệm vụ được tạo ra cho toàn nhóm. Bất kỳ thành viên nào cảm thấy phù hợp đều có thể nhấn nút Tự nhận việc (`Claim Task`) để chuyển thành nhiệm vụ của riêng mình.
*   **Nhiệm vụ Chỉ định (`ASSIGNED` Task):** Nhiệm vụ được Leader chỉ định trực tiếp cho một Freelancer cụ thể trong nhóm.
*   **Giao diện Kanban:** Kéo thả tương tác mượt mà thông qua thư viện `@dnd-kit/core`. Hỗ trợ kéo thả đổi trạng thái nhanh từ `TODO` -> `IN_PROGRESS` -> `DONE`. Tích hợp khu vực tải tài liệu đính kèm làm báo cáo nghiệm thu nhiệm vụ.

### 4. Module Ví & Giao dịch (Wallet & Payment Module)
Dòng tiền khép kín bảo mật cao được VNPay hỗ trợ nạp tiền:
*   **Kênh Doanh nghiệp (Company):** Thực hiện nạp tiền VNPay vào ví của công ty trên nền tảng. Khi dự án khởi chạy, tiền được giữ tạm trên hệ thống (`Escrow Payment`). Sau khi nghiệm thu dự án thành công, công ty kích hoạt chức năng **Phân phối thanh toán (Distribute Payment)**. Tiền sẽ tự động được chia về cho Freelancer theo cơ chế cấu hình sẵn trên Backend (Trừ phí dịch vụ của Admin, trả thưởng Leader bonus, và chia đều cho Pool thành viên).
*   **Kênh Freelancer:** Theo dõi số dư thực tế nhận được từ các dự án. Tạo yêu cầu rút tiền (`Withdraw Request`) về tài khoản ngân hàng cá nhân, được quản lý trạng thái giao dịch chi tiết.

### 5. Module Thông báo tức thời (Notification Module)
*   Hệ thống lắng nghe các sự kiện nạp tiền thành công, giao việc mới, phê duyệt dự án, và phân phối thanh toán.
*   Khi có sự kiện mới, Firebase Realtime SDK kích hoạt thông báo góc màn hình (AntD Notification Alert) và tự động cộng dồn số lượng tin nhắn chưa đọc trên Header giúp người dùng luôn cập nhật trạng thái mới nhất mà không cần tải lại trang.
