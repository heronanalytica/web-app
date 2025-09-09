import React from "react";
import { Button, Typography } from "antd";
import { BuildOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons";
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

interface DownloadFileButtonProps {
  fileId: string;
  fileName?: string;
  companyName: string;
  variant: "marketing-content" | "design-asset";
  text: string;
  title?: string;
  className?: string;
  messageApi: any;
}

const DownloadFileButton: React.FC<DownloadFileButtonProps> = ({
  fileId,
  fileName,
  companyName,
  variant,
  text,
  title,
  className,
  messageApi,
}) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetcher.raw(
        `/api/file/download/${encodeURIComponent(fileId)}`
      );
      if (!response.ok) {
        messageApi.error("Failed to download file");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeCompanyName(companyName)}-${variant}${
        fileName && fileName.includes(".")
          ? "." + fileName.split(".").pop()
          : ""
      }`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      messageApi.error("Failed to download file");
    }
  };
  return (
    <span
      title={title}
      className={`${className ?? ""} ${styles.downloadButton}`}
      onClick={handleDownload}
    >
      <FileOutlined className={styles.downloadButtonIcon} />
      <span className={styles.downloadButtonText}>{text}</span>
    </span>
  );
};

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
              <DownloadFileButton
                fileId={profile.marketingContentFileId}
                fileName={(profile as any).marketingContentFileName}
                companyName={profile.name}
                title="Download marketing content file"
                variant="marketing-content"
                text="Marketing Content"
                className={styles.downloadIcon}
                messageApi={messageApi}
              />
            )}
            {profile.designAssetFileId && (
              <DownloadFileButton
                fileId={profile.designAssetFileId}
                fileName={(profile as any).designAssetFileName}
                companyName={profile.name}
                title="Download design asset file"
                variant="design-asset"
                text="Design Asset"
                className={styles.downloadIcon}
                messageApi={messageApi}
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
