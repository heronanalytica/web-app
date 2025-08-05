"use client";

import { Layout, Menu, Table, Tag } from "antd";
import { DashboardOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import styles from "./admin.module.scss";
import useAuth from "@/hooks/useAuth";
import { EAuthRole } from "@/types/auth";

const { Content, Sider } = Layout;

// Mock data for campaigns
const mockCampaigns = [
  {
    key: "1",
    name: "Summer Sale",
    status: "active",
    createdBy: "user1@example.com",
    startDate: "2025-07-15",
    endDate: "2025-08-15",
    participants: 1500,
  },
  {
    key: "2",
    name: "New Product Launch",
    status: "upcoming",
    createdBy: "user2@example.com",
    startDate: "2025-08-20",
    endDate: "2025-09-20",
    participants: 0,
  },
];

const columns = [
  {
    title: "Campaign Name",
    dataIndex: "name",
    key: "name",
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      let color = "default";
      if (status === "active") color = "green";
      if (status === "upcoming") color = "blue";
      if (status === "completed") color = "gray";
      return <Tag color={color}>{status.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Created By",
    dataIndex: "createdBy",
    key: "createdBy",
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    key: "startDate",
  },
  {
    title: "End Date",
    dataIndex: "endDate",
    key: "endDate",
  },
  {
    title: "Participants",
    dataIndex: "participants",
    key: "participants",
  },
];

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("campaigns");
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
    // Check if user is admin
    if (user && user.role !== EAuthRole.ADMIN) {
      router.push(ROUTES.HOMEPAGE);
    }
  }, [isAuthenticated, loading, router, user]);

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  if (loading || !isAuthenticated || (user && user.role !== EAuthRole.ADMIN)) {
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
                <h2>Campaigns</h2>
                <Table
                  className={styles.table}
                  columns={columns}
                  dataSource={mockCampaigns}
                  pagination={{ pageSize: 10 }}
                />
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
