import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Divider, Select } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, ChromeOutlined, GithubOutlined, PhoneOutlined, IdcardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import loginBg from "../../../assets/login_bg.png";

const { Title, Text, Link } = Typography;

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      await authService.register(
        values.fullName || "",
        values.email || "",
        values.password || "",
        "USER",
        values.phone || undefined
      );
      message.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMsg = axiosError.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Inter', sans-serif" }}>
      {/* Cột trái: Panel Giới thiệu Thương hiệu (Chỉ hiện trên Desktop) */}
      <div
        style={{
          flex: 1.2,
          background: `linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 58, 138, 0.88) 100%), url(${loginBg}) no-repeat center center`,
          backgroundSize: "cover",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          position: "relative",
          overflow: "hidden",
        }}
        className="register-brand-panel"
      >
        {/* Trang trí vòng tròn sáng mờ (Glassmorphism backdrop decor) */}
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "rgba(59, 130, 246, 0.15)",
            filter: "blur(80px)",
            borderRadius: "50%",
            top: "-50px",
            left: "-50px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background: "rgba(99, 102, 241, 0.15)",
            filter: "blur(100px)",
            borderRadius: "50%",
            bottom: "-100px",
            right: "-50px",
          }}
        />

        {/* Nội dung thương hiệu */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "560px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
            <span
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "20px",
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
              }}
            >
              WF
            </span>
            <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "1px" }}>WorkFusion</span>
          </div>

          <Title level={1} style={{ color: "#ffffff", fontSize: "38px", fontWeight: 800, lineHeight: 1.2, marginBottom: "24px" }}>
            Bắt đầu hành trình kết nối của bạn ngay hôm nay
          </Title>

          <Text style={{ color: "#94a3b8", fontSize: "16px", display: "block", marginBottom: "40px", lineHeight: 1.6 }}>
            Trở thành một phần của cộng đồng Freelancer & Doanh nghiệp hàng đầu. Tìm kiếm dự án tiềm năng, giao dịch bảo mật và hoàn thành công việc hiệu quả cùng chúng tôi.
          </Text>

          {/* Các tính năng nổi bật */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { title: "Gia nhập miễn phí & nhanh chóng", desc: "Chỉ mất vài phút để thiết lập hồ sơ và kết nối với hàng trăm dự án." },
              { title: "Ví bảo chứng bảo mật", desc: "Thanh toán an toàn, minh bạch bằng VND thông qua VNPay." },
              { title: "Hợp tác đa nền tảng dễ dàng", desc: "Quản lý công việc trôi chảy nhờ hệ thống nhiệm vụ trực quan." },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "16px" }}>
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "12px",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  ✓
                </span>
                <div>
                  <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "15px", fontWeight: 600 }}>{item.title}</h4>
                  <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cột phải: Form Đăng ký */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background: "#ffffff",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <Card
            bordered={false}
            bodyStyle={{ padding: 0 }}
            style={{ background: "transparent" }}
          >
            {/* Header chào mừng */}
            <div style={{ marginBottom: "32px" }}>
              <Title level={2} style={{ margin: "0 0 8px 0", fontWeight: 700, color: "#1e293b" }}>
                Đăng ký tài khoản 🚀
              </Title>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Gia nhập hệ thống để bắt đầu kết nối và làm việc ngay.
              </Text>
            </div>

            {/* Form */}
            <Form
              form={form}
              name="register_form"
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#475569" }}>Họ và tên</span>}
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên của bạn!" }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Nguyễn Văn A"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#475569" }}>Địa chỉ Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ email!" },
                  { type: "email", message: "Định dạng email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="email@example.com"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#475569" }}>Số điện thoại</span>}
                name="phone"
                rules={[
                  { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ (9-11 chữ số)!" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="0912345678"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#475569" }}>Mật khẩu</span>}
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 8, message: "Mật khẩu phải dài tối thiểu 8 ký tự!" },
                  {
                    pattern: /^(?=.*[0-9])(?=.*[A-Z]).{8,}$/,
                    message: "Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="••••••••"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#475569" }}>Xác nhận mật khẩu</span>}
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Nhập lại mật khẩu"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "24px", marginTop: "32px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                  }}
                >
                  Đăng ký tài khoản
                </Button>
              </Form.Item>
            </Form>

            {/* Social Logins */}
            <Divider plain><span style={{ color: "#94a3b8", fontSize: "12px" }}>Hoặc đăng ký bằng</span></Divider>

            <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
              <Button
                style={{ flex: 1, height: "42px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                icon={<ChromeOutlined style={{ color: "#ea4335" }} />}
              >
                Google
              </Button>
              <Button
                style={{ flex: 1, height: "42px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                icon={<GithubOutlined style={{ color: "#24292f" }} />}
              >
                GitHub
              </Button>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center" }}>
              <Text style={{ color: "#64748b" }}>
                Đã có tài khoản?{" "}
                <Link onClick={() => navigate("/login")} style={{ color: "#2563eb", fontWeight: 600 }}>
                  Đăng nhập ngay
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 991px) {
          .register-brand-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
