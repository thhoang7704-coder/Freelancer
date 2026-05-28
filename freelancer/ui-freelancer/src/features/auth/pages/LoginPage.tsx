import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Card, Typography, message, Divider } from "antd";
import { UserOutlined, LockOutlined, ChromeOutlined, GithubOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import loginBg from "../../../assets/login_bg.png";

const { Title, Text, Link } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // URL quay lại nếu được chuyển hướng từ Guard
  const from = location.state?.from?.pathname || null;

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const data = await authService.login(values.email || "", values.password || "");
      message.success(`Chào mừng trở lại, ${data.user.full_name}!`);

      // Điều hướng dựa trên Vai trò người dùng (Roles)
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (data.user.role) {
          case "ADMIN":
            navigate("/admin/dashboard");
            break;
          case "COMPANY":
            navigate("/company/dashboard");
            break;
          case "FREELANCER":
            navigate("/freelancer/dashboard");
            break;
          default:
            navigate("/");
            break;
        }
      }
    } catch (err) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMsg = axiosError.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!";
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
        className="login-brand-panel"
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
            <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "1px" }}>WORKFUSHION</span>
          </div>

          <Title level={1} style={{ color: "#ffffff", fontSize: "38px", fontWeight: 800, lineHeight: 1.2, marginBottom: "24px" }}>
            Nền tảng Hợp tác Chuyên gia & Doanh nghiệp hàng đầu
          </Title>

          <Text style={{ color: "#94a3b8", fontSize: "16px", display: "block", marginBottom: "40px", lineHeight: 1.6 }}>
            Kết nối các chuyên gia tự do hàng đầu Việt Nam với các dự án lớn từ doanh nghiệp uy tín. Quản lý công việc trực quan, an tâm dòng tiền qua cơ chế thanh toán VNPay Escrow bảo mật.
          </Text>

          {/* Các tính năng nổi bật */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { title: "Kế hoạch công việc trực quan", desc: "Theo dõi tiến độ, trao quyền và báo cáo thông qua bảng Kanban hiện đại." },
              { title: "Ví điện tử & Bảo chứng VNPay", desc: "Dòng tiền an toàn, thanh toán tự động sau nghiệm thu thành công." },
              { title: "Phân quyền và bảo mật tối đa", desc: "Môi trường phân cấp vai trò chuẩn xác tương thích Spring Security." },
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

      {/* Cột phải: Form Đăng nhập */}
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
                Đăng nhập hệ thống 👋
              </Title>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Vui lòng điền thông tin đăng nhập để tiếp tục làm việc.
              </Text>
            </div>

            {/* Form */}
            <Form
              form={form}
              name="login_form"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#475569" }}>Địa chỉ Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ email!" },
                  { type: "email", message: "Định dạng email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="nhanvien@gmail.com"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span style={{ fontWeight: 500, color: "#475569" }}>Mật khẩu</span>
                    <Link style={{ fontSize: "13px", color: "#2563eb" }}>Quên mật khẩu?</Link>
                  </div>
                }
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="••••••••"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Checkbox><span style={{ color: "#64748b", fontSize: "13px" }}>Ghi nhớ phiên đăng nhập</span></Checkbox>
                </div>
              </Form.Item>

              <Form.Item style={{ marginBottom: "24px" }}>
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
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            {/* Social Logins */}
            <Divider plain><span style={{ color: "#94a3b8", fontSize: "12px" }}>Hoặc đăng nhập bằng</span></Divider>

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
                Chưa có tài khoản?{" "}
                <Link onClick={() => navigate("/register")} style={{ color: "#2563eb", fontWeight: 600 }}>
                  Đăng ký ngay
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>

      {/* Responsive Styles (CSS nhúng để ẩn Brand Panel trên Mobile) */}
      <style>{`
        @media (max-width: 991px) {
          .login-brand-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
