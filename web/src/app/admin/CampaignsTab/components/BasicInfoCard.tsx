import { Card, Descriptions, Tag } from "antd";
import { Campaign } from "@/types/campaign";
import { CampaignStatus } from "@/types/campaign";

interface BasicInfoCardProps {
  campaign: Campaign;
}

const getStatusTag = (status: CampaignStatus) => {
  const statusColors = {
    [CampaignStatus.DRAFT]: "blue",
    [CampaignStatus.ACTIVE]: "green",
    [CampaignStatus.PAUSED]: "orange",
    [CampaignStatus.COMPLETED]: "gray",
  };

  return (
    <Tag color={statusColors[status] || "default"}>{status.toUpperCase()}</Tag>
  );
};

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ campaign }) => {
  return (
    <Card title="Basic Information" style={{ marginBottom: 24 }}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{campaign.name}</Descriptions.Item>
        <Descriptions.Item label="Status">
          {getStatusTag(campaign.status)}
        </Descriptions.Item>
        <Descriptions.Item label="Created By">
          {campaign.user?.email || "Unknown"}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(campaign.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {new Date(campaign.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default BasicInfoCard;
