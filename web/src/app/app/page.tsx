"use client";

import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import styles from "./styles.module.scss";
import CampaignList from "./components/CampaignList";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "antd";

const App = () => {
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
    <div className={styles.appContainer}>
      <div className={styles.headerRow}>
        <h2 className={styles.headerTitle}>Campaigns</h2>
        <Button
          type="primary"
          className={styles.newCampaignButton}
          onClick={() => router.push(ROUTES.APP_CAMPAIGN_NEW)}
        >
          New Campaign
        </Button>
      </div>
      <CampaignList campaigns={campaigns || []} />
    </div>
  );
};

export default App;
