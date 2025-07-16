import React from "react";
import { Modal, Spin } from "antd";
import styles from "./style.module.scss";
import type { CustomerFile } from "./types";

interface CsvPreviewModalProps {
  open: boolean;
  file: CustomerFile | null;
  preview: any[][] | null;
  loading: boolean;
  error: string | null;
  onOk: () => void;
  onCancel: () => void;
}

const CsvPreviewModal: React.FC<CsvPreviewModalProps> = ({
  open,
  file,
  preview,
  loading,
  error,
  onOk,
  onCancel,
}) => (
  <Modal
    open={open}
    title={file ? `Preview: ${file.fileName}` : "Preview CSV"}
    width={800}
    onOk={onOk}
    onCancel={onCancel}
    okText="Confirm and Continue"
    cancelText="Cancel"
    confirmLoading={loading}
  >
    {preview?.length && (
      <div className={styles.csvPreviewInfo}>
        Showing first {preview.length} rows. Please confirm the data looks correct before continuing.
      </div>
    )}
    {loading ? (
      <div className={styles.csvPreviewLoading}>
        <Spin />
        <span style={{ marginLeft: 8 }}>Loading preview...</span>
      </div>
    ) : error ? (
      <div className={styles.csvPreviewError}>{error}</div>
    ) : preview && preview.length > 0 ? (
      <div className={styles.csvPreviewTableWrapper}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {preview[0]?.map((cell, i) => (
                <th key={i} style={{ borderBottom: "1px solid #eee", padding: 4 }}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ borderBottom: "1px solid #f5f5f5", padding: 4 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null}
  </Modal>
);

export default CsvPreviewModal;
