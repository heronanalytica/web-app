"use client";

import React from "react";
import { Button, Col, Divider, Flex, Row, Typography } from "antd";
import { useRouter } from "next/navigation";
import { howItWorkContent } from "./constants";
import Link from "next/link";
import FeatureSection from "./components/FeatureSection";
import { trackEvent } from "@/lib/analytics";
import { RightOutlined } from "@ant-design/icons";

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
          <Typography.Title
            className="hero-title"
            level={1}
            style={{
              textAlign: "center",
              fontSize: "3rem",
              marginTop: "60px",
            }}
          >
            Unlock Targeted Marketing,
            <br />
            Personalize Customer
            <br />
            Experience
          </Typography.Title>
          <Typography.Text type="secondary" style={{ textAlign: "center" }}>
            Create survey, generate insights, and build customer personas
            without coding or any technical skills - all in Heron Analytica
          </Typography.Text>

          <div
            style={{
              margin: "40px 0",
              display: "flex",
              justifyContent: "center",
              marginTop: "100px",
            }}
          >
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/zZA_js4mHH8"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-container"
            ></iframe>
          </div>
        </Flex>
      </div>

      <div
        style={{
          backgroundImage: "url('/images/cta_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          padding: "50px 0",
        }}
      >
        <Flex justify="center" align="center" vertical style={{ margin: 30 }}>
          <Row justify="center">
            <Col span={24}>
              <Typography.Title
                level={1}
                style={{ textAlign: "center", color: "#fff" }}
              >
                If you target everyone,
                <br />
                you target no one.
              </Typography.Title>
              <Typography.Text
                type="secondary"
                style={{ textAlign: "center", display: "block", color: "#fff" }}
              >
                Take the guesswork out of understanding your customers
              </Typography.Text>
            </Col>
          </Row>
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: "#fff",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              marginTop: "60px",
              color: "#222F65",
            }}
            className="signup-button"
            onClick={handleNavigateToContact}
          >
            Sign up now
            <RightOutlined />
          </Button>
        </Flex>
      </div>

      {/* Feature Overview */}
      <div style={{ padding: "0 15%" }}>
        <FeatureSection />
      </div>

      {/* How it works */}
      <div
        style={{
          backgroundImage: "url('/images/how_it_works_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          padding: "50px 0",
          height: "400px",
          marginBottom: "50px",
        }}
      >
        <Typography.Title
          level={1}
          style={{ textAlign: "center", color: "#fff", paddingTop: "30px" }}
        >
          How it works
        </Typography.Title>
      </div>
      <Flex
        align="flex-start"
        vertical
        style={{ padding: "0 15%" }}
        gap={"30px"}
      >
        {howItWorkContent.map((item, index) => (
          <Row
            key={index}
            gutter={[20, 20]}
            align="middle"
            style={{
              marginBottom: "50px",
            }}
          >
            {/* Text Section */}
            <Col xs={24} md={12}>
              <Typography.Title level={4} style={{ marginBottom: "20px" }}>
                {item.index}. {item.title}
              </Typography.Title>
              <Typography.Text type="secondary">
                {item.description}
              </Typography.Text>
            </Col>
            {/* Image or GIF Section */}
            <Col xs={24} md={12} style={{ textAlign: "center" }}>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "10px",
                }}
              />
            </Col>
          </Row>
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
