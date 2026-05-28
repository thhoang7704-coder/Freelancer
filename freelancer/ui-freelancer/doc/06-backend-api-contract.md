# 06 — BACKEND API CONTRACT (JOB PLATFORM SYSTEM)

> [!IMPORTANT]
> **Định ước Giao tiếp API chuẩn hóa (Backend API Contract)**
> Tài liệu này mô tả chi tiết đặc tả kỹ thuật của tất cả các API Endpoint thực tế trên Spring Boot backend (Port `8082`, Context path `/api/v1`), cấu trúc JSON Request/Response DTO, mã lỗi nghiệp vụ và tiện ích xử lý ngoại lệ.

---

## 🔗 Cấu hình Cơ sở (Base Configuration)

Tất cả các yêu cầu gửi từ Frontend bắt buộc phải đi qua Axios Instance được cấu hình thống nhất như sau:

*   **URL gốc (Base URL):** `http://localhost:8082/api/v1` *(Do backend cấu hình `server.servlet.context-path: /api/v1`, toàn bộ API bao gồm `/auth` đều sử dụng tiền tố này)*
*   **Header xác thực:** `Authorization: Bearer <accessToken>` *(Lưu trữ tạm thời trong Zustand Store)*
*   **Kiểu định dạng:** `Content-Type: application/json` *(Trừ các API upload tài liệu sử dụng `multipart/form-data`)*

> [!WARNING]
> **Điểm đặc biệt cần lưu ý đối với `UserController`:**
> Do class `UserController.java` trên Spring Boot định nghĩa `@RequestMapping("/api/v1/users")` kết hợp cùng servlet context-path `/api/v1`, nên các API endpoints của UserController sẽ có tiền tố bị nhân đôi. Cụ thể:
> - Xem profile cá nhân: `GET http://localhost:8082/api/v1/api/v1/users/me`
> - Cập nhật profile cá nhân: `PUT http://localhost:8082/api/v1/api/v1/users/me`
> - Xem danh sách thông báo: `GET http://localhost:8082/api/v1/api/v1/users`
>
> Các controller khác (như `AuthController` tại `/auth`, `ProjectController` tại `/projects`, v.v.) không bị ảnh hưởng và hoạt động đúng theo tiền tố đơn lẻ (ví dụ: `http://localhost:8082/api/v1/auth/login`).

---

## 📦 Cấu trúc phản hồi chuẩn hóa (Standard Response DTOs)

Backend bọc tất cả kết quả phản hồi vào một đối tượng ApiResponse duy nhất để đảm bảo tính nhất quán:

### 1. Khi xử lý Thành công (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "OK",
  "data": { ... } // Chứa Object dữ liệu chính (T) hoặc null
}
```

### 2. Khi xử lý thất bại (Lỗi nghiệp vụ)
```json
{
  "success": false,
  "message": "Chi tiết mô tả nguyên nhân lỗi bằng tiếng Việt",
  "error": "MÃ_LỖI_HỆ_THỐNG" // Chuỗi mã lỗi viết hoa để Frontend phân loại xử lý
}
```

### 3. Phản hồi Phân trang (`PageResponse<T>`)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "items": [ ... ], // Mảng danh sách các bản ghi của trang hiện tại
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 120,
      "totalPages": 6
    }
  }
}
```

---

## 🗂 Chi tiết Danh mục API theo Controller thực tế

> [!NOTE]
> Mọi UUID được truyền qua URL Path đều là định dạng chuỗi chuẩn của Java UUID (`e.g. 7b08da22-e427-466d-a7e8-466d67e2a9e5`).

### 1. Auth Module (Controller: `AuthController` tại `/auth`)
*   **`POST /auth/register`** (Đăng ký tài khoản thường)
    *   *Request:* `{ email, password, full_name }`
    *   *Response:* `ApiResponse<JwtResponse>` chứa accessToken, refreshToken và thông tin User cơ bản.
*   **`POST /auth/login`** (Đăng nhập)
    *   *Request:* `{ email, password }`
    *   *Response:* `ApiResponse<JwtResponse>`
*   **`POST /auth/refresh`** (Cấp mới Access Token)
    *   *Request:* `{ refreshToken }` (JSON body)
    *   *Response:* `ApiResponse<TokenRefreshResponse>`
*   **`POST /auth/logout`** (Đăng xuất)
    *   *Request:* `{ refreshToken }` (JSON body)
    *   *Response:* `ApiResponse<Void>`

### 2. User Profile Module (Controller: `UserController` tại `/api/v1/users`)
*   **`GET /api/v1/users/me`** (Lấy profile cá nhân)
    *   *Response:* `ApiResponse<UserProfileResponse>` chứa thông tin vai trò, số dư ví hiện tại, và thông tin chi tiết.
*   **`PUT /api/v1/users/me`** (Cập nhật thông tin profile)
    *   *Request:* `{ full_name, phone, avatar_url }`
    *   *Response:* `ApiResponse<UpdateProfileResponse>`
*   **`GET /api/v1/users`** (Lấy danh sách thông báo của tôi)
    *   *Response:* `ResponseEntity<List<NotificationResponse>>` trả về mảng danh sách thông báo thô.

### 3. Freelancer Module (Controller: `FreelancerController` tại `/freelancers`)
*   **`POST /freelancers`** (Đăng ký nâng cấp tài khoản sang Freelancer)
    *   *Request:* `{ title, bio, skills: string[], hourlyRate, experienceYears }`
    *   *Response:* `ApiResponse<FreelancerResponse>`
*   **`GET /freelancers/{freelancerId}`** (Xem profile Freelancer - Company/Admin only)
    *   *Response:* `ApiResponse<FreelancerResponse>`
*   **`PUT /freelancers/me`** (Cập nhật hồ sơ Freelancer cá nhân)
    *   *Request:* `{ title, bio, skills: string[], hourlyRate, experienceYears }`
    *   *Response:* `ApiResponse<FreelancerResponse>`
*   **`GET /freelancers/teams/{teamId}`** (Xem chi tiết Team thành viên)
    *   *Response:* `ApiResponse<TeamDetailResponse>`
*   **`PUT /freelancers/leader/{projectId}/progress`** (Leader cập nhật tiến độ tổng quan dự án)
    *   *Request:* `{ progressPercentage, statusNotes }`
    *   *Response:* `ApiResponse<Void>`
*   **`GET /freelancers/project/{projectId}/leader-overview`** (Leader xem tổng quan tất cả task dự án)
    *   *Response:* `ResponseEntity<List<LeaderTaskOverviewResponse>>`

### 4. Company Module (Controller: `CompanyController` tại `/companies`)
*   **`POST /companies`** (Đăng ký nâng cấp tài khoản sang Company - Chờ Admin duyệt)
    *   *Request:* `{ companyName, description, website, address, companySize }`
    *   *Response:* `ApiResponse<CompanyResponse>`
*   **`GET /companies/{companyId}`** (Xem hồ sơ chi tiết Company)
    *   *Response:* `ApiResponse<CompanyDetailResponse>`
*   **`PUT /companies/me`** (Cập nhật thông tin doanh nghiệp cá nhân)
    *   *Request:* `{ companyName, description, website, address, companySize }`
    *   *Response:* `ApiResponse<String>`
*   **`GET /companies/{projectId}/freelancer-applications`** (Xem danh sách đơn ứng tuyển dự án)
    *   *Parameters:* `status` (PENDING, APPROVED, REJECTED), `page`, `pageSize`
    *   *Response:* `ResponseEntity<PageResponse<ProjectApplicationCompanyItemResponse>>`
*   **`POST /companies/teams`** (Company tạo Đội ngũ dự án mới)
    *   *Request:* `{ projectId, teamName }`
    *   *Response:* `ApiResponse<TeamResponse>`
*   **`POST /companies/{teamId}/members`** (Thêm thành viên Freelancer vào Team)
    *   *Request:* `{ freelancerId }`
    *   *Response:* `ApiResponse<String>`
*   **`PUT /companies/{teamId}/leader`** (Chỉ định trưởng nhóm dự án - Leader)
    *   *Request:* `{ freelancerId }`
    *   *Response:* `ApiResponse<String>`
*   **`DELETE /companies/{teamId}/members/{memberId}`** (Xóa thành viên khỏi Team)
    *   *Response:* `ApiResponse<String>`
*   **`GET /companies/projects/{projectId}/members`** (Xem danh sách thành viên dự án)
    *   *Response:* `ApiResponse<List<ProjectMemberResponse>>`
*   **`PUT /companies/{projectId}/lock`** (Khóa đăng ký ứng tuyển dự án)
    *   *Response:* `ResponseEntity<String>`
*   **`PUT /companies/{projectId}/unlock`** (Mở lại đăng ký ứng tuyển dự án)
    *   *Response:* `ResponseEntity<String>`

### 5. Project Module (Controller: `ProjectController` tại `/projects` và `ProjectApplicationController` tại `/project-applications`)
*   **`POST /projects`** (Tạo dự án mới - Company only)
    *   *Header:* `Content-Type: multipart/form-data`
    *   *Payload:* Gửi dưới dạng Form Data chứa file tài liệu mô tả và trường dữ liệu DTO.
    *   *Response:* `ApiResponse<ProjectResponse>` (Chờ Admin duyệt kích hoạt)
*   **`GET /projects`** (Lấy danh sách dự án công khai)
    *   *Parameters:* `status`, `progressStatus`, `search`, `page`, `pageSize`
    *   *Response:* `ApiResponse<PageResponse<ProjectItemResponse>>`
*   **`PUT /projects/{projectId}`** (Cập nhật thông tin dự án)
    *   *Request:* `{ title, description, budget, skills: string[] }`
    *   *Response:* `ApiResponse<ProjectResponse>`
*   **`DELETE /projects/{projectId}`** (Xóa dự án)
    *   *Response:* `ApiResponse<Map<String, String>>`
*   **`POST /project-applications`** (Freelancer nộp đơn ứng tuyển dự án)
    *   *Request:* `{ projectId, coverLetter, proposedRate }`
    *   *Response:* `ResponseEntity<ProjectApplicationResponse>`
*   **`GET /project-applications/my-applications`** (Xem danh sách dự án bản thân đã ứng tuyển)
    *   *Response:* `ResponseEntity<PageResponse<ProjectApplicationItemResponse>>`
*   **`PUT /project-applications/{applicationId}/status`** (Company duyệt hồ sơ ứng tuyển)
    *   *Request:* `{ status: "APPROVED" | "REJECTED" }`
    *   *Response:* `ResponseEntity<UpdateApplicationStatusResponse>`

### 6. Task Module (Controller: `TaskController` tại `/tasks`)
*   **`POST /tasks`** (Tạo nhiệm vụ mới - Leader only)
    *   *Header:* `Content-Type: multipart/form-data`
    *   *Response:* `ApiResponse<TaskResponse>`
*   **`GET /tasks/projects/{projectId}/open-tasks-freelancer`** (Xem các nhiệm vụ OPEN của dự án)
    *   *Response:* `ApiResponse<List<TaskResponse>>`
*   **`POST /tasks/{taskId}/claim`** (Thành viên tự nhận nhiệm vụ OPEN)
    *   *Response:* `ApiResponse<TaskResponse>`
*   **`GET /tasks/my-tasks`** (Xem danh sách nhiệm vụ được giao của bản thân)
    *   *Response:* `ApiResponse<List<TaskResponse>>`
*   **`GET /tasks/{taskId}`** (Xem chi tiết nhiệm vụ)
    *   *Response:* `ApiResponse<TaskResponse>`
*   **`PUT /tasks/{taskId}/status`** (Cập nhật trạng thái thực hiện nhiệm vụ)
    *   *Request:* `{ status: "TODO" | "IN_PROGRESS" | "DONE" }`
    *   *Response:* `ApiResponse<TaskResponse>`
*   **`GET /tasks/project/{projectId}`** (Xem danh sách tất cả nhiệm vụ trong dự án - Leader only)
    *   *Response:* `ApiResponse<List<TaskResponse>>`

### 7. Wallet & Payment Module (Controllers: `WalletController` tại `/wallets`, `WalletHistoryController` tại `/wallet-history`, `PaymentController` tại `/payments`, `VNPayController` tại `/vnpay`, `DistributionController` tại `/distributions`)
*   **`GET /wallets/me`** (Lấy số dư ví hiện tại)
    *   *Response:* `ApiResponse<WalletResponse>`
*   **`POST /wallets/withdraw`** (Freelancer làm lệnh rút tiền mặt về ngân hàng)
    *   *Request:* `{ amount, bankName, accountNumber, accountHolderName }`
    *   *Response:* `ApiResponse<Void>`
*   **`GET /wallet-history/income-history`** (Xem lịch sử nhận tiền thanh toán dự án)
    *   *Response:* `ResponseEntity<List<MyIncomeTransactionResponse>>`
*   **`GET /wallet-history/withdraw`** (Xem lịch sử giao dịch rút tiền mặt)
    *   *Response:* `ResponseEntity<List<WithdrawHistoryResponse>>`
*   **`POST /payments/project/{projectId}/initiate`** (Company kích hoạt nạp tiền thanh toán dự án qua cổng VNPay)
    *   *Response:* `ResponseEntity<PaymentInitiateResponse>` chứa URL liên kết để chuyển hướng người dùng sang trang thanh toán của VNPay.
*   **`GET /payments/{paymentId}`** (Xem chi tiết giao dịch thanh toán - Admin only)
    *   *Response:* `ResponseEntity<ApiResponse<PaymentDetailResponse>>`
*   **`POST /distributions/{paymentId}`** (Phân phối tiền dự án cho Đội ngũ sau nghiệm thu - Admin/System only)
    *   *Response:* `ResponseEntity<String>` ("Distributed successfully")

### 8. Admin Module (Controller: `AdminController` tại `/admin`)
*   **`GET /admin/companies/pending`** (Xem danh sách doanh nghiệp đang chờ duyệt hồ sơ)
    *   *Response:* `ApiResponse<PageResponse<PendingCompanyResponse>>`
*   **`GET /admin/projects/pending`** (Xem danh sách dự án mới đang chờ duyệt nội dung)
    *   *Response:* `ApiResponse<PageResponse<PendingProjectResponse>>`
*   **`PUT /admin/projects/{projectId}/status`** (Admin phê duyệt/từ chối kích hoạt dự án)
    *   *Request:* `{ status: "APPROVED" | "REJECTED", reason?: string }`
    *   *Response:* `ApiResponse<UpdateProjectStatusResponse>`
*   **`PUT /admin/companies/{companyId}/status`** (Admin phê duyệt/từ chối kích hoạt hồ sơ Doanh nghiệp)
    *   *Request:* `{ status: "APPROVED" | "REJECTED" }`
    *   *Response:* `ApiResponse<CompanyStatusResponse>`

---

## 🔴 Danh mục Mã lỗi Nghiệp vụ (Global Error Codes)

Khi xử lý phát sinh ngoại lệ, thuộc tính `error` trong phản hồi thất bại sẽ trả về các mã định danh chuẩn sau để Frontend hiển thị hộp thoại cảnh báo thân thiện:

| Mã lỗi nghiệp vụ | Mô tả nguyên nhân | HTTP Status tương ứng |
| :--- | :--- | :---: |
| **`INVALID_CREDENTIALS`** | Email hoặc mật khẩu đăng nhập không trùng khớp | `401 Unauthorized` |
| **`EMAIL_ALREADY_EXISTS`**| Địa chỉ email đăng ký đã có tài khoản sử dụng | `409 Conflict` |
| **`ACCOUNT_BLOCKED`** | Tài khoản người dùng đang bị khóa do vi phạm điều khoản | `403 Forbidden` |
| **`USER_NOT_FOUND`** | Không tìm thấy thông tin định danh người dùng trong DB | `404 Not Found` |
| **`PROJECT_NOT_FOUND`** | Không tồn tại dự án yêu cầu hoặc đã bị xóa | `404 Not Found` |
| **`APPLICATION_NOT_FOUND`**| Đơn ứng tuyển dự án không tồn tại | `404 Not Found` |
| **`INSUFFICIENT_FUNDS`** | Số dư ví tiền không đủ thực hiện thanh toán/rút tiền | `400 Bad Request` |
| **`UNAUTHORIZED`** | Yêu cầu thiếu Access Token hợp lệ | `401 Unauthorized` |
| **`ACCESS_DENIED`** | Người dùng hiện tại không đủ quyền hạn truy cập | `403 Forbidden` |

---

## 🔧 Tiện ích Xử lý Lỗi Axios (Axios Error Helper Utility)

Hàm bổ trợ giúp bóc tách thông điệp lỗi tiếng Việt phản hồi từ Backend một cách an toàn và nhất quán:

*   **File Path:** `@/utils/apiError.ts`

```typescript
import { AxiosError } from "axios";

interface BackendErrorPayload {
  success: boolean;
  message: string;
  error?: string;
}

export const parseApiError = (err: unknown): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as BackendErrorPayload | undefined;
    
    // Ưu tiên thông điệp tiếng Việt chi tiết từ Backend
    if (data?.message) {
      return data.message;
    }
    
    // Phân loại lỗi HTTP cơ bản
    switch (err.response?.status) {
      case 400:
        return "Yêu cầu dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
      case 401:
        return "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
      case 403:
        return "Bạn không có quyền thực hiện hành động này.";
      case 404:
        return "Không tìm thấy tài nguyên yêu cầu trên hệ thống.";
      case 500:
        return "Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau.";
      default:
        return err.message || "Đã xảy ra lỗi không xác định.";
    }
  }
  
  if (err instanceof Error) {
    return err.message;
  }
  
  return "Đã xảy ra lỗi kết nối mạng.";
};
```
