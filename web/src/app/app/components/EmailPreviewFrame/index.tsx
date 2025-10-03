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

    // Remove the anchor tag containing unsubscribe_text with more permissive whitespace handling
    const cleanHtml = html
      .replace(
        /<a[^>]*\{\{\s*unsubscribe_link\s*\}[^>]*>\s*\{\{\s*unsubscribe_text\s*\}\}\s*<\/a>/gi,
        ""
      )
      .trim();

    return (
      <div className={styles.emailInner}>
        <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
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
