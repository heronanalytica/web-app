"use client";

import { useState } from "react";
import styles from "../../styles.module.scss";
import Steps from "../../components/Steps";

const NewCampaignPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const renderStepComponent = () => {
    switch (currentStep) {
      default:
        return <div />;
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
