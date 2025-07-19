import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  List,
  Typography,
  message,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  FileOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { beforeUpload50MB } from "./utils";
import { useStepState } from "../CampaignBuilder/CampaignBuilderContext";
import {
  CampaignStepStateKey,
  CompanyProfileDto,
} from "../../../../../types/campaignStepState";
import { fetcher } from "@/lib/fetcher";
import styles from "./styles.module.scss";

import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";

export default function CompanyProfileStep() {
  const [profiles, setProfiles] = useState<CompanyProfileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, ctx] = message.useMessage();
  const [companyProfile, setCompanyProfile] = useStepState(
    CampaignStepStateKey.CompanyProfile
  );
  const { setCanGoNext } = useCampaignBuilder();
  const [, forceUpdate] = useState({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "marketing" | "design";
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch existing company profiles
  useEffect(() => {
    setLoading(true);
    fetcher
      .get("/api/company-profiles")
      .then((data) => {
        setProfiles(data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Preselect if resuming draft
  useEffect(() => {
    if (companyProfile?.id) {
      setSelected(companyProfile.id);
    }
  }, [companyProfile]);

  // Save selection to context
  useEffect(() => {
    if (selected) {
      const profile = profiles.find((p) => p.id === selected);
      if (profile) setCompanyProfile(profile);
    }
  }, [selected, profiles, setCompanyProfile]);

  // Enable Next only if a company profile is selected
  useEffect(() => {
    setCanGoNext(!!companyProfile?.id);
  }, [companyProfile, setCanGoNext]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        marketingContentFileId: form.getFieldValue("marketingContentFileId"),
        designAssetFileId: form.getFieldValue("designAssetFileId"),
      };

      // Remove the original file objects from payload
      delete payload.marketingContentFile;
      delete payload.designAssetFile;

      setLoading(true);
      const newProfile = await fetcher.post<CompanyProfileDto>(
        "/api/company-profiles",
        payload
      );
      setProfiles((prev) => [newProfile, ...prev]);
      setSelected(newProfile.id);
      setModalOpen(false);
      form.resetFields();
      msg.success("Company profile created");
    } catch (e: any) {
      console.error("Error creating company profile:", e);
      msg.error(e?.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {ctx}
      <div className={styles.header}>
        <Typography.Title level={4} className={styles.title}>
          Select a Company Profile
        </Typography.Title>
        <Typography.Text type="secondary">
          Choose an existing company profile or create a new one to get started.
        </Typography.Text>
      </div>

      <List
        bordered
        loading={loading}
        dataSource={profiles}
        className={styles.companyList}
        renderItem={(item) => (
          <List.Item
            className={`${styles.companyItem} ${
              selected === item.id ? styles.selected : ""
            }`}
            onClick={() => setSelected(item.id)}
            actions={[
              selected === item.id ? (
                <span key="selected" className={styles.selectedBadge}>
                  Selected
                </span>
              ) : null,
            ]}
          >
            <Typography.Text strong>{item.website}</Typography.Text>
          </List.Item>
        )}
        locale={{ emptyText: "No company profiles found." }}
      />
      <Button
        block
        style={{ marginTop: 16 }}
        onClick={() => setModalOpen(true)}
      >
        + Add New Company
      </Button>
      <Modal
        open={modalOpen}
        title="Create Company Profile"
        onCancel={() => setModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={loading}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Company Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="website"
            label="Website"
            rules={[{ required: true, message: "Website is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="marketingContentFile"
            label="Last Marketing Content (PDF, PNG, JPG)"
            rules={[
              { required: true, message: "Please upload marketing content" },
            ]}
            valuePropName="fileId"
          >
            <Upload.Dragger
              name="file"
              accept=".pdf,.png,.jpg,.jpeg"
              beforeUpload={beforeUpload50MB}
              customRequest={async (options: any) => {
                const { file, onSuccess, onError } = options;
                try {
                  // 1. Get presigned URL
                  const { url, key } = await fetcher.post<{
                    url: string;
                    key: string;
                  }>("/api/file/upload", {
                    filename: (file as File).name,
                    fileType: "company-marketing-content",
                    contentType: (file as File).type,
                  });
                  // 2. Upload to S3
                  await fetch(url, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": (file as File).type },
                  });
                  // 3. Save metadata
                  const metaRes = await fetcher.post<{ id: string }>(
                    "/api/file",
                    {
                      fileName: (file as File).name,
                      storageUrl: `s3://${key}`,
                      type: "company-marketing-content",
                      key,
                    }
                  );
                  form.setFieldsValue({
                    marketingContentFileId: metaRes.id,
                    marketingContentFileName: (file as File).name,
                  });
                  forceUpdate({}); // Force re-render
                  if (onSuccess) onSuccess(metaRes, file);
                  msg.success("Marketing content uploaded");
                } catch (e) {
                  msg.error("Upload failed");
                  if (onError) onError(e as any);
                }
              }}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 24 }} />
              </p>
              <p className="ant-upload-text">
                Click or drag file to upload marketing content
              </p>
            </Upload.Dragger>
            {form.getFieldValue("marketingContentFileId") && (
              <div className={styles.fileActions}>
                <FileOutlined style={{ marginRight: 8 }} />
                <a
                  href={`/api/file/download/${form.getFieldValue(
                    "marketingContentFileId"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {form.getFieldValue("marketingContentFileName") ||
                    "Download file"}
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteTarget({
                      id: form.getFieldValue("marketingContentFileId"),
                      type: "marketing",
                    });
                    setDeleteModalVisible(true);
                  }}
                  className={styles.deleteButton}
                >
                  <DeleteOutlined />
                </button>
              </div>
            )}
          </Form.Item>
          <Form.Item
            name="designAssetFile"
            label="Design Asset (PDF, PNG, JPG)"
            valuePropName="fileId"
          >
            <Upload.Dragger
              name="file"
              accept=".pdf,.png,.jpg,.jpeg"
              beforeUpload={beforeUpload50MB}
              customRequest={async (options: any) => {
                const { file, onSuccess, onError } = options;
                try {
                  // 1. Get presigned URL
                  const { url, key } = await fetcher.post<{
                    url: string;
                    key: string;
                  }>("/api/file/upload", {
                    filename: (file as File).name,
                    fileType: "company-design-asset",
                    contentType: (file as File).type,
                  });
                  // 2. Upload to S3
                  await fetch(url, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": (file as File).type },
                  });
                  // 3. Save metadata
                  const metaRes = await fetcher.post<{ id: string }>(
                    "/api/file",
                    {
                      fileName: (file as File).name,
                      storageUrl: `s3://${key}`,
                      type: "company-design-asset",
                      key,
                    }
                  );
                  form.setFieldsValue({
                    designAssetFileId: metaRes.id,
                    designAssetFileName: (file as File).name,
                  });
                  forceUpdate({}); // Force re-render
                  if (onSuccess) onSuccess(metaRes, file);
                  msg.success("Design asset uploaded");
                } catch (e) {
                  msg.error("Upload failed");
                  if (onError) onError(e as any);
                }
              }}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 24 }} />
              </p>
              <p className="ant-upload-text">
                Click or drag file to upload design asset
              </p>
            </Upload.Dragger>
            {form.getFieldValue("designAssetFileId") && (
              <div className={styles.fileActions}>
                <FileOutlined style={{ marginRight: 8 }} />
                <a
                  href={`/api/file/download/${form.getFieldValue(
                    "designAssetFileId"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {form.getFieldValue("designAssetFileName") || "Download file"}
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteTarget({
                      id: form.getFieldValue("designAssetFileId"),
                      type: "design",
                    });
                    setDeleteModalVisible(true);
                  }}
                  className={styles.deleteButton}
                >
                  <DeleteOutlined />
                </button>
              </div>
            )}
          </Form.Item>
          <Form.Item name="businessInfo" label="Additional Business Info">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={deleteModalVisible}
        title="Delete this file?"
        onOk={async () => {
          if (!deleteTarget) return;
          setDeletingId(deleteTarget.id);
          try {
            await fetcher.delete(`/api/file/${deleteTarget.id}`);
            if (deleteTarget.type === "marketing") {
              form.setFieldsValue({
                marketingContentFileId: undefined,
                marketingContentFileName: undefined,
              });
            } else {
              form.setFieldsValue({
                designAssetFileId: undefined,
                designAssetFileName: undefined,
              });
            }
            forceUpdate({});
            msg.success("File deleted");
          } catch (e) {
            console.error(e);
            msg.error("Failed to delete file");
          } finally {
            setDeletingId(null);
            setDeleteModalVisible(false);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteTarget(null);
        }}
        confirmLoading={!!deletingId}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this file? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
