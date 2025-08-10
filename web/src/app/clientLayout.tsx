"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Drawer, Button, Flex, Divider } from "antd";
import HeronLogo from "./components/icons/HeronLogo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackPageView } from "../lib/analytics";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FacebookFilled,
  LinkedinFilled,
  MenuOutlined,
  TwitterCircleFilled,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import { motion } from "framer-motion";
import styles from "./clientLayout.module.scss";
import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";
import LoadingSession from "./components/LoadingSession";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isAuthenticated, loading, logout } = useAuth();
  const appRoutes =
    pathname.startsWith(ROUTES.APP_HOMEPAGE) ||
    pathname.startsWith(ROUTES.ADMIN_HOMEPAGE);
  const showFooter = !appRoutes;

  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams}` : ""}`;
    trackPageView(url); // Track the current page view
  }, [pathname, searchParams]);

  if (loading) {
    return <LoadingSession />;
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <AntdRegistry>
      <Flex justify="space-between" vertical className={styles.layoutRoot}>
        <div className={styles.headerWrap}>
          <div className={styles.header}>
            {/* Dummy Mobile Hamburger Menu to style */}
            <Button type="text" className={styles.hamburgerDummy} />

            {/* Logo */}
            <div
              className={styles.logoWrap}
              onClick={() => router.push(ROUTES.HOMEPAGE)}
            >
              <HeronLogo />
            </div>

            {/* Desktop Navigation */}
            {!appRoutes && (
              <div className={styles.desktopMenu}>
                <Link href={ROUTES.HOMEPAGE} className={styles.navLink}>
                  Home
                </Link>
                <Link href={ROUTES.PRICING} className={styles.navLink}>
                  Pricing
                </Link>
                <Link href={ROUTES.CONTACT} className={styles.navLink}>
                  Contact
                </Link>
              </div>
            )}

            {/* Profile Icon Desktop */}
            {!isAuthenticated ? (
              <Button
                className="desktop-login-btn"
                color="default"
                variant="solid"
                size="large"
                onClick={() => {
                  router.push(ROUTES.LOGIN);
                }}
              >
                Login
              </Button>
            ) : (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      label: 'Logout',
                      icon: <LogoutOutlined />,
                      onClick: () => logout(),
                    },
                  ],
                }}
                trigger={['hover']}
                placement="bottomRight"
              >
                <button
                  type="button"
                  aria-label="User menu"
                  className={`${styles["desktop-only"]} ${styles.profileBtn}`}
                >
                  <UserOutlined className={styles.profileIcon} />
                </button>
              </Dropdown>
            )}

            {/* Mobile Hamburger Menu */}
            <Button
              type="text"
              icon={<MenuOutlined className={styles.menuIcon} />}
              onClick={toggleDrawer}
              className="mobile-menu"
            />
          </div>

          {/* Drawer for Mobile Navigation */}
          <Drawer
            title=""
            placement="right"
            onClose={toggleDrawer}
            open={isDrawerOpen}
          >
            <div className={styles.drawerContent}>
              <Link
                href={ROUTES.APP_HOMEPAGE}
                onClick={toggleDrawer}
                className={styles.drawerLink}
              >
                Dashboard
              </Link>
              <Divider style={{ margin: 0 }} />
              <Link
                href={ROUTES.HOMEPAGE}
                onClick={toggleDrawer}
                className={styles.drawerLink}
              >
                Home
              </Link>
              <Link
                href={ROUTES.PRICING}
                onClick={toggleDrawer}
                className={styles.drawerLink}
              >
                Pricing
              </Link>
              <Link
                href={ROUTES.CONTACT}
                onClick={toggleDrawer}
                className={styles.drawerLink}
              >
                Contact
              </Link>
              {!isAuthenticated ? (
                <Link
                  href={ROUTES.LOGIN}
                  onClick={toggleDrawer}
                  className={styles.drawerLink}
                >
                  Login
                </Link>
              ) : (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <div
                    onClick={() => {
                      logout();
                      toggleDrawer();
                    }}
                    className={styles.drawerLink}
                    style={{ cursor: 'pointer' }}
                  >
                    Logout
                  </div>
                </>
              )}
            </div>
          </Drawer>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <Flex
            justify="space-between"
            align="center"
            gap="20px"
            className={styles.footerContainer}
          >
            {/* Footer Logo */}
            <HeronLogo className={styles.footerLogo} />

            <Flex justify="space-between" align="center">
              <Flex align="center" gap="20px" justify="center">
                <Link href={ROUTES.HOMEPAGE} className={styles.footerLink}>
                  Home
                </Link>
                <Link href={ROUTES.PRICING} className={styles.footerLink}>
                  Pricing
                </Link>
                <Link href="#" className={styles.footerLink}>
                  Company
                </Link>
                <Link href="#" className={styles.footerLink}>
                  Resources
                </Link>
                <Link href={ROUTES.CONTACT} className={styles.footerLink}>
                  Contact
                </Link>
              </Flex>
            </Flex>

            <Flex align="center" gap="20px">
              {[
                { icon: <FacebookFilled />, color: "#1877F2" },
                { icon: <LinkedinFilled />, color: "#0077B5" },
                { icon: <TwitterCircleFilled />, color: "#1da1f2" },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className={styles.socialIcon}
                  style={{ color: social.color }}
                >
                  {social.icon}
                </motion.div>
              ))}
            </Flex>
          </Flex>
        )}

        <style jsx global>{`
          @media screen and (min-width: 768px) {
            .footer-logo {
              display: block !important; /* Show on desktop */
            }
          }

          @media screen and (max-width: 768px) {
            .footer-logo {
              display: none !important; /* Hide on mobile */
            }
          }
        `}</style>
      </Flex>
    </AntdRegistry>
  );
}
