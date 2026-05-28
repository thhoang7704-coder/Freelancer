import axiosInstance from "../../../lib/axios";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface FreelancerResponse {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    experience: string;
    projectLinks: string;
    programmingLanguages: string;
    certificates: string;
    portfolioLink: string;
    avatarUrl: string;
    createdAt: string;
}

export interface UpdateFreelancerRequest {
    experience?: string;
    projectLinks?: string;
    programmingLanguages?: string;
    certificates?: string;
    portfolioLink?: string;
    avatarUrl?: string;
}

export const freelancerProfileService = {
    getMyProfile: async (): Promise<ApiResponse<FreelancerResponse>> => {
        const response = await axiosInstance.get("/freelancers/me");
        return response.data;
    },
    updateMyProfile: async (data: UpdateFreelancerRequest): Promise<ApiResponse<FreelancerResponse>> => {
        const response = await axiosInstance.put("/freelancers/me", data);
        return response.data;
    }
};
