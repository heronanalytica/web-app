"use client";

import React, { useEffect } from "react";
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
import CompanyProfileStep from "../CompanyProfileStep";
import AnalysisWaitingStep from "../AnalysisWaitingStep";
import { FontPoppins } from "@/assets/fonts/poppins";
import { message } from "antd";
import { Campaign } from "@/types/campaign";
import { CAMPAIGN_TOTAL_STEPS, stepTitles } from "./constants";
import CompanyAndPersonasStep from "../CompanyAndPersonasStep";
import CampaignSetupStep from "../CampaignSetupStep";
import ReviewTemplateConfirmStep from "../ReviewTemplateConfirmStep";
import TemplateWaitingStep from "../TemplateWaitingStep";
import PersonalizationGridStep from "../PersonalizationGridStep";

interface CampaignBuilderProps {
  campaign: Campaign | null;
  loading: boolean;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({
  campaign,
  loading,
}) => {
  return (
    <CampaignBuilderProvider
      campaign={campaign}
      totalSteps={CAMPAIGN_TOTAL_STEPS}
    >
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
    runBeforeNext,
    launchCampaign,
  } = useCampaignBuilder();
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [pendingSave, setPendingSave] = React.useState(false);

  const isAtPersonalizationGridStep = currentStep === 8;
  const saveBtnText = isAtPersonalizationGridStep ? "Launch Campaign" : "Save";

  useEffect(() => {
    if (pendingSave) {
      save();
      setPendingSave(false);
    }
  }, [pendingSave, save]);

  // Handler for Next/Continue
  const handleNext = async () => {
    if (canGoNext) {
      try {
        setSaveLoading(true);
        await runBeforeNext();
        setCurrentStep(currentStep + 1);
        setPendingSave(true);
      } catch (err: any) {
        messageApi.error(
          err?.message || "There was an error auto save the campaign"
        );
      } finally {
        setSaveLoading(false);
      }
    }
  };

  // Handler for Save/Launch campaign with loading and message
  const handleSave = async () => {
    setSaveLoading(true);

    try {
      if (isAtPersonalizationGridStep) {
        await launchCampaign();
      } else {
        await save();
      }
      messageApi.success(
        isAtPersonalizationGridStep
          ? "Campaign launched successfully"
          : "Campaign saved successfully"
      );
    } catch (err: any) {
      messageApi.error(
        err?.message ||
          (isAtPersonalizationGridStep
            ? "Failed to launch campaign"
            : "Failed to save campaign")
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <CustomerFileStep />;
      case 1:
        return <MailServiceConnectStep />;
      case 2:
        return <CompanyProfileStep />;
      case 3:
        return (
          <AnalysisWaitingStep steps={campaign?.analysisSteps || undefined} />
        );
      case 4:
        return <CompanyAndPersonasStep />;
      case 5:
        return <CampaignSetupStep />;
      case 6:
        return <ReviewTemplateConfirmStep />;
      case 7:
        return <TemplateWaitingStep />;
      case 8:
        return <PersonalizationGridStep />;
      default:
        return (
          <div>
            Step {stepTitles[currentStep] || currentStep + 1} is not implemented
            yet
          </div>
        );
    }
  };

  if (loading) return <Spin fullscreen />;

  const hideFooter = currentStep === 3;
  return (
    <>
      {contextHolder}
      {saveLoading && <Spin fullscreen />}
      <div className={styles.appContainer}>
        <Steps totalSteps={CAMPAIGN_TOTAL_STEPS} active={currentStep} />
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
            <Button danger onClick={discard} disabled={saveLoading}>
              Discard
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saveLoading}
              disabled={saveLoading || currentStep === 3}
            >
              {saveBtnText}
            </Button>
          </div>
        </div>
        <div className={styles.componentContainer}>{renderStepComponent()}</div>

        {!hideFooter && (
          <div className={styles.footerActions}>
            {currentStep !== 4 && currentStep !== 8 && (
              <Button
                onClick={() =>
                  setCurrentStep(currentStep > 0 ? currentStep - 1 : 0)
                }
                disabled={!canGoBack || saveLoading}
              >
                Back
              </Button>
            )}
            {currentStep < totalSteps - 1 && (
              <Button
                type="primary"
                onClick={handleNext}
                disabled={!canGoNext || saveLoading}
                loading={saveLoading}
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
