import api from "../../../lib/axios";

export interface PendingProject {
  projectId: string;
  name: string;
  budget: number;
  description: string;
  deadline: string;
  company: {
    companyId: string;
    companyName: string;
  };
  status: "PENDING" | "REJECTED";
  createdAt: string;
  files: string[];
}

export interface PendingProjectResponse {
  items: PendingProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateProjectStatusRequest {
  status: "APPROVED" | "REJECTED";
  reason?: string;
}

export interface UpdateProjectStatusResponse {
  projectId: string;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const adminPendingProjectService = {
  async getPendingProjects(page = 1, pageSize = 20): Promise<PendingProjectResponse> {
    const response = await api.get<ApiResponse<PendingProjectResponse>>(
      `/admin/projects/pending?page=${page}&pageSize=${pageSize}`
    );

    if (!response?.data?.data) {
      console.error('Invalid API response:', response);
      return { items: [], pagination: { page, limit: pageSize, total: 0, totalPages: 0 } };
    }

    return response.data.data;
  },

  async updateProjectStatus(
    projectId: string,
    request: UpdateProjectStatusRequest
  ): Promise<UpdateProjectStatusResponse> {
    const response = await api.put<ApiResponse<UpdateProjectStatusResponse>>(
      `/admin/projects/${projectId}/status`,
      request
    );

    if (!response?.data?.data) {
      console.error('Invalid API response:', response);
      throw new Error('Cập nhật trạng thái dự án thất bại');
    }

    return response.data.data;
  },
};
