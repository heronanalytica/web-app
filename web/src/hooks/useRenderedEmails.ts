import { useCallback, useEffect, useMemo, useState } from "react";
import { fetcher } from "@/lib/fetcher";

export type RenderedEmailItem = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  campaignId: string;
  contact: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    // displayName is computed from firstName and lastName in the frontend
    displayName?: string;
  };
  personaCode: string | null;
  personaDisplayName: string | null;
  personaConfidence: number | null;
  renderedEmail: null | {
    id: string;
    subject: string | null;
    preheader: string | null;
    html: string | null;
    from: string | null;
    to: string | null;
  };
};

export type Page<T> = {
  rows: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export function useRenderedEmails(campaignId?: string) {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Page<RenderedEmailItem> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (p = page, query = q) => {
      if (!campaignId) return;
      setLoading(true);
      setError(null);
      try {
        const qp = new URLSearchParams({
          page: String(p),
          limit: String(limit),
          ...(query ? { q: query } : {}),
        });
        const res = await fetcher.get<Page<RenderedEmailItem>>(
          `/api/campaigns/${encodeURIComponent(
            campaignId
          )}/rendered-emails?${qp.toString()}`
        );
        setData(res);
      } catch (e: any) {
        setError(e?.message || "Failed to load rendered emails");
      } finally {
        setLoading(false);
      }
    },
    [campaignId, page, q, limit]
  );

  useEffect(() => {
    void fetchPage(1, q); /* initial */
  }, [fetchPage, q]);

  const items = useMemo(() => data?.rows ?? [], [data]);

  return {
    loading,
    error,
    items,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    limit,
    q,
    setQ,
    setPage: (p: number) => {
      setPage(p);
      void fetchPage(p, q);
    },
    refetch: () => fetchPage(page, q),
  };
}
