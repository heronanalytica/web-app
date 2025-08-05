// web/src/app/admin/CampaignsTab/CustomerPersonaUploader.tsx
import React, { useState } from "react";
import { Upload, Button, message, Modal, Table } from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";
import Papa from "papaparse";
import styles from "./CustomerPersonaUploader.module.scss";

interface CustomerPersonaUploaderProps {
  campaignId: string;
  initialFileId?: string;
  initialFileName?: string;
  onUploadSuccess?: (fileId: string, fileName: string) => void;
  onDelete?: () => void;
}

interface CsvPreviewData {
  headers: string[];
  rows: any[];
}

const CustomerPersonaUploader: React.FC<CustomerPersonaUploaderProps> = ({
  campaignId,
  initialFileId,
  initialFileName,
  onUploadSuccess,
  onDelete,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [fileId, setFileId] = useState(initialFileId);
  const [fileName, setFileName] = useState(initialFileName);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<CsvPreviewData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const getFileExtension = (filename: string) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const fileExt = getFileExtension(file.name);
      const contentType = file.type || "text/csv";

      // 1. Get presigned S3 URL
      const { url, key } = await fetcher.post<{
        url: string;
        key: string;
      }>("/api/file/upload", {
        fileType: "customer-persona",
        fileExtension: fileExt,
        contentType,
      });

      // 2. Upload file to S3
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename=\"${encodeURIComponent(
            file.name
          )}\"`,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // 3. Notify backend about new file
      const meta = await fetcher.post<{ id: string }>("/api/file", {
        key,
        fileName: file.name,
        type: "customer-persona",
        campaignId,
      });

      setFileId(meta.id);
      setFileName(file.name);

      // 4. Update campaign with the new file
      await fetcher.patch(`/api/campaigns/${campaignId}/classified-persona`, {
        fileId: meta.id,
        fileName: file.name,
      });

      onUploadSuccess?.(meta.id, file.name);
      messageApi.success(
        "File uploaded and associated with campaign successfully"
      );
      return true;
    } catch (err) {
      console.error("Upload failed:", err);
      messageApi.error("File upload failed");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileId) return;
    try {
      setIsDeleting(true);
      // Delete the file record
      await fetcher.delete(`/api/file/${fileId}`);
      // Update the campaign to remove the classified persona reference
      await fetcher.delete(`/api/campaigns/${campaignId}/classified-persona`);

      // Update local state
      setFileId(undefined);
      setFileName(undefined);
      setPreviewData(null);
      onDelete?.();

      messageApi.success("File deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      messageApi.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const handlePreview = async () => {
    if (!fileId) return;

    try {
      setIsUploading(true);

      // Fetch the actual file content for preview
      const response = await fetcher.raw(`/api/file/download/${fileId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch file content");
      }

      const csvText = await response.text();

      // Parse the CSV content
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          if (results.errors.length > 0) {
            console.error("CSV parse errors:", results.errors);
            messageApi.error("Failed to parse CSV file");
            return;
          }

          // Limit the number of rows for preview
          const previewRows = results.data.slice(0, 100); // Show first 100 rows max

          setPreviewData({
            headers: results.meta.fields || [],
            rows: previewRows,
          });

          setIsPreviewModalVisible(true);
        },
        error: (error: Error) => {
          console.error("CSV parse error:", error);
          messageApi.error("Failed to parse CSV file");
        },
      });
    } catch (err) {
      console.error("Preview failed:", err);
      messageApi.error("Failed to load file preview");
    } finally {
      setIsUploading(false);
    }
  };

  const columns =
    previewData?.headers.map((header) => ({
      title: header,
      dataIndex: header,
      key: header,
      render: (text: string) => text || "-",
    })) || [];

  const beforeUpload = (file: File) => {
    const isCsv = file.type === "text/csv";
    if (!isCsv) {
      messageApi.error("Only CSV files are supported");
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      messageApi.error("File must be smaller than 10MB");
    }
    return isCsv && isLt10M;
  };

  return (
    <div className={styles.uploaderContainer}>
      {contextHolder}
      <Upload.Dragger
        name="file"
        multiple={false}
        accept=".csv"
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={({ file, onSuccess, onError }) => {
          handleUpload(file as File)
            .then(() => onSuccess?.(true))
            .catch((error) => onError?.(error));
          return false;
        }}
        disabled={isUploading}
        className={fileId ? "hasFile" : ""}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined
            style={{ fontSize: 32, color: fileId ? "#52c41a" : "#1890ff" }}
          />
        </p>
        <p
          className="ant-upload-text"
          style={{ fontSize: 16, marginBottom: 8 }}
        >
          {fileId
            ? "File uploaded successfully!"
            : "Click or drag file to this area to upload"}
        </p>
        <p className="ant-upload-hint" style={{ fontSize: 14 }}>
          {fileId
            ? "You can replace this file by dragging a new one here or clicking to select"
            : "Support for a single CSV file upload. Max file size: 10MB"}
        </p>
      </Upload.Dragger>

      {fileId && (
        <div className={styles.fileContainer}>
          <div className={styles.fileInfo}>
            <FileTextOutlined className={styles.fileIcon} />
            <span className={styles.fileName}>{fileName}</span>
          </div>
          <div className={styles.actionButtons}>
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
              disabled={isUploading || isDeleting}
              className={styles.actionButton}
            >
              Preview
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
              disabled={isUploading || isDeleting}
              loading={isDeleting}
              className={styles.actionButton}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      <Modal
        title={
          <>
            <FileTextOutlined style={{ marginRight: 8 }} />
            CSV Preview: {fileName}
          </>
        }
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsPreviewModalVisible(false)}
          >
            Close Preview
          </Button>,
        ]}
        width="90%"
        className={styles.previewModal}
        styles={{ body: { padding: 0 } }}
      >
        {previewData && (
          <div style={{ maxHeight: "60vh", overflow: "auto" }}>
            <Table
              columns={columns}
              dataSource={previewData.rows.map((row, index) => ({
                ...row,
                key: index,
              }))}
              rowKey="key"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: true }}
              size="small"
            />
          </div>
        )}
      </Modal>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={isDeleting}
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this file? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default CustomerPersonaUploader;
