import { useState, useCallback } from "react";
import { Campaign } from "@/types/campaign";
import { mockCampaigns } from "@/mock/campaigns";

export function useCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // const res = await fetch("/api/campaigns", {
      //   credentials: "include",
      // });
      // if (!res.ok) throw new Error("Failed to fetch campaigns");
      // const data = await res.json();
      // setCampaigns(data);
      
      // MOCK: Simulate API delay and use mock data
      await new Promise(res => setTimeout(res, 400));
      setCampaigns(mockCampaigns);
    } catch (err: any) {
      setCampaigns([]);
      setError(err?.message || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  return { campaigns, loading, error, fetchCampaigns, setCampaigns };
}
