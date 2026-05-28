import React from "react";
import { Layout, Menu, Button, Typography, Card, Space, Result, Badge } from "antd";
import { DashboardOutlined, FolderOpenOutlined, PlusCircleOutlined, TeamOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../../stores/authStore";
import { authService } from "../../auth/services/authService";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const CompanyDashboard: React.FC = () => {
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
            { key: "1", icon: <DashboardOutlined />, label: "Thống kê dự án" },
            { key: "2", icon: <FolderOpenOutlined />, label: "Dự án của tôi" },
            { key: "3", icon: <PlusCircleOutlined />, label: "Tạo dự án mới" },
            { key: "4", icon: <TeamOutlined />, label: "Quản lý Đội ngũ (Team)" },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
          <Space>
            <Badge status="processing" color="blue" />
            <Text strong style={{ fontSize: "16px" }}>Bảng Điều Khiển Doanh Nghiệp</Text>
          </Space>
          <Space size="middle">
            <Text type="secondary"><UserOutlined /> {user?.full_name} ({user?.role})</Text>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
          </Space>
        </Header>
        <Content style={{ margin: "24px", minHeight: 280 }}>
          <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <Result
              status="info"
              title={`Chào mừng doanh nghiệp, ${user?.full_name}!`}
              subTitle="Giao diện quản lý dự án tuyển dụng và quản lý dòng tiền của bạn đã sẵn sàng."
              extra={[
                <div key="info" style={{ marginTop: "16px", color: "#8c8c8c" }}>
                  Tại đây bạn có thể tạo dự án, duyệt hồ sơ ứng tuyển của Freelancer, thiết lập Team, bổ nhiệm Leader và thanh toán nạp tiền VNPay an toàn.
                </div>
              ]}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};
