"use client";

import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import styles from "./styles.module.scss";
import CampaignList from "./components/CampaignList";
import { useCampaign } from "@/hooks/useCampaign";
import { Button, Modal, Input, message } from "antd";

const App = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [campaignName, setCampaignName] = React.useState("");
  const { createCampaign } = useCampaign();

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return;
    try {
      const newCampaign = await createCampaign({ name: campaignName.trim() });
      setModalOpen(false);
      setCampaignName("");
      messageApi.success("Campaign created!");
      router.push(`/app/campaign/${newCampaign.id}`);
    } catch {
      messageApi.error("Failed to create campaign");
    }
  };
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { campaigns, loading: campaignLoading, fetchCampaigns } = useCampaign();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns();
    }
  }, [fetchCampaigns, isAuthenticated]);

  if (loading || campaignLoading) {
    return <Spin fullscreen />;
  }

  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return;
  }

  return (
    <>
      {contextHolder}
      <div className={styles.appContainer}>
        <div className={styles.headerRow}>
          <h2 className={styles.headerTitle}>Campaigns</h2>
          <Button
            type="primary"
            className={styles.newCampaignButton}
            onClick={() => setModalOpen(true)}
          >
            New Campaign
          </Button>
          <Modal
            title="Name your campaign"
            open={modalOpen}
            onOk={handleCreateCampaign}
            onCancel={() => setModalOpen(false)}
            okText="Create"
            okButtonProps={{ disabled: !campaignName.trim() }}
          >
            <Input
              placeholder="Campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              onPressEnter={handleCreateCampaign}
              maxLength={100}
              autoFocus
            />
          </Modal>
        </div>
        <CampaignList campaigns={campaigns || []} />
      </div>
    </>
  );
};

export default App;
