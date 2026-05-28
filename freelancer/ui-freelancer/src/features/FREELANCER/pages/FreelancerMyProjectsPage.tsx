import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Select,
  message,
  Skeleton,
  Empty,
  Badge,
  Button
} from "antd";
import {
  CrownOutlined,
  ProjectOutlined,
  CalendarOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { freelancerTaskService, type ProjectItem } from "../service/freelancerTaskService";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

export const FreelancerMyProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const joinedProjects = await freelancerTaskService.getJoinedProjects();
      
      // Kiểm tra leader cho từng project
      const projectsWithLeaderStatus = await Promise.all(
        joinedProjects.map(async (p) => {
          const isLeader = await freelancerTaskService.checkIsLeader(p.projectId);
          return { ...p, isLeader };
        })
      );
      
      setProjects(projectsWithLeaderStatus);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dự án:", error);
      message.error("Không thể tải danh sách dự án.");
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = (projectId: string, value: "TODO" | "IN_PROGRESS" | "DONE") => {
    setProjects((prev) =>
      prev.map((p) => (p.projectId === projectId ? { ...p, progressStatus: value } : p))
    );
  };

  const handleSaveProgress = async (project: ProjectItem) => {
    try {
      setSavingProgress(project.projectId);
      await freelancerTaskService.updateProjectProgress(project.projectId, project.progressStatus);
      message.success(`Đã cập nhật tiến độ dự án "${project.name}"`);
    } catch (error: any) {
      console.error("Lỗi cập nhật tiến độ:", error);
      message.error(error.response?.data?.message || "Không thể cập nhật tiến độ.");
    } finally {
      setSavingProgress(null);
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "DONE": return "success";
      case "IN_PROGRESS": return "processing";
      case "TODO": default: return "default";
    }
  };

  const getProgressText = (status: string) => {
    switch (status) {
      case "DONE": return "Hoàn thành";
      case "IN_PROGRESS": return "Đang thực hiện";
      case "TODO": default: return "Cần làm";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 20 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1a0533" }}>
          Dự án của tôi
        </Title>
        <Text type="secondary">
          Quản lý các dự án bạn đã tham gia và cập nhật tiến độ (dành cho Leader).
        </Text>
      </div>

      {projects.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Bạn chưa tham gia dự án nào."
        />
      ) : (
        <Row gutter={[24, 24]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.projectId}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  border: project.isLeader ? "1px solid #faad14" : "1px solid rgba(0,0,0,0.05)",
                  position: "relative",
                  overflow: "visible",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}
                bodyStyle={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}
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
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 4px 10px rgba(253, 160, 133, 0.5)",
                      zIndex: 10,
                      fontSize: "18px"
                    }}
                    title="Bạn là Leader của dự án này"
                  >
                    <CrownOutlined />
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <Tag color="cyan" style={{ border: "none", borderRadius: "6px", fontWeight: 600 }}>
                    🏢 {project.companyName}
                  </Tag>
                  {!project.isLeader && (
                    <Tag color={getProgressColor(project.progressStatus)}>
                      {getProgressText(project.progressStatus)}
                    </Tag>
                  )}
                </div>

                <Title level={4} style={{ margin: "0 0 8px 0", fontWeight: 700, fontSize: "18px", color: "#1a0533" }} ellipsis={{ rows: 2 }}>
                  {project.name}
                </Title>

                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: "13px", margin: 0, flex: 1 }}>
                  {project.description || "Chưa có mô tả chi tiết."}
                </Paragraph>

                <div style={{ marginTop: "16px", padding: "12px", background: "#f8f9fa", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <CalendarOutlined style={{ color: "#8c8c8c", marginRight: "8px" }} />
                    <Text type="secondary" style={{ fontSize: "12px" }}>Hạn chót: </Text>
                    <Text strong style={{ marginLeft: "4px", fontSize: "12px" }}>
                      {project.deadline ? dayjs(project.deadline).format("DD/MM/YYYY") : "Chưa xác định"}
                    </Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ProjectOutlined style={{ color: "#8c8c8c", marginRight: "8px" }} />
                    <Text type="secondary" style={{ fontSize: "12px" }}>Ngân sách: </Text>
                    <Text strong style={{ color: "#2d1b69", marginLeft: "4px", fontSize: "13px" }}>
                      {project.budget ? `${project.budget.toLocaleString()} VND` : "Thương lượng"}
                    </Text>
                  </div>
                </div>

                {project.isLeader && (
                  <div style={{ marginTop: "16px", borderTop: "1px dashed #e8e8e8", paddingTop: "16px" }}>
                    <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>
                      Cập nhật tiến độ dự án
                    </Text>
                    <Space.Compact style={{ width: "100%" }}>
                      <Select
                        value={project.progressStatus}
                        onChange={(val) => handleProgressChange(project.projectId, val)}
                        style={{ width: "calc(100% - 40px)" }}
                        options={[
                          { value: "TODO", label: "Cần làm" },
                          { value: "IN_PROGRESS", label: "Đang thực hiện" },
                          { value: "DONE", label: "Hoàn thành" },
                        ]}
                      />
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />} 
                        onClick={() => handleSaveProgress(project)}
                        loading={savingProgress === project.projectId}
                        style={{ background: "#11998e", borderColor: "#11998e" }}
                      />
                    </Space.Compact>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default FreelancerMyProjectsPage;
