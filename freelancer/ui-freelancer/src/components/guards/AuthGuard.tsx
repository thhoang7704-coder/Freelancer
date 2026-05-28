import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, type UserRole } from "../../stores/authStore";
import { Spin, Result, Button } from "antd";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();
  const location = useLocation();

  // 1. Hiển thị loading khi đang khôi phục session F5
  if (isInitializing) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <Spin size="large" />
        <span style={{ color: "#8c8c8c", fontSize: "14px" }}>Đang khôi phục phiên đăng nhập...</span>
      </div>
    );
  }

  // 2. Nếu chưa đăng nhập, chuyển hướng sang trang Login và lưu lại URL hiện tại
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Nếu đã đăng nhập nhưng không đủ quyền truy cập (Role không khớp)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f5f7fb" }}>
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào tài nguyên này."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại trang trước
            </Button>
          }
        />
      </div>
    );
  }

  // 4. Nếu hợp lệ, cho phép hiển thị nội dung trang
  return <>{children}</>;
};
