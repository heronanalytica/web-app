import React, { useEffect, useState } from "react";
import { Card, Tabs } from "antd";
import styles from "./styles.module.scss";
import TemplateGenerator from "./components/TemplateGenerator";
import TemplatePreview from "./components/TemplatePreview";
import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";
import { fetcher } from "@/lib/fetcher";
import UploadTemplate from "./components/UploadTemplate";

const GenerateTemplateTab = () => {
  const [generatedTemplate, setGeneratedTemplate] = useState<string | null>(
    null
  );

  const handleTemplateGenerated = (template: string) => {
    setGeneratedTemplate(template);
  };

  return (
    <div className={styles.templateGenerator}>
      {!generatedTemplate ? (
        <TemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
      ) : (
        <TemplatePreview
          template={generatedTemplate}
          onRegenerate={() => setGeneratedTemplate(null)}
        />
      )}
    </div>
  );
};

const CampaignSetupStep: React.FC = () => {
  const items = [
    {
      key: "generate",
      label: "Generate Template",
      children: <GenerateTemplateTab />,
    },
    {
      key: "upload",
      label: "Upload Template",
      children: <UploadTemplate />,
    },
  ];

  const { campaign, registerBeforeNext, save } = useCampaignBuilder();
  useEffect(() => {
    registerBeforeNext(async () => {
      // ensure latest brief is persisted before the server reads stepState
      await save();
      if (!campaign?.id) return;
      await fetcher.post(`/api/campaigns/${campaign.id}/common-template`);
    });
    return () => registerBeforeNext(null);
  }, [
    campaign?.id,
    campaign?.stepState?.commonTemplate?.html,
    registerBeforeNext,
    save,
  ]);

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Tabs defaultActiveKey="generate" items={items} />
      </Card>
    </div>
  );
};

export default CampaignSetupStep;
