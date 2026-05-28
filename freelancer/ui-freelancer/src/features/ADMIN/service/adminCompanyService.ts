import api from "../../../lib/axios";

export interface Company {
    companyId: string;
    companyName: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    expertise: string | null;
    totalProjects: number;
    taxCode?: string;
}

export interface PendingCompany {
    id?: string;
    companyId?: string;
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    foundedDate: string;
    companyField: string;
    description: string;
    taxCode?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
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

export interface UpdateCompanyStatusRequest {
    status: "APPROVED" | "REJECTED";
    reason?: string;
}

export interface CompanyStatusResponse {
    id: string;
    companyName: string;
    status: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export const adminCompanyService = {
    async getAllCompanies(): Promise<Company[]> {
        const response = await api.get<ApiResponse<Company[]>>(
            "/admin/companies"
        );

        return response.data.data;
    },

    async getPendingCompanies(page = 1, pageSize = 20): Promise<PageResponse<PendingCompany>> {
        const response = await api.get<ApiResponse<PageResponse<PendingCompany>>>(
            `/admin/companies/pending?page=${page}&pageSize=${pageSize}`
        );

        if (!response?.data?.data) {
            console.error('Invalid API response:', response);
            return { items: [], pagination: { page, limit: pageSize, total: 0, totalPages: 0 } };
        }

        return response.data.data;
    },

    async updateCompanyStatus(
        companyId: string,
        request: UpdateCompanyStatusRequest
    ): Promise<CompanyStatusResponse> {
        const response = await api.put<ApiResponse<CompanyStatusResponse>>(
            `/admin/companies/${companyId}/status`,
            request
        );

        if (!response?.data?.data) {
            console.error('Invalid API response:', response);
            throw new Error('Cập nhật trạng thái doanh nghiệp thất bại');
        }

        return response.data.data;
    },
};