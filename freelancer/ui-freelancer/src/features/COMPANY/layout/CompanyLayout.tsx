import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown, Alert, Spin } from "antd";
import {
  DashboardOutlined, ProjectOutlined, TeamOutlined, FileTextOutlined,
  LogoutOutlined, UserOutlined, SettingOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, CreditCardOutlined, CheckCircleOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { authService } from "../../auth/services/authService";
import { NotificationBell } from "../../notifications/NotificationBell";
import axiosInstance from "../../../lib/axios";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const allMenuItems = [
  { key: "/company/dashboard",    icon: <DashboardOutlined />, label: "Tổng quan"         },
  { key: "/company/projects",     icon: <ProjectOutlined />,   label: "Dự án của tôi"     },
  { key: "/company/tasks",        icon: <FileTextOutlined />,  label: "Task & Báo cáo"    },
  { key: "/company/project-members", icon: <TeamOutlined />, label: "Thành viên dự án" },
  { key: "/company/freelancer-approvals", icon: <CheckCircleOutlined />, label: "Duyệt freelancer" },
  { key: "/company/freelancers",  icon: <TeamOutlined />,      label: "Team dự án"    },
  { key: "/company/contracts",    icon: <FileTextOutlined />,  label: "Hợp đồng"          },
  { key: "/company/payments",     icon: <CreditCardOutlined />,label: "Thanh toán"        },
  { key: "/company/profile",      icon: <UserOutlined />,      label: "Hồ sơ doanh nghiệp" },
  { key: "/company/policy",       icon: <FileTextOutlined />,  label: "Chính sách" },
];

export const CompanyLayout: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [companyStatus, setCompanyStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await axiosInstance.get("/companies/me");
        setCompanyStatus(response.data.data.status);
      } catch (error) {
        console.error("Lỗi lấy thông tin công ty:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyProfile();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const userMenu = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "Hồ sơ công ty" },
      { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
      { type: "divider" as const },
      { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") handleLogout();
      if (key === "profile") navigate("/company/profile");
    },
  };

  const isPending = companyStatus === "PENDING";
  // Nếu pending thì chỉ hiện Dashboard và Profile
  const menuItems = isPending 
    ? allMenuItems.filter(item => item.key === "/company/dashboard" || item.key === "/company/profile")
    : allMenuItems;

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" tip="Đang tải dữ liệu doanh nghiệp..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible collapsed={collapsed} onCollapse={setCollapsed}
        width={260} trigger={null} theme="light"
        style={{ background: "#fff", borderRight: "1px solid #f0f0f0", boxShadow: "2px 0 8px rgba(0,0,0,0.04)" }}
      >
        <div style={{
          height: 64, display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 24px", gap: 10,
          borderBottom: "1px solid #f0f0f0"
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #faad14, #fa8c16)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: 16, color: "#fff"
          }}>W</div>
          {!collapsed && (
            <Text style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>WorkFusion</Text>
          )}
        </div>
        {!collapsed && (
          <div style={{ padding: "16px 24px 8px" }}>
            <Text style={{ color: "#faad14", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Doanh nghiệp
            </Text>
          </div>
        )}
        <Menu
          mode="inline" selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          style={{ border: "none", padding: "0 8px" }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: "#fff", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 16, width: 40, height: 40 }} />
          <Space size="middle">
            <NotificationBell />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />}
                  style={{ background: "linear-gradient(135deg, #faad14, #fa8c16)" }} />
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong style={{ display: "block" }}>{user?.full_name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>Company</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ background: "#f5f7fb", minHeight: "calc(100vh - 64px)", overflow: "auto", position: "relative" }}>
          {isPending && (
            <div style={{ padding: "16px 24px 0" }}>
              <Alert
                message="Tài khoản đang chờ duyệt"
                description="Tài khoản doanh nghiệp của bạn đang trong quá trình chờ Ban quản trị (Admin) phê duyệt. Bạn không thể thực hiện các thao tác (tạo dự án, tuyển dụng...) cho đến khi quá trình này hoàn tất."
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                style={{ borderRadius: 8, border: "1px solid #ffe58f", background: "#fffbe6" }}
              />
            </div>
          )}
          
          {/* Overlay che các trang không hợp lệ nếu người dùng tự truy cập qua url */}
          {isPending && location.pathname !== "/company/dashboard" && location.pathname !== "/company/profile" ? (
            <div style={{ padding: 24, textAlign: "center", marginTop: 40 }}>
              <WarningOutlined style={{ fontSize: 48, color: "#faad14", marginBottom: 16 }} />
              <Typography.Title level={4}>Tính năng bị khoá</Typography.Title>
              <Typography.Paragraph type="secondary">
                Bạn cần chờ tài khoản được duyệt để truy cập tính năng này.
              </Typography.Paragraph>
            </div>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CompanyLayout;
