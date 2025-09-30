import React, { useMemo } from "react";
import styles from "./styles.module.scss";

interface Props {
  html?: string | null;
  height?: number | string;
  className?: string;
  header?: React.ReactNode;
}

const EmailPreviewFrame: React.FC<Props> = ({
  html,
  height = "auto",
  className = "",
  header,
}) => {
  const emailContent = useMemo(() => {
    if (!html) {
      return (
        <div className={styles.emptyState}>
          <h3>No Email Content</h3>
          <p>Preview will appear here when content is available</p>
        </div>
      );
    }
    return (
      <div className={styles.emailInner}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }, [html]);

  return (
    <div
      className={`${styles.previewContainer} ${className}`}
      style={{ height }}
    >
      {header}
      <div className={styles.emailContainer}>{emailContent}</div>
    </div>
  );
};

export default EmailPreviewFrame;
