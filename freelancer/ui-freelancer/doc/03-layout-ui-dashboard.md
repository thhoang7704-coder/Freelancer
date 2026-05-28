# 03 — LAYOUT & UI DASHBOARD SYSTEM

> [!IMPORTANT]
> **Hệ thống Khung giao diện (Layout) & Trang quản trị (Dashboard)**
> Tài liệu này chuẩn hóa kiến trúc Layout, thanh điều hướng (Sidebar), Header, và cấu trúc Widget số liệu thống kê cho từng vai trò người dùng trong nền tảng Freelancer.

---

## 🏗 Tổng quan Kiến trúc UI/UX

Hệ thống được thiết kế theo hướng **SaaS Modern Dashboard** tối giản, trực quan và ưu tiên thiết bị di động (Responsive-first). Thư viện thành phần giao diện chủ đạo là **Ant Design 5.x** kết hợp với **Tailwind CSS 3.x** cho tùy chỉnh layout và khoảng cách (spacing).

### 🏛 Cấu trúc Layout Tổng quát
Hệ thống sử dụng cấu trúc layout chia vùng cố định (Fixed Sidebar) để tối ưu trải nghiệm:

```
┌────────────────────────────────────────────────────────────┐
│  [||] Logo       💰 Ví: 12,500,000 ₫       🔔 [3]   Avatar │  <- HEADER (Sticky Top)
├──────────────┬─────────────────────────────────────────────┤
│              │ Trang chủ / Quản lý dự án                   │  <- BREADCRUMB
│  • Dashboard ├─────────────────────────────────────────────┤
│  • Dự án     │                                             │
│  • Đội ngũ   │               PAGE CONTENT                  │  <- MAIN CONTENT
│  • Ví tiền   │                                             │
│  • Cài đặt   │       [Thẻ thống kê]  [Biểu đồ trực quan]   │  (Scrollable Area)
│              │                                             │
│ (SIDEBAR)    │       [Bảng dữ liệu phân trang máy chủ]     │
└──────────────┴─────────────────────────────────────────────┘
```

---

## 🧭 Hệ thống Sidebar theo từng vai trò (Role-based Navigation)

> [!TIP]
> Menu Sidebar được render động dựa vào thông tin `user.role` lưu trong Zustand Auth Store. Sidebar hỗ trợ chức năng Thu gọn/Mở rộng (Collapse) và tự động ẩn thành ngăn kéo (Drawer) trên các màn hình máy tính bảng và di động (< 1024px).

### 1. Phân cấp Menu chi tiết theo Role

| Vai trò | Các mục Menu hiển thị (Sidebar Items) | Biểu tượng AntD gợi ý | Đường dẫn định tuyến (Router Path) |
| :--- | :--- | :--- | :--- |
| **ADMIN** | Biểu đồ tổng quan<br>Duyệt Doanh nghiệp<br>Duyệt Dự án<br>Cấu hình Phí chia sẻ<br>Lịch sử Thanh toán<br>Quản lý Người dùng<br>Thông báo hệ thống | `DashboardOutlined`<br>`SolutionOutlined`<br>`ProjectOutlined`<br>`SettingOutlined`<br>`CreditCardOutlined`<br>`UserOutlined`<br>`BellOutlined` | `/admin/dashboard`<br>`/admin/companies`<br>`/admin/projects`<br>`/admin/payment-rules`<br>`/admin/payments`<br>`/admin/users`<br>`/admin/notifications` |
| **COMPANY** | Thống kê số liệu<br>Dự án của tôi<br>Tạo dự án mới<br>Quản lý Đội ngũ (Team)<br>Nhóm nhiệm vụ (Tasks)<br>Danh sách Ứng viên<br>Ví tiền & Nạp tiền | `DashboardOutlined`<br>`FolderOpenOutlined`<br>`PlusCircleOutlined`<br>`TeamOutlined`<br>`UnorderedListOutlined`<br>`AuditOutlined`<br>`WalletOutlined` | `/company/dashboard`<br>`/company/projects`<br>`/company/projects/create`<br>`/company/teams`<br>`/company/tasks`<br>`/company/applicants`<br>`/company/wallet` |
| **FREELANCER**| Bảng tin công việc<br>Khám phá dự án<br>Dự án đang làm<br>Nhiệm vụ của tôi<br>Nhóm làm việc (Team)<br>Ví tiền & Rút tiền<br>Thông tin cá nhân | `DashboardOutlined`<br>`CompassOutlined`<br>`FolderOutlined`<br>`CarryOutOutlined`<br>`TeamOutlined`<br>`WalletOutlined`<br>`UserOutlined` | `/freelancer/dashboard`<br>`/projects`<br>`/freelancer/projects`<br>`/freelancer/tasks`<br>`/freelancer/teams`<br>`/freelancer/wallet`<br>`/freelancer/profile` |
| **USER** | Trang chủ hệ thống<br>Tìm kiếm dự án<br>Xem công ty tuyển dụng<br>Đăng ký thành Freelancer<br>Đăng ký thành Doanh nghiệp | `HomeOutlined`<br>`SearchOutlined`<br>`BankOutlined`<br>`UserAddOutlined`<br>`AppstoreAddOutlined` | `/`<br>`/projects`<br>`/companies`<br>`/become-freelancer`<br>`/become-company` |

---

## 🔝 Thiết kế Thanh Header & Các Widget Tích hợp

Header của trang quản trị luôn cố định ở phía trên (`sticky top-0 z-40 bg-white border-b`) và chứa các thành phần tương tác nhanh sau:

### 1. Widget Hiển thị Số dư Ví (`WalletBalance.tsx`)
*   **Vị trí:** Phía bên phải Header, hiển thị số dư thực tế của người dùng hiện tại (chỉ hiển thị với Company, Freelancer và Admin).
*   **Định dạng thiết kế:** Một Badge dạng viên thuốc mềm mại (glassmorphic pill structure):
    ```
    ┌────────────────────────┐
    │  🪙 Wallet: 12,500,000 ₫ │
    └────────────────────────┘
    ```
*   **Nghiệp vụ:** 
    *   Tự động định dạng tiền tệ Việt Nam: `balance.toLocaleString('vi-VN') + ' ₫'`.
    *   Click vào Widget sẽ tự động điều hướng người dùng trực tiếp đến trang chi tiết Ví tiền (`/wallet`).

### 2. Trung tâm Thông báo (`NotificationDropdown.tsx`)
*   **Vị trí:** Icon chiếc chuông trên Header kèm theo chấm đỏ hiển thị số lượng thông báo chưa đọc (`unreadCount`).
*   **Thiết kế & Tương tác:**
    *   Sử dụng Ant Design Dropdown chứa danh sách thông báo cuộn không giới hạn.
    *   Mỗi mục thông báo chứa tiêu đề, nội dung ngắn gọn, thời gian gửi tương đối (ví dụ: "5 phút trước") và cờ `isRead`.
    *   Khi click vào một thông báo chưa đọc, hệ thống sẽ thực hiện cuộc gọi API đánh dấu đã đọc (`markAsRead`) đồng thời chuyển hướng (Redirect) thông minh dựa trên thuộc tính `referenceType`. (Ví dụ: `TASK_ASSIGNED` điều hướng đến màn hình chi tiết Task `/freelancer/tasks`).

---

## 📊 Cấu trúc Thẻ & Biểu đồ trang Thống kê (Dashboard Widgets)

Mỗi vai trò có một trang Dashboard riêng chứa các chỉ số thống kê tài chính và tiến độ dự án:

### 👑 ADMIN Dashboard
*   **Các thẻ số liệu chính (Stat Cards):**
    *   Tổng số người dùng hệ thống (`Total Users`).
    *   Số lượng Freelancer hoạt động (`Total Freelancers`).
    *   Số lượng Doanh nghiệp đã đăng ký (`Total Companies`).
    *   Tổng doanh thu nền tảng tích lũy từ phí dịch vụ (`Platform Revenue`).
*   **Các biểu đồ trực quan (Recharts Components):**
    *   **Revenue Analytics (Line Chart):** Thống kê dòng tiền nạp và phí thu dịch vụ hàng tháng.
    *   **User Registration Growth (Area Chart):** Thống kê tốc độ tăng trưởng người dùng mới.
    *   **Project Distribution (Pie Chart):** Phân chia trạng thái dự án (Đang tuyển, Đang chạy, Đã đóng).

### 🏢 COMPANY Dashboard
*   **Các thẻ số liệu chính (Stat Cards):**
    *   Tổng số dự án đã đăng tuyển (`Total Created Projects`).
    *   Dự án đang triển khai thực tế (`Active Projects`).
    *   Tổng số tiền đã chi trả cho Freelancer (`Total Paid Out`).
    *   Số dư ví khả dụng hiện tại (`Wallet Balance`).
*   **Các biểu đồ trực quan (Recharts Components):**
    *   **Project Completion Rate (Doughnut Chart):** Thống kê tỷ lệ hoàn thành nhiệm vụ của các dự án.
    *   **Monthly Budget Spending (Bar Chart):** Thống kê chi phí chi trả dự án theo từng tháng.

### 👨‍💻 FREELANCER Dashboard
*   **Các thẻ số liệu chính (Stat Cards):**
    *   Tổng số dự án đã tham gia (`Joined Projects`).
    *   Số lượng nhiệm vụ được giao (`Assigned Tasks`).
    *   Số lượng nhiệm vụ đã hoàn thành xuất sắc (`Completed Tasks`).
    *   Tổng thu nhập thực tế đã nhận (`Total Net Income`).
*   **Tính năng Đặc quyền dành cho Trưởng nhóm (`isLeader === true`):**
    *   Nếu Freelancer là Leader của dự án, hệ thống sẽ hiển thị thêm widget "Quản lý Dự án Trưởng nhóm" chứa các nút thao tác nhanh: **Tạo nhiệm vụ mới**, **Phân phối Task**, **Cập nhật tiến độ dự án**.

---

## 🎨 Token Thiết kế Hệ thống (Design Tokens)

Để giao diện hiển thị nhất quán, lập trình viên bắt buộc phải sử dụng hệ màu được thiết lập sẵn trong Ant Design và Tailwind CSS:

```css
:root {
  /* Giao diện màu sắc thương hiệu chính */
  --color-primary: #1677ff;       /* Blue - AntD Default */
  --color-success: #52c41a;       /* Green - Trạng thái Hoàn thành, Đã duyệt */
  --color-warning: #faad14;       /* Gold - Trạng thái Đang chờ duyệt, Pending */
  --color-error: #ff4d4f;         /* Red - Trạng thái Hủy bỏ, Từ chối, Lỗi */
  
  /* Màu nền & thanh điều hướng */
  --color-bg-layout: #f5f7fb;     /* Grayish Blue - Nền chính trang quản trị */
  --color-sidebar-bg: #001529;    /* Dark Navy - Màu nền Sidebar mặc định */
}
```

> [!WARNING]
> **Quy tắc Nghiêm ngặt khi xây dựng UI:**
> *   Không bao giờ ghi đè CSS của Ant Design bằng thuộc tính `!important` một cách bừa bãi. Hãy sử dụng cơ chế `ConfigProvider` của Ant Design để ghi đè theme token một cách chính thống.
> *   Tất cả các thẻ Card chứa thông tin thống kê bắt buộc phải có thuộc tính bo góc và đổ bóng nhẹ: `class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"`.
> *   Mọi bảng dữ liệu (`Table`) hiển thị trên giao diện phải tích hợp trạng thái tải dữ liệu (`loading={isLoading}`) và xử lý trường hợp không có dữ liệu (`locale={{ emptyText: <EmptyState /> }}`).
