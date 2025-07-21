import React from "react";
import { Button, Typography } from "antd";
import {
  BuildOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CompanyProfileDto } from "@/types/campaignStepState";
import styles from "./styles.module.scss";
import { message } from "antd";

dayjs.extend(relativeTime);

interface CompanyProfileListItemProps {
  profile: CompanyProfileDto;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (profile: CompanyProfileDto) => void;
}

function sanitizeCompanyName(name: string): string {
  return name.replace(/\s+/g, "").toLowerCase();
}

export const CompanyProfileListItem: React.FC<CompanyProfileListItemProps> = ({
  profile,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(profile);
  };

  return (
    <div
      className={`${styles.profileItem} ${isSelected ? styles.selected : ""}`}
      onClick={() => onSelect(profile.id)}
    >
      {contextHolder}
      <div className={styles.profileInfo}>
        <div className={styles.profileIcon}>
          <BuildOutlined style={{ fontSize: "18px", color: "#666" }} />
        </div>
        <div className={styles.profileContent}>
          <Typography.Text strong>{profile.name}</Typography.Text>
          <Typography.Text type="secondary" className={styles.profileWebsite}>
            {profile.website}
          </Typography.Text>
          <div className={styles.profileDownloads}>
            {profile.marketingContentFileId && (
              <DownloadOutlined
                title="Download marketing content file"
                className={styles.downloadIcon}
                onClick={async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  try {
                    const response = await fetcher.raw(
                      `/api/file/download/${encodeURIComponent(
                        profile.marketingContentFileId
                      )}`
                    );
                    if (!response.ok) {
                      messageApi.error("Failed to download file");
                      return;
                    }
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${sanitizeCompanyName(
                      profile.name
                    )}-marketing-content${
                      (profile as any).marketingContentFileName &&
                      (profile as any).marketingContentFileName.includes(".")
                        ? "." +
                          (profile as any).marketingContentFileName
                            .split(".")
                            .pop()
                        : ""
                    }`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch {
                    messageApi.error("Failed to download file");
                  }
                }}
              />
            )}
            {profile.designAssetFileId && (
              <DownloadOutlined
                title="Download design asset file"
                className={styles.downloadIcon}
                style={{ marginLeft: 8 }}
                onClick={async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  try {
                    const response = await fetcher.raw(
                      `/api/file/download/${encodeURIComponent(
                        profile.designAssetFileId
                      )}`
                    );
                    if (!response.ok) {
                      messageApi.error("Failed to download file");
                      return;
                    }
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${profile.name
                      .replace(/\s+/g, "")
                      .toLowerCase()}-design-asset${
                      (profile as any).designAssetFileName &&
                      (profile as any).designAssetFileName.includes(".")
                        ? "." +
                          (profile as any).designAssetFileName.split(".").pop()
                        : ""
                    }`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch {
                    messageApi.error("Failed to download file");
                  }
                }}
              />
            )}
          </div>
          {profile.businessInfo && (
            <Typography.Text
              type="secondary"
              className={styles.profileDescription}
            >
              {profile.businessInfo}
            </Typography.Text>
          )}
          {profile.createdAt && (
            <Typography.Text type="secondary" className={styles.profileDate}>
              Created {dayjs(profile.createdAt).fromNow()}
            </Typography.Text>
          )}
        </div>
        <div className={styles.profileActions}>
          {isSelected && (
            <span className={styles.selectedBadge}>
              <Typography.Text type="secondary" italic>
                Selected
              </Typography.Text>
            </span>
          )}
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            onClick={handleDelete}
            className={styles.deleteButton}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileListItem;
