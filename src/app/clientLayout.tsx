"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Space } from "antd";
import HeronLogo from "./components/icons/HeronLogo";
import Link from "next/link";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AntdRegistry>
      <div>
        <div
          style={{
            height: "800px",
            width: "100%",
            backgroundImage: "url('/images/background_shading.png')",
            position: "absolute",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right bottom",
            top: 0,
            right: 0,
            zIndex: -1,
          }}
        />
        <Space
          align="center"
          size="large"
          style={{
            height: "80px",
            marginBottom: 30,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", top: 10, left: 50 }}>
            <HeronLogo />
          </div>
          <Link href={"/"} style={{ color: "#505F98", cursor: "pointer" }}>
            Home
          </Link>
          <Link
            href={"/pricing"}
            style={{ color: "#505F98", cursor: "pointer" }}
          >
            Pricing
          </Link>
          <Link
            href={"/contact"}
            style={{ color: "#505F98", cursor: "pointer" }}
          >
            Contact
          </Link>
        </Space>
      </div>
      {children}
    </AntdRegistry>
  );
}
