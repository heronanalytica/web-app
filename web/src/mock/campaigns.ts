import { Campaign } from "@/types/campaign";

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Spring Launch",
    status: "ACTIVE",
    createdAt: "2025-07-01T10:00:00.000Z",
    updatedAt: "2025-07-10T12:00:00.000Z",
  },
  {
    id: "2",
    name: "Summer Sale",
    status: "PAUSED",
    createdAt: "2025-06-15T09:00:00.000Z",
    updatedAt: "2025-06-20T14:00:00.000Z",
  },
  {
    id: "3",
    name: "Holiday Promo",
    status: "DRAFT",
    createdAt: "2025-05-20T08:30:00.000Z",
    updatedAt: "2025-05-22T11:45:00.000Z",
  },
  {
    id: "4",
    name: "Back to School",
    status: "COMPLETED",
    createdAt: "2025-04-10T07:20:00.000Z",
    updatedAt: "2025-05-01T10:20:00.000Z",
  },
  {
    id: "5",
    name: "Flash Deal",
    status: "ACTIVE",
    createdAt: "2025-07-12T13:15:00.000Z",
    updatedAt: "2025-07-14T16:00:00.000Z",
  },
];
