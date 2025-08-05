import { Typography, Button, Tag, Card, Space, Descriptions } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Campaign, CampaignStatus } from "@/types/campaign";

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
}

const { Title, Text } = Typography;

export const CampaignDetailView = ({
  campaign,
  onBack,
}: CampaignDetailViewProps) => {
  const getStatusTag = (status: CampaignStatus) => {
    const statusColors = {
      [CampaignStatus.DRAFT]: "blue",
      [CampaignStatus.ACTIVE]: "green",
      [CampaignStatus.PAUSED]: "orange",
      [CampaignStatus.COMPLETED]: "gray",
    };

    return (
      <Tag color={statusColors[status] || "default"}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Back to Campaigns
      </Button>

      <Title level={2}>Campaign Details</Title>

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

      <Card title="Campaign Details">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Current Step: </Text>
            <Text>{campaign.currentStep || "Not started"}</Text>
          </div>
          <div>
            <Text strong>Description: </Text>
            <Text>{campaign.description || "No description provided"}</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};
