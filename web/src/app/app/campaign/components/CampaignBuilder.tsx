"use client";

import React from "react";
import { Spin, Button } from "antd";
import {
  CampaignBuilderProvider,
  useCampaignBuilder,
} from "./CampaignBuilderContext";
import styles from "../new/styles.module.scss";
import Steps from "../../components/Steps";
import CustomerFileStep from "./CustomerFileStep";
import { MailServiceConnectStep } from "./MailServiceConnectStep";

import { Campaign } from "@/types/campaign";

interface CampaignBuilderProps {
  campaign: Campaign | null;
  loading: boolean;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({
  campaign,
  loading,
}) => {
  // Use context for step state and navigation
  return (
    <CampaignBuilderProvider campaign={campaign} totalSteps={5}>
      <CampaignBuilderInner loading={loading} />
    </CampaignBuilderProvider>
  );
};

const CampaignBuilderInner: React.FC<{ loading: boolean }> = ({ loading }) => {
  const {
    currentStep,
    setCurrentStep,
    totalSteps,
    canGoNext,
    canGoBack,
    discard,
    save,
  } = useCampaignBuilder();
  // Handler for Next/Continue
  const handleNext = () => {
    if (canGoNext) setCurrentStep(currentStep + 1);
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <CustomerFileStep />;
      case 1:
        return <MailServiceConnectStep />;
      default:
        return <div />;
    }
  };

  if (loading) return <Spin fullscreen />;

  return (
    <>
      <div className={styles.appContainer}>
        <Steps totalSteps={5} active={currentStep} />
        <div className={styles.componentContainer}>{renderStepComponent()}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 24,
          }}
        >
          <Button
            onClick={() =>
              setCurrentStep(currentStep > 0 ? currentStep - 1 : 0)
            }
            disabled={!canGoBack}
          >
            Back
          </Button>
          <Button danger onClick={discard}>
            Discard
          </Button>
          <Button type="primary" onClick={save}>
            Save
          </Button>
          {/* Next/Continue button, hide on last step */}
          {currentStep < totalSteps - 1 && (
            <Button type="primary" onClick={handleNext} disabled={!canGoNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
