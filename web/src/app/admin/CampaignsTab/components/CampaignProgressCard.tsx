import {
  Card,
  Steps,
  Typography,
  Dropdown,
  Button,
  Space,
  MenuProps,
} from "antd";
import {
  SyncOutlined,
  DownOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { AnalysisStep } from "@/types/campaign";
import { stepTitles } from "@/app/app/campaign/components/CampaignBuilder/constants";
import styles from "./CampaignProgressCard.module.scss";

const { Step } = Steps;
const { Text } = Typography;

interface CampaignProgressCardProps {
  campaign: {
    currentStep?: number;
    analysisSteps?: AnalysisStep[];
  };
  onStatusUpdate: (stepKey: string, status: string) => void;
  onStepComplete?: () => void;
  onNextFromTemplate?: () => void;
  updatingStep?: string;
}

const getStepStatus = (status: string) => {
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
      return <div style={{ color: "#52c41a" }}>✓</div>;
    case "in_progress":
      return <SyncOutlined spin style={{ color: "#1890ff" }} />;
    case "error":
      return <div style={{ color: "#ff4d4f" }}>✕</div>;
    default:
      return null;
  }
};

const CampaignProgressCard: React.FC<CampaignProgressCardProps> = ({
  campaign,
  onStatusUpdate,
  onStepComplete,
  onNextFromTemplate,
  updatingStep,
}) => {
  const allStepsDone =
    campaign.analysisSteps?.every((step) => step.status === "done") || false;
  const atAnalysisStep = campaign.currentStep === 3;
  const atTemplateWaitingStep = campaign.currentStep === 7;
  const getStatusMenuItems = (): MenuProps["items"] => [
    {
      key: "waiting",
      icon: <ClockCircleOutlined />,
      label: "Set as Waiting",
    },
    {
      key: "in_progress",
      icon: <SyncOutlined spin />,
      label: "Set as In Progress",
    },
    {
      type: "divider",
    },
    {
      key: "done",
      icon: <CheckOutlined style={{ color: "#52c41a" }} />,
      label: "Mark as Done",
    },
    {
      key: "error",
      icon: <CloseOutlined style={{ color: "#ff4d4f" }} />,
      label: "Mark as Error",
    },
  ];

  return (
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

        {atAnalysisStep && campaign.analysisSteps && (
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
                        menu={{
                          items: getStatusMenuItems(),
                          onClick: ({ key }) => {
                            if (!isUpdating) {
                              onStatusUpdate(step.key, key);
                            }
                          },
                        }}
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
              {onStepComplete && atAnalysisStep && (
                <div style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    onClick={onStepComplete}
                    disabled={
                      !allStepsDone || updatingStep === "complete_analysis"
                    }
                    loading={updatingStep === "complete_analysis"}
                  >
                    {updatingStep === "complete_analysis"
                      ? "Processing..."
                      : "Proceed to next step"}
                  </Button>
                  {!allStepsDone && (
                    <div
                      style={{
                        marginTop: 8,
                        color: "rgba(0, 0, 0, 0.45)",
                        fontSize: 12,
                      }}
                    >
                      Complete all analysis steps to proceed
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {atTemplateWaitingStep && onNextFromTemplate && (
          <div style={{ marginTop: 8 }}>
            <Button
              type="primary"
              onClick={onNextFromTemplate}
              loading={updatingStep === "advance_template"}
            >
              Next Step
            </Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default CampaignProgressCard;
