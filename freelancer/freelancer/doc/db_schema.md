# 📊 DATABASE SCHEMA - FREELANCER MARKETPLACE

## 📋 TABLE OF CONTENTS

1. [ENUM TYPES](#enum-types)
2. [TABLES](#tables)
3. [RELATIONSHIPS](#relationships)
4. [BUSINESS LOGIC](#business-logic)

---

## 🎯 ENUM TYPES

### 👤 UserRole

- `ADMIN` - Quản trị viên hệ thống
- `USER` - Người dùng mặc định (chưa chọn role cụ thể)
- `FREELANCER` - Freelancer
- `COMPANY` - Công ty

### ✅ ApprovalStatus

- `PENDING` - Đang chờ duyệt
- `APPROVED` - Đã duyệt (chấp nhận)
- `REJECTED` - Bị từ chối

### 💳 PaymentStatus

- `UNPAID` - Chưa thanh toán
- `PENDING` - Đang xử lý VNPay
- `PAID` - Thanh toán thành công
- `FAILED` - Thanh toán thất bại
- `CANCELLED` - User hủy
- `REFUNDED` - Hoàn tiền

### ⏳ ProgressStatus

- `TODO` - Chưa bắt đầu
- `IN_PROGRESS` - Đang thực hiện
- `DONE` - Hoàn thành

### 📋 TaskStatus

- `TODO` - Chưa bắt đầu
- `IN_PROGRESS` - Đang làm
- `DONE` - Hoàn thành

### 📁 ProjectApplyStatus

- `OPEN` - Dự án đang mở (freelancer có thể apply)
- `CLOSED` - Dự án đã đóng (không thể apply)

### 🔔 NotificationType

- `COMPANY_APPROVED` / `COMPANY_REJECTED`
- `PROJECT_APPROVED` / `PROJECT_REJECTED`
- `PROJECT_APPLIED` / `APPLICATION_APPROVED` / `APPLICATION_REJECTED`
- `TASK_ASSIGNED` / `TASK_CREATED`
- `LEADER_ASSIGNED`
- `PAYMENT_SUCCESS` / `PAYMENT_FAILED` / `PAYMENT_RECEIVED`
- `PAYMENT_RULE_UPDATED`
- `SYSTEM`, `ADMIN_MESSAGE` và các loại khác

---

## 📊 TABLES

### 1️⃣ users

Lưu thông tin người dùng, mặc định role=USER, sau đó user chọn FREELANCER hoặc COMPANY

| Column        | Type         | Description                      |
| ------------- | ------------ | -------------------------------- |
| id            | UUID         | Primary Key                      |
| full_name     | VARCHAR(255) | Tên đầy đủ                       |
| email         | VARCHAR(255) | Email duy nhất                   |
| password_hash | VARCHAR(255) | Hash mật khẩu (bcrypt)           |
| phone         | VARCHAR(20)  | Số điện thoại                    |
| role          | VARCHAR(20)  | ADMIN, USER, FREELANCER, COMPANY |
| avatar_url    | TEXT         | URL ảnh đại diện                 |
| fcm_token     | TEXT         | Firebase token                   |
| status        | BOOLEAN      | Trạng thái hoạt động             |
| is_active     | BOOLEAN      | Cờ kích hoạt tài khoản           |
| created_at    | TIMESTAMP    | Thời gian tạo                    |
| updated_at    | TIMESTAMP    | Thời gian cập nhật               |

---

### 2️⃣ freelancers

Hồ sơ chi tiết freelancer (1-to-1 với users)

| Column                | Type      | Description             |
| --------------------- | --------- | ----------------------- |
| id                    | UUID      | Primary Key             |
| user_id               | UUID      | FK → users.id (UNIQUE)  |
| experience            | TEXT      | Kinh nghiệm làm việc    |
| project_links         | TEXT      | Link dự án đã thực hiện |
| programming_languages | TEXT      | Ngôn ngữ lập trình      |
| certificates          | TEXT      | Chứng chỉ               |
| portfolio_link        | TEXT      | Link portfolio          |
| avatar_url            | TEXT      | URL ảnh đại diện        |
| created_at            | TIMESTAMP | Thời gian tạo           |

---

### 3️⃣ companies

Hồ sơ công ty (1-to-1 với users), cần admin duyệt trước khi tạo project

| Column               | Type         | Description                   |
| -------------------- | ------------ | ----------------------------- |
| id                   | UUID         | Primary Key                   |
| user_id              | UUID         | FK → users.id (UNIQUE)        |
| company_name         | VARCHAR(255) | Tên công ty                   |
| address              | TEXT         | Địa chỉ                       |
| tax_code             | VARCHAR(100) | Mã số thuế                    |
| representative_name  | VARCHAR(255) | Tên người đại diện            |
| representative_phone | VARCHAR(20)  | SĐT đại diện                  |
| status               | VARCHAR(20)  | PENDING / APPROVED / REJECTED |
| approved_by          | UUID         | Admin duyệt                   |
| approved_at          | TIMESTAMP    | Thời gian duyệt               |
| rejection_reason     | TEXT         | Lý do từ chối                 |
| created_at           | TIMESTAMP    | Thời gian tạo                 |

---

### 4️⃣ projects

Dự án do công ty tạo, có 3 loại trạng thái độc lập

| Column          | Type          | Description                                    |
| --------------- | ------------- | ---------------------------------------------- |
| id              | UUID          | Primary Key                                    |
| company_id      | UUID          | FK → companies.id                              |
| name            | VARCHAR(255)  | Tên dự án                                      |
| description     | TEXT          | Mô tả chi tiết                                 |
| budget          | DECIMAL(15,2) | Ngân sách                                      |
| deadline        | DATE          | Hạn chót                                       |
| skills_required | TEXT          | Kỹ năng yêu cầu                                |
| status          | VARCHAR(20)   | **PENDING**/APPROVED/REJECTED (duyệt từ admin) |
| progress_status | VARCHAR(20)   | **TODO**/IN_PROGRESS/DONE (tiến độ)            |
| payment_status  | VARCHAR(20)   | **UNPAID**/PENDING/PAID/... (thanh toán)       |
| apply_status    | VARCHAR(20)   | OPEN / CLOSED (tuyển dụng)                     |
| approved_by     | UUID          | Admin duyệt                                    |
| approved_at     | TIMESTAMP     | Thời gian duyệt                                |
| created_at      | TIMESTAMP     | Thời gian tạo                                  |

---

### 5️⃣ project_applications

Ghi nhận lần apply của freelancer (status: PENDING/APPROVED/REJECTED)

| Column                                | Type        | Description                   |
| ------------------------------------- | ----------- | ----------------------------- |
| id                                    | UUID        | Primary Key                   |
| project_id                            | UUID        | FK → projects.id              |
| freelancer_id                         | UUID        | FK → freelancers.id           |
| status                                | VARCHAR(20) | PENDING / APPROVED / REJECTED |
| applied_at                            | TIMESTAMP   | Thời gian apply               |
| **UNIQUE(project_id, freelancer_id)** |

---

### 6️⃣ project_members

Freelancer được chấp nhận apply trở thành project_member

| Column                                | Type      | Description                      |
| ------------------------------------- | --------- | -------------------------------- |
| id                                    | UUID      | Primary Key                      |
| project_id                            | UUID      | FK → projects.id                 |
| freelancer_id                         | UUID      | FK → freelancers.id              |
| is_leader                             | BOOLEAN   | Có phải leader của project không |
| joined_at                             | TIMESTAMP | Thời gian tham gia               |
| **UNIQUE(project_id, freelancer_id)** |

---

### 7️⃣ teams

Nhóm làm việc trong project (company chia freelancer thành nhiều team)

| Column     | Type         | Description      |
| ---------- | ------------ | ---------------- |
| id         | UUID         | Primary Key      |
| project_id | UUID         | FK → projects.id |
| name       | VARCHAR(255) | Tên nhóm         |
| created_at | TIMESTAMP    | Thời gian tạo    |

---

### 8️⃣ team_members

Thành viên của team, leader quản lý & giao task

| Column                             | Type      | Description             |
| ---------------------------------- | --------- | ----------------------- |
| id                                 | UUID      | Primary Key             |
| team_id                            | UUID      | FK → teams.id           |
| freelancer_id                      | UUID      | FK → freelancers.id     |
| is_leader                          | BOOLEAN   | Có phải leader của team |
| joined_at                          | TIMESTAMP | Thời gian tham gia      |
| **UNIQUE(team_id, freelancer_id)** |

---

### 9️⃣ tasks

Công việc chi tiết giao cho freelancer

| Column      | Type         | Description                                |
| ----------- | ------------ | ------------------------------------------ |
| id          | UUID         | Primary Key                                |
| project_id  | UUID         | FK → projects.id                           |
| assigned_to | UUID         | FK → freelancers.id (freelancer được giao) |
| title       | VARCHAR(255) | Tiêu đề task                               |
| description | TEXT         | Mô tả chi tiết                             |
| status      | VARCHAR(20)  | TODO / IN_PROGRESS / DONE                  |
| task_type   | VARCHAR(20)  | Loại task                                  |
| file_url    | TEXT         | URL file hoặc kết quả                      |
| is_locked   | BOOLEAN      | Đã khóa (được giao cụ thể)                 |
| deadline    | TIMESTAMP    | Hạn chót                                   |
| created_by  | UUID         | FK → users.id (leader tạo)                 |
| assigned_at | TIMESTAMP    | Thời gian giao                             |
| created_at  | TIMESTAMP    | Thời gian tạo                              |

---

### 🔟 wallets

Ví điện tử của user (1-to-1), lưu số dư tài khoản

| Column     | Type          | Description            |
| ---------- | ------------- | ---------------------- |
| id         | UUID          | Primary Key            |
| user_id    | UUID          | FK → users.id (UNIQUE) |
| balance    | DECIMAL(15,2) | Số dư ví (>= 0)        |
| updated_at | TIMESTAMP     | Lần cập nhật cuối      |

---

### 1️⃣1️⃣ transactions

Giao dịch ví (nạp/rút/nhận từ project)

| Column      | Type          | Description                |
| ----------- | ------------- | -------------------------- |
| id          | UUID          | Primary Key                |
| wallet_id   | UUID          | FK → wallets.id            |
| amount      | DECIMAL(15,2) | Số tiền (> 0)              |
| type        | VARCHAR(20)   | CREDIT (nạp) / DEBIT (rút) |
| status      | VARCHAR(20)   | SUCCESS / FAILED           |
| description | TEXT          | Mô tả (từ project X, ...)  |
| created_at  | TIMESTAMP     | Thời gian tạo              |

---

### 1️⃣2️⃣ payments

Lưu thông tin thanh toán project, snapshot admin_percent & leader_percent

| Column         | Type          | Description                            |
| -------------- | ------------- | -------------------------------------- |
| id             | UUID          | Primary Key                            |
| project_id     | UUID          | FK → projects.id (UNIQUE)              |
| company_id     | UUID          | FK → companies.id                      |
| payment_code   | VARCHAR(255)  | Mã thanh toán duy nhất                 |
| total_amount   | DECIMAL(15,2) | Tổng tiền                              |
| payment_status | VARCHAR(20)   | UNPAID / PENDING / PAID / FAILED / ... |
| admin_percent  | DECIMAL(5,2)  | % cho admin (snapshot)                 |
| leader_percent | DECIMAL(5,2)  | % cho leader (snapshot)                |
| txn_ref        | VARCHAR(255)  | Ref từ VNPay                           |
| created_at     | TIMESTAMP     | Thời gian tạo                          |

---

### 1️⃣3️⃣ payment_transactions

Ghi log chi tiết từ VNPay callback

| Column                 | Type         | Description                          |
| ---------------------- | ------------ | ------------------------------------ |
| id                     | UUID         | Primary Key                          |
| payment_id             | UUID         | FK → payments.id                     |
| vnpay_transaction_code | VARCHAR(255) | Mã giao dịch VNPay                   |
| status                 | VARCHAR(20)  | SUCCESS / FAILED / INVALID_SIGNATURE |
| response_code          | VARCHAR(20)  | Response code từ VNPay               |
| bank_code              | VARCHAR(20)  | Mã ngân hàng                         |
| raw_response           | LONGTEXT     | Response thô (JSON)                  |
| created_at             | TIMESTAMP    | Thời gian tạo                        |

---

### 1️⃣4️⃣ payment_distributions

Chi tiết phân chia tiền cho từng freelancer

| Column        | Type          | Description                   |
| ------------- | ------------- | ----------------------------- |
| id            | UUID          | Primary Key                   |
| payment_id    | UUID          | FK → payments.id              |
| freelancer_id | UUID          | FK → freelancers.id           |
| amount        | DECIMAL(15,2) | Số tiền freelancer nhận (> 0) |
| is_leader     | BOOLEAN       | Có phải leader không          |

---

### 1️⃣5️⃣ notifications

Thông báo realtime cho user, lưu & gửi qua Firebase

| Column       | Type         | Description                                 |
| ------------ | ------------ | ------------------------------------------- |
| id           | UUID         | Primary Key                                 |
| user_id      | UUID         | FK → users.id                               |
| title        | VARCHAR(255) | Tiêu đề                                     |
| content      | TEXT         | Nội dung                                    |
| type         | VARCHAR(50)  | COMPANY, PROJECT, PAYMENT, TASK, ...        |
| is_read      | BOOLEAN      | Đã đọc không                                |
| reference_id | UUID         | FK tới entity (project_id, payment_id, ...) |
| created_at   | TIMESTAMP    | Thời gian tạo                               |
| updated_at   | TIMESTAMP    | Lần cập nhật cuối                           |

---

## 🔗 RELATIONSHIPS

```
👤 USER → OTHERS (1-to-many, tất cả FK)
├─ freelancers.user_id (1-to-1)
├─ companies.user_id (1-to-1)
├─ wallets.user_id (1-to-1)
└─ notifications.user_id (1-to-many)

📁 PROJECT → RELATED (1-to-many)
├─ project_applications (1-to-many)
├─ project_members (1-to-many)
├─ teams (1-to-many)
├─ tasks (1-to-many)
└─ payments (1-to-1)

👥 TEAM → MEMBERS (1-to-many)
└─ team_members.team_id (1-to-many)

💰 PAYMENT → DETAILS
├─ payment_transactions (1-to-many)
└─ payment_distributions (1-to-many)

💳 WALLET → TRANSACTIONS (1-to-many)
└─ transactions.wallet_id (1-to-many)
```

---

## 🔥 BUSINESS LOGIC

### Thanh Toán Project - Chia Tiền

```
Tổng Ngân Sách = 100%

├─ Admin Fee:      20% (cố định)
├─ Leader Bonus:   10% (cố định, chỉ leader nhận thêm)
└─ Freelancer:     70% (chia đều tất cả members)

Ví dụ: Budget = 10,000,000 VND, 10 freelancer (1 leader)

├─ Admin: 2,000,000 VND (20%)
├─ Leader Bonus: 1,000,000 VND (10%)
└─ Freelancer Pool: 7,000,000 VND
   ├─ Mỗi người: 700,000 VND
   └─ Leader tổng: 700,000 + 1,000,000 = 1,700,000 VND
```

### Trạng Thái Đơn Apply

```
ProjectApplication.status:
├─ PENDING     → Company chưa duyệt
├─ APPROVED    → Freelancer trở thành project_member
└─ REJECTED    → Freelancer không được join
```

### Trạng Thái Thanh Toán

```
UNPAID
  ↓ (Company bấm thanh toán)
PENDING (Gọi VNPay, lưu payment_logs)
  ├─ VNPay callback success → PAID ✅
  │ └─ Tính toán & phân chia → Cập nhật wallets
  ├─ VNPay callback failed → FAILED ❌
  └─ User hủy → CANCELLED
```

### Task Types

```
1. OPEN TASK
   - assigned_to = NULL lúc đầu
   - Freelancer có thể tự nhận
   - Người đầu tiên nhận → locked = true

2. ASSIGNED TASK
   - assigned_to != NULL từ đầu
   - Chỉ assigned freelancer mới làm được
```

---

## 📝 NOTES

- **UUID:** Tất cả ID
- **Decimals:** DECIMAL(15,2) cho tiền
- **Constraints:** amount > 0, balance >= 0
- **Cascading:** ON DELETE CASCADE
- **Snapshot:** Payment lưu admin_percent, leader_percent

**Version:** 2.0 | **Updated:** 2026-05-20
