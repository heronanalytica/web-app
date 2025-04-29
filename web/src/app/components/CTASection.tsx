import React from "react";
import { Col, Flex, Row, Typography } from "antd";
import SignUpButton from "./SignUpButton";

const CTASection = () => {
  return (
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
            <Typography.Title level={1} className="cta-title">
              Psychographics drive customer behavior
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{ textAlign: "center", display: "block", color: "#fff" }}
            >
              Start to understand why customers think and act the way they do
            </Typography.Text>
          </Col>
        </Row>
        <SignUpButton />
      </Flex>
    </div>
  );
};

export default CTASection;
