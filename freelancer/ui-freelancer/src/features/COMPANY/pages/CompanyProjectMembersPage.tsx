import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CrownOutlined,
  DeleteOutlined,
  EyeOutlined,
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
} from "../service/companyProjectService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const { Search } = Input;

const statusMap: Record<string, { color: string; label: string }> = {
  PENDING: { color: "orange", label: "Chờ duyệt" },
  APPROVED: { color: "green", label: "Đã duyệt" },
  REJECTED: { color: "red", label: "Từ chối" },
};

const progressMap: Record<string, { color: string; label: string }> = {
  TODO: { color: "default", label: "Chưa bắt đầu" },
  IN_PROGRESS: { color: "processing", label: "Đang thực hiện" },
  DONE: { color: "success", label: "Hoàn thành" },
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Không có";

export const CompanyProjectMembersPage: React.FC = () => {
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [members, setMembers] = useState<CompanyProjectMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.projectId === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const loadMembers = useCallback(async (projectId: string) => {
    try {
      setLoadingMembers(true);
      const data = await companyProjectService.getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      setMembers([]);
      message.error(parseApiError(err));
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const data = await companyProjectService.getProjects();
      setProjects(data);

      const firstProject = data[0];
      if (firstProject) {
        setSelectedProjectId(firstProject.projectId);
        await loadMembers(firstProject.projectId);
      } else {
        setSelectedProjectId(null);
        setMembers([]);
      }
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoadingProjects(false);
    }
  }, [loadMembers]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadProjects();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProjects]);

  const handleSelectProject = async (project: CompanyProject) => {
    setSelectedProjectId(project.projectId);
    await loadMembers(project.projectId);
  };

  const handleRemoveMember = (member: CompanyProjectMember) => {
    if (!selectedProjectId) return;

    Modal.confirm({
      title: "Xóa thành viên khỏi dự án?",
      content: `Bạn có muốn xóa ${member.freelancerName} khỏi dự án ${
        selectedProject?.projectName || ""
      } không?`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      async onOk() {
        try {
          setDeletingMemberId(member.memberId);
          await companyProjectService.removeProjectMember(
            selectedProjectId,
            member.memberId
          );
          message.success("Đã xóa thành viên khỏi dự án");
          await loadMembers(selectedProjectId);
          const projectData = await companyProjectService.getProjects();
          setProjects(projectData);
        } catch (err) {
          message.error(parseApiError(err));
        } finally {
          setDeletingMemberId(null);
        }
      },
    });
  };

  const filteredProjects = useMemo(() => {
    const keyword = projectSearch.trim().toLowerCase();
    if (!keyword) return projects;

    return projects.filter(
      (project) =>
        project.projectName.toLowerCase().includes(keyword) ||
        (project.description || "").toLowerCase().includes(keyword)
    );
  }, [projects, projectSearch]);

  const filteredMembers = useMemo(() => {
    const keyword = memberSearch.trim().toLowerCase();
    if (!keyword) return members;

    return members.filter((member) =>
      [member.freelancerName, member.freelancerId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [members, memberSearch]);

  const projectColumns: ColumnsType<CompanyProject> = [
    {
      title: "Dự án",
      key: "project",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<ProjectOutlined />}
            style={{
              background:
                record.projectId === selectedProjectId
                  ? "linear-gradient(135deg, #1677ff, #52c41a)"
                  : "#d9d9d9",
              color: "#fff",
            }}
          />
          <div>
            <Text strong>{record.projectName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {(record.description || "").slice(0, 60)}
              {(record.description || "").length > 60 ? "..." : ""}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || "default"}>
          {statusMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: "Công việc",
      dataIndex: "progressStatus",
      key: "progressStatus",
      width: 150,
      render: (status: string) => (
        <Tag color={progressMap[status]?.color || "default"}>
          {progressMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: "Member",
      dataIndex: "acceptedCount",
      key: "acceptedCount",
      width: 100,
      align: "center",
      render: (value: number) => (
        <Badge
          count={value || 0}
          showZero
          style={{ backgroundColor: value > 0 ? "#1677ff" : "#d9d9d9" }}
        />
      ),
      sorter: (a, b) => (a.acceptedCount || 0) - (b.acceptedCount || 0),
    },
    {
      title: "Hạn chót",
      dataIndex: "deadline",
      key: "deadline",
      width: 120,
      render: formatDate,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem thành viên">
          <Button
            icon={<EyeOutlined />}
            size="small"
            type={record.projectId === selectedProjectId ? "primary" : "default"}
            onClick={() => handleSelectProject(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const memberColumns: ColumnsType<CompanyProjectMember> = [
    {
      title: "Thành viên",
      key: "member",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#1677ff" }} />
          <div>
            <Text strong>{record.freelancerName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.freelancerId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      key: "isLeader",
      width: 180,
      render: (_, record) => {
        const isLeader = record.isLeader ?? record.leader;

        return isLeader ? (
          <Space direction="vertical" size={2}>
            <Tag color="gold" icon={<CrownOutlined />}>
              Leader dự án
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Trưởng nhóm
            </Text>
          </Space>
        ) : (
          <Tag color="blue">Member</Tag>
        );
      },
      filters: [
        { text: "Leader dự án", value: true },
        { text: "Member", value: false },
      ],
      onFilter: (value, record) =>
        (record.isLeader ?? record.leader) === value,
    },
    {
      title: "Ngày vào dự án",
      dataIndex: "joinedAt",
      key: "joinedAt",
      width: 160,
      render: formatDate,
      sorter: (a, b) =>
        new Date(a.joinedAt || 0).getTime() - new Date(b.joinedAt || 0).getTime(),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xóa khỏi dự án">
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={deletingMemberId === record.memberId}
            onClick={() => handleRemoveMember(record)}
          >
            Xóa
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng dự án",
            value: projects.length,
            icon: <ProjectOutlined />,
            color: "#1677ff",
          },
          {
            title: "Dự án có member",
            value: projects.filter((project) => (project.acceptedCount || 0) > 0).length,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },
          {
            title: "Member dự án đang chọn",
            value: members.length,
            icon: <TeamOutlined />,
            color: "#722ed1",
          },
          {
            title: "Leader",
            value: members.filter((member) => member.isLeader ?? member.leader).length,
            icon: <CrownOutlined />,
            color: "#faad14",
          },
        ].map((stat, index) => (
          <Col span={6} key={index}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
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

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: 16,
        }}
      >
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
          <Title level={4} style={{ margin: 0 }}>
            Dự án và thành viên
          </Title>

          <Space wrap>
            <Search
              placeholder="Tìm dự án..."
              allowClear
              style={{ width: 260 }}
              prefix={<SearchOutlined />}
              onChange={(event) => setProjectSearch(event.target.value)}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={loadProjects}
              loading={loadingProjects}
            >
              Tải lại
            </Button>
          </Space>
        </div>

        <Table
          columns={projectColumns}
          dataSource={filteredProjects}
          rowKey="projectId"
          loading={loadingProjects}
          pagination={{ pageSize: 6 }}
          scroll={{ x: 900 }}
          rowClassName={(record) =>
            record.projectId === selectedProjectId ? "selected-project-row" : ""
          }
        />
      </Card>

      <style>
        {`
          .selected-project-row td {
            background-color: #e6f4ff !important;
          }
        `}
      </style>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
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
              Thành viên dự án
            </Title>
            <Text type="secondary">
              {selectedProject
                ? selectedProject.projectName
                : "Chọn một dự án để xem thành viên"}
            </Text>
          </div>

          <Search
            placeholder="Tìm thành viên..."
            allowClear
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
            onChange={(event) => setMemberSearch(event.target.value)}
          />
        </div>

        <Table
          columns={memberColumns}
          dataSource={filteredMembers}
          rowKey="memberId"
          loading={loadingMembers}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "Dự án chưa có thành viên" }}
        />
      </Card>
    </div>
  );
};

export default CompanyProjectMembersPage;
