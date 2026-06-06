import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Upload,
  Spin,
} from "antd";


import {
  PlusOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
  LockOutlined,
UnlockOutlined, 
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  companyProjectService,
  type CompanyProject,
} from "../service/companyProjectService";

const { Title, Text } = Typography;
const { TextArea, Search } = Input;

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

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(v);

export const CompanyProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedProject, setSelectedProject] =
  useState<CompanyProject | null>(null);
const [fileList, setFileList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
const [isEditing, setIsEditing] = useState(false);
  // FILTERS
  const [statusFilter, setStatusFilter] =
    useState<string>("ALL");

  const [progressFilter, setProgressFilter] =
    useState<string>("ALL");

  const [form] = Form.useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);

     const data =
  await companyProjectService.getProjects();

setProjects(data);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
  setSelectedProject(null);
  setIsEditing(false);

  setFileList([]);
  form.resetFields();

  setIsModalOpen(true);
};
const handleToggleLock = async (
  project: CompanyProject
) => {
  try {
    if (project.applyStatus === "CLOSED") {
      await companyProjectService.unlockProject(
        project.projectId
      );

      message.success(
        "Mở khóa dự án thành công"
      );
    } else {
      await companyProjectService.lockProject(
        project.projectId
      );

      message.success(
        "Khóa dự án thành công"
      );
    }

    fetchProjects();

  } catch (error: any) {
    message.error(
      error?.response?.data?.message ||
      "Thao tác thất bại"
    );
  }
};

  const handleEdit = (p: CompanyProject) => {
  setSelectedProject(p);
  setIsEditing(true);

  form.setFieldsValue({
  name: p.projectName,
  description: p.description,
  budget: p.budget,
  deadline: p.deadline,

  skillsRequired:
    typeof p.skillsRequired === "string"
      ? p.skillsRequired
          .split(",")
          .map((s) => s.trim())
      : p.skillsRequired || [],
});

  setIsModalOpen(true);
};
  const handleSubmit = async (values: any) => {
  try {
    const payload = {
      name: values.name,
      description: values.description,
      budget: values.budget,
      deadline: values.deadline,
      skillsRequired:
        values.skillsRequired || [],
    };

    // UPDATE
    if (selectedProject) {
      await companyProjectService.updateProject(
        selectedProject.projectId,
        payload
      );

      message.success(
        "Cập nhật dự án thành công"
      );
    }

    // CREATE
    else {
      const formData = new FormData();

      formData.append(
        "name",
        values.name
      );

      formData.append(
        "description",
        values.description || ""
      );

      formData.append(
        "budget",
        String(values.budget)
      );

      formData.append(
        "deadline",
        String(values.deadline)
      );

      if (values.skillsRequired) {
        values.skillsRequired.forEach(
          (skill: string) => {
            formData.append(
              "skillsRequired",
              skill
            );
          }
        );
      }

      fileList.forEach((file) => {
        formData.append(
          "files",
          file.originFileObj
        );
      });

      await companyProjectService.createProject(
        formData
      );

      message.success(
        "Tạo dự án thành công"
      );
    }

    setIsModalOpen(false);

    setSelectedProject(null);
    setIsEditing(false);

    form.resetFields();

    setFileList([]);

    fetchProjects();

  } catch (error: any) {
    console.error(error);

    message.error(
      error?.response?.data?.message ||
      "Thao tác thất bại"
    );
  }
};

  // FILTER DATA
  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.projectName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (p.description || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchStatus =
      statusFilter === "ALL"
        ? true
        : p.status === statusFilter;

    const matchProgress =
      progressFilter === "ALL"
        ? true
        : p.progressStatus === progressFilter;

    return (
      matchSearch &&
      matchStatus &&
      matchProgress
    );
  });

  const columns: ColumnsType<CompanyProject> = [
    {
      title: "Dự án",
      key: "title",

      render: (_, r) => (
        <div>
          <Text strong>{r.projectName}</Text>

          <br />

          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {(r.description || "").slice(0, 50)}...
          </Text>
        </div>
      ),
    },

    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",

      render: (v) => (
        <Text
          style={{
            color: "#52c41a",
            fontWeight: 600,
          }}
        >
          {fmt(v)}
        </Text>
      ),

      sorter: (a, b) => a.budget - b.budget,
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      render: (s: string) => (
        <Tag color={statusMap[s]?.color}>
          {statusMap[s]?.label || s}
        </Tag>
      ),
    },

   
    {
      title: "Công việc",
      dataIndex: "progressStatus",
      key: "progressStatus",

      render: (s: string) => (
        <Tag color={progressMap[s]?.color}>
          {progressMap[s]?.label || s}
        </Tag>
      ),
    },
{
  title: "Kỹ năng",
  dataIndex: "skillsRequired",
  key: "skillsRequired",

  render: (skills: any) => {
    const skillList =
      typeof skills === "string"
        ? skills.split(",").map((s) => s.trim())
        : Array.isArray(skills)
        ? skills
        : [];

    if (skillList.length === 0) {
      return (
        <Text type="secondary">
          Không có
        </Text>
      );
    }

    return (
      <Space wrap>
        {skillList
          .slice(0, 3)
          .map((s: string) => (
            <Tag key={s} color="blue">
              {s}
            </Tag>
          ))}

        {skillList.length > 3 && (
          <Tag>
            +{skillList.length - 3}
          </Tag>
        )}
      </Space>
    );
  },
},


    {
      title: "Ứng viên",
      dataIndex: "appliedCount",
      key: "appliedCount",

      render: (v) => (
        <Badge
          count={v}
          showZero
          style={{
            background:
              v > 0 ? "#1677ff" : "#d9d9d9",
          }}
        />
      ),

      sorter: (a, b) =>
          (a.appliedCount || 0) -
  (b.appliedCount || 0),
    },

    {
      title: "Hạn chót",
      dataIndex: "deadline",
      key: "deadline",

      render: (v: string) =>
        v
          ? new Date(v).toLocaleDateString(
              "vi-VN"
            )
          : "Không có",
    },

    {
      title: "Hành động",
      key: "actions",
      align: "center",

      render: (_, r) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => setSelectedProject(r)}
          />

          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            ghost
            onClick={() => handleEdit(r)}
          />

          <Button
  icon={
    r.applyStatus === "CLOSED"
      ? <UnlockOutlined />
      : <LockOutlined />
  }
  size="small"
  onClick={() =>
    handleToggleLock(r)
  }
>
  {r.applyStatus === "CLOSED"
    ? "Mở"
    : "Khóa"}
</Button>

<Button
  icon={<DeleteOutlined />}
  size="small"
  danger
/>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng dự án",
            value: projects.length,
            icon: <ProjectOutlined />,
            color: "#1677ff",
          },

          {
            title: "Chờ duyệt",
            value: projects.filter(
              (p) => p.status === "PENDING"
            ).length,
            icon: <ClockCircleOutlined />,
            color: "#faad14",
          },

          {
            title: "Đang thực hiện",
            value: projects.filter(
              (p) =>
                p.progressStatus ===
                "IN_PROGRESS"
            ).length,
            icon: <FireOutlined />,
            color: "#722ed1",
          },

          {
            title: "Hoàn thành",
            value: projects.filter(
              (p) =>
                p.progressStatus === "DONE"
            ).length,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Statistic
                title={s.title}
                value={s.value}
                prefix={
                  <span
                    style={{ color: s.color }}
                  >
                    {s.icon}
                  </span>
                }
                valueStyle={{ color: s.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Dự án của tôi
          </Title>

          <Space wrap>
            {/* SEARCH */}
            <Search
              placeholder="Tìm dự án..."
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
            />

            {/* FILTER STATUS */}
            <Select
              value={statusFilter}
              style={{ width: 180 }}
              onChange={setStatusFilter}
              options={[
                {
                  label: "Tất cả trạng thái",
                  value: "ALL",
                },

                ...Object.entries(
                  statusMap
                ).map(([k, v]) => ({
                  label: v.label,
                  value: k,
                })),
              ]}
            />

            {/* FILTER PROGRESS */}
            <Select
              value={progressFilter}
              style={{ width: 200 }}
              onChange={setProgressFilter}
              options={[
                {
                  label:
                    "Tất cả công việc",
                  value: "ALL",
                },

                ...Object.entries(
                  progressMap
                ).map(([k, v]) => ({
                  label: v.label,
                  value: k,
                })),
              ]}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Đăng dự án mới
            </Button>
          </Space>
        </div>
<style>
{`
  .locked-project-row td {
    background-color: #fff2f0 !important;
    color: #999 !important;
  }

  .locked-project-row:hover td {
    background-color: #ffd8bf !important;
  }
`}
</style>
        <Spin spinning={loading}>
          <Table
  columns={columns}
  dataSource={filteredProjects}
  rowKey="projectId"
  pagination={{ pageSize: 8 }}
  rowClassName={(record) =>
    record.applyStatus === "CLOSED"
      ? "locked-project-row"
      : ""
  }
/>
        </Spin>
      </Card>

      {/* MODAL */}
      <Modal
        title={
  isEditing
    ? "Chỉnh sửa dự án"
    : "Đăng dự án mới"
}
        open={isModalOpen}
        onCancel={() =>
          setIsModalOpen(false)
        }
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Huỷ"
        width={600}
      >
        <Form
  form={form}
  layout="vertical"
  style={{ marginTop: 16 }}
  onFinish={handleSubmit}
>
  <Form.Item
    name="name"
    label="Tiêu đề dự án"
    rules={[{ required: true }]}
  >
    <Input placeholder="Nhập tiêu đề dự án" />
  </Form.Item>

  
  <Form.Item
    name="description"
    label="Mô tả"
    rules={[
      {
        required: true,
        message: "Vui lòng nhập mô tả",
      },
    ]}
  >
    <TextArea
      rows={4}
      placeholder="Mô tả chi tiết dự án..."
    />
  </Form.Item>

 
  <Form.Item
    name="skillsRequired"
    label="Kỹ năng yêu cầu"
    rules={[
      {
        required: true,
        message:
          "Vui lòng nhập kỹ năng",
      },
    ]}
  >
    <Select
      mode="tags"
      placeholder="VD: React, Java, Spring Boot..."
    />
  </Form.Item>

  <Row gutter={16}>
    <Col span={12}>
      <Form.Item
        name="budget"
        label="Ngân sách (VNĐ)"
        rules={[
          { required: true },
        ]}
      >
        <InputNumber
          style={{
            width: "100%",
          }}
          min={0}
          step={1000000}
          formatter={(v) =>
            `${v}`.replace(
              /\B(?=(\d{3})+(?!\d))/g,
              ","
            )
          }
          placeholder="Nhập ngân sách"
        />
      </Form.Item>
    </Col>

    <Col span={12}>
      <Form.Item
        name="deadline"
        label="Hạn chót"
        rules={[
          {
            required: true,
            message:
              "Vui lòng chọn hạn chót",
          },
        ]}
      >
        <Input type="date" />
      </Form.Item>
    </Col>
  </Row>

  
  <Form.Item label="File đính kèm">
    <Upload
      multiple
      beforeUpload={() => false}
      fileList={fileList}
      onChange={({ fileList }) =>
        setFileList(fileList)
      }
    >
      <Button icon={<UploadOutlined />}>
        Chọn file
      </Button>
    </Upload>
  </Form.Item>
</Form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        title="Chi tiết dự án"
        open={!!selectedProject && !isModalOpen}
        footer={null}
        onCancel={() =>
          setSelectedProject(null)
          
        }
      >
        {selectedProject && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <Text strong>
                {selectedProject.projectName}
              </Text>
            </div>

            <div>
              <Text type="secondary">
                Mô tả
              </Text>

              <br />

              <Text>
                {
                  selectedProject.description
                }
              </Text>
            </div>

            <div>
              <Text type="secondary">
                Ngân sách
              </Text>

              <br />

              <Text strong>
                {fmt(
                  selectedProject.budget
                )}
              </Text>
            </div>

            <div>
              <Text type="secondary">
                Trạng thái
              </Text>

              <br />

              <Tag
                color={
                  statusMap[
                    selectedProject.status
                  ]?.color
                }
              >
                {
                  statusMap[
                    selectedProject.status
                  ]?.label
                }
              </Tag>
            </div>

            <div>
              <Text type="secondary">
                Công việc
              </Text>

              <br />

              <Tag
                color={
                  progressMap[
                    selectedProject
                      .progressStatus
                  ]?.color
                }
              >
                {
                  progressMap[
                    selectedProject
                      .progressStatus
                  ]?.label
                }
              </Tag>
            </div>
           <div>
  <Text type="secondary">
    Kỹ năng yêu cầu
  </Text>

  <br />

  <Space wrap>
    {(typeof selectedProject.skillsRequired === "string"
      ? selectedProject.skillsRequired
          .split(",")
          .map((s) => s.trim())
      : Array.isArray(selectedProject.skillsRequired)
      ? selectedProject.skillsRequired
      : []
    ).map((skill: string) => (
      <Tag key={skill} color="blue">
        {skill}
      </Tag>
    ))}
  </Space>
</div>

            {selectedProject.attachmentUrls && selectedProject.attachmentUrls.length > 0 && (
              <div>
                <Text type="secondary">
                  File đính kèm
                </Text>
                <br />
                <Space direction="vertical" size={8} style={{ marginTop: 8 }}>
                  {selectedProject.attachmentUrls.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noreferrer">
                      <Tag color="cyan" style={{ cursor: "pointer" }}>
                        Tệp đính kèm {index + 1}
                      </Tag>
                    </a>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompanyProjectsPage;