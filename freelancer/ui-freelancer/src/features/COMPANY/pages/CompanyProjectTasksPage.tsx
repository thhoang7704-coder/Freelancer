import React, { useState, useEffect, useMemo } from "react";
import {
  Layout, Typography, Card, Tag, Space, Button, Empty, Spin, Select,
  Progress, Row, Col, Statistic, Collapse, Avatar, Form,
  Input, Upload, message, Modal, Divider, Badge
} from "antd";
import {
  CheckCircleOutlined, ClockCircleOutlined, UserOutlined,
  FileTextOutlined, DownloadOutlined, MessageOutlined,
  AlertOutlined, PlayCircleOutlined, ThunderboltOutlined,
  CaretRightOutlined, InboxOutlined, ProjectOutlined, FilterOutlined,
  FolderOpenOutlined, CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  companyProjectService,
  companyTaskService,
  type CompanyProject,
  type CompanyProjectTask,
  type CompanyTaskReport,
} from "../service/companyProjectService";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  TODO: { color: "default", label: "Chưa làm", icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { color: "processing", label: "Đang làm", icon: <PlayCircleOutlined /> },
  DONE: { color: "success", label: "Hoàn thành", icon: <CheckCircleOutlined /> },
};

const FEEDBACK_TYPE_CONFIG = {
  COMPANY_TO_LEADER: { color: "volcano", label: "Công ty → Leader" },
  LEADER_TO_FREELANCER: { color: "blue", label: "Leader → Freelancer" },
};

export const CompanyProjectTasksPage: React.FC = () => {
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CompanyProject | null>(null);
  
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [tasks, setTasks] = useState<CompanyProjectTask[]>([]);
  
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Feedback modal
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [targetReport, setTargetReport] = useState<CompanyTaskReport | null>(null);
  const [feedbackForm] = Form.useForm();
  const [fileList, setFileList] = useState<import("antd/es/upload/interface").UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load projects
  useEffect(() => {
    companyProjectService.getProjects()
      .then(data => {
        const approved = data.filter(p => p.status === "APPROVED");
        setProjects(approved);
      })
      .finally(() => setLoadingProjects(false));
  }, []);

  // Open modal & load tasks
  const handleOpenProject = (project: CompanyProject) => {
    setSelectedProject(project);
    setIsTasksModalOpen(true);
    setLoadingTasks(true);
    setStatusFilter("ALL");
    setTasks([]);
    
    companyTaskService.getProjectTasks(project.projectId)
      .then(data => setTasks(data))
      .catch(() => message.error("Không thể tải danh sách task"))
      .finally(() => setLoadingTasks(false));
  };

  const filteredTasks = useMemo(() => {
    if (statusFilter === "ALL") return tasks;
    return tasks.filter(t => t.status === statusFilter);
  }, [tasks, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === "TODO").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    done: tasks.filter(t => t.status === "DONE").length,
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "DONE").length / tasks.length) * 100) : 0,
  }), [tasks]);

  const handleOpenFeedback = (report: CompanyTaskReport) => {
    setTargetReport(report);
    setFeedbackModal(true);
    feedbackForm.resetFields();
    setFileList([]);
  };

  const handleSubmitFeedback = async (values: { feedback: string }) => {
    if (!targetReport) return;
    setSubmitting(true);
    try {
      const file = fileList[0]?.originFileObj as File | undefined;
      await companyTaskService.submitCompanyFeedback(targetReport.id, values.feedback, file);
      message.success("Gửi feedback thành công!");
      setFeedbackModal(false);
      // Reload tasks
      if (selectedProject) {
        const updated = await companyTaskService.getProjectTasks(selectedProject.projectId);
        setTasks(updated);
      }
    } catch {
      message.error("Gửi feedback thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout style={{ background: "transparent", minHeight: "100vh" }}>
      <Content style={{ padding: "24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            <ThunderboltOutlined style={{ marginRight: 8, color: "#faad14" }} />
            Task & Báo cáo
          </Title>
          <Text type="secondary">Chọn một dự án để xem tất cả task, báo cáo và gửi feedback</Text>
        </div>

        {/* Projects Grid */}
        <Spin spinning={loadingProjects}>
          {projects.length === 0 && !loadingProjects ? (
            <Empty description="Chưa có dự án nào đang hoạt động" />
          ) : (
            <Row gutter={[16, 16]}>
              {projects.map(project => (
                <Col xs={24} sm={12} md={8} lg={6} key={project.projectId}>
                  <Card
                    hoverable
                    onClick={() => handleOpenProject(project)}
                    style={{ borderRadius: 12, height: "100%" }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}>
                      <Avatar
                        size={48}
                        shape="square"
                        icon={<FolderOpenOutlined />}
                        style={{ background: "#e6f4ff", color: "#1677ff", marginRight: 12, borderRadius: 8 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Title level={5} style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {project.projectName}
                        </Title>
                        <Tag color={project.progressStatus === "DONE" ? "success" : "processing"} style={{ marginTop: 4 }}>
                          {project.progressStatus}
                        </Tag>
                      </div>
                    </div>
                    
                    <div style={{ color: "#8c8c8c", fontSize: 13 }}>
                      <div style={{ marginBottom: 4 }}><CalendarOutlined /> Deadline: {dayjs(project.deadline).format("DD/MM/YYYY")}</div>
                    </div>
                    
                    <Divider style={{ margin: "12px 0" }} />
                    <Button type="primary" block>
                      Xem Task & Báo cáo
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        {/* Project Tasks Modal */}
        <Modal
          title={
            <Space>
              <ProjectOutlined style={{ color: "#faad14" }} />
              Dự án: {selectedProject?.projectName}
            </Space>
          }
          open={isTasksModalOpen}
          onCancel={() => setIsTasksModalOpen(false)}
          footer={null}
          width={1000}
          bodyStyle={{ padding: "20px 0", maxHeight: "80vh", overflowY: "auto", overflowX: "hidden" }}
          centered
        >
          <div style={{ padding: "0 24px" }}>
            {/* Filter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>Danh sách Task</Title>
              <Select
                style={{ width: 160 }}
                value={statusFilter}
                onChange={setStatusFilter}
                prefix={<FilterOutlined />}
                options={[
                  { value: "ALL", label: "Tất cả task" },
                  { value: "TODO", label: "Chưa làm" },
                  { value: "IN_PROGRESS", label: "Đang làm" },
                  { value: "DONE", label: "Hoàn thành" },
                ]}
              />
            </div>

            {/* Stats Cards */}
            {!loadingTasks && tasks.length > 0 && (
              <Row gutter={12} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card size="small" style={{ borderRadius: 8, background: "#f0f2f5", border: "none" }}>
                    <Statistic title="Tổng Task" value={stats.total} valueStyle={{ fontSize: 20 }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ borderRadius: 8, background: "#e6f4ff", border: "none" }}>
                    <Statistic title="Chưa làm" value={stats.todo} valueStyle={{ color: "#1677ff", fontSize: 20 }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ borderRadius: 8, background: "#fffbe6", border: "none" }}>
                    <Statistic title="Đang làm" value={stats.inProgress} valueStyle={{ color: "#faad14", fontSize: 20 }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ borderRadius: 8, background: "#f6ffed", border: "none" }}>
                    <Statistic title="Hoàn thành" value={stats.done} valueStyle={{ color: "#52c41a", fontSize: 20 }} />
                  </Card>
                </Col>
                {/* Progress bar full width */}
                <Col span={24} style={{ marginTop: 12 }}>
                  <Card size="small" style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}>
                    <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text strong>Tiến độ dự án</Text>
                      <Text style={{ color: stats.progress >= 80 ? "#52c41a" : stats.progress >= 40 ? "#faad14" : "#ff4d4f", fontWeight: 700 }}>
                        {stats.progress}%
                      </Text>
                    </Space>
                    <Progress
                      percent={stats.progress}
                      strokeColor={stats.progress >= 80 ? "#52c41a" : stats.progress >= 40 ? "#faad14" : "#ff4d4f"}
                      trailColor="#f0f0f0"
                      strokeWidth={10}
                      showInfo={false}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* Loading */}
            {loadingTasks && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Spin tip="Đang tải task..." size="large" />
              </div>
            )}

            {/* Task List */}
            {!loadingTasks && tasks.length === 0 && (
              <Empty description="Chưa có task nào trong dự án này" style={{ padding: 40 }} />
            )}

            {!loadingTasks && filteredTasks.length > 0 && (
              <Collapse
                bordered={false}
                style={{ background: "transparent" }}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                className="task-collapse"
              >
                {filteredTasks.map((task) => (
                  <Panel
                    key={task.taskId}
                    header={
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <Space size="large">
                          <Text strong style={{ fontSize: 16 }}>{task.title}</Text>
                          <Tag color={STATUS_CONFIG[task.status]?.color} icon={STATUS_CONFIG[task.status]?.icon}>
                            {STATUS_CONFIG[task.status]?.label}
                          </Tag>
                        </Space>
                        <Space>
                          {task.reports.length > 0 && (
                            <Badge count={task.reports.length} style={{ backgroundColor: "#1677ff" }}>
                              <Tag color="blue" style={{ margin: 0, border: "none" }}>Có báo cáo</Tag>
                            </Badge>
                          )}
                          <Avatar size="small" icon={<UserOutlined />} />
                          <Text type="secondary">{task.assignedToName || "Chưa giao"}</Text>
                        </Space>
                      </div>
                    }
                    style={{
                      marginBottom: 16,
                      background: "#fff",
                      borderRadius: 12,
                      border: "1px solid #f0f0f0",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{ padding: "0 8px" }}>
                      <Paragraph style={{ color: "#595959" }}>{task.description}</Paragraph>

                      {task.deadline && (
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary"><ClockCircleOutlined /> Hạn chót: </Text>
                          <Text>{dayjs(task.deadline).format("DD/MM/YYYY HH:mm")}</Text>
                        </div>
                      )}

                      {task.fileUrl && (
                        <Button type="dashed" icon={<DownloadOutlined />} href={task.fileUrl} target="_blank" style={{ marginBottom: 16 }}>
                          Tài liệu đính kèm
                        </Button>
                      )}

                      <Divider style={{ margin: "16px 0" }} />

                      <Title level={5} style={{ marginBottom: 16 }}>
                        <FileTextOutlined /> Báo cáo công việc ({task.reports.length})
                      </Title>

                      {task.reports.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có báo cáo nào" />
                      ) : (
                        <Space direction="vertical" style={{ width: "100%", padding: "0 12px 12px" }} size="middle">
                          {task.reports.map((report) => (
                            <div key={report.id} style={{ background: "#fafafa", borderRadius: 10, padding: 16, border: "1px solid #f0f0f0" }}>
                              {/* Report meta */}
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                                <Space>
                                  <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
                                  <div>
                                    <Text strong>{report.reporterName}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {dayjs(report.reportedAt).format("DD/MM/YYYY HH:mm")}
                                    </Text>
                                  </div>
                                </Space>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<MessageOutlined />}
                                  onClick={() => handleOpenFeedback(report)}
                                >
                                  Gửi Feedback
                                </Button>
                              </div>

                              {/* Report content */}
                              <Paragraph style={{ background: "#fff", padding: 12, borderRadius: 8, border: "1px solid #e8e8e8", margin: 0, whiteSpace: "pre-wrap" }}>
                                {report.content}
                              </Paragraph>

                              {report.fileUrl && (
                                <div style={{ marginTop: 12 }}>
                                  <Button size="small" type="dashed" icon={<DownloadOutlined />} href={report.fileUrl} target="_blank">
                                    Tải file đính kèm
                                  </Button>
                                </div>
                              )}

                              {/* Feedbacks */}
                              {report.feedbacks.length > 0 && (
                                <div style={{ marginTop: 16, marginLeft: 24, borderLeft: "2px solid #e8e8e8", paddingLeft: 16 }}>
                                  <Text strong style={{ fontSize: 13, color: "#8c8c8c", display: "block", marginBottom: 12 }}>
                                    Lịch sử Feedback ({report.feedbacks.length})
                                  </Text>
                                  
                                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                                    {report.feedbacks.map(fb => {
                                      const typeConfig = FEEDBACK_TYPE_CONFIG[fb.type as keyof typeof FEEDBACK_TYPE_CONFIG] || { color: "default", label: fb.type };
                                      return (
                                        <div key={fb.id} style={{ background: "#fff", padding: 12, borderRadius: 8, border: "1px solid #f0f0f0" }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <Space>
                                              <Text strong>{fb.authorName}</Text>
                                              <Tag color={typeConfig.color} style={{ margin: 0, fontSize: 11 }}>{typeConfig.label}</Tag>
                                            </Space>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                              {dayjs(fb.createdAt).format("DD/MM/YYYY HH:mm")}
                                            </Text>
                                          </div>
                                          <Text style={{ whiteSpace: "pre-wrap", display: "block" }}>{fb.content}</Text>
                                          {fb.fileUrl && (
                                            <Button size="small" type="link" icon={<DownloadOutlined />} href={fb.fileUrl} target="_blank" style={{ padding: 0, marginTop: 8 }}>
                                              File đính kèm
                                            </Button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </Space>
                                </div>
                              )}
                            </div>
                          ))}
                        </Space>
                      )}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            )}
          </div>
        </Modal>

      </Content>

      {/* Modal gửi feedback */}
      <Modal
        title="Gửi Feedback Báo Cáo"
        open={feedbackModal}
        onCancel={() => !submitting && setFeedbackModal(false)}
        footer={null}
        destroyOnClose
      >
        <AlertOutlined style={{ color: "#faad14", marginRight: 8 }} />
        <Text type="secondary">
          Feedback của bạn sẽ được gửi dưới tư cách Công ty. Leader sẽ nhận được để truyền đạt lại cho Freelancer.
        </Text>
        
        <Divider style={{ margin: "16px 0" }} />

        <Form form={feedbackForm} layout="vertical" onFinish={handleSubmitFeedback}>
          <Form.Item
            name="feedback"
            label="Nội dung Feedback"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <TextArea rows={4} placeholder="Nhập yêu cầu sửa đổi, góp ý..." />
          </Form.Item>

          <Form.Item label="Đính kèm file (tùy chọn)">
            <Upload
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={(info) => setFileList(info.fileList)}
            >
              <Button icon={<InboxOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => setFeedbackModal(false)} disabled={submitting}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Gửi Feedback
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

    </Layout>
  );
};
