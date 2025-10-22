import React from "react";
import styles from "./styles.module.scss";

interface Props {
  html?: string | null;
  height?: number | string;
  className?: string;
  header?: React.ReactNode;
}

const cleanHtmlContent = (html: string): string => {
  if (!html) return "";
  
  return html
    .replace(
      /<a[^>]*\{\{\$?\s*unsubscribe_link\s*\}[^>]*>\s*\{\{\$?\s*unsubscribe_text\s*\}\}\s*<\/a>/gi,
      ""
    )
    .trim();
};

const EmailPreviewFrame: React.FC<Props> = ({
  html,
  height = "inherit",
  className = "",
  header,
}) => {
  const cleanHtml = html ? cleanHtmlContent(html) : "";

  if (!cleanHtml) {
    return (
      <div className={`${styles.previewContainer} ${className}`} style={{ height }}>
        {header}
        <div className={styles.emptyState}>
          <h3>No Email Content</h3>
          <p>Preview will appear here when content is available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.previewContainer} ${className}`} style={{ height }}>
      {header}
      <div className={styles.emailContainer}>
        <iframe
          title="email-preview"
          srcDoc={cleanHtml}
          className={styles.previewIframe}
          sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "white",
          }}
        />
      </div>
    </div>
  );
};

export default EmailPreviewFrame;
