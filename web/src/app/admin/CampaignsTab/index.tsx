"use client";

import { Table, Typography, Button, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import { stepTitles } from "@/app/app/campaign/components/CampaignBuilder/constants";
import styles from "./CampaignsTab.module.scss";
import { useEffect, useState } from "react";
import { CampaignDetailView } from "./CampaignDetailView";

const { Title } = Typography;

const getStatusColor = (status: CampaignStatus) => {
  switch (status) {
    case CampaignStatus.ACTIVE:
      return "green";
    case CampaignStatus.DRAFT:
      return "blue";
    case CampaignStatus.COMPLETED:
      return "gray";
    case CampaignStatus.PAUSED:
      return "orange";
    default:
      return "default";
  }
};

const getRowClassName = (record: any) => {
  const currentStep = record.currentStep ?? 0;
  const stepIndex = Math.min(Math.max(0, currentStep), stepTitles.length - 1);
  return stepTitles[stepIndex] === "Waiting for Analysis"
    ? styles.waitingAnalysisRow
    : "";
};

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text: string, record: any) => (
      <a
        href={`/app/campaign/${record.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: CampaignStatus) => (
      <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
    ),
  },
  {
    title: "Current Step",
    key: "currentStep",
    render: (_: any, record: any) => {
      const currentStep = record.currentStep ?? 0;
      const stepIndex = Math.min(
        Math.max(0, currentStep),
        stepTitles.length - 1
      );
      return stepTitles[stepIndex] || "Not Started";
    },
  },
  {
    title: "Created By",
    key: "user",
    render: (_: any, record: any) => record.user?.email || "Unknown",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: "Updated At",
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  // Actions column is now handled in the component state
];

export default function CampaignsTab() {
  const {
    campaigns,
    loading: campaignsLoading,
    error,
    pagination,
    fetchCampaigns,
  } = useAdminCampaigns();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  useEffect(() => {
    fetchCampaigns(pagination.page, pagination.limit);
  }, [fetchCampaigns, pagination.page, pagination.limit]);

  const handleTableChange = (pagination: any) => {
    fetchCampaigns(pagination.current, pagination.pageSize);
  };

  const refreshData = () => {
    fetchCampaigns(pagination.page, pagination.limit);
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleBackToList = () => {
    setSelectedCampaign(null);
  };

  // Update the actions column to use handleViewDetails
  const columnsWithDetails = [
    ...columns.filter((col) => col.key !== "actions"),
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Campaign) => (
        <Button type="link" onClick={() => handleViewDetails(record)}>
          Details
        </Button>
      ),
    },
  ];

  if (selectedCampaign) {
    return (
      <CampaignDetailView
        campaign={selectedCampaign}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div>
      <div className={styles.tableHeader}>
        <Title level={4} style={{ margin: 0 }}>
          Campaigns
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={refreshData}
          loading={campaignsLoading}
        >
          Refresh
        </Button>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <Table
        className={styles.table}
        columns={columnsWithDetails}
        dataSource={campaigns || []}
        rowKey="id"
        rowClassName={getRowClassName}
        loading={campaignsLoading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} campaigns`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}
