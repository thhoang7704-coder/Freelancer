import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Button, Space, Tag, Avatar, Progress, List, Spin } from "antd";
import {
  ProjectOutlined, FileTextOutlined, TeamOutlined, DollarOutlined,
  PlusOutlined, ArrowRightOutlined, ClockCircleOutlined, BankOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

// Services
import { companyProjectService, type CompanyProject, type CompanyTeam, type CompanyPayment } from "../service/companyProjectService";

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  OPEN: "#3b82f6", CLOSED: "#64748b",
  PENDING: "#f59e0b", APPROVED: "#10b981", REJECTED: "#ef4444"
};
const statusBg: Record<string, string> = {
  OPEN: "#eff6ff", CLOSED: "#f1f5f9",
  PENDING: "#fef3c7", APPROVED: "#d1fae5", REJECTED: "#fee2e2"
};
const statusLabels: Record<string, string> = {
  OPEN: "Đang nhận đơn", CLOSED: "Đóng đăng ký",
  PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Bị từ chối",
  TODO: "Chưa bắt đầu", IN_PROGRESS: "Đang làm", DONE: "Hoàn thành"
};

const fmtCompact = (v: number) => {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
};

const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

export const CompanyDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [teams, setTeams] = useState<CompanyTeam[]>([]);
  const [payments, setPayments] = useState<CompanyPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, teamRes, payRes] = await Promise.all([
          companyProjectService.getProjects(),
          companyProjectService.getTeams(),
          companyProjectService.getCompanyPayments()
        ]);
        setProjects(projRes || []);
        setTeams(teamRes || []);
        setPayments(payRes || []);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu company dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KPIs
  const openProjectsCount = projects.filter(p => p.status === "APPROVED" && p.applyStatus === "OPEN").length;
  const activeContractsCount = projects.filter(p => p.progressStatus === "IN_PROGRESS").length;
  
  // Tính tổng số freelancer độc lập
  const uniqueFreelancers = new Set();
  teams.forEach(t => t.members.forEach(m => uniqueFreelancers.add(m.freelancerId)));
  const freelancersCount = uniqueFreelancers.size;

  const totalSpent = payments
    .filter(p => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  // Recent Projects (Top 4)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Recent Freelancers
  const recentFreelancers = teams
    .flatMap(t => t.members.map(m => ({ ...m, projectName: t.project.projectName, projectStatus: t.project.status })))
    .slice(0, 5);

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
          background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
          boxShadow: "0 20px 40px -12px rgba(239, 68, 68, 0.4)",
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
            {user?.full_name} 🏢
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            Quản lý hiệu quả các dự án và tìm kiếm nhân tài tốt nhất cho doanh nghiệp của bạn.
          </Text>
          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/company/projects")}
              style={{
                background: "#fff", color: "#ef4444", border: "none", borderRadius: 12,
                fontWeight: 700, padding: "0 24px", height: 48, boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
              }}
            >
              Đăng dự án mới
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
                <BankOutlined style={{ color: "#fff", fontSize: 20 }} />
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Doanh nghiệp</Text>
              </Space>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                <Text style={{ color: "#fff", fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{projects.length}</Text>
              </div>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 8 }}>Dự án đã đăng</Text>
            </Space>
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -80, left: '20%', width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(30px)" }} />
      </div>

      <Spin spinning={loading}>
        {/* Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {[
            { title: "Dự án đang mở", value: openProjectsCount, icon: <ProjectOutlined />, color: "#3b82f6", bg: "#eff6ff", path: "/company/projects" },
            { title: "Hợp đồng đang chạy", value: activeContractsCount, icon: <FileTextOutlined />, color: "#8b5cf6", bg: "#ede9fe", path: "/company/projects" },
            { title: "Freelancer đang làm việc", value: freelancersCount, icon: <TeamOutlined />, color: "#10b981", bg: "#d1fae5", path: "/company/freelancers" },
            { title: "Tổng chi tiêu", value: fmtCompact(totalSpent), icon: <DollarOutlined />, color: "#f59e0b", bg: "#fef3c7", path: "/company/payments" },
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
          {/* Recent Projects */}
          <Col xs={24} lg={14}>
            <Card 
              bordered={false} 
              style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}
              title={<Title level={5} style={{ margin: 0, color: "#1e293b" }}><Space><ProjectOutlined style={{ color: "#f97316" }}/> Dự án gần đây</Space></Title>}
              extra={<Button type="link" style={{ fontWeight: 600, color: "#f97316" }} icon={<ArrowRightOutlined />} onClick={() => navigate("/company/projects")}>Xem tất cả</Button>}
            >
              <List 
                dataSource={recentProjects} 
                rowKey="projectId"
                locale={{ emptyText: "Chưa có dự án nào" }}
                renderItem={p => (
                  <List.Item style={{ padding: "20px 0", borderBottom: "1px solid #f1f5f9", display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{p.projectName}</Text>
                      <Tag 
                        color={statusBg[p.status]} 
                        style={{ borderRadius: 6, fontWeight: 600, border: "none", color: statusColors[p.status] }}
                      >
                        {statusLabels[p.status] || p.status}
                      </Tag>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <Space>
                        <DollarOutlined style={{ color: "#10b981" }} />
                        <Text style={{ color: "#10b981", fontWeight: 700 }}>Ngân sách: {fmt(p.budget)}</Text>
                      </Space>
                      <Space>
                        <TeamOutlined style={{ color: "#0ea5e9" }} />
                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>{p.appliedCount || 0} ứng viên</Text>
                      </Space>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>TIẾN ĐỘ THỰC HIỆN</Text>
                        <Text style={{ fontSize: 13, fontWeight: 800, color: p.progressStatus === "DONE" ? "#10b981" : "#8b5cf6" }}>
                          {statusLabels[p.progressStatus] || p.progressStatus}
                        </Text>
                      </div>
                      <Progress 
                        percent={p.progressStatus === "DONE" ? 100 : p.progressStatus === "IN_PROGRESS" ? 50 : 0} 
                        size="small" 
                        showInfo={false}
                        strokeColor={p.progressStatus === "DONE" ? "#10b981" : "linear-gradient(90deg, #8b5cf6, #d946ef)"} 
                        trailColor="#e2e8f0"
                      />
                    </div>
                  </List.Item>
                )} 
              />
            </Card>
          </Col>

          {/* Recent Contracts / Freelancers */}
          <Col xs={24} lg={10}>
            <Card 
              bordered={false} 
              style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}
              title={<Title level={5} style={{ margin: 0, color: "#1e293b" }}><Space><TeamOutlined style={{ color: "#8b5cf6" }}/> Freelancer tham gia</Space></Title>}
              extra={<Button type="link" style={{ fontWeight: 600, color: "#8b5cf6" }} icon={<ArrowRightOutlined />} onClick={() => navigate("/company/freelancers")}>Tất cả</Button>}
            >
              <List 
                dataSource={recentFreelancers} 
                rowKey="memberId"
                locale={{ emptyText: "Chưa có freelancer tham gia" }}
                renderItem={m => (
                  <List.Item style={{ padding: "16px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
                      <Avatar 
                        size={48}
                        icon={<UserOutlined />}
                        style={{ 
                          background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                          {m.fullName || m.freelancerName || "Freelancer"}
                        </Text>
                        <div style={{ marginTop: 2 }}>
                          {m.isLeader ? (
                            <Tag color="gold" style={{ border: "none" }}>Leader</Tag>
                          ) : (
                            <Text type="secondary" style={{ fontSize: 12 }}>Member</Text>
                          )}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <Tag style={{ borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569" }}>
                            <ProjectOutlined /> {m.projectName}
                          </Tag>
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

export default CompanyDashboardPage;
