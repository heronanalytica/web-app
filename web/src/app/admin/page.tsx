"use client";

import { Layout, Menu } from "antd";
import { DashboardOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import styles from "./admin.module.scss";
import useAuth from "@/hooks/useAuth";
import { EAuthRole } from "@/types/auth";
import CampaignsTab from "./CampaignsTab";

const { Content, Sider } = Layout;

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("campaigns");

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

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
  }, [isAuthenticated, authLoading, router, user]);

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
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
            {selectedKey === "campaigns" && <CampaignsTab />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
