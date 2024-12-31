import React from "react";
import { Row, Col, Typography } from "antd";
import Image from "next/image";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const FeatureSection: React.FC = () => {
  return (
    <div style={{ padding: "40px 20px" }}>
      {[
        {
          image: "/images/progressional_quality.png",
          title: "Progressional quality",
          description:
            "Get the same precision and depth of analysis that you’d expect from a market research company. Achieve professional-grade insights powered by an advanced algorithm crafted by professional market researchers and data scientists.",
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
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          <Row
            gutter={[16, 16]}
            align="middle"
            className="feature-row"
            style={{
              flexDirection: index % 2 === 0 ? "row" : "row-reverse",
              margin: "50px 0",
            }}
          >
            {/* Image Section with Animation */}
            <Col
              xs={24}
              md={12}
              style={{
                textAlign: "center",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={500}
                  height={400}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    marginBottom: "10px",
                  }}
                />
              </motion.div>
            </Col>

            {/* Text Section with Animation */}
            <Col
              xs={24}
              md={12}
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Title level={1} style={{ marginBottom: "10px" }}>
                  {feature.title}
                </Title>
                <Text type="secondary" style={{ lineHeight: "1.6" }}>
                  {feature.description}
                </Text>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureSection;
