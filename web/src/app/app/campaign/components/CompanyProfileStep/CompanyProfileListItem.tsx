import React from "react";
import { Button, Typography } from "antd";
import { BuildOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CompanyProfileDto } from "@/types/campaignStepState";
import styles from "./styles.module.scss";

dayjs.extend(relativeTime);

interface CompanyProfileListItemProps {
  profile: CompanyProfileDto;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (profile: CompanyProfileDto) => void;
}

export const CompanyProfileListItem: React.FC<CompanyProfileListItemProps> = ({
  profile,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(profile);
  };

  return (
    <div
      className={`${styles.profileItem} ${isSelected ? styles.selected : ""}`}
      onClick={() => onSelect(profile.id)}
    >
      <div className={styles.profileInfo}>
        <div className={styles.profileIcon}>
          <BuildOutlined style={{ fontSize: "18px", color: "#666" }} />
        </div>
        <div className={styles.profileContent}>
          <div className={styles.profileHeader}>
            <Typography.Text strong>{profile.website}</Typography.Text>
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
