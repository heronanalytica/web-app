import React, { useState, useEffect } from "react";
import { fetcher } from "@/lib/fetcher";
import styles from "./style.module.scss";
import { Upload, message, Spin, Modal, Divider } from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import FileList from "./FileList";
import CsvPreviewModal from "./CsvPreviewModal";
import { FileOutlined } from "@ant-design/icons";

import type { CustomerFile } from "./types";
import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";

const CustomerFileStep: React.FC = () => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerFile | null>(null);
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const [selectedFile, setSelectedFile] = useState<CustomerFile | null>(null);
  const { setCanGoNext } = useCampaignBuilder();

  const handleCsvConfirm = () => {
    if (csvPreviewFile) {
      setSelectedFile(csvPreviewFile);
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
      .get<CustomerFile[]>("/api/file")
      .then((data) => {
        setFiles(Array.isArray(data) ? data : []);
        setFetching(false);
      })
      .catch(() => {
        setFetching(false);
      });
  }, []);

  const customUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // 1. Get pre-signed S3 URL from backend
      const { url, key } = await fetcher.post<{ url: string; key: string }>(
        "/api/file/upload",
        {
          filename: (file as File).name,
          fileType: "customer",
          contentType: (file as File).type,
        }
      );

      // 2. Upload file to S3
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": (file as File).type },
      });

      // 3. Send metadata to backend
      const metaRes = await fetcher.post<unknown>("/api/file", {
        key,
        fileName: (file as File).name,
        type: "customer",
      });

      setUploading(false);
      if (metaRes) {
        // Optimistically add new file to previous uploads
        const uploadedFile: CustomerFile = {
          id: key.split("/").pop() || "",
          fileName: (file as File).name,
          uploadedAt: new Date().toISOString(),
          storageUrl: `s3://${key}`,
        };
        setFiles((prev) => [
          uploadedFile,
          ...prev.filter((f) => f.id !== uploadedFile.id),
        ]);
        // Show preview modal for the newly uploaded file before proceeding
        await handlePreviewCsv(uploadedFile);
        if (onSuccess) {
          onSuccess(metaRes);
        }
        message.success("File uploaded successfully");
      } else {
        message.error("Upload failed");
        if (onError) {
          onError(new Error("Upload failed"));
        }
      }
    } catch {
      setUploading(false);
      message.error("Upload failed");
      if (onError) {
        onError(new Error("Upload failed"));
      }
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ width: "100%", display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <label className={styles.uploadLabel}>
            Upload a new Customer list CSV file
          </label>
          <div className={styles.uploadWrapper}>
            <Upload.Dragger
              name="file"
              accept=".csv"
              customRequest={customUpload}
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
                message.error("Failed to download file");
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
        {selectedFile ? (
          <span className={styles.selectedFileBox}>
            <FileOutlined className={styles.selectedFileIcon} />
            <span className={styles.selectedFileName}>
              {selectedFile.fileName}
            </span>
            <button
              type="button"
              className={styles.selectedFileClearBtn}
              onClick={() => {
                setSelectedFile(null);
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
            message.success("File deleted");
          } catch {
            message.error("Failed to delete file");
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
