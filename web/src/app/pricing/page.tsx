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
} from "antd";
import { trackEvent } from "@/lib/analytics";

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

  return (
    <div style={{ textAlign: "center" }}>
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
          Join waitlist for early access at no cost and receive latest update
        </Paragraph>
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
          Join Waitlist
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
