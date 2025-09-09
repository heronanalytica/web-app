// web/src/app/app/campaign/components/CompanyProfileStep/FileUploader.tsx
import React, { useMemo, useState } from "react";
import { Upload, message, Modal } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";

import { useS3Upload, type FileType } from "@/hooks/useS3Upload";

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
  fileType: FileType; // ⬅️ now typed to your FILE_TYPES union
  accept?: string; // e.g. ".pdf,.png,.jpg,.jpeg,.svg"
  showLabel?: boolean;
}

const EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileInfo | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [, forceUpdate] = useState({});

  // Derive MIME whitelist from the accept extensions
  const acceptMimes = useMemo(
    () =>
      accept
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .map((ext) => EXT_TO_MIME[ext])
        .filter(Boolean),
    [accept]
  ) as string[] | undefined;

  const { uploading, beforeUpload, customRequest, deleteById } = useS3Upload({
    fileType,
    acceptMimes, // optional; still keep the input's accept= for the picker
    maxSizeMB: 50,
    onAfterRegister: (reg) => {
      // Save uploaded file info into the form
      form.setFieldsValue({
        [fileIdField]: reg.id,
        [fileNameField]: reg.fileName,
        [name]: undefined, // keep Upload UI minimal; we render from form fields
      });
      messageApi.success("File uploaded successfully");
      forceUpdate({});
    },
    onError: (e) => messageApi.error(e.message),
  });

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
      await deleteById(deleteTarget.id);
      form.setFieldsValue({
        [fileIdField]: undefined,
        [fileNameField]: undefined,
        [name]: undefined,
      });
      messageApi.success("File deleted successfully");
    } catch {
      messageApi.error("Failed to delete file");
    } finally {
      setDeletingId(null);
      setDeleteModalVisible(false);
      setDeleteTarget(null);
      forceUpdate({});
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
        multiple={false}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        className={styles.uploadArea}
        onChange={({ file }) => {
          if (file.status === "error") {
            // Clear the file from the form on error
            form.setFieldsValue({
              [fileIdField]: undefined,
              [fileNameField]: undefined,
              [name]: undefined,
            });
            forceUpdate({});
          }
        }}
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
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          {uploading ? <LoadingOutlined /> : <UploadOutlined />}
        </p>
        <p className="ant-upload-text">
          {uploading
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
