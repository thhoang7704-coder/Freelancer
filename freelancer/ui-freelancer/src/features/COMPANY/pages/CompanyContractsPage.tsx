import React, { useState } from "react";
import {
  Table, Tag, Space, Typography, Card, Statistic, Row, Col,
  Button, Modal, Tooltip, Steps, Divider, Badge
} from "antd";
import {
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, EyeOutlined, DownloadOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface Contract {
  id: string;
  project: string;
  freelancer: string;
  value: number;
  status: "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  start_date: string;
  end_date: string;
  progress: number;
  milestones: { title: string; status: "finish" | "process" | "wait" | "error"; amount: number }[];
}

const mockContracts: Contract[] = [
  {
    id: "CT001", project: "Website thương mại điện tử", freelancer: "Nguyễn Văn A",
    value: 15000000, status: "ACTIVE", start_date: "2024-05-01", end_date: "2024-07-01", progress: 40,
    milestones: [
      { title: "Thiết kế UI", status: "finish", amount: 3000000 },
      { title: "Backend API", status: "process", amount: 6000000 },
      { title: "Testing & Deploy", status: "wait", amount: 6000000 },
    ]
  },
  {
    id: "CT002", project: "App quản lý nhân sự", freelancer: "Lê Văn C",
    value: 25000000, status: "COMPLETED", start_date: "2024-02-01", end_date: "2024-04-30", progress: 100,
    milestones: [
      { title: "Phân tích yêu cầu", status: "finish", amount: 5000000 },
      { title: "Phát triển", status: "finish", amount: 15000000 },
      { title: "Nghiệm thu", status: "finish", amount: 5000000 },
    ]
  },
  {
    id: "CT003", project: "Chiến dịch Marketing", freelancer: "Vũ Thị F",
    value: 8000000, status: "DISPUTED", start_date: "2024-04-01", end_date: "2024-05-31", progress: 70,
    milestones: [
      { title: "Lên kế hoạch", status: "finish", amount: 2000000 },
      { title: "Thực thi", status: "error", amount: 4000000 },
      { title: "Báo cáo", status: "wait", amount: 2000000 },
    ]
  },
];

const statusMap: Record<string, { color: string; label: string; badge: any }> = {
  ACTIVE:    { color: "blue",    label: "Đang thực hiện", badge: "processing" },
  COMPLETED: { color: "green",   label: "Hoàn thành",     badge: "success"   },
  DISPUTED:  { color: "orange",  label: "Tranh chấp",     badge: "warning"   },
  CANCELLED: { color: "default", label: "Đã huỷ",         badge: "default"   },
};

const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export const CompanyContractsPage: React.FC = () => {
  const [detail, setDetail] = useState<Contract | null>(null);

  const columns: ColumnsType<Contract> = [
    { title: "Mã HĐ", dataIndex: "id", key: "id",
      render: v => <Text strong style={{ color: "#1677ff" }}>{v}</Text> },
    { title: "Dự án", dataIndex: "project", key: "project", render: v => <Text strong>{v}</Text> },
    { title: "Freelancer", dataIndex: "freelancer", key: "freelancer" },
    { title: "Giá trị", dataIndex: "value", key: "value",
      render: v => <Text style={{ color: "#52c41a", fontWeight: 600 }}>{fmt(v)}</Text>,
      sorter: (a, b) => a.value - b.value },
    { title: "Trạng thái", dataIndex: "status", key: "status",
      render: (s: string) => <Badge status={statusMap[s].badge} text={<Tag color={statusMap[s].color}>{statusMap[s].label}</Tag>} /> },
    { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
    { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
    {
      title: "Hành động", key: "actions", align: "center",
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết"><Button icon={<EyeOutlined />} size="small" onClick={() => setDetail(r)} /></Tooltip>
          <Tooltip title="Tải hợp đồng"><Button icon={<DownloadOutlined />} size="small" /></Tooltip>
          {r.status === "DISPUTED" && (
            <Tooltip title="Yêu cầu hoà giải">
              <Button icon={<ExclamationCircleOutlined />} size="small" danger />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: "Tổng hợp đồng", value: mockContracts.length, icon: <FileTextOutlined />, color: "#1677ff" },
          { title: "Đang thực hiện", value: mockContracts.filter(c => c.status === "ACTIVE").length, icon: <ClockCircleOutlined />, color: "#722ed1" },
          { title: "Hoàn thành", value: mockContracts.filter(c => c.status === "COMPLETED").length, icon: <CheckCircleOutlined />, color: "#52c41a" },
          { title: "Tổng giá trị", value: mockContracts.reduce((s, c) => s + c.value, 0) / 1_000_000, suffix: "tr đ", icon: <DollarOutlined />, color: "#faad14" },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Statistic title={s.title} value={s.value} suffix={s.suffix} precision={s.suffix ? 0 : 0}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                valueStyle={{ color: s.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Title level={4} style={{ marginBottom: 16 }}>Danh sách Hợp đồng</Title>
        <Table columns={columns} dataSource={mockContracts} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>

      <Modal title={`Chi tiết Hợp đồng - ${detail?.id}`} open={!!detail}
        onCancel={() => setDetail(null)} footer={[
          <Button key="close" onClick={() => setDetail(null)}>Đóng</Button>,
          <Button key="download" icon={<DownloadOutlined />}>Tải hợp đồng</Button>,
        ]} width={600}>
        {detail && (
          <>
            {[
              ["Dự án", detail.project], ["Freelancer", detail.freelancer],
              ["Giá trị hợp đồng", fmt(detail.value)],
              ["Trạng thái", <Tag color={statusMap[detail.status].color}>{statusMap[detail.status].label}</Tag>],
              ["Thời gian", `${detail.start_date} → ${detail.end_date}`],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Text type="secondary" style={{ minWidth: 160 }}>{label}:</Text>
                <Text strong>{value}</Text>
              </div>
            ))}
            <Divider>Các mốc thanh toán</Divider>
            <Steps direction="vertical" size="small" current={
              detail.milestones.findIndex(m => m.status !== "finish")
            } items={detail.milestones.map(m => ({
              title: m.title,
              description: <Text style={{ color: "#52c41a" }}>{fmt(m.amount)}</Text>,
              status: m.status,
            }))} />
          </>
        )}
      </Modal>
    </div>
  );
};

export default CompanyContractsPage;
