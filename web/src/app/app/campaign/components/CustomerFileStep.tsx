import React, { useState, useEffect } from "react";
import { fetcher } from "@/lib/fetcher";
import styles from "./CustomerFileStep.module.scss";
import { Upload, message, Spin, Modal } from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";

interface CustomerFile {
  id: string;
  fileName: string;
  uploadedAt: string;
  storageUrl: string;
}

interface Props {
  onFileSelected: (fileId: string) => void;
}

const CustomerFileStep: React.FC<Props> = ({ onFileSelected }) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerFile | null>(null);
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        onFileSelected(key);
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
          className={styles.fileInput}
          style={{ width: "100%" }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: "#7b2ff2" }} />
          </p>
          <p className="ant-upload-text">
            Click or drag CSV file to this area to upload
          </p>
          <p className="ant-upload-hint">Only .csv files are supported</p>
        </Upload.Dragger>
        {uploading && (
          <div className={styles.uploadOverlay}>
            <Spin tip="Uploading..." size="large" />
          </div>
        )}
      </div>
      <div className={styles.sectionTitleFlex}>
        Or select a previous upload:
        {fetching && <Spin size="small" className={styles.sectionSpinner} />}
      </div>
      <ul className={styles.fileList}>
        {files.length === 0 && (
          <li className={styles.fileItem} style={{ color: "#aaa" }}>
            No previous uploads
          </li>
        )}
        {files.map((f) => (
          <li key={f.id} className={styles.fileItem}>
            <button
              type="button"
              className={styles.fileButton}
              onClick={() => onFileSelected(f.id)}
              disabled={deletingId === f.id}
            >
              <span className={styles.fileName}>{f.fileName}</span>
            </button>
            <div className={styles.fileMetaWrapper}>
              <span
                className={styles.fileMeta}
              >
                Uploaded at:&nbsp;
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(f.uploadedAt))}
              </span>
              <DeleteOutlined
                className={
                  deletingId === f.id
                    ? `${styles.deleteIcon} ${styles.deleteIconDisabled}`
                    : styles.deleteIcon
                }
                onClick={() => {
                  if (deletingId === f.id) return;
                  setDeleteTarget(f);
                  setDeleteModalVisible(true);
                }}
                spin={deletingId === f.id}
              />
            </div>
          </li>
        ))}
      </ul>
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
    </div>
  );
};

export default CustomerFileStep;
