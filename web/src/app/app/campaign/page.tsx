"use client";

import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

export default function CampaignPage() {
  const router = useRouter();
  router.push(ROUTES.APP_HOMEPAGE);
}
