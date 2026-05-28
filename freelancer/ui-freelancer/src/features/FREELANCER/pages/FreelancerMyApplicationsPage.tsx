import React, { useCallback, useEffect, useState } from "react";
import {
  Card, Table, Tag, Typography, Button, Space, Tooltip,
  message, Spin, Empty, Descriptions, Modal, Badge,
} from "antd";
import {
  FileTextOutlined, ReloadOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  DollarOutlined, BankOutlined, CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  freelancerProjectService,
  type ProjectApplicationItemResponse,
} from "../service/freelancerProjectService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text, Paragraph } = Typography;

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const STATUS_CONFIG: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  PENDING: {
    color: "orange",
    label: "Chờ xem xét",
    icon: <ClockCircleOutlined />,
  },
  APPROVED: {
    color: "success",
    label: "Đã chấp nhận",
    icon: <CheckCircleOutlined />,
  },
  REJECTED: {
    color: "error",
    label: "Đã từ chối",
    icon: <CloseCircleOutlined />,
  },
};

export const FreelancerMyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<
    ProjectApplicationItemResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ProjectApplicationItemResponse | null>(
    null
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await freelancerProjectService.getMyApplications();
      setApplications(data.items ?? []);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Summary counts
  const pending = applications.filter((a) => a.status === "PENDING").length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;

  const columns: ColumnsType<ProjectApplicationItemResponse> = [
    {
      title: "Dự án",
      key: "project",
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>
            {r.projectName || "—"}
          </Text>
          {r.company?.companyName && (
            <>
              <br />
              <Space size={4}>
                <BankOutlined style={{ color: "#8c8c8c", fontSize: 11 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {r.company.companyName}
                </Text>
              </Space>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Ngân sách dự án",
      dataIndex: "budget",
      key: "budget",
      render: (v) =>
        v ? (
          <Text type="secondary">{fmt(v)}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Chờ xem xét", value: "PENDING" },
        { text: "Đã chấp nhận", value: "APPROVED" },
        { text: "Đã từ chối", value: "REJECTED" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (v: string) => {
        const cfg = STATUS_CONFIG[v] ?? {
          color: "default",
          label: v,
          icon: null,
        };
        return (
          <Badge
            status={
              v === "APPROVED"
                ? "success"
                : v === "REJECTED"
                ? "error"
                : "processing"
            }
          >
            <Tag color={cfg.color} icon={cfg.icon}>
              {cfg.label}
            </Tag>
          </Badge>
        );
      },
    },
    {
      title: "Ngày ứng tuyển",
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—"),
      sorter: (a, b) =>
        (a.appliedAt ?? "").localeCompare(b.appliedAt ?? ""),
      defaultSortOrder: "descend",
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, r) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#1677ff" }} />}
            onClick={() => setDetail(r)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined
              style={{ marginRight: 8, color: "#1677ff" }}
            />
            Đơn ứng tuyển của tôi
          </Title>
          <Text type="secondary">
            Theo dõi trạng thái tất cả đơn ứng tuyển bạn đã gửi
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={load}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Summary KPI */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "Tổng đơn",
            value: applications.length,
            color: "#1677ff",
            bg: "#e6f4ff",
          },
          {
            label: "Chờ xem xét",
            value: pending,
            color: "#fa8c16",
            bg: "#fff7e6",
          },
          {
            label: "Đã chấp nhận",
            value: approved,
            color: "#52c41a",
            bg: "#f6ffed",
          },
          {
            label: "Đã từ chối",
            value: rejected,
            color: "#ff4d4f",
            bg: "#fff2f0",
          },
        ].map((item) => (
          <Card
            key={item.label}
            bordered={false}
            size="small"
            style={{
              borderRadius: 12,
              background: item.bg,
              minWidth: 130,
              boxShadow: "none",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: item.color,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </div>
              <Text
                style={{ fontSize: 12, color: item.color, opacity: 0.8 }}
              >
                {item.label}
              </Text>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
      >
        <Spin spinning={loading}>
          {applications.length === 0 && !loading ? (
            <Empty
              description="Bạn chưa ứng tuyển dự án nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={applications}
              rowKey="applicationId"
              pagination={{ pageSize: 10, showTotal: (t) => `${t} đơn` }}
              rowClassName={(r) =>
                r.status === "APPROVED" ? "application-row-approved" : ""
              }
            />
          )}
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: "#1677ff" }} />
            Chi tiết đơn ứng tuyển
          </Space>
        }
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetail(null)}>
            Đóng
          </Button>,
        ]}
        width={580}
      >
        {detail && (
          <div>
            {/* Status banner */}
            {(() => {
              const cfg = STATUS_CONFIG[detail.status] ?? {
                color: "default",
                label: detail.status,
              };
              return (
                <div
                  style={{
                    background:
                      detail.status === "APPROVED"
                        ? "#f6ffed"
                        : detail.status === "REJECTED"
                        ? "#fff2f0"
                        : "#fff7e6",
                    borderRadius: 10,
                    padding: "12px 16px",
                    marginBottom: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 15 }}>
                      {detail.projectName}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {detail.company?.companyName}
                    </Text>
                  </div>
                  <Tag
                    color={cfg.color}
                    style={{ fontSize: 13, padding: "4px 10px" }}
                  >
                    {cfg.label}
                  </Tag>
                </div>
              );
            })()}

            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Mã đơn" span={2}>
                <Text code>{detail.applicationId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã dự án" span={2}>
                <Text code>{detail.projectId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngân sách dự án">
                {detail.budget ? fmt(detail.budget) : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày ứng tuyển">
                <Space>
                  <CalendarOutlined />
                  {detail.appliedAt
                    ? new Date(detail.appliedAt).toLocaleString("vi-VN")
                    : "—"}
                </Space>
              </Descriptions.Item>
              {detail.projectStatus && (
                <Descriptions.Item label="Trạng thái dự án" span={2}>
                  <Tag>{detail.projectStatus}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Project Description */}
            <div style={{ marginTop: 20 }}>
              <Text strong>Mô tả dự án:</Text>
              <div
                style={{
                  marginTop: 8,
                  padding: "12px 16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  border: "1px solid #f0f0f0",
                }}
              >
                <Paragraph
                  style={{ whiteSpace: "pre-wrap", marginBottom: 0, color: "#595959" }}
                >
                  {detail.projectDescription || "Không có mô tả"}
                </Paragraph>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FreelancerMyApplicationsPage;
