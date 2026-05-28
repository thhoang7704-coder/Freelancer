import React, { useState } from "react";
import { Card, Typography, Switch, Button, Form, Input, Space, Divider, message, Modal, Row, Col } from "antd";
import { LockOutlined, BellOutlined, SafetyOutlined, WarningOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export const UserSettingsPage: React.FC = () => {
  const [securityForm] = Form.useForm();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  const handlePasswordChange = () => {
    securityForm.validateFields().then(() => {
      message.success("Đổi mật khẩu thành công!");
      securityForm.resetFields();
    });
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Xác nhận xóa tài khoản?",
      icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
      content: "Hành động này không thể hoàn tác. Mọi thông tin cá nhân và dữ liệu liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống WorkFusion.",
      okText: "Xóa vĩnh viễn",
      okType: "danger",
      cancelText: "Hủy bỏ",
      onOk() {
        message.loading("Đang xử lý yêu cầu xóa...", 1.5).then(() => {
          message.error("Lỗi: Bạn không thể tự xóa tài khoản demo của hệ thống!");
        });
      },
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Title level={4} style={{ marginBottom: 24 }}>⚙️ Cài đặt tài khoản</Title>

      <Row gutter={[20, 20]}>
        
        {/* Left Column - Security & Notifications */}
        <Col xs={24} md={15}>
          
          {/* Notifications Settings Card */}
          <Card title={<Space><BellOutlined /> Cài đặt thông báo</Space>} bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text strong style={{ display: "block" }}>Thông báo qua Email</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Nhận cập nhật về các tin tức, cơ hội việc làm và phê duyệt vai trò.</Text>
                </div>
                <Switch checked={notifEmail} onChange={setNotifEmail} />
              </div>
              
              <Divider style={{ margin: 0 }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text strong style={{ display: "block" }}>Thông báo trên trình duyệt</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Nhận thông báo đẩy ngay lập tức khi hệ thống có tin nhắn hoặc cập nhật mới.</Text>
                </div>
                <Switch checked={notifSystem} onChange={setNotifSystem} />
              </div>

              <Divider style={{ margin: 0 }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text strong style={{ display: "block" }}>Tin tức & Khuyến mãi</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Nhận email quảng cáo, mẹo làm việc hiệu quả và tin tức từ đối tác.</Text>
                </div>
                <Switch checked={notifMarketing} onChange={setNotifMarketing} />
              </div>
            </Space>
          </Card>

          {/* Account Security Card */}
          <Card title={<Space><SafetyOutlined /> Đổi mật khẩu</Space>} bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <Form form={securityForm} layout="vertical">
              <Form.Item name="current_password" label="Mật khẩu hiện tại" rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>
              <Form.Item name="new_password" label="Mật khẩu mới" rules={[{ required: true, min: 6, message: "Mật khẩu mới phải từ 6 ký tự!" }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
              </Form.Item>
              <Form.Item name="confirm_password" label="Xác nhận mật khẩu mới" 
                dependencies={["new_password"]}
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                    },
                  }),
                ]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>
              <Button type="primary" icon={<LockOutlined />} onClick={handlePasswordChange} style={{ borderRadius: 8 }}>
                Cập nhật mật khẩu
              </Button>
            </Form>
          </Card>

        </Col>

        {/* Right Column - System Info & Danger Zone */}
        <Col xs={24} md={9}>
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            
            {/* System Info */}
            <Card title={<Text strong>Thông tin ứng dụng</Text>} bordered={false}
              style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: "block" }}>Phiên bản hiện tại</Text>
                  <Text strong>WorkFusion v1.2.0 (Stable)</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: "block" }}>Môi trường hệ thống</Text>
                  <Text strong>Development Server</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: "block" }}>Vị trí địa lý đăng nhập</Text>
                  <Text strong>Vietnam (IP: 14.161.x.x)</Text>
                </div>
              </Space>
            </Card>

            {/* Danger Zone */}
            <Card title={<Text type="danger" strong><WarningOutlined /> Khu vực nguy hiểm</Text>} bordered={false}
              style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #ffa39e", background: "#fff2f0" }}>
              <Paragraph style={{ fontSize: 13, color: "#595959" }}>
                Một khi bạn xóa tài khoản, mọi thông tin về hợp đồng, giao dịch cũ cũng sẽ bị hủy và không thể khôi phục lại.
              </Paragraph>
              <Button type="primary" danger block onClick={handleDeleteAccount} style={{ borderRadius: 8, height: 38, fontWeight: 600 }}>
                Xóa tài khoản cá nhân
              </Button>
            </Card>

          </Space>
        </Col>

      </Row>
    </div>
  );
};

export default UserSettingsPage;
