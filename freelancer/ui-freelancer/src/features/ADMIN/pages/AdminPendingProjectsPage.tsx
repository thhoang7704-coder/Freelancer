import React, { useState, useEffect } from "react";
import {
  Table, Button, Input, Tag, Space, Typography, Card, Statistic,
  Row, Col, Modal, Tooltip, Spin, message, Form
} from "antd";
import {
  SearchOutlined, CheckOutlined, CloseOutlined, EyeOutlined,
  ClockCircleOutlined, DeleteOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { adminPendingProjectService, type PendingProject } from "../service/adminPendingProjectService";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface Project {
  id: string;
  title: string;
  company_name: string;
  budget: number;
  description: string;
  status: "PENDING" | "REJECTED";
 
  created_at: string;
  deadline: string;
  files: string[];
}

const statusMap: Record<string, { color: string; label: string }> = {
  PENDING:  { color: "orange", label: "Chờ duyệt"  },
  REJECTED: { color: "red",    label: "Từ chối"    },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

export const AdminPendingProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "REJECTED" | null>(null);
  const [detailModal, setDetailModal] = useState<Project | null>(null);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    projectId?: string;
    projectTitle?: string;
    action?: "APPROVED" | "REJECTED";
  }>({ visible: false });
  const [rejectForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });

  useEffect(() => {
    fetchProjects();
  }, [pagination.page, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await adminPendingProjectService.getPendingProjects(
        pagination.page,
        pagination.pageSize
      );

      let filteredItems = data.items;
      if (statusFilter) {
        filteredItems = data.items.filter(p => p.status === statusFilter);
      }

      const mappedProjects: Project[] = filteredItems.map((project) => ({
        id: project.projectId,
        title: project.name,
        company_name: project.company.companyName,
        budget: project.budget,
        description: project.description,
        status: project.status,
        created_at: project.createdAt,
        deadline: project.deadline,
        files: project.files || [],
      }));
      setProjects(mappedProjects);
    } catch (error) {
      message.error("Lỗi khi tải danh sách dự án");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p =>
    (p.title.toLowerCase().includes(searchText.toLowerCase()) ||
    p.company_name.toLowerCase().includes(searchText.toLowerCase())) &&
    (!statusFilter || p.status === statusFilter)
  );

  const handleApprove = (record: Project) => {
    setActionModal({
      visible: true,
      projectId: record.id,
      projectTitle: record.title,
      action: "APPROVED",
    });
  };

  const handleReject = (record: Project) => {
    setActionModal({
      visible: true,
      projectId: record.id,
      projectTitle: record.title,
      action: "REJECTED",
    });
  };

  const handleActionConfirm = async () => {
    if (!actionModal.projectId || !actionModal.action) return;

    setActionLoading(true);
    try {
      await adminPendingProjectService.updateProjectStatus(actionModal.projectId, {
        status: actionModal.action,
        reason: rejectForm.getFieldValue("reason"),
      });

      message.success(
        actionModal.action === "APPROVED"
          ? "Duyệt dự án thành công"
          : "Từ chối dự án thành công"
      );
      setActionModal({ visible: false });
      rejectForm.resetFields();
      fetchProjects();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái dự án");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: "Dự án",
      key: "project",
      render: (_, record) => (
        <div>
          <Text strong>{record.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.company_name}</Text>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (v: string) => (
        <Text ellipsis={{ tooltip: v }} style={{ maxWidth: 200 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",
      sorter: (a, b) => a.budget - b.budget,
      render: (v: number) => (
        <Text style={{ color: "#52c41a", fontWeight: 600 }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusMap[status].color}>{statusMap[status].label}</Tag>
      ),
      filters: [
        { text: "Chờ duyệt", value: "PENDING" },
        { text: "Từ chối", value: "REJECTED" },
      ],
      onFilter: (value) => {
        setStatusFilter(value as "PENDING" | "REJECTED");
        return true;
      },
    },
    {
      title: "Hạn chót",
      dataIndex: "deadline",
      key: "deadline",
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => setDetailModal(record)} />
          </Tooltip>
          {record.status === "PENDING" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Chờ duyệt",
            value: projects.filter(p => p.status === "PENDING").length,
            icon: <ClockCircleOutlined />,
            color: "#faad14",
          },
          {
            title: "Từ chối",
            value: projects.filter(p => p.status === "REJECTED").length,
            icon: <DeleteOutlined />,
            color: "#ff4d4f",
          },
        ].map((stat, i) => (
          <Col span={12} key={i}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Duyệt Dự án
          </Title>
          <Search
            placeholder="Tìm dự án, công ty..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
          />
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{
              pageSize: pagination.pageSize,
              current: pagination.page,
              onChange: (page) => setPagination({ ...pagination, page }),
            }}
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Dự án"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[<Button key="close" onClick={() => setDetailModal(null)}>Đóng</Button>]}
        width={560}
      >
        {detailModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12 }}>
            {[
              ["Tiêu đề", detailModal.title],
              ["Công ty", detailModal.company_name],
              [
                "Ngân sách",
                <Text style={{ color: "#52c41a", fontWeight: 600 }}>
                  {formatCurrency(detailModal.budget)}
                </Text>,
              ],
              [
                "Mô tả",
                <Paragraph
                  ellipsis={{ rows: 3, expandable: true }}
                  style={{ marginBottom: 0 }}
                >
                  {detailModal.description}
                </Paragraph>,
              ],
              [
                "Trạng thái",
                <Tag color={statusMap[detailModal.status].color}>
                  {statusMap[detailModal.status].label}
                </Tag>,
              ],
              ["Ngày tạo", formatDate(detailModal.created_at)],
              ["Hạn chót", detailModal.deadline],
              [
                "Tệp đính kèm",
                detailModal.files && detailModal.files.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {detailModal.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1677ff",
                          textDecoration: "none",
                          wordBreak: "break-all",
                          fontSize: 12,
                        }}
                      >
                        📄 {file.split("/").pop() || "File " + (idx + 1)}
                      </a>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">Không có tệp đính kèm</Text>
                ),
              ],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <Text type="secondary" style={{ minWidth: 120 }}>
                  {label}:
                </Text>
                <Text strong>{value}</Text>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={
          actionModal.action === "APPROVED"
            ? "Duyệt Dự án"
            : "Từ chối Dự án"
        }
        open={actionModal.visible}
        onOk={handleActionConfirm}
        onCancel={() => {
          setActionModal({ visible: false });
          rejectForm.resetFields();
        }}
        okText={actionModal.action === "APPROVED" ? "Duyệt" : "Từ chối"}
        okType={actionModal.action === "APPROVED" ? "primary" : "danger"}
        confirmLoading={actionLoading}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item>
            <Text>
              Bạn có chắc muốn{" "}
              <strong>
                {actionModal.action === "APPROVED" ? "duyệt" : "từ chối"}
              </strong>{" "}
              dự án <strong>"{actionModal.projectTitle}"</strong> không?
            </Text>
          </Form.Item>

          {actionModal.action === "REJECTED" && (
            <Form.Item
              name="reason"
              label="Lý do từ chối (Tùy chọn)"
              rules={[
                { max: 500, message: "Lý do không vượt quá 500 ký tự" },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập lý do từ chối..."
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPendingProjectsPage;
