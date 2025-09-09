import React from "react";
import { Typography, Timeline } from "antd";
import { DEFAULT_ANALYSIS_STEPS } from "./steps";
import styles from "./styles.module.scss";
import { AnalysisStep } from "@/types/campaign";

interface AnalysisWaitingStepProps {
  steps?: AnalysisStep[];
}

const statusColorMap = {
  waiting: "#d9d9d9",
  in_progress: "#9254de",
  done: "#52c41a",
  error: "#ff4d4f",
};

export const AnalysisWaitingStep: React.FC<AnalysisWaitingStepProps> = ({
  steps,
}) => {
  const timelineSteps = (steps || DEFAULT_ANALYSIS_STEPS).map((step, idx) => ({
    color:
      statusColorMap[step.status as keyof typeof statusColorMap] || "#d9d9d9",
    dot: (
      <span className={[styles.dot, styles[`dot--${step.status}`]].join(" ")}>
        {idx + 1}
      </span>
    ),
    children: (
      <span
        className={[styles.label, styles[`label--${step.status}`]].join(" ")}
      >
        {step.label}
      </span>
    ),
  }));

  return (
    <div className={styles.root}>
      <Typography.Title level={4} className={styles.title}>
        The process can take up to 1-2 weeks. When the hyper personalization
        engine is ready, we&apos;ll notify you.
      </Typography.Title>
      <Timeline items={timelineSteps} className={styles.timeline} />
    </div>
  );
};

export default AnalysisWaitingStep;
