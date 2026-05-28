import api from "../../../lib/axios";

export interface AdminPayment {
  paymentId: string;
  paymentCode: string | null;
  txnRef: string | null;
  totalAmount: number;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  adminPercent: number | null;
  leaderPercent: number | null;
  createdAt: string;
  projectId: string | null;
  projectName: string | null;
  companyId: string | null;
  companyName: string | null;
  paymentTransactionId: string | null;
  vnpayTransactionCode: string | null;
  gatewayStatus: string | null;
  responseCode: string | null;
  bankCode: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const adminPaymentService = {
  async getAllPayments(): Promise<AdminPayment[]> {
    const response = await api.get<ApiResponse<AdminPayment[]>>("/admin/payments");
    return response.data.data ?? [];
  },
};
