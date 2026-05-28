import React, { useEffect, useState } from "react";
import {
  Card, Row, Col, Typography, Tag, Avatar, Empty, Spin,
  Badge, Tooltip, Divider, Space
} from "antd";
import {
  TeamOutlined, UserOutlined, CrownOutlined,
  ProjectOutlined, CalendarOutlined, DollarOutlined,
  CheckCircleOutlined, ClockCircleOutlined, SyncOutlined
} from "@ant-design/icons";
import axiosInstance from "../../../lib/axios";

const { Title, Text } = Typography;

interface TeamProjectInfo {
  projectId: string;
  projectName: string;
  budget: number;
  deadline: string;
  status: string;
  progressStatus: string;
  paymentStatus: string;
}

interface TeamMember {
  memberId: string;
  freelancerId: string;
  fullName: string;
  email: string;
  isLeader: boolean;
  joinedAt: string;
}

interface TeamItem {
  teamId: string;
  teamName: string;
  project: TeamProjectInfo;
  members: TeamMember[];
  createdAt: string;
}

const progressColors: Record<string, string> = {
  NOT_STARTED: "default",
  IN_PROGRESS: "processing",
  COMPLETED: "success",
  ON_HOLD: "warning",
};

const progressLabels: Record<string, string> = {
  NOT_STARTED: "Chưa bắt đầu",
  IN_PROGRESS: "Đang tiến hành",
  COMPLETED: "Hoàn thành",
  ON_HOLD: "Tạm dừng",
};

const statusColors: Record<string, string> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "error",
};

const statusLabels: Record<string, string> = {
  APPROVED: "Đã duyệt",
  PENDING: "Chờ duyệt",
  REJECTED: "Từ chối",
};

export const FreelancerTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/freelancers/my-teams");
      setTeams(res.data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch teams", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
        <Spin size="large" tip="Đang tải danh sách team..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Title level={4} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 10, color: "#1677ff" }} />
          Team của tôi
        </Title>
        <Text type="secondary">
          Tất cả các team bạn đang tham gia — {teams.length} team
        </Text>
      </div>

      {teams.length === 0 ? (
        <Card
          bordered={false}
          style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: "#999" }}>
                Bạn chưa tham gia team nào. Hãy ứng tuyển vào một dự án để bắt đầu!
              </span>
            }
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {teams.map((team) => (
            <Card
              key={team.teamId}
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              {/* Top color bar */}
              <div
                style={{
                  height: 5,
                  background: "linear-gradient(90deg, #1677ff 0%, #36cfc9 100%)",
                  margin: "-24px -24px 20px",
                }}
              />

              <Row gutter={[24, 16]}>
                {/* Team info */}
                <Col xs={24} md={8}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #1677ff, #36cfc9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <TeamOutlined style={{ color: "#fff", fontSize: 22 }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>{team.teamName}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {new Date(team.createdAt).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                  </div>

                  {/* Members */}
                  <Divider style={{ margin: "12px 0" }} />
                  <Text strong style={{ fontSize: 13, color: "#666", marginBottom: 8, display: "block" }}>
                    <UserOutlined style={{ marginRight: 6 }} />
                    Thành viên ({team.members.length})
                  </Text>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {team.members.map((member) => (
                      <div
                        key={member.memberId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: member.isLeader ? "rgba(22,119,255,0.06)" : "#fafafa",
                          border: member.isLeader ? "1px solid #91caff" : "1px solid #f0f0f0",
                        }}
                      >
                        <Avatar
                          size={32}
                          icon={<UserOutlined />}
                          style={{
                            background: member.isLeader
                              ? "linear-gradient(135deg, #1677ff, #36cfc9)"
                              : "#d9d9d9",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Text strong style={{ fontSize: 13 }}>{member.fullName}</Text>
                            {member.isLeader && (
                              <Tooltip title="Trưởng nhóm">
                                <CrownOutlined style={{ color: "#faad14", fontSize: 12 }} />
                              </Tooltip>
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: 11 }}>{member.email}</Text>
                        </div>
                        {member.isLeader && (
                          <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>Leader</Tag>
                        )}
                      </div>
                    ))}
                  </div>
                </Col>

                {/* Divider */}
                <Col xs={0} md={1} style={{ display: "flex", justifyContent: "center" }}>
                  <Divider type="vertical" style={{ height: "100%" }} />
                </Col>

                {/* Project info */}
                <Col xs={24} md={15}>
                  <div style={{ marginBottom: 12 }}>
                    <Space align="center" style={{ marginBottom: 8 }}>
                      <ProjectOutlined style={{ color: "#1677ff", fontSize: 18 }} />
                      <Text strong style={{ fontSize: 17 }}>{team.project.projectName}</Text>
                    </Space>
                    <br />
                    <Space wrap style={{ marginTop: 6 }}>
                      <Tag
                        color={statusColors[team.project.status] ?? "default"}
                        icon={<CheckCircleOutlined />}
                      >
                        {statusLabels[team.project.status] ?? team.project.status}
                      </Tag>
                      <Badge
                        status={progressColors[team.project.progressStatus] as any}
                        text={
                          <Tag
                            color={progressColors[team.project.progressStatus] ?? "default"}
                            icon={<SyncOutlined />}
                          >
                            {progressLabels[team.project.progressStatus] ?? team.project.progressStatus}
                          </Tag>
                        }
                      />
                    </Space>
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  <Row gutter={[16, 12]}>
                    <Col xs={24} sm={12}>
                      <div
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #e6f4ff, #f0f5ff)",
                          border: "1px solid #d6e4ff",
                        }}
                      >
                        <DollarOutlined style={{ color: "#1677ff", marginBottom: 4, display: "block" }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>Ngân sách dự án</Text>
                        <br />
                        <Text strong style={{ fontSize: 18, color: "#1677ff" }}>
                          {team.project.budget != null
                            ? team.project.budget.toLocaleString("vi-VN") + " ₫"
                            : "Chưa xác định"}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #fffbe6, #fff7e6)",
                          border: "1px solid #ffe58f",
                        }}
                      >
                        <ClockCircleOutlined style={{ color: "#faad14", marginBottom: 4, display: "block" }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>Hạn chót</Text>
                        <br />
                        <Text strong style={{ fontSize: 16, color: "#fa8c16" }}>
                          {team.project.deadline
                            ? new Date(team.project.deadline).toLocaleDateString("vi-VN")
                            : "Chưa xác định"}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: 12,
                          background: "#f6ffed",
                          border: "1px solid #b7eb8f",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}>Thanh toán</Text>
                        <br />
                        <Tag
                          color={
                            team.project.paymentStatus === "PAID"
                              ? "success"
                              : team.project.paymentStatus === "PARTIAL"
                              ? "processing"
                              : "warning"
                          }
                          style={{ marginTop: 4 }}
                        >
                          {team.project.paymentStatus === "PAID"
                            ? "Đã thanh toán"
                            : team.project.paymentStatus === "PARTIAL"
                            ? "Thanh toán một phần"
                            : "Chưa thanh toán"}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerTeamsPage;
