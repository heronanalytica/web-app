import React, { useState, useEffect } from "react";
import { fetcher } from "@/lib/fetcher";
import styles from "./style.module.scss";
import { Upload, message, Spin, Modal, Divider } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import FileList from "./FileList";
import CsvPreviewModal from "./CsvPreviewModal";
import { FileOutlined } from "@ant-design/icons";
import { FILE_TYPES, useS3Upload } from "@/hooks/useS3Upload";
import type { CustomerFile } from "./types";
import { CampaignStepStateKey } from "@/types/campaignStepState";
import {
  useCampaignBuilder,
  useStepState,
} from "../CampaignBuilder/CampaignBuilderContext";

const CustomerFileStep: React.FC = () => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerFile | null>(null);
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [customerFile, setCustomerFile] = useStepState(
    CampaignStepStateKey.CustomerFile
  );
  const { setCanGoNext } = useCampaignBuilder();
  const [msg, contextHolder] = message.useMessage();

  const { uploading, beforeUpload, customRequest } = useS3Upload({
    fileType: FILE_TYPES.CUSTOMER,
    // browsers may report CSV as either of these:
    acceptMimes: ["text/csv", "application/vnd.ms-excel"],
    maxSizeMB: 50,
    onAfterRegister: async (reg) => {
      const uploadedFile: CustomerFile = {
        id: reg.id,
        fileName: reg.fileName,
        uploadedAt: new Date().toISOString(),
        storageUrl: reg.storageUrl,
      };
      setFiles((prev) => [
        uploadedFile,
        ...prev.filter((f) => f.id !== uploadedFile.id),
      ]);

      // Preview right after upload (unchanged logic)
      await handlePreviewCsv(uploadedFile);
    },
    onSuccess: () => msg.success("File uploaded successfully"),
    onError: (e, stage) =>
      msg.error(stage ? `${stage}: ${e.message}` : e.message),
  });

  // Ensure Next is enabled if a file is pre-selected from stepState
  useEffect(() => {
    if (customerFile && files.length > 0) {
      setCanGoNext(true);
    }
  }, [customerFile, files, setCanGoNext]);

  // CSV preview state
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[][] | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvPreviewFile, setCsvPreviewFile] = useState<CustomerFile | null>(
    null
  );

  // Preview handler
  const handlePreviewCsv = async (file: CustomerFile) => {
    setCsvPreviewFile(file);
    setCsvModalVisible(true);
    setCsvLoading(true);
    setCsvError(null);
    try {
      // Download file from S3 via backend proxy (if needed)
      let url = file.storageUrl;
      if (url.startsWith("s3://")) {
        url = `/api/file/download/${encodeURIComponent(file.id)}`;
      }
      const response = await fetcher.raw(url);
      if (!response.ok) throw new Error("Failed to fetch file");
      const csvText = await response.text();
      const Papa = (await import("papaparse")).default;
      const parsed = Papa.parse(csvText, { preview: 10 });
      setCsvPreview(parsed.data as any[][]);
    } catch (err: any) {
      setCsvError(err.message || "Failed to preview CSV");
      setCsvPreview(null);
    } finally {
      setCsvLoading(false);
    }
  };

  const handleCsvConfirm = () => {
    if (csvPreviewFile) {
      setCustomerFile({
        fileId: csvPreviewFile.id,
        fileName: csvPreviewFile.fileName,
      });
      setCanGoNext(true);
    }
    setCsvModalVisible(false);
    setCsvPreview(null);
    setCsvPreviewFile(null);
  };

  const handleCsvCancel = () => {
    setCsvModalVisible(false);
    setCsvPreview(null);
    setCsvPreviewFile(null);
  };

  useEffect(() => {
    setFetching(true);
    fetcher
      .get<CustomerFile[]>("/api/file?type=customer")
      .then((data) => {
        setFiles(Array.isArray(data) ? data : []);
        setFetching(false);
      })
      .catch(() => {
        setFetching(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      {contextHolder}
      <div style={{ width: "100%", display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <label className={styles.uploadLabel}>
            Upload a new Customer list CSV file
          </label>
          <div className={styles.uploadWrapper}>
            <Upload.Dragger
              name="file"
              accept=".csv"
              beforeUpload={beforeUpload}
              customRequest={customRequest}
              showUploadList={false}
              multiple={false}
              disabled={uploading}
              className={`${styles.fileInput} ${styles.fullWidth}`}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className={styles.inboxIcon} />
              </p>
              <p className="ant-upload-text">
                Click or drag CSV file to this area to upload
              </p>
              <p className="ant-upload-hint">Only .csv files are supported</p>
            </Upload.Dragger>
            {uploading && (
              <div className={styles.uploadOverlay}>
                <Spin size="large" />
              </div>
            )}
          </div>
        </div>
        <div style={{ width: "450px" }}>
          <div className={styles.sectionTitleFlex}>
            Or select a previous upload:
            {fetching && (
              <Spin size="small" className={styles.sectionSpinner} />
            )}
          </div>
          <FileList
            files={files}
            deletingId={deletingId}
            onPreview={handlePreviewCsv}
            onDownload={async (file: CustomerFile) => {
              const response = await fetcher.raw(
                `/api/file/download/${encodeURIComponent(file.id)}`
              );
              if (!response.ok) {
                msg.error("Failed to download file");
                return;
              }
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = file.fileName;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            }}
            onDelete={(file: CustomerFile) => {
              setDeleteTarget(file);
              setDeleteModalVisible(true);
            }}
          />
        </div>
      </div>
      <Divider />
      <div style={{ marginTop: 16, minHeight: 32 }}>
        <b>Selected File:</b>
        <br />
        <br />
        {customerFile ? (
          <span className={styles.selectedFileBox}>
            <span
              className={styles.selectedFileClickable}
              title="Preview CSV"
              onClick={() => {
                const fileObj = files.find((f) => f.id === customerFile.fileId);
                if (fileObj) {
                  handlePreviewCsv(fileObj);
                } else {
                  msg.error("Full file info not found for preview.");
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <FileOutlined className={styles.selectedFileIcon} />
              <span className={styles.selectedFileName}>
                {customerFile.fileName}
              </span>
            </span>
            <button
              type="button"
              className={styles.selectedFileClearBtn}
              onClick={() => {
                setCustomerFile(undefined);
                setCanGoNext(false);
              }}
            >
              Remove
            </button>
          </span>
        ) : (
          <span style={{ color: "#aaa" }}>None selected</span>
        )}
      </div>
      <Modal
        open={deleteModalVisible}
        title="Delete this file?"
        onOk={async () => {
          if (!deleteTarget) return;
          setDeletingId(deleteTarget.id);
          try {
            await fetcher.delete(`/api/file/${deleteTarget.id}`);
            setFiles((prev) =>
              prev.filter((file) => file.id !== deleteTarget.id)
            );
            msg.success("File deleted");
          } catch {
            msg.error("Failed to delete file");
          } finally {
            setDeletingId(null);
            setDeleteModalVisible(false);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteTarget(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true, loading: !!deletingId }}
        cancelText="Cancel"
        confirmLoading={!!deletingId}
      >
        <p>This action cannot be undone.</p>
        <p>
          <b>{deleteTarget?.fileName}</b>
        </p>
      </Modal>
      <CsvPreviewModal
        open={csvModalVisible}
        file={csvPreviewFile}
        preview={csvPreview}
        loading={csvLoading}
        error={csvError}
        onOk={handleCsvConfirm}
        onCancel={handleCsvCancel}
      />
    </div>
  );
};

export default CustomerFileStep;
