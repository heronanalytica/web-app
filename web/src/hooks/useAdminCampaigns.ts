import { useState, useCallback, useEffect } from "react";
import { Campaign } from "@/types/campaign";
import { fetcher } from "@/lib/fetcher";
import { CampaignStepState } from "@/types/campaignStepState";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export function useAdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [pagination, setPagination] = useState<
    Omit<PaginatedResponse<Campaign>, "items">
  >({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(
    async (page: number = 1, limit: number = 10) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetcher.get<PaginatedResponse<Campaign>>(
          `/api/campaigns/admin/all?page=${page}&limit=${limit}`
        );

        setCampaigns(data.items);
        setPagination({
          total: data.total,
          page: data.page,
          totalPages: data.totalPages,
          limit: data.limit,
        });
        return data;
      } catch (err: any) {
        setError(err?.message || "Failed to fetch campaigns");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAnalysisStep = useCallback(
    async (
      campaignId: string,
      stepKey: string,
      status: "waiting" | "in_progress" | "done" | "error",
      message?: string
    ) => {
      try {
        const updatedCampaign = await fetcher.patch<Campaign>(
          `/api/campaigns/${campaignId}/analysis-steps`,
          {
            steps: [
              {
                key: stepKey,
                status,
                message,
              },
            ],
          }
        );

        // Update the campaigns list if it exists
        setCampaigns(
          (prevCampaigns) =>
            prevCampaigns?.map((campaign) =>
              campaign.id === campaignId ? updatedCampaign : campaign
            ) || null
        );

        return updatedCampaign;
      } catch (err: any) {
        setError(err?.message || "Failed to update analysis step");
        throw err;
      }
    },
    []
  );

  const updateCampaignStep = useCallback(
    async (
      userId: string,
      campaignId: string,
      currentStep: number,
      stepState: CampaignStepState
    ) => {
      try {
        const updatedCampaign = await fetcher.patch(
          `/api/campaigns/${campaignId}/admin/draft`,
          {
            userId,
            currentStep,
            stepState,
          }
        );

        // Update the campaigns list if it exists
        setCampaigns(
          (prevCampaigns) =>
            prevCampaigns?.map((campaign) =>
              campaign.id === campaignId ? updatedCampaign : campaign
            ) || null
        );

        return updatedCampaign;
      } catch (err: any) {
        setError(err?.message || "Failed to update campaign step");
        throw err;
      }
    },
    []
  );

  return {
    campaigns,
    pagination,
    loading,
    error,
    fetchCampaigns,
    updateAnalysisStep,
    updateCampaignStep,
  };
}

export function useAdminCampaign(campaignId: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = useCallback(async () => {
    if (!campaignId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetcher.get<Campaign>(
        `/api/campaigns/admin/${campaignId}`
      );
      setCampaign(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch campaign");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign,
  };
}
