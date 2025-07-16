import React, { createContext, useContext, useState, useCallback } from "react";

export interface CampaignBuilderContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  canGoNext: boolean;
  setCanGoNext: (can: boolean) => void;
  canGoBack: boolean;
  discard: () => void;
  save: () => void;
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

  // Placeholder discard/save logic
  const discard = useCallback(() => {
    // TODO: implement discard logic
    // e.g. show modal, reset state, etc.
    // Optionally reset canGoNext if needed
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
    </CampaignBuilderContext.Provider>
  );
};
