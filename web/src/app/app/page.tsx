"use client";

import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Steps from "./components/Steps";
import IntakeQuestionStep from "./components/IntakeQuestionStep";
import SurveyPreview from "./components/SurveyPreview";

import { useSearchParams } from "next/navigation";
import TestTableau from "./components/TestTableau";

const App = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const searchParams = useSearchParams();

  const isTestingTableau = searchParams.get("test_tableau") === "true";

  useEffect(() => {
    if (isTestingTableau) {
      setCurrentStep(4);
    }
  }, [isTestingTableau]);

  if (loading) {
    return <Spin fullscreen />;
  }
  if (!isTestingTableau && !isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return;
  }

  const renderStepComponent = () => {
    if (isTestingTableau) {
      return <TestTableau />;
    }

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

export default App;
