import { AxiosError } from "axios";

interface BackendErrorPayload {
  success: boolean;
  message: string;
  error?: string;
}

export const parseApiError = (err: unknown): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as BackendErrorPayload | undefined;
    
    // Ưu tiên thông điệp tiếng Việt chi tiết từ Backend
    if (data?.message) {
      return data.message;
    }
    
    // Phân loại lỗi HTTP cơ bản
    switch (err.response?.status) {
      case 400:
        return "Yêu cầu dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
      case 401:
        return "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
      case 403:
        return "Bạn không có quyền thực hiện hành động này.";
      case 404:
        return "Không tìm thấy tài nguyên yêu cầu trên hệ thống.";
      case 500:
        return "Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau.";
      default:
        return err.message || "Đã xảy ra lỗi không xác định.";
    }
  }
  
  if (err instanceof Error) {
    return err.message;
  }
  
  return "Đã xảy ra lỗi kết nối mạng.";
};
