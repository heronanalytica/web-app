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
    headerBg: "linear-gradient(90deg, #ffe01b 0%, #ffe99f 100%)",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description:
      "HubSpot integration is coming soon. You'll be able to connect your HubSpot account to send campaigns from HeronAnalytica.",
    logo: "/images/hubspot_logo.png",
    homepage: "https://www.hubspot.com/",
    connectUrl: "",
    comingSoon: true,
    headerBg: "linear-gradient(90deg, #ff7a59 0%, #ffb199 100%)",
  },
  {
    key: "klaviyo",
    name: "Klaviyo",
    description:
      "Klaviyo integration is coming soon. You'll be able to connect your Klaviyo account to send campaigns from HeronAnalytica.",
    logo: "/images/klaviyo_logo.png",
    homepage: "https://www.klaviyo.com/",
    connectUrl: "",
    comingSoon: true,
    headerBg: "linear-gradient(90deg, #00c569 0%, #b1ffe7 100%)",
  },
  // Add more providers here (e.g. HubSpot)
];

import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";

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

  const { setCanGoNext } = useCampaignBuilder();

  useEffect(() => {
    fetchStatus();
    // Listen for OAuth callback (poll or window event)
    window.addEventListener("focus", fetchStatus);
    return () => window.removeEventListener("focus", fetchStatus);
  }, [fetchStatus]);

  // Enforce at least one connected
  useEffect(() => {
    const anyConnected = Object.values(status).some((s: any) => s?.connected);
    setCanGoNext(anyConnected);
  }, [status, setCanGoNext]);

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
      <h2 className={styles.providerStepTitle}>Connect Your Email Service</h2>
      {PROVIDERS.every((p) => !status[p.key]?.connected) && (
        <div className={styles.providerStepNotice}>
          You must connect at least one email service before continuing.
        </div>
      )}
      <div className={styles.providerCardsRow}>
        {PROVIDERS.map((p) => {
          if (p.comingSoon) {
            return (
              <div
                key={p.key}
                className={`${styles.glassCard} ${styles.dimmedCard}`}
              >
                <div
                  className={styles.providerHeader}
                  style={{ background: p.headerBg }}
                >
                  <div className={styles.providerLogo}>
                    <Image
                      src={p.logo}
                      alt={p.name + " logo"}
                      width={48}
                      height={48}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className={styles.providerName}>{p.name}</div>
                  <span
                    className={styles.providerStatusPill}
                    style={{ background: "#ffe9b3", color: "#c28800" }}
                  >
                    <span style={{ marginRight: 6, fontSize: 15 }}>⏳</span>{" "}
                    Coming soon
                  </span>
                </div>
                <div className={styles.providerBody}>
                  <div style={{ flex: 1 }}></div>
                  <div style={{ flex: 2, minWidth: 0 }}>
                    <div className={styles.providerDesc}>{p.description}</div>
                    <div className={styles.providerActions}>
                      <a
                        href={p.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.providerLink}
                        style={{ marginRight: 8 }}
                      >
                        Learn more
                      </a>
                      <Button
                        type="primary"
                        disabled
                        style={{ opacity: 0.6, pointerEvents: "none" }}
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const lastSynced = status[p.key]?.lastSynced || "Just now";
          return (
            <div key={p.key} className={styles.glassCard}>
              <div className={styles.providerHeader}>
                <div className={styles.providerLogo}>
                  <Image
                    src={p.logo}
                    alt={p.name + " logo"}
                    width={48}
                    height={48}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.providerName}>{p.name}</div>
                {status[p.key]?.connected && (
                  <span className={styles.providerStatusPill}>
                    <span className={styles.pulsingCheck}>
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    </span>
                    Connected
                  </span>
                )}
              </div>
              <Spin spinning={loading && !status[p.key]?.connected}>
                <div className={styles.providerBody}>
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
                          <div className={styles.providerMeta}>
                            as <b>{status[p.key].meta.login}</b>
                          </div>
                        )}
                        <div className={styles.providerMeta}>
                          Last synced: {lastSynced}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Right column: desc, actions, link */}
                  <div style={{ flex: 2, minWidth: 0 }}>
                    <div className={styles.providerDesc}>{p.description}</div>
                    <div className={styles.providerActions}>
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
