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
  const [mailService, setMailService] = useStepState(
    CampaignStepStateKey.MailService
  );
  const lastMailServiceRef = React.useRef<any>(mailService);
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
    const connectedProvider = Object.entries(status).find(
      ([, s]: any) => s?.connected
    );
    setCanGoNext(!!connectedProvider);

    if (connectedProvider) {
      const [providerKey, s] = connectedProvider;
      const newMailService = {
        provider: providerKey,
        connected: true,
        mailProviderId: s.mailProviderId || s.id || "",
      };
      // Only update if changed (deep compare)
      if (
        !lastMailServiceRef.current ||
        lastMailServiceRef.current.provider !== newMailService.provider ||
        lastMailServiceRef.current.mailProviderId !==
          newMailService.mailProviderId
      ) {
        setMailService(newMailService);
        lastMailServiceRef.current = newMailService;
      }
    } else if (lastMailServiceRef.current) {
      setMailService(undefined);
      lastMailServiceRef.current = undefined;
    }
  }, [status, setCanGoNext, setMailService]);

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
      {PROVIDERS.every((p) => !status[p.key]?.connected) && (
        <div className={styles.providerStepNotice}>
          You must connect at least one email service before continuing.
        </div>
      )}
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
