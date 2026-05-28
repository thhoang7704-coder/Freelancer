import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CrownOutlined,
  EyeOutlined,
  PlusOutlined,
  ProjectOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  companyProjectService,
  type CompanyProject,
  type CompanyProjectMember,
  type CompanyTeam,
  type CompanyTeamMember,
} from "../service/companyProjectService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const { Search } = Input;

const progressMap: Record<string, { color: string; label: string }> = {
  TODO: { color: "default", label: "Chưa bắt đầu" },
  IN_PROGRESS: { color: "processing", label: "Đang thực hiện" },
  DONE: { color: "success", label: "Hoàn thành" },
};

const paymentMap: Record<string, { color: string; label: string }> = {
  UNPAID: { color: "default", label: "Chưa thanh toán" },
  PARTIAL: { color: "gold", label: "Thanh toán một phần" },
  PAID: { color: "green", label: "Đã thanh toán" },
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Không có";

const getMemberName = (member: CompanyTeamMember) =>
  member.fullName || member.freelancerName || "Không có tên";

export const CompanyFreelancersPage: React.FC = () => {
  const [teams, setTeams] = useState<CompanyTeam[]>([]);
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<CompanyTeam | null>(null);
  const [projectMembers, setProjectMembers] = useState<CompanyProjectMember[]>([]);
  const [createProjectMembers, setCreateProjectMembers] = useState<
    CompanyProjectMember[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [addMemberId, setAddMemberId] = useState<string>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createProjectId, setCreateProjectId] = useState<string>();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [createMemberLoading, setCreateMemberLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const [data, projectData] = await Promise.all([
        companyProjectService.getTeams(),
        companyProjectService.getProjects(),
      ]);
      setTeams(data);
      setProjects(projectData);

      setSelectedTeam((current) => {
        if (!current) return current;
        return data.find((team) => team.teamId === current.teamId) || null;
      });
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTeams();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTeams]);

  const openTeamModal = async (team: CompanyTeam) => {
    setSelectedTeam(team);
    setAddMemberId(undefined);

    try {
      setMemberLoading(true);
      const members = await companyProjectService.getProjectMembers(team.project.projectId);
      setProjectMembers(members);
    } catch (err) {
      setProjectMembers([]);
      message.error(parseApiError(err));
    } finally {
      setMemberLoading(false);
    }
  };

  const closeTeamModal = () => {
    setSelectedTeam(null);
    setProjectMembers([]);
    setAddMemberId(undefined);
  };

  const resetCreateModal = () => {
    setCreateModalOpen(false);
    setCreateProjectId(undefined);
    setCreateProjectMembers([]);
    setTeamName("");
  };

  const refreshSelectedTeam = async () => {
    const data = await companyProjectService.getTeams();
    setTeams(data);
    setSelectedTeam((current) => {
      if (!current) return null;
      return data.find((team) => team.teamId === current.teamId) || null;
    });
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !addMemberId) {
      message.warning("Chọn freelancer cần thêm vào team");
      return;
    }

    try {
      setActionLoading(true);
      await companyProjectService.addTeamMember(selectedTeam.teamId, addMemberId);
      message.success("Đã thêm thành viên vào team");
      setAddMemberId(undefined);
      await refreshSelectedTeam();
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectCreateProject = async (projectId: string) => {
    const project = projects.find((item) => item.projectId === projectId);

    setCreateProjectId(projectId);
    setTeamName(project ? `Team ${project.projectName}` : "");
    setCreateProjectMembers([]);

    try {
      setCreateMemberLoading(true);
      const members = await companyProjectService.getProjectMembers(projectId);
      setCreateProjectMembers(members);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setCreateMemberLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    const firstMember = createProjectMembers[0];

    if (!createProjectId) {
      message.warning("Chọn dự án cần tạo team");
      return;
    }

    if (!teamName.trim()) {
      message.warning("Nhập tên team");
      return;
    }

    if (!firstMember) {
      message.warning("Dự án chưa có freelancer đã được duyệt để làm leader");
      return;
    }

    try {
      setCreateLoading(true);
      await companyProjectService.createTeam({
        projectId: createProjectId,
        name: teamName.trim(),
        memberIds: [firstMember.freelancerId],
        leaderId: firstMember.freelancerId,
      });
      message.success("Đã tạo team và gán freelancer đầu tiên làm leader");
      resetCreateModal();
      await loadTeams();
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSetLeader = (member: CompanyTeamMember) => {
    if (!selectedTeam) return;

    Modal.confirm({
      title: "Đặt leader mới?",
      content: `${getMemberName(member)} sẽ trở thành leader của team ${selectedTeam.teamName}.`,
      okText: "Set leader",
      cancelText: "Hủy",
      async onOk() {
        try {
          setActionLoading(true);
          await companyProjectService.setTeamLeader(
            selectedTeam.teamId,
            member.freelancerId
          );
          message.success("Đã cập nhật leader");
          await refreshSelectedTeam();
        } catch (err) {
          message.error(parseApiError(err));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const filteredTeams = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return teams;

    return teams.filter((team) =>
      [
        team.teamName,
        team.project?.projectName,
        team.members.map(getMemberName).join(" "),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [teams, searchText]);

  const availableProjectMembers = useMemo(() => {
    if (!selectedTeam) return [];

    const teamFreelancerIds = new Set(
      selectedTeam.members.map((member) => member.freelancerId)
    );

    return projectMembers.filter(
      (member) => !teamFreelancerIds.has(member.freelancerId)
    );
  }, [projectMembers, selectedTeam]);

  const projectsWithoutTeam = useMemo(() => {
    const projectIdsWithTeam = new Set(teams.map((team) => team.project.projectId));

    return projects.filter((project) => !projectIdsWithTeam.has(project.projectId));
  }, [projects, teams]);

  const firstCreateMember = createProjectMembers[0];

  const memberColumns: ColumnsType<CompanyTeamMember> = [
    {
      title: "Thành viên",
      key: "member",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#1677ff" }} />
          <div>
            <Text strong>{getMemberName(record)}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email || record.freelancerId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 150,
      render: (_, record) =>
        record.isLeader ? (
          <Tag color="gold" icon={<CrownOutlined />}>
            Leader
          </Tag>
        ) : (
          <Tag color="blue">Member</Tag>
        ),
    },
    {
      title: "Ngày vào",
      dataIndex: "joinedAt",
      key: "joinedAt",
      width: 130,
      render: formatDate,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 130,
      render: (_, record) =>
        record.isLeader ? (
          <Text type="secondary">Đang là leader</Text>
        ) : (
          <Button
            size="small"
            icon={<CrownOutlined />}
            loading={actionLoading}
            onClick={() => handleSetLeader(record)}
          >
            Set leader
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng team",
            value: teams.length,
            icon: <TeamOutlined />,
            color: "#1677ff",
          },
          {
            title: "Dự án có team",
            value: new Set(teams.map((team) => team.project.projectId)).size,
            icon: <ProjectOutlined />,
            color: "#52c41a",
          },
          {
            title: "Tổng thành viên",
            value: teams.reduce((total, team) => total + team.members.length, 0),
            icon: <UserOutlined />,
            color: "#722ed1",
          },
          {
            title: "Leader",
            value: teams.reduce(
              (total, team) =>
                total + team.members.filter((member) => member.isLeader).length,
              0
            ),
            icon: <CrownOutlined />,
            color: "#faad14",
          },
        ].map((stat) => (
          <Col xs={24} sm={12} xl={6} key={stat.title}>
            <Card
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Team theo dự án
          </Title>
          <Text type="secondary">
            Xem team, thêm thành viên đã thuộc dự án và chuyển quyền leader.
          </Text>
        </div>

        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Tạo team
          </Button>
          <Search
            placeholder="Tìm team, dự án, thành viên..."
            allowClear
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <Button icon={<ReloadOutlined />} onClick={loadTeams} loading={loading}>
            Tải lại
          </Button>
        </Space>
      </div>

      {filteredTeams.length === 0 && !loading ? (
        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Empty description="Chưa có team nào" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTeams.map((team) => {
            const leader = team.members.find((member) => member.isLeader);
            const progress = progressMap[team.project.progressStatus];
            const payment = paymentMap[team.project.paymentStatus];

            return (
              <Col xs={24} md={12} xl={8} xxl={6} key={team.teamId}>
                <Card
                  hoverable
                  bordered={false}
                  loading={loading}
                  style={{
                    borderRadius: 8,
                    minHeight: 260,
                    height: "100%",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                  bodyStyle={{ height: "100%", display: "flex", flexDirection: "column" }}
                  onClick={() => openTeamModal(team)}
                >
                  <Space align="start" style={{ width: "100%", marginBottom: 14 }}>
                    <Avatar
                      size={46}
                      icon={<TeamOutlined />}
                      style={{ background: "#1677ff", flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Tooltip title={team.teamName}>
                        <Title
                          level={5}
                          ellipsis
                          style={{ margin: 0, lineHeight: 1.25 }}
                        >
                          {team.teamName}
                        </Title>
                      </Tooltip>
                      <Text type="secondary" ellipsis style={{ display: "block" }}>
                        <ProjectOutlined /> {team.project.projectName}
                      </Text>
                    </div>
                  </Space>

                  <Space wrap size={[4, 6]} style={{ marginBottom: 12 }}>
                    <Tag color={progress?.color || "default"}>
                      {progress?.label || team.project.progressStatus}
                    </Tag>
                    <Tag color={payment?.color || "default"}>
                      {payment?.label || team.project.paymentStatus}
                    </Tag>
                  </Space>

                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary">Leader</Text>
                    <div>
                      {leader ? (
                        <Tag color="gold" icon={<CrownOutlined />}>
                          {getMemberName(leader)}
                        </Tag>
                      ) : (
                        <Text type="secondary">Chưa có leader</Text>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <Statistic
                      title="Thành viên"
                      value={team.members.length}
                      valueStyle={{ fontSize: 22 }}
                    />
                    <Statistic
                      title="Deadline"
                      value={formatDate(team.project.deadline)}
                      valueStyle={{ fontSize: 14 }}
                    />
                  </div>

                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    block
                    style={{ marginTop: "auto" }}
                  >
                    Xem team
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal
        title="Tạo team cho dự án"
        open={createModalOpen}
        onCancel={resetCreateModal}
        onOk={handleCreateTeam}
        okText="Tạo team"
        cancelText="Hủy"
        confirmLoading={createLoading}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Dự án chưa có team</Text>
            <Select
              showSearch
              value={createProjectId}
              placeholder="Chọn dự án"
              style={{ width: "100%", marginTop: 8 }}
              optionFilterProp="label"
              onChange={handleSelectCreateProject}
              options={projectsWithoutTeam.map((project) => ({
                label: project.projectName,
                value: project.projectId,
              }))}
              notFoundContent="Không còn dự án nào chưa có team"
            />
          </div>

          <div>
            <Text strong>Tên team</Text>
            <Input
              value={teamName}
              placeholder="Nhập tên team"
              style={{ marginTop: 8 }}
              onChange={(event) => setTeamName(event.target.value)}
            />
          </div>

          <Card
            bordered={false}
            loading={createMemberLoading}
            style={{ background: "#f5f7fb", borderRadius: 8 }}
          >
            <Text type="secondary">Leader tự động</Text>
            <div style={{ marginTop: 8 }}>
              {firstCreateMember ? (
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ background: "#faad14" }} />
                  <div>
                    <Text strong>{firstCreateMember.freelancerName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Freelancer đầu tiên trong danh sách đã duyệt của dự án
                    </Text>
                  </div>
                </Space>
              ) : (
                <Text type="secondary">
                  Chọn dự án để lấy freelancer đầu tiên. Dự án cần có ít nhất một
                  freelancer đã được duyệt.
                </Text>
              )}
            </div>
          </Card>
        </Space>
      </Modal>

      <Modal
        title={selectedTeam ? selectedTeam.teamName : "Chi tiết team"}
        open={!!selectedTeam}
        onCancel={closeTeamModal}
        width={920}
        footer={null}
        destroyOnHidden
      >
        {selectedTeam && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card bordered={false} style={{ background: "#f5f7fb", borderRadius: 8 }}>
              <Row gutter={[16, 12]}>
                <Col xs={24} md={10}>
                  <Text type="secondary">Dự án</Text>
                  <Title level={5} style={{ margin: 0 }}>
                    {selectedTeam.project.projectName}
                  </Title>
                </Col>
                <Col xs={12} md={5}>
                  <Text type="secondary">Tiến độ</Text>
                  <br />
                  <Tag color={progressMap[selectedTeam.project.progressStatus]?.color || "default"}>
                    {progressMap[selectedTeam.project.progressStatus]?.label ||
                      selectedTeam.project.progressStatus}
                  </Tag>
                </Col>
                <Col xs={12} md={5}>
                  <Text type="secondary">Thanh toán</Text>
                  <br />
                  <Tag color={paymentMap[selectedTeam.project.paymentStatus]?.color || "default"}>
                    {paymentMap[selectedTeam.project.paymentStatus]?.label ||
                      selectedTeam.project.paymentStatus}
                  </Tag>
                </Col>
                <Col xs={24} md={4}>
                  <Text type="secondary">Deadline</Text>
                  <br />
                  <Text strong>{formatDate(selectedTeam.project.deadline)}</Text>
                </Col>
              </Row>
            </Card>

            <div>
              <Title level={5}>Thêm thành viên</Title>
              <Space.Compact style={{ width: "100%" }}>
                <Select
                  showSearch
                  allowClear
                  value={addMemberId}
                  loading={memberLoading}
                  placeholder="Chọn freelancer đã thuộc dự án"
                  style={{ width: "100%" }}
                  optionFilterProp="label"
                  onChange={setAddMemberId}
                  options={availableProjectMembers.map((member) => ({
                    label: member.freelancerName,
                    value: member.freelancerId,
                  }))}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  loading={actionLoading}
                  onClick={handleAddMember}
                >
                  Thêm
                </Button>
              </Space.Compact>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Chỉ thêm được freelancer đã được duyệt vào dự án nhưng chưa thuộc team này.
              </Text>
            </div>

            <Table
              columns={memberColumns}
              dataSource={selectedTeam.members}
              rowKey="memberId"
              loading={loading || actionLoading}
              pagination={false}
              locale={{ emptyText: "Team chưa có thành viên" }}
            />
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default CompanyFreelancersPage;
