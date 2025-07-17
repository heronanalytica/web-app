import React, { createContext, useContext, useState, useCallback } from "react";
import { Modal } from "antd";
import { useRouter } from "next/navigation";

export interface CampaignBuilderContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  canGoNext: boolean;
  setCanGoNext: (can: boolean) => void;
  canGoBack: boolean;
  discard: () => void;
  save: () => void;
  campaign: Campaign | null;
}

const CampaignBuilderContext = createContext<
  CampaignBuilderContextType | undefined
>(undefined);

export const useCampaignBuilder = () => {
  const ctx = useContext(CampaignBuilderContext);
  if (!ctx)
    throw new Error(
      "useCampaignBuilder must be used within CampaignBuilderProvider"
    );
  return ctx;
};

import type { Campaign } from "@/types/campaign";
import { ROUTES } from "@/constants/routes";

export const CampaignBuilderProvider: React.FC<{
  campaign: Campaign | null;
  totalSteps: number;
  children: React.ReactNode;
}> = ({ campaign, totalSteps, children }) => {
  // Some campaign objects may not have currentStep (for non-draft campaigns)
  // Use (campaign as any).currentStep to suppress TS error
  const [currentStep, setCurrentStep] = useState<number>(
    campaign && typeof (campaign as any).currentStep === "number"
      ? (campaign as any).currentStep
      : 0
  );
  const [canGoNext, setCanGoNext] = useState(false);

  const canGoBack = currentStep > 0;

  // Implement discard: context-aware Modal
  const router = useRouter();
  const [discardModalVisible, setDiscardModalVisible] = useState(false);
  const discard = useCallback(() => {
    setDiscardModalVisible(true);
  }, []);
  const handleDiscardOk = useCallback(() => {
    setDiscardModalVisible(false);
    router.push(ROUTES.APP_HOMEPAGE);
    setCanGoNext(false);
  }, [router, setCanGoNext]);
  const handleDiscardCancel = useCallback(() => {
    setDiscardModalVisible(false);
  }, []);

  const save = useCallback(() => {
    // TODO: implement save logic
  }, []);

  const value: CampaignBuilderContextType & { campaign: Campaign | null } = {
    currentStep,
    setCurrentStep,
    totalSteps,
    canGoNext,
    setCanGoNext,
    canGoBack,
    discard,
    save,
    campaign,
  };

  return (
    <CampaignBuilderContext.Provider value={value}>
      {children}
      <Modal
        open={discardModalVisible}
        title="Discard Campaign?"
        okText="Discard"
        okType="danger"
        cancelText="Cancel"
        onOk={handleDiscardOk}
        onCancel={handleDiscardCancel}
      >
        Are you sure you want to discard this campaign draft and return to the
        campaign list? All unsaved changes will be lost.
      </Modal>
    </CampaignBuilderContext.Provider>
  );
};
