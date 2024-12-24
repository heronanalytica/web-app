"use client";
import React from "react";
import HeronLogo from "./components/icons/HeronLogo";
import { Button, Flex, Typography } from "antd";
import Image from "next/image";
import HowItWorkIcon from "./components/icons/HowItWorkIcon";

const Home: React.FC = () => {
  return (
    <div>
      <Flex
        justify="center"
        align="center"
        gap={30}
        style={{ height: "80px", marginBottom: 60 }}
      >
        <div style={{ position: "absolute", top: 10, left: 50 }}>
          <HeronLogo />
        </div>
        <div>Home</div>
        <div>Pricing</div>
        <div>Contact</div>
      </Flex>

      {/* TODO: Hero section */}
      <Flex justify="center" align="center" vertical>
        <Typography.Title level={1}>
          Unlock Targeted Marketing,
        </Typography.Title>
        <Typography.Title level={1}>
          Personalize Customer experience
        </Typography.Title>
        <Typography.Text>
          Create survey, generate insights, and build customer personas without
          coding or any technical skills - all in Heron Analytica
        </Typography.Text>

        {/* TODO: Screen with video */}
      </Flex>

      <Flex justify="center" align="center" vertical>
        <Button type="primary">Sign up now</Button>
      </Flex>

      {/* Fetaure Overview */}
      <Flex justify="center" align="center" vertical>
        <Typography.Title level={1}>
          If you target everyone, you target no one.
        </Typography.Title>
        <Typography.Text>
          Take the guesswork out of understanding your customers
        </Typography.Text>
        <Flex justify="space-between" align="center">
          {/* Display image progressional_quality.png */}
          <Image
            src="/images/progressional_quality.png"
            alt="Progressional Quality"
            height={400}
            width={500}
          />
          <div>
            <Typography.Title level={1}>Progressional quality</Typography.Title>
            <Typography.Text>
              Get the same precision and depth of analysis that you’d expect
              from a market research company. Achieve professional-grade
              insights powered by an advanced algorithm crafted by market
              researchers & data scientists from top market research companies.
            </Typography.Text>
          </div>
        </Flex>
        <Flex justify="space-between" align="center">
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
            <Typography.Text>
              Cut research time by 2x and save 3x the cost by eliminating the
              need for hiring a market research company.
            </Typography.Text>
          </div>
        </Flex>
        <Flex justify="space-between" align="center">
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
            <Typography.Text>
              Built for small and medium sized businesses — no code or no
              technical expertise needed.
            </Typography.Text>
          </div>
        </Flex>
        <Typography.Title level={1}>
          Transform Your Marketing Campaign and Improve Return On Investment
        </Typography.Title>
      </Flex>

      {/* How it works */}
      <Flex justify="center" align="center" vertical>
        <Flex justify="center" align="center">
          <HowItWorkIcon />
          <Flex justify="flex-start" align="center" vertical>
            <Typography.Title level={5}>1. Define</Typography.Title>
            <Typography.Text>
              Decide what customer behaviors, interests, or psychographics you
              want to analyze—whether it’s buying patterns, brand loyalty, or
              values.
            </Typography.Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex justify="center" align="center" vertical>
        <Button type="primary">Sign up now</Button>
      </Flex>
    </div>
  );
};

export default Home;
