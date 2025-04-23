import React from "react";
import { Col, Flex, Row, Typography } from "antd";
import { motion } from "framer-motion";
import { howItWorkContent } from "../constants";

function HowItWorks() {
  return (
    <>
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
                minHeight: "600px", // Set a consistent row height
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
                <Typography.Title level={1} style={{ marginBottom: "20px" }}>
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

                  maxWidth: "600px", // Set a fixed width for the image/GIF
                  height: "auto", // Maintain aspect ratio
                  backgroundImage: `url('/images/step_${index + 1}_cover.png')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    maxWidth: "90%",
                    maxHeight: "90%", // Limit the height for consistency
                    borderRadius: "10px",
                    objectFit: "contain", // Maintain aspect ratio without cropping
                    margin: "70px 20px",
                  }}
                />
              </Col>
            </Row>
          </motion.div>
        ))}
      </Flex>
    </>
  );
}

export default HowItWorks;
