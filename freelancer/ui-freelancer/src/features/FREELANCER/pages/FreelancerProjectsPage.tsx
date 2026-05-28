import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Card, Row, Col, Input, Tag, Typography, Button, Space,
  Drawer, Divider, Empty, Pagination, Form, InputNumber,
  message, Spin, Modal,
} from "antd";
import {
  SearchOutlined, SendOutlined, DollarOutlined,
  CalendarOutlined, TeamOutlined, BuildOutlined,
  ReloadOutlined, FileTextOutlined, BankOutlined, ClockCircleOutlined,
  PaperClipOutlined, DownloadOutlined
} from "@ant-design/icons";
import {
  freelancerProjectService,
  type ProjectItemResponse,
} from "../service/freelancerProjectService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const statusColor: Record<string, string> = {
  ACTIVE: "green",
  PENDING: "orange",
  CLOSED: "default",
  REJECTED: "error",
};

const progressColor: Record<string, string> = {
  NOT_STARTED: "default",
  IN_PROGRESS: "processing",
  COMPLETED: "success",
};

export const FreelancerProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 12;

  // Drawer — project detail
  const [drawer, setDrawer] = useState<ProjectItemResponse | null>(null);

  // Apply modal
  const [applyModal, setApplyModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState<ProjectItemResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Track applied project IDs in this session
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).openProject) {
      setDrawer((location.state as any).openProject);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadProjects = useCallback(async (searchVal = search, pageVal = page) => {
    try {
      setLoading(true);
      const data = await freelancerProjectService.getProjects({
        search: searchVal || undefined,
        status: "APPROVED",
        page: pageVal,
        pageSize: PAGE_SIZE,
      });
      setProjects(data.items ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadProjects();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    loadProjects(val, 1);
  };

  const openApply = (project: ProjectItemResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setApplyTarget(project);
    form.resetFields();
    form.resetFields();
    setApplyModal(true);
  };

  const handleApplySubmit = async () => {
    if (!applyTarget) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await freelancerProjectService.applyProject({
        projectId: applyTarget.projectId,
        coverLetter: values.coverLetter,
      });
      message.success("Ứng tuyển thành công! Hãy chờ công ty xem xét.");
      setAppliedIds((prev) => new Set([...prev, applyTarget.projectId]));
      setApplyModal(false);
      setDrawer(null);
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      message.error(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isApplied = (id: string) => appliedIds.has(id);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <SearchOutlined style={{ marginRight: 8, color: "#1677ff" }} />
            Tìm kiếm Dự án
          </Title>
          <Text type="secondary">
            Khám phá {total > 0 ? total : "các"} dự án phù hợp với kỹ năng của bạn
          </Text>
        </div>
        <Space>
          <Search
            placeholder="Tìm tên dự án, công ty..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 280 }}
            enterButton={<SearchOutlined />}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadProjects()} loading={loading} />
        </Space>
      </div>

      {/* Content */}
      <Spin spinning={loading}>
        {projects.length === 0 && !loading ? (
          <Empty description="Không tìm thấy dự án phù hợp" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {projects.map((p) => (
                <Col span={12} key={p.projectId}>
                  <Card
                    bordered={false}
                    hoverable
                    style={{
                      borderRadius: 16,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      height: "100%",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                    }}
                    onClick={() => setDrawer(p)}
                  >
                    {/* Status row */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Tag color={statusColor[p.status] ?? "default"}>{p.status}</Tag>
                      <Tag color={progressColor[p.progressStatus] ?? "default"}>{p.progressStatus}</Tag>
                    </div>

                    <Title level={5} style={{ margin: "0 0 4px" }} ellipsis>
                      {p.name}
                    </Title>

                    <Space style={{ marginBottom: 8 }}>
                      <BankOutlined style={{ color: "#8c8c8c" }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{p.company?.companyName}</Text>
                    </Space>

                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ color: "#8c8c8c", fontSize: 13, marginTop: 4, marginBottom: 12 }}
                    >
                      {p.description}
                    </Paragraph>

                    {/* Skills */}
                    <div style={{ marginBottom: 12 }}>
                      {(p.skillsRequired ? p.skillsRequired.split(",").map(s => s.trim()) : []).slice(0, 3).map((s) => (
                        <Tag key={s} style={{ marginBottom: 4 }}>{s}</Tag>
                      ))}
                      {(p.skillsRequired ? p.skillsRequired.split(",").map(s => s.trim()) : []).length > 3 && (
                        <Tag>+{(p.skillsRequired ? p.skillsRequired.split(",").map(s => s.trim()) : []).length - 3}</Tag>
                      )}
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Space>
                        <DollarOutlined style={{ color: "#52c41a" }} />
                        <Text strong style={{ color: "#52c41a" }}>
                          {fmt(p.budget)}
                        </Text>
                      </Space>
                      <Space>
                        {p.applicationCount !== undefined && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <TeamOutlined /> {p.applicationCount} ứng viên
                          </Text>
                        )}
                        {p.deadline && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            · <CalendarOutlined /> {new Date(p.deadline).toLocaleDateString("vi-VN")}
                          </Text>
                        )}
                      </Space>
                    </div>

                    {/* Applied badge */}
                    {isApplied(p.projectId) && (
                      <div style={{ marginTop: 10 }}>
                        <Tag color="success" style={{ width: "100%", textAlign: "center", borderRadius: 6 }}>
                          ✓ Đã ứng tuyển
                        </Tag>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>

            {total > PAGE_SIZE && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onChange={(p) => setPage(p)}
                  showTotal={(t) => `${t} dự án`}
                />
              </div>
            )}
          </>
        )}
      </Spin>

      {/* ─── Project Detail Drawer ─────────────────────────────────────── */}
      <Drawer
        title={
          <Space>
            <BuildOutlined />
            Chi tiết Dự án
          </Space>
        }
        width={560}
        open={!!drawer}
        onClose={() => setDrawer(null)}
        extra={
          drawer ? (
            isApplied(drawer.projectId) ? (
              <Tag color="success" style={{ fontSize: 13 }}>✓ Đã ứng tuyển</Tag>
            ) : drawer.applyStatus === "CLOSED" ? (
              <Tag color="error" style={{ fontSize: 13 }}>🔒 Đã khóa</Tag>
            ) : (
              <Button
                type="primary"
                icon={<SendOutlined />}
                style={{
                  background: "linear-gradient(135deg, #1677ff, #6366f1)",
                  border: "none",
                  borderRadius: 8,
                }}
                onClick={(e) => openApply(drawer, e)}
              >
                Ứng tuyển ngay
              </Button>
            )
          ) : null
        }
      >
        {drawer && (
          <div>
            {/* Header info */}
            <div style={{
              background: "linear-gradient(135deg, #e6f4ff, #f0f5ff)",
              borderRadius: 14, padding: "16px 20px", marginBottom: 20,
            }}>
              <Title level={4} style={{ margin: "0 0 4px" }}>{drawer.name}</Title>
              <Space>
                <BankOutlined style={{ color: "#1677ff" }} />
                <Text style={{ color: "#1677ff", fontWeight: 500 }}>{drawer.company?.companyName}</Text>
              </Space>
              <div style={{ marginTop: 10 }}>
                <Space wrap>
                  <Tag color={statusColor[drawer.status] ?? "default"}>Trạng thái: {drawer.status}</Tag>
                  <Tag color={progressColor[drawer.progressStatus] ?? "default"}>Tiến độ: {drawer.progressStatus}</Tag>
                </Space>
              </div>
            </div>

            {/* Metadata grid */}
            {[
              { icon: <DollarOutlined />, label: "Ngân sách", value: <Text strong style={{ color: "#52c41a", fontSize: 15 }}>{fmt(drawer.budget)}</Text> },
              { icon: <TeamOutlined />, label: "Số ứng viên", value: `${drawer.applicationCount ?? "—"} người` },
              { icon: <CalendarOutlined />, label: "Hạn chót", value: drawer.deadline ? new Date(drawer.deadline).toLocaleDateString("vi-VN") : "Không có hạn" },
              { icon: <ClockCircleOutlined />, label: "Ngày đăng", value: new Date(drawer.createdAt).toLocaleDateString("vi-VN") },
            ].map(({ icon, label, value }, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                <span style={{ color: "#1677ff", fontSize: 16, width: 20 }}>{icon}</span>
                <Text type="secondary" style={{ minWidth: 110 }}>{label}:</Text>
                <Text strong>{value}</Text>
              </div>
            ))}

            <Divider />

            <Title level={5}>📋 Mô tả dự án</Title>
            <Paragraph style={{ color: "#595959", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {drawer.description}
            </Paragraph>

            <Divider />

            <Title level={5}>🛠 Kỹ năng yêu cầu</Title>
            <Space wrap>
              {(drawer.skillsRequired ? drawer.skillsRequired.split(",").map(s => s.trim()) : []).map((s) => (
                <Tag key={s} color="blue" style={{ borderRadius: 6 }}>{s}</Tag>
              ))}
              {(!drawer.skillsRequired || drawer.skillsRequired.trim() === "") && <Text type="secondary">Không yêu cầu cụ thể</Text>}
            </Space>

            {drawer.attachments && drawer.attachments.length > 0 && (
              <>
                <Divider />
                <Title level={5}>📎 Tài liệu đính kèm</Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {drawer.attachments.map((att) => (
                    <Card
                      key={att.id}
                      size="small"
                      bordered
                      style={{ borderRadius: 8, background: "#fafafa" }}
                      bodyStyle={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}
                    >
                      <Space>
                        <PaperClipOutlined style={{ color: "#8c8c8c" }} />
                        <Text ellipsis style={{ maxWidth: 300 }} title={att.fileName}>
                          {att.fileName}
                        </Text>
                      </Space>
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Tải xuống
                      </Button>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {!isApplied(drawer.projectId) && drawer.applyStatus !== "CLOSED" && (
              <>
                <Divider />
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  block
                  style={{
                    background: "linear-gradient(135deg, #1677ff, #6366f1)",
                    border: "none",
                    borderRadius: 10,
                    height: 48,
                    fontWeight: 600,
                  }}
                  onClick={(e) => openApply(drawer, e)}
                >
                  Ứng tuyển ngay
                </Button>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* ─── Apply Modal ───────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: "#1677ff" }} />
            <span>Nộp đơn ứng tuyển</span>
          </Space>
        }
        open={applyModal}
        onCancel={() => { setApplyModal(false); form.resetFields(); }}
        footer={null}
        width={520}
        destroyOnClose
      >
        {applyTarget && (
          <div style={{
            background: "linear-gradient(135deg, #e6f4ff, #f0f5ff)",
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          }}>
            <Text strong style={{ display: "block", fontSize: 14 }}>{applyTarget.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{applyTarget.company?.companyName} · Ngân sách: {fmt(applyTarget.budget)}</Text>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleApplySubmit}>
          

          <Form.Item
            label="Thư giới thiệu (Cover Letter)"
            name="coverLetter"
            rules={[
              { required: true, message: "Vui lòng viết thư giới thiệu" },
              { min: 30, message: "Tối thiểu 30 ký tự" },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Giới thiệu bản thân, kinh nghiệm liên quan và lý do bạn phù hợp với dự án này..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button onClick={() => { setApplyModal(false); form.resetFields(); }}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SendOutlined />}
              style={{
                background: "linear-gradient(135deg, #1677ff, #6366f1)",
                border: "none",
                borderRadius: 8,
              }}
            >
              Gửi đơn ứng tuyển
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FreelancerProjectsPage;
