import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  FileSearchOutlined,
  LinkOutlined,
  ProjectOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  companyProjectService,
  type ApplicationStatus,
  type CompanyProject,
  type CompanyProjectApplicationWithProject,
  type CompanyProjectMemberWithProject,
} from "../service/companyProjectService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const progressMap: Record<string, { color: string; label: string }> = {
  TODO: { color: "default", label: "Chưa bắt đầu" },
  IN_PROGRESS: { color: "processing", label: "Đang thực hiện" },
  DONE: { color: "success", label: "Hoàn thành" },
};

const applicationStatusMap: Record<ApplicationStatus, { color: string; label: string }> = {
  PENDING: { color: "orange", label: "Chờ duyệt" },
  APPROVED: { color: "green", label: "Đã duyệt" },
  REJECTED: { color: "red", label: "Đã từ chối" },
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Không có";

const isLeaderMember = (member: CompanyProjectMemberWithProject) =>
  member.isLeader ?? member.leader ?? false;

const splitTags = (value?: string | null) =>
  (value || "")
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const CompanyApprovedFreelancersPage: React.FC = () => {
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [members, setMembers] = useState<CompanyProjectMemberWithProject[]>([]);
  const [applications, setApplications] = useState<CompanyProjectApplicationWithProject[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const projectData = await companyProjectService.getProjects();
      setProjects(projectData);

      const [memberGroups, applicationGroups] = await Promise.all([
        Promise.all(
          projectData.map(async (project) => {
            const projectMembers = await companyProjectService.getProjectMembers(
              project.projectId
            );

            return projectMembers.map((member) => ({
              ...member,
              projectId: project.projectId,
              projectName: project.projectName,
              projectStatus: project.status,
              progressStatus: project.progressStatus,
            }));
          })
        ),
        Promise.all(
          projectData.map(async (project) => {
            const response = await companyProjectService.getProjectApplications(
              project.projectId
            );

            return (response.items || []).map((application) => ({
              ...application,
              projectId: project.projectId,
              projectName: project.projectName,
              projectStatus: project.status,
              progressStatus: project.progressStatus,
            }));
          })
        ),
      ]);

      setMembers(memberGroups.flat());
      setApplications(applicationGroups.flat());
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const filteredApplications = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return applications;

    return applications.filter((application) =>
      [
        application.freelancerName,
        application.freelancerId,
        application.projectName,
        application.programmingLanguages,
        application.experience,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [applications, searchText]);

  const filteredMembers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return members;

    return members.filter((member) =>
      [member.freelancerName, member.freelancerId, member.projectName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [members, searchText]);

  const applicationsByStatus = useMemo(
    () => ({
      PENDING: filteredApplications.filter((item) => item.status === "PENDING"),
      APPROVED: filteredApplications.filter((item) => item.status === "APPROVED"),
      REJECTED: filteredApplications.filter((item) => item.status === "REJECTED"),
    }),
    [filteredApplications]
  );

  const handleUpdateStatus = (
    application: CompanyProjectApplicationWithProject,
    status: Exclude<ApplicationStatus, "PENDING">
  ) => {
    const actionText = status === "APPROVED" ? "duyệt" : "từ chối";

    Modal.confirm({
      title: `${status === "APPROVED" ? "Duyệt" : "Từ chối"} freelancer?`,
      content: `${application.freelancerName} sẽ được ${actionText} cho dự án ${application.projectName}.`,
      okText: status === "APPROVED" ? "Duyệt" : "Từ chối",
      okButtonProps: { danger: status === "REJECTED" },
      cancelText: "Hủy",
      async onOk() {
        try {
          setActionLoadingId(application.applicationId);
          await companyProjectService.updateApplicationStatus(
            application.applicationId,
            status
          );
          message.success(
            status === "APPROVED"
              ? "Đã duyệt freelancer vào dự án"
              : "Đã từ chối freelancer"
          );
          await loadData();
        } catch (err) {
          message.error(parseApiError(err));
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const applicationColumns: ColumnsType<CompanyProjectApplicationWithProject> = [
    {
      title: "Freelancer",
      key: "freelancer",
      fixed: "left",
      width: 240,
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
      title: "Dự án",
      dataIndex: "projectName",
      key: "projectName",
      width: 220,
      render: (projectName: string) => (
        <Space>
          <ProjectOutlined style={{ color: "#faad14" }} />
          <Text>{projectName}</Text>
        </Space>
      ),
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience",
      key: "experience",
      width: 260,
      render: (value?: string | null) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {value || "Chưa cập nhật"}
        </Paragraph>
      ),
    },
    {
      title: "Kỹ năng",
      dataIndex: "programmingLanguages",
      key: "programmingLanguages",
      width: 240,
      render: (value?: string | null) => {
        const skills = splitTags(value);

        if (!skills.length) {
          return <Text type="secondary">Chưa cập nhật</Text>;
        }

        return (
          <Space wrap size={[0, 4]}>
            {skills.slice(0, 4).map((skill) => (
              <Tag key={skill} color="blue">
                {skill}
              </Tag>
            ))}
            {skills.length > 4 && <Tag>+{skills.length - 4}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Portfolio",
      key: "links",
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.portfolioLink ? (
            <a href={record.portfolioLink} target="_blank" rel="noreferrer">
              <LinkOutlined /> Portfolio
            </a>
          ) : (
            <Text type="secondary">Không có</Text>
          )}
          {record.projectLinks ? (
            <a href={record.projectLinks} target="_blank" rel="noreferrer">
              <LinkOutlined /> Dự án mẫu
            </a>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: ApplicationStatus) => (
        <Tag color={applicationStatusMap[status]?.color || "default"}>
          {applicationStatusMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: "Ngày ứng tuyển",
      dataIndex: "appliedAt",
      key: "appliedAt",
      width: 140,
      render: formatDate,
      sorter: (a, b) =>
        new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime(),
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) =>
        record.status === "PENDING" ? (
          <Space>
            <Tooltip title="Duyệt">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={actionLoadingId === record.applicationId}
                onClick={() => handleUpdateStatus(record, "APPROVED")}
              />
            </Tooltip>
            <Tooltip title="Từ chối">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                loading={actionLoadingId === record.applicationId}
                onClick={() => handleUpdateStatus(record, "REJECTED")}
              />
            </Tooltip>
          </Space>
        ) : (
          <Text type="secondary">Đã xử lý</Text>
        ),
    },
  ];

  const memberColumns: ColumnsType<CompanyProjectMemberWithProject> = [
    {
      title: "Freelancer",
      key: "freelancer",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#52c41a" }} />
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
      title: "Dự án",
      dataIndex: "projectName",
      key: "projectName",
      render: (projectName: string) => (
        <Space>
          <ProjectOutlined style={{ color: "#faad14" }} />
          <Text>{projectName}</Text>
        </Space>
      ),
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 160,
      render: (_, record) =>
        isLeaderMember(record) ? (
          <Tag color="gold" icon={<CrownOutlined />}>
            Leader dự án
          </Tag>
        ) : (
          <Tag color="blue">Member</Tag>
        ),
      filters: [
        { text: "Leader", value: true },
        { text: "Member", value: false },
      ],
      onFilter: (value, record) => isLeaderMember(record) === value,
    },
    {
      title: "Tiến độ dự án",
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
      title: "Ngày duyệt",
      dataIndex: "joinedAt",
      key: "joinedAt",
      width: 140,
      render: formatDate,
      sorter: (a, b) =>
        new Date(a.joinedAt || 0).getTime() - new Date(b.joinedAt || 0).getTime(),
    },
  ];

  const renderApplicationTable = (
    data: CompanyProjectApplicationWithProject[],
    emptyText: string
  ) => (
    <Table
      columns={applicationColumns}
      dataSource={data}
      rowKey="applicationId"
      loading={loading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 1400 }}
      locale={{ emptyText }}
    />
  );

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Chờ duyệt",
            value: applications.filter((item) => item.status === "PENDING").length,
            icon: <FileSearchOutlined />,
            color: "#faad14",
          },
          {
            title: "Đã duyệt",
            value: members.length,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },
          {
            title: "Đã từ chối",
            value: applications.filter((item) => item.status === "REJECTED").length,
            icon: <CloseCircleOutlined />,
            color: "#ff4d4f",
          },
          {
            title: "Dự án có ứng tuyển",
            value: new Set(applications.map((item) => item.projectId)).size,
            icon: <TeamOutlined />,
            color: "#1677ff",
          },
        ].map((stat, index) => (
          <Col xs={24} sm={12} xl={6} key={index}>
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

      <Card
        bordered={false}
        style={{
          borderRadius: 8,
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
              Duyệt freelancer
            </Title>
            <Text type="secondary">
              Quản lý hồ sơ ứng tuyển theo từng trạng thái của các dự án công ty.
            </Text>
          </div>

          <Space wrap>
            <Search
              placeholder="Tìm freelancer, dự án, kỹ năng..."
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
              Tải lại
            </Button>
          </Space>
        </div>

        <Tabs
          items={[
            {
              key: "pending",
              label: `Chờ duyệt (${applicationsByStatus.PENDING.length})`,
              children: renderApplicationTable(
                applicationsByStatus.PENDING,
                "Chưa có freelancer chờ duyệt"
              ),
            },
            {
              key: "approved",
              label: `Đã duyệt (${filteredMembers.length})`,
              children: (
                <Table
                  columns={memberColumns}
                  dataSource={filteredMembers}
                  rowKey={(record) => `${record.projectId}-${record.memberId}`}
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 900 }}
                  locale={{ emptyText: "Chưa có freelancer đã duyệt" }}
                />
              ),
            },
            {
              key: "rejected",
              label: `Đã từ chối (${applicationsByStatus.REJECTED.length})`,
              children: renderApplicationTable(
                applicationsByStatus.REJECTED,
                "Chưa có freelancer bị từ chối"
              ),
            },
          ]}
        />
      </Card>

      <Text type="secondary" style={{ display: "block", marginTop: 12 }}>
        Tổng dự án: {projects.length}
      </Text>
    </div>
  );
};

export default CompanyApprovedFreelancersPage;
