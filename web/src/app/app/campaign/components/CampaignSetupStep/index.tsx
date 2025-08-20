import React, { useState } from "react";
import { Card, Tabs, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";
import TemplateGenerator from "./components/TemplateGenerator";
import TemplatePreview from "./components/TemplatePreview";

const { Text } = Typography;

const UploadTemplate = () => (
  <div className={styles.uploadTemplate}>
    <div className={styles.uploadPlaceholder}>
      <UploadOutlined style={{ fontSize: "32px", marginBottom: 16 }} />
      <Text>Drag & drop your template file here or click to browse</Text>
      <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
        Supported formats: .html, .mjml
      </Text>
    </div>
  </div>
);

const GenerateTemplateTab = () => {
  const [generatedTemplate, setGeneratedTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("My Email Template");

  const handleTemplateGenerated = (template: string) => {
    setGeneratedTemplate(template);
  };

  const handleUseTemplate = () => {
    // TODO: Implement template usage logic
    console.log("Using template:", { name: templateName, content: generatedTemplate });
  };

  const handleTemplateNameChange = (name: string) => {
    setTemplateName(name);
  };

  return (
    <div className={styles.templateGenerator}>
      {!generatedTemplate ? (
        <TemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
      ) : (
        <TemplatePreview
          template={generatedTemplate}
          templateName={templateName}
          onTemplateNameChange={handleTemplateNameChange}
          onRegenerate={() => setGeneratedTemplate(null)}
          onUseTemplate={handleUseTemplate}
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

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Tabs defaultActiveKey="generate" items={items} />
      </Card>
    </div>
  );
};

export default CampaignSetupStep;
