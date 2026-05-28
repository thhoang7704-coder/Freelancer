import React, { useEffect, useState } from "react";
import {
  Table, Button, Input, Tag, Space, Avatar, Typography,
  Modal, Form, Select, Badge, Tooltip, Card, Statistic, Row, Col, message, Popconfirm
} from "antd";
import {
  UserOutlined, SearchOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, LockOutlined, UnlockOutlined,
  TeamOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  adminUserService,
  type AdminUser,
  type UserDetail,
} from "../service/adminUserService";
import { parseApiError } from "../../../utils/apiError";

const { Title, Text } = Typography;
const { Search } = Input;


const roleColorMap: Record<string, string> = {
  USER: "blue",
  FREELANCER: "purple",
  COMPANY: "gold",
  ADMIN: "red",
};

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form] = Form.useForm();

  // fetch user api get all

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await adminUserService.getAllUsers(1, 10);

      if (!response || !response.items) {
        console.error('Invalid response from getAllUsers:', response);
        setUsers([]);
        message.error('Dữ liệu tải về không hợp lệ');
        return;
      }

      setUsers(response.items || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // FILTER SEARCH

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email.toLowerCase().includes(searchText.toLowerCase())
  );


  // HANDLERS

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);

    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });

    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };
  //mô tả user
  const handleViewDetail = async (id: string) => {
    try {
      setDetailLoading(true);

      const response = await adminUserService.getUserById(id);

      setDetailUser(response);

      setDetailOpen(true);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };
  //khóa user
  const handleToggleStatus = async (userId: string) => {
    try {
      await adminUserService.toggleUserStatus(userId);

      message.success("Cập nhật trạng thái thành công");

      fetchUsers();
    } catch (err) {
      message.error(parseApiError(err));
    }
  };

  // TABLE COLUMNS

  const columns: ColumnsType<AdminUser> = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #1677ff, #6366f1)",
            }}
          />

          <div>
            <Text strong>{record.fullName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string | null) => phone || "-",
    },

    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",

      render: (role: string) => (
        <Tag color={roleColorMap[role]}>
          {role}
        </Tag>
      ),

      filters: [
        { text: "USER", value: "USER" },
        { text: "FREELANCER", value: "FREELANCER" },
        { text: "COMPANY", value: "COMPANY" },
        { text: "ADMIN", value: "ADMIN" },
      ],

      onFilter: (value, record) => record.role === value,
    },

    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",

      render: (_, record) => (
        <Badge
          status={record.active ? "success" : "error"}
          text={record.active ? "ACTIVE" : "INACTIVE"}
        />
      ),
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",

      render: (createdAt: string) =>
        new Date(createdAt).toLocaleDateString("vi-VN"),

      sorter: (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    },

    {
      title: "Hành động",
      key: "actions",
      align: "center",

      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title={
              record.active
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"
            }
            description={
              record.active
                ? `Bạn có chắc muốn khóa tài khoản ${record.fullName}?`
                : `Bạn có chắc muốn mở khóa tài khoản ${record.fullName}?`
            }
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={() => handleToggleStatus(record.id)}
          >
            <Tooltip title={record.active ? "Khóa tài khoản" : "Mở khóa"}>
              <Button
                icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
                size="small"
                danger={record.active}
              />
            </Tooltip>
          </Popconfirm>

          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng người dùng",
            value: users.length,
            icon: <TeamOutlined />,
            color: "#1677ff",
          },

          {
            title: "Đang hoạt động",
            value: users.filter((u) => u.active).length,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },

          {
            title: "Đã khóa",
            value: users.filter((u) => !u.active).length,
            icon: <StopOutlined />,
            color: "#ff4d4f",
          },

          {
            title: "Freelancer",
            value: users.filter((u) => u.role === "FREELANCER").length,
            icon: <UserOutlined />,
            color: "#722ed1",
          },
        ].map((stat, i) => (
          <Col span={6} key={i}>
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
                prefix={
                  <span style={{ color: stat.color }}>
                    {stat.icon}
                  </span>
                }
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table */}
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
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Danh sách người dùng
          </Title>

          <Space>
            <Search
              placeholder="Tìm kiếm..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              prefix={<SearchOutlined />}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Thêm người dùng
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          selectedUser
            ? "Chỉnh sửa người dùng"
            : "Thêm người dùng mới"
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                "USER",
                "FREELANCER",
                "COMPANY",
                "ADMIN",
              ].map((r) => ({
                label: r,
                value: r,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi tiết người dùng"
        open={detailOpen}
        footer={null}
        onCancel={() => {
          setDetailOpen(false);
          setDetailUser(null);
        }}
      >
        {detailLoading ? (
          <div>Loading...</div>
        ) : detailUser && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginTop: 16,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={80}
                src={detailUser.avatarUrl}
                icon={<UserOutlined />}
              />
            </div>

            <div>
              <Text type="secondary">Họ và tên</Text>
              <br />
              <Text strong>{detailUser.fullName}</Text>
            </div>

            <div>
              <Text type="secondary">Email</Text>
              <br />
              <Text strong>{detailUser.email}</Text>
            </div>

            <div>
              <Text type="secondary">Số điện thoại</Text>
              <br />
              <Text strong>{detailUser.phone || "-"}</Text>
            </div>

            <div>
              <Text type="secondary">Vai trò</Text>
              <br />
              <Tag color={roleColorMap[detailUser.role]}>
                {detailUser.role}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;