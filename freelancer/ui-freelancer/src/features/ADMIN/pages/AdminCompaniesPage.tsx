import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  Badge,
  Modal,
  Tooltip,
  Avatar,
  message,
} from "antd";

import {
  SearchOutlined,
  CloseOutlined,
  EyeOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";

import {
  adminCompanyService,
  type Company,
} from "../service/adminCompanyService";

import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const { Search } = Input;

const statusMap: Record<
  string,
  {
    color: string;
    label: string;
    badge: any;
  }
> = {
  PENDING: {
    color: "orange",
    label: "Chờ duyệt",
    badge: "processing",
  },

  APPROVED: {
    color: "green",
    label: "Đã duyệt",
    badge: "success",
  },

  REJECTED: {
    color: "red",
    label: "Từ chối",
    badge: "error",
  },
};

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [detailModal, setDetailModal] = useState<Company | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const data = await adminCompanyService.getAllCompanies();

      setCompanies(data);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filtered = companies.filter(
    (c) =>
      (c.companyName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (c.expertise || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Company> = [
    {
      title: "Doanh nghiệp",
      key: "company",

      render: (_, record) => (
        <Space>
          <Avatar
            icon={<BankOutlined />}
            style={{
              background: "linear-gradient(135deg, #faad14, #fa8c16)",
              color: "#fff",
            }}
          />

          <div>
            <Text strong>{record.companyName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Mã số thuế",
      dataIndex: "taxCode",
      key: "taxCode",

      render: (v?: string) => (
        <Tag color="geekblue">
          {v || "Chưa cập nhật"}
        </Tag>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "expertise",
      key: "expertise",

      render: (v?: string) => (
        <Tag color="blue">
          {v || "Chưa cập nhật"}
        </Tag>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      render: (status: string) => {
        const currentStatus = statusMap[status] || {
          color: "default",
          label: status || "Không xác định",
          badge: "default",
        };

        return (
          <Badge
            status={currentStatus.badge}
            text={
              <Tag color={currentStatus.color}>
                {currentStatus.label}
              </Tag>
            }
          />
        );
      },

      filters: Object.entries(statusMap).map(([v, s]) => ({
        text: s.label,
        value: v,
      })),

      onFilter: (value, record) => record.status === value,
    },

    {
      title: "Số dự án",
      dataIndex: "totalProjects",
      key: "totalProjects",

      sorter: (a, b) =>
        (a.totalProjects || 0) - (b.totalProjects || 0),

      render: (v?: number) => (
        <Tag color={(v || 0) > 0 ? "purple" : "default"}>
          {v || 0} dự án
        </Tag>
      ),
    },

    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",

      render: (createdAt?: string) =>
        createdAt
          ? new Date(createdAt).toLocaleDateString("vi-VN")
          : "Không có dữ liệu",

      sorter: (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    },

    {
      title: "Hành động",
      key: "actions",
      align: "center",

      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setDetailModal(record)}
            />
          </Tooltip>



          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              ghost
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng doanh nghiệp",
            value: companies.length,
            icon: <BankOutlined />,
            color: "#faad14",
          },

          {
            title: "Chờ duyệt",
            value: companies.filter(
              (c) => c.status === "PENDING"
            ).length,
            icon: <ClockCircleOutlined />,
            color: "#fa8c16",
          },

          {
            title: "Đã duyệt",
            value: companies.filter(
              (c) => c.status === "APPROVED"
            ).length,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },

          {
            title: "Bị từ chối",
            value: companies.filter(
              (c) => c.status === "REJECTED"
            ).length,
            icon: <CloseOutlined />,
            color: "#ff4d4f",
          },
        ].map((stat, i) => (
          <Col span={6} key={i}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={
                  <span style={{ color: stat.color }}>
                    {stat.icon}
                  </span>
                }
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Doanh nghiệp
          </Title>

          <Search
            placeholder="Tìm tên doanh nghiệp..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="companyId"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Doanh nghiệp"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModal(null)}
          >
            Đóng
          </Button>,

          <Button
            key="approve"
            type="primary"
            disabled={detailModal?.status !== "PENDING"}
          >
            Phê duyệt
          </Button>,
        ]}
      >
        {detailModal && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingTop: 12,
            }}
          >
            {(() => {
              const currentStatus =
                statusMap[detailModal.status] || {
                  color: "default",
                  label: "Không xác định",
                  badge: "default",
                };

              return [
                [
                  "Tên doanh nghiệp",
                  detailModal.companyName,
                ],

                [
                  "Ngành nghề",
                  detailModal.expertise ||
                  "Chưa cập nhật",
                ],

                [
                  "Trạng thái",
                  <Tag color={currentStatus.color}>
                    {currentStatus.label}
                  </Tag>,
                ],

                [
                  "Số dự án",
                  detailModal.totalProjects || 0,
                ],

                [
                  "Ngày đăng ký",

                  detailModal.createdAt
                    ? new Date(
                      detailModal.createdAt
                    ).toLocaleDateString("vi-VN")
                    : "Không có dữ liệu",
                ],
              ].map(([label, value], i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ minWidth: 150 }}
                  >
                    {label}:
                  </Text>

                  <div>{value}</div>
                </div>
              ));
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCompaniesPage;