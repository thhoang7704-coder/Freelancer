import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Modal,
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
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EyeOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  adminPaymentService,
  type AdminPayment,
} from "../service/adminPaymentService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const { Search } = Input;

const paymentStatusMap: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  UNPAID: { color: "default", label: "Chưa thanh toán", icon: <ClockCircleOutlined /> },
  PENDING: { color: "processing", label: "Đang xử lý", icon: <SyncOutlined spin /> },
  PAID: { color: "success", label: "Đã thanh toán", icon: <CheckCircleOutlined /> },
  FAILED: { color: "error", label: "Thất bại", icon: <CloseCircleOutlined /> },
  CANCELLED: { color: "warning", label: "Đã hủy", icon: <CloseCircleOutlined /> },
  REFUNDED: { color: "purple", label: "Đã hoàn tiền", icon: <CreditCardOutlined /> },
};

const gatewayStatusMap: Record<string, { color: string; label: string }> = {
  INITIATED: { color: "processing", label: "Khởi tạo" },
  SUCCESS: { color: "success", label: "Thành công" },
  FAILED: { color: "error", label: "Thất bại" },
  INVALID_SIGNATURE: { color: "volcano", label: "Sai chữ ký" },
  INVALID_AMOUNT: { color: "orange", label: "Sai số tiền" },
  CANCELLED: { color: "warning", label: "Đã hủy" },
};

const formatCurrency = (amount?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);

const formatDate = (dateString?: string | null) =>
  dateString ? new Date(dateString).toLocaleString("vi-VN") : "Không có dữ liệu";

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [detailModal, setDetailModal] = useState<AdminPayment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminPaymentService.getAllPayments();
      setPayments(data);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchPayments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filtered = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return payments;

    return payments.filter((payment) =>
      [
        payment.paymentCode,
        payment.txnRef,
        payment.projectName,
        payment.companyName,
        payment.vnpayTransactionCode,
        payment.bankCode,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [payments, searchText]);

  const paidPayments = payments.filter((payment) => payment.paymentStatus === "PAID");
  const totalRevenue = paidPayments.reduce(
    (sum, payment) => sum + (payment.totalAmount || 0),
    0
  );

  const columns: ColumnsType<AdminPayment> = [
    {
      title: "Giao dịch",
      key: "payment",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<CreditCardOutlined />}
            style={{
              background: "linear-gradient(135deg, #1677ff, #52c41a)",
              color: "#fff",
            }}
          />
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
      dataIndex: "projectName",
      key: "projectName",
      render: (value?: string | null) => (
        <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 220 }}>
          {value || "Không có dữ liệu"}
        </Text>
      ),
    },
    {
      title: "Công ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (value?: string | null) => (
        <Space>
          <BankOutlined style={{ color: "#faad14" }} />
          <Text>{value || "Không có dữ liệu"}</Text>
        </Space>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
      render: (value: number) => (
        <Text style={{ color: "#52c41a", fontWeight: 600 }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => {
        const current = paymentStatusMap[status] || {
          color: "default",
          label: status || "Không xác định",
          icon: <CreditCardOutlined />,
        };

        return (
          <Tag color={current.color} icon={current.icon}>
            {current.label}
          </Tag>
        );
      },
      filters: Object.entries(paymentStatusMap).map(([value, status]) => ({
        text: status.label,
        value,
      })),
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: "Cổng VNPay",
      dataIndex: "gatewayStatus",
      key: "gatewayStatus",
      render: (status?: string | null) => {
        if (!status) return <Tag>Chưa có phản hồi</Tag>;

        const current = gatewayStatusMap[status] || {
          color: "default",
          label: status,
        };

        return <Tag color={current.color}>{current.label}</Tag>;
      },
      filters: Object.entries(gatewayStatusMap).map(([value, status]) => ({
        text: status.label,
        value,
      })),
      onFilter: (value, record) => record.gatewayStatus === value,
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankCode",
      key: "bankCode",
      render: (value?: string | null) => (
        <Tag color={value ? "geekblue" : "default"}>{value || "Chưa có"}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => setDetailModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng giao dịch",
            value: payments.length,
            icon: <CreditCardOutlined />,
            color: "#1677ff",
          },
          {
            title: "Đã thanh toán",
            value: paidPayments.length,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },
          {
            title: "Đang xử lý",
            value: payments.filter((p) => p.paymentStatus === "PENDING").length,
            icon: <ClockCircleOutlined />,
            color: "#faad14",
          },
          {
            title: "Doanh thu đã thanh toán",
            value: totalRevenue / 1_000_000,
            suffix: "tr đ",
            icon: <DollarOutlined />,
            color: "#13c2c2",
            precision: 1,
          },
        ].map((stat, index) => (
          <Col span={6} key={index}>
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
                suffix={stat.suffix}
                precision={stat.precision || 0}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
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
            gap: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Thanh toán
          </Title>

          <Search
            placeholder="Tìm mã giao dịch, dự án, công ty..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 360 }}
            prefix={<SearchOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="paymentId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Chi tiết Thanh toán"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(null)}>
            Đóng
          </Button>,
        ]}
        width={640}
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
            {[
              ["Mã thanh toán", detailModal.paymentCode || "Chưa có"],
              ["Txn ref", detailModal.txnRef || "Chưa có"],
              ["Dự án", detailModal.projectName || "Không có dữ liệu"],
              ["Công ty", detailModal.companyName || "Không có dữ liệu"],
              ["Số tiền", formatCurrency(detailModal.totalAmount)],
              [
                "Trạng thái thanh toán",
                <Tag
                  color={
                    (paymentStatusMap[detailModal.paymentStatus] || paymentStatusMap.UNPAID)
                      .color
                  }
                  icon={
                    (paymentStatusMap[detailModal.paymentStatus] || paymentStatusMap.UNPAID)
                      .icon
                  }
                >
                  {
                    (paymentStatusMap[detailModal.paymentStatus] || paymentStatusMap.UNPAID)
                      .label
                  }
                </Tag>,
              ],
              [
                "Trạng thái VNPay",
                detailModal.gatewayStatus ? (
                  <Tag
                    color={
                      (gatewayStatusMap[detailModal.gatewayStatus] || {
                        color: "default",
                      }).color
                    }
                  >
                    {
                      (gatewayStatusMap[detailModal.gatewayStatus] || {
                        label: detailModal.gatewayStatus,
                      }).label
                    }
                  </Tag>
                ) : (
                  <Tag>Chưa có phản hồi</Tag>
                ),
              ],
              ["Mã giao dịch VNPay", detailModal.vnpayTransactionCode || "Chưa có"],
              ["Response code", detailModal.responseCode || "Chưa có"],
              ["Ngân hàng", detailModal.bankCode || "Chưa có"],
              [
                "Tỷ lệ Admin",
                detailModal.adminPercent != null
                  ? `${detailModal.adminPercent}%`
                  : "Chưa có",
              ],
              [
                "Tỷ lệ Leader",
                detailModal.leaderPercent != null
                  ? `${detailModal.leaderPercent}%`
                  : "Chưa có",
              ],
              ["Ngày tạo", formatDate(detailModal.createdAt)],
            ].map(([label, value], index) => (
              <div key={index} style={{ display: "flex", gap: 8 }}>
                <Text type="secondary" style={{ minWidth: 170 }}>
                  {label}:
                </Text>
                <div style={{ flex: 1 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPaymentsPage;
