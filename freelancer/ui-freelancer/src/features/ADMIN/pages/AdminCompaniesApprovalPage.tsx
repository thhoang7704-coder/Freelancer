import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Avatar,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Popconfirm,
  Modal,
  Tooltip,
  Badge,
} from "antd";
import {

  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  BankOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  adminCompanyService,
  type PendingCompany,
} from "../service/adminCompanyService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const { Search } = Input;

const statusColorMap: Record<string, string> = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "red",
};

export const AdminCompaniesApprovalPage: React.FC = () => {
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<PendingCompany | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);

      const response = await adminCompanyService.getPendingCompanies(1, 20);

      if (!response || !response.items) {
        setCompanies([]);
        message.error("Dữ liệu tải về không hợp lệ");
        return;
      }

      setCompanies(response.items || []);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const filtered = companies.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      (company.taxCode || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetail = (company: PendingCompany) => {
    setSelectedCompany(company);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (
    company: PendingCompany,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      const companyId = company.id || company.companyId;

      if (!companyId) {
        message.error("Không tìm thấy ID doanh nghiệp");
        return;
      }

      await adminCompanyService.updateCompanyStatus(companyId, { status });

      message.success(
        `${status === "APPROVED" ? "Duyệt" : "Từ chối"} doanh nghiệp thành công`
      );

      fetchPendingCompanies();
    } catch (err) {
      message.error(parseApiError(err));
    }
  };

  // ================= TABLE COLUMNS =================
  const columns: ColumnsType<PendingCompany> = [
    {
      title: "Doanh nghiệp",
      key: "company",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<BankOutlined />}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          />
          <div>
            <Text strong>{record.companyName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.companyField}
            </Text>
          </div>
        </Space>
      ),
    },

    // ✅ THÊM MÃ SỐ THUẾ
    {
      title: "Mã số thuế",
      dataIndex: "taxCode",
      key: "taxCode",
      render: (v?: string) => <Tag color="geekblue">{v || "Chưa có"}</Tag>,
    },

    {
      title: "Số điện thoại",
      dataIndex: "representativePhone",
      key: "representativePhone",
      render: (phone: string) => (
        <Space size="small">
          <PhoneOutlined style={{ color: "#1677ff" }} />
          <Text copyable>{phone}</Text>
        </Space>
      ),
    },

    // ✅ ĐỔI THÀNH NGÀY ĐĂNG KÝ (createdAt)
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Space size="small">
          <CalendarOutlined style={{ color: "#1677ff" }} />
          <Text>
            {date ? new Date(date).toLocaleDateString("vi-VN") : "Không có dữ liệu"}
          </Text>
        </Space>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={
            status === "PENDING"
              ? "processing"
              : status === "APPROVED"
                ? "success"
                : "error"
          }
          text={<Tag color={statusColorMap[status]}>{status}</Tag>}
        />
      ),
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
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Duyệt doanh nghiệp"
            onConfirm={() => handleUpdateStatus(record, "APPROVED")}
          >
            <Button icon={<CheckOutlined />} size="small" type="primary" />
          </Popconfirm>

          <Popconfirm
            title="Từ chối doanh nghiệp"
            onConfirm={() => handleUpdateStatus(record, "REJECTED")}
          >
            <Button icon={<CloseOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ================= UI =================
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Chờ duyệt",
            value: companies.filter((c) => c.status === "PENDING").length,
            icon: <ClockCircleOutlined />,
            color: "#faad14",
          },
          {
            title: "Đã duyệt",
            value: companies.filter((c) => c.status === "APPROVED").length,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },
          {
            title: "Từ chối",
            value: companies.filter((c) => c.status === "REJECTED").length,
            icon: <CloseCircleOutlined />,
            color: "#ff4d4f",
          },
        ].map((stat, i) => (
          <Col span={8} key={i}>
            <Card bordered={false}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={4}>Danh sách doanh nghiệp</Title>

          <Search
            placeholder="Tìm kiếm..."
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey={(r) => r.id ?? r.companyId ?? ""}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* ================= MODAL ================= */}
      <Modal
        title="Chi tiết doanh nghiệp"
        open={detailOpen}
        footer={null}
        onCancel={() => setDetailOpen(false)}
      >
        {selectedCompany && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Text strong>{selectedCompany.companyName}</Text>

            <div>
              <Text type="secondary">Mã số thuế</Text>
              <br />
              <Text>{selectedCompany.taxCode || "Chưa có"}</Text>
            </div>

            <div>
              <Text type="secondary">Số điện thoại</Text>
              <br />
              <Text>{selectedCompany.contactPhone}</Text>
            </div>

            <div>
              <Text type="secondary">Ngày đăng ký</Text>
              <br />
              <Text>
                {selectedCompany.createdAt
                  ? new Date(selectedCompany.createdAt).toLocaleDateString("vi-VN")
                  : "Không có dữ liệu"}
              </Text>
            </div>

            <div>
              <Text type="secondary">Trạng thái</Text>
              <br />
              <Tag color={statusColorMap[selectedCompany.status]}>
                {selectedCompany.status}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCompaniesApprovalPage;