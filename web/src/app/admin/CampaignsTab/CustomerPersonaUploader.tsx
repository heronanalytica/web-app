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
      message.success(
        "File uploaded and associated with campaign successfully"
      );
      return true;
    } catch (err) {
      console.error("Upload failed:", err);
      message.error("File upload failed");
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
      
      message.success("File deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Failed to delete file");
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
            message.error("Failed to parse CSV file");
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
          message.error("Failed to parse CSV file");
        },
      });
    } catch (err) {
      console.error("Preview failed:", err);
      message.error("Failed to load file preview");
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

  return (
    <div>
      {!fileId ? (
        <Upload
          accept=".csv"
          showUploadList={false}
          customRequest={({ file, onSuccess, onError }) => {
            handleUpload(file as File)
              .then(() => onSuccess?.(null))
              .catch(onError);
          }}
        >
          <Button
            icon={<UploadOutlined />}
            loading={isUploading}
            disabled={isUploading}
          >
            Upload CSV File
          </Button>
        </Upload>
      ) : (
        <div>
          <span>
            <FileTextOutlined /> {fileName}
          </span>
          <Button
            icon={<EyeOutlined />}
            onClick={handlePreview}
            disabled={isUploading || isDeleting}
          >
            Preview
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalVisible(true)}
            disabled={isUploading || isDeleting}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      )}

      <Modal
        title="Preview CSV Data"
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        width="80%"
        footer={
          <Button onClick={() => setIsPreviewModalVisible(false)}>Close</Button>
        }
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
