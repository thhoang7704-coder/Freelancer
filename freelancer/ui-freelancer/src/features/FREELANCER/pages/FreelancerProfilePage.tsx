import React, { useState } from "react";
import {
  Card, Row, Col, Form, Input, Button, Avatar, Typography,
  Tag, Space, Select, message, Tabs, InputNumber, Switch
} from "antd";
import {
  UserOutlined, EditOutlined, SaveOutlined, CameraOutlined,
  GlobalOutlined, PhoneOutlined, MailOutlined, GithubOutlined,
  EnvironmentOutlined, ToolOutlined, SolutionOutlined
} from "@ant-design/icons";
import { useAuthStore } from "../../../stores/authStore";
import { freelancerProfileService, type FreelancerResponse } from "../service/freelancerProfileService";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const skillOptions = [
  "React", "React Native", "TypeScript", "JavaScript", "Node.js", "Java", "Spring Boot",
  "Python", "Django", "SQL", "MongoDB", "Figma", "UI/UX Design", "Flutter", "DevOps", "AWS"
];

export const FreelancerProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<FreelancerResponse | null>(null);

  const [skills, setSkills] = useState(["React", "TypeScript", "Node.js", "Figma", "UI/UX Design"]);
  const [isAvailable, setIsAvailable] = useState(true);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await freelancerProfileService.getMyProfile();
      setProfile(res.data);
      const fetchedSkills = res.data.programmingLanguages ? res.data.programmingLanguages.split(",").map(s => s.trim()) : [];
      setSkills(fetchedSkills);
      
      form.setFieldsValue({
        full_name: res.data.fullName,
        title: "Full-stack Developer & UI/UX Designer", // Backend doesn't have title
        email: user?.email,
        phone: res.data.phone,
        github: res.data.projectLinks,
        website: res.data.portfolioLink,
        address: "Quận 3, TP. Hồ Chí Minh", // backend doesn't have address
        hourly_rate: 350000, 
        experience: res.data.experience,
        skills: fetchedSkills,
        bio: "Tôi là một nhà phát triển phần mềm nhiệt huyết...",
      });
    } catch (error) {
      console.error("Failed to fetch freelancer profile", error);
    }
  };

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      setLoading(true);
      try {
        await freelancerProfileService.updateMyProfile({
          experience: values.experience,
          projectLinks: values.github,
          programmingLanguages: values.skills ? values.skills.join(", ") : "",
          certificates: "", 
          portfolioLink: values.website,
          avatarUrl: ""
        });
        setSkills(values.skills || []);
        message.success("Đã cập nhật hồ sơ chuyên gia!");
        setEditing(false);
        fetchProfile();
      } catch (error) {
        message.error("Lỗi khi cập nhật hồ sơ");
      } finally {
        setLoading(false);
      }
    });
  };

  // Mock Portfolios
  const portfolios = [
    {
      title: "Hệ thống Quản lý Dự án WorkFusion",
      description: "Ứng dụng web giúp kết nối doanh nghiệp và freelancer, hỗ trợ quản lý hợp đồng, cột mốc thanh toán thông minh.",
      techs: ["React", "TypeScript", "Spring Boot"],
      link: "https://github.com/workfusion",
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)"
    },
    {
      title: "Ứng dụng di động mua sắm thông minh SmartShop",
      description: "Ứng dụng thương mại điện tử với trải nghiệm người dùng tối giản, hỗ trợ đề xuất sản phẩm bằng AI.",
      techs: ["React Native", "Node.js", "MongoDB"],
      link: "https://smartshop.vn",
      gradient: "linear-gradient(135deg, #2193b0, #6dd5ed)"
    },
    {
      title: "Giao diện Dashboard Quản trị dữ liệu tài chính",
      description: "Hệ thống biểu đồ phân tích thời gian thực với độ trễ thấp, giao diện dark-mode tinh tế và trực quan.",
      techs: ["React", "Figma", "UI/UX"],
      link: "https://finance-dashboard.vn",
      gradient: "linear-gradient(135deg, #ee0979, #ff6a00)"
    }
  ];

  const tabItems = [
    {
      key: "info",
      label: "Thông tin & Kỹ năng",
      children: (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} disabled={!editing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="title" label="Tiêu đề nghề nghiệp" rules={[{ required: true }]}>
                <Input prefix={<SolutionOutlined />} disabled={!editing} />
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
              <Form.Item name="hourly_rate" label="Mức giá mỗi giờ (VND)" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="VND / giờ"
                  disabled={!editing}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="experience" label="Kinh nghiệm làm việc">
                <Input prefix={<SolutionOutlined />} disabled={!editing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="github" label="Tài khoản Github">
                <Input prefix={<GithubOutlined />} disabled={!editing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="website" label="Website cá nhân">
                <Input prefix={<GlobalOutlined />} disabled={!editing} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Địa điểm làm việc">
                <Input prefix={<EnvironmentOutlined />} disabled={!editing} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="skills" label="Kỹ năng chuyên môn">
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Chọn kỹ năng của bạn"
                  disabled={!editing}
                  options={skillOptions.map(s => ({ label: s, value: s }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="bio" label="Giới thiệu bản thân">
                <TextArea rows={5} disabled={!editing} placeholder="Mô tả kỹ năng, thế mạnh và các dự án của bạn..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      key: "portfolio",
      label: "Portfolio Dự án",
      children: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text type="secondary">Danh sách các dự án tiêu biểu tôi đã hoàn thành</Text>
            {editing && <Button type="dashed" icon={<ToolOutlined />}>Thêm dự án mới</Button>}
          </div>
          <Row gutter={[16, 16]}>
            {portfolios.map((p, idx) => (
              <Col span={24} key={idx}>
                <Card bordered={false} hoverable style={{
                  borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0"
                }}>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div style={{
                      width: 100, height: 100, borderRadius: 12, flexShrink: 0,
                      background: p.gradient, display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: "bold", fontSize: 24, color: "#fff"
                    }}>
                      PJ
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Title level={5} style={{ margin: 0 }}>{p.title}</Title>
                        <Button type="link" size="small" href={p.link} target="_blank" icon={<GlobalOutlined />}>Chi tiết</Button>
                      </div>
                      <Paragraph type="secondary" style={{ margin: "8px 0", fontSize: 13 }}>
                        {p.description}
                      </Paragraph>
                      <Space size={[0, 8]} wrap>
                        {p.techs.map(t => <Tag key={t} color="cyan">{t}</Tag>)}
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Title level={4} style={{ marginBottom: 24 }}>💼 Hồ sơ Chuyên gia tự do</Title>

      {/* Header card with gradient background and avatar */}
      <Card bordered={false} style={{
        borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        marginBottom: 20, overflow: "hidden"
      }}>
        <div style={{
          height: 160, background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          margin: "-24px -24px 0", borderRadius: "20px 20px 0 0"
        }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -50, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Avatar size={110} icon={<UserOutlined />}
              style={{ border: "4px solid #fff", background: "linear-gradient(135deg, #11998e, #38ef7d)", fontSize: 42 }} />
            {editing && (
              <Button shape="circle" icon={<CameraOutlined />} size="small"
                style={{ position: "absolute", bottom: 2, right: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            )}
          </div>
          <div style={{ paddingBottom: 4, flex: 1, minWidth: 200 }}>
            <Title level={4} style={{ margin: 0 }}>{user?.full_name}</Title>
            <Text strong type="secondary" style={{ display: "block", marginBottom: 6 }}>Full-stack Developer & UI/UX Designer</Text>
            <Space size={8} wrap>
              <Tag color="green" style={{ fontWeight: 600 }}>FREELANCER</Tag>
              <Tag color="blue">Cấp độ: Top Rated ⭐</Tag>
            </Space>
          </div>
          <Button
            type={editing ? "default" : "primary"}
            icon={editing ? <SaveOutlined /> : <EditOutlined />}
            onClick={editing ? handleSave : () => setEditing(true)}
            style={{
              background: editing ? undefined : "linear-gradient(135deg, #11998e, #38ef7d)",
              border: "none", color: "#fff", height: 38, borderRadius: 10
            }}
          >
            {editing ? "Lưu hồ sơ" : "Chỉnh sửa hồ sơ"}
          </Button>
        </div>
      </Card>

      {/* removed inline policy button (now in layout menu) */}

      <Row gutter={[20, 20]}>
        {/* Main Content Areas */}
        <Col xs={24} md={16}>
          <Card bordered={false} style={{ borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", minHeight: 480 }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          </Card>
        </Col>

        {/* Sidebar Info & Stats */}
        <Col xs={24} md={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>

            {/* Availability card */}
            <Card bordered={false} style={{ borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text strong style={{ display: "block" }}>Trạng thái nhận việc</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {isAvailable ? "Sẵn sàng nhận dự án mới" : "Hiện tại đang bận làm việc"}
                  </Text>
                </div>
                <Switch
                  checked={isAvailable}
                  onChange={(checked) => {
                    setIsAvailable(checked);
                    message.success(checked ? "Đã bật nhận dự án mới!" : "Đã tạm dừng nhận dự án mới!");
                  }}
                  checkedChildren="Mở"
                  unCheckedChildren="Tắt"
                />
              </div>
            </Card>

            {/* Stats Sidebar */}
            <Card title={<Text strong style={{ fontSize: 16 }}>Thống kê sự nghiệp</Text>} bordered={false}
              style={{ borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              {[
                { label: "Dự án đã hoàn thành", value: "23", color: "#38ef7d" },
                { label: "Đánh giá uy tín", value: "4.9 ⭐", color: "#faad14" },
                { label: "Tổng thu nhập tích lũy", value: "185 tr đ", color: "#1677ff" },
                { label: "Tỷ lệ hoàn thành dự án", value: "98%", color: "#52c41a" },
                { label: "Số giờ làm việc", value: "850 giờ", color: "#722ed1" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: i < 4 ? "1px solid #f5f5f5" : "none"
                }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>{s.label}</Text>
                  <Text strong style={{ color: s.color, fontSize: 15 }}>{s.value}</Text>
                </div>
              ))}
            </Card>

            {/* Tags section */}
            <Card title={<Text strong style={{ fontSize: 16 }}>Kỹ năng hàng đầu</Text>} bordered={false}
              style={{ borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <Space size={[0, 8]} wrap>
                {skills.map(skill => (
                  <Tag color="cyan" key={skill} style={{ borderRadius: 6, padding: "2px 8px" }}>{skill}</Tag>
                ))}
              </Space>
            </Card>

          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default FreelancerProfilePage;
