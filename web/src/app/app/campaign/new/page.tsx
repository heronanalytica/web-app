"use client";

import { useState } from "react";
import styles from "../../styles.module.scss";
import Steps from "../../components/Steps";

import CustomerFileStep from "../components/CustomerFileStep";

const NewCampaignPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedCustomerFile, setSelectedCustomerFile] = useState<
    string | null
  >(null);

  const handleFileSelected = (fileId: string) => {
    setSelectedCustomerFile(fileId);
    setCurrentStep(1); // Advance to next step
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <CustomerFileStep onFileSelected={handleFileSelected} />;
      case 1:
        return <div>Step 2: Mailchimp connection (coming soon)</div>;
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
