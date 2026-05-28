import api from "../../../lib/axios";

export interface CompanyProject {
  projectId: string;

  projectName: string;

  description: string;

  budget: number;

  skillsRequired: string | string[];

  files?: string[];

  status: "PENDING" | "APPROVED" | "REJECTED";
  applyStatus: "OPEN" | "CLOSED";

  progressStatus:
    | "TODO"
    | "IN_PROGRESS"
    | "DONE";

  paymentStatus:
    | "UNPAID"
    | "PENDING"
    | "PARTIAL"
    | "PAID"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";

  deadline: string;

  appliedCount: number;

  acceptedCount: number;

  createdAt: string;

  company: {
    companyId: string;
    companyName: string;
  };
}

export interface CompanyProjectMember {
  memberId: string;
  freelancerId: string;
  freelancerName: string;
  isLeader: boolean;
  leader?: boolean;
  joinedAt: string;
}

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CompanyProjectApplication {
  applicationId: string;
  freelancerId: string;
  freelancerName: string;
  experience: string | null;
  programmingLanguages: string | null;
  portfolioLink: string | null;
  projectLinks: string | null;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface CompanyProjectMemberWithProject extends CompanyProjectMember {
  projectId: string;
  projectName: string;
  projectStatus: CompanyProject["status"];
  progressStatus: CompanyProject["progressStatus"];
}

export interface CompanyProjectApplicationWithProject
  extends CompanyProjectApplication {
  projectId: string;
  projectName: string;
  projectStatus: CompanyProject["status"];
  progressStatus: CompanyProject["progressStatus"];
}

export interface CompanyTeamProjectInfo {
  projectId: string;
  projectName: string;
  budget: number;
  deadline: string;
  status: CompanyProject["status"];
  progressStatus: CompanyProject["progressStatus"];
  paymentStatus: CompanyProject["paymentStatus"];
}

export interface CompanyTeamMember {
  memberId: string;
  freelancerId: string;
  fullName?: string;
  freelancerName?: string;
  email?: string;
  isLeader: boolean;
  joinedAt?: string;
}

export interface CompanyTeam {
  teamId: string;
  teamName: string;
  project: CompanyTeamProjectInfo;
  members: CompanyTeamMember[];
  createdAt: string;
}

export interface CompanyPayment {
  paymentId: string;
  paymentCode: string | null;
  projectId: string;
  projectTitle: string;
  totalAmount: number;
  paymentStatus: CompanyProject["paymentStatus"];
  txnRef: string | null;
  adminPercent: number | null;
  leaderPercent: number | null;
  createdAt: string;
  transaction?: {
    paymentTransactionId?: string;
    vnpayTransactionCode?: string;
    status?: string;
    responseCode?: string;
    bankCode?: string;
  } | null;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  projectId: string;
  totalAmount: number;
  status: CompanyProject["paymentStatus"];
  vnpayUrl: string;
  paymentCode?: string;
  createdAt: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageResponse<T> {
  items: T[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ProjectQueryParams {
  status?: string;
  progressStatus?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const companyProjectService = {
  async getProjects(): Promise<CompanyProject[]> {

  const response =
    await api.get<
      ApiResponse<CompanyProject[]>
    >("/companies/company/all-projects");

  return response.data.data || [];
},

async createProject(payload: FormData) {
  const response = await api.post(
    "/projects",
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
},

async updateProject(
  projectId: string,
  payload: Partial<CompanyProject>
) {
  const response = await api.put(
    `/projects/${projectId}`,
    payload
  );

  return response.data.data;
},
async lockProject(projectId: string) {
  const response = await api.put(
    `/companies/${projectId}/lock`
  );

  return response.data;
},

async unlockProject(projectId: string) {
  const response = await api.put(
    `/companies/${projectId}/unlock`
  );

  return response.data;
},
  async deleteProject(projectId: string) {
    const response = await api.delete(
      `/projects/${projectId}`
    );

    return response.data.data;
  },

  async getProjectMembers(projectId: string): Promise<CompanyProjectMember[]> {
    const response = await api.get<ApiResponse<CompanyProjectMember[]>>(
      `/companies/projects/${projectId}/members`
    );

    return response.data.data || [];
  },

  async removeProjectMember(projectId: string, memberId: string) {
    const response = await api.delete(
      `/companies/projects/${projectId}/members/${memberId}`
    );

    return response.data;
  },

  async getProjectApplications(
    projectId: string,
    status?: ApplicationStatus
  ): Promise<PageResponse<CompanyProjectApplication>> {
    const params = new URLSearchParams({
      page: "1",
      pageSize: "100",
    });

    if (status) {
      params.set("status", status);
    }

    const response = await api.get<PageResponse<CompanyProjectApplication>>(
      `/companies/${projectId}/freelancer-applications?${params.toString()}`
    );

    return response.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    status: Exclude<ApplicationStatus, "PENDING">
  ) {
    const response = await api.put(`/project-applications/${applicationId}/status`, {
      status,
    });

    return response.data;
  },

  async getTeams(): Promise<CompanyTeam[]> {
    const response = await api.get<ApiResponse<CompanyTeam[]>>("/companies/teams");

    return response.data.data || [];
  },

  async getTeamMembers(teamId: string): Promise<CompanyTeamMember[]> {
    const response = await api.get<ApiResponse<CompanyTeamMember[]>>(
      `/companies/teams/${teamId}/members`
    );

    return response.data.data || [];
  },

  async addTeamMember(teamId: string, freelancerId: string) {
    const response = await api.post(`/companies/${teamId}/members`, {
      freelancerId,
    });

    return response.data;
  },

  async setTeamLeader(teamId: string, freelancerId: string) {
    const response = await api.put(`/companies/${teamId}/leader`, {
      freelancerId,
    });

    return response.data;
  },

  async createTeam(payload: {
    projectId: string;
    name: string;
    memberIds: string[];
    leaderId?: string;
  }) {
    const response = await api.post("/companies/teams", payload);

    return response.data.data;
  },

  async getCompanyPayments(): Promise<CompanyPayment[]> {
    const response = await api.get<CompanyPayment[]>("/companies/my-payments");

    return response.data || [];
  },

  async initiateProjectPayment(projectId: string): Promise<PaymentInitiateResponse> {
    const response = await api.post<PaymentInitiateResponse>(
      `/payments/project/${projectId}/initiate`
    );

    return response.data;
  },
};
