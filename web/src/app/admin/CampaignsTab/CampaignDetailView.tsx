import { useState, useCallback } from "react";
import { Button, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { Campaign } from "@/types/campaign";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import BasicInfoCard from "./components/BasicInfoCard";
import CampaignProgressCard from "./components/CampaignProgressCard";
import ClassifiedPersonaCard from "./components/ClassifiedPersonaCard";
import styles from "./CampaignDetailView.module.scss";

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
}

const { Title } = Typography;

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaign: initialCampaign,
  onBack,
}) => {
  const [campaign, setCampaign] = useState(initialCampaign);
  const { updateAnalysisStep } = useAdminCampaigns();
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
      } catch (error) {
        console.error("Failed to update step status:", error);
        message.error("Failed to update step status");
      } finally {
        setUpdatingStep(undefined);
      }
    },
    [campaign.id, updateAnalysisStep]
  );

  const handleCampaignUpdate = (updates: Partial<Campaign>) => {
    setCampaign((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className={styles.container}>
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
        updatingStep={updatingStep}
      />

      <ClassifiedPersonaCard
        campaign={campaign}
        onUpdate={handleCampaignUpdate}
      />
    </div>
  );
};
