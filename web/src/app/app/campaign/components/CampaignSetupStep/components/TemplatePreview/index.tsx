import React from "react";
import { Button, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "../../styles.module.scss";

interface TemplatePreviewProps {
  template: string;
  onRegenerate: () => void;
  onUseTemplate: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onRegenerate,
  onUseTemplate,
}) => {
  return (
    <div className={styles.templatePreviewContainer}>
      <div className={styles.previewHeader}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onRegenerate}
          className={styles.backButton}
        >
          Back to Edit
        </Button>
      </div>

      <Card className={styles.previewCard}>
        <div className={styles.templatePreview}>
          <div dangerouslySetInnerHTML={{ __html: template }} />
        </div>
      </Card>

      <div className={styles.previewActions}>
        <Button
          type="primary"
          onClick={onUseTemplate}
          className={styles.useTemplateButton}
        >
          Use This Template
        </Button>
        <Button
          type="default"
          onClick={onRegenerate}
          className={styles.generateAgainButton}
        >
          Generate Again
        </Button>
      </div>
    </div>
  );
};

export default TemplatePreview;
