import React from "react";
import { Card, Typography, Button, Row, Col, Space, Descriptions, Divider } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { policyService } from "./service/policyService";

const { Title, Paragraph, Text } = Typography;

export const PolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [rule, setRule] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const loadRule = async () => {
    try {
      setLoading(true);
      const res = await policyService.getActiveRule();
      setRule(res.data);
    } catch (err) {
      console.error("Failed to load active rule", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadRule();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Row style={{ marginBottom: 16 }} align="middle" justify="space-between">
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <Title level={4} style={{ margin: 0 }}>Chính sách</Title>
          </Space>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadRule}>Tải lại quy tắc</Button>
        </Col>
      </Row>

      <div style={{ marginBottom: 18 }}>
        <div style={{
          borderRadius: 12,
          padding: 20,
          background: "linear-gradient(135deg, #f3f9ff 0%, #ffffff 100%)",
          boxShadow: "0 6px 18px rgba(14, 30, 37, 0.06)",
          border: "1px solid rgba(20,60,100,0.04)"
        }}>
          <Title level={2} style={{ margin: 0, color: "#0b3d91" }}>Giới thiệu hệ thống</Title>
          <Paragraph style={{ marginTop: 8, color: "#rgba(14, 30, 37, 0.06)", fontSize: 14 }}>
            WorkFusion là nền tảng kết nối doanh nghiệp và chuyên gia tự do, cung cấp công cụ quản lý dự án,
            hợp đồng và luồng thanh toán minh bạch. Trang này trình bày chính sách phân bổ doanh thu dự án —
            mô tả tỉ lệ phần trăm dành cho các vai trò tham gia khi một dự án được thanh toán. Thông tin được
            cập nhật từ hệ thống và phản ánh quy tắc đang được kích hoạt.
          </Paragraph>
        </div>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Title level={5}>Chính sách chia tiền hiện hành</Title>

        {rule ? (
          renderPolicyCard(rule && rule.data ? rule.data : rule)
        ) : (
          <Paragraph type="secondary">Không có quy tắc đang hoạt động hoặc đang tải...</Paragraph>
        )}
      </Card>
    </div>
  );
};

export default PolicyPage;
function renderPolicyCard(payload: any) {
  // handle the known response shape
  const admin = payload.adminPercent ?? null;
  const leader = payload.leaderPercent ?? null;
  const freelancer = payload.freelancerPercent ?? null;
  const active = payload.active === undefined ? null : Boolean(payload.active);

  if (admin != null || leader != null || freelancer != null) {
    return (
      <div>
        <Paragraph>
          Bảng dưới đây là tỉ lệ phân bổ doanh thu hiện đang được áp dụng cho mỗi dự án. Các giá trị thể hiện phần trăm (%) của tổng số tiền dự án được phân chia cho từng vai trò.
        </Paragraph>

        <Descriptions bordered column={1} size="middle" style={{ marginBottom: 12 }}>
          {admin != null && (
            <Descriptions.Item label="Admin">{admin}%</Descriptions.Item>
          )}
          {leader != null && (
            <Descriptions.Item label="Leader">{leader}%</Descriptions.Item>
          )}
          {freelancer != null && (
            <Descriptions.Item label="Freelancer">{freelancer}%</Descriptions.Item>
          )}
          {active != null && (
            <Descriptions.Item label="Đang kích hoạt">{active ? 'Có' : 'Không'}</Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        {admin != null && <Paragraph>• Nếu bạn là Admin, bạn sẽ nhận được <Text strong>{admin}%</Text> tổng số tiền của dự án.</Paragraph>}
        {leader != null && <Paragraph>• Nếu bạn là Leader, bạn sẽ nhận được <Text strong>{leader}%</Text> tổng số tiền của dự án.</Paragraph>}
        {freelancer != null && <Paragraph>• Nếu bạn là Freelancer, bạn sẽ nhận được <Text strong>{freelancer}%</Text> tổng số tiền của dự án.</Paragraph>}

        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          Ghi chú: các tỉ lệ trên được quản lý bởi hệ thống và có thể được thay đổi bởi người quản trị. Các thay đổi sẽ có hiệu lực ngay khi quy tắc được kích hoạt.
        </Paragraph>
      </div>
    );
  }

  // fallback to generic rendering
  return (
    <pre style={{ background: "#fafafa", padding: 12, borderRadius: 6, overflowX: "auto" }}>
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}
