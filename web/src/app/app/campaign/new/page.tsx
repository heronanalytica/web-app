"use client";

import { Button, Modal } from "antd";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Steps from "../../components/Steps";
import CustomerFileStep from "../components/CustomerFileStep";
import { MailServiceConnectStep } from "../components/MailServiceConnectStep";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

const NewCampaignPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const router = useRouter();

  const handleFileSelected = () => {
    setCurrentStep(1);
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <CustomerFileStep onFileSelected={handleFileSelected} />;
      case 1:
        return <MailServiceConnectStep />;
      default:
        return <div />;
    }
  };

  const [discardModalVisible, setDiscardModalVisible] = React.useState(false);

  const handleDiscard = () => setDiscardModalVisible(true);
  const handleDiscardConfirm = () => {
    setDiscardModalVisible(false);
    router.push(ROUTES.APP_HOMEPAGE);
  };
  const handleDiscardCancel = () => setDiscardModalVisible(false);

  return (
    <>
      <div className={styles.appContainer}>
        <Steps totalSteps={5} active={currentStep} />
        <div className={styles.componentContainer}>{renderStepComponent()}</div>
        <div className={styles.appFooter}>
          <Button danger onClick={handleDiscard}>
            Discard
          </Button>
        </div>
      </div>
      <Modal
        open={discardModalVisible}
        title="Discard changes?"
        onOk={handleDiscardConfirm}
        onCancel={handleDiscardCancel}
        okText="Discard"
        cancelText="Cancel"
        okButtonProps={{ type: "primary", danger: true }}
      >
        <p>
          Are you sure you want to discard your changes? This action cannot be
          undone.
        </p>
      </Modal>
    </>
  );
};

export default NewCampaignPage;
