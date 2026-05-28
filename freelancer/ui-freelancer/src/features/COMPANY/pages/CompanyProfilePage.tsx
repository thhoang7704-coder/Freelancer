import React, { useState } from "react";
import {
  Card, Row, Col, Form, Input, Button, Avatar, Typography,
  Divider, Tag, Upload, Space, Select, message
} from "antd";
import {
  UserOutlined, EditOutlined, SaveOutlined, CameraOutlined,
  GlobalOutlined, PhoneOutlined, MailOutlined, BankOutlined, EnvironmentOutlined
} from "@ant-design/icons";
import { useAuthStore } from "../../../stores/authStore";
import { companyProfileService, type CompanyDetailResponse } from "../service/companyProfileService";

const { Title, Text } = Typography;
const { TextArea } = Input;

const industries = ["Công nghệ", "Thiết kế", "Marketing", "Xây dựng", "Tài chính", "Giáo dục", "Y tế", "Khác"];

export const CompanyProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CompanyDetailResponse | null>(null);
  const [form] = Form.useForm();

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await companyProfileService.getMyProfile();
      setProfile(res.data);
      form.setFieldsValue({
        company_name: res.data.companyName,
        email: user?.email,
        phone: res.data.representativePhone,
        website: "https://company.vn", // Note: Backend doesn't have website
        address: res.data.address,
        industry: res.data.expertise,
        tax_code: res.data.taxCode,
        representativeName: res.data.representativeName,
        description: "Chúng tôi là công ty công nghệ hàng đầu tại Việt Nam...",
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      setLoading(true);
      try {
        await companyProfileService.updateMyProfile({
          companyName: values.company_name,
          address: values.address,
          representativeName: values.representativeName || "",
          representativePhone: values.phone,
          expertise: values.industry
        });
        message.success("Đã cập nhật hồ sơ doanh nghiệp!");
        setEditing(false);
        fetchProfile();
      } catch (error) {
        message.error("Lỗi khi cập nhật hồ sơ");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Title level={4} style={{ marginBottom: 24 }}>🏢 Hồ sơ Doanh nghiệp</Title>

      {/* Cover & Avatar */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20, overflow: "hidden" }}>
        <div style={{
          height: 140, background: "linear-gradient(135deg, #faad14 0%, #fa541c 100%)",
          margin: "-24px -24px 0", borderRadius: "16px 16px 0 0"
        }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -40, marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <Avatar size={100} icon={<BankOutlined />}
              style={{ border: "4px solid #fff", background: "linear-gradient(135deg, #faad14, #fa541c)", fontSize: 36 }} />
            {editing && (
              <Button shape="circle" icon={<CameraOutlined />} size="small"
                style={{ position: "absolute", bottom: 0, right: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            )}
          </div>
          <div style={{ paddingBottom: 4, flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>{user?.full_name}</Title>
            <Space>
              <Tag color="gold">COMPANY</Tag>
              <Tag color="green">Đã xác minh</Tag>
            </Space>
          </div>
          <Button type={editing ? "default" : "primary"}
            icon={editing ? <SaveOutlined /> : <EditOutlined />}
            onClick={editing ? handleSave : () => setEditing(true)}>
            {editing ? "Lưu thay đổi" : "Chỉnh sửa"}
          </Button>
        </div>
      </Card>

      <Row gutter={20}>
        {/* Left - Main Info */}
        <Col span={16}>
          <Card title="Thông tin doanh nghiệp" bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="company_name" label="Tên doanh nghiệp" rules={[{ required: true }]}>
                    <Input prefix={<BankOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tax_code" label="Mã số thuế">
                    <Input prefix={<BankOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email liên hệ" rules={[{ required: true, type: "email" }]}>
                    <Input prefix={<MailOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Số điện thoại">
                    <Input prefix={<PhoneOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="industry" label="Ngành nghề">
                    <Select disabled={!editing} options={industries.map(i => ({ label: i, value: i }))} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="website" label="Website">
                    <Input prefix={<GlobalOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="address" label="Địa chỉ">
                    <Input prefix={<EnvironmentOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="description" label="Mô tả doanh nghiệp">
                    <TextArea rows={4} disabled={!editing} placeholder="Giới thiệu về công ty..." />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Right - Stats */}
        <Col span={8}>
          <Card title="Thống kê" bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            {[
              { label: "Dự án đã đăng", value: "16", color: "#1677ff" },
              { label: "Dự án hoàn thành", value: "11", color: "#52c41a" },
              { label: "Freelancer đã hợp tác", value: "24", color: "#722ed1" },
              { label: "Tổng chi tiêu", value: "450 tr đ", color: "#faad14" },
              { label: "Đánh giá trung bình", value: "4.8 ⭐", color: "#fa8c16" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 4 ? "1px solid #f0f0f0" : "none" }}>
                <Text type="secondary">{s.label}</Text>
                <Text strong style={{ color: s.color, fontSize: 16 }}>{s.value}</Text>
              </div>
            ))}
          </Card>

          <Card title="Trạng thái tài khoản" bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {[
                { label: "Xác minh email", done: true },
                { label: "Xác minh MST", done: true },
                { label: "Xác minh giấy phép KD", done: false },
                { label: "Tài khoản thanh toán", done: true },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text>{item.label}</Text>
                  <Tag color={item.done ? "success" : "warning"}>{item.done ? "✓ Hoàn tất" : "⚠ Chờ xử lý"}</Tag>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyProfilePage;
