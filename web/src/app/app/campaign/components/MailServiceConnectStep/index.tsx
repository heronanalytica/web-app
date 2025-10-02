import React, { useCallback, useEffect, useState } from "react";
import { message, Modal } from "antd";
import { fetcher } from "@/lib/fetcher";
import styles from "./style.module.scss";
import { PROVIDERS } from "./constants";
import MailServiceCard from "./MailServiceCard";

import {
  useCampaignBuilder,
  useStepState,
} from "../CampaignBuilder/CampaignBuilderContext";
import { CampaignStepStateKey } from "@/types/campaignStepState";

export const MailServiceConnectStep: React.FC = () => {
  const [mailService, setMailService, removeMailService] = useStepState(
    CampaignStepStateKey.MailService
  );
  const lastMailServiceRef = React.useRef<any>(mailService);
  const [messageApi, contextHolder] = message.useMessage();
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const { setCanGoNext, save } = useCampaignBuilder();
  const [pendingSaveAfterRemove, setPendingSaveAfterRemove] = useState(false);

  useEffect(() => {
    if (pendingSaveAfterRemove) {
      save();
      setPendingSaveAfterRemove(false);
    }
  }, [pendingSaveAfterRemove, save]);

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

  // Set default mail service if none is selected
  useEffect(() => {
    // If no mail service is selected, set a default one
    if (!mailService) {
      const defaultMailService = {
        provider: "default",
        connected: true,
        mailProviderId: "default",
        name: "HeronAnalytica Marketing Platform",
      };
      setMailService(defaultMailService);
      lastMailServiceRef.current = defaultMailService;
      setCanGoNext(true);
    } else {
      setCanGoNext(true);
    }
  }, [status, setCanGoNext, setMailService, mailService]);

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
      // If the disconnected provider is the selected one, clear step state and persist
      if (mailService && mailService.provider === provider) {
        removeMailService();
        lastMailServiceRef.current = undefined;
        setPendingSaveAfterRemove(true);
      }
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
      <div className={styles.providerStepNotice}>
        Your campaign will be sent using the HeronAnalytica Marketing Platform
        by default. <br />You can optionally connect an external email service
        provider below once it is available.
      </div>
      <div className={styles.providerCardsRow}>
        {PROVIDERS.map((p) => (
          <MailServiceCard
            key={p.key}
            provider={p}
            status={status}
            loading={loading}
            selected={status[p.key]?.connected}
            onSelect={() =>
              setMailService({
                provider: p.key,
                connected: true,
                mailProviderId:
                  status[p.key]?.mailProviderId || status[p.key]?.id || "",
              })
            }
            onConnect={handleConnect}
            onDisconnect={showDisconnectModal}
            connecting={connecting}
          />
        ))}
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
