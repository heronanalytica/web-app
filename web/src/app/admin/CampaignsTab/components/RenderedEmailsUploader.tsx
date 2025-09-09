// web/src/app/admin/CampaignsTab/components/RenderedEmailsUploader.tsx
import React, { useState } from "react";
import { Card, Upload, message, Typography, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";
import styles from "./RenderedEmailsUploader.module.scss";
import { FILE_TYPES, useS3Upload } from "@/hooks/useS3Upload";

const { Text } = Typography;

interface Props {
  campaignId: string;
  onImported?: (summary: any) => void;
}

const RenderedEmailsUploader: React.FC<Props> = ({
  campaignId,
  onImported,
}) => {
  const [msg, ctx] = message.useMessage();
  const [result, setResult] = useState<any>(null);

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
    <Card title="Rendered Emails JSON (Admin Upload)" className={styles.root}>
      {ctx}
      <Text type="secondary">
        Upload the pre-rendered emails JSON. The server will parse and import
        contacts, recipients, and rendered emails.
      </Text>
      <div style={{ marginTop: 12, position: "relative" }}>
        <Upload.Dragger
          accept=".json,application/json"
          multiple={false}
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 32 }} />
          </p>
          <p className="ant-upload-text">Click or drag JSON file to upload</p>
          <p className="ant-upload-hint">
            The file should include a top-level <code>recipients</code> array.
          </p>
        </Upload.Dragger>
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,.6)",
            }}
          >
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
          <div style={{ marginTop: 8 }}>
            <b>Total recipients in campaign:</b> {result.totalRecipients}
          </div>
          <div style={{ marginTop: 8 }}>
            <b>By persona:</b>{" "}
            {Object.entries(result.byPersona || {}).map(([key, value]: [string, any]) => (
              <span key={key} style={{ marginRight: 8 }}>
                {key}: {value}
              </span>
            ))}
          </div>
          {Array.isArray(result.errors) && result.errors.length > 0 && (
            <div style={{ marginTop: 8, color: "#ff4d4f" }}>
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
