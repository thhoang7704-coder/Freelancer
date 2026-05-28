import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Tooltip, Spin } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { walletService, type WalletResponse } from "./walletService";

interface WalletBadgeProps {
  /** Route to navigate when the badge is clicked */
  targetPath: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

export const WalletBadge: React.FC<WalletBadgeProps> = ({ targetPath }) => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await walletService.getMyWallet();
      setWallet(data);
    } catch {
      // silently fail — wallet might not be set up yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const balanceText = wallet ? fmt(wallet.balance) : "—";

  return (
    <Tooltip title="Xem ví tiền" placement="bottom">
      <Button
        type="text"
        onClick={() => navigate(targetPath)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 40,
          padding: "0 10px",
          borderRadius: 8,
          transition: "background 0.2s",
        }}
        className="wallet-badge-btn"
      >
        {loading ? (
          <Spin size="small" />
        ) : (
          <>
            <Badge
              dot
              color={wallet && wallet.balance > 0 ? "#52c41a" : "#d9d9d9"}
              offset={[-2, 2]}
            >
              <WalletOutlined style={{ fontSize: 18, color: "#1677ff" }} />
            </Badge>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: wallet && wallet.balance > 0 ? "#52c41a" : "#8c8c8c",
                minWidth: 80,
                letterSpacing: 0,
              }}
            >
              {balanceText}
            </span>
          </>
        )}
      </Button>
    </Tooltip>
  );
};

export default WalletBadge;
