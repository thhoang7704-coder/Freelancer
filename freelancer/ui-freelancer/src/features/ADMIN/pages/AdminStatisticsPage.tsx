import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Table, Tag, Progress, Avatar, Button, Spin, message } from "antd";
import {
  TeamOutlined, BankOutlined, ProjectOutlined, DollarOutlined,
  ArrowUpOutlined, SyncOutlined,
  SafetyCertificateOutlined, CrownOutlined, TrophyOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { adminUserService } from "../service/adminUserService";
import { adminCompanyService } from "../service/adminCompanyService";
import { adminProjectService } from "../service/adminProjectService";
import { adminPaymentService, type AdminPayment } from "../service/adminPaymentService";

const { Title, Text } = Typography;

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const fmtCompact = (v: number) => {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return fmt(v);
};

export const AdminStatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedCompanies: 0,
    activeProjects: 0,
    totalRevenue: 0,
  });
  const [recentPayments, setRecentPayments] = useState<AdminPayment[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<{ label: string; value: number; color: string }[]>([]);
  const [projectStatusDist, setProjectStatusDist] = useState<{ label: string; value: number; color: string }[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, companies, projects, payments] = await Promise.all([
        adminUserService.getAllUsers(1, 1000),
        adminCompanyService.getAllCompanies(),
        adminProjectService.getAllProjects(),
        adminPaymentService.getAllPayments(),
      ]);

      // --- KPI ---
      const totalUsers = usersRes.pagination?.total ?? usersRes.items.length;
      const approvedCompanies = companies.filter((c) => c.status === "APPROVED").length;
      const activeProjects = projects.filter((p) => p.status === "APPROVED").length;
      const totalRevenue = payments
        .filter((p) => p.paymentStatus === "PAID")
        .reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);

      setStats({ totalUsers, approvedCompanies, activeProjects, totalRevenue });

      // --- Recent payments (5 mới nhất) ---
      const sorted = [...payments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentPayments(sorted);

      // --- Role Distribution ---
      const roleCounts: Record<string, number> = { USER: 0, FREELANCER: 0, COMPANY: 0, ADMIN: 0 };
      usersRes.items.forEach((u) => {
        if (u.role in roleCounts) roleCounts[u.role]++;
      });
      setRoleDistribution([
        { label: "USER", value: totalUsers ? Math.round((roleCounts.USER / totalUsers) * 100) : 0, color: "#3b82f6" },
        { label: "FREELANCER", value: totalUsers ? Math.round((roleCounts.FREELANCER / totalUsers) * 100) : 0, color: "#8b5cf6" },
        { label: "COMPANY", value: totalUsers ? Math.round((roleCounts.COMPANY / totalUsers) * 100) : 0, color: "#f59e0b" },
        { label: "ADMIN", value: totalUsers ? Math.round((roleCounts.ADMIN / totalUsers) * 100) : 0, color: "#ef4444" },
      ]);

      // --- Project Status ---
      const total = projects.length;
      let open = 0, inProgress = 0, completed = 0, cancelled = 0;
      projects.forEach((p) => {
        if (p.status === "REJECTED") cancelled++;
        else if (p.progressStatus === "COMPLETED") completed++;
        else if (p.progressStatus === "IN_PROGRESS") inProgress++;
        else open++;
      });
      setProjectStatusDist([
        { label: "Đang mở", value: total ? Math.round((open / total) * 100) : 0, color: "#3b82f6" },
        { label: "Đang thực hiện", value: total ? Math.round((inProgress / total) * 100) : 0, color: "#8b5cf6" },
        { label: "Hoàn thành", value: total ? Math.round((completed / total) * 100) : 0, color: "#10b981" },
        { label: "Đã huỷ", value: total ? Math.round((cancelled / total) * 100) : 0, color: "#ef4444" },
      ]);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const txColumns: ColumnsType<AdminPayment> = [
    {
      title: "Mã giao dịch",
      dataIndex: "paymentCode",
      key: "paymentCode",
      render: (v) => <Text strong style={{ color: "#0f172a" }}>{v ?? "N/A"}</Text>,
    },
    {
      title: "Dự án",
      dataIndex: "projectName",
      key: "projectName",
      render: (v) => <Text style={{ color: "#475569", fontWeight: 500 }}>{v ?? "—"}</Text>,
    },
    {
      title: "Công ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (v) => <Text style={{ color: "#475569", fontWeight: 500 }}>{v ?? "—"}</Text>,
    },
    {
      title: "Số tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => <Text style={{ color: "#10b981", fontWeight: 700 }}>{fmt(v ?? 0)}</Text>,
    },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => <Text type="secondary">{new Date(v).toLocaleDateString("vi-VN")}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (v: string) => {
        const isPaid = v === "PAID";
        return (
          <Tag
            color={isPaid ? "#d1fae5" : "#fef3c7"}
            style={{
              color: isPaid ? "#059669" : "#d97706",
              fontWeight: 600,
              border: "none",
              borderRadius: 6,
              padding: "2px 10px",
            }}
          >
            {isPaid ? <><ArrowUpOutlined /> Đã thanh toán</> : <><SyncOutlined /> {v}</>}
          </Tag>
        );
      },
    },
  ];

  const kpiCards = [
    { title: "Tổng người dùng", value: stats.totalUsers, icon: <TeamOutlined />, color: "#3b82f6", bg: "#eff6ff" },
    { title: "Doanh nghiệp đã duyệt", value: stats.approvedCompanies, icon: <BankOutlined />, color: "#f59e0b", bg: "#fef3c7" },
    { title: "Dự án hoạt động", value: stats.activeProjects, icon: <ProjectOutlined />, color: "#8b5cf6", bg: "#ede9fe" },
    { title: "Doanh thu hệ thống", value: fmtCompact(stats.totalRevenue), icon: <DollarOutlined />, color: "#10b981", bg: "#d1fae5" },
  ];

  return (
    <div style={{ padding: "32px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* Banner */}
      <div
        style={{
          borderRadius: 24,
          marginBottom: 32,
          padding: "32px 40px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          boxShadow: "0 20px 40px -12px rgba(30, 27, 75, 0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
            Bảng điều khiển quản trị
          </Text>
          <Title level={2} style={{ color: "#fff", margin: "8px 0 12px", fontWeight: 800, fontSize: 32 }}>
            Tổng quan hệ thống
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
            Theo dõi dòng tiền, hoạt động dự án và quản lý người dùng toàn hệ thống.
          </Text>
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <Button
            type="primary"
            size="large"
            icon={<SyncOutlined />}
            loading={loading}
            onClick={fetchStats}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "none",
              backdropFilter: "blur(10px)",
              fontWeight: 600,
              borderRadius: 12,
            }}
          >
            Làm mới dữ liệu
          </Button>
        </div>

        <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, background: "rgba(99,102,241,0.3)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -80, left: "20%", width: 200, height: 200, background: "rgba(139,92,246,0.2)", borderRadius: "50%", filter: "blur(30px)" }} />
      </div>

      <Spin spinning={loading}>
        {/* KPI Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {kpiCards.map((stat, i) => (
            <Col xs={12} sm={12} lg={6} key={i}>
              <Card bordered={false} style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: "24px" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, color: stat.color, marginBottom: 16,
                }}>
                  {stat.icon}
                </div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{stat.title}</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stat.value}</div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {/* Role Distribution */}
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0, color: "#1e293b" }}><TeamOutlined style={{ color: "#3b82f6", marginRight: 8 }} /> Phân bố vai trò người dùng</Title>}
              bordered={false}
              headStyle={{ borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}
              bodyStyle={{ padding: "24px" }}
              style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)", height: "100%" }}
            >
              {roleDistribution.length === 0 ? (
                <Text type="secondary">Đang tải...</Text>
              ) : (
                roleDistribution.map((item) => (
                  <div key={item.label} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text style={{ fontWeight: 600, color: "#475569" }}>{item.label}</Text>
                      <Text strong style={{ color: "#0f172a" }}>{item.value}%</Text>
                    </div>
                    <Progress percent={item.value} strokeColor={item.color} trailColor="#f1f5f9" showInfo={false} size="small" />
                  </div>
                ))
              )}
            </Card>
          </Col>

          {/* Project Status Distribution */}
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0, color: "#1e293b" }}><SafetyCertificateOutlined style={{ color: "#10b981", marginRight: 8 }} /> Tình trạng dự án</Title>}
              bordered={false}
              headStyle={{ borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}
              bodyStyle={{ padding: "24px" }}
              style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)", height: "100%" }}
            >
              {projectStatusDist.length === 0 ? (
                <Text type="secondary">Đang tải...</Text>
              ) : (
                projectStatusDist.map((item) => (
                  <div key={item.label} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text style={{ fontWeight: 600, color: "#475569" }}>{item.label}</Text>
                      <Text strong style={{ color: "#0f172a" }}>{item.value}%</Text>
                    </div>
                    <Progress percent={item.value} strokeColor={item.color} trailColor="#f1f5f9" showInfo={false} size="small" />
                  </div>
                ))
              )}
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions */}
        <Card
          title={<Title level={5} style={{ margin: 0, color: "#1e293b" }}><DollarOutlined style={{ color: "#10b981", marginRight: 8 }} /> Giao dịch hệ thống gần đây</Title>}
          bordered={false}
          headStyle={{ borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}
          style={{ borderRadius: 20, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.04)" }}
        >
          <Table
            columns={txColumns}
            dataSource={recentPayments}
            rowKey="paymentId"
            pagination={false}
            style={{ padding: "0 24px 24px" }}
            locale={{ emptyText: "Chưa có giao dịch nào" }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default AdminStatisticsPage;
