"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Input,
  Checkbox,
  Space,
  message,
  Flex,
  Row,
  Col,
} from "antd";
import { trackEvent } from "@/lib/analytics";
import Image from "next/image";
import { RightOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph, Text } = Typography;

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [receiveUpdatesOnly, setReceiveUpdatesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleJoinWaitlist = async () => {
    trackEvent({
      action: "join_waitlist",
      category: "Pricing",
      label: "Waitlist Form",
      value: 1,
    });

    if (!email) {
      messageApi.error("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      messageApi.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/join-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, receiveUpdatesOnly }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409 && errorData.error === "Duplicate email") {
          messageApi.warning(
            "This email is already registered on the waitlist."
          );
        } else {
          throw new Error(errorData.error || "Failed to join waitlist.");
        }
        return;
      }

      messageApi.success("You have successfully joined the waitlist!");
      setEmail("");
      setReceiveUpdatesOnly(false);
      fetchWaitlistCount();
    } catch (error: any) {
      messageApi.error(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlistCount = async () => {
    try {
      const response = await fetch("/api/waitlist-count", { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch waitlist count.");
      }
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error("Error fetching waitlist count:", error);
      setCount(null);
    }
  };

  useEffect(() => {
    fetchWaitlistCount();
  }, []);

  const handleTakeSurveyClick = () => {
    trackEvent({
      action: "click",
      category: "Pricing",
      label: "Take Survey",
    });

    window.open(
      "https://qualtricsxmxgbgmdqqg.yul1.qualtrics.com/jfe/preview/previewId/9a3bd3c9-6a32-47e1-b439-ed6c4949e81b/SV_1RkAzL1J9jsIUjY?Q_CHL=preview&Q_SurveyVersionID=current",
      "_blank"
    );
  };

  return (
    <div
      style={{
        textAlign: "center",
        margin: "auto",
      }}
    >
      {contextHolder}

      {/* Hero Section */}
      <div
        style={{
          padding: "100px 10%",
          backgroundImage: "url('/images/pricing_top_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: -1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title
          level={1}
          style={{
            color: "#101010",
            marginBottom: "30px",
            fontSize: "4rem",
          }}
        >
          Heron Analytica is
          <br />
          launching soon
        </Title>
        <Paragraph
          style={{
            fontSize: "18px",
            color: "#4E4E4E",
          }}
        >
          Complete our quick survey
          <sup>1</sup> for a chance to win a $100 Amazon gift card
          <sup>2,3</sup>
          <br />
          Or join the waitlist for early access at no cost and receive the
          latest updates.
        </Paragraph>
      </div>

      {/* Survey Section */}
      <div
        style={{
          padding: "100px 10%",
          backgroundImage: "url('/images/pricing_top_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: -1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{
            margin: "0 10%",
          }}
        >
          <Row justify="center" align="middle" gutter={[32, 32]}>
            <Col xs={24} sm={24} md={12} style={{ textAlign: "left" }}>
              <Title
                level={1}
                style={{ marginBottom: "20px", fontSize: "4rem" }}
              >
                Take our survey
              </Title>
              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ color: "#4E4E4E" }}>
                  Complete our quick survey<sup>1</sup> for a chance to win a
                  $100 amazon gift card<sup>23</sup>
                </Text>
                <Text type="secondary" style={{ color: "#4E4E4E" }}>
                  <sup>1</sup>: The deadline to complete survey is Jan 31, 2025!
                </Text>
                <Text type="secondary" style={{ color: "#4E4E4E" }}>
                  <sup>2</sup>: Gift card is applicable to participants in North
                  America only and is issued in CAD. If issued in USD, the value
                  will be converted using exchange rate at the time of issuance.
                </Text>
                <Text type="secondary" style={{ color: "#4E4E4E" }}>
                  <sup>3</sup>: Each participant is eligible for 1 entry only.
                </Text>
              </Space>
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: "#512C7E",
                  marginTop: "20px",
                  color: "#fff",
                  padding: "25px 30px",
                }}
                onClick={handleTakeSurveyClick}
              >
                <div>
                  Take the survey now &nbsp;
                  <RightOutlined />
                </div>
              </Button>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Image
                src={"/images/take_survey_picture.png"}
                alt={"Survey Picture"}
                width={500}
                height={400}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "10px",
                }}
              />
            </Col>
          </Row>
        </motion.div>
      </div>

      {/* Waitlist Section */}
      <div
        style={{
          backgroundImage: "url('/images/cta_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          padding: "50px",
          height: "500px",
        }}
      >
        <Title level={1} style={{ color: "#fff", margin: "20px 0" }}>
          Or Join Waitlist
        </Title>
        <Title level={4} style={{ marginBottom: "20px", color: "#fff" }}>
          WHY JOIN?
        </Title>
        <Space
          direction="vertical"
          size="middle"
          style={{
            display: "block",
            textAlign: "center",
            margin: "0 auto",
            maxWidth: "600px",
          }}
        >
          <div>
            <Text
              style={{
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              Exclusive Early Access At No Cost:
            </Text>
            &nbsp;
            <Text
              style={{
                color: "#cccccc",
              }}
            >
              Experience professional personas and insights before anyone else
              at no cost in beta stage.
            </Text>
          </div>
          <div>
            <Text
              style={{
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              Priority Support:
            </Text>
            &nbsp;
            <Text
              style={{
                color: "#cccccc",
              }}
            >
              Get hands-on onboarding and personal assistance.
            </Text>
          </div>
        </Space>

        {/* Waitlist Form */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "20px 10px",
          }}
        >
          <Flex align="center" justify="center" style={{ width: "100%" }}>
            <Space.Compact>
              <Input
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "0px 20px",
                  fontSize: "16px",
                  display: "inline-block",
                }}
                type="email"
              />
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={handleJoinWaitlist}
                style={{
                  backgroundColor: "#512C7E",
                  color: "#FFFFFF",
                  fontSize: "16px",
                  padding: "0px 20px",
                }}
              >
                Join waitlist
              </Button>
            </Space.Compact>
          </Flex>
          <div style={{ marginTop: "10px" }}>
            <Checkbox
              checked={receiveUpdatesOnly}
              onChange={(e) => setReceiveUpdatesOnly(e.target.checked)}
              style={{ color: "#fff" }}
            >
              I just want to receive updates.
            </Checkbox>
          </div>
          <Text
            style={{
              display: "block",
              marginTop: "10px",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Join <strong>{count !== null ? count : "..."}</strong> others
            waiting for no-code customer segmentation.
          </Text>
        </div>
      </div>
    </div>
  );
}
