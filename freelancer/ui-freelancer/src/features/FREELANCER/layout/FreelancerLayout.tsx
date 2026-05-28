import React, { useState } from "react";
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined, SearchOutlined, FileTextOutlined, WalletOutlined,
  UserOutlined, LogoutOutlined, SettingOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, CheckSquareOutlined, ProjectOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { authService } from "../../auth/services/authService";
import { NotificationBell } from "../../notifications/NotificationBell";
import { WalletBadge } from "../../wallet/WalletBadge";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/freelancer/dashboard",  icon: <DashboardOutlined />, label: "Tổng quan"       },
  { key: "/freelancer/projects",   icon: <SearchOutlined />,    label: "Tìm dự án"        },
  { key: "/freelancer/my-applications", icon: <FileTextOutlined />, label: "Đơn ứng tuyển" },
  { key: "/freelancer/my-projects",   icon: <ProjectOutlined />,   label: "Dự án của tôi" },
  { key: "/freelancer/teams",      icon: <TeamOutlined />,      label: "Team của tôi"     },
  { key: "/freelancer/tasks",      icon: <CheckSquareOutlined />, label: "Công việc (Tasks)" },
  { key: "/freelancer/contracts",  icon: <FileTextOutlined />,  label: "Hợp đồng của tôi" },
  { key: "/freelancer/earnings",   icon: <WalletOutlined />,    label: "Thu nhập"          },
  { key: "/freelancer/profile",    icon: <UserOutlined />,      label: "Hồ sơ cá nhân"    },
];

export const FreelancerLayout: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const userMenu = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
      { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
      { type: "divider" as const },
      { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") handleLogout();
      if (key === "profile") navigate("/freelancer/profile");
    },
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible collapsed={collapsed} onCollapse={setCollapsed}
        width={260} trigger={null} theme="dark"
        style={{ background: "linear-gradient(180deg, #1a0533 0%, #2d1b69 50%, #11998e 100%)" }}
      >
        <div style={{
          height: 64, display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 24px", gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #11998e, #38ef7d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: 16, color: "#fff"
          }}>W</div>
          {!collapsed && (
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>WorkFusion</Text>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: "16px 24px 8px" }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Freelancer
            </Text>
          </div>
        )}

        <Menu
          theme="dark" mode="inline"
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
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 16, width: 40, height: 40 }} />
          <Space size="middle">
            <WalletBadge targetPath="/freelancer/earnings" />
            <NotificationBell />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />}
                  style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)" }} />
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong style={{ display: "block" }}>{user?.full_name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>Freelancer</Text>
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

export default FreelancerLayout;
