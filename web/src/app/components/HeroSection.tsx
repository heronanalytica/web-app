import React from "react";
import { motion } from "framer-motion";
import { Flex, Typography } from "antd";
import Image from "next/image";

const HeroSection = () => {
  return (
    <>
      <div
        style={{
          height: "1300px",
          width: "100%",
          backgroundImage: "url('/images/background_shading.png')",
          position: "absolute",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: -1,
          top: 0,
          left: 0,
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
            Automate every email
            <br />
            Personalize every message
          </Typography.Title>
          <Typography.Text type="secondary" style={{ textAlign: "center" }}>
            Heron Analytica takes care of your campaigns, so you can take care
            of your customers
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
            <Image
              src="/images/showcase.png"
              alt="Showcase"
              width={1200}
              height={620}
              className="video-container"
            />
            {/* <iframe
              width="1100"
              height="620"
              src="https://www.youtube.com/embed/bx3xf9BKX6Q"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-container"
            ></iframe> */}
          </motion.div>
        </Flex>
      </motion.div>
    </>
  );
};

export default HeroSection;
