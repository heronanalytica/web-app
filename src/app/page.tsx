"use client";

import React from "react";
import { Button, Divider, Flex, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HowItWorkIcon from "./components/icons/HowItWorkIcon";
import { howItWorkContent } from "./constants";
import Link from "next/link";

const Home: React.FC = () => {
  const router = useRouter();

  const handleNavigateToContact = () => {
    router.push("/contact");
  };

  return (
    <div>
      {/* Hero Section */}
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
          size="large"
          style={{
            backgroundColor: "#222F65",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            marginTop: "70px",
          }}
          onClick={handleNavigateToContact}
        >
          Sign up now
        </Button>
      </Flex>

      {/* Feature Overview */}
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
          <Image
            src="/images/save_time_and_cut_costs.png"
            alt="Save Time and Cut Costs"
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
          <Image
            src="/images/no_coding_no_complexity.png"
            alt="No Coding, No Complexity"
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
          backgroundSize: "cover",
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
            size="large"
            style={{
              backgroundColor: "#222F65",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              marginTop: "70px",
            }}
            onClick={handleNavigateToContact}
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
              <Link href={"/"} style={{ color: "#929ECC" }}>
                Home
              </Link>
              <Link href={"/pricing"} style={{ color: "#929ECC" }}>
                Pricing
              </Link>
              <Link href={"/contact"} style={{ color: "#929ECC" }}>
                Contact
              </Link>
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
