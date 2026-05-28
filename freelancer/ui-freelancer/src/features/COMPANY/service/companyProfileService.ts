import axiosInstance from "../../../lib/axios";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CompanyDetailResponse {
    companyId: string;
    userId: string;
    companyName: string;
    address: string;
    taxCode: string;
    representativeName: string;
    representativePhone: string;
    expertise: string;
    status: string;
    approvedBy: string;
    approvedAt: string;
    createdAt: string;
}

export interface UpdateCompanyRequest {
    companyName: string;
    address: string;
    representativeName: string;
    representativePhone: string;
    expertise: string;
}

export const companyProfileService = {
    getMyProfile: async (): Promise<ApiResponse<CompanyDetailResponse>> => {
        const response = await axiosInstance.get("/companies/me");
        return response.data;
    },
    updateMyProfile: async (data: UpdateCompanyRequest): Promise<ApiResponse<string>> => {
        const response = await axiosInstance.put("/companies/me", data);
        return response.data;
    }
};
