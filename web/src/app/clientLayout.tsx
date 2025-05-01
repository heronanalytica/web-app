"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Drawer, Button, Flex } from "antd";
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
} from "@ant-design/icons";
import { motion } from "framer-motion";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams}` : ""}`;
    trackPageView(url); // Track the current page view
  }, [pathname, searchParams]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <AntdRegistry>
      <Flex justify="space-between" vertical style={{ minHeight: "100vh" }}>
        <div style={{ zIndex: 100 }}>
          <div
            style={{
              height: "80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 20px",
              backgroundColor: "transparent",
            }}
          >
            {/* Dummy Mobile Hamburger Menu to style */}
            <Button type="text" style={{ visibility: "hidden" }} />

            {/* Logo */}
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "10px",
              }}
            >
              <HeronLogo />
            </div>

            {/* Desktop Navigation */}
            <div className="desktop-menu">
              <Link
                href={"/"}
                style={{
                  color: "#000",
                  margin: "0 15px",
                  textDecoration: "unset",
                }}
              >
                Home
              </Link>
              <Link
                href={"/pricing"}
                style={{
                  color: "#000",
                  margin: "0 15px",
                  textDecoration: "unset",
                }}
              >
                Pricing
              </Link>
              <Link
                href={"/contact"}
                style={{
                  color: "#000",
                  margin: "0 15px",
                  textDecoration: "unset",
                }}
              >
                Contact
              </Link>
            </div>

            {/* Login Button Desktop */}
            <Button
              className="desktop-login-btn"
              color="default"
              variant="solid"
              size="large"
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </Button>

            {/* Mobile Hamburger Menu */}
            <Button
              type="text"
              icon={
                <MenuOutlined style={{ fontSize: "24px", color: "#505F98" }} />
              }
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
                href={"/"}
                onClick={toggleDrawer}
                style={{ color: "#505F98" }}
              >
                Home
              </Link>
              <Link
                href={"/pricing"}
                onClick={toggleDrawer}
                style={{ color: "#505F98" }}
              >
                Pricing
              </Link>
              <Link
                href={"/contact"}
                onClick={toggleDrawer}
                style={{ color: "#505F98" }}
              >
                Contact
              </Link>
            </div>
          </Drawer>
        </div>

        <div style={{ flex: 1 }}>{children}</div>

        {/* Footer */}
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
              <Link href={"/"} style={{ color: "#000" }}>
                Home
              </Link>
              <Link href={"/pricing"} style={{ color: "#000" }}>
                Pricing
              </Link>
              <Link href={"#"} style={{ color: "#000" }}>
                Company
              </Link>
              <Link href={"#"} style={{ color: "#000" }}>
                Resources
              </Link>
              <Link href={"/contact"} style={{ color: "#000" }}>
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
