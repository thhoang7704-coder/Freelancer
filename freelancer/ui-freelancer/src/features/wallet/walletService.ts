import api from "../../lib/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface WalletResponse {
  walletId: string;
  balance: number;
  userId: string;
}

export interface MyIncomeTransactionResponse {
  id: string;
  amount: number;
  description: string;
  projectName?: string;
  createdAt: string;
  type?: string;
}

export interface WithdrawHistoryResponse {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountName: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  createdAt: string;
  note?: string;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
 bankAccount: string;
  accountName: string;
}

export const walletService = {
  /** GET /wallets/me — lấy số dư ví */
  async getMyWallet(): Promise<WalletResponse> {
    const res = await api.get<ApiResponse<WalletResponse>>("/wallets/me");
    return res.data.data;
  },

  /** GET /wallet-history/income-history — lịch sử nhận tiền */
  async getIncomeHistory(): Promise<MyIncomeTransactionResponse[]> {
    const res = await api.get<MyIncomeTransactionResponse[]>(
      "/wallet-history/income-history"
    );
    return res.data ?? [];
  },

  /** GET /wallet-history/withdraw — lịch sử rút tiền */
  async getWithdrawHistory(): Promise<WithdrawHistoryResponse[]> {
    const res = await api.get<WithdrawHistoryResponse[]>(
      "/wallet-history/withdraw"
    );
    return res.data ?? [];
  },

  /** POST /wallets/withdraw — tạo lệnh rút tiền */
  async withdraw(payload: WithdrawRequest): Promise<void> {
    await api.post("/wallets/withdraw", payload);
  },
};
