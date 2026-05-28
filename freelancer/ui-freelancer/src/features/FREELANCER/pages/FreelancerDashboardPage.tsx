import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Button, Space, Tag, Progress, List, Spin } from "antd";
import {
  ProjectOutlined, FileTextOutlined, WalletOutlined, StarOutlined,
  ArrowRightOutlined, FireOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ThunderboltOutlined, TrophyOutlined, DollarOutlined, BankOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

// Services
import { freelancerProjectService, type ProjectItemResponse } from "../service/freelancerProjectService";
import { freelancerTaskService, type ProjectItem } from "../service/freelancerTaskService";
import { walletService, type WalletResponse } from "../../wallet/walletService";

const { Title, Text } = Typography;

const fmtCompact = (v: number) => {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
};

const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

export const FreelancerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [availableProjects, setAvailableProjects] = useState<ProjectItemResponse[]>([]);
  const [myContracts, setMyContracts] = useState<ProjectItem[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [applications, setApplications] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, joinedRes, incomeRes, appRes] = await Promise.all([
          freelancerProjectService.getProjects({ pageSize: 5, status: "APPROVED" }),
          freelancerTaskService.getJoinedProjects(),
          walletService.getIncomeHistory(),
          freelancerProjectService.getMyApplications()
        ]);
        
        setAvailableProjects(projRes.items || []);
        setMyContracts(joinedRes || []);
        setIncome(incomeRes.reduce((s, i) => s + (i.amount ?? 0), 0));
        setApplications(appRes.pagination?.total ?? (appRes.items?.length || 0));
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedProjects = myContracts.filter(c => c.progressStatus === "DONE").length;
  const activeProjects = myContracts.filter(c => c.progressStatus !== "DONE").length;

  return (
    <div style={{ padding: 32, background: "#f8fafc", minHeight: "100vh" }}>
      {/* Welcome Banner */}
      <div
        style={{
          borderRadius: 24,
          marginBottom: 32,
          padding: "32px 40px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)",
          boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: 500, letterSpacing: 0.5 }}>
            Chào mừng trở lại,
          </Text>
          <Title level={2} style={{ color: "#fff", margin: "8px 0 12px", fontWeight: 800, fontSize: 36 }}>
            {user?.full_name} 💼
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            Hãy cùng kiến tạo những sản phẩm tuyệt vời và nâng tầm sự nghiệp của bạn.
          </Text>
          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={() => navigate("/freelancer/projects")}
              style={{
                background: "#fff", color: "#0ea5e9", border: "none", borderRadius: 12,
                fontWeight: 700, padding: "0 24px", height: 48, boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
              }}
            >
              Khám phá dự án mới
            </Button>
          </div>
        </div>
        
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: 24,
            padding: "20px 32px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}>
            <Space direction="vertical" size={0}>
              <Space>
                <TrophyOutlined style={{ color: "#fbbf24", fontSize: 20 }} />
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Hạng Vàng</Text>
              </Space>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                <Text style={{ color: "#fff", fontSize: 42, fontWeight: 800, lineHeight: 1 }}>4.9</Text>
                <Text style={{ color: "#fbbf24", fontSize: 24 }}>⭐</Text>
              </div>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 8 }}>Đánh giá trung bình</Text>
            </Space>
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -80, left: "20%", width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(30px)" }} />
      </div>

      <Spin spinning={loading}>
        {/* Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {[
            { title: "Dự án hoàn thành", value: completedProjects, icon: <CheckCircleOutlined />, color: "#10b981", bg: "#d1fae5", path: "/freelancer/my-projects" },
            { title: "Đang thực hiện", value: activeProjects, icon: <FireOutlined />, color: "#8b5cf6", bg: "#ede9fe", path: "/freelancer/my-projects" },
            { title: "Tổng thu nhập", value: fmtCompact(income), icon: <WalletOutlined />, color: "#0ea5e9", bg: "#e0f2fe", path: "/freelancer/earnings" },
            { title: "Đơn đã ứng tuyển", value: applications, icon: <StarOutlined />, color: "#f59e0b", bg: "#fef3c7", path: "/freelancer/applications" },
          ].map((s, i) => (
            <Col xs={12} sm={12} lg={6} key={i}>
              <Card
                bordered={false}
                hoverable={!!s.path}
                onClick={() => s.path && navigate(s.path)}
                style={{ 
                  borderRadius: 20, 
                  boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)", 
                  cursor: s.path ? "pointer" : "default",
                  transition: "all 0.3s ease"
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, color: s.color,
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{s.title}</Text>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginTop: 4 }}>{s.value}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]}>
          {/* Available Projects */}
          <Col xs={24} lg={14}>
            <Card 
              bordered={false} 
              style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}
              title={<Title level={5} style={{ margin: 0, color: "#1e293b" }}><Space><ProjectOutlined style={{ color: "#0ea5e9" }}/> Gợi ý dự án phù hợp</Space></Title>}
              extra={<Button type="link" style={{ fontWeight: 600, color: "#0ea5e9" }} icon={<ArrowRightOutlined />} onClick={() => navigate("/freelancer/projects")}>Xem tất cả</Button>}
            >
              <List 
                dataSource={availableProjects}
                rowKey="projectId"
                renderItem={p => (
                  <List.Item 
                    style={{ padding: "20px 0", borderBottom: "1px solid #f1f5f9" }}
                    extra={
                      <Button 
                        type="primary" 
                        shape="round" 
                        onClick={() => navigate("/freelancer/projects", { state: { openProject: p } })}
                        style={{ background: "#f8fafc", color: "#0ea5e9", borderColor: "#bae6fd", fontWeight: 600, boxShadow: "none" }}
                      >
                        Xem dự án
                      </Button>
                    }
                  >
                    <List.Item.Meta
                      title={<Text style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{p.name}</Text>}
                      description={
                        <div style={{ marginTop: 12 }}>
                          <Space wrap style={{ marginBottom: 12 }}>
                            <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 600, border: "none", background: "#e0f2fe", color: "#0369a1" }}>{p.company?.companyName || "Ẩn danh"}</Tag>
                            {p.skillsRequired && <Tag style={{ borderRadius: 6, border: "1px solid #e2e8f0", color: "#64748b" }}>{p.skillsRequired}</Tag>}
                          </Space>
                          <div style={{ display: "flex", gap: 24 }}>
                            <Space>
                              <DollarOutlined style={{ color: "#10b981" }} />
                              <Text style={{ color: "#10b981", fontWeight: 700 }}>{fmt(p.budget)}</Text>
                            </Space>
                            <Space>
                              <ClockCircleOutlined style={{ color: "#94a3b8" }} />
                              <Text type="secondary" style={{ fontSize: 13 }}>Hạn nộp: {p.deadline ? new Date(p.deadline).toLocaleDateString("vi-VN") : "Chưa xác định"}</Text>
                            </Space>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )} 
              />
            </Card>
          </Col>

          {/* My Active Contracts */}
          <Col xs={24} lg={10}>
            <Card 
              bordered={false} 
              style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}
              title={<Title level={5} style={{ margin: 0, color: "#1e293b" }}><Space><FileTextOutlined style={{ color: "#8b5cf6" }}/> Dự án đang tham gia</Space></Title>}
              extra={<Button type="link" style={{ fontWeight: 600, color: "#8b5cf6" }} icon={<ArrowRightOutlined />} onClick={() => navigate("/freelancer/my-projects")}>Tất cả</Button>}
            >
              <List 
                dataSource={myContracts.slice(0, 5)} 
                rowKey="projectId"
                renderItem={c => (
                  <List.Item style={{ padding: "20px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-start" }}>
                        <div>
                          <Text style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{c.name}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}><BankOutlined /> {c.companyName}</Text>
                          </div>
                        </div>
                        <Tag color={c.progressStatus === "DONE" ? "green" : "purple"} style={{ borderRadius: 6, fontWeight: 600, border: "none" }}>{c.progressStatus}</Tag>
                      </div>
                      
                      <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, marginTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <ClockCircleOutlined style={{ color: "#ef4444", fontSize: 12 }} />
                          <Text style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>
                            Hạn chót: {c.deadline ? new Date(c.deadline).toLocaleDateString("vi-VN") : "Chưa xác định"}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )} 
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default FreelancerDashboardPage;
