// web/src/app/admin/CampaignsTab/components/RenderedEmailsUploader.tsx
import React, { useState } from "react";
import {
  Card,
  Upload,
  message,
  Typography,
  Spin,
  Divider,
  Button,
  Modal,
} from "antd";
import { UploadOutlined, CodeOutlined, CopyOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";
import styles from "./RenderedEmailsUploader.module.scss";
import { FILE_TYPES, useS3Upload } from "@/hooks/useS3Upload";
import { CommonTemplateDto, GeneratorBriefDto } from "@/types/campaignStepState";

const { Text } = Typography;

interface Props {
  campaignId: string;
  commonTemplate?: CommonTemplateDto;
  onImported?: (summary: any) => void;
  customerTemplateInput?: GeneratorBriefDto;
}

const RenderedEmailsUploader: React.FC<Props> = ({
  campaignId,
  commonTemplate,
  onImported,
  customerTemplateInput,
}) => {
  const [msg, contextHolder] = message.useMessage();
  const [result, setResult] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    msg.success(`${type} copied to clipboard`);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const { uploading, beforeUpload, customRequest } = useS3Upload({
    fileType: FILE_TYPES.RENDERED_EMAILS_JSON,
    acceptMimes: ["application/json", "text/plain"],
    maxSizeMB: 25,
    onAfterRegister: async (reg) => {
      // Tell backend to parse+import from this file ID
      const data = await fetcher.post(
        `/api/campaigns/${encodeURIComponent(
          campaignId
        )}/rendered-emails/import-file`,
        { fileId: reg.id }
      );
      setResult(data);
      onImported?.(data); // keep your parent behavior
      msg.success("Imported rendered emails from file");
    },
    onSuccess: () => {},
    onError: (e) => msg.error(e.message),
  });

  return (
    <Card title="Rendered Emails JSON (Admin Upload)">
      {contextHolder}
      <div className={styles.section}>
        <Text strong>Customer Template Input</Text>
        <div className={styles.contentBox}>
          <div>
            <Text strong>Objective: </Text>
            <Text>{customerTemplateInput?.objective || 'N/A'}</Text>
          </div>
          <div>
            <Text strong>Tone: </Text>
            <Text>{customerTemplateInput?.tone || 'N/A'}</Text>
          </div>
          <div>
            <Text strong>Business Results: </Text>
            <Text>{customerTemplateInput?.businessResults || 'N/A'}</Text>
          </div>
          <div>
            <Text strong>Key Messages: </Text>
            <Text>{customerTemplateInput?.keyMessages || 'N/A'}</Text>
          </div>
          <div>
            <Text strong>CTA: </Text>
            <Text>{customerTemplateInput?.cta || 'N/A'}</Text>
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <Button
          type="primary"
          onClick={showModal}
          disabled={!commonTemplate}
          icon={<CodeOutlined />}
        >
          View Common Template
        </Button>
        {!commonTemplate && (
          <Text type="secondary" className={styles.noCommonTemplate}>
            No common template available
          </Text>
        )}
      </div>

      <Modal
        title="Common Template Details"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div className={styles.modalContent}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Text strong>Subject</Text>
              {commonTemplate?.subject && (
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(commonTemplate.subject, "Subject")}
                  className={styles.copyButton}
                  title="Copy subject"
                />
              )}
            </div>
            <div className={styles.contentBox}>
              {commonTemplate?.subject || "No subject"}
            </div>
          </div>

          <Divider className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Text strong>Preheader</Text>
              {commonTemplate?.preheader && (
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(commonTemplate.preheader, "Preheader")}
                  className={styles.copyButton}
                  title="Copy preheader"
                />
              )}
            </div>
            <div className={styles.contentBox}>
              {commonTemplate?.preheader || "No preheader"}
            </div>
          </div>

          <Divider className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Text strong>HTML Content</Text>
              {commonTemplate?.html && (
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(commonTemplate.html, "HTML content")}
                  className={styles.copyButton}
                  title="Copy HTML"
                />
              )}
            </div>
            <div className={styles.htmlContent}>
              {commonTemplate?.html || "No HTML content"}
            </div>
          </div>
        </div>
      </Modal>
      <Divider />
      <Text type="secondary">
        Upload the pre-rendered emails JSON. The server will parse and import
        contacts, recipients, and rendered emails.
      </Text>
      <div className={styles.uploadContainer}>
        <Upload.Dragger
          accept=".json,application/json"
          multiple={false}
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          disabled={uploading}
        >
          <div className={styles.uploadDragIcon}>
            <UploadOutlined style={{ fontSize: 32 }} />
          </div>
          <p className={styles.uploadText}>Click or drag JSON file to upload</p>
          <p className={styles.uploadHint}>
            The file should include a top-level <code>recipients</code> array.
          </p>
        </Upload.Dragger>
        {uploading && (
          <div className={styles.uploadOverlay}>
            <Spin />
          </div>
        )}
      </div>

      {result && (
        <div className={styles.result}>
          <div>
            <b>Rows:</b> {result.totalRows} &nbsp; | &nbsp;
            <b>Recipients upserted:</b> {result.upsertedRecipients} &nbsp; |
            &nbsp;
            <b>Rendered emails upserted:</b> {result.upsertedEmails}
          </div>
          <div className={styles.section}>
            <b>Total recipients in campaign:</b> {result.totalRecipients}
          </div>
          <div className={styles.section}>
            <b>By persona:</b>{" "}
            {Object.entries(result.byPersona || {}).map(
              ([key, value]: [string, any]) => (
                <span key={key} className={styles.personaItem}>
                  {key}: {value}
                </span>
              )
            )}
          </div>
          {Array.isArray(result.errors) && result.errors.length > 0 && (
            <div className={styles.errorText}>
              <b>Errors ({result.errors.length}):</b>
              <div>
                {result.errors.slice(0, 5).map((e: any, idx: number) => (
                  <div key={idx}>
                    Row {e.index + 1}: {e.message}
                  </div>
                ))}
                {result.errors.length > 5 && "…"}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default RenderedEmailsUploader;
