import React from "react";
import { Row, Col, Typography } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;

const FeatureSection: React.FC = () => {
  return (
    <div style={{ padding: "40px 20px" }}>
      {[
        {
          image: "/images/progressional_quality.png",
          title: "Progressional quality",
          description:
            "Get the same precision and depth of analysis that you’d expect from a market research company. Achieve professional-grade insights powered by an advanced algorithm crafted by market researchers & data scientists from top market research companies.",
        },
        {
          image: "/images/save_time_and_cut_costs.png",
          title: "Save Time and Cut Costs",
          description:
            "Cut research time by 2x and save 3x the cost by eliminating the need for hiring a market research company.",
        },
        {
          image: "/images/no_coding_no_complexity.png",
          title: "No Coding, No Complexity",
          description:
            "Built for small and medium sized businesses — no code or no technical expertise needed.",
        },
      ].map((feature, index) => (
        <Row
          key={index}
          gutter={[16, 16]}
          align="middle"
          className="feature-row"
          style={{
            flexDirection: index % 2 === 0 ? "row" : "row-reverse",
            margin: "50px 0",
          }}
        >
          <Col
            xs={24}
            md={12}
            style={{
              textAlign: "center", // Optional: Align the image if needed
            }}
          >
            <Image
              src={feature.image}
              alt={feature.title}
              width={500}
              height={400}
              style={{
                maxWidth: "100%",
                height: "auto",
                marginBottom: "10px", // Reduce space below the image
              }}
            />
          </Col>
          <Col
            xs={24}
            md={12}
            style={{
              paddingLeft: "10px", // Adjust padding to reduce spacing
              paddingRight: "10px",
            }}
          >
            <Title level={1} style={{ marginBottom: "10px" }}>
              {feature.title}
            </Title>
            <Text type="secondary" style={{ lineHeight: "1.6" }}>
              {feature.description}
            </Text>
          </Col>
        </Row>
      ))}

      <Row justify="center" style={{ marginTop: "60px" }}>
        <Col span={24}>
          <Title level={2} style={{ textAlign: "center" }}>
            Transform Your Marketing Campaign and
            <br />
            Improve Return On Investment
          </Title>
        </Col>
      </Row>
    </div>
  );
};

export default FeatureSection;
