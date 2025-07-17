"use client";

import React from "react";
import { Spin, Button } from "antd";
import DeleteDraftButton from "./DeleteDraftButton";
import {
  CampaignBuilderProvider,
  useCampaignBuilder,
} from "./CampaignBuilderContext";
import styles from "./styles.module.scss";
import Steps from "../../../components/Steps";
import CustomerFileStep from "../CustomerFileStep";
import { MailServiceConnectStep } from "../MailServiceConnectStep";
import { FontPoppins } from "@/assets/fonts/poppins";
import { message } from "antd";
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
  const { campaign } = useCampaignBuilder();
  const {
    currentStep,
    setCurrentStep,
    totalSteps,
    canGoNext,
    canGoBack,
    discard,
    save,
  } = useCampaignBuilder();
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Handler for Next/Continue
  const handleNext = () => {
    if (canGoNext) setCurrentStep(currentStep + 1);
  };

  // Handler for Save with loading and message
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await save();
      messageApi.success("Draft saved successfully");
    } catch (err: any) {
      messageApi.error(err?.message || "Failed to save draft");
    } finally {
      setSaveLoading(false);
    }
  };

  const stepTitles = [
    "Upload Customer File",
    "Connect Mail Service",
    "Configure Email Content",
    "Review & Confirm",
    "Launch Campaign",
  ];

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
      {contextHolder}
      <div className={styles.appContainer}>
        <Steps totalSteps={5} active={currentStep} />
        <div className={styles.stepHeaderBox}>
          <h2 className={styles.stepTitle + " " + FontPoppins.className}>
            {stepTitles[currentStep]}
          </h2>
          <div className={styles.headerActions}>
            {campaign?.id && (
              <DeleteDraftButton
                campaignId={campaign.id}
                className={styles.deleteDraftBtn}
              />
            )}
            <Button danger onClick={discard}>
              Discard
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saveLoading}
              disabled={saveLoading}
            >
              Save
            </Button>
          </div>
        </div>
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
