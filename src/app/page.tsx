"use client";

import React from "react";
import { Col, Flex, Row, Typography } from "antd";
import { useRouter } from "next/navigation";
import { howItWorkContent } from "./constants";
import FeatureSection from "./components/FeatureSection";
import { trackEvent } from "@/lib/analytics";
import { RightOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const Home: React.FC = () => {
  const router = useRouter();

  const handleNavigateToPricing = () => {
    trackEvent({
      action: "click",
      category: "Homepage",
      label: "Sign Up Now",
    });
    router.push("/pricing");
  };

  return (
    <div>
      <div
        style={{
          height: "1100px",
          width: "100vw",
          backgroundImage: "url('/images/background_shading.png')",
          position: "absolute",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: -1,
        }}
      />

      {/* Hero Section */}
      <motion.div
        style={{ padding: "0 15%" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
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

          <motion.div
            style={{
              margin: "100px 0",
              display: "flex",
              justifyContent: "center",
              marginTop: "100px",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <iframe
              width="1100"
              height="620"
              src="https://www.youtube.com/embed/zZA_js4mHH8"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-container"
            ></iframe>
          </motion.div>
        </Flex>
      </motion.div>

      {/* CTA Section */}
      <div
        style={{
          backgroundImage: "url('/images/cta_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          padding: "20px 0",
        }}
      >
        <Flex
          justify="center"
          align="center"
          vertical
          style={{ margin: "70px 0" }}
        >
          <Row justify="center">
            <Col span={24}>
              <Typography.Title
                level={1}
                style={{ textAlign: "center", color: "#fff", fontSize: "4rem" }}
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
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: "#fff",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              marginTop: "20px",
              color: "#222F65",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
            onClick={handleNavigateToPricing}
          >
            Sign up now &nbsp;
            <RightOutlined style={{ fontSize: "12px" }} />
          </motion.button>
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
          padding: "20px 0",
          height: "500px",
          marginBottom: "50px",
        }}
      >
        <Typography.Title
          level={1}
          style={{
            textAlign: "center",
            color: "#fff",
            paddingTop: "50px",
            fontSize: "4rem",
          }}
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
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            style={{ width: "100%" }}
          >
            <Row
              gutter={[20, 20]}
              align="middle"
              style={{
                marginBottom: "50px",
                minHeight: "300px", // Set a consistent row height
                width: "100%",
              }}
            >
              {/* Text Section */}
              <Col
                xs={24}
                md={12}
                lg={12}
                xl={12}
                xxl={12}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography.Title level={4} style={{ marginBottom: "20px" }}>
                  Step&nbsp;{item.index}. {item.title}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {item.description}
                </Typography.Text>
              </Col>

              {/* Image or GIF Section */}
              <Col
                xs={24}
                md={12}
                lg={12}
                xl={12}
                xxl={12}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "400px", // Set a fixed width for the image/GIF
                    height: "auto", // Maintain aspect ratio
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px", // Limit the height for consistency
                      borderRadius: "10px",
                      objectFit: "contain", // Maintain aspect ratio without cropping
                    }}
                  />
                </div>
              </Col>
            </Row>
          </motion.div>
        ))}
      </Flex>

      {/* Integration Section */}
      <div
        style={{
          backgroundImage: "url('/images/integrations_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          padding: "20px 10px",
        }}
      >
        <Flex
          justify="center"
          align="center"
          vertical
          style={{ margin: "50px 0" }}
        >
          <Row justify="center">
            <Col span={24}>
              <Typography.Title
                level={1}
                style={{ textAlign: "center", color: "#fff", fontSize: "3rem" }}
              >
                Transform Your Marketing Campaigns and <br />
                Improve Return On Investment
              </Typography.Title>
            </Col>
          </Row>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: "#fff",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              marginTop: "20px",
              color: "#222F65",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
            onClick={handleNavigateToPricing}
          >
            Sign up now &nbsp;
            <RightOutlined style={{ fontSize: "12px" }} />
          </motion.button>
        </Flex>
      </div>
    </div>
  );
};

export default Home;
