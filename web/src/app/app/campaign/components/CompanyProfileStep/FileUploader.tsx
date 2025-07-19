import React, { useState } from "react";
import { Upload, message, Modal } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";
import styles from "./styles.module.scss";

interface FileInfo {
  id: string;
  name: string;
}

interface FileUploaderProps {
  name: string;
  label: string;
  form: any;
  fileIdField: string;
  fileNameField: string;
  fileType: "company-marketing-content" | "company-design-asset";
  accept?: string;
  showLabel?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  name,
  label,
  form,
  fileIdField,
  fileNameField,
  fileType,
  accept = ".pdf,.png,.jpg,.jpeg",
  showLabel = false,
}) => {
  const [loading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileInfo | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [, forceUpdate] = useState({});

  const handleRemove = () => {
    const fileId = form.getFieldValue(fileIdField);
    const fileName = form.getFieldValue(fileNameField);
    if (fileId) {
      setDeleteTarget({ id: fileId, name: fileName });
      setDeleteModalVisible(true);
    }
    return false; // Prevent default remove behavior
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      await fetcher.delete(`/api/file/${deleteTarget.id}`);
      form.setFieldsValue({
        [fileIdField]: undefined,
        [fileNameField]: undefined,
      });
      message.success("File deleted successfully");
    } catch (error) {
      console.error("Failed to delete file:", error);
      message.error("Failed to delete file");
    } finally {
      setDeletingId(null);
      setDeleteModalVisible(false);
      setDeleteTarget(null);
    }
  };

  const beforeUpload = (file: File) => {
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      messageApi.error("File must be smaller than 50MB!");
    }
    return isLt50M;
  };

  const handleCustomRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      // 1. Get presigned URL
      const { url, key } = await fetcher.post<{
        url: string;
        key: string;
      }>("/api/file/upload", {
        fileType,
        contentType: (file as File).type,
      });

      // 2. Upload to S3
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // 3. Send metadata to backend
      const metaRes = await fetcher.post<{ id: string }>("/api/file", {
        key,
        fileName: (file as File).name,
        type: fileType,
      });

      if (metaRes) {
        // 4. Save file info to form
        form.setFieldsValue({
          [fileIdField]: metaRes.id,
          [fileNameField]: file.name,
          [name]: file,
        });
        message.success("File uploaded successfully");
        forceUpdate({});
        onSuccess({ key });
      } else {
        throw new Error("Failed to save file metadata");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      onError(new Error("Upload failed"));
    }
  };

  return (
    <div className={styles.fileUploader}>
      {contextHolder}
      {showLabel && <div className={styles.uploadLabel}>{label}</div>}
      <Modal
        open={deleteModalVisible}
        title="Delete this file?"
        onOk={handleDeleteConfirm}
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
          <b>{deleteTarget?.name}</b>
        </p>
      </Modal>
      <Upload.Dragger
        name={name}
        accept={accept}
        beforeUpload={beforeUpload}
        customRequest={handleCustomRequest}
        maxCount={1}
        onRemove={handleRemove}
        fileList={
          form.getFieldValue(fileIdField)
            ? [
                {
                  uid: form.getFieldValue(fileIdField),
                  name: form.getFieldValue(fileNameField) || "File",
                  status: "done",
                },
              ]
            : []
        }
        disabled={loading}
      >
        <p className="ant-upload-drag-icon">
          {loading ? <LoadingOutlined /> : <UploadOutlined />}
        </p>
        <p className="ant-upload-text">
          {loading
            ? "Uploading..."
            : "Click or drag file to this area to upload"}
        </p>
        <p className="ant-upload-hint">
          Support for {accept} files. Max file size: 50MB
        </p>
      </Upload.Dragger>
    </div>
  );
};

export default FileUploader;
