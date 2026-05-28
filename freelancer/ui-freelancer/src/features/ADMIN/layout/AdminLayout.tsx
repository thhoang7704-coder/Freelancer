import React, { useState } from "react";
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined, TeamOutlined, BankOutlined, ProjectOutlined,
  BarChartOutlined, LogoutOutlined, UserOutlined,
  SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined, CreditCardOutlined, PercentageOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { authService } from "../../auth/services/authService";
import { NotificationBell } from "../../notifications/NotificationBell";
import { WalletBadge } from "../../wallet/WalletBadge";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/admin/dashboard",    icon: <DashboardOutlined />, label: "Tổng quan"         },
  { key: "/admin/users",        icon: <TeamOutlined />,      label: "Quản lý người dùng" },
  { 
    key: "companies-group", 
    icon: <BankOutlined />, 
    label: "Quản lý doanh nghiệp",
    children: [
      { key: "/admin/companies", label: "Danh sách doanh nghiệp" },
      { key: "/admin/companies/approval", label: "Duyệt doanh nghiệp" },
    ]
  },
  { 
    key: "projects-group",
    icon: <ProjectOutlined />, 
    label: "Quản lý dự án",
    children: [
      { key: "/admin/projects", label: "Danh sách dự án" },
      { key: "/admin/projects/pending", label: "Duyệt dự án" },
    ]
  },
  { key: "/admin/statistics",   icon: <BarChartOutlined />,  label: "Thống kê"           },
  { key: "/admin/payment-rules", icon: <PercentageOutlined />, label: "Quy tắc thanh toán" },
  { key: "/admin/payments", icon: <CreditCardOutlined />, label: "Thanh toán" },
];

export const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const userDropdownItems = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
      { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
      { type: "divider" as const },
      { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") handleLogout();
    },
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        trigger={null}
        theme="dark"
        style={{ background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
      >
        {/* Logo */}
        <div style={{
          height: 64, display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 24px", gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s"
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #1677ff, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: 16, color: "#fff"
          }}>W</div>
          {!collapsed && (
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>
              WorkFusion
            </Text>
          )}
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div style={{ padding: "16px 24px 8px" }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Admin Panel
            </Text>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          style={{ background: "transparent", border: "none", padding: "0 8px" }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: "#fff", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <Space>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 40, height: 40 }} />
          </Space>
          <Space size="middle">
            <WalletBadge targetPath="/admin/wallet" />
            <NotificationBell />
            <Dropdown menu={userDropdownItems} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />}
                  style={{ background: "linear-gradient(135deg, #1677ff, #6366f1)" }} />
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong style={{ display: "block" }}>{user?.full_name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>Administrator</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ background: "#f5f7fb", minHeight: "calc(100vh - 64px)", overflow: "auto" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
