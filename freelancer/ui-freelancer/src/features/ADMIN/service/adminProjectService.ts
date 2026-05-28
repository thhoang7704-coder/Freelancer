import api from "../../../lib/axios";

export interface Project {
  projectId: string;
  name: string;
  description: string;
  budget: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  deadline: string;
  progressStatus: "TODO" | "IN_PROGRESS" | "COMPLETED";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  company: {
    companyId: string;
    companyName: string;
  };
  appliedCount: number;
  acceptedCount: number;
  createdAt: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const adminProjectService = {
  async getAllProjects(): Promise<Project[]> {
    const response = await api.get<ApiResponse<Project[]>>(
      "/admin/allprojects"
    );

    if (!response?.data?.data) {
      console.error('Invalid API response:', response);
      return [];
    }

    return response.data.data;
  },
};
