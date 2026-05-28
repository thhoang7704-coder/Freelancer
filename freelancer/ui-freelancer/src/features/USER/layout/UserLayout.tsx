import React, { useState } from "react";
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown, Card } from "antd";
import {
  DashboardOutlined, UserOutlined, SettingOutlined, LogoutOutlined,
  BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ArrowUpOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { authService } from "../../auth/services/authService";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/user/dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
  { key: "/user/profile",   icon: <UserOutlined />,      label: "Hồ sơ cá nhân" },
  { key: "/user/settings",  icon: <SettingOutlined />,   label: "Cài đặt tài khoản" },
];

export const UserLayout: React.FC = () => {
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
      if (key === "profile") navigate("/user/profile");
      if (key === "settings") navigate("/user/settings");
    },
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible collapsed={collapsed} onCollapse={setCollapsed}
        width={260} trigger={null} theme="dark"
        style={{ background: "linear-gradient(180deg, #1f1c2c 0%, #928dab 100%)" }}
      >
        <div style={{
          height: 64, display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 24px", gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
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
              Tài khoản khách
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

        {!collapsed && (
          <div style={{ padding: 20, position: "absolute", bottom: 20, width: "100%" }}>
            <Card size="small" bordered={false} style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(5px)",
              borderRadius: 12,
              textAlign: "center"
            }}>
              <Text style={{ color: "#fff", fontSize: 12, display: "block", marginBottom: 10 }}>Trải nghiệm đầy đủ?</Text>
              <Button type="primary" size="small" icon={<ArrowUpOutlined />} 
                onClick={() => navigate("/user/dashboard")}
                style={{ background: "linear-gradient(135deg, #4e54c8, #8f94fb)", border: "none", borderRadius: 8, width: "100%" }}>
                Nâng cấp vai trò
              </Button>
            </Card>
          </div>
        )}
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
            <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />}
                  style={{ background: "linear-gradient(135deg, #4e54c8, #8f94fb)" }} />
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong style={{ display: "block" }}>{user?.full_name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>Thành viên thường</Text>
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

export default UserLayout;
