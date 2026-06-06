import api from "../../lib/axios";

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  read?: boolean;
  referenceId: string | null;
  createdAt: string;
}

interface RawNotification extends Omit<AppNotification, "isRead"> {
  isRead?: boolean;
  read?: boolean;
}

export const notificationService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    const response = await api.get<RawNotification[]>("/users/notifications");

    return (response.data || []).map((notification) => ({
      ...notification,
      isRead: notification.isRead ?? notification.read ?? false,
    }));
  },

  async markAsRead(notificationId: string) {
    const response = await api.put(`/users/notifications/${notificationId}/read`);

    return response.data;
  },
};
