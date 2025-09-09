import React from "react";
import { Typography, Timeline } from "antd";
import { DEFAULT_ANALYSIS_STEPS } from "./steps";
import styles from "./styles.module.scss";
import { AnalysisStep } from "@/types/campaign";

interface TemplateWaitingStepProps {
  steps?: AnalysisStep[];
}

const statusColorMap = {
  waiting: "#d9d9d9",
  in_progress: "#9254de",
  done: "#52c41a",
  error: "#ff4d4f",
};

export const TemplateWaitingStep: React.FC<TemplateWaitingStepProps> = ({
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
        The process can take up to 3-5 days. When the hyper personalized
        campaign is ready, we&apos;ll notify you.
      </Typography.Title>
      <Timeline items={timelineSteps} className={styles.timeline} />
    </div>
  );
};

export default TemplateWaitingStep;
