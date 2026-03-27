import { useCallback, useRef, useState } from "react";
import { Upload } from "antd";
import type { UploadProps } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";

import { fetcher } from "@/lib/fetcher";

export const FILE_TYPES = {
  CUSTOMER: "customer",
  COMPANY_MARKETING_CONTENT: "company-marketing-content",
  COMPANY_DESIGN_ASSET: "company-design-asset",
  CAMPAIGN_PHOTO: "campaign-photo",
  RENDERED_EMAILS_JSON: "rendered-emails-json",
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

export const FILE_TYPE_VALUES: FileType[] = Object.values(FILE_TYPES);
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${x}`);
}

export type RegisteredFile = {
  id: string;
  key: string;
  fileName: string;
  storageUrl: string;
  contentType: string;
};

export type UploadStage =
  | "before:size"
  | "before:type"
  | "presign"
  | "put"
  | "register"
  | "success";

type UploadableFile = Blob & {
  name?: string;
  type?: string;
};

type PresignResponse = {
  url: string;
  key: string;
};

type RegisterResponse = {
  id: string;
};

export interface UseS3UploadOptions {
  fileType: FileType;
  maxSizeMB?: number;
  acceptMimes?: string[];
  onAfterRegister?: (file: RegisteredFile) => void | Promise<void>;
  getExtraMeta?: (file: File) => Record<string, unknown>;
  onSuccess?: (file: RegisteredFile) => void;
  onError?: (error: Error, stage?: UploadStage) => void;
  extraUploadBody?: {
    isPublic?: boolean;
  };
}

const LIST_IGNORE = Upload.LIST_IGNORE;

const getFileExtension = (filename: string): string =>
  filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);

const toError = (error: unknown, fallbackMessage: string) =>
  error instanceof Error ? error : new Error(fallbackMessage);

const getFileMeta = (file: UploadableFile) => ({
  blob: file as Blob,
  fileName: file.name ?? "file",
  contentType: file.type || "application/octet-stream",
});

const isSupportedUploadInput = (
  file: RcCustomRequestOptions["file"],
): file is RcFile | Blob => typeof file !== "string";

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
      const sizeMB = file.size / 1024 / 1024;
      if (sizeMB > maxSizeMB) {
        onError?.(new Error(`File must be <= ${maxSizeMB}MB`), "before:size");
        return LIST_IGNORE;
      }

      if (acceptMimes?.length && file.type) {
        const isAccepted = acceptMimes.some(
          (mime) => file.type === mime || file.type.startsWith(mime),
        );

        if (!isAccepted) {
          onError?.(new Error("Unsupported file type"), "before:type");
          return LIST_IGNORE;
        }
      }

      return true;
    },
    [acceptMimes, maxSizeMB, onError],
  );

  const customRequest = useCallback(
    (options: RcCustomRequestOptions) => {
      void (async () => {
        const { onError: antOnError, onSuccess: antOnSuccess } = options;
        setError(null);

        if (!isSupportedUploadInput(options.file)) {
          const unsupportedInputError = new Error(
            "Unsupported file input (string)",
          );
          onError?.(unsupportedInputError, "before:type");
          antOnError?.(unsupportedInputError);
          return;
        }

        const uploadFile = options.file as UploadableFile;
        const { blob, fileName, contentType } = getFileMeta(uploadFile);

        const keySig = `${fileName}|${blob.size}|${contentType}|${fileType}`;
        if (inFlightKeyRef.current === keySig) return;
        inFlightKeyRef.current = keySig;

        setUploading(true);
        try {
          let presign: PresignResponse;
          try {
            presign = await fetcher.post<PresignResponse>("/api/file/upload", {
              fileType,
              contentType,
              fileExtension: getFileExtension(fileName),
              ...(extraUploadBody ?? {}),
            });
          } catch (error) {
            const presignError = new Error(
              toError(error, "Failed to get presigned URL").message,
            );
            onError?.(presignError, "presign");
            antOnError?.(presignError);
            throw presignError;
          }

          const putRes = await fetch(presign.url, {
            method: "PUT",
            body: blob,
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${encodeURIComponent(
                fileName,
              )}"`,
            },
          });

          if (!putRes.ok) {
            const bodyText = await putRes.text().catch(() => "");
            const uploadError = new Error(
              `Upload failed: ${putRes.status} ${putRes.statusText} ${bodyText}`,
            );
            onError?.(uploadError, "put");
            antOnError?.(uploadError);
            throw uploadError;
          }

          let meta: RegisterResponse;
          try {
            meta = await fetcher.post<RegisterResponse>("/api/file", {
              key: presign.key,
              fileName,
              type: fileType,
              ...(getExtraMeta ? getExtraMeta(uploadFile as File) : {}),
            });

            if (!meta.id) {
              throw new Error("No ID returned from metadata endpoint.");
            }
          } catch (error) {
            const registerError = new Error(
              toError(error, "Failed to save file metadata").message,
            );
            onError?.(registerError, "register");
            antOnError?.(registerError);
            throw registerError;
          }

          const registered: RegisteredFile = {
            id: meta.id,
            key: presign.key,
            fileName,
            storageUrl: `s3://${presign.key}`,
            contentType,
          };

          setLastFile(registered);

          if (onAfterRegister) {
            await onAfterRegister(registered);
          }
          onSuccess?.(registered);
          antOnSuccess?.(registered);
        } catch (error) {
          const uploadError = toError(error, "Upload failed");
          setError(uploadError.message);
          antOnError?.(uploadError);
          onError?.(uploadError);
        } finally {
          setUploading(false);
          inFlightKeyRef.current = null;
        }
      })();
    },
    [
      extraUploadBody,
      fileType,
      getExtraMeta,
      onAfterRegister,
      onError,
      onSuccess,
    ],
  );

  const deleteById = useCallback(
    async (id: string) => {
      await fetcher.delete(`/api/file/${id}`);
      if (lastFile?.id === id) {
        setLastFile(null);
      }
    },
    [lastFile],
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
