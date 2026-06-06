import api from "../../../lib/axios";

export interface AdminBroadcastRequest {
  title: string;
  content: string;
}

export interface AdminSendCompanyNotificationRequest {
  companyId: string;
  title: string;
  content: string;
}

export const adminNotificationService = {
  async broadcastToAdmins(req: AdminBroadcastRequest) {
    const res = await api.post("/admin/admin/notifications/broadcast", req);
    return res.data;
  },

  async sendNotificationToCompany(req: AdminSendCompanyNotificationRequest) {
    const res = await api.post("/admin/notification/company", req);
    return res.data;
  }
};

export default adminNotificationService;
