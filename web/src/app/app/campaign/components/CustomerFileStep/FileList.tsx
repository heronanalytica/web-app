import React from "react";
import type { CustomerFile } from "./types";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from "./style.module.scss";

interface FileListProps {
  files: CustomerFile[];
  deletingId: string | null;
  onPreview: (file: CustomerFile) => void;
  onDownload: (file: CustomerFile) => void;
  onDelete: (file: CustomerFile) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  deletingId,
  onPreview,
  onDownload,
  onDelete,
}) => (
  <ul className={styles.fileList}>
    {files.length === 0 && (
      <li className={styles.fileItem}>No previous uploads</li>
    )}
    {files.map((f) => (
      <li key={f.id} className={styles.fileItem}>
        <div className={styles.fileMetaWrapper}>
          <button
            type="button"
            className={styles.fileButton}
            onClick={() => onPreview(f)}
            disabled={deletingId === f.id}
          >
            <span className={styles.fileName}>{f.fileName}</span>
          </button>
          <DownloadOutlined
            className={
              styles.downloadIcon +
              (deletingId === f.id ? " " + styles.deleteIconDisabled : "")
            }
            title="Download"
            onClick={(e) => {
              e.stopPropagation();
              if (deletingId !== f.id) onDownload(f);
            }}
          />
          <DeleteOutlined
            className={
              styles.deleteIcon +
              (deletingId === f.id ? " " + styles.deleteIconDisabled : "")
            }
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              if (deletingId !== f.id) onDelete(f);
            }}
          />
        </div>
        <span className={styles.fileMeta}>
          Uploaded at:&nbsp;
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(new Date(f.uploadedAt))}
        </span>
      </li>
    ))}
  </ul>
);

export default FileList;
