# 🌐 API SPECIFICATION - FREELANCER MARKETPLACE

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Base Config](#base-config)
3. [Authentication API](#authentication-api)
4. [Project API](#project-api)
5. [Project Application API](#project-application-api)
6. [Freelancer API](#freelancer-api)
7. [Team API](#team-api)
8. [Task API](#task-api)
9. [Payment API](#payment-api)
10. [Wallet API](#wallet-api)
11. [Notification API](#notification-api)
12. [Admin API](#admin-api)

---

## 📊 OVERVIEW

### 🎯 API Info

| Property        | Value                                         |
| --------------- | --------------------------------------------- |
| Base URL        | `http://localhost:8080/api`                   |
| Version         | `v1`                                          |
| Authentication  | JWT Bearer Token                              |
| Content-Type    | `application/json` (or `multipart/form-data`) |
| Response Format | JSON                                          |

### 🔐 Authentication Header

```
Authorization: Bearer <access_token>
```

### ⏱️ Token Details

| Type          | Duration | Expiration                      |
| ------------- | -------- | ------------------------------- |
| Access Token  | 15 phút  | Sau 15 phút, dùng refresh token |
| Refresh Token | 7 ngày   | Stored in httpOnly cookie       |

### ✅ Response Format

**Success:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...} or [...]
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

---

## 🔧 BASE CONFIG

### 📍 API Prefixes

```
- Auth:               /api/v1/auth
- Projects:          /api/v1/projects
- Applications:      /api/project-applications
- Freelancer:        /api/freelancer
- Teams:             /api/teams
- Tasks:             /api/tasks
- Payments:          /api/payments
- Wallets:           /api/wallets
- Notifications:     /api/notifications
- Admin:             /api/admin
```

### ⚙️ CORS Configuration

```
Allowed Origins: http://localhost:3000, http://localhost:3001, ...
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
Credentials: true (httpOnly cookies)
```

### 📦 Pagination

Tất cả list endpoint hỗ trợ:

```
?page=1&pageSize=20&sortBy=createdAt&sortDirection=DESC
```

---

## 🔐 AUTHENTICATION API

### 1️⃣ Register

```
POST /api/v1/auth/register
Content-Type: application/json

Request:
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "0912345678"
}

Response: 200 OK
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 900000
  }
}

Errors:
- 400: Email already exists
- 400: Invalid password format
- 500: Server error
```

### 2️⃣ Login

```
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "FREELANCER",
    "accessToken": "eyJhbGc...",
    "refreshToken": "...",
    "expiresIn": 900000
  }
}

Cookies:
- refresh_token=... (httpOnly)

Errors:
- 401: Invalid credentials
- 404: User not found
```

### 3️⃣ Refresh Token

```
POST /api/v1/auth/refresh
Cookie: refresh_token=<token>

Request:
{}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 900000
  }
}

Errors:
- 401: Invalid refresh token
- 401: Token expired
```

### 4️⃣ Logout

```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>

Request:
{
  "refreshToken": "..."
}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📁 PROJECT API

### 1️⃣ Create Project

```
POST /api/v1/projects
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Request:
{
  "name": "E-commerce Platform",
  "description": "Build modern e-commerce website",
  "budget": "100000000",
  "deadline": "2026-12-31",
  "skillsRequired": "Java, Spring Boot, React, PostgreSQL",
  "files": [file1, file2, ...] (optional)
}

Response: 201 Created
{
  "success": true,
  "data": {
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "E-commerce Platform",
    "companyId": "...",
    "budget": 100000000,
    "status": "PENDING",
    "progressStatus": "TODO",
    "paymentStatus": "UNPAID",
    "applyStatus": "OPEN",
    "createdAt": "2026-05-20T10:00:00Z"
  }
}

Validations:
- Company status must be APPROVED
- Budget > 0
- Deadline > today
- At least 1 file recommended

Errors:
- 403: Company not approved
- 400: Invalid data
- 413: File too large
```

### 2️⃣ Get Projects

```
GET /api/v1/projects
Authorization: Bearer <access_token> (optional)
?page=1&pageSize=20&status=APPROVED&sortBy=createdAt

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "projectId": "...",
      "name": "E-commerce Platform",
      "companyId": "...",
      "budget": 100000000,
      "deadline": "2026-12-31",
      "status": "APPROVED",
      "progressStatus": "TODO",
      "paymentStatus": "UNPAID",
      "applyStatus": "OPEN",
      "appliedCount": 5,
      "membersCount": 0,
      "createdAt": "2026-05-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50
  }
}

Query Params:
- status: PENDING, APPROVED, REJECTED
- apply_status: OPEN, CLOSED
- company_id: filter by company
```

### 3️⃣ Get Project Detail

```
GET /api/v1/projects/{projectId}
Authorization: Bearer <access_token> (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "projectId": "...",
    "name": "E-commerce Platform",
    "description": "Build modern e-commerce website",
    "companyId": "...",
    "companyName": "Tech Solutions",
    "budget": 100000000,
    "deadline": "2026-12-31",
    "skillsRequired": ["Java", "Spring Boot", "React"],
    "status": "APPROVED",
    "progressStatus": "TODO",
    "paymentStatus": "UNPAID",
    "applyStatus": "OPEN",
    "members": [
      {
        "freelancerId": "...",
        "name": "Freelancer 1",
        "isLeader": true
      }
    ],
    "applications": [
      {
        "applicationId": "...",
        "freelancerId": "...",
        "name": "Freelancer 2",
        "status": "PENDING"
      }
    ],
    "teams": [...],
    "tasks": [...],
    "createdAt": "2026-05-20T10:00:00Z"
  }
}

Errors:
- 404: Project not found
```

### 4️⃣ Update Project

```
PUT /api/v1/projects/{projectId}
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Request:
{
  "name": "Updated name",
  "description": "Updated desc",
  "budget": "150000000",
  "deadline": "2026-12-31"
}

Response: 200 OK
{
  "success": true,
  "message": "Project updated",
  "data": {...}
}

Restrictions:
- Only company owner can edit
- Cannot edit if status = APPROVED
```

### 5️⃣ Delete Project

```
DELETE /api/v1/projects/{projectId}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Project deleted"
}

Restrictions:
- Only company owner
- status must be PENDING or REJECTED
```

---

## 📋 PROJECT APPLICATION API

### 1️⃣ Apply Project

```
POST /api/project-applications
Authorization: Bearer <access_token>

Request:
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "applicationId": "...",
    "projectId": "...",
    "freelancerId": "...",
    "status": "PENDING",
    "appliedAt": "2026-05-20T10:00:00Z"
  }
}

Validations:
- Project status must be APPROVED
- apply_status must be OPEN
- Freelancer profile must exist
- Cannot apply twice for same project

Errors:
- 400: Already applied
- 403: Project apply_status = CLOSED
- 404: Project or freelancer not found
```

### 2️⃣ Get My Applications

```
GET /api/project-applications/my-applications
Authorization: Bearer <access_token>
?page=1&pageSize=20&status=PENDING

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "applicationId": "...",
      "projectId": "...",
      "projectName": "E-commerce Platform",
      "companyName": "Tech Solutions",
      "budget": 100000000,
      "status": "PENDING",
      "appliedAt": "2026-05-20T10:00:00Z"
    }
  ]
}

Query Params:
- status: PENDING, APPROVED, REJECTED
```

### 3️⃣ Get Project Applications (Company)

```
GET /api/project-applications
Authorization: Bearer <access_token>
?projectId=X&status=PENDING&page=1

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "applicationId": "...",
      "freelancerId": "...",
      "freelancerName": "Nguyễn Văn A",
      "skills": ["Java", "Spring Boot"],
      "experience": "5 năm",
      "status": "PENDING",
      "appliedAt": "2026-05-20T10:00:00Z"
    }
  ]
}

Restrictions:
- Only project company can access
```

### 4️⃣ Update Application Status

```
PUT /api/project-applications/{applicationId}/status
Authorization: Bearer <access_token>

Request:
{
  "status": "APPROVED" | "REJECTED"
}

Response: 200 OK
{
  "success": true,
  "message": "Application approved",
  "data": {...}
}

If APPROVED:
- Create project_member
- Send notification: "Ứng tuyển được chấp nhận"

If REJECTED:
- Send notification: "Ứng tuyển bị từ chối"

Restrictions:
- Only company owner
```

---

## 👨‍💻 FREELANCER API

### 1️⃣ Create Freelancer Profile

```
POST /api/freelancer
Authorization: Bearer <access_token>

Request:
{
  "experience": "5 năm lập trình web với Java, Spring Boot",
  "programmingLanguages": "Java, Spring Boot, React, PostgreSQL",
  "portfolioLink": "https://portfolio.com",
  "projectLinks": "https://github.com/projects",
  "certificates": "AWS Certified, Oracle Java Programmer"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "freelancerId": "...",
    "userId": "...",
    "experience": "...",
    "programmingLanguages": ["Java", "Spring Boot", "React"],
    "portfolioLink": "...",
    "createdAt": "2026-05-20T10:00:00Z"
  }
}

Changes:
- user.role = FREELANCER
- Can apply projects immediately
```

### 2️⃣ Get Freelancer Profile

```
GET /api/freelancer/{freelancerId}
Authorization: Bearer <access_token> (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "freelancerId": "...",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0912345678",
    "experience": "...",
    "programmingLanguages": [...],
    "portfolioLink": "...",
    "certificiate": "...",
    "projects": 5,
    "completedTasks": 12,
    "rating": 4.5
  }
}
```

### 3️⃣ Update Freelancer Profile

```
PUT /api/freelancer
Authorization: Bearer <access_token>

Request:
{
  "experience": "Updated experience",
  "programmingLanguages": "Java, Kotlin, React",
  "portfolioLink": "https://new-portfolio.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated"
}
```

### 4️⃣ Get My Teams

```
GET /api/freelancer/teams
Authorization: Bearer <access_token>
?projectId=X (optional)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "teamId": "...",
      "teamName": "Team 1",
      "projectId": "...",
      "projectName": "E-commerce Platform",
      "isLeader": true,
      "members": [
        {
          "freelancerId": "...",
          "name": "Freelancer 1"
        }
      ]
    }
  ]
}
```

### 5️⃣ Get My Tasks

```
GET /api/freelancer/tasks
Authorization: Bearer <access_token>
?status=IN_PROGRESS&page=1

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "taskId": "...",
      "projectId": "...",
      "projectName": "E-commerce Platform",
      "title": "Build homepage",
      "description": "...",
      "status": "IN_PROGRESS",
      "deadline": "2026-06-15T00:00:00Z",
      "assignedAt": "2026-05-20T10:00:00Z"
    }
  ]
}

Query Params:
- status: TODO, IN_PROGRESS, DONE
- sortBy: deadline, createdAt
```

---

## 👥 TEAM API

### 1️⃣ Create Team

```
POST /api/teams
Authorization: Bearer <access_token>

Request:
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Team Development",
  "memberIds": [
    "freelancer1-id",
    "freelancer2-id",
    "freelancer3-id"
  ]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "teamId": "...",
    "projectId": "...",
    "name": "Team Development",
    "members": [
      {
        "freelancerId": "...",
        "name": "Freelancer 1",
        "isLeader": true
      }
    ],
    "createdAt": "2026-05-20T10:00:00Z"
  }
}

Business Logic:
- First member = leader (is_leader = true)
- Send notification: "Bạn là leader"
- All members must have project_member status = APPROVED
```

### 2️⃣ Get Team Detail

```
GET /api/teams/{teamId}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "teamId": "...",
    "teamName": "Team Development",
    "projectId": "...",
    "projectName": "E-commerce Platform",
    "members": [
      {
        "freelancerId": "...",
        "name": "Freelancer 1",
        "isLeader": true,
        "joinedAt": "2026-05-20T10:00:00Z"
      }
    ],
    "tasksCount": 10,
    "completedTasks": 3,
    "createdAt": "2026-05-20T10:00:00Z"
  }
}
```

### 3️⃣ Add Team Member

```
POST /api/teams/{teamId}/members
Authorization: Bearer <access_token>

Request:
{
  "freelancerId": "...",
  "isLeader": false
}

Response: 201 Created
{
  "success": true,
  "message": "Member added"
}

Restrictions:
- Only leader or company
- Member must be project_member
```

### 4️⃣ Remove Team Member

```
DELETE /api/teams/{teamId}/members/{freelancerId}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Member removed"
}

Restrictions:
- Cannot remove last member
```

---

## 📌 TASK API

### 1️⃣ Create Task

```
POST /api/tasks
Authorization: Bearer <access_token>

Request:
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Build API endpoints",
  "description": "Create REST API for project management",
  "assignedTo": "freelancer-id" (optional - null = OPEN TASK),
  "deadline": "2026-06-15T00:00:00Z",
  "taskType": "ASSIGNED | OPEN"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "taskId": "...",
    "projectId": "...",
    "title": "Build API endpoints",
    "status": "TODO",
    "assignedTo": "freelancer-id" (null if OPEN),
    "isLocked": false,
    "deadline": "2026-06-15T00:00:00Z",
    "createdAt": "2026-05-20T10:00:00Z"
  }
}

Business Logic:
- If assignedTo != null: ASSIGNED TASK
  → Only assigned freelancer can work
- If assignedTo = null: OPEN TASK
  → Anyone can take it (first takes → locked)

Send notification: "Task được giao"
```

### 2️⃣ Get Tasks

```
GET /api/tasks
Authorization: Bearer <access_token>
?projectId=X&status=TODO&page=1

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "taskId": "...",
      "projectId": "...",
      "title": "Build API",
      "status": "TODO",
      "assignedTo": "freelancer-id",
      "isLocked": false,
      "deadline": "2026-06-15T00:00:00Z",
      "createdAt": "2026-05-20T10:00:00Z"
    }
  ]
}

Query Params:
- projectId: filter by project
- status: TODO, IN_PROGRESS, DONE
- assigned_to: me (current user)
```

### 3️⃣ Update Task

```
PUT /api/tasks/{taskId}
Authorization: Bearer <access_token>

Request:
{
  "status": "IN_PROGRESS" | "DONE",
  "fileUrl": "https://..." (required if DONE)
}

Response: 200 OK
{
  "success": true,
  "message": "Task updated"
}

Workflow:
- TODO → IN_PROGRESS: Start work
- IN_PROGRESS → DONE: Finish & upload file

Send notification: "Task hoàn thành"
```

### 4️⃣ Claim Open Task

```
POST /api/tasks/{taskId}/claim
Authorization: Bearer <access_token>

Request:
{}

Response: 200 OK
{
  "success": true,
  "message": "Task claimed successfully",
  "data": {
    "taskId": "...",
    "assignedTo": "freelancer-id",
    "isLocked": true
  }
}

Restrictions:
- Only for OPEN tasks (assignedTo = null)
- First claimant gets it (locked = true)
- Idempotent - multiple claims fail
```

---

## 💳 PAYMENT API

### 1️⃣ Initiate Payment

```
POST /api/payments/project/{projectId}/initiate
Authorization: Bearer <access_token>

Request:
{}

Response: 201 Created
{
  "success": true,
  "data": {
    "paymentId": "...",
    "projectId": "...",
    "projectName": "E-commerce Platform",
    "totalAmount": 100000000,
    "paymentCode": "PAY20260520001",
    "payment_status": "PENDING",
    "vnpayUrl": "https://sandbox.vnpayment.vn/paygate/pay?vnp_...",
    "createdAt": "2026-05-20T10:00:00Z"
  }
}

Validations:
- Project status = APPROVED
- Payment status = UNPAID
- progress_status = DONE

Response:
- Return VNPay redirect URL
- Send notification: "Thanh toán pending"
```

### 2️⃣ Get Payment Detail

```
GET /api/payments/{paymentId}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "paymentId": "...",
    "projectId": "...",
    "projectName": "E-commerce Platform",
    "totalAmount": 100000000,
    "paymentStatus": "PAID",
    "adminPercent": 20.00,
    "leaderPercent": 10.00,
    "paymentTransactions": [...],
    "distributions": [
      {
        "freelancerId": "...",
        "freelancerName": "Freelancer 1",
        "amount": 17000000,
        "isLeader": true
      }
    ],
    "createdAt": "2026-05-20T10:00:00Z"
  }
}
```

### 3️⃣ VNPay Return (Callback)

```
GET /api/payments/vnpay-return
?vnp_Amount=...&vnp_BankCode=...&vnp_ResponseCode=...
&vnp_TransactionNo=...&vnp_SecureHash=...

Response: 200 OK
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "paymentId": "...",
    "projectId": "...",
    "paymentStatus": "PAID"
  }
}

Or error:
{
  "success": false,
  "message": "Payment failed or cancelled",
  "error": "PAYMENT_FAILED"
}

Behind the scenes:
1. Verify signature
2. Check response code (00 = success)
3. Create PaymentTransaction log
4. Call distributePayment()
5. Send notifications
```

### 4️⃣ Get Payment History

```
GET /api/payments/project/{projectId}/history
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "paymentId": "...",
      "totalAmount": 100000000,
      "paymentStatus": "PAID",
      "createdAt": "2026-05-20T10:00:00Z",
      "paidAt": "2026-05-20T12:00:00Z"
    }
  ]
}
```

---

## 💰 WALLET API

### 1️⃣ Get Wallet Balance

```
GET /api/wallets/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "walletId": "...",
    "userId": "...",
    "balance": 50000000,
    "updatedAt": "2026-05-20T12:00:00Z"
  }
}
```

### 2️⃣ Get Wallet Transactions

```
GET /api/wallets/me/transactions
Authorization: Bearer <access_token>
?type=CREDIT&status=SUCCESS&page=1

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "transactionId": "...",
      "amount": 17000000,
      "type": "CREDIT",
      "status": "SUCCESS",
      "description": "Nhận tiền từ project E-commerce",
      "createdAt": "2026-05-20T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 25
  }
}

Query Params:
- type: CREDIT, DEBIT
- status: SUCCESS, FAILED
- sortBy: createdAt (default)
```

### 3️⃣ Withdraw Money

```
POST /api/wallets/withdraw
Authorization: Bearer <access_token>

Request:
{
  "amount": 1000000,
  "bankName": "Vietcombank",
  "accountName": "Nguyễn Văn A",
  "bankAccount": "1234567890"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "withdrawalId": "...",
    "amount": 1000000,
    "status": "SUCCESS",
    "createdAt": "2026-05-20T12:00:00Z"
  }
}

Validations:
- amount > 0
- balance >= amount
- Bank account format valid

Response (current mock):
- Returns success immediately
- (Real: would process in background)
```

---

## 🔔 NOTIFICATION API

### 1️⃣ Get My Notifications

```
GET /api/notifications
Authorization: Bearer <access_token>
?isRead=false&page=1&pageSize=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "notificationId": "...",
      "title": "Ứng tuyển được chấp nhận",
      "content": "Bạn được chấp nhận join project E-commerce",
      "type": "APPLICATION_APPROVED",
      "isRead": false,
      "referenceId": "project-id",
      "createdAt": "2026-05-20T12:00:00Z"
    }
  ]
}

Query Params:
- isRead: true, false, all (default)
- type: COMPANY, PROJECT, PAYMENT, TASK, ...
- sortBy: createdAt (default)
```

### 2️⃣ Mark as Read

```
PUT /api/notifications/{notificationId}/read
Authorization: Bearer <access_token>

Request:
{}

Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 3️⃣ Mark All as Read

```
PUT /api/notifications/mark-all-read
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### 4️⃣ Delete Notification

```
DELETE /api/notifications/{notificationId}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Notification deleted"
}
```

### 5️⃣ Notification Types

```
COMPANY:
- COMPANY_APPROVED: Công ty được duyệt
- COMPANY_REJECTED: Công ty bị từ chối

PROJECT:
- PROJECT_APPROVED: Project được duyệt
- PROJECT_REJECTED: Project bị từ chối

APPLICATION:
- PROJECT_APPLIED: Apply thành công
- APPLICATION_APPROVED: Apply được chấp nhận
- APPLICATION_REJECTED: Apply bị từ chối

TEAM:
- LEADER_ASSIGNED: Bạn là leader

TASK:
- TASK_ASSIGNED: Task được giao
- TASK_CREATED: Task mới được tạo

PAYMENT:
- PAYMENT_SUCCESS: Thanh toán thành công
- PAYMENT_FAILED: Thanh toán thất bại
- PAYMENT_RECEIVED: Nhận tiền từ dự án

SYSTEM:
- PAYMENT_RULE_UPDATED: Quy tắc cập nhật
```

---

## 🛡️ ADMIN API

### 1️⃣ Get Pending Companies

```
GET /api/admin/companies/pending
Authorization: Bearer <admin_token>
?page=1&pageSize=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "companyId": "...",
      "userId": "...",
      "companyName": "Tech Solutions Ltd",
      "taxCode": "0123456789",
      "representativeName": "Trần Văn B",
      "address": "123 Main St",
      "status": "PENDING",
      "createdAt": "2026-05-20T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### 2️⃣ Approve/Reject Company

```
PUT /api/admin/companies/{companyId}/status
Authorization: Bearer <admin_token>

Request:
{
  "status": "APPROVED" | "REJECTED",
  "rejectionReason": "..." (if REJECTED)
}

Response: 200 OK
{
  "success": true,
  "message": "Company status updated"
}

Send notification:
- APPROVED: "Công ty được duyệt"
- REJECTED: "Công ty bị từ chối: {reason}"
```

### 3️⃣ Get Pending Projects

```
GET /api/admin/projects/pending
Authorization: Bearer <admin_token>
?page=1&pageSize=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "projectId": "...",
      "name": "E-commerce Platform",
      "companyName": "Tech Solutions",
      "budget": 100000000,
      "status": "PENDING",
      "createdAt": "2026-05-20T10:00:00Z"
    }
  ]
}
```

### 4️⃣ Approve/Reject Project

```
PUT /api/admin/projects/{projectId}/status
Authorization: Bearer <admin_token>

Request:
{
  "status": "APPROVED" | "REJECTED",
  "rejectionReason": "..."
}

Response: 200 OK
{
  "success": true,
  "message": "Project status updated"
}

Send notification:
- APPROVED: "Project được duyệt"
- REJECTED: "Project bị từ chối"
```

### 5️⃣ Send System Notification

```
POST /api/admin/notifications
Authorization: Bearer <admin_token>

Request:
{
  "userId": "recipient-id" (optional - if null: broadcast),
  "title": "System Announcement",
  "content": "New payment rules announced",
  "type": "SYSTEM" | "ADMIN_MESSAGE"
}

Response: 201 Created
{
  "success": true,
  "message": "Notification sent"
}
```

---

## 🔄 COMMON PATTERNS

### Pagination

```
Query: ?page=1&pageSize=20
Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Handling

```json
{
  "success": false,
  "message": "Human readable message",
  "error": "ERROR_CODE",
  "timestamp": "2026-05-20T12:00:00Z"
}
```

### Validation Rules

```
Email:         Must match RFC 5322
Password:      Min 8 chars, uppercase, lowercase, digit, special char
Budget:        > 0
Amount:        > 0
Phone:         Valid format
Decimal:       DECIMAL(15,2) → Max 15 digits, 2 decimals
```

---

## 📊 STATUS CODES

| Code | Meaning           |
| ---- | ----------------- |
| 200  | Success           |
| 201  | Created           |
| 400  | Bad Request       |
| 401  | Unauthorized      |
| 403  | Forbidden         |
| 404  | Not Found         |
| 409  | Conflict          |
| 413  | Payload Too Large |
| 500  | Server Error      |

---

## 🔐 SECURITY

### Token Expiration

- Access Token: 15 phút
- Refresh Token: 7 ngày
- Auto-refresh trước khi expire

### Signature Verification

- VNPay: Verify HMAC signature
- JWT: HS256 algorithm

### CORS

- Credentials: true (httpOnly cookies)
- AllowedOrigins: Configured in application.yaml

---

**Version:** 2.0 | **Updated:** 2026-05-20
