"use client";

import { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { trackEvent } from "@/lib/analytics";

const { Title } = Typography;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        body: JSON.stringify(formData),
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
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Title level={2} style={{ color: "#101010" }}>
          Thank you for getting in touch!
        </Title>
        <p>We&apos;ll respond to your inquiry soon.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "50px 20px", maxWidth: "600px", margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
        Get In Touch
      </Title>
      {error && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>
          {error}
        </p>
      )}
      <Form layout="vertical" onSubmitCapture={handleSubmit}>
        <Form.Item label="Your Name" required style={{ marginBottom: "20px" }}>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </Form.Item>
        <Form.Item label="Your Email" required style={{ marginBottom: "20px" }}>
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
          label="Your Message"
          required
          style={{ marginBottom: "30px" }}
        >
          <Input.TextArea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter your message"
            rows={4}
            required
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "#001F54",
              borderColor: "#001F54",
              color: "#FFFFFF",
              fontSize: "16px",
              width: "100%",
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
