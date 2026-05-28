# 04 — STATE MANAGEMENT & API PATTERNS

> [!IMPORTANT]
> **Quy chuẩn Quản lý Trạng thái (Zustand) & Tương tác API (Axios/Service Layer)**
> Tài liệu này chuẩn hóa toàn bộ luồng truyền tải dữ liệu, kiến trúc lưu trữ toàn cục, và cách tích hợp phân trang chuẩn hóa đồng bộ 100% giữa Spring Boot và React.

---

## 🏗 Luồng Kiến trúc Dữ liệu (Frontend Data Flow)

Ứng dụng tuân thủ nghiêm ngặt mô hình truyền tải dữ liệu một chiều từ Server về Client để đảm bảo tính nhất quán và dễ gỡ lỗi:

```
[UI Component (AntD/Tailwind)]
       │ (Phát sinh sự kiện / Click / Submit)
       ▼
[Zustand Store Action] (Bật trạng thái isLoading = true)
       │
       ▼
[Service Layer (Axios Instance)]
       │ (Gửi HTTP Request kèm Access Token Header)
       ▼
[Spring Boot REST API (Port 8082)]
       │ (Xử lý nghiệp vụ & Truy vấn DB)
       ▼
[Standardized Response DTO] (ApiResponse<T> hoặc ApiResponse<PageResponse<T>>)
       │
       ▼
[Zustand Store Update] (Lưu dữ liệu, cập nhật isLoading = false)
       │ (Kích hoạt Reactive re-render)
       ▼
[UI Component Re-render] (Giao diện hiển thị dữ liệu mới nhất)
```

---

## 📄 Quy chuẩn Phân trang chuẩn hóa (Pagination Sync)

> [!TIP]
> **Đồng bộ hóa Tuyệt vời giữa Spring Boot và Ant Design!**
> Theo cấu hình thực tế trong `application.yaml` của Backend:
> ```yaml
> spring:
>   data:
>     web:
>       pageable:
>         one-indexed-parameters: true  # BẬT phân trang bắt đầu từ 1
>         size-parameter: limit          # Đổi tên tham số kích thước thành limit
> ```
> *   **Phía Backend:** Tiếp nhận trang đầu tiên là `page=1` và số lượng bản ghi là `limit=20`.
> *   **Phía Frontend:** Cấu phần `Table` của Ant Design mặc định cũng sử dụng cơ chế **1-indexed** (trang 1 là trang đầu tiên).
> *   **Ý nghĩa:** Lập trình viên **không cần** thực hiện phép tính cộng trừ `- 1` phức tạp khi gửi yêu cầu phân trang lên máy chủ. Chỉ cần truyền thẳng giá trị `page` hiện tại từ Ant Design trực tiếp lên API!

### 1. DTO Phân trang chuẩn từ Backend (`PageResponse<T>`)
```typescript
interface PaginationMeta {
  page: number;        // Trang hiện tại (1-indexed)
  limit: number;       // Số lượng bản ghi trên mỗi trang
  total: number;       // Tổng số bản ghi thực tế trong Database
  totalPages: number;  // Tổng số trang tính toán được
}

interface PageResponse<T> {
  items: T[];                 // Danh sách bản ghi của trang hiện tại
  pagination: PaginationMeta; // Metadata hỗ trợ vẽ giao diện phân trang
}
```

---

## 🗄 Danh sách các Zustand Store Toàn cục (Global Stores)

Ứng dụng quản lý các trạng thái nghiệp vụ cốt lõi thông qua 4 Zustand Stores độc lập:

### 1. Auth Store (`useAuthStore.ts`)
Quản lý mã JWT xác thực, quyền hạn người dùng và trạng thái phiên làm việc.

```typescript
import { create } from "zustand";

export type UserRole = "USER" | "FREELANCER" | "COMPANY" | "ADMIN";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  
  setAuth: (token: string, user: CurrentUser) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setAuth: (token, user) => set({ accessToken: token, user, isAuthenticated: true }),
  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false }),
  setInitializing: (value) => set({ isInitializing: value }),
}));
```

### 2. Project Store (`useProjectStore.ts`)
Lưu giữ danh sách dự án phân trang, bộ lọc tìm kiếm hiện tại và trạng thái thao tác dự án.

```typescript
import { create } from "zustand";
import api from "@/lib/axios";

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED";
  deadline: string;
  created_at: string;
}

interface ProjectState {
  projects: Project[];
  total: number;
  currentPage: number;
  limit: number;
  isLoading: boolean;
  
  fetchProjects: (page: number, limit: number, search?: string) => Promise<void>;
  createProject: (payload: Omit<Project, "id" | "created_at">) => Promise<void>;
  lockProject: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  total: 0,
  currentPage: 1,
  limit: 10,
  isLoading: false,

  fetchProjects: async (page, limit, search = "") => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/projects`, {
        params: { page, limit, search }
      });
      // Backend phản hồi bọc qua ApiResponse<PageResponse<T>>
      const { items, pagination } = response.data.data;
      set({
        projects: items,
        total: pagination.total,
        currentPage: pagination.page,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Lỗi khi tải danh sách dự án:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (payload) => {
    set({ isLoading: true });
    try {
      await api.post("/projects", payload);
    } finally {
      set({ isLoading: false });
    }
  },

  lockProject: async (projectId) => {
    set({ isLoading: true });
    try {
      await api.patch(`/companies/${projectId}/lock`); // Khớp API Controller thực tế
    } finally {
      set({ isLoading: false });
    }
  }
}));
```

### 3. Task Store (`useTaskStore.ts`)
Quản lý trạng thái phân chia nhiệm vụ trong dự án, hỗ trợ cập nhật nhanh giao diện Kanban.

```typescript
import { create } from "zustand";
import api from "@/lib/axios";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string | null; // Freelancer ID
  status: "TODO" | "IN_PROGRESS" | "DONE";
  deadline: string;
  file_url?: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  
  fetchProjectTasks: (projectId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: "TODO" | "IN_PROGRESS" | "DONE") => Promise<void>;
  claimOpenTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchProjectTasks: async (projectId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/tasks/projects/${projectId}/open-tasks-freelancer`);
      set({ tasks: response.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTaskStatus: async (taskId, status) => {
    // Cập nhật Optimistic Update để tăng tốc độ phản hồi UI
    const previousTasks = get().tasks;
    set({
      tasks: previousTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
    });

    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
    } catch (error) {
      // Rollback nếu API lỗi
      set({ tasks: previousTasks });
      console.error("Không thể cập nhật trạng thái nhiệm vụ:", error);
    }
  },

  claimOpenTask: async (taskId) => {
    set({ isLoading: true });
    try {
      await api.post(`/tasks/${taskId}/claim`);
    } finally {
      set({ isLoading: false });
    }
  }
}));
```

### 4. Notification Store (`useNotificationStore.ts`)
Đồng bộ các thông báo hệ thống và hỗ trợ cập nhật tức thời (Realtime Push) khi Firebase bắn dữ liệu về.

```typescript
import { create } from "zustand";
import api from "@/lib/axios";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: SystemNotification[];
  unreadCount: number;
  isLoading: boolean;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  receiveRealtimeNotification: (notification: SystemNotification) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/users/notifications"); // Khớp Endpoint thực tế
      const items = response.data.data || [];
      const unread = items.filter((n: SystemNotification) => !n.is_read).length;
      set({ notifications: items, unreadCount: unread });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/users/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error("Lỗi khi đọc thông báo:", error);
    }
  },

  receiveRealtimeNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  }
}));
```

---

## 🚨 Các Quy tắc Thiết kế Store & API (AI MUST FOLLOW)

> [!WARNING]
> Bất kỳ vi phạm nào đối với các nguyên tắc dưới đây đều gây ra lỗ hổng bảo mật hoặc mất đồng bộ dữ liệu:

1.  **Centralized Server State:** Không sao chép dữ liệu nhận về từ API vào state cục bộ (`useState`) của component nếu dữ liệu đó cần được chia sẻ giữa nhiều màn hình. Luôn luôn giữ nó tập trung ở Zustand Store.
2.  **Optimistic UI Updates:** Đối với các tác vụ có tần suất tương tác cao và tỷ lệ lỗi thấp (ví dụ: Đánh dấu đã đọc thông báo, Thay đổi trạng thái Task Kanban), hãy thực hiện cập nhật UI trước (Optimistic Update) và cung cấp khối `try/catch` để khôi phục (Rollback) trạng thái ban đầu nếu API thất bại.
3.  **Tách biệt tuyệt đối:** Không được tích hợp mã hiển thị giao diện của Ant Design (như `notification.success`, `message.error`) vào bên trong Zustand Store hay Service Layer. Hãy để việc hiển thị thông báo phản hồi cho UI Component bằng cách trả về một Promise từ Store Action.
