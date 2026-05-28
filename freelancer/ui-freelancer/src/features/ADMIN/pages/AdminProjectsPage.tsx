import React, { useState, useEffect } from "react";
import {
  Table, Button, Input, Tag, Space, Typography, Card, Statistic,
  Row, Col, Badge, Modal, Tooltip, Avatar, Progress, Spin, message
} from "antd";
import {
  SearchOutlined, CheckOutlined, CloseOutlined, EyeOutlined,
  ProjectOutlined, ClockCircleOutlined, CheckCircleOutlined,
  FireOutlined, DollarOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { adminProjectService, type Project as ApiProject } from "../service/adminProjectService";

const { Title, Text } = Typography;
const { Search } = Input;

interface Project {
  id: string;
  title: string;
  company_name: string;
  budget: number;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
   progressStatus: "TODO" | "IN_PROGRESS" | "COMPLETED";
  created_at: string;
  deadline: string;
  applicants: number;
  accepted: number;
}

const statusMap: Record<string, { color: string; label: string }> = {
  PENDING:  { color: "orange", label: "Chờ duyệt"  },
  APPROVED: { color: "green",  label: "Đã duyệt"   },
  REJECTED: { color: "red",    label: "Từ chối"    },
};
const progressStatusMap: Record<
  string,
  { color: string; label: string }
> = {
  TODO: {
    color: "default",
    label: "Chưa bắt đầu",
  },

  IN_PROGRESS: {
    color: "processing",
    label: "Đang thực hiện",
  },

  COMPLETED: {
    color: "success",
    label: "Hoàn thành",
  },
};
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [detailModal, setDetailModal] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await adminProjectService.getAllProjects();
      const mappedProjects: Project[] = data.map((project) => ({
        id: project.projectId,
        title: project.name,
        company_name: project.company.companyName,
        budget: project.budget,
        description: project.description,
        status: project.status,
        progressStatus: project.progressStatus,
        paymentStatus: project.paymentStatus,
        created_at: project.createdAt,
        deadline: project.deadline,
        applicants: project.appliedCount,
        accepted: project.acceptedCount,
      }));
      setProjects(mappedProjects);
    } catch (error) {
      message.error("Lỗi khi tải danh sách dự án");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(searchText.toLowerCase()) ||
    p.company_name.toLowerCase().includes(searchText.toLowerCase())
  );
const paymentStatusMap: Record<string, { color: string; label: string }> = {
  UNPAID: { color: "default", label: "Chưa thanh toán" },
  PENDING: { color: "processing", label: "Đang xử lý" },
  PAID: { color: "success", label: "Đã thanh toán" },
  FAILED: { color: "error", label: "Thất bại" },
  CANCELLED: { color: "warning", label: "Đã hủy" },
  REFUNDED: { color: "purple", label: "Đã hoàn tiền" },
};
  const columns: ColumnsType<Project> = [
    {
      title: "Dự án",
      key: "project",
      render: (_, record) => (
        <div>
          <Text strong>{record.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.company_name}</Text>
        </div>
      ),
    },
    { title: "Mô tả", dataIndex: "description", key: "description",
      render: (v: string) => <Text ellipsis={{ tooltip: v }} style={{ maxWidth: 200 }}>{v}</Text> },
    { title: "Ngân sách", dataIndex: "budget", key: "budget",
      sorter: (a, b) => a.budget - b.budget,
      render: (v: number) => <Text style={{ color: "#52c41a", fontWeight: 600 }}>{formatCurrency(v)}</Text> },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={statusMap[status].color}>{statusMap[status].label}</Tag>,
      filters: Object.entries(statusMap).map(([v, s]) => ({ text: s.label, value: v })),
      onFilter: (value, record) => record.status === value,
    },
    {
  title: "Thanh toán",
  dataIndex: "paymentStatus",
  key: "paymentStatus",
  render: (status: string) => {
    const current = paymentStatusMap[status] || {
      color: "default",
      label: status || "Không xác định",
    };

    return <Tag color={current.color}>{current.label}</Tag>;
  },
  filters: Object.entries(paymentStatusMap).map(([value, item]) => ({
    text: item.label,
    value,
  })),
  onFilter: (value, record) => record.paymentStatus === value,
},
    {
  title: "Công việc",
  dataIndex: "progressStatus",
  key: "progressStatus",

  render: (status: string) => {
    const current =
      progressStatusMap[status] || {
        color: "default",
        label: status,
      };

    return (
      <Tag color={current.color}>
        {current.label}
      </Tag>
    );
  },

  filters: Object.entries(progressStatusMap).map(
    ([v, s]) => ({
      text: s.label,
      value: v,
    })
  ),

  onFilter: (value, record) =>
    record.progressStatus === value,
},
    { title: "Ứng viên", dataIndex: "applicants", key: "applicants",
      sorter: (a, b) => a.applicants - b.applicants,
      render: (v: number) => <Badge count={v} showZero style={{ backgroundColor: v > 0 ? "#1677ff" : "#d9d9d9" }} /> },
    {
  title: "Hạn chót",
  dataIndex: "deadline",
  key: "deadline",
  width: 120,
  render: (value: string) => (
    <Text style={{ whiteSpace: "nowrap" }}>
      {value}
    </Text>
  ),
},
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => setDetailModal(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: "Tổng dự án", value: projects.length, icon: <ProjectOutlined />, color: "#1677ff" },
          { title: "Chờ duyệt", value: projects.filter(p => p.status === "PENDING").length, icon: <ClockCircleOutlined />, color: "#faad14" },
          { title: "Đã duyệt", value: projects.filter(p => p.status === "APPROVED").length, icon: <CheckCircleOutlined />, color: "#52c41a" },
          { title: "Tổng ngân sách", value: projects.reduce((s, p) => s + p.budget, 0) / 1_000_000, suffix: "tr đ", icon: <DollarOutlined />, color: "#52c41a" },
        ].map((stat, i) => (
          <Col span={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Statistic title={stat.title} value={stat.value} suffix={stat.suffix}
                precision={stat.suffix ? 1 : 0}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Quản lý Dự án</Title>
          <Search placeholder="Tìm dự án, công ty..." allowClear
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 320 }} prefix={<SearchOutlined />} />
        </div>
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10 }} />
        </Spin>
      </Card>

      <Modal title="Chi tiết Dự án" open={!!detailModal}
        onCancel={() => setDetailModal(null)} footer={[
          <Button key="close" onClick={() => setDetailModal(null)}>Đóng</Button>,
        ]} width={560}>
        {detailModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12 }}>
            {[
              ["Tiêu đề", detailModal.title],
              ["Công ty", detailModal.company_name],
              ["Ngân sách", <Text style={{ color: "#52c41a", fontWeight: 600 }}>{formatCurrency(detailModal.budget)}</Text>],
              ["Trạng thái", <Tag color={statusMap[detailModal.status].color}>{statusMap[detailModal.status].label}</Tag>],
              ["Ứng viên đăng ký", detailModal.applicants],
              ["Ứng viên được chấp nhận", detailModal.accepted],
              ["Ngày tạo", formatDate(detailModal.created_at)],
              ["Hạn chót", detailModal.deadline],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <Text type="secondary" style={{ minWidth: 150 }}>{label}:</Text>
                <Text strong>{value}</Text>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminProjectsPage;
