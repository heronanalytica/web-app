"use client";

import React from "react";
import { Card, Empty, Tag } from "antd";
import { useRouter } from "next/navigation";
import styles from "./style.module.scss";

import { Campaign } from "@/types/campaign";

interface CampaignListProps {
  campaigns: Campaign[];
}

const statusColor: Record<string, string> = {
  DRAFT: "default",
  ACTIVE: "green",
  PAUSED: "orange",
  COMPLETED: "blue",
};

const CampaignList: React.FC<CampaignListProps> = ({ campaigns }) => {
  const router = useRouter();
  if (!campaigns.length) {
    return (
      <div className={styles.emptyState}>
        <Empty
          description="No campaigns found."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className={styles.campaignList}>
      {campaigns.map((campaign) => (
        <Card
          key={campaign.id}
          className={styles.campaignCard}
          bordered={false}
          hoverable
          onClick={() => router.push(`/app/campaign/${campaign.id}`)}
          style={{ cursor: "pointer" }}
        >
          <div className={styles.campaignHeader}>
            <span className={styles.campaignName}>{campaign.name}</span>
            <Tag
              color={statusColor[campaign.status] || "default"}
              className={styles.statusTag}
            >
              {campaign.status}
            </Tag>
          </div>
          <div className={styles.campaignMeta}>
            Created: {new Date(campaign.createdAt).toLocaleString()}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CampaignList;
