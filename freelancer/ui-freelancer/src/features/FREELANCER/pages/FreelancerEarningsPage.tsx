import React, { useCallback, useEffect, useState } from "react";
import {
  Row, Col, Card, Typography, Table, Tag, Space,
  Button, Modal, Form, Input, InputNumber, message, Tabs, Divider,
} from "antd";
import {
  WalletOutlined, ArrowUpOutlined, HistoryOutlined,
  ArrowDownOutlined, BankOutlined, UserOutlined,
  DollarOutlined, ClockCircleOutlined, CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  walletService,
  type WalletResponse,
  type MyIncomeTransactionResponse,
  type WithdrawHistoryResponse,
} from "../../wallet/walletService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const withdrawStatusColor: Record<string, string> = {
  PENDING: "orange",
  COMPLETED: "success",
  REJECTED: "error",
};
const withdrawStatusLabel: Record<string, string> = {
  PENDING: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  REJECTED: "Từ chối",
};

const incomeColumns: ColumnsType<MyIncomeTransactionResponse> = [
  {
    title: "Mô tả / Dự án",
    key: "description",
    render: (_, r) => (
      <div>
        <Text strong style={{ fontSize: 13 }}>{r.description || r.projectName || "—"}</Text>
        {r.projectName && r.description && (
          <>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{r.projectName}</Text>
          </>
        )}
      </div>
    ),
  },
  {
    title: "Số tiền",
    dataIndex: "amount",
    key: "amount",
    render: (v) => (
      <Text style={{ color: "#52c41a", fontWeight: 600 }}>
        <ArrowUpOutlined /> +{fmt(v)}
      </Text>
    ),
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: "Ngày nhận",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (v) => v ? new Date(v).toLocaleString("vi-VN") : "—",
    sorter: (a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
  },
];

const withdrawColumns: ColumnsType<WithdrawHistoryResponse> = [
  {
    title: "Ngân hàng",
    key: "bank",
    render: (_, r) => (
      <div>
        <Text strong>{r.bankName}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{r.accountNumber}</Text>
      </div>
    ),
  },
  {
    title: "Chủ tài khoản",
    dataIndex: "accountHolderName",
    key: "accountHolderName",
  },
  {
    title: "Số tiền",
    dataIndex: "amount",
    key: "amount",
    render: (v) => (
      <Text style={{ color: "#ff4d4f", fontWeight: 600 }}>-{fmt(v)}</Text>
    ),
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (v: string) => (
      <Tag color={withdrawStatusColor[v] ?? "default"}>
        {withdrawStatusLabel[v] ?? v}
      </Tag>
    ),
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (v) => v ? new Date(v).toLocaleString("vi-VN") : "—",
    sorter: (a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
  },
];

export const FreelancerEarningsPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [incomeHistory, setIncomeHistory] = useState<MyIncomeTransactionResponse[]>([]);
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawHistoryResponse[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadWallet = useCallback(async () => {
    try {
      setWalletLoading(true);
      const data = await walletService.getMyWallet();
      setWallet(data);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const loadIncomeHistory = useCallback(async () => {
    try {
      setIncomeLoading(true);
      const data = await walletService.getIncomeHistory();
      setIncomeHistory(data);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setIncomeLoading(false);
    }
  }, []);

  const loadWithdrawHistory = useCallback(async () => {
    try {
      setWithdrawLoading(true);
      const data = await walletService.getWithdrawHistory();
      setWithdrawHistory(data);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setWithdrawLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
    loadIncomeHistory();
    loadWithdrawHistory();
  }, [loadWallet, loadIncomeHistory, loadWithdrawHistory]);

  const handleWithdraw = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await walletService.withdraw(values);
      message.success("Lệnh rút tiền đã được gửi thành công!");
      setWithdrawModalOpen(false);
      form.resetFields();
      loadWallet();
      loadWithdrawHistory();
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      message.error(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const totalIncome = incomeHistory.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalWithdrawn = withdrawHistory
    .filter((w) => w.status === "COMPLETED")
    .reduce((s, w) => s + (w.amount ?? 0), 0);
  const pendingWithdraw = withdrawHistory
    .filter((w) => w.status === "PENDING")
    .reduce((s, w) => s + (w.amount ?? 0), 0);

  const kpis = [
    { title: "Số dư ví",       value: fmt(wallet?.balance ?? 0),  icon: <WalletOutlined />,       color: "#1677ff", loading: walletLoading },
    { title: "Tổng thu nhập",  value: fmt(totalIncome),           icon: <DollarOutlined />,       color: "#52c41a", loading: incomeLoading },
    { title: "Đã rút",         value: fmt(totalWithdrawn),        icon: <CheckCircleOutlined />,  color: "#722ed1", loading: withdrawLoading },
    { title: "Đang xử lý",    value: fmt(pendingWithdraw),       icon: <ClockCircleOutlined />,  color: "#faad14", loading: withdrawLoading },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <WalletOutlined style={{ marginRight: 8, color: "#11998e" }} />
          Thu nhập của tôi
        </Title>
        <Button
          type="primary"
          icon={<ArrowDownOutlined />}
          size="large"
          style={{
            background: "linear-gradient(135deg, #11998e, #38ef7d)",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            color: "#fff",
          }}
          onClick={() => setWithdrawModalOpen(true)}
        >
          Rút tiền
        </Button>
      </div>

      {/* KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((s, i) => (
          <Col span={6} key={i}>
            <Card
              bordered={false}
              loading={s.loading}
              style={{ borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `${s.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, color: s.color,
                }}>
                  {s.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.title}</Text>
                  <div style={{ fontSize: 17, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* History Tabs */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
      >
        <Tabs
          defaultActiveKey="income"
          items={[
            {
              key: "income",
              label: (
                <Space>
                  <FileTextOutlined />
                  Lịch sử nhận tiền
                  <Tag color="green">{incomeHistory.length}</Tag>
                </Space>
              ),
              children: (
                <Table
                  columns={incomeColumns}
                  dataSource={incomeHistory}
                  rowKey="id"
                  loading={incomeLoading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: "Chưa có lịch sử nhận tiền" }}
                />
              ),
            },
            {
              key: "withdraw",
              label: (
                <Space>
                  <HistoryOutlined />
                  Lịch sử rút tiền
                  <Tag color="orange">{withdrawHistory.length}</Tag>
                </Space>
              ),
              children: (
                <Table
                  columns={withdrawColumns}
                  dataSource={withdrawHistory}
                  rowKey="id"
                  loading={withdrawLoading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: "Chưa có lịch sử rút tiền" }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Withdraw Modal */}
      <Modal
        title={
          <Space>
            <ArrowDownOutlined style={{ color: "#11998e" }} />
            <span>Tạo lệnh rút tiền</span>
          </Space>
        }
        open={withdrawModalOpen}
        onCancel={() => { setWithdrawModalOpen(false); form.resetFields(); }}
        footer={null}
        width={480}
      >
        {wallet && (
          <div style={{
            background: "linear-gradient(135deg, #e6fff8, #f0fff4)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Text type="secondary">Số dư khả dụng</Text>
            <Text strong style={{ fontSize: 18, color: "#11998e" }}>{fmt(wallet.balance)}</Text>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleWithdraw}>
          <Form.Item
            label="Số tiền rút (VND)"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              { type: "number", min: 10000, message: "Tối thiểu 10,000 VND" },
              ...(wallet ? [{
                type: "number" as const,
                max: wallet.balance,
                message: "Số tiền vượt quá số dư ví",
              }] : []),
            ]}
          >
            <InputNumber<number>
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => Number(v?.replace(/,/g, "") ?? 0)}
              min={10000}
              max={wallet?.balance}
              placeholder="Nhập số tiền cần rút"
              size="large"
            />
          </Form.Item>

          <Divider style={{ margin: "12px 0" }} />

          <Form.Item
            label={<Space><BankOutlined />Tên ngân hàng</Space>}
            name="bankName"
            rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}
          >
            <Input placeholder="VD: Vietcombank, Techcombank..." size="large" />
          </Form.Item>
          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
          >
            <Input placeholder="Nhập số tài khoản ngân hàng" size="large" />
          </Form.Item>
          <Form.Item
            label={<Space><UserOutlined />Tên chủ tài khoản</Space>}
            name="accountHolderName"
            rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản" }]}
          >
            <Input
              placeholder="Nhập tên chủ tài khoản (viết hoa)"
              size="large"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Button onClick={() => { setWithdrawModalOpen(false); form.resetFields(); }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{
                background: "linear-gradient(135deg, #11998e, #38ef7d)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
              }}
            >
              Xác nhận rút tiền
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FreelancerEarningsPage;
