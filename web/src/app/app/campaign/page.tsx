import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function CampaignPage() {
  redirect(ROUTES.APP_HOMEPAGE);
}
