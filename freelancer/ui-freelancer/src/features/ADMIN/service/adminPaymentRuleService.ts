import api from "../../../lib/axios";

export interface PaymentRule {
  id: string;
  adminPercent: number;
  leaderPercent: number;
  freelancerPercent: number;
  active: boolean;
}

export interface CreatePaymentRuleRequest {
  adminPercent: number;
  leaderPercent: number;
  freelancerPercent: number;
}

export const adminPaymentRuleService = {
  async getActiveRule(): Promise<PaymentRule> {
    const response = await api.get<PaymentRule>("/payment-rules/active");
    return response.data;
  },

  async createRule(payload: CreatePaymentRuleRequest): Promise<PaymentRule> {
    const response = await api.post<PaymentRule>("/payment-rules", payload);
    return response.data;
  },
};
