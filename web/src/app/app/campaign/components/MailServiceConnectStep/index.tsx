import React, { useCallback, useEffect, useState } from "react";
import { Button, Spin, message, Modal } from "antd";
import { fetcher } from "@/lib/fetcher";
import {
  MailOutlined,
  DisconnectOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import Image from "next/image";
import styles from "./style.module.scss";

const PROVIDERS = [
  {
    key: "mailchimp",
    name: "MailChimp",
    description:
      "MailChimp is a leading email marketing platform. Connect your account to send campaigns directly from HeronAnalytica.",
    logo: "/images/mailchimp_logo.png",
    homepage: "https://mailchimp.com/",
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
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

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
      setDisconnecting(null);
    }
  };

  const showDisconnectModal = (provider: string) => {
    setDisconnecting(provider);
  };

  const handleModalOk = () => {
    if (disconnecting) {
      handleDisconnect(disconnecting);
    }
  };

  const handleModalCancel = () => {
    setDisconnecting(null);
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        {PROVIDERS.map((p) => {
          const lastSynced = status[p.key]?.lastSynced || "Just now";
          return (
            <div key={p.key} className={styles.glassCard}>
              <div className={styles.mailchimpHeader}>
                <div className={styles.mailchimpLogo}>
                  <Image
                    src={p.logo}
                    alt={p.name + " logo"}
                    width={48}
                    height={48}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.mailchimpName}>{p.name}</div>
                {status[p.key]?.connected && (
                  <span className={styles.mailchimpStatusPill}>
                    <span className={styles.pulsingCheck}>
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    </span>
                    Connected
                  </span>
                )}
              </div>
              <Spin spinning={loading && !status[p.key]?.connected}>
                <div className={styles.mailchimpBody}>
                  {/* Left column: status/meta */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      minWidth: 0,
                    }}
                  >
                    {status[p.key]?.connected && (
                      <>
                        {status[p.key]?.meta?.login && (
                          <div className={styles.mailchimpMeta}>
                            as <b>{status[p.key].meta.login}</b>
                          </div>
                        )}
                        <div className={styles.mailchimpMeta}>
                          Last synced: {lastSynced}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Right column: desc, actions, link */}
                  <div style={{ flex: 2, minWidth: 0 }}>
                    <div className={styles.mailchimpDesc}>{p.description}</div>
                    <div className={styles.mailchimpActions}>
                      <a
                        href={p.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.providerLink}
                        style={{ marginRight: 8 }}
                      >
                        Learn more
                      </a>
                      {status[p.key]?.connected ? (
                        <Button
                          danger
                          icon={<DisconnectOutlined />}
                          onClick={() => showDisconnectModal(p.key)}
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
                      )}
                    </div>
                  </div>
                </div>
              </Spin>
            </div>
          );
        })}
      </div>
      {/* Disconnect confirmation modal */}
      <Modal
        title="Disconnect Mail Provider"
        open={!!disconnecting}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Disconnect"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={loading}
      >
        Are you sure you want to disconnect this mail provider?
      </Modal>
    </>
  );
};

export default MailServiceConnectStep;
