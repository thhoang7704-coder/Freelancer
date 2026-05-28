import React from "react";
import { Layout, Menu, Button, Typography, Card, Space, Result, Badge } from "antd";
import { DashboardOutlined, SolutionOutlined, ProjectOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../../stores/authStore";
import { authService } from "../../auth/services/authService";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={260} theme="dark" style={{ background: "#001529" }}>
        <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #1677ff 0%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", color: "#fff" }}>WF</span>
          <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700, letterSpacing: "1px" }}>WorkFusion</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ padding: "16px 0" }}
          items={[
            { key: "1", icon: <DashboardOutlined />, label: "Biểu đồ tổng quan" },
            { key: "2", icon: <SolutionOutlined />, label: "Quản lý doanh nghiệp" },
            { key: "3", icon: <ProjectOutlined />, label: "Quản lý dự án" },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
          <Space>
            <Badge status="processing" />
            <Text strong style={{ fontSize: "16px" }}>Bảng Quản Trị Hệ Thống</Text>
          </Space>
          <Space size="middle">
            <Text type="secondary"><UserOutlined /> {user?.full_name} ({user?.role})</Text>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
          </Space>
        </Header>
        <Content style={{ margin: "24px", minHeight: 280 }}>
          <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <Result
              status="success"
              title={`Xin chào, Admin ${user?.full_name}!`}
              subTitle="Phiên làm việc của bạn đang hoạt động cực kỳ an toàn và ổn định."
              extra={[
                <div key="info" style={{ marginTop: "16px", color: "#8c8c8c" }}>
                  Tài khoản của bạn có đặc quyền: Duyệt Doanh Nghiệp, Phê Duyệt Dự Án, Phân phối dòng tiền và Xem thống kê toàn hệ thống.
                </div>
              ]}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};
