import React, { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Row,
  Col,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Typography,
  Space,
  Empty,
  Spin,
  Drawer,
  Tooltip,
  Divider,
  Badge,
  Popconfirm
} from "antd";
import {
  FolderOutlined,
  CalendarOutlined,
  PlusOutlined,
  UserOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  CheckSquareOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  UserAddOutlined,
  FileTextOutlined,
  EditOutlined,
  MessageOutlined,
  FileDoneOutlined
} from "@ant-design/icons";
import { freelancerTaskService, type ProjectItem, type TaskItem, type ProjectMember, type WorkReportItem, type ReportFeedbackItem } from "../service/freelancerTaskService";
import { useAuthStore } from "../../../stores/authStore";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

export const FreelancerTasksPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [joinedProjects, setJoinedProjects] = useState<ProjectItem[]>([]);
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  
  // Drawer view for project details & tasks
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [projectTasks, setProjectTasks] = useState<TaskItem[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [taskTypeVal, setTaskTypeVal] = useState<"OPEN" | "ASSIGNED">("OPEN");
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  // Modals Báo cáo & Feedback
  const [reportsModalVisible, setReportsModalVisible] = useState(false);
  const [reportsList, setReportsList] = useState<WorkReportItem[]>([]);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState<TaskItem | null>(null);
  
  const [reportFormModalVisible, setReportFormModalVisible] = useState(false);
  const [reportForm] = Form.useForm();
  const [editingReport, setEditingReport] = useState<WorkReportItem | null>(null);
  
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbacksList, setFeedbacksList] = useState<ReportFeedbackItem[]>([]);
  const [selectedReportForFeedback, setSelectedReportForFeedback] = useState<WorkReportItem | null>(null);
  const [feedbackForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách các dự án đã tham gia
      const projects = await freelancerTaskService.getJoinedProjects();
      
      // 2. Kiểm tra quyền leader động trên từng dự án
      const checkedProjects = await Promise.all(
        projects.map(async (p) => {
          const isLeader = await freelancerTaskService.checkIsLeader(p.projectId);
          return { ...p, isLeader };
        })
      );
      
      setJoinedProjects(checkedProjects);

      // 3. Lấy danh sách công việc của tôi
      const tasks = await freelancerTaskService.getMyTasks();
      setMyTasks(tasks);
    } catch (err: any) {
      console.error(err);
      message.error("Lỗi khi tải dữ liệu công việc!");
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết dự án & danh sách task trong dự án đó
  const handleViewProjectTasks = async (project: ProjectItem) => {
    setSelectedProject(project);
    setDrawerVisible(true);
    setProjectLoading(true);
    try {
      // Bất kể leader hay member đều có thể xem toàn bộ task
      const tasks = await freelancerTaskService.getProjectTasks(project.projectId);
      setProjectTasks(tasks);
      
      if (project.isLeader) {
        const members = await freelancerTaskService.getProjectMembers(project.projectId);
        setProjectMembers(members);
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách task của dự án!");
    } finally {
      setProjectLoading(false);
    }
  };

  // Nhận task (Claim)
  const handleClaimTask = async (taskId: string) => {
    try {
      await freelancerTaskService.claimTask(taskId);
      message.success("Nhận task thành công!");
      
      // Tải lại dữ liệu
      if (selectedProject) {
        handleViewProjectTasks(selectedProject);
      }
      const tasks = await freelancerTaskService.getMyTasks();
      setMyTasks(tasks);
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Nhận task thất bại!");
    }
  };

  // Cập nhật trạng thái task cá nhân
  const handleUpdateStatus = async (taskId: string, status: "IN_PROGRESS" | "DONE") => {
    try {
      await freelancerTaskService.updateTaskStatus(taskId, status);
      message.success("Cập nhật trạng thái thành công!");
      
      // Tải lại dữ liệu
      const tasks = await freelancerTaskService.getMyTasks();
      setMyTasks(tasks);
      
      if (selectedProject) {
        handleViewProjectTasks(selectedProject);
      }
    } catch (err: any) {
      console.error(err);
      message.error("Cập nhật trạng thái thất bại!");
    }
  };


  // Xử lý tạo task mới (chỉ dành cho leader)
  const handleCreateTask = async (values: any) => {
    if (!selectedProject) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append("projectId", selectedProject.projectId);
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("taskType", values.taskType);
    
    if (values.taskType === "ASSIGNED") {
      const assignedId = values.assignedToSelect;
      if (!assignedId) {
        message.error("Vui lòng chọn Freelancer được chỉ định!");
        setSubmitting(false);
        return;
      }
      formData.append("assignedTo", assignedId);
    }

    if (values.deadline) {
      formData.append("deadline", values.deadline.toISOString());
    }

    if (fileList.length > 0) {
      formData.append("file", fileList[0].originFileObj);
    }

    try {
      await freelancerTaskService.createTask(formData);
      message.success("Tạo công việc thành công!");
      setCreateModalVisible(false);
      createForm.resetFields();
      setFileList([]);
      
      // Reload danh sách task trong dự án
      handleViewProjectTasks(selectedProject);
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Tạo task thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Tính toán số lượng task theo trạng thái cho tab "My Tasks"
  const getMyTasksCount = (status: string) => {
    return myTasks.filter((t) => t.status === status).length;
  };

  // ---------------- BÁO CÁO & FEEDBACK HANDLERS ----------------
  const handleOpenReports = async (task: TaskItem) => {
    setSelectedTaskForReport(task);
    setReportsModalVisible(true);
    try {
      const data = await freelancerTaskService.getReportsByTask(task.taskId);
      setReportsList(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách báo cáo!");
    }
  };

  const handleOpenSubmitReport = (report?: WorkReportItem) => {
    setEditingReport(report || null);
    if (report) {
      reportForm.setFieldsValue({ content: report.content });
    } else {
      reportForm.resetFields();
    }
    setFileList([]);
    setReportFormModalVisible(true);
  };

  const handleSubmitReport = async (values: any) => {
    if (!selectedTaskForReport) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("content", values.content);
    if (fileList.length > 0) {
      formData.append("file", fileList[0].originFileObj);
    }
    
    try {
      if (editingReport) {
        await freelancerTaskService.updateReport(editingReport.id, formData);
        message.success("Sửa báo cáo thành công!");
      } else {
        await freelancerTaskService.submitReport(selectedTaskForReport.taskId, formData);
        message.success("Nộp báo cáo thành công!");
      }
      setReportFormModalVisible(false);
      // reload danh sách báo cáo
      const data = await freelancerTaskService.getReportsByTask(selectedTaskForReport.taskId);
      setReportsList(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi nộp/sửa báo cáo!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenFeedbacks = async (report: WorkReportItem) => {
    setSelectedReportForFeedback(report);
    setFeedbackModalVisible(true);
    try {
      const data = await freelancerTaskService.getReportFeedbacks(report.id);
      setFeedbacksList(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách feedback!");
    }
  };

  const handleSubmitLeaderFeedback = async (values: any) => {
    if (!selectedReportForFeedback) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("feedback", values.feedback);
    if (fileList.length > 0) {
      formData.append("file", fileList[0].originFileObj);
    }
    
    try {
      await freelancerTaskService.submitLeaderFeedback(selectedReportForFeedback.id, formData);
      message.success("Gửi feedback thành công!");
      feedbackForm.resetFields();
      setFileList([]);
      // Reload feedbacks
      const data = await freelancerTaskService.getReportFeedbacks(selectedReportForFeedback.id);
      setFeedbacksList(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi gửi feedback!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Workspace Quản Lý Công Việc
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Nơi bạn quản lý, nhận và theo dõi tiến trình thực hiện công việc của mình trong các dự án.
          </Text>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", height: "300px", alignItems: "center", justifyContent: "center" }}>
          <Spin size="large" tip="Đang tải dữ liệu không gian làm việc..." />
        </div>
      ) : (
        <Tabs
          defaultActiveKey="1"
          type="line"
          size="large"
          style={{ marginBottom: "20px" }}
          tabBarStyle={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          items={[
            {
              key: "1",
              label: (
                <Space>
                  <FolderOutlined />
                  <span>Dự án của tôi</span>
                  <Badge count={joinedProjects.length} overflowCount={99} style={{ backgroundColor: "#11998e" }} />
                </Space>
              ),
              children: (
            <div style={{ marginTop: "16px" }}>
              {joinedProjects.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Space direction="vertical" align="center">
                      <Text type="secondary">Bạn chưa chính thức tham gia dự án nào.</Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Hãy ứng tuyển vào các dự án mở ở mục "Tìm dự án" và chờ Doanh nghiệp chấp thuận nhé!
                      </Text>
                    </Space>
                  }
                />
              ) : (
                <Row gutter={[24, 24]}>
                  {joinedProjects.map((project) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={project.projectId}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: "16px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                          border: project.isLeader ? "1px solid #faad14" : "1px solid rgba(0,0,0,0.05)",
                          position: "relative",
                          overflow: "visible",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        bodyStyle={{ padding: "20px", display: "flex", flexDirection: "column", height: "240px", justifyContent: "space-between" }}
                        onClick={() => handleViewProjectTasks(project)}
                      >
                        {project.isLeader && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-12px",
                              right: "-12px",
                              background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                              color: "#fff",
                              borderRadius: "50%",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              boxShadow: "0 4px 10px rgba(253, 160, 133, 0.5)",
                              zIndex: 10,
                              fontSize: "16px"
                            }}
                            title="Bạn là Leader của dự án này"
                          >
                            <CrownOutlined />
                          </div>
                        )}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <Tag color="cyan" style={{ border: "none", borderRadius: "6px", fontWeight: 600 }}>
                              🏢 {project.companyName}
                            </Tag>
                          </div>
                          
                          <Title level={4} style={{ margin: "0 0 8px 0", fontWeight: 700, fontSize: "16px", color: "#1a0533" }} ellipsis={{ rows: 2 }}>
                            {project.name}
                          </Title>
                          
                          <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: "12px", margin: 0 }}>
                            {project.description || "Chưa có mô tả chi tiết dự án."}
                          </Paragraph>
                        </div>

                        <div>
                          <Divider style={{ margin: "12px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text type="secondary" style={{ fontSize: "10px", display: "block" }}>NGÂN SÁCH DỰ ÁN</Text>
                              <Text strong style={{ color: "#2d1b69", fontSize: "15px" }}>
                                {project.budget ? `${project.budget.toLocaleString()} VND` : "Thương lượng"}
                              </Text>
                            </div>
                            <Button
                              type="primary"
                              size="small"
                              style={{
                                background: "linear-gradient(135deg, #11998e, #38ef7d)",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Xem Task
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
              )
            },
            {
              key: "2",
              label: (
                <Space>
                  <CheckSquareOutlined />
                  <span>Công việc của tôi</span>
                  <Badge count={myTasks.filter(t => t.status !== "DONE").length} style={{ backgroundColor: "#ff4d4f" }} />
                </Space>
              ),
              children: (
            <div style={{ marginTop: "16px" }}>
              {myTasks.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Space direction="vertical" align="center">
                      <Text type="secondary">Bạn chưa được giao hay nhận công việc nào.</Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Hãy vào tab "Dự án của tôi", nhấp vào từng dự án và ấn "Nhận việc" ở các task mở nhé!
                      </Text>
                    </Space>
                  }
                />
              ) : (
                <Row gutter={[24, 24]}>
                  {/* Cột 1: TODO */}
                  <Col xs={24} lg={8}>
                    <div style={{ background: "#edf0f5", padding: "16px", borderRadius: "16px", minHeight: "500px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <Space>
                          <Badge status="default" />
                          <Text strong style={{ color: "#595959", fontSize: "15px" }}>CẦN LÀM (TODO)</Text>
                        </Space>
                        <Tag color="default" style={{ borderRadius: "50%", margin: 0, fontWeight: "bold" }}>
                          {getMyTasksCount("TODO")}
                        </Tag>
                      </div>

                      <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        {myTasks.filter(t => t.status === "TODO").map(task => (
                          <Card
                            key={task.taskId}
                            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", border: "none" }}
                            bodyStyle={{ padding: "16px" }}
                          >
                            <Tag color="purple" style={{ border: "none", fontSize: "10px", marginBottom: "8px" }}>
                              📁 {task.projectName}
                            </Tag>
                            <Title level={5} style={{ margin: "0 0 8px 0", fontWeight: 600 }}>{task.title}</Title>
                            <Paragraph type="secondary" style={{ fontSize: "12px", margin: "0 0 12px 0" }} ellipsis={{ rows: 2 }}>
                              {task.description}
                            </Paragraph>

                            {task.deadline && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", fontSize: "12px", color: "#ff4d4f" }}>
                                <ClockCircleOutlined />
                                <span>Hạn chót: {dayjs(task.deadline).format("DD/MM/YYYY HH:mm")}</span>
                              </div>
                            )}

                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                              {task.fileUrl ? (
                                <Button type="link" size="small" icon={<DownloadOutlined />} href={task.fileUrl} target="_blank" style={{ padding: 0 }}>
                                  Tài liệu
                                </Button>
                              ) : <span />}
                              
                              <Button
                                type="primary"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                style={{ background: "#2d1b69", border: "none", borderRadius: "6px", fontSize: "12px" }}
                                onClick={() => handleUpdateStatus(task.taskId, "IN_PROGRESS")}
                              >
                                Bắt đầu làm
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  </Col>

                  {/* Cột 2: IN_PROGRESS */}
                  <Col xs={24} lg={8}>
                    <div style={{ background: "#e8effc", padding: "16px", borderRadius: "16px", minHeight: "500px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <Space>
                          <Badge status="processing" />
                          <Text strong style={{ color: "#096dd9", fontSize: "15px" }}>ĐANG LÀM (IN PROGRESS)</Text>
                        </Space>
                        <Tag color="processing" style={{ borderRadius: "50%", margin: 0, fontWeight: "bold" }}>
                          {getMyTasksCount("IN_PROGRESS")}
                        </Tag>
                      </div>

                      <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        {myTasks.filter(t => t.status === "IN_PROGRESS").map(task => (
                          <Card
                            key={task.taskId}
                            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", border: "none" }}
                            bodyStyle={{ padding: "16px" }}
                          >
                            <Tag color="purple" style={{ border: "none", fontSize: "10px", marginBottom: "8px" }}>
                              📁 {task.projectName}
                            </Tag>
                            <Title level={5} style={{ margin: "0 0 8px 0", fontWeight: 600 }}>{task.title}</Title>
                            <Paragraph type="secondary" style={{ fontSize: "12px", margin: "0 0 12px 0" }} ellipsis={{ rows: 2 }}>
                              {task.description}
                            </Paragraph>

                            {task.deadline && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", fontSize: "12px", color: "#faad14" }}>
                                <ClockCircleOutlined />
                                <span>Hạn chót: {dayjs(task.deadline).format("DD/MM/YYYY HH:mm")}</span>
                              </div>
                            )}

                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                              {task.fileUrl ? (
                                <Button type="link" size="small" icon={<DownloadOutlined />} href={task.fileUrl} target="_blank" style={{ padding: 0 }}>
                                  Tài liệu
                                </Button>
                              ) : <span />}
                              
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                <Button 
                                  size="small" 
                                  icon={<FileTextOutlined />} 
                                  onClick={() => handleOpenReports(task)}
                                >
                                  Báo cáo & Feedback
                                </Button>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<CheckCircleOutlined />}
                                  style={{ background: "#52c41a", border: "none", borderRadius: "6px", fontSize: "12px" }}
                                  onClick={() => handleUpdateStatus(task.taskId, "DONE")}
                                >
                                  Hoàn thành
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  </Col>

                  {/* Cột 3: DONE */}
                  <Col xs={24} lg={8}>
                    <div style={{ background: "#edf9eb", padding: "16px", borderRadius: "16px", minHeight: "500px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <Space>
                          <Badge status="success" />
                          <Text strong style={{ color: "#389e0d", fontSize: "15px" }}>HOÀN THÀNH (DONE)</Text>
                        </Space>
                        <Tag color="success" style={{ borderRadius: "50%", margin: 0, fontWeight: "bold" }}>
                          {getMyTasksCount("DONE")}
                        </Tag>
                      </div>

                      <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        {myTasks.filter(t => t.status === "DONE").map(task => (
                          <Card
                            key={task.taskId}
                            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", border: "none", opacity: 0.85 }}
                            bodyStyle={{ padding: "16px" }}
                          >
                            <Tag color="purple" style={{ border: "none", fontSize: "10px", marginBottom: "8px" }}>
                              📁 {task.projectName}
                            </Tag>
                            <Title level={5} style={{ margin: "0 0 8px 0", fontWeight: 600, textDecoration: "line-through", color: "#8c8c8c" }}>
                              {task.title}
                            </Title>
                            <Paragraph type="secondary" style={{ fontSize: "12px", margin: "0 0 12px 0" }} ellipsis={{ rows: 2 }}>
                              {task.description}
                            </Paragraph>

                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                              {task.fileUrl ? (
                                <Button type="link" size="small" icon={<DownloadOutlined />} href={task.fileUrl} target="_blank" style={{ padding: 0 }}>
                                  Tài liệu
                                </Button>
                              ) : <span />}
                              
                              <Tag color="success" style={{ border: "none", borderRadius: "4px" }}>✓ Đã xong</Tag>
                            </div>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
              )
            }
          ]}
        />
      )}

      {/* DRAWER XEM DANH SÁCH TASK CỦA DỰ ÁN */}
      <Drawer
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "24px" }}>
            <div>
              <Text type="secondary" style={{ fontSize: "12px", textTransform: "uppercase", display: "block" }}>CHI TIẾT DỰ ÁN</Text>
              <Text strong style={{ fontSize: "18px", color: "#1a0533" }}>{selectedProject?.name}</Text>
            </div>
            {selectedProject?.isLeader && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)", border: "none", borderRadius: "8px" }}
                onClick={() => setCreateModalVisible(true)}
              >
                Tạo Task
              </Button>
            )}
          </div>
        }
        placement="right"
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { background: "#f8f9fc", padding: "24px" } }}
      >
        {projectLoading ? (
          <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
            <Spin tip="Đang tải danh sách task..." />
          </div>
        ) : (
          <div>
            {/* Mô tả dự án */}
            <Card style={{ borderRadius: "12px", marginBottom: "24px", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <Text strong style={{ color: "#2d1b69" }}>MÔ TẢ DỰ ÁN</Text>
                <Tag color="blue" style={{ border: "none" }}>🏢 {selectedProject?.companyName}</Tag>
              </div>
              <Paragraph style={{ margin: 0, color: "#595959" }}>
                {selectedProject?.description || "Chưa có mô tả chi tiết."}
              </Paragraph>
            </Card>

            <Title level={4} style={{ marginBottom: "16px", fontWeight: 700 }}>
              {selectedProject?.isLeader ? "Tất cả công việc trong dự án" : "Công việc có sẵn để nhận"}
            </Title>

            {projectTasks.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  selectedProject?.isLeader
                    ? "Dự án chưa có task nào. Hãy ấn nút 'Tạo Task' để bắt đầu phân chia công việc nhé!"
                    : "Hiện tại không có task trống (OPEN) nào trong dự án để nhận."
                }
              />
            ) : (
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                {projectTasks.map((task) => {
                  const isClaimedByMe = myTasks.some((mt) => mt.taskId === task.taskId);
                  return (
                    <Card
                      key={task.taskId}
                      style={{ borderRadius: "12px", border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
                      bodyStyle={{ padding: "20px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <Title level={5} style={{ margin: 0, fontWeight: 650 }}>{task.title}</Title>
                        </div>
                        <Space>
                          {task.taskType === "OPEN" ? (
                            <Tag color="cyan" style={{ border: "none", borderRadius: "4px" }}>OPEN TASK</Tag>
                          ) : (
                            <Tag color="blue" style={{ border: "none", borderRadius: "4px" }}>ASSIGNED</Tag>
                          )}
                          
                          {task.status === "TODO" && <Tag color="default">Todo</Tag>}
                          {task.status === "IN_PROGRESS" && <Tag color="processing">In Progress</Tag>}
                          {task.status === "DONE" && <Tag color="success">Done</Tag>}
                        </Space>
                      </div>

                      <Paragraph type="secondary" style={{ fontSize: "13px", color: "#7f8c8d" }}>
                        {task.description}
                      </Paragraph>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", margin: "16px 0", fontSize: "12px", color: "#555" }}>
                        {task.deadline && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <CalendarOutlined />
                            <span>Hạn chót: {dayjs(task.deadline).format("DD/MM/YYYY HH:mm")}</span>
                          </div>
                        )}
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <UserOutlined />
                          <span>
                            Người làm:{" "}
                            <strong>
                              {task.assignedToName || (task.taskType === "OPEN" ? "Chưa ai nhận" : "Chỉ định")}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <Divider style={{ margin: "12px 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {task.fileUrl ? (
                          <Button type="link" icon={<DownloadOutlined />} href={task.fileUrl} target="_blank" style={{ padding: 0 }}>
                            Tài liệu đính kèm
                          </Button>
                        ) : <span />}

                        {/* Thành viên nhận việc */}
                        {/* Thành viên và Leader nhận việc (OPEN tasks) */}
                        {task.taskType === "OPEN" && (
                          <Popconfirm
                            title="Bạn chắc chắn muốn nhận công việc này?"
                            onConfirm={() => {
                              if (!task.assignedTo) handleClaimTask(task.taskId);
                            }}
                            okText="Nhận ngay"
                            cancelText="Hủy"
                            disabled={!!task.assignedTo || task.status !== "TODO"}
                          >
                            <Button
                              type="primary"
                              size="small"
                              disabled={!!task.assignedTo || task.status !== "TODO"}
                              style={{ 
                                background: (task.assignedTo || task.status !== "TODO") ? "#d9d9d9" : "#11998e", 
                                border: "none", 
                                borderRadius: "6px", 
                                fontWeight: 600,
                                color: (task.assignedTo || task.status !== "TODO") ? "#888" : "#fff"
                              }}
                            >
                              {task.assignedTo ? "Đã có người nhận" : "Nhận việc"}
                            </Button>
                          </Popconfirm>
                        )}

                        {/* Hiển thị nếu đã nhận */}
                        {isClaimedByMe && (
                          <Tag color="success" style={{ fontSize: "12px", border: "none", borderRadius: "4px" }}>
                            ✓ Bạn đã nhận task này
                          </Tag>
                        )}
                        <Button 
                          size="small" 
                          icon={<FileTextOutlined />} 
                          onClick={() => handleOpenReports(task)}
                          disabled={task.status === "TODO"}
                        >
                          Báo cáo & Feedback
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </Space>
            )}
          </div>
        )}
      </Drawer>

      {/* MODAL TẠO TASK (CHỈ DÀNH CHO LEADER) */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: "#11998e" }} />
            <span style={{ fontWeight: 700 }}>Tạo Công Việc Mới</span>
          </Space>
        }
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTask}
          initialValues={{ taskType: "OPEN" }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề công việc"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Ví dụ: Thiết kế giao diện trang chủ" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết yêu cầu"
          >
            <Input.TextArea rows={4} placeholder="Mô tả kỹ các bước cần thực hiện, kết quả mong đợi..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="taskType"
                label="Loại công việc"
                rules={[{ required: true }]}
              >
                <Select onChange={(val) => setTaskTypeVal(val)}>
                  <Select.Option value="OPEN">OPEN (Ai cũng có thể nhận)</Select.Option>
                  <Select.Option value="ASSIGNED">ASSIGNED (Chỉ định thành viên)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="Hạn hoàn thành (Deadline)"
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  disabledDate={(current) => current && current < dayjs().endOf("day")}
                  placeholder="Chọn hạn hoàn thành"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Nếu chọn ASSIGNED -> Hiện dropdown danh sách project members */}
          {taskTypeVal === "ASSIGNED" && (
            <Card style={{ background: "#f8f9fb", border: "1px dashed #d9d9d9", marginBottom: "20px", borderRadius: "8px" }} size="small">
              <Form.Item
                name="assignedToSelect"
                label={
                  <Space>
                    <span>Chỉ định người thực hiện</span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn thành viên!" }]}
              >
                <Select placeholder="Chọn thành viên dự án">
                  {projectMembers.map((m) => (
                    <Select.Option key={m.freelancerId} value={m.freelancerId}>
                      👤 {m.freelancerName} {m.isLeader ? "(Leader)" : ""}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          )}

          {/* Đính kèm file */}
          <Form.Item label="Tài liệu/File đính kèm (nếu có)">
            <Upload.Dragger
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))} // chỉ cho phép 1 file
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#11998e" }} />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả tệp tin vào đây</p>
              <p className="ant-upload-hint">Hỗ trợ tệp đính kèm mô tả công việc (tối đa 10MB).</p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item style={{ margin: "24px 0 0 0", textAlign: "right" }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                createForm.resetFields();
                setFileList([]);
              }}>
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)", border: "none", borderRadius: "6px" }}
              >
                Tạo Task
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL QUẢN LÝ BÁO CÁO */}
      <Modal
        title={
          <Space>
            <FileDoneOutlined style={{ color: "#11998e" }} />
            <span style={{ fontWeight: 700 }}>Báo cáo công việc: {selectedTaskForReport?.title}</span>
          </Space>
        }
        open={reportsModalVisible}
        onCancel={() => setReportsModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
           {/* Chỉ người được giao task mới được quyền viết báo cáo */}
           {(selectedTaskForReport?.assignedTo === user?.id || myTasks.some(t => t.taskId === selectedTaskForReport?.taskId)) && selectedTaskForReport?.status === "IN_PROGRESS" && (
             <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenSubmitReport()}>
               Viết báo cáo mới
             </Button>
           )}
        </div>
        
        {reportsList.length === 0 ? (
          <Empty description="Chưa có báo cáo nào cho task này" />
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            {reportsList.map(report => (
              <Card key={report.id} size="small" style={{ border: "1px solid #e8e8e8", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <Text strong>{report.reporterName}</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {dayjs(report.reportedAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
                <Paragraph>{report.content}</Paragraph>
                
                <Space style={{ width: "100%", justifyContent: "space-between", marginTop: "12px" }}>
                  {report.fileUrl ? (
                    <Button type="link" size="small" icon={<DownloadOutlined />} href={report.fileUrl} target="_blank">
                      File đính kèm
                    </Button>
                  ) : <span />}
                  
                  <Space>
                    {/* Chỉ người tạo báo cáo và task IN_PROGRESS mới được sửa */}
                    {(selectedTaskForReport?.assignedTo === user?.id || myTasks.some(t => t.taskId === selectedTaskForReport?.taskId)) && selectedTaskForReport?.status === "IN_PROGRESS" && (
                      <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenSubmitReport(report)}>
                        Sửa
                      </Button>
                    )}
                    <Button size="small" type="primary" ghost icon={<MessageOutlined />} onClick={() => handleOpenFeedbacks(report)}>
                      Xem Feedback
                    </Button>
                  </Space>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Modal>

      {/* MODAL VIẾT/SỬA BÁO CÁO */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>{editingReport ? "Sửa báo cáo" : "Viết báo cáo mới"}</span>}
        open={reportFormModalVisible}
        onCancel={() => setReportFormModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={reportForm} layout="vertical" onFinish={handleSubmitReport}>
          <Form.Item name="content" label="Nội dung báo cáo" rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="File đính kèm (không bắt buộc)">
            <Upload.Dragger beforeUpload={() => false} fileList={fileList} onChange={({ fileList }) => setFileList(fileList.slice(-1))}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả file</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item style={{ textAlign: "right", margin: 0 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>Lưu báo cáo</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL XEM & VIẾT FEEDBACK */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>Feedback Báo Cáo</span>}
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
        width={600}
      >
        {feedbacksList.length === 0 ? (
          <Empty description="Chưa có feedback nào cho báo cáo này" />
        ) : (
          <Space direction="vertical" style={{ width: "100%", maxHeight: "400px", overflowY: "auto", marginBottom: "16px" }}>
            {feedbacksList.map(fb => (
              <Card key={fb.id} size="small" style={{ background: fb.type === "COMPANY_TO_LEADER" ? "#fff1f0" : "#f0f5ff", border: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>{fb.authorName} <Tag color={fb.type === "COMPANY_TO_LEADER" ? "red" : "blue"} style={{ marginLeft: "8px"}}>{fb.type === "COMPANY_TO_LEADER" ? "Công ty" : "Leader"}</Tag></Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>{dayjs(fb.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                </div>
                <Paragraph style={{ marginTop: "8px", marginBottom: "8px" }}>{fb.content}</Paragraph>
                {fb.fileUrl && <a href={fb.fileUrl} target="_blank" rel="noreferrer">📎 File đính kèm</a>}
              </Card>
            ))}
          </Space>
        )}
        
        {/* Form viết feedback chỉ hiện cho Leader */}
        {selectedProject?.isLeader && (
          <Form form={feedbackForm} layout="vertical" onFinish={handleSubmitLeaderFeedback}>
            <Divider>Viết Feedback cho Freelancer</Divider>
            <Form.Item name="feedback" rules={[{ required: true, message: "Vui lòng nhập feedback!" }]}>
              <Input.TextArea rows={3} placeholder="Nhập feedback của Leader..." />
            </Form.Item>
            <Form.Item>
              <Upload beforeUpload={() => false} fileList={fileList} onChange={({ fileList }) => setFileList(fileList.slice(-1))}>
                <Button icon={<PlusOutlined />}>Đính kèm File</Button>
              </Upload>
            </Form.Item>
            <Form.Item style={{ textAlign: "right", margin: 0 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>Gửi Feedback</Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

    </div>
  );
};

export default FreelancerTasksPage;
