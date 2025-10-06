import React, { useState, useEffect } from "react";
import { Button, Form, Input, Typography, Modal, message } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { CompanyProfileListItem } from "./CompanyProfileListItem";
import type { CompanyProfileDto } from "@/types/campaignStepState";
import { CampaignStepStateKey } from "@/types/campaignStepState";
import { fetcher } from "@/lib/fetcher";
import {
  useCampaignBuilder,
  useStepState,
} from "../CampaignBuilder/CampaignBuilderContext";
import styles from "./styles.module.scss";
import { FileUploader } from "./FileUploader";

export default function CompanyProfileStep() {
  const [profiles, setProfiles] = useState<CompanyProfileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, ctx] = message.useMessage();
  const [companyProfile, setCompanyProfile, removeCompanyProfile] =
    useStepState(CampaignStepStateKey.CompanyProfile);
  const { setCanGoNext, save } = useCampaignBuilder();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CompanyProfileDto | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingSaveAfterRemove, setPendingSaveAfterRemove] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      await fetcher.delete(`/api/company-profiles/${deleteTarget.id}`);
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget?.id));

      if (selected === deleteTarget.id) {
        setSelected(null);
        setCompanyProfile(undefined);
        setCanGoNext(false);
        removeCompanyProfile();
        setPendingSaveAfterRemove(true);
      }

      // Close modal and reset state
      setDeleteModalVisible(false);
      setDeleteTarget(null);

      // Show success message
      msg.success("Company profile deleted successfully");
    } catch (error) {
      console.error("Error deleting company profile:", error);
      msg.error("Failed to delete company profile. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (pendingSaveAfterRemove) {
      save();
      setPendingSaveAfterRemove(false);
    }
  }, [pendingSaveAfterRemove, save]);

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
              <CompanyProfileListItem
                key={profile.id}
                profile={profile}
                isSelected={selected === profile.id}
                onSelect={setSelected}
                onDelete={(profile) => {
                  setDeleteTarget(profile);
                  setDeleteModalVisible(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className={`${styles.emptyState} ${styles.emptyStateContent}`}>
            <div className={styles.emptyIcon}>
              <ShopOutlined style={{ fontSize: 24 }} />
            </div>
            <Typography.Title level={5} className={styles.emptyTitle}>
              No company profiles found
            </Typography.Title>
            <Typography.Text
              type="secondary"
              className={styles.emptyDescription}
            >
              Get started by creating your first company profile.
              <br />
              Add your company information, marketing content, and design assets
              to begin.
            </Typography.Text>
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
          <Form.Item label="Marketing Content File">
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
          {/* Hidden fields that actually store the values */}
          <Form.Item
            name="marketingContentFileId"
            hidden
          >
            <input type="hidden" />
          </Form.Item>
          <Form.Item name="marketingContentFileName" hidden>
            <input type="hidden" />
          </Form.Item>

          <Form.Item label="Design Asset File (Optional)">
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
          {/* Hidden fields that actually store the values */}
          <Form.Item name="designAssetFileId" hidden>
            <input type="hidden" />
          </Form.Item>
          <Form.Item name="designAssetFileName" hidden>
            <input type="hidden" />
          </Form.Item>

          <Form.Item name="businessInfo" label="Additional Business Info">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Delete Company Profile"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteTarget(null);
        }}
        confirmLoading={!!deletingId}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the company profile for{" "}
          {deleteTarget?.website || "this company"}? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
