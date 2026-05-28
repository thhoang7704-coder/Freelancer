import React, { useState } from "react";
import {
  Card, Row, Col, Form, Input, Button, Avatar, Typography,
  Divider, Tag, Space, message, Select
} from "antd";
import {
  UserOutlined, EditOutlined, SaveOutlined, CameraOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined, CalendarOutlined
} from "@ant-design/icons";
import { useAuthStore } from "../../../stores/authStore";

const { Title, Text } = Typography;

export const UserProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success("Đã lưu thông tin cá nhân!");
      setEditing(false);
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Title level={4} style={{ marginBottom: 24 }}>👤 Hồ sơ cá nhân</Title>

      {/* Cover & Avatar Card */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20, overflow: "hidden" }}>
        <div style={{
          height: 140, background: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
          margin: "-24px -24px 0", borderRadius: "16px 16px 0 0"
        }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -40, marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <Avatar size={100} icon={<UserOutlined />}
              style={{ border: "4px solid #fff", background: "linear-gradient(135deg, #4e54c8, #8f94fb)", fontSize: 36 }} />
            {editing && (
              <Button shape="circle" icon={<CameraOutlined />} size="small"
                style={{ position: "absolute", bottom: 0, right: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            )}
          </div>
          <div style={{ paddingBottom: 4, flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>{user?.full_name}</Title>
            <Space>
              <Tag color="geekblue">MEMBER</Tag>
              <Tag color="green">Đã xác minh</Tag>
            </Space>
          </div>
          <Button type={editing ? "default" : "primary"}
            icon={editing ? <SaveOutlined /> : <EditOutlined />}
            onClick={editing ? handleSave : () => setEditing(true)}
            style={{ borderRadius: 8 }}
          >
            {editing ? "Lưu thay đổi" : "Chỉnh sửa"}
          </Button>
        </div>
      </Card>

      <Row gutter={20}>
        {/* Left - Main Info */}
        <Col xs={24} md={16}>
          <Card title="Thông tin cơ bản" bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <Form form={form} layout="vertical" initialValues={{
              full_name: user?.full_name,
              email: user?.email,
              phone: "0909998887",
              gender: "Nam",
              address: "72 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
              dob: "1998-05-15",
            }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="gender" label="Giới tính">
                    <Select disabled={!editing} options={[
                      { value: "Nam", label: "Nam" },
                      { value: "Nữ", label: "Nữ" },
                      { value: "Khác", label: "Khác" }
                    ]} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, type: "email" }]}>
                    <Input prefix={<MailOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Số điện thoại">
                    <Input prefix={<PhoneOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dob" label="Ngày sinh">
                    <Input prefix={<CalendarOutlined />} disabled={!editing} placeholder="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address" label="Địa chỉ hiện tại">
                    <Input prefix={<EnvironmentOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Right - Profile Health & Stats */}
        <Col xs={24} md={8}>
          <Card title="Trạng thái hồ sơ" bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              {[
                { label: "Bảo mật tài khoản", value: "Tốt", color: "#52c41a" },
                { label: "Xác minh email", value: "Hoàn tất", color: "#52c41a" },
                { label: "Liên kết số điện thoại", value: "Đã liên kết", color: "#52c41a" },
                { label: "Xác thực hai lớp (2FA)", value: "Chưa bật", color: "#faad14" }
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>{s.label}</Text>
                  <Tag color={s.color}>{s.value}</Tag>
                </div>
              ))}
            </Space>
          </Card>

          <Card title="Nhật ký tài khoản" bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <Space direction="vertical" style={{ width: "100%" }} size={10}>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: "block" }}>Ngày tham gia</Text>
                <Text strong style={{ fontSize: 13 }}>22 tháng 5, 2026</Text>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: "block" }}>Đăng nhập gần nhất</Text>
                <Text strong style={{ fontSize: 13 }}>Hôm nay, lúc 23:56</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;
