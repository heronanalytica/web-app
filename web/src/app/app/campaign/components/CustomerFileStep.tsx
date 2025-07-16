import React, { useState, useEffect } from "react";
import { fetcher } from "@/lib/fetcher";

interface CustomerFile {
  id: string;
  file_name: string;
  uploaded_at: string;
  storage_url: string;
  columns: string[];
}

interface Props {
  onFileSelected: (fileId: string) => void;
}

const CustomerFileStep: React.FC<Props> = ({ onFileSelected }) => {
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch previously uploaded files from your NestJS backend
    fetcher.get<CustomerFile[]>("/api/file").then((data) => {
      setFiles(Array.isArray(data) ? data : []);
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // 1. Get pre-signed S3 URL from backend
    const { url, key } = await fetcher.post<{ url: string; key: string }>(
      "/api/file/upload",
      {
        filename: file.name,
        fileType: "customer",
        contentType: file.type,
      }
    );

    // 2. Upload file to S3
    await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // 4. Send metadata to backend
    const metaRes = await fetcher.post<unknown>("/api/file", {
      key,
      fileName: file.name,
      type: "customer",
    });

    setUploading(false);
    if (metaRes) {
      // Optionally refetch files or call onFileSelected
      onFileSelected(key);
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <div>Uploading...</div>}
      <h4>Or select a previous upload:</h4>
      <ul>
        {files.map((f) => (
          <li key={f.id}>
            <button type="button" onClick={() => onFileSelected(f.id)}>
              {f.file_name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerFileStep;
