"use client";
import React from "react";
import { Button, Divider, Flex, Typography } from "antd";
import Image from "next/image";
import HowItWorkIcon from "./components/icons/HowItWorkIcon";
import { howItWorkContent } from "./constants";

const Home: React.FC = () => {
  return (
    <div>
      {/* TODO: Hero section */}
      <Flex justify="center" align="center" vertical>
        <Typography.Title level={1} style={{ textAlign: "center" }}>
          <span style={{ lineHeight: "80px" }}>Unlock Targeted Marketing,</span>
          <br />
          <span>Personalize Customer experience</span>
        </Typography.Title>
        <Typography.Text type="secondary">
          Create survey, generate insights, and build customer personas without
          coding or any technical skills - all in Heron Analytica
        </Typography.Text>

        <div
          style={{
            height: "800px",
            width: "100%",
            backgroundImage: "url('/images/monitor.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </Flex>

      <Flex justify="center" align="center" vertical style={{ margin: 30 }}>
        <Button
          type="primary"
          style={{
            backgroundColor: "#222F65",
            fontSize: 18,
            padding: "20px",
          }}
        >
          Sign up now
        </Button>
      </Flex>

      {/* Fetaure Overview */}
      <Flex justify="center" align="center" vertical>
        <Typography.Title level={2}>
          If you target everyone, you target no one.
        </Typography.Title>
        <Typography.Text type="secondary">
          Take the guesswork out of understanding your customers
        </Typography.Text>
        <br />
        <br />
        <br />
        <Flex
          justify="space-between"
          align="center"
          gap="100px"
          style={{ padding: "0 15%", margin: "20px 0" }}
        >
          <Image
            src="/images/progressional_quality.png"
            alt="Progressional Quality"
            height={400}
            width={500}
          />
          <div>
            <Typography.Title level={1}>Progressional quality</Typography.Title>
            <Typography.Text type="secondary">
              Get the same precision and depth of analysis that you’d expect
              from a market research company. Achieve professional-grade
              insights powered by an advanced algorithm crafted by market
              researchers & data scientists from top market research companies.
            </Typography.Text>
          </div>
        </Flex>
        <Flex
          justify="space-between"
          align="center"
          gap="100px"
          style={{ padding: "0 15%", margin: "20px 0" }}
        >
          {/* Display image progressional_quality.png */}
          <Image
            src="/images/save_time_and_cut_costs.png"
            alt="Progressional Quality"
            height={400}
            width={500}
          />
          <div>
            <Typography.Title level={1}>
              Save Time and Cut Costs
            </Typography.Title>
            <Typography.Text type="secondary">
              Cut research time by 2x and save 3x the cost by eliminating the
              need for hiring a market research company.
            </Typography.Text>
          </div>
        </Flex>
        <Flex
          justify="space-between"
          align="center"
          gap="100px"
          style={{ padding: "0 15%", margin: "20px 0" }}
        >
          {/* Display image progressional_quality.png */}
          <Image
            src="/images/no_coding_no_complexity.png"
            alt="Progressional Quality"
            height={400}
            width={500}
          />
          <div>
            <Typography.Title level={1}>
              No Coding, No Complexity
            </Typography.Title>
            <Typography.Text type="secondary">
              Built for small and medium sized businesses — no code or no
              technical expertise needed.
            </Typography.Text>
          </div>
        </Flex>
        <Typography.Title
          level={2}
          style={{ textAlign: "center", margin: "120px 0" }}
        >
          Transform Your Marketing Campaign and
          <br />
          Improve Return On Investment
        </Typography.Title>
      </Flex>

      {/* How it works */}
      <Flex
        align="flex-start"
        vertical
        style={{ padding: "0 15%" }}
        gap={"30px"}
      >
        <Typography.Title level={2}>How it works</Typography.Title>
        {howItWorkContent.map((item, index) => (
          <Flex key={index} justify="center">
            <HowItWorkIcon style={{ marginRight: 10, minWidth: "40px" }} />
            <Flex align="flex-start" vertical>
              <Typography.Title level={5}>
                {item.index}.&nbsp;{item.title}
              </Typography.Title>
              <Typography.Text>{item.description}</Typography.Text>
            </Flex>
          </Flex>
        ))}
      </Flex>

      {/* Footer */}
      <div
        style={{
          height: "400px",
          width: "100%",
          backgroundImage: "url('/images/footer_shading.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover", // Ensure the image fits the width and height
          zIndex: -1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: "100px",
        }}
      >
        <Flex justify="center" align="center" vertical style={{ margin: 30 }}>
          <Button
            type="primary"
            style={{
              backgroundColor: "#222F65",
              fontSize: 18,
              padding: "20px",
              marginTop: "70px",
            }}
          >
            Sign up now
          </Button>
        </Flex>
        <div
          style={{
            height: "200px",
            width: "100%",
            backgroundColor: "#E7ECFF",
            padding: "20px 10%",
          }}
        >
          <Flex align="center" style={{ height: "80px" }}>
            <Typography.Text type="secondary">
              @2024 Heronalytica
            </Typography.Text>
          </Flex>
          <Divider />
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={"40px"}>
              <Typography.Text type="secondary">Home</Typography.Text>
              <Typography.Text type="secondary">About</Typography.Text>
              <Typography.Text type="secondary">Contact</Typography.Text>
            </Flex>
            <Flex align="center">
              <div />
            </Flex>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default Home;
