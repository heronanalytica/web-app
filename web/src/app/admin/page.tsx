"use client";

import { Layout, Menu, theme, Typography, Table, Tag } from "antd";
import {
  DashboardOutlined,
  FileOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import styles from "./admin.module.scss";
import useAuth from "@/hooks/useAuth";
import { EAuthRole } from "@/types/auth";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

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
  const [selectedKey, setSelectedKey] = useState("1");
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
        <div className={styles.logo} />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          className={styles.menu}
        >
          <Menu.Item
            key="1"
            icon={<DashboardOutlined />}
            className={styles.menuItem}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<LineChartOutlined />}
            className={styles.menuItem}
          >
            Analytics
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<FileOutlined />}
            className={styles.menuItem}
          >
            Campaigns
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<TeamOutlined />}
            className={styles.menuItem}
          >
            Users
          </Menu.Item>
          <Menu.Item
            key="5"
            icon={<SettingOutlined />}
            className={styles.menuItem}
          >
            Settings
          </Menu.Item>
          <Menu.Item
            key="6"
            icon={<LogoutOutlined />}
            className={styles.menuItem}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className={styles.siteLayout}>
        <Header
          className={styles.header}
          style={{ background: colorBgContainer }}
        >
          <div>
            <Title level={4} style={{ lineHeight: "64px", margin: 0 }}>
              Admin Dashboard
            </Title>
          </div>
        </Header>
        <Content className={styles.content}>
          <div className={styles.dashboardContent}>
            {selectedKey === "1" && (
              <div>
                <h2>Welcome, {user?.email}</h2>
                <p>This is the admin dashboard. Use the sidebar to navigate.</p>
              </div>
            )}
            {selectedKey === "3" && (
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
            {selectedKey === "2" && <div>Analytics content goes here</div>}
            {selectedKey === "4" && (
              <div>User management content goes here</div>
            )}
            {selectedKey === "5" && <div>Settings content goes here</div>}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
