import React from "react";
import { Button, Spin } from "antd";
import Image from "next/image";
import {
  CheckCircleTwoTone,
  MailOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import styles from "./style.module.scss";

interface MailServiceCardProps {
  provider: any;
  status: any;
  loading: boolean;
  selected: boolean;
  onSelect: (providerKey: string) => void;
  onConnect: (providerKey: string, connectUrl: string) => void;
  onDisconnect: (providerKey: string) => void;
  connecting: string | null;
}

const MailServiceCard: React.FC<MailServiceCardProps> = ({
  provider,
  status,
  loading,
  selected,
  onSelect,
  onConnect,
  onDisconnect,
  connecting,
}) => {
  const s = status[provider.key] || {};
  const isConnected = s.connected;
  const isComingSoon = provider.comingSoon;
  const lastSynced = s.lastSynced || "Just now";

  if (isComingSoon) {
    return (
      <div className={[styles.glassCard, styles.disabledCard].join(" ")}>
        <div
          className={styles.providerHeader}
          style={{ background: provider.headerBg }}
        >
          <div className={styles.providerLogo}>
            <Image
              src={provider.logo}
              alt={provider.name + " logo"}
              width={48}
              height={48}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className={styles.providerName}>{provider.name}</div>
        </div>
        <div className={styles.providerBody}>
          <div style={{ flex: 1 }}></div>
          <div style={{ flex: 2, minWidth: 0 }}>
            <div className={styles.providerDesc}>{provider.description}</div>
            <div className={styles.providerActions}>
              <a
                href={provider.homepage}
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

  return (
    <div
      className={[
        styles.glassCard,
        isConnected ? styles.selectableCard : styles.disabledCard,
        selected ? styles.selectedCard : "",
      ].join(" ")}
      tabIndex={isConnected ? 0 : -1}
      aria-disabled={!isConnected}
      role="button"
      onClick={() => isConnected && onSelect(provider.key)}
      style={{
        cursor: isConnected ? "pointer" : "not-allowed",
        outline: selected ? "2.5px solid #a58dff" : undefined,
        boxShadow: selected ? "0 0 0 4px #a58dff33" : undefined,
        position: "relative",
        transition: "box-shadow 0.18s, outline 0.18s",
      }}
    >
      {selected && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#fff",
            borderRadius: "50%",
            boxShadow: "0 2px 8px 0 rgba(165, 141, 255, 0.08)",
            padding: 3,
            zIndex: 2,
          }}
        >
          <CheckCircleTwoTone twoToneColor="#a58dff" style={{ fontSize: 22 }} />
        </span>
      )}
      <div
        className={styles.providerHeader}
        style={{ background: provider.headerBg }}
      >
        <div className={styles.providerLogo}>
          <Image
            src={provider.logo}
            alt={provider.name + " logo"}
            width={48}
            height={48}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className={styles.providerName}>{provider.name}</div>
        {isConnected && (
          <span className={styles.providerStatusPill}>
            <span className={styles.pulsingCheck}>
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            </span>
            Connected
          </span>
        )}
      </div>
      <Spin spinning={loading && !isConnected}>
        <div className={styles.providerBody}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minWidth: 0,
            }}
          >
            {isConnected && (
              <>
                {s.meta?.login && (
                  <div className={styles.providerMeta}>
                    as <b>{s.meta.login}</b>
                  </div>
                )}
                <div className={styles.providerMeta}>
                  Last synced: {lastSynced}
                </div>
              </>
            )}
          </div>
          <div style={{ flex: 2, minWidth: 0 }}>
            <div className={styles.providerDesc}>{provider.description}</div>
            <div className={styles.providerActions}>
              <a
                href={provider.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.providerLink}
                style={{ marginRight: 8 }}
              >
                Learn more
              </a>
              {isConnected ? (
                <Button
                  danger
                  icon={<DisconnectOutlined />}
                  onClick={() => onDisconnect(provider.key)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  onClick={() => onConnect(provider.key, provider.connectUrl)}
                  loading={connecting === provider.key}
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
};

export default MailServiceCard;
