"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { fetcher } from "@/lib/fetcher";
import { ROUTES } from "@/constants/routes";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { CampaignBuilder } from "../components/CampaignBuilder";

const CampaignDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch campaign by ID (draft or active in future)
  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const data = await fetcher.get(`/api/campaigns/${id}`); // Fetch any campaign by ID
        setCampaign(data);
      } catch {
        messageApi.error("Failed to load campaign");
        router.push(ROUTES.APP_HOMEPAGE);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCampaign();
  }, [id, router, messageApi]);

  if (loading) return <Spin fullscreen />;
  if (!campaign) return null;

  return (
    <>
      {contextHolder}
      {campaign.status === CampaignStatus.DRAFT ? (
        <CampaignBuilder campaign={campaign} loading={loading} />
      ) : (
        <div>View campaign page coming soon.</div>
      )}
    </>
  );
};

export default CampaignDetailPage;
