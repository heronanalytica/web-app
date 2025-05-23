import React from "react";
import { Col, Flex, Row, Typography } from "antd";
import SignUpButton from "./SignUpButton";

const IntegrationSection = () => {
  return (
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
        <SignUpButton />
      </Flex>
    </div>
  );
};

export default IntegrationSection;
