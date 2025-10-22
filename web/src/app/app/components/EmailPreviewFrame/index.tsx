import React, { useState } from "react";
import styles from "./styles.module.scss";
import { Button, Modal } from "antd";
import { ExpandOutlined } from "@ant-design/icons";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cleanHtml = html ? cleanHtmlContent(html) : "";

  if (!cleanHtml) {
    return (
      <div
        className={`${styles.previewContainer} ${className}`}
        style={{ height }}
      >
        {header}
        <div className={styles.emptyState}>
          <h3>No Email Content</h3>
          <p>Preview will appear here when content is available</p>
        </div>
      </div>
    );
  }

  const renderIframe = (fullscreen = false) => (
    <div
      className={`${styles.emailContainer} ${
        fullscreen ? styles.fullscreenIframe : ""
      }`}
    >
      <iframe
        title="email-preview"
        srcDoc={cleanHtml}
        className={styles.previewIframe}
        sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
        style={{
          width: "100%",
          height: fullscreen ? "calc(100vh - 110px)" : "100%",
          minHeight: fullscreen ? "500px" : "300px",
          border: "1px solid #ddd",
          borderRadius: fullscreen ? 0 : "8px",
          background: "white",
        }}
      />
    </div>
  );

  return (
    <>
      <div
        className={`${styles.previewContainer} ${className}`}
        style={{ height }}
      >
        <div className={styles.headerContainer}>
          {header}
          <Button
            type="text"
            icon={<ExpandOutlined />}
            onClick={() => setIsFullscreen(true)}
            className={styles.fullscreenButton}
          >
            View Fullscreen
          </Button>
        </div>
        {renderIframe()}
      </div>

      <Modal
        open={isFullscreen}
        onCancel={() => setIsFullscreen(false)}
        footer={null}
        width="90%"
        style={{
          top: 20,
          maxWidth: "1200px",
          padding: "0",
        }}
        destroyOnClose
        className={styles.fullscreenModal}
        styles={{
          content: {
            padding: "20px 40px"
          }
        }}
      >
        {renderIframe(true)}
      </Modal>
    </>
  );
};

export default EmailPreviewFrame;
