import api from "../../../lib/axios";

// ─── Response Types ────────────────────────────────────────────────────────────

export interface ProjectItem {
  projectId: string;
  name: string;
  description: string;
  budget: number;
  companyName: string;
  isLeader: boolean;
  progressStatus: "TODO" | "IN_PROGRESS" | "DONE";
  deadline?: string;
}

export interface TaskItem {
  taskId: string;
  projectId?: string;
  projectName?: string;
  title: string;
  description: string;
  fileUrl?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  taskType: "OPEN" | "ASSIGNED";
  assignedTo?: string;
  assignedToName?: string;
  deadline?: string;
  createdAt: string;
}

export interface ProjectMember {
  memberId: string;
  freelancerId: string;
  freelancerName: string;
  isLeader: boolean;
  joinedAt: string;
}

export interface LeaderTaskOverviewItem {
  taskId: string;
  title: string;
  description: string;
  taskType: "OPEN" | "ASSIGNED";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assigned: boolean;
  freelancerId?: string;
  freelancerName?: string;
  deadline?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const freelancerTaskService = {
  /**
   * Lấy danh sách các dự án freelancer đã tham gia (APPROVED application)
   */
  async getJoinedProjects(): Promise<ProjectItem[]> {
    const res = await api.get<any>("/project-applications/my-applications", {
      params: { page: 1, pageSize: 100, status: "APPROVED" }
    });
    
    const items = res.data?.data?.items || res.data?.items || [];
    
    // Ánh xạ thành ProjectItem
    const projects: ProjectItem[] = items.map((item: any) => ({
      projectId: item.projectId || "",
      name: item.projectName || "Dự án không tên",
      description: item.projectDescription || "",
      budget: item.budget || 0,
      companyName: item.company?.companyName || "Công ty ẩn danh",
      isLeader: false, // Sẽ được kiểm tra và cập nhật động ở FE
      progressStatus: item.progressStatus || "TODO",
      deadline: item.deadline
    }));

    return projects;
  },

  /**
   * Kiểm tra xem freelancer có phải là leader của project hay không bằng cách gọi thử API leader.
   * Nếu thành công thì là Leader, ngược lại thì không.
   */
  async checkIsLeader(projectId: string): Promise<boolean> {
    try {
      await api.get(`/freelancers/project/${projectId}/leader-overview`);
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Lấy danh sách task OPEN chưa nhận của project
   */
  async getOpenTasks(projectId: string): Promise<TaskItem[]> {
    const res = await api.get<ApiResponse<TaskItem[]>>(
      `/tasks/projects/${projectId}/open-tasks-freelancer`
    );
    return res.data?.data || [];
  },

  /**
   * Nhận task OPEN
   */
  async claimTask(taskId: string): Promise<void> {
    await api.post(`/tasks/${taskId}/claim`);
  },

  /**
   * Lấy danh sách các task được giao và task tự nhận của chính mình
   */
  async getMyTasks(): Promise<TaskItem[]> {
    const res = await api.get<ApiResponse<TaskItem[]>>("/tasks/my-tasks");
    return res.data?.data || [];
  },

  /**
   * Cập nhật trạng thái task (chỉ có thể cập nhật sang IN_PROGRESS hoặc DONE)
   */
  async updateTaskStatus(taskId: string, status: "IN_PROGRESS" | "DONE"): Promise<void> {
    await api.put(`/tasks/${taskId}/status`, { status });
  },

  /**
   * Lấy toàn bộ task của project (chỉ dành cho leader)
   */
  async getProjectTasks(projectId: string): Promise<TaskItem[]> {
    const res = await api.get<ApiResponse<TaskItem[]>>(`/tasks/project/${projectId}`);
    return res.data?.data || [];
  },

  /**
   * Tạo task mới (chỉ dành cho leader)
   * Sử dụng FormData vì có truyền tệp đính kèm (MultipartFile)
   */
  async createTask(formData: FormData): Promise<void> {
    await api.post("/tasks", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  /**
   * Lấy danh sách thành viên dự án
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const res = await api.get<ProjectMember[]>(
      `/project-applications/${projectId}/members`
    );
    return res.data || [];
  },

  /**
   * Cập nhật tiến độ dự án (chỉ leader mới dùng)
   */
  async updateProjectProgress(projectId: string, progressStatus: "TODO" | "IN_PROGRESS" | "DONE"): Promise<void> {
    await api.put(`/freelancers/leader/${projectId}/progress`, { progressStatus });
  }
};
