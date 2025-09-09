// lib/useS3Upload.ts
import { useCallback, useRef, useState } from "react";
import { Upload } from "antd";
import { fetcher } from "@/lib/fetcher";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import type { RcFile } from "antd/es/upload/interface";
import type { UploadProps } from "antd";

export const FILE_TYPES = {
  CUSTOMER: "customer",
  COMPANY_MARKETING_CONTENT: "company-marketing-content",
  COMPANY_DESIGN_ASSET: "company-design-asset",
  CAMPAIGN_PHOTO: "campaign-photo",
  RENDERED_EMAILS_JSON: "rendered-emails-json",
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

// nice-to-have helpers
export const FILE_TYPE_VALUES: FileType[] = Object.values(FILE_TYPES);
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${x}`);
}

export type RegisteredFile = {
  id: string; // backend id
  key: string; // s3 key
  fileName: string;
  storageUrl: string; // e.g. s3://bucket/key
  contentType: string;
};

export type UploadStage =
  | "before:size"
  | "before:type"
  | "presign"
  | "put"
  | "register"
  | "success";

export interface UseS3UploadOptions {
  fileType: FileType;
  maxSizeMB?: number; // default 50
  acceptMimes?: string[]; // e.g. ["image/png","image/jpeg","text/csv"] or ["image/"]
  onAfterRegister?: (file: RegisteredFile) => void | Promise<void>;
  getExtraMeta?: (file: File) => Record<string, unknown>;
  onSuccess?: (file: RegisteredFile) => void;
  onError?: (error: Error, stage?: UploadStage) => void;
  extraUploadBody?: {
    isPublic?: boolean;
  };
}

const getFileExtension = (filename: string): string =>
  filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);

type BeforeUploadFn = NonNullable<UploadProps["beforeUpload"]>;
export function useS3Upload({
  fileType,
  maxSizeMB = 50,
  acceptMimes,
  onAfterRegister,
  getExtraMeta,
  onSuccess,
  onError,
  extraUploadBody,
}: UseS3UploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [lastFile, setLastFile] = useState<RegisteredFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlightKeyRef = useRef<string | null>(null);

  const beforeUpload = useCallback<BeforeUploadFn>(
    (file) => {
      const sizeMB = ("size" in file ? file.size : 0) / 1024 / 1024;
      if (sizeMB > maxSizeMB) {
        onError?.(new Error(`File must be <= ${maxSizeMB}MB`), "before:size");
        return (Upload as any).LIST_IGNORE ?? false;
      }
      const type = (file as any).type as string | undefined;
      if (acceptMimes?.length && type) {
        const ok = acceptMimes.some((m) => type === m || type.startsWith(m));
        if (!ok) {
          onError?.(new Error("Unsupported file type"), "before:type");
          return (Upload as any).LIST_IGNORE ?? false;
        }
      }
      return true;
    },
    [maxSizeMB, acceptMimes, onError]
  );

  // IMPORTANT: signature returns void and accepts RcCustomRequestOptions
  const customRequest = useCallback(
    (options: RcCustomRequestOptions) => {
      void (async () => {
        const { onError: antOnError, onSuccess: antOnSuccess } = options;
        setError(null);

        // rc-upload gives: RcFile | Blob | string
        const raw = options.file as RcFile | Blob | string;

        if (typeof raw === "string") {
          const err = new Error("Unsupported file input (string)");
          onError?.(err, "before:type");
          antOnError?.(err);
          return;
        }

        // Use Blob for upload body; derive name/type as available
        const blob: Blob = raw as Blob;
        const filename: string = (raw as any).name ?? "file";
        const contentType: string =
          (raw as any).type || "application/octet-stream";

        // StrictMode guard
        const keySig = `${filename}|${blob.size}|${contentType}|${fileType}`;
        if (inFlightKeyRef.current === keySig) return;
        inFlightKeyRef.current = keySig;

        setUploading(true);
        try {
          // 1) presign
          let url: string, key: string;
          try {
            ({ url, key } = await fetcher.post<{ url: string; key: string }>(
              "/api/file/upload",
              {
                fileType,
                contentType,
                fileExtension: getFileExtension(filename),
                ...(extraUploadBody ?? {}),
              }
            ));
          } catch (e: any) {
            const err = new Error(e?.message || "Failed to get presigned URL");
            onError?.(err, "presign");
            antOnError?.(err);
            throw err;
          }

          // 2) PUT to S3
          const putRes = await fetch(url, {
            method: "PUT",
            body: blob, // Blob/File is fine here
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${encodeURIComponent(
                filename
              )}"`,
            },
          });
          if (!putRes.ok) {
            const txt = await putRes.text().catch(() => "");
            const err = new Error(
              `Upload failed: ${putRes.status} ${putRes.statusText} ${txt}`
            );
            onError?.(err, "put");
            antOnError?.(err);
            throw err;
          }

          // 3) register metadata
          let meta: { id: string };
          try {
            const metaPayload = {
              key,
              fileName: filename,
              type: fileType,
              ...(getExtraMeta ? getExtraMeta(raw as any as File) : {}),
            };
            meta = await fetcher.post<{ id: string }>("/api/file", metaPayload);
            if (!meta?.id)
              throw new Error("No ID returned from metadata endpoint.");
          } catch (e: any) {
            const err = new Error(e?.message || "Failed to save file metadata");
            onError?.(err, "register");
            antOnError?.(err);
            throw err;
          }

          const registered: RegisteredFile = {
            id: meta.id,
            key,
            fileName: filename,
            storageUrl: `s3://${key}`,
            contentType,
          };
          setLastFile(registered);

          if (onAfterRegister) await onAfterRegister(registered);
          onSuccess?.(registered);
          antOnSuccess?.(registered);
        } catch (e: any) {
          const err = e instanceof Error ? e : new Error("Upload failed");
          setError(err.message);
          antOnError?.(err);
          onError?.(err);
        } finally {
          setUploading(false);
          inFlightKeyRef.current = null;
        }
      })();
    },
    [
      fileType,
      getExtraMeta,
      onAfterRegister,
      onSuccess,
      onError,
      extraUploadBody,
    ]
  );

  const deleteById = useCallback(
    async (id: string) => {
      await fetcher.delete(`/api/file/${id}`);
      if (lastFile?.id === id) setLastFile(null);
    },
    [lastFile]
  );

  return {
    uploading,
    error,
    lastFile,
    beforeUpload,
    customRequest,
    deleteById,
  };
}
