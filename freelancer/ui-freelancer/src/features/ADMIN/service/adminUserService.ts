import api from "../../../lib/axios";

export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: "USER" | "FREELANCER" | "COMPANY" | "ADMIN";
    active: boolean;
    createdAt: string;
}

export interface UserDetail {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: "USER" | "FREELANCER" | "COMPANY" | "ADMIN";
    avatarUrl: string | null;
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

export interface ToggleUserStatusResponse {
    id: string;
    fullName: string;
    isActive: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export const adminUserService = {
    getAllUsers: async (
        page = 1,
        limit = 10
    ): Promise<PageResponse<AdminUser>> => {

        const response = await api.get<ApiResponse<PageResponse<AdminUser>>>(
            `/admin/all-users?page=${page}&limit=${limit}`
        );

        if (!response?.data?.data) {
            console.error('Invalid API response:', response);
            return { items: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        }

        return response.data.data;
    },

    getUserById: async (id: string): Promise<UserDetail> => {

        const response = await api.get<ApiResponse<UserDetail>>(
            `/admin/${id}/user-details`
        );

        if (!response?.data?.data) {
            console.error('Invalid API response for user detail:', response);
            throw new Error('Failed to fetch user details');
        }

        return response.data.data;
    },

    toggleUserStatus: async (
        id: string
    ): Promise<ToggleUserStatusResponse> => {

        const response = await api.patch<ApiResponse<ToggleUserStatusResponse>>(
            `/admin/${id}/toggle-status`
        );

        if (!response?.data?.data) {
            console.error('Invalid API response for toggle status:', response);
            throw new Error('Failed to toggle user status');
        }

        return response.data.data;
    },
};