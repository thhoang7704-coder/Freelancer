# 🚀 SYSTEM FLOW - FREELANCER MARKETPLACE

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Authentication Flow](#authentication-flow)
3. [Role Selection](#role-selection)
4. [Company Flow](#company-flow)
5. [Freelancer Flow](#freelancer-flow)
6. [Project Flow](#project-flow)
7. [Team & Task Flow](#team--task-flow)
8. [Payment Flow](#payment-flow)
9. [Notification System](#notification-system)

---

## 📊 SYSTEM OVERVIEW

### 🎯 Mục Đích

Nền tảng kết nối **Freelancer**, **Company**, và **Admin**:

| Actor         | Vai Trò                        | Quyền                                                        |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| 👨‍💼 Freelancer | Tìm việc, nhận task, kiếm tiền | Browse project, Apply, Do task, Withdraw                     |
| 🏢 Company    | Đăng dự án, quản lý freelancer | Create project, Approve apply, Create team, Assign task, Pay |
| 🛡️ Admin      | Duyệt hệ thống                 | Approve company, Approve project, View report                |

### 🛠️ Tech Stack

```
Backend:    Spring Boot 3.x (REST API)
Database:   PostgreSQL
Auth:       JWT (Access + Refresh Token)
Realtime:   Firebase Cloud Messaging
Payment:    VNPay (Sandbox + Ngrok)
Upload:     Cloudinary
```

---

## 🔐 AUTHENTICATION FLOW

### 📝 Đăng Ký (Register)

```
POST /api/v1/auth/register
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "0912345678"
}
  ↓
1. Hash password với bcrypt
2. Tạo user (role = USER mặc định)
3. Tạo wallet (balance = 0)
4. Gửi email xác nhận
5. Return JWT tokens
  ↓
Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "...",
  "expiresIn": 900000 (15 phút)
}
```

### 🔓 Đăng Nhập (Login)

```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
  ↓
1. Xác thực email & password (bcrypt)
2. Phát hành Access Token (15 phút) + Refresh Token (7 ngày)
3. Lưu refresh token vào DB (httpOnly cookie)
  ↓
Response: {accessToken, refreshToken, expiresIn}
```

### 🔄 Refresh Token

```
POST /api/v1/auth/refresh
Cookie: refresh_token=<token>
  ↓
1. Xác thực refresh token
2. Phát hành access token mới
  ↓
Response: {accessToken, expiresIn}
```

### 🚪 Logout

```
POST /api/v1/auth/logout
{
  "refreshToken": "..."
}
  ↓
1. Đánh dấu token = revoked
2. Frontend xóa localStorage
  ↓
Response: "Logged out successfully"
```

---

## 🎯 ROLE SELECTION

Sau đăng nhập, user có role = USER, phải chọn role cụ thể:

```
SELECT ROLE:
├─ FREELANCER  → Freelancer profile
└─ COMPANY     → Company profile (cần admin duyệt)
```

### Tạo Freelancer Profile

```
POST /api/freelancer
{
  "experience": "5 năm làm web development",
  "programmingLanguages": "Java, Spring Boot, React, PostgreSQL",
  "portfolioLink": "https://portfolio.com",
  "projectLinks": "https://github.com/projects",
  "certificates": "AWS Certified, ..."
}
  ↓
1. Tạo freelancer record
2. role = FREELANCER
3. Có thể apply project ngay lập tức ✅
```

### Tạo Company Profile

```
POST /api/company/profile
{
  "companyName": "Tech Solutions Ltd",
  "address": "123 Main St, HCM",
  "taxCode": "0123456789",
  "representativeName": "Trần Văn B",
  "representativePhone": "0987654321"
}
  ↓
1. Tạo company record
2. status = PENDING (chờ admin duyệt) ⏳
3. Gửi notification cho admin
4. Chỉ có thể tạo project sau khi APPROVED ✅
```

---

## 🏢 COMPANY FLOW

### 1️⃣ Chờ Duyệt (Pending Company)

```
Company status = PENDING
  ↓
Admin xem danh sách pending companies:
GET /admin/companies/pending?page=1&pageSize=20
  ↓
Admin duyệt hoặc từ chối:
PUT /admin/companies/{companyId}/status
{
  "status": "APPROVED" | "REJECTED",
  "rejectionReason": "..."
}
  ↓
📧 Gửi notification:
├─ COMPANY_APPROVED: "Công ty được duyệt"
└─ COMPANY_REJECTED: "Công ty bị từ chối: ..."
```

### 2️⃣ Tạo Project

```
POST /api/v1/projects (multipart/form-data)
{
  "name": "Web Development Project",
  "description": "Build e-commerce platform",
  "budget": 100000000,
  "deadline": "2026-12-31",
  "skillsRequired": ["Java", "React", "PostgreSQL"],
  "files": [file1, file2] (optional)
}
  ↓
1. Kiểm tra company status = APPROVED
2. Tạo project (status = PENDING)
3. progress_status = TODO
4. payment_status = UNPAID
5. apply_status = OPEN
6. Upload files → Cloudinary
7. Gửi notification cho admin
```

### 3️⃣ Duyệt Apply

```
Company xem danh sách apply của project:
GET /project-applications?projectId=X&status=PENDING&page=1
  ↓
Company duyệt apply:
PUT /project-applications/{applicationId}/status
{
  "status": "APPROVED" | "REJECTED"
}
  ↓
If APPROVED:
├─ Tạo project_member
├─ Gửi notification: "Ứng tuyển được chấp nhận"
└─ Freelancer xuất hiện trong danh sách tạo team

If REJECTED:
└─ Gửi notification: "Ứng tuyển bị từ chối"
```

### 4️⃣ Tạo Team & Giao Task

```
POST /api/teams
{
  "projectId": "X",
  "name": "Team 1",
  "memberIds": [freelancer1_id, freelancer2_id, ...]
}
  ↓
1. Tạo team
2. Thêm members, freelancer đầu tiên = leader
3. Set is_leader = true
4. Gửi notification: "Bạn là leader của Team 1"

Sau đó, leader giao task:
POST /api/tasks
{
  "projectId": "X",
  "assignedTo": "freelancer_id",
  "title": "Build homepage",
  "description": "...",
  "deadline": "2026-06-15"
}
  ↓
📧 Gửi notification: "Task được giao cho bạn"
```

### 5️⃣ Thanh Toán Project

```
POST /api/payments/project/{projectId}/initiate
  ↓
1. Tạo payment record (status = PENDING)
2. Gọi VNPay API → lấy payment URL
3. Gửi notification cho admin & members
4. Return VNPay URL để redirect
  ↓
Company redirect user đến VNPay form
  ↓
User nhập thông tin card & xác nhận
  ↓
VNPay callback → /api/payments/vnpay-return
  ↓
1. Xác thực signature
2. Cập nhật payment.status = PAID
3. Tính toán phân chia:
   - Admin: 20%
   - Leader bonus: 10%
   - Freelancer: 70% ÷ số member
4. Tạo payment_distributions
5. Cập nhật wallets (transactions)
6. Gửi notification PAYMENT_SUCCESS + RECEIVE_MONEY
```

---

## 👨‍💻 FREELANCER FLOW

### 1️⃣ Xem & Apply Project

```
GET /api/v1/projects?status=APPROVED&page=1
  ↓
Xem danh sách project được duyệt (status = APPROVED)

POST /project-applications
{
  "projectId": "X"
}
  ↓
1. Kiểm tra project.apply_status = OPEN
2. Kiểm tra chưa apply trước đó
3. Tạo project_application (status = PENDING)
4. Gửi notification: "Ứng tuyển thành công"
```

### 2️⃣ Theo Dõi Apply

```
GET /project-applications/my-applications?page=1
  ↓
Xem status:
├─ PENDING  → Chờ company duyệt
├─ APPROVED → Được chấp nhận, có thể làm task
└─ REJECTED → Bị từ chối
```

### 3️⃣ Xem Team & Task

```
GET /freelancer/project/{projectId}/leader-overview
  ↓
Xem team structure & danh sách task

GET /tasks (của freelancer)
  ↓
Xem task được giao (assigned_to = me)
```

### 4️⃣ Làm & Cập Nhật Task

```
PUT /tasks/{taskId}
{
  "status": "IN_PROGRESS"  (bắt đầu)
}
  ↓
(Upload kết quả)
PUT /tasks/{taskId}
{
  "status": "DONE",
  "fileUrl": "link_file_kết_quả"
}
  ↓
📧 Gửi notification: "Task hoàn thành"
```

### 5️⃣ Quản Lý Ví

```
GET /wallets/me
  ↓
Xem số dư ví & lịch sử giao dịch

Nhận tiền từ payment → transaction được tạo
  ↓
balance += amount

Rút tiền:
POST /wallets/withdraw
{
  "amount": 1000000,
  "bankName": "Vietcombank",
  "accountName": "Nguyen Van A",
  "bankAccount": "123456789"
}
  ↓
✅ Rút tiền thành công (mô phỏng)
```

---

## 📁 PROJECT FLOW

### Project Status (3 loại độc lập)

```
1. status (Duyệt từ Admin):
   PENDING  → APPROVED ✅ (project hiển thị cho freelancer)
          → REJECTED ❌ (company chỉnh sửa hoặc xóa)

2. progress_status (Tiến độ):
   TODO  → IN_PROGRESS (khi có freelancer tham gia)
        → DONE (khi tất cả task xong)

3. payment_status (Thanh toán):
   UNPAID  → PENDING (calling VNPay)
          → PAID ✅ (phân chia tiền)
          → FAILED ❌
          → CANCELLED
```

### Project Lifecycle

```
1. Company tạo → status = PENDING (chờ admin)
2. Admin duyệt → status = APPROVED
3. Freelancer apply → tạo project_application
4. Company duyệt apply → tạo project_member
5. Company tạo team → chọn leader
6. Leader giao task → freelancer làm
7. Freelancer hoàn task → task.status = DONE
8. Tất cả task xong → progress_status = DONE
9. Company thanh toán → payment.status = PENDING → PAID
10. Phân chia tiền → cập nhật wallets
```

---

## 👥 TEAM & TASK FLOW

### Tạo Team

```
Company tạo team từ project_members:

POST /api/teams
{
  "projectId": "X",
  "name": "Team 1",
  "memberIds": [F1, F2, F3]
}
  ↓
1. Freelancer đầu tiên = leader
2. Gửi notification: "Bạn là leader"
3. Leader có thể giao task
```

### Giao Task

```
Leader có 2 cách tạo task:

1️⃣ OPEN TASK (không chỉ định):
   POST /tasks
   {
     "title": "Build API",
     "description": "...",
     "assignedTo": null  (freelancer tự nhận)
   }
   → Freelancer đầu tiên nhận → locked = true

2️⃣ ASSIGNED TASK (chỉ định):
   POST /tasks
   {
     "title": "Design UI",
     "description": "...",
     "assignedTo": "freelancer_id"
   }
   → Chỉ freelancer này mới làm được

📧 Gửi notification: "Task được giao"
```

### Làm Task

```
Freelancer cập nhật progress:

PUT /tasks/{taskId}
{
  "status": "IN_PROGRESS"
}
  ↓
PUT /tasks/{taskId}
{
  "status": "DONE",
  "fileUrl": "https://..."
}
  ↓
📧 Gửi notification: "Task hoàn thành"
```

---

## 💰 PAYMENT FLOW

### Xây Dựng Payment

```
POST /api/payments/project/{projectId}/initiate
  ↓
1. Kiểm tra project.progress_status = DONE
2. Kiểm tra chưa thanh toán (payment_status != PAID)
3. Tạo Payment record:
   - status = PENDING
   - total_amount = project.budget
   - admin_percent = 20%, leader_percent = 10% (snapshot)
4. Tạo PaymentLog
5. Gọi VNPay API (Ngrok tunnel)
6. Return VNPay URL
  ↓
Response:
{
  "paymentId": "X",
  "projectId": "X",
  "totalAmount": 100000000,
  "vnpayUrl": "https://sandbox.vnpayment.vn/..."
}
```

### VNPay Callback

```
User thanh toán xong → VNPay callback

POST /api/payments/vnpay-return?...params...
  ↓
1. Xác thực signature (secure)
2. Lấy payment từ DB
3. Tạo PaymentTransaction record
4. Nếu success (responseCode = 00):
   ├─ payment.status = PAID
   ├─ Gọi distributePayment()
   └─ Gửi notification

5. Nếu failed:
   ├─ payment.status = FAILED
   └─ Gửi notification PAYMENT_FAILED
```

### Phân Chia Tiền

```
distributePayment(payment):
  ↓
Công thức:
- totalAmount = 100,000,000 VND
- adminAmount = 100,000,000 × 20% = 20,000,000
- leaderBonus = 100,000,000 × 10% = 10,000,000
- freelancerPool = 100,000,000 × 70% = 70,000,000
- eachFreelancer = 70,000,000 ÷ 10 = 7,000,000

Tính toán cho mỗi freelancer:
- Nếu leader:     amount = 7,000,000 + 10,000,000 = 17,000,000
- Nếu không:      amount = 7,000,000

Cập nhật:
1. Admin wallet += 20,000,000 (transaction tạo)
2. Mỗi freelancer wallet += amount (transaction tạo)
3. Tạo PaymentDistribution record
4. Gửi notification: "Bạn nhận X VND từ dự án"
```

---

## 🔔 NOTIFICATION SYSTEM

### Loại Thông Báo

| Type                 | Trigger          | Recipient  | Content                       |
| -------------------- | ---------------- | ---------- | ----------------------------- |
| COMPANY_APPROVED     | Admin duyệt      | Company    | "Công ty được duyệt"          |
| COMPANY_REJECTED     | Admin từ chối    | Company    | "Công ty bị từ chối: ..."     |
| PROJECT_APPROVED     | Admin duyệt      | Company    | "Project được duyệt"          |
| PROJECT_REJECTED     | Admin từ chối    | Company    | "Project bị từ chối"          |
| PROJECT_APPLIED      | Freelancer apply | Freelancer | "Apply thành công"            |
| APPLICATION_APPROVED | Company duyệt    | Freelancer | "Apply được chấp nhận"        |
| APPLICATION_REJECTED | Company từ chối  | Freelancer | "Apply bị từ chối"            |
| LEADER_ASSIGNED      | Tạo team         | Freelancer | "Bạn là leader"               |
| TASK_ASSIGNED        | Leader giao      | Freelancer | "Task được giao"              |
| TASK_CREATED         | Tạo task         | Freelancer | "Task mới được tạo"           |
| PAYMENT_SUCCESS      | VNPay callback   | Company    | "Thanh toán thành công"       |
| PAYMENT_FAILED       | VNPay failed     | Company    | "Thanh toán thất bại"         |
| PAYMENT_RECEIVED     | Phân chia tiền   | Freelancer | "Bạn nhận X VND"              |
| PAYMENT_RULE_UPDATED | Admin cập nhật   | Company    | "Quy tắc thanh toán cập nhật" |

### Flow Gửi Notification

```
Tạo notification:
1. notificationService.createNotification(user, title, content, type, referenceId)
2. Lưu vào DB
3. Gửi qua Firebase Admin SDK
4. Firebase gửi qua FCM
5. Frontend nhận & display

Frontend:
1. Register FCM token on load
2. Listen to FCM messages
3. Display notification
4. Mark as read khi user click
```

---

## 🛡️ ADMIN MANAGEMENT

### Admin Chức Năng

| Chức Năng     | Endpoint                         | Mô Tả             |
| ------------- | -------------------------------- | ----------------- |
| Xem pending   | GET /admin/companies/pending     | Công ty chờ duyệt |
| Duyệt company | PUT /admin/companies/{id}/status | Approve/Reject    |
| Xem projects  | GET /admin/projects/pending      | Project chờ duyệt |
| Duyệt project | PUT /admin/projects/{id}/status  | Approve/Reject    |
| Gửi thông báo | POST /admin/notifications        | Send to company   |

---

## 📝 SUMMARY

```
👤 User Journey:

1. REGISTER
   ├─ Tạo user (role = USER)
   └─ Tạo wallet

2. CHOOSE ROLE
   ├─ FREELANCER: Browse & Apply project
   └─ COMPANY: Chờ duyệt, tạo project

3. COMPANY FLOW
   ├─ Chờ admin duyệt
   ├─ Tạo project
   ├─ Duyệt freelancer apply
   ├─ Tạo team & giao task
   └─ Thanh toán

4. FREELANCER FLOW
   ├─ Browse project
   ├─ Apply project
   ├─ Chờ company duyệt
   ├─ Làm task
   ├─ Nhận tiền
   └─ Rút tiền

5. NOTIFICATION
   └─ Realtime updates qua Firebase
```

---

**Version:** 2.0 | **Updated:** 2026-05-20
