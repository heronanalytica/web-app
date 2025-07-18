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
} from "@ant-design/icons";
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
  const { isAuthenticated, loading } = useAuth();
  const showFooter = !pathname.startsWith("/app");

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
            {!pathname.startsWith(ROUTES.APP_HOMEPAGE) && (
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
              <button
                type="button"
                aria-label="Go to homepage"
                className={`${styles["desktop-only"]} ${styles.profileBtn}`}
                onClick={() => router.push(ROUTES.APP_HOMEPAGE)}
              >
                <UserOutlined className={styles.profileIcon} />
              </button>
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <Link
                href={ROUTES.APP_HOMEPAGE}
                onClick={toggleDrawer}
                style={{ color: "#505F98", fontWeight: 600 }}
              >
                App Homepage
              </Link>
              <Divider style={{ margin: 0 }} />
              <Link
                href={ROUTES.HOMEPAGE}
                onClick={toggleDrawer}
                style={{ color: "#505F98" }}
              >
                Home
              </Link>
              <Link
                href={ROUTES.PRICING}
                onClick={toggleDrawer}
                style={{ color: "#505F98" }}
              >
                Pricing
              </Link>
              <Link
                href={ROUTES.CONTACT}
                onClick={toggleDrawer}
                style={{ color: "#505F98" }}
              >
                Contact
              </Link>

              {!isAuthenticated && (
                <Link
                  href={ROUTES.LOGIN}
                  onClick={toggleDrawer}
                  style={{ color: "#505F98" }}
                >
                  Login
                </Link>
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
            gap={"20px"}
            style={{
              margin: "30px 0",
              padding: "30px 10%",
              flexWrap: "wrap",
              height: "100px",
              zIndex: 100,
            }}
          >
            {/* Footer Logo */}
            <HeronLogo
              style={{
                display: "none", // Default hidden
              }}
              className="footer-logo"
            />

            <Flex justify="space-between" align="center">
              <Flex align="center" gap={"20px"} justify="center">
                <Link href={ROUTES.HOMEPAGE} style={{ color: "#000" }}>
                  Home
                </Link>
                <Link href={ROUTES.PRICING} style={{ color: "#000" }}>
                  Pricing
                </Link>
                <Link href={"#"} style={{ color: "#000" }}>
                  Company
                </Link>
                <Link href={"#"} style={{ color: "#000" }}>
                  Resources
                </Link>
                <Link href={ROUTES.CONTACT} style={{ color: "#000" }}>
                  Contact
                </Link>
              </Flex>
            </Flex>

            <Flex align="center" gap={"20px"}>
              {[
                { icon: <FacebookFilled />, color: "#1877F2" },
                { icon: <LinkedinFilled />, color: "#0077B5" },
                { icon: <TwitterCircleFilled />, color: "#1da1f2" },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: "24px",
                    color: social.color,
                    cursor: "pointer",
                  }}
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
