"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, Row, Col } from "antd";
import { trackEvent } from "@/lib/analytics";
import { RightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    trackEvent({
      action: "submit_form",
      category: "Contact",
      label: "Contact Form",
    });

    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          message: formData.message,
          subject: formData.subject, // Add subject
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          backgroundImage: "url('/images/pricing_top_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          height: "100%",
          width: "100vw",
          padding: "50px 0",
        }}
      >
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Title level={2} style={{ color: "#101010" }}>
            Thank you for getting in touch!
          </Title>
          <Text>We&apos;ll respond to your inquiry soon.</Text>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: "url('/images/pricing_top_background.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        height: "100%",
        width: "100vw",
        padding: "50px 0",
      }}
    >
      <div
        style={{
          padding: "50px 5%",
          maxWidth: "1200px",
          margin: "auto",
          borderRadius: "10px",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Left Section */}
          <Col xs={24} md={12}>
            <Title
              level={1}
              style={{
                color: "#101010",
                marginBottom: "20px",
                fontSize: "3rem",
              }}
            >
              Get in touch
              <br />
              with us today
            </Title>
            <Text style={{ fontSize: "16px", color: "#6F7CB2" }}>
              Have a question? We have answers.
            </Text>
          </Col>

          {/* Form Section */}
          <Col xs={24} md={12}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
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
              <Form layout="vertical" onSubmitCapture={handleSubmit}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="First name"
                      required
                      style={{ marginBottom: "20px" }}
                    >
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        required
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Last name"
                      required
                      style={{ marginBottom: "20px" }}
                    >
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        required
                      />
                    </Form.Item>
                  </Col>
                </Row>
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
                  label="Subject"
                  required
                  style={{ marginBottom: "20px" }}
                >
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter your subject"
                    required
                  />
                </Form.Item>
                <Form.Item
                  label="Message"
                  required
                  style={{ marginBottom: "20px" }}
                >
                  <Input.TextArea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message"
                    rows={4}
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
                      // fontSize: "20px",
                      // padding: "30px 20px",
                      width: "100%",
                    }}
                    disabled={isSubmitting}
                    size="large"
                  >
                    {isSubmitting ? "Sending..." : "Send"}
                    <RightOutlined />
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
