import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  PercentageOutlined,
  ReloadOutlined,
  SaveOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  adminPaymentRuleService,
  type CreatePaymentRuleRequest,
  type PaymentRule,
} from "../service/adminPaymentRuleService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;

const percentColors = {
  admin: "#1677ff",
  leader: "#faad14",
  freelancer: "#52c41a",
};

export const AdminPaymentRulesPage: React.FC = () => {
  const [form] = Form.useForm<CreatePaymentRuleRequest>();
  const [activeRule, setActiveRule] = useState<PaymentRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const values = Form.useWatch([], form);

  const currentTotal = useMemo(() => {
    const adminPercent = Number(values?.adminPercent || 0);
    const leaderPercent = Number(values?.leaderPercent || 0);
    const freelancerPercent = Number(values?.freelancerPercent || 0);

    return adminPercent + leaderPercent + freelancerPercent;
  }, [values]);

  const loadActiveRule = useCallback(async () => {
    try {
      setLoading(true);
      const rule = await adminPaymentRuleService.getActiveRule();
      setActiveRule(rule);
      form.setFieldsValue({
        adminPercent: rule.adminPercent,
        leaderPercent: rule.leaderPercent,
        freelancerPercent: rule.freelancerPercent,
      });
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadActiveRule();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadActiveRule]);

  const handleSubmit = async (payload: CreatePaymentRuleRequest) => {
    const total =
      Number(payload.adminPercent || 0) +
      Number(payload.leaderPercent || 0) +
      Number(payload.freelancerPercent || 0);

    if (total !== 100) {
      message.error("Tổng tỷ lệ phải bằng 100%");
      return;
    }

    try {
      setSaving(true);
      const rule = await adminPaymentRuleService.createRule(payload);
      setActiveRule(rule);
      form.setFieldsValue({
        adminPercent: rule.adminPercent,
        leaderPercent: rule.leaderPercent,
        freelancerPercent: rule.freelancerPercent,
      });
      message.success("Cập nhật quy tắc thanh toán thành công");
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const totalStatus = currentTotal === 100 ? "success" : "exception";

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Phí Admin",
            value: activeRule?.adminPercent ?? 0,
            suffix: "%",
            icon: <UserOutlined />,
            color: percentColors.admin,
          },
          {
            title: "Thưởng Leader",
            value: activeRule?.leaderPercent ?? 0,
            suffix: "%",
            icon: <TrophyOutlined />,
            color: percentColors.leader,
          },
          {
            title: "Pool Freelancer",
            value: activeRule?.freelancerPercent ?? 0,
            suffix: "%",
            icon: <TeamOutlined />,
            color: percentColors.freelancer,
          },
          {
            title: "Trạng thái",
            value: activeRule?.active ? "ACTIVE" : "N/A",
            icon: <CheckCircleOutlined />,
            color: activeRule?.active ? "#52c41a" : "#8c8c8c",
          },
        ].map((stat, index) => (
          <Col span={6} key={index}>
            <Card
              loading={loading}
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
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={15}>
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
                marginBottom: 20,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Quy tắc Thanh toán
              </Title>

              <Button
                icon={<ReloadOutlined />}
                onClick={loadActiveRule}
                loading={loading}
              >
                Tải lại
              </Button>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                adminPercent: 20,
                leaderPercent: 10,
                freelancerPercent: 70,
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Phí Admin"
                    name="adminPercent"
                    rules={[{ required: true, message: "Nhập tỷ lệ Admin" }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={2}
                      addonAfter="%"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Thưởng Leader"
                    name="leaderPercent"
                    rules={[{ required: true, message: "Nhập tỷ lệ Leader" }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={2}
                      addonAfter="%"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Pool Freelancer"
                    name="freelancerPercent"
                    rules={[{ required: true, message: "Nhập tỷ lệ Freelancer" }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={2}
                      addonAfter="%"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Tổng tỷ lệ</Text>
                  <Tag color={currentTotal === 100 ? "success" : "error"}>
                    {currentTotal}%
                  </Tag>
                </div>

                <Progress
                  percent={Math.min(currentTotal, 100)}
                  status={totalStatus}
                  strokeColor={currentTotal === 100 ? "#52c41a" : "#ff4d4f"}
                />
              </div>

              {currentTotal !== 100 && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 20 }}
                  message="Tổng adminPercent + leaderPercent + freelancerPercent phải bằng đúng 100%."
                />
              )}

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  disabled={currentTotal !== 100}
                >
                  Lưu quy tắc mới
                </Button>

                <Button
                  onClick={() => {
                    form.setFieldsValue({
                      adminPercent: 20,
                      leaderPercent: 10,
                      freelancerPercent: 70,
                    });
                  }}
                >
                  Mặc định 20/10/70
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col span={9}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Title level={5} style={{ marginTop: 0 }}>
              Rule đang active
            </Title>

            {activeRule ? (
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div>
                  <Text type="secondary">Rule ID</Text>
                  <br />
                  <Text copyable>{activeRule.id}</Text>
                </div>

                <Progress
                  percent={100}
                  success={{ percent: activeRule.adminPercent }}
                  strokeColor={percentColors.freelancer}
                  showInfo={false}
                />

                <Space wrap>
                  <Tag color="blue">
                    Admin {activeRule.adminPercent}%
                  </Tag>
                  <Tag color="gold">
                    Leader {activeRule.leaderPercent}%
                  </Tag>
                  <Tag color="green">
                    Freelancer {activeRule.freelancerPercent}%
                  </Tag>
                </Space>

                <Alert
                  type="info"
                  showIcon
                  message="Khi tạo rule mới, backend sẽ tự tắt rule cũ và active rule vừa tạo."
                />
              </Space>
            ) : (
              <Alert
                type="warning"
                showIcon
                message="Chưa tải được rule active."
              />
            )}
          </Card>

          <Card
            bordered={false}
            style={{
              marginTop: 16,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Statistic
              title="Tổng cấu hình hiện tại"
              value={currentTotal}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{
                color: currentTotal === 100 ? "#52c41a" : "#ff4d4f",
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPaymentRulesPage;
