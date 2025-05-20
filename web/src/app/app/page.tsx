"use client";

import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Steps from "./components/Steps";
import IntakeQuestionStep from "./components/IntakeQuestionStep";

const App = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (loading) {
    return <Spin fullscreen />;
  }
  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return;
  }

  const renderStepComponent = () => {
    switch (currentStep) {
      default:
        return <IntakeQuestionStep />;
    }
  };

  return (
    <div className={styles.appContainer}>
      <Steps totalSteps={4} active={currentStep} />
      <div className={styles.componentContainer}>{renderStepComponent()}</div>
    </div>
  );
};

export default App;
