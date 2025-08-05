"use client";

import { Layout, Menu, Table, Tag, Typography, Button } from "antd";
import { DashboardOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import styles from "./admin.module.scss";
import useAuth from "@/hooks/useAuth";
import { EAuthRole } from "@/types/auth";
import { useAdminCampaigns } from "@/hooks/useAdminCampaigns";
import { CampaignStatus } from "@/types/campaign";
import { stepTitles } from "../app/campaign/components/CampaignBuilder/constants";

const { Content, Sider } = Layout;
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
  return stepTitles[stepIndex] === "Waiting for Analysis" ? styles.waitingAnalysisRow : "";
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
      // Get the current step from the campaign's currentStep field or default to 0
      const currentStep = (record as any).currentStep ?? 0;
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
  {
    title: "Actions",
    key: "actions",
    render: (_: any, record: any) => (
      <Button
        type="link"
        onClick={() => window.open(`/app/campaign/${record.id}`, "_blank")}
      >
        View
      </Button>
    ),
  },
];

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("campaigns");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    campaigns,
    loading: campaignsLoading,
    error,
    pagination: campaignsPagination,
    fetchCampaigns,
  } = useAdminCampaigns();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Check if user is admin
    if (user && user.role !== EAuthRole.ADMIN) {
      router.push(ROUTES.HOMEPAGE);
      return;
    }

    // Only fetch campaigns if user is authenticated and is admin
    if (isAuthenticated && user?.role === EAuthRole.ADMIN) {
      fetchCampaigns(pagination.current, pagination.pageSize);
    }
  }, [
    isAuthenticated,
    authLoading,
    router,
    user,
    pagination.pageSize,
    fetchCampaigns,
    pagination,
  ]);

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const refreshData = () => {
    fetchCampaigns(pagination.current, pagination.pageSize);
  };

  if (
    authLoading ||
    !isAuthenticated ||
    (user && user.role !== EAuthRole.ADMIN)
  ) {
    return <div>Loading...</div>;
  }

  return (
    <Layout className={styles.adminLayout}>
      <Sider
        className={styles.sider}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Menu
          theme="dark"
          defaultSelectedKeys={["campaigns"]}
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          className={styles.menu}
          items={[
            {
              key: "campaigns",
              label: "Campaigns",
              icon: <DashboardOutlined />,
            },
          ]}
        />
      </Sider>
      <Layout className={styles.siteLayout}>
        <Content className={styles.content}>
          <div className={styles.dashboardContent}>
            {selectedKey === "campaigns" && (
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
                  columns={columns}
                  dataSource={campaigns || []}
                  rowKey="id"
                  rowClassName={getRowClassName}
                  loading={campaignsLoading}
                  pagination={{
                    current: campaignsPagination.page,
                    pageSize: campaignsPagination.limit,
                    total: campaignsPagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} campaigns`,
                  }}
                  onChange={handleTableChange}
                />
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
