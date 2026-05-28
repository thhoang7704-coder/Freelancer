import React, { useState } from "react";
import {
  Table, Tag, Space, Typography, Card, Statistic, Row, Col,
  Button, Modal, Tooltip, Steps, Divider, Badge, Rate, Form, Input
} from "antd";
import {
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, EyeOutlined, StarOutlined, MessageOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Contract {
  id: string;
  project: string;
  company: string;
  value: number;
  status: "ACTIVE" | "COMPLETED" | "DISPUTED";
  start_date: string;
  end_date: string;
  progress: number;
  milestones: { title: string; status: "finish" | "process" | "wait"; amount: number }[];
}

const mockContracts: Contract[] = [
  {
    id: "CT001", project: "Website TMĐT TechVision", company: "TechVision Corp",
    value: 15000000, status: "ACTIVE", start_date: "2024-05-01", end_date: "2024-07-01", progress: 40,
    milestones: [
      { title: "Thiết kế UI/UX", status: "finish", amount: 3000000 },
      { title: "Phát triển Frontend", status: "process", amount: 7000000 },
      { title: "Testing & Deploy", status: "wait", amount: 5000000 },
    ]
  },
  {
    id: "CT002", project: "Dashboard Analytics", company: "DataFlow Systems",
    value: 12000000, status: "ACTIVE", start_date: "2024-04-15", end_date: "2024-06-20", progress: 85,
    milestones: [
      { title: "Thiết kế schema", status: "finish", amount: 2000000 },
      { title: "Tích hợp API", status: "finish", amount: 6000000 },
      { title: "Báo cáo & Chart", status: "process", amount: 4000000 },
    ]
  },
  {
    id: "CT003", project: "App Quản lý Kho", company: "LogiTech VN",
    value: 22000000, status: "COMPLETED", start_date: "2024-01-10", end_date: "2024-04-10", progress: 100,
    milestones: [
      { title: "Phân tích yêu cầu", status: "finish", amount: 3000000 },
      { title: "Phát triển", status: "finish", amount: 14000000 },
      { title: "Nghiệm thu", status: "finish", amount: 5000000 },
    ]
  },
];

const statusMap: Record<string, { color: string; label: string; badge: any }> = {
  ACTIVE:    { color: "blue",   label: "Đang thực hiện", badge: "processing" },
  COMPLETED: { color: "green",  label: "Hoàn thành",     badge: "success"    },
  DISPUTED:  { color: "orange", label: "Tranh chấp",     badge: "warning"    },
};

const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export const FreelancerContractsPage: React.FC = () => {
  const [detail, setDetail] = useState<Contract | null>(null);
  const [reviewModal, setReviewModal] = useState<Contract | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<Contract> = [
    { title: "Mã HĐ", dataIndex: "id", key: "id",
      render: v => <Text strong style={{ color: "#1677ff" }}>{v}</Text> },
    { title: "Dự án", dataIndex: "project", key: "project", render: v => <Text strong>{v}</Text> },
    { title: "Công ty", dataIndex: "company", key: "company" },
    { title: "Giá trị", dataIndex: "value", key: "value",
      render: v => <Text style={{ color: "#52c41a", fontWeight: 600 }}>{fmt(v)}</Text>,
      sorter: (a, b) => a.value - b.value },
    { title: "Trạng thái", dataIndex: "status", key: "status",
      render: (s: string) => <Badge status={statusMap[s].badge} text={<Tag color={statusMap[s].color}>{statusMap[s].label}</Tag>} /> },
    { title: "Hạn chót", dataIndex: "end_date", key: "end_date" },
    {
      title: "Hành động", key: "actions", align: "center",
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết"><Button icon={<EyeOutlined />} size="small" onClick={() => setDetail(r)} /></Tooltip>
          {r.status === "COMPLETED" && (
            <Tooltip title="Đánh giá">
              <Button icon={<StarOutlined />} size="small" type="primary" ghost onClick={() => setReviewModal(r)} />
            </Tooltip>
          )}
          {r.status === "ACTIVE" && (
            <Tooltip title="Gửi tin nhắn"><Button icon={<MessageOutlined />} size="small" /></Tooltip>
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
              <Statistic title={s.title} value={s.value} suffix={s.suffix}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                valueStyle={{ color: s.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Title level={4} style={{ marginBottom: 16 }}>Hợp đồng của tôi</Title>
        <Table columns={columns} dataSource={mockContracts} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>

      {/* Detail Modal */}
      <Modal title={`Chi tiết - ${detail?.id}`} open={!!detail}
        onCancel={() => setDetail(null)} footer={[<Button key="c" onClick={() => setDetail(null)}>Đóng</Button>]}
        width={580}>
        {detail && (
          <>
            {[["Dự án", detail.project], ["Công ty", detail.company],
              ["Giá trị", fmt(detail.value)], ["Thời gian", `${detail.start_date} → ${detail.end_date}`],
              ["Trạng thái", <Tag color={statusMap[detail.status].color}>{statusMap[detail.status].label}</Tag>],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Text type="secondary" style={{ minWidth: 140 }}>{l}:</Text>
                <Text strong>{v}</Text>
              </div>
            ))}
            <Divider>Các mốc thanh toán</Divider>
            <Steps direction="vertical" size="small"
              current={detail.milestones.findIndex(m => m.status !== "finish")}
              items={detail.milestones.map(m => ({
                title: m.title,
                description: <Text style={{ color: "#52c41a" }}>{fmt(m.amount)}</Text>,
                status: m.status,
              }))} />
          </>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal title="Đánh giá Dự án" open={!!reviewModal}
        onCancel={() => setReviewModal(null)}
        onOk={() => { form.submit(); setReviewModal(null); }}
        okText="Gửi đánh giá" cancelText="Huỷ">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Đánh giá công ty" name="rating" rules={[{ required: true }]}>
            <Rate allowHalf />
          </Form.Item>
          <Form.Item label="Nhận xét" name="comment">
            <TextArea rows={4} placeholder="Chia sẻ trải nghiệm làm việc của bạn..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FreelancerContractsPage;
