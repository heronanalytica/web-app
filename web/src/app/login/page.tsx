"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, Row, Col } from "antd";
import Image from "next/image";
import type { AuthApiResponse } from "@/types/auth";
import { FontPoppins } from "../fonts/poppins";

const { Title, Text, Link } = Typography;

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const data: AuthApiResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      window.alert("Login successfully");

      // You can now redirect user or fetch their profile
      // router.push('/dashboard'); (optional)
    } catch (err) {
      console.error("Login error", err);
      setError("Unexpected error occurred");
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('/images/pricing_top_background.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        height: "100vh",
        top: 0,
        position: "absolute",
        width: "100vw",
        padding: "100px 0 0 0",
      }}
    >
      <div
        style={{
          padding: "50px 5%",
          margin: "auto",
          borderRadius: "10px",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Left Section */}
          <Col xs={24} md={12}>
            <Row align="top">
              <Col xs={24} md={12}>
                <div
                  style={{
                    marginTop: "80px",
                    paddingLeft: "12%",
                  }}
                >
                  <Text
                    className={`${FontPoppins.className}`}
                    style={{ fontSize: "22px" }}
                  >
                    If you dont have an account register
                  </Text>
                  <br />
                  <Text
                    className={`${FontPoppins.className}`}
                    style={{ fontSize: "22px" }}
                  >
                    You can{" "}
                    <Link
                      className={`${FontPoppins.className}`}
                      style={{ fontSize: "22px" }}
                    >
                      Register here !
                    </Link>
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Image
                  src={"/images/login_image.png"}
                  width={400}
                  height={700}
                  alt="Login illustration"
                />
              </Col>
            </Row>
          </Col>

          {/* Form Section */}
          <Col xs={24} md={12}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",

                maxWidth: "600px",
              }}
            >
              <Form
                layout="vertical"
                onSubmitCapture={handleSubmit}
                style={{ padding: "30px" }}
              >
                <Title level={3}>Sign In</Title>
                <Form.Item
                  label="Email"
                  required
                  style={{ marginBottom: "20px" }}
                >
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Item>
                <Form.Item
                  label="Password"
                  required
                  style={{ marginBottom: "20px" }}
                >
                  <Input.Password
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      backgroundColor: "#512C7E",
                      borderColor: "#512C7E",
                      color: "#FFFFFF",
                      width: "100%",
                      marginTop: "30px",
                    }}
                    size="large"
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>

              {error && (
                <Text
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginBottom: "20px",
                    display: "block",
                  }}
                >
                  {error}
                </Text>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
