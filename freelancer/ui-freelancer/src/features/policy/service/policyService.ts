import api from "../../../lib/axios";

export const policyService = {
  getActiveRule: async () => {
    // Calls backend endpoint that returns the currently active payment rule
    return api.get("/payment-rules/active");
  }
};

export type ActiveRuleResponse = {
  id: string;
  name?: string;
  description?: string;
  config?: any;
};
