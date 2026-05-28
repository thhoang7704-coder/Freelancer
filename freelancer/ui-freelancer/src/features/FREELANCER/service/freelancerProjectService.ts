import api from "../../../lib/axios";

// ─── Response Types ────────────────────────────────────────────────────────────

export interface ProjectItemResponse {
  projectId: string;
  name: string;
  description: string;
  budget: number;
  skillsRequired: string;
  status: string;
  progressStatus: string;
  applyStatus: string;
  company: {
    companyId: string;
    companyName: string;
  };
  createdAt: string;
  deadline?: string;
  applicationCount?: number;
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
  }[];
}

export interface PageData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ProjectApplicationItemResponse {
  applicationId: string;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  projectStatus?: string;
  budget?: number;
  company?: {
    companyId: string;
    companyName: string;
  };
  coverLetter?: string;
  proposedRate?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedAt: string;
  updatedAt?: string;
}

export interface ApplyProjectRequest {
  projectId: string;
  coverLetter: string;
  proposedRate: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const freelancerProjectService = {
  /**
   * GET /projects — Lấy danh sách dự án công khai (có phân trang)
   */
  async getProjects(params?: {
    search?: string;
    status?: string;
    progressStatus?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PageData<ProjectItemResponse>> {
    const res = await api.get<ApiResponse<PageData<ProjectItemResponse>>>(
      "/projects",
      { params: { page: 1, pageSize: 20, ...params } }
    );
    return res.data.data;
  },

  /**
   * POST /project-applications — Nộp đơn ứng tuyển
   */
  async applyProject(payload: ApplyProjectRequest): Promise<void> {
    await api.post("/project-applications", payload);
  },

  /**
   * GET /project-applications/my-applications — Đơn ứng tuyển của tôi
   */
  async getMyApplications(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PageData<ProjectApplicationItemResponse>> {
    const res = await api.get<ApiResponse<PageData<ProjectApplicationItemResponse>>>(
      "/project-applications/my-applications",
      { params: { page: 1, pageSize: 50, ...params } }
    );
    // Backend returns ResponseEntity<PageResponse<...>>  — data may be nested differently
    const raw = res.data as unknown as { data?: PageData<ProjectApplicationItemResponse> } & PageData<ProjectApplicationItemResponse>;
    if (raw.data) return raw.data;
    return raw as PageData<ProjectApplicationItemResponse>;
  },
};
