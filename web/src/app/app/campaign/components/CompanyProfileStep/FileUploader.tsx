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
      messageApi.success("File deleted successfully");
    } catch (error) {
      console.error("Failed to delete file:", error);
      messageApi.error("Failed to delete file");
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

  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  const handleCustomRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      // Get file extension
      const fileExt = getFileExtension(file.name);
      // Ensure we have a content type
      const contentType = file.type || `application/octet-stream`;

      // 1. Get presigned URL with file extension and content type
      const { url, key } = await fetcher.post<{
        url: string;
        key: string;
      }>("/api/file/upload", {
        fileType,
        contentType,
        fileExtension: fileExt,
      });

      // 2. Upload to S3 with proper content type
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(
            file.name
          )}"`,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 Upload Error:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
          error: errorText,
        });
        throw new Error(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }

      // 3. Send metadata to backend
      try {
        const metaRes = await fetcher.post<{ id: string }>("/api/file", {
          key,
          fileName: file.name,
          type: fileType,
        });

        if (metaRes?.id) {
          // 4. Save file info to form
          form.setFieldsValue({
            [fileIdField]: metaRes.id,
            [fileNameField]: file.name,
            [name]: file,
          });
          messageApi.success("File uploaded successfully");
          forceUpdate({});
          onSuccess({ key });
        } else {
          throw new Error("Failed to save file metadata: No ID returned");
        }
      } catch (metaError) {
        console.error("Metadata save error:", metaError);
        // Attempt to clean up the uploaded file if metadata save fails
        try {
          await fetcher.delete(`/api/file/${key}`);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up file after metadata save failed:",
            cleanupError
          );
        }
        throw new Error("Failed to save file information. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
      messageApi.error(errorMessage);
      // Clear the file from the upload component on error
      form.setFieldsValue({
        [fileIdField]: undefined,
        [fileNameField]: undefined,
        [name]: undefined,
      });
      forceUpdate({});
      onError(new Error(errorMessage));
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
        customRequest={handleCustomRequest}
        className={styles.uploadArea}
        onChange={({ file }) => {
          // Clear the file from the uploader if there's an error
          if (file.status === "error") {
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
