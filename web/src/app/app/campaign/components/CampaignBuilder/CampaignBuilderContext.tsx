import React, { createContext, useContext, useState, useCallback } from "react";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/fetcher";

import type { CampaignStepState } from "@/types/campaignStepState";

export interface CampaignBuilderContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  canGoNext: boolean;
  setCanGoNext: (can: boolean) => void;
  canGoBack: boolean;
  discard: () => void;
  save: () => Promise<void>;
  campaign: Campaign | null;
  stepState: CampaignStepState;
  setStepState: (s: CampaignStepState) => void;
  updateStepState: <K extends keyof CampaignStepState>(
    key: K,
    value: CampaignStepState[K],
    saveAfter?: boolean
  ) => void;
  removeStepState: <K extends keyof CampaignStepState>(key: K) => void;
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

// Hook for step components to get/set/remove their own state
export function useStepState<K extends keyof CampaignStepState>(key: K) {
  const { stepState, updateStepState, removeStepState } = useCampaignBuilder();
  return [
    stepState[key],
    (value: CampaignStepState[K], saveAfter?: boolean) =>
      updateStepState(key, value, saveAfter),
    () => removeStepState(key),
  ] as const;
}

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

  const [stepState, setStepState] = useState<CampaignStepState>(
    (campaign && (campaign as any).stepState) || {}
  );

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

  const saveDraft = useCallback(
    async (payload: { currentStep: number; stepState: CampaignStepState }) => {
      if (!campaign?.id) return;
      await fetcher.patch(`/api/campaigns/${campaign.id}/draft`, {
        id: campaign.id,
        currentStep: payload.currentStep,
        stepState: payload.stepState,
      });
    },
    [campaign]
  );

  const save = useCallback(async () => {
    await saveDraft({ currentStep, stepState });
  }, [currentStep, stepState, saveDraft]);

  // add saveAfter?: boolean here
  const updateStepState = useCallback(
    <K extends keyof CampaignStepState>(
      key: K,
      value: CampaignStepState[K],
      saveAfter?: boolean
    ) => {
      setStepState((prev) => {
        const next = { ...prev, [key]: value };
        if (saveAfter) {
          // save using the freshly computed state to avoid race conditions
          void saveDraft({ currentStep, stepState: next });
        }
        return next;
      });
    },
    [currentStep, saveDraft]
  );

  const removeStepState = <K extends keyof CampaignStepState>(key: K) => {
    setStepState((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _removed, ...rest } = prev;
      return rest as CampaignStepState;
    });
  };

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
    stepState,
    setStepState,
    updateStepState,
    removeStepState,
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
