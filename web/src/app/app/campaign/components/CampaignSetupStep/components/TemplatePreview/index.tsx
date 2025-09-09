import React from "react";
import { Button, Card } from "antd";
import styles from "../../styles.module.scss";

interface TemplatePreviewProps {
  template: string;
  onRegenerate: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onRegenerate,
}) => {
  return (
    <div className={styles.templatePreviewContainer}>
      <Card className={styles.previewCard}>
        <div className={styles.templatePreview}>
          <div dangerouslySetInnerHTML={{ __html: template }} />
        </div>
      </Card>

      <div className={styles.previewActions}>
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
