"use client";

import { Typography, Button, Input, Checkbox, Space } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function PricingPage() {
  return (
    <div style={{ padding: "50px 20px", textAlign: "center", maxWidth: "800px", margin: "auto" }}>
      {/* Main Title */}
      <Title level={1} style={{ color: "#101010", marginBottom: "20px" }}>
        Heron Analytica is launching soon
      </Title>

      {/* Survey Section */}
      <Paragraph style={{ fontSize: "18px", marginBottom: "30px" }}>
        Complete our quick survey
        <sup>1</sup> for a chance to win a $100 Amazon gift card
        <sup>2,3</sup> <br />
        Or join the waitlist for early access at no cost and receive the latest updates.
      </Paragraph>

      <Button
        type="primary"
        size="large"
        style={{
          backgroundColor: "#001F54",
          borderColor: "#001F54",
          color: "#FFFFFF",
          fontSize: "16px",
          padding: "0 40px",
          marginBottom: "40px",
        }}
      >
        Take the survey now
      </Button>

      {/* Notes Section */}
      <Space direction="vertical" size="small" style={{ display: "block", textAlign: "left", margin: "0 auto", maxWidth: "600px" }}>
        <Text type="secondary">
          <sup>1</sup> The deadline to complete the survey is Jan 31, 2025.
        </Text>
        <Text type="secondary">
          <sup>2</sup> Gift card is applicable to participants in North America only and is issued in USD. If issued in CAD, the value
          will be converted using the exchange rate at the time of issuance.
        </Text>
        <Text type="secondary">
          <sup>3</sup> Each participant is eligible for 1 entry only.
        </Text>
      </Space>

      {/* Waitlist Section */}
      <Title level={2} style={{ color: "#101010", margin: "40px 0 20px" }}>
        Or Join Waitlist
      </Title>
      <Title level={4} style={{ color: "#101010", marginBottom: "20px" }}>
        WHY JOIN?
      </Title>
      <Space direction="vertical" size="middle" style={{ display: "block", textAlign: "left", margin: "0 auto", maxWidth: "600px" }}>
        <Text>
          <strong>• Exclusive Early Access At No Cost:</strong> Experience psychographic and demographic personas and insights before
          anyone else at no cost.
        </Text>
        <Text>
          <strong>• Priority Support:</strong> Get hands-on onboarding and personal assistance.
        </Text>
      </Space>

      {/* Waitlist Form */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Input
          placeholder="Enter your email address"
          style={{
            maxWidth: "600px",
            padding: "10px",
            fontSize: "16px",
            marginBottom: "10px",
            display: "inline-block",
          }}
        />
        <Button
          type="primary"
          size="large"
          style={{
            backgroundColor: "#001F54",
            borderColor: "#001F54",
            color: "#FFFFFF",
            fontSize: "16px",
            padding: "0 20px",
            marginLeft: "10px",
          }}
        >
          Join waitlist
        </Button>
        <div style={{ marginTop: "10px" }}>
          <Checkbox>I just want to receive updates.</Checkbox>
        </div>
        <Text style={{ display: "block", marginTop: "10px" }}>
          Join <strong>28</strong> others waiting for no-code customer segmentation.
        </Text>
      </div>
    </div>
  );
}
