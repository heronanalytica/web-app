"use client";

import React from "react";
import { Button, Divider, Flex, Typography } from "antd";
import { useRouter } from "next/navigation";
import HowItWorkIcon from "./components/icons/HowItWorkIcon";
import { howItWorkContent } from "./constants";
import Link from "next/link";
import FeatureSection from "./components/FeatureSection";
import { trackEvent } from "@/lib/analytics";

const Home: React.FC = () => {
  const router = useRouter();

  const handleNavigateToContact = () => {
    trackEvent({
      action: "click",
      category: "Homepage",
      label: "Sign Up Now",
    });
    router.push("/contact");
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{ padding: "0 15%" }}>
        <Flex justify="center" align="center" vertical>
          <Typography.Title level={1} style={{ textAlign: "center" }}>
            <span style={{ lineHeight: "80px" }}>
              Unlock Targeted Marketing,
            </span>
            <br />
            <span>Personalize Customer experience</span>
          </Typography.Title>
          <Typography.Text type="secondary">
            Create survey, generate insights, and build customer personas
            without coding or any technical skills - all in Heron Analytica
          </Typography.Text>

          {/* TODO: Add youtube video */}
          <div
            style={{
              height: "800px",
              width: "100%",
              backgroundImage: "url('/images/monitor.png')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
            }}
          />
        </Flex>
      </div>

      <Flex justify="center" align="center" vertical style={{ margin: 30 }}>
        <Button
          type="primary"
          size="large"
          style={{
            backgroundColor: "#222F65",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            marginTop: "70px",
          }}
          className="signup-button"
          onClick={handleNavigateToContact}
        >
          Sign up now
        </Button>
      </Flex>

      {/* Feature Overview */}
      <div style={{ padding: "0 15%" }}>
        <FeatureSection />
      </div>

      {/* How it works */}
      <Flex
        align="flex-start"
        vertical
        style={{ padding: "0 15%" }}
        gap={"30px"}
      >
        <Typography.Title level={2}>How it works</Typography.Title>
        {howItWorkContent.map((item, index) => (
          <Flex key={index} justify="center">
            <HowItWorkIcon style={{ marginRight: 10, minWidth: "40px" }} />
            <Flex align="flex-start" vertical>
              <Typography.Title level={5}>
                {item.index}.&nbsp;{item.title}
              </Typography.Title>
              <Typography.Text>{item.description}</Typography.Text>
            </Flex>
          </Flex>
        ))}
      </Flex>

      {/* Footer */}
      <div
        style={{
          height: "400px",
          width: "100%",
          backgroundImage: "url('/images/footer_shading.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: -1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: "100px",
        }}
      >
        <Flex justify="center" align="center" vertical style={{ margin: 30 }}>
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: "#222F65",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              marginTop: "70px",
            }}
            className="signup-button"
            onClick={handleNavigateToContact}
          >
            Sign up now
          </Button>
        </Flex>
        <div
          style={{
            height: "200px",
            width: "100%",
            backgroundColor: "#E7ECFF",
            padding: "20px 10%",
          }}
        >
          <Flex align="center" style={{ height: "80px" }}>
            <Typography.Text type="secondary">
              @2024 Heronalytica
            </Typography.Text>
          </Flex>
          <Divider />
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={"40px"}>
              <Link href={"/"} style={{ color: "#929ECC" }}>
                Home
              </Link>
              <Link href={"/pricing"} style={{ color: "#929ECC" }}>
                Pricing
              </Link>
              <Link href={"/contact"} style={{ color: "#929ECC" }}>
                Contact
              </Link>
            </Flex>
            <Flex align="center">
              <div />
            </Flex>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default Home;
