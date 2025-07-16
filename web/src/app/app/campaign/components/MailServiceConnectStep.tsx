import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Spin, message } from "antd";
import { fetcher } from "@/lib/fetcher";
import {
  MailOutlined,
  DisconnectOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";

const PROVIDERS = [
  {
    key: "mailchimp",
    name: "MailChimp",
    description: "Connect your MailChimp account to send email campaigns.",
    icon: <MailOutlined style={{ fontSize: 32, color: "#ffe01b" }} />,
    connectUrl: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/mail/connect/mailchimp`,
  },
  // Add more providers here (e.g. HubSpot)
];

export const MailServiceConnectStep: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher.get("/api/mail/status");
      setStatus(res || {});
    } catch {
      messageApi.error("Failed to fetch mail service status");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchStatus();
    // Listen for OAuth callback (poll or window event)
    window.addEventListener("focus", fetchStatus);
    return () => window.removeEventListener("focus", fetchStatus);
  }, [fetchStatus]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "mail_connected") {
        if (event.data.success) {
          messageApi.success("Mailchimp connected!");
        } else {
          messageApi.error("Failed to connect Mailchimp");
        }
        fetchStatus();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchStatus, messageApi]);

  const handleConnect = (provider: string, url: string) => {
    setConnecting(provider);
    window.open(url, "_blank", "width=600,height=700");
    setTimeout(() => {
      fetchStatus();
      setConnecting(null);
    }, 2000); // Poll after 2s, or use a better event/callback
  };

  const handleDisconnect = async (provider: string) => {
    setLoading(true);
    try {
      await fetcher.post(`/api/mail/disconnect/${provider}`);
      messageApi.success("Disconnected");
      fetchStatus();
    } catch {
      messageApi.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ display: "flex", gap: 24 }}>
        {PROVIDERS.map((p) => (
          <Card
            key={p.key}
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {p.icon} {p.name}
              </span>
            }
            style={{ width: 320 }}
            actions={[
              status[p.key]?.connected ? (
                <Button
                  danger
                  icon={<DisconnectOutlined />}
                  onClick={() => handleDisconnect(p.key)}
                  loading={loading}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  onClick={() => handleConnect(p.key, p.connectUrl)}
                  loading={connecting === p.key}
                >
                  Connect
                </Button>
              ),
            ]}
          >
            <Spin spinning={loading && !status[p.key]?.connected}>
              <div style={{ minHeight: 50 }}>
                {status[p.key]?.connected ? (
                  <span>
                    <CheckCircleTwoTone twoToneColor="#52c41a" /> Connected
                    {status[p.key]?.meta?.login ? (
                      <span style={{ marginLeft: 8 }}>
                        as <b>{status[p.key].meta.login}</b>
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span>{p.description}</span>
                )}
              </div>
            </Spin>
          </Card>
        ))}
      </div>
    </>
  );
};

export default MailServiceConnectStep;
