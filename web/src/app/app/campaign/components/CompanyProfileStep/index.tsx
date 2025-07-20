import React, { useState, useEffect } from "react";
import { Button, Form, Input, Typography, Modal } from "antd";
import { PlusOutlined, ShopOutlined } from "@ant-design/icons";
import { useStepState } from "../CampaignBuilder/CampaignBuilderContext";
import {
  CampaignStepStateKey,
  CompanyProfileDto,
} from "../../../../../types/campaignStepState";
import { fetcher } from "@/lib/fetcher";
import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";
import { FileUploader } from "./FileUploader";
import { message } from "antd";
import styles from "./styles.module.scss";

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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "marketing" | "design";
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetcher
      .get("/api/company-profiles")
      .then((data) => {
        setProfiles(data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (companyProfile?.id) {
      setSelected(companyProfile.id);
    }
  }, [companyProfile]);

  useEffect(() => {
    if (selected) {
      const profile = profiles.find((p) => p.id === selected);
      if (profile && companyProfile?.id !== profile.id) {
        setCompanyProfile(profile);
      }
    }
  }, [selected, profiles, companyProfile?.id, setCompanyProfile]);

  useEffect(() => {
    setCanGoNext(!!companyProfile?.id);
  }, [companyProfile, setCanGoNext]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      const payload = {
        ...values,
        marketingContentFileId: form.getFieldValue("marketingContentFileId"),
        designAssetFileId: form.getFieldValue("designAssetFileId"),
      };

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

  // Handle file deletion is now handled directly in the Modal's onOk handler

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

      <div className={styles.profileList}>
        {profiles.length > 0 ? (
          <div className={styles.profileListContainer}>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`${styles.profileItem} ${
                  selected === profile.id ? styles.selected : ""
                }`}
                onClick={() => setSelected(profile.id)}
              >
                <div className={styles.profileInfo}>
                  <Typography.Text strong>
                    {profile.website || "No website"}
                  </Typography.Text>
                  {profile.businessInfo && (
                    <Typography.Text type="secondary">
                      {profile.businessInfo}
                    </Typography.Text>
                  )}
                </div>
                {selected === profile.id && (
                  <span className={styles.selectedBadge}>Selected</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <div className={styles.emptyIcon}>
                <ShopOutlined style={{ fontSize: "24px" }} />
              </div>
              <Typography.Title level={5} className={styles.emptyTitle}>
                No company profiles found
              </Typography.Title>
              <Typography.Text
                type="secondary"
                className={styles.emptyDescription}
              >
                Get started by creating your first company profile.<br/>Add your
                company information, marketing content, and design assets to
                begin.
              </Typography.Text>
            </div>
          </div>
        )}
      </div>
      <Button
        block
        style={{ marginTop: 16 }}
        onClick={() => setModalOpen(true)}
        type="primary"
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
            label="Marketing Content File"
            rules={[
              { required: true, message: "Please upload marketing content" },
            ]}
          >
            <FileUploader
              name="marketingContentFile"
              label="Marketing Content File"
              form={form}
              fileIdField="marketingContentFileId"
              fileNameField="marketingContentFileName"
              fileType="company-marketing-content"
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </Form.Item>
          <Form.Item
            name="designAssetFile"
            label="Design Asset File (Optional)"
          >
            <FileUploader
              name="designAssetFile"
              label="Design Asset File (Optional)"
              form={form}
              fileIdField="designAssetFileId"
              fileNameField="designAssetFileName"
              fileType="company-design-asset"
              accept=".png,.jpg,.jpeg,.svg"
            />
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
            message.success("File deleted successfully");
          } catch (error) {
            console.error("Failed to delete file:", error);
            message.error("Failed to delete file");
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
