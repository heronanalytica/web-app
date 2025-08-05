import { useState, useCallback } from "react";
import {
  Typography,
  Button,
  Tag,
  Card,
  Space,
  Descriptions,
  Steps,
  Dropdown,
  Menu,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  DownOutlined,
  CheckOutlined,
  CloseOutlined,
  SyncOutlined as SyncOutlinedSpin,
} from "@ant-design/icons";
import { Campaign, CampaignStatus, AnalysisStep } from "@/types/campaign";
import { stepTitles } from "@/app/app/campaign/components/CampaignBuilder/constants";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import CustomerPersonaUploader from "./CustomerPersonaUploader";
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
  campaign: initialCampaign,
  onBack,
}: CampaignDetailViewProps) => {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const { updateAnalysisStep } = useAdminCampaigns();

  const handleStatusUpdate = useCallback(
    async (
      stepKey: string,
      status: "waiting" | "in_progress" | "done" | "error"
    ) => {
      if (!campaign?.id) return;

      try {
        setUpdatingStep(stepKey);
        const updatedCampaign = await updateAnalysisStep(
          campaign.id,
          stepKey,
          status
        );

        setCampaign(updatedCampaign);
        message.success(`Updated status for step`);
      } catch (error) {
        console.error("Failed to update step status:", error);
        message.error("Failed to update step status");
      } finally {
        setUpdatingStep(null);
      }
    },
    [campaign?.id, updateAnalysisStep]
  );

  const getStatusMenu = (step: AnalysisStep) => (
    <Menu
      onClick={({ key }) => handleStatusUpdate(step.key, key as any)}
      disabled={updatingStep === step.key}
    >
      <Menu.Item key="waiting" icon={<ClockCircleOutlined />}>
        Set as Waiting
      </Menu.Item>
      <Menu.Item key="in_progress" icon={<SyncOutlinedSpin />}>
        Set as In Progress
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="done"
        icon={<CheckOutlined style={{ color: "#52c41a" }} />}
      >
        Mark as Done
      </Menu.Item>
      <Menu.Item
        key="error"
        icon={<CloseOutlined style={{ color: "#ff4d4f" }} />}
      >
        Mark as Error
      </Menu.Item>
    </Menu>
  );

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
              <div className={styles.stepsContainer}>
                <Steps direction="vertical" current={-1}>
                  {campaign.analysisSteps.map((step: AnalysisStep) => {
                    const isUpdating = updatingStep === step.key;
                    const stepTitle = (
                      <div className={styles.stepTitleRow}>
                        <div className={styles.stepLabel}>{step.label}</div>
                        <Dropdown
                          overlay={getStatusMenu(step)}
                          trigger={["click"]}
                          disabled={isUpdating}
                        >
                          <Button type="text" size="small" loading={isUpdating}>
                            {isUpdating ? "Updating..." : "Update Status"}{" "}
                            <DownOutlined />
                          </Button>
                        </Dropdown>
                      </div>
                    );

                    return (
                      <Step
                        key={step.key}
                        title={stepTitle}
                        status={getStepStatus(step.status)}
                        icon={
                          isUpdating ? (
                            <SyncOutlined spin />
                          ) : (
                            getStepIcon(step.status)
                          )
                        }
                      />
                    );
                  })}
                </Steps>
              </div>
            </div>
          )}
        </Space>
      </Card>

      <Card
        title="Classified Customers Persona"
        style={{ marginBottom: 24 }}
        className={styles.sectionCard}
      >
        <div className={styles.sectionDescription}>
          <Text type="secondary">
            Upload a CSV file containing classified customer persona data. This
            data will be used for analysis and reporting.
          </Text>
        </div>
        <CustomerPersonaUploader
          campaignId={campaign.id}
          initialFileId={campaign.stepState?.classifiedPersonaFile?.fileId}
          initialFileName={campaign.stepState?.classifiedPersonaFile?.fileName}
          onUploadSuccess={(fileId, fileName) => {
            // Update local campaign state to reflect the new file
            setCampaign((prev) => ({
              ...prev,
              classifiedPersonaFileId: fileId,
              stepState: {
                ...prev.stepState,
                classifiedPersonaFile: {
                  fileId,
                  fileName,
                },
              },
            }));
          }}
          onDelete={() => {
            // Update local campaign state to remove the file reference
            setCampaign((prev) => ({
              ...prev,
              classifiedPersonaFileId: undefined,
              stepState: {
                ...prev.stepState,
                classifiedPersonaFile: undefined,
              },
            }));
          }}
        />
      </Card>
    </div>
  );
};
