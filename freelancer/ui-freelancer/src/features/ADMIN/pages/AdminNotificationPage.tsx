import React, { useEffect, useState } from "react";
import { Card, Form, Input, Radio, Select, Button, message, Divider, Typography } from "antd";
import { adminCompanyService } from "../service/adminCompanyService";
import type { Company } from "../service/adminCompanyService";
import adminNotificationService from "../service/adminNotificationService";

const { TextArea } = Input;

export const AdminNotificationPage: React.FC = () => {
  const [mode, setMode] = useState<"admins" | "companies">("admins");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await adminCompanyService.getAllCompanies();
        setCompanies(list || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const onFinish = async (values: any) => {
    const { title, content, selectedCompanies } = values;
    if (!title || !content) {
      message.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    setLoading(true);
    try {
      if (mode === "admins") {
        await adminNotificationService.broadcastToAdmins({ title, content });
        message.success("Đã gửi thông báo tới tất cả admin (đã vào hàng đợi)");
      } else {
        if (!selectedCompanies || selectedCompanies.length === 0) {
          message.error("Vui lòng chọn ít nhất một công ty");
          setLoading(false);
          return;
        }

        // send to all selected companies in parallel
        await Promise.all(
          selectedCompanies.map((companyId: string) =>
            adminNotificationService.sendNotificationToCompany({ companyId, title, content })
          )
        );

        message.success("Đã gửi thông báo tới công ty(ies) được chọn");
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Gửi thông báo thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Gửi thông báo</Typography.Title>
        <Typography.Text type="secondary">Gửi thông báo tới admin hoặc tới công ty cụ thể</Typography.Text>
      </div>
      <Card style={{ marginTop: 12 }}>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ mode: "admins" }}>
          <Form.Item label="Đối tượng" name="mode">
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio.Button value="admins">Tất cả mọi người</Radio.Button>
              <Radio.Button value="companies">Công ty</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {mode === "companies" && (
            <Form.Item name="selectedCompanies" label="Chọn công ty">
              <Select mode="multiple" placeholder="Chọn công ty" allowClear>
                {companies.map((c) => (
                  <Select.Option key={c.companyId} value={c.companyId}>{c.companyName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }] }>
            <Input placeholder="Tiêu đề thông báo" />
          </Form.Item>

          <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
            <TextArea rows={6} placeholder="Nội dung thông báo" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminNotificationPage;
