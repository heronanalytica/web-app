"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useState } from "react";
import { Button, Spin, message } from "antd";
import styles from "../../styles.module.scss";
import SurveyPreview from "../../components/SurveyPreview";
import IntakeQuestionStep from "../../components/IntakeQuestionStep";
import Steps from "../../components/Steps";

const NewCampaignPage = () => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // const handleCreateCampaign = async () => {
  //   setCreating(true);
  //   try {
  //     const res = await fetch("/api/campaigns", {
  //       method: "POST",
  //       credentials: "include",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ name: `Untitled Campaign ${Date.now()}` }),
  //     });
  //     if (!res.ok) throw new Error("Failed to create campaign");
  //     message.success("Campaign created!");
  //     router.push(ROUTES.APP_HOMEPAGE);
  //   } catch (err: any) {
  //     message.error(err.message || "Failed to create campaign");
  //   } finally {
  //     setCreating(false);
  //   }
  // };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <SurveyPreview />;
      default:
        return (
          <IntakeQuestionStep
            onSuccess={() => setCurrentStep((value) => value + 1)}
          />
        );
    }
  };

  return (
    <div className={styles.appContainer}>
      <Steps totalSteps={5} active={currentStep} />
      <div className={styles.componentContainer}>{renderStepComponent()}</div>
    </div>
  );
};

export default NewCampaignPage;
