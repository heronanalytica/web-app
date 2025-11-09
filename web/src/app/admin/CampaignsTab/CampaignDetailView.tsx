import { useState, useCallback } from "react";
import { Button, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { Campaign } from "@/types/campaign";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import BasicInfoCard from "./components/BasicInfoCard";
import CampaignProgressCard from "./components/CampaignProgressCard";
import ClassifiedPersonaCard from "./components/ClassifiedPersonaCard";
import CompanyProfileCard from "./components/CompanyProfileCard";
import styles from "./CampaignDetailView.module.scss";
import RenderedEmailsUploader from "./components/RenderedEmailsUploader";

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
}

const { Title } = Typography;

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaign: initialCampaign,
  onBack,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [campaign, setCampaign] = useState(initialCampaign);
  const { updateAnalysisStep, updateCampaignStep } = useAdminCampaigns();
  const [updatingStep, setUpdatingStep] = useState<string>();

  const handleStatusUpdate = useCallback(
    async (stepKey: string, status: string) => {
      if (!campaign.id) return;

      // Type guard to ensure status is valid
      const validStatus = ["waiting", "in_progress", "done", "error"].includes(
        status
      )
        ? (status as "waiting" | "in_progress" | "done" | "error")
        : null;

      if (!validStatus) {
        console.error("Invalid status:", status);
        return;
      }

      try {
        setUpdatingStep(stepKey);
        const updatedCampaign = await updateAnalysisStep(
          campaign.id,
          stepKey,
          validStatus
        );
        setCampaign(updatedCampaign);
        messageApi.success("Step status updated successfully");
      } catch (error) {
        console.error("Failed to update step status:", error);
        messageApi.error("Failed to update step status");
      } finally {
        setUpdatingStep(undefined);
      }
    },
    [campaign.id, updateAnalysisStep, messageApi]
  );

  const handleCampaignUpdate = (updates: Partial<Campaign>) => {
    setCampaign((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleStepComplete = useCallback(async () => {
    if (!campaign.id || !campaign.user?.id) return;

    try {
      setUpdatingStep("complete_analysis");
      // Move to the next step (step 4 - Company & Personas)
      const nextStep = 4;
      const updatedCampaign = await updateCampaignStep(
        campaign.user?.id,
        campaign.id,
        nextStep,
        campaign.stepState || {}
      );
      setCampaign(updatedCampaign);
      messageApi.success("Moved to Company & Personas step");
    } catch (error) {
      console.error("Failed to proceed to next step:", error);
      messageApi.error("Failed to proceed to next step");
    } finally {
      setUpdatingStep(undefined);
    }
  }, [campaign, messageApi, updateCampaignStep]);

  const handleNextFromTemplate = useCallback(async () => {
    if (!campaign.id || !campaign.user?.id) return;
    try {
      setUpdatingStep("advance_template");
      const nextStep = (campaign.currentStep ?? 0) + 1; // move to next
      const updatedCampaign = await updateCampaignStep(
        campaign.user.id,
        campaign.id,
        nextStep,
        campaign.stepState || {}
      );
      setCampaign(updatedCampaign);
      messageApi.success("Moved to next step");
    } catch (error) {
      console.error("Failed to advance step:", error);
      messageApi.error("Failed to advance step");
    } finally {
      setUpdatingStep(undefined);
    }
  }, [campaign, messageApi, updateCampaignStep]);

  return (
    <div className={styles.container}>
      {contextHolder}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Back to Campaigns
      </Button>

      <Title level={2}>Campaign Details</Title>

      <BasicInfoCard campaign={campaign} />

      <CampaignProgressCard
        campaign={campaign}
        onStatusUpdate={handleStatusUpdate}
        onStepComplete={
          campaign.currentStep === 3 ? handleStepComplete : undefined
        }
        onNextFromTemplate={handleNextFromTemplate}
        updatingStep={updatingStep}
      />

      <ClassifiedPersonaCard
        campaign={campaign}
        onUpdate={handleCampaignUpdate}
      />

      <CompanyProfileCard campaign={campaign} onUpdate={handleCampaignUpdate} />

      <RenderedEmailsUploader
        commonTemplate={campaign.stepState?.commonTemplate}
        customerTemplateInput={campaign.stepState?.generator}
        campaignId={campaign.id}
        onImported={(summary) => {
          // When import finishes, refresh the campaign’s stepState summary in local UI:
          setCampaign((prev) => ({
            ...prev,
            stepState: {
              ...(prev.stepState || {}),
              summary: {
                totalRecipients: summary?.totalRecipients ?? 0,
                byPersona: summary?.byPersona ?? {},
              },
            },
            updatedAt: new Date().toISOString(),
          }));
        }}
      />
    </div>
  );
};
