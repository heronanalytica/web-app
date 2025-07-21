import React from "react";
import { Typography, Timeline, Card } from "antd";

const defaultSteps = [
  {
    key: "analyzingCustomerDatabase",
    label: "Analyzing customer database",
    status: "waiting",
  },
  {
    key: "analyzeBusinessData",
    label: "Analyze business data",
    status: "waiting",
  },
  {
    key: "integrationsWithOtherPlatforms",
    label: "Integrations with other platforms",
    status: "waiting",
  },
  {
    key: "wrappingUp",
    label: "Wrapping up",
    status: "waiting",
  },
];

export interface AnalysisStep {
  key: string;
  label: string;
  status: "waiting" | "in_progress" | "done" | "error";
}

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
  const timelineSteps = (steps || defaultSteps).map((step, idx) => ({
    color:
      statusColorMap[step.status as keyof typeof statusColorMap] || "#d9d9d9",
    dot: (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: step.status === "in_progress" ? "#f3f0ff" : "#f5f6fa",
          border:
            step.status === "in_progress"
              ? "2px solid #9254de"
              : "2px solid #d9d9d9",
          color: step.status === "in_progress" ? "#9254de" : "#8c8c8c",
          fontWeight: step.status === "in_progress" ? 600 : 400,
          fontSize: 18,
        }}
      >
        {idx + 1}
      </span>
    ),
    children: (
      <span
        style={{
          fontWeight: step.status === "in_progress" ? 600 : 400,
          color: step.status === "in_progress" ? "#2d1a6b" : "#222",
          fontSize: 18,
          textDecoration: step.status === "done" ? "line-through" : undefined,
        }}
      >
        {step.label}
      </span>
    ),
  }));

  return (
    <Card style={{ maxWidth: 600, margin: "40px auto", padding: 32 }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        The process can take up to 1-2 weeks. When the hyper personalization
        engine is ready, we&apos;ll notify you.
      </Typography.Title>
      <Timeline items={timelineSteps} style={{ marginTop: 32 }} />
    </Card>
  );
};

export default AnalysisWaitingStep;
