import {
  Typography,
  Button,
  Tag,
  Card,
  Space,
  Descriptions,
  Steps,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Campaign, CampaignStatus, AnalysisStep } from "@/types/campaign";
import { stepTitles } from "@/app/app/campaign/components/CampaignBuilder/constants";
import styles from "./CampaignsTab.module.scss";

const { Step } = Steps;

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
}

const { Title, Text } = Typography;

export const getStepStatus = (status: string) => {
  switch (status) {
    case "done":
      return "finish";
    case "in_progress":
      return "process";
    case "error":
      return "error";
    default:
      return "wait";
  }
};

const getStepIcon = (status: string) => {
  switch (status) {
    case "done":
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    case "in_progress":
      return <SyncOutlined spin style={{ color: "#1890ff" }} />;
    case "error":
      return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
    default:
      return <ClockCircleOutlined style={{ color: "#8c8c8c" }} />;
  }
};

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

      <Card title="Campaign Progress" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Current Step: </Text>
            <Text>
              {campaign.currentStep
                ? `${stepTitles[campaign.currentStep] || campaign.currentStep}`
                : "Not started"}
            </Text>
          </div>

          {campaign.currentStep === 3 && campaign.analysisSteps && (
            <div className={styles.analysisSteps}>
              <Text strong>Analysis Progress:</Text>
              <Steps
                direction="vertical"
                current={-1}
                className={styles.stepsContainer}
              >
                {campaign.analysisSteps.map((step: AnalysisStep) => (
                  <Step
                    key={step.key}
                    title={step.label}
                    status={getStepStatus(step.status)}
                    icon={getStepIcon(step.status)}
                  />
                ))}
              </Steps>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};
