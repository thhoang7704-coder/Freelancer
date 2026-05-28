import React, { useState } from "react";
import { Card, Row, Col, Typography, Button, Space, Tag, List, Modal, Result, message, Form, Input } from "antd";
import {
  RocketOutlined, StarOutlined, ThunderboltOutlined, TeamOutlined,
  ProjectOutlined, CheckCircleOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import { useAuthStore } from "../../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { authService } from "../../auth/services/authService";
import axiosInstance from "../../../lib/axios";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const featuredProjects = [
  { title: "Thiết kế giao diện Mobile App Du lịch", category: "UI/UX", budget: 15000000, skills: ["Figma", "Mobile Design"] },
  { title: "Xây dựng Hệ thống E-learning bằng React & Spring Boot", category: "Web Dev", budget: 45000000, skills: ["React", "Spring Boot", "MySQL"] },
  { title: "Phát triển công cụ AI Chatbot tích hợp API", category: "AI & Data", budget: 25000000, skills: ["Python", "OpenAI API", "Node.js"] },
];

export const UserDashboardPage: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [requestedRole, setRequestedRole] = useState<"FREELANCER" | "COMPANY" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [freelancerForm] = Form.useForm();
  const [companyForm] = Form.useForm();

  const handleUpgradeRequest = (role: "FREELANCER" | "COMPANY") => {
    setRequestedRole(role);
    setSubmitted(false);
    if (role === "FREELANCER") freelancerForm.resetFields();
    if (role === "COMPANY") companyForm.resetFields();
    setModalVisible(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const submitFreelancer = async (values: any) => {
    setLoading(true);
    try {
      await axiosInstance.post("/freelancers", {
        experience: values.experience,
        projectLinks: values.projectLinks,
        programmingLanguages: values.programmingLanguages,
        certificates: values.certificates,
        portfolioLink: values.portfolioLink,
        avatarUrl: values.avatarUrl
      });
      setSubmitted(true);
      message.success("Nâng cấp thành công! Vui lòng đăng nhập lại để cập nhật.");
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi đăng ký Freelancer");
    } finally {
      setLoading(false);
    }
  };

  const submitCompany = async (values: any) => {
    setLoading(true);
    try {
      await axiosInstance.post("/companies", {
        companyName: values.companyName,
        address: values.address,
        taxCode: values.taxCode,
        representativeName: values.representativeName,
        representativePhone: values.representativePhone,
        expertise: values.expertise
      });
      setSubmitted(true);
      message.success("Nâng cấp thành công! Tài khoản đang chờ duyệt. Vui lòng đăng nhập lại.");
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi đăng ký Doanh nghiệp");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      
      {/* Banner chào mừng */}
      <Card bordered={false} style={{
        borderRadius: 20, marginBottom: 24, overflow: "hidden",
        background: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
        boxShadow: "0 4px 15px rgba(78, 84, 200, 0.2)"
      }}>
        <div style={{ padding: "10px 0" }}>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Chào mừng thành viên mới,</Text>
          <Title level={2} style={{ color: "#fff", margin: "4px 0 10px" }}>Chào bạn, {user?.full_name} 👋</Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, maxWidth: 680, margin: 0 }}>
            Tài khoản của bạn hiện đang ở vai trò **Thành viên thường (User)**. Hãy lựa chọn nâng cấp tài khoản để bắt đầu tìm kiếm việc làm tự do hoặc đăng tuyển dự án chuyên nghiệp ngay hôm nay!
          </Paragraph>
        </div>
      </Card>

      <Title level={4} style={{ marginBottom: 20, textAlign: "center" }}>
        🚀 Chọn Vai Trò Bạn Muốn Hướng Tới
      </Title>

      {/* Hai lựa chọn nâng cấp vai trò */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        
        {/* Lựa chọn Freelancer */}
        <Col xs={24} md={12}>
          <Card bordered={false} hoverable style={{
            borderRadius: 20, height: "100%", overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column"
          }}>
            <div style={{
              height: 120, background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              margin: "-24px -24px 20px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
            }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: "#fff", marginBottom: 8 }} />
              <Title level={4} style={{ color: "#fff", margin: 0 }}>Trở thành Chuyên gia tự do (Freelancer)</Title>
            </div>
            
            <Paragraph style={{ fontSize: 14, minHeight: 48 }}>
              Phù hợp cho các kỹ sư phát triển phần mềm, chuyên viên thiết kế UI/UX, chuyên gia viết lách hoặc chuyên gia marketing muốn tìm kiếm cơ hội làm việc linh hoạt.
            </Paragraph>

            <List size="small" style={{ marginBottom: 24, flex: 1 }} dataSource={[
              "Tìm kiếm & tiếp cận hàng trăm dự án chất lượng cao",
              "Gửi đề xuất báo giá (proposal) trực tiếp đến nhà tuyển dụng",
              "Nhận thanh toán an toàn, bảo mật thông qua Cột mốc (Milestones)",
              "Xây dựng Portfolio hồ sơ chuyên nghiệp thu hút khách hàng lớn"
            ]} renderItem={item => (
              <List.Item style={{ border: "none", padding: "6px 0" }}>
                <Space><CheckCircleOutlined style={{ color: "#52c41a" }} /> <Text>{item}</Text></Space>
              </List.Item>
            )} />

            <Button type="primary" size="large" block style={{
              background: "linear-gradient(135deg, #11998e, #38ef7d)", border: "none",
              borderRadius: 12, height: 45, fontWeight: 600, color: "#fff"
            }} onClick={() => handleUpgradeRequest("FREELANCER")}>
              Đăng ký làm Freelancer
            </Button>
          </Card>
        </Col>

        {/* Lựa chọn Company */}
        <Col xs={24} md={12}>
          <Card bordered={false} hoverable style={{
            borderRadius: 20, height: "100%", overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column"
          }}>
            <div style={{
              height: 120, background: "linear-gradient(135deg, #faad14 0%, #fa541c 100%)",
              margin: "-24px -24px 20px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
            }}>
              <TeamOutlined style={{ fontSize: 32, color: "#fff", marginBottom: 8 }} />
              <Title level={4} style={{ color: "#fff", margin: 0 }}>Trở thành Nhà tuyển dụng / Doanh nghiệp</Title>
            </div>

            <Paragraph style={{ fontSize: 14, minHeight: 48 }}>
              Phù hợp cho các doanh nghiệp, startup hoặc cá nhân có nhu cầu tìm kiếm, thuê chuyên gia thực hiện các dự án ngắn hạn hoặc dài hạn một cách nhanh chóng.
            </Paragraph>

            <List size="small" style={{ marginBottom: 24, flex: 1 }} dataSource={[
              "Đăng tin tuyển dụng và tìm kiếm ứng viên tài năng miễn phí",
              "Quản lý hồ sơ ứng tuyển, phỏng vấn trực tuyến dễ dàng",
              "Theo dõi tiến độ hợp đồng thông minh theo từng giai đoạn",
              "Nhận hóa đơn điện tử và các cam kết bảo vệ thanh toán an toàn"
            ]} renderItem={item => (
              <List.Item style={{ border: "none", padding: "6px 0" }}>
                <Space><CheckCircleOutlined style={{ color: "#fa8c16" }} /> <Text>{item}</Text></Space>
              </List.Item>
            )} />

            <Button type="primary" size="large" block style={{
              background: "linear-gradient(135deg, #faad14, #fa541c)", border: "none",
              borderRadius: 12, height: 45, fontWeight: 600, color: "#fff"
            }} onClick={() => handleUpgradeRequest("COMPANY")}>
              Đăng ký làm Doanh nghiệp
            </Button>
          </Card>
        </Col>

      </Row>

      {/* Modal đăng ký nâng cấp vai trò */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
        width={600}
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        {!submitted ? (
          <div style={{ padding: "10px" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <RocketOutlined style={{
                fontSize: 48,
                color: requestedRole === "FREELANCER" ? "#11998e" : "#faad14",
                marginBottom: 16
              }} />
              <Title level={4}>Hoàn tất hồ sơ nâng cấp</Title>
              <Paragraph style={{ color: "#595959", fontSize: 14 }}>
                Vui lòng cung cấp thêm thông tin để thiết lập tài khoản 
                <strong> {requestedRole === "FREELANCER" ? "Freelancer" : "Doanh nghiệp"}</strong> của bạn.
              </Paragraph>
            </div>

            {requestedRole === "FREELANCER" ? (
              <Form form={freelancerForm} layout="vertical" onFinish={submitFreelancer}>
                <Form.Item label="Kinh nghiệm làm việc" name="experience" rules={[{ required: true, message: "Vui lòng nhập kinh nghiệm của bạn" }]}>
                  <TextArea rows={3} placeholder="VD: 3 năm làm lập trình viên Web tại công ty X..." />
                </Form.Item>
                <Form.Item label="Kỹ năng lập trình/Thiết kế" name="programmingLanguages" rules={[{ required: true, message: "Vui lòng nhập kỹ năng chính" }]}>
                  <Input placeholder="VD: React, Node.js, Figma, SQL..." />
                </Form.Item>
                <Form.Item label="Link Portfolio (Tuỳ chọn)" name="portfolioLink">
                  <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item label="Chứng chỉ (Tuỳ chọn)" name="certificates">
                  <Input placeholder="VD: AWS Cloud Practitioner, IELTS 7.0..." />
                </Form.Item>
                <Form.Item label="Dự án đã tham gia (Tuỳ chọn)" name="projectLinks">
                  <TextArea rows={2} placeholder="Các đường dẫn tới dự án đã làm..." />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                  <Button onClick={() => setModalVisible(false)}>Hủy bỏ</Button>
                  <Button type="primary" htmlType="submit" loading={loading} style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)", border: "none" }}>
                    Hoàn tất Đăng ký Freelancer
                  </Button>
                </div>
              </Form>
            ) : (
              <Form form={companyForm} layout="vertical" onFinish={submitCompany}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Tên công ty / Tổ chức" name="companyName" rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}>
                      <Input placeholder="VD: Công ty TNHH ABC" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Mã số thuế" name="taxCode" rules={[{ required: true, message: "Vui lòng nhập mã số thuế" }]}>
                      <Input placeholder="Mã số thuế doanh nghiệp" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Lĩnh vực hoạt động" name="expertise" rules={[{ required: true, message: "Vui lòng nhập lĩnh vực" }]}>
                  <Input placeholder="VD: Công nghệ thông tin, Thiết kế đồ hoạ..." />
                </Form.Item>
                <Form.Item label="Địa chỉ trụ sở" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ công ty" }]}>
                  <Input placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Người đại diện" name="representativeName" rules={[{ required: true, message: "Vui lòng nhập tên người đại diện" }]}>
                      <Input placeholder="Họ và tên người đại diện" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Số điện thoại LH" name="representativePhone" rules={[{ required: true, message: "Vui lòng nhập SĐT liên hệ" }]}>
                      <Input placeholder="SĐT người đại diện" />
                    </Form.Item>
                  </Col>
                </Row>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                  <Button onClick={() => setModalVisible(false)}>Hủy bỏ</Button>
                  <Button type="primary" htmlType="submit" loading={loading} style={{ background: "linear-gradient(135deg, #faad14, #fa541c)", border: "none" }}>
                    Hoàn tất Đăng ký Doanh nghiệp
                  </Button>
                </div>
              </Form>
            )}
          </div>
        ) : (
          <Result
            status="success"
            title="Thành công!"
            subTitle={
              requestedRole === "FREELANCER" 
              ? "Hồ sơ Freelancer của bạn đã được tạo thành công. Vai trò của bạn đã được cập nhật."
              : "Hồ sơ Doanh nghiệp của bạn đã được tạo. Tài khoản hiện đang chờ Ban quản trị phê duyệt."
            }
            extra={[
              <Button type="primary" key="login" onClick={handleLogout} style={{ borderRadius: 8 }}>
                Đăng nhập lại ngay
              </Button>
            ]}
          />
        )}
      </Modal>

    </div>
  );
};

export default UserDashboardPage;
