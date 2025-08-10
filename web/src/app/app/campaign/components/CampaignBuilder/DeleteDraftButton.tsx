"use client";

import React, { useState } from "react";
import { Button, Modal, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { fetcher } from "@/lib/fetcher";

interface DeleteDraftButtonProps {
  campaignId: string;
  className?: string;
}

const DeleteDraftButton: React.FC<DeleteDraftButtonProps> = ({
  campaignId,
  className,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const showModal = () => setModalOpen(true);
  const handleCancel = () => setModalOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher.delete(`/api/campaigns/${campaignId}/draft`);
      messageApi.success("Draft campaign deleted");
      router.push(ROUTES.APP_HOMEPAGE);
    } catch (err: any) {
      messageApi.error(err?.message || "Failed to delete draft");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        icon={<DeleteOutlined />}
        danger
        type="primary"
        className={className}
        onClick={showModal}
        title="Delete draft campaign"
      >
        Delete
      </Button>
      <Modal
        open={modalOpen}
        title="Delete Draft Campaign?"
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        onOk={handleDelete}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        Are you sure you want to delete this draft campaign? This action cannot
        be undone.
      </Modal>
    </>
  );
};

export default DeleteDraftButton;
