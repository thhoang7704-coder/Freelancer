import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CreditCardOutlined,
  DollarOutlined,
  HistoryOutlined,
  ProjectOutlined,
  ReloadOutlined,
  SearchOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  companyProjectService,
  type CompanyPayment,
  type CompanyProject,
} from "../service/companyProjectService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const { Search } = Input;

const currency = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Không có";

const paymentStatusMap: Record<string, { color: string; label: string }> = {
  UNPAID: { color: "default", label: "Chưa thanh toán" },
  PENDING: { color: "processing", label: "Đang xử lý" },
  PARTIAL: { color: "gold", label: "Thanh toán một phần" },
  PAID: { color: "green", label: "Đã thanh toán" },
  FAILED: { color: "red", label: "Thất bại" },
  CANCELLED: { color: "default", label: "Đã hủy" },
  REFUNDED: { color: "purple", label: "Đã hoàn tiền" },
};

const progressMap: Record<string, { color: string; label: string }> = {
  TODO: { color: "default", label: "Chưa bắt đầu" },
  IN_PROGRESS: { color: "processing", label: "Đang thực hiện" },
  DONE: { color: "success", label: "Hoàn thành" },
};

export const CompanyPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<CompanyPayment[]>([]);
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [payingProjectId, setPayingProjectId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentData, projectData] = await Promise.all([
        companyProjectService.getCompanyPayments(),
        companyProjectService.getProjects(),
      ]);

      setPayments(paymentData);
      setProjects(projectData);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const unpaidProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.paymentStatus !== "PAID" &&
          project.paymentStatus !== "PENDING" &&
          project.status === "APPROVED"
      ),
    [projects]
  );

  const filteredPayments = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return payments;

    return payments.filter((payment) =>
      [
        payment.paymentCode,
        payment.txnRef,
        payment.projectTitle,
        payment.paymentStatus,
        payment.transaction?.vnpayTransactionCode,
        payment.transaction?.bankCode,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [payments, searchText]);

  const handlePayProject = async (project: CompanyProject) => {
    try {
      setPayingProjectId(project.projectId);
      const response = await companyProjectService.initiateProjectPayment(
        project.projectId
      );

      if (!response.vnpayUrl) {
        message.error("Backend chưa trả về URL thanh toán");
        return;
      }

      window.open(response.vnpayUrl, "_blank", "noopener,noreferrer");
      await loadData();
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setPayingProjectId(null);
    }
  };

  const paidPayments = payments.filter((payment) => payment.paymentStatus === "PAID");
  const totalPaid = paidPayments.reduce(
    (sum, payment) => sum + (payment.totalAmount || 0),
    0
  );
  const pendingPayments = payments.filter(
    (payment) => payment.paymentStatus === "PENDING"
  );

  const paymentColumns: ColumnsType<CompanyPayment> = [
    {
      title: "Thanh toán",
      key: "payment",
      render: (_, record) => (
        <Space>
          <Avatar icon={<WalletOutlined />} style={{ background: "#1677ff" }} />
          <div>
            <Text strong>{record.paymentCode || "Chưa có mã"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.txnRef || record.paymentId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Dự án",
      dataIndex: "projectTitle",
      key: "projectTitle",
      render: (value: string) => (
        <Space>
          <ProjectOutlined style={{ color: "#faad14" }} />
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: currency,
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 160,
      render: (status: string) => (
        <Tag color={paymentStatusMap[status]?.color || "default"}>
          {paymentStatusMap[status]?.label || status}
        </Tag>
      ),
      filters: Object.entries(paymentStatusMap).map(([value, item]) => ({
        text: item.label,
        value,
      })),
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: "VNPay",
      key: "vnpay",
      width: 170,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.transaction?.vnpayTransactionCode || "Chưa có"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.transaction?.bankCode || "Chưa có ngân hàng"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: formatDate,
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
    },
  ];

  const unpaidProjectColumns: ColumnsType<CompanyProject> = [
    {
      title: "Dự án chưa thanh toán",
      key: "project",
      render: (_, record) => (
        <Space>
          <Avatar icon={<ProjectOutlined />} style={{ background: "#faad14" }} />
          <div>
            <Text strong>{record.projectName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Deadline: {formatDate(record.deadline)}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",
      width: 150,
      render: currency,
      sorter: (a, b) => (a.budget || 0) - (b.budget || 0),
    },
    {
      title: "Tiến độ",
      dataIndex: "progressStatus",
      key: "progressStatus",
      width: 150,
      render: (status: string) => (
        <Tag color={progressMap[status]?.color || "default"}>
          {progressMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 170,
      render: (status: string) => (
        <Tag color={paymentStatusMap[status]?.color || "default"}>
          {paymentStatusMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 140,
      render: (_, record) => {
        const canPay = record.progressStatus === "DONE";

        return (
          <Tooltip
            title={canPay ? "Tạo URL VNPay" : "Backend chỉ cho thanh toán dự án đã hoàn thành"}
          >
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              disabled={!canPay}
              loading={payingProjectId === record.projectId}
              onClick={() => handlePayProject(record)}
            >
              Thanh toán
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng thanh toán",
            value: payments.length,
            icon: <HistoryOutlined />,
            color: "#1677ff",
          },
          {
            title: "Đã thanh toán",
            value: paidPayments.length,
            icon: <WalletOutlined />,
            color: "#52c41a",
          },
          {
            title: "Đang xử lý",
            value: pendingPayments.length,
            icon: <CreditCardOutlined />,
            color: "#faad14",
          },
          {
            title: "Tổng đã chi",
            value: currency(totalPaid),
            icon: <DollarOutlined />,
            color: "#722ed1",
          },
        ].map((stat) => (
          <Col xs={24} sm={12} xl={6} key={stat.title}>
            <Card
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color, fontSize: 22 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Dự án chưa thanh toán
            </Title>
            <Text type="secondary">
              Bấm thanh toán để backend tạo URL VNPay và mở trang thanh toán.
            </Text>
          </div>

          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            Tải lại
          </Button>
        </div>

        <Table
          columns={unpaidProjectColumns}
          dataSource={unpaidProjects}
          rowKey="projectId"
          loading={loading}
          pagination={{ pageSize: 6 }}
          scroll={{ x: 900 }}
          locale={{ emptyText: "Không có dự án cần thanh toán" }}
        />
      </Card>

      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Lịch sử thanh toán
          </Title>

          <Search
            placeholder="Tìm mã thanh toán, dự án, VNPay..."
            allowClear
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <Table
          columns={paymentColumns}
          dataSource={filteredPayments}
          rowKey="paymentId"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: "Chưa có thanh toán nào" }}
        />
      </Card>
    </div>
  );
};

export default CompanyPaymentsPage;
