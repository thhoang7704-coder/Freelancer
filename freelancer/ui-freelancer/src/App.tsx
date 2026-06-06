import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import axios from "axios";
import api from "./lib/axios";

// Pages & Components
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { AuthGuard } from "./components/guards/AuthGuard";
import { Spin } from "antd";

// New ADMIN views
import {
  AdminLayout,
  AdminStatisticsPage,
  AdminUsersPage,
  AdminCompaniesPage,
  AdminCompaniesApprovalPage,
  AdminProjectsPage,
  AdminPendingProjectsPage,
  AdminPaymentsPage,
  AdminPaymentRulesPage,
  AdminWalletPage,
  AdminNotificationPage,
} from "./features/ADMIN";

// New COMPANY views
import {
  CompanyLayout,
  CompanyDashboardPage,
  CompanyProjectsPage,
  CompanyProjectMembersPage,
  CompanyApprovedFreelancersPage,
  CompanyFreelancersPage,
  CompanyContractsPage,
  CompanyPaymentsPage,
  CompanyProfilePage,
  CompanyProjectTasksPage
} from "./features/COMPANY";

// New FREELANCER views
import {
  FreelancerLayout,
  FreelancerDashboardPage,
  FreelancerProjectsPage,
  FreelancerMyApplicationsPage,
  FreelancerContractsPage,
  FreelancerEarningsPage,
  FreelancerProfilePage,
  FreelancerTasksPage,
  FreelancerMyProjectsPage,
  FreelancerTeamsPage
} from "./features/FREELANCER";

// Policy page
import { PolicyPage } from "./features/policy";
// New USER views
import {
  UserLayout,
  UserDashboardPage,
  UserProfilePage,
  UserSettingsPage
} from "./features/USER";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api/v1";

// Component điều hướng thông minh tại Root Route (/)
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Điều hướng người dùng về đúng Dashboard dựa trên Role
  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    case "COMPANY":
      return <Navigate to="/company/dashboard" replace />;
    case "FREELANCER":
      return <Navigate to="/freelancer/dashboard" replace />;
    case "USER":
      return <Navigate to="/user/dashboard" replace />;
    default:
      return <Navigate to="/user/dashboard" replace />;
  }
};

export const App: React.FC = () => {
  const { setAuth, clearAuth, setInitializing, isInitializing } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      const storedRefreshToken = localStorage.getItem("refresh_token");
      if (!storedRefreshToken) {
        clearAuth();
        setInitializing(false);
        return;
      }

      try {
        // 1. Lấy Access Token mới bằng Refresh Token
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken }
        );
        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem("refresh_token", refresh_token);

        // 2. Lấy thông tin User Profile hiện tại
        // Đích đến thực tế: http://localhost:8082/api/v1/api/v1/users/me (UserController có tiền tố bị lặp)
        // do Axios client 'api' đã cấu hình sẵn baseURL là '/api/v1', truyền '/api/v1/users/me' để Axios ghép thành '/api/v1/api/v1/users/me'
        const meResponse = await api.get("/api/v1/users/me", {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        // 3. Đưa thông tin vào Zustand Store
        setAuth(access_token, meResponse.data.data);
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem("refresh_token");
        clearAuth();
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, [setAuth, clearAuth, setInitializing]);

  if (isInitializing) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <Spin size="large" />
        <span style={{ color: "#8c8c8c", fontSize: "14px" }}>Đang khôi phục phiên đăng nhập...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route gốc: Điều phối vai trò tự động */}
      <Route path="/" element={<RootRedirect />} />

      {/* Các tuyến đường Xác thực */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Hệ thống Route mới cho Admin sử dụng Layout và nested routes */}
      <Route
        path="/admin"
        element={
          <AuthGuard allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminStatisticsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="companies" element={<AdminCompaniesPage />} />
        <Route path="companies/approval" element={<AdminCompaniesApprovalPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="projects/pending" element={<AdminPendingProjectsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="payment-rules" element={<AdminPaymentRulesPage />} />
        <Route path="wallet" element={<AdminWalletPage />} />
        <Route path="notifications/new" element={<AdminNotificationPage />} />
        <Route path="statistics" element={<AdminStatisticsPage />} />
      </Route>

      {/* Hệ thống Route mới cho Doanh nghiệp sử dụng Layout và nested routes */}
      <Route
        path="/company"
        element={
          <AuthGuard allowedRoles={["COMPANY"]}>
            <CompanyLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/company/dashboard" replace />} />
        <Route path="dashboard" element={<CompanyDashboardPage />} />
        <Route path="projects" element={<CompanyProjectsPage />} />
        <Route path="project-members" element={<CompanyProjectMembersPage />} />
        <Route path="tasks" element={<CompanyProjectTasksPage />} />
        <Route path="freelancer-approvals" element={<CompanyApprovedFreelancersPage />} />
        <Route path="freelancers" element={<CompanyFreelancersPage />} />
        <Route path="contracts" element={<CompanyContractsPage />} />
        <Route path="payments" element={<CompanyPaymentsPage />} />
        <Route path="profile" element={<CompanyProfilePage />} />
        <Route path="policy" element={<PolicyPage />} />
      </Route>

      {/* Hệ thống Route mới cho Chuyên gia tự do (Freelancer) sử dụng Layout và nested routes */}
      <Route
        path="/freelancer"
        element={
          <AuthGuard allowedRoles={["FREELANCER"]}>
            <FreelancerLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
        <Route path="dashboard" element={<FreelancerDashboardPage />} />
        <Route path="projects" element={<FreelancerProjectsPage />} />
        <Route path="my-applications" element={<FreelancerMyApplicationsPage />} />
        <Route path="my-projects" element={<FreelancerMyProjectsPage />} />
        <Route path="teams" element={<FreelancerTeamsPage />} />
        <Route path="tasks" element={<FreelancerTasksPage />} />
        <Route path="contracts" element={<FreelancerContractsPage />} />
        <Route path="earnings" element={<FreelancerEarningsPage />} />
        <Route path="profile" element={<FreelancerProfilePage />} />
        <Route path="policy" element={<PolicyPage />} />
      </Route>

      {/* Hệ thống Route mới cho Thành viên thường (User) sử dụng Layout và nested routes */}
      <Route
        path="/user"
        element={
          <AuthGuard allowedRoles={["USER"]}>
            <UserLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="settings" element={<UserSettingsPage />} />
      </Route>

      {/* Fallback Route: 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
