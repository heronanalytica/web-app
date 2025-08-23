import React from "react";
import { Button, Modal, Spin } from "antd";
import type { ButtonProps } from "antd";
import { fetcher } from "@/lib/fetcher";

type Props = {
  fileId?: string | null;
  text?: string;
  modalTitle?: string;
  autoOpenOnChange?: boolean; // optional: auto-open when fileId becomes available/changes
  buttonProps?: ButtonProps;
};

const ImagePreviewButton: React.FC<Props> = ({
  fileId,
  text = "Preview",
  modalTitle = "Preview Campaign Photo",
  autoOpenOnChange = false,
  buttonProps,
}) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [src, setSrc] = React.useState<string | null>(null);

  const objectUrlRef = React.useRef<string | null>(null);
  const prevFileIdRef = React.useRef<string | null | undefined>(fileId);

  const revokeObjectUrl = React.useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const fetchPreview = React.useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher.raw(
        `/api/file/download/${encodeURIComponent(fileId)}`
      );
      if (!res.ok) throw new Error("Failed to fetch image");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      revokeObjectUrl(); // cleanup old url if any
      objectUrlRef.current = url; // track current
      setSrc(url);
    } catch (e: any) {
      setError(e?.message || "Failed to preview image");
      setSrc(null);
    } finally {
      setLoading(false);
    }
  }, [fileId, revokeObjectUrl]);

  const openPreview = React.useCallback(async () => {
    if (!fileId) return;
    setOpen(true);
    if (!src) await fetchPreview();
  }, [fileId, src, fetchPreview]);

  const closePreview = React.useCallback(() => {
    setOpen(false);
  }, []);

  // Auto-open when fileId changes (optional)
  React.useEffect(() => {
    if (!autoOpenOnChange) return;
    if (fileId && fileId !== prevFileIdRef.current) {
      // new id detected — open and load
      openPreview();
    }
    prevFileIdRef.current = fileId;
  }, [autoOpenOnChange, fileId, openPreview]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => revokeObjectUrl();
  }, [revokeObjectUrl]);

  return (
    <>
      <Button
        type="link"
        size="small"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openPreview();
        }}
        disabled={!fileId || loading}
        {...buttonProps}
      >
        {text}
      </Button>

      <Modal
        open={open}
        title={modalTitle}
        width={720}
        onOk={closePreview}
        onCancel={closePreview}
        okText="Close"
        cancelButtonProps={{ style: { display: "none" } }}
        confirmLoading={loading}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
            <span style={{ marginLeft: 8 }}>Loading preview…</span>
          </div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : src ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 12,
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Campaign photo preview"
              style={{ maxWidth: "100%", maxHeight: 520, objectFit: "contain" }}
            />
          </div>
        ) : (
          <div style={{ color: "#888" }}>No image to preview.</div>
        )}
      </Modal>
    </>
  );
};

export default ImagePreviewButton;
