import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Empty,
  List,
  Modal,
  Popover,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import {
  notificationService,
  type AppNotification,
} from "./notificationService";
import { parseApiError } from "../../utils/apiError";

const { Text, Paragraph } = Typography;

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Không có";

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      loadNotifications();
    }
  };

  const handleOpenDetail = async (notification: AppNotification) => {
    setDetail(notification);

    if (notification.isRead) {
      return;
    }

    try {
      setMarkingId(notification.id);
      await notificationService.markAsRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
      setDetail({ ...notification, isRead: true });
    } catch (err) {
      message.error(parseApiError(err));
    } finally {
      setMarkingId(null);
    }
  };

  const popoverContent = (
    <div style={{ width: 360, maxWidth: "calc(100vw - 48px)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text strong>Thông báo</Text>
        <Button type="link" size="small" onClick={loadNotifications} loading={loading}>
          Tải lại
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" />
      ) : (
        <List
          loading={loading}
          dataSource={notifications}
          style={{ maxHeight: 360, overflowY: "auto" }}
          renderItem={(notification) => (
            <List.Item
              style={{
                background: notification.isRead ? "#f5f5f5" : "#fff",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 6,
                opacity: notification.isRead ? 0.72 : 1,
                padding: "10px 8px",
              }}
              onClick={() => handleOpenDetail(notification)}
            >
              <List.Item.Meta
                title={
                  <Space size={6} wrap>
                    <Text strong={!notification.isRead} type={notification.isRead ? "secondary" : undefined}>
                      {notification.title}
                    </Text>
                    <Tag color={notification.isRead ? "default" : "blue"}>
                      {notification.type}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2} style={{ width: "100%" }}>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{
                        color: notification.isRead ? "#8c8c8c" : undefined,
                        marginBottom: 0,
                      }}
                    >
                      {notification.content}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(notification.createdAt)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <>
      <Popover
        content={popoverContent}
        trigger="hover"
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottomRight"
      >
        <Badge count={unreadNotifications.length} size="small">
          <Button
            type="text"
            loading={!!markingId}
            icon={<BellOutlined style={{ fontSize: 18 }} />}
          />
        </Badge>
      </Popover>

      <Modal
        title={detail?.title || "Thông báo"}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetail(null)}>
            Đóng
          </Button>,
        ]}
      >
        {detail && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Space wrap>
              <Tag color={detail.isRead ? "default" : "blue"}>
                {detail.isRead ? "Đã đọc" : "Chưa đọc"}
              </Tag>
              <Tag>{detail.type}</Tag>
            </Space>

            <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
              {detail.content}
            </Paragraph>

            <div>
              <Text type="secondary">Thời gian: </Text>
              <Text>{formatDateTime(detail.createdAt)}</Text>
            </div>

            {detail.referenceId && (
              <div>
                <Text type="secondary">Mã tham chiếu: </Text>
                <Text code>{detail.referenceId}</Text>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
};

export default NotificationBell;
