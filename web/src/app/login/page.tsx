"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, Row, Col } from "antd";
import Image from "next/image";
import type { AuthApiResponse } from "@/types/auth";
import { FontPoppins } from "../../assets/fonts/poppins";
import RegisterModal from "./RegisterModal";
import styles from "./styles.module.scss";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { fetcher } from "@/lib/fetcher";

const { Title, Text, Link } = Typography;

export default function Login() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await fetcher.post<AuthApiResponse>("/api/auth/login", formData);
      await refresh();
      router.push(ROUTES.APP_HOMEPAGE);
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Row gutter={[16, 16]} align="middle">
          {/* Left Section */}
          <Col xs={24} md={12}>
            <Row align="top">
              <Col xs={24} md={12}>
                <div className={styles.leftTextWrapper}>
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
                    You can&nbsp;
                    <Link
                      className={`${FontPoppins.className}`}
                      style={{ fontSize: "22px", cursor: "pointer" }}
                      onClick={() => setIsRegisterModalOpen(true)}
                    >
                      Register here !
                    </Link>
                  </Text>
                </div>
              </Col>
              <Col xs={0} md={12}>
                {/* Login illustration Image */}
                <Image
                  src={"/images/login_image.png"}
                  width={400}
                  height={700}
                  alt="Login illustration"
                  className={styles.loginIllustration}
                />
              </Col>
            </Row>
          </Col>

          {/* Form Section */}
          <Col xs={24} md={12}>
            <div className={styles.formCard}>
              <Form layout="vertical" onSubmitCapture={handleSubmit}>
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
                    autoComplete="current-password"
                  />
                </Form.Item>

                <div className={styles.forgotPasswordBtnWrapper}>
                  <Text
                    type="secondary"
                    className={styles.forgotPasswordBtn}
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                  >
                    Forgot Password?
                  </Text>
                </div>

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
                    loading={loading}
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

              {/* Register Modal */}
              <RegisterModal
                open={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
              />
              {/* Forgot Password Modal */}
              <ForgotPasswordModal
                open={isForgotPasswordModalOpen}
                onClose={() => setIsForgotPasswordModalOpen(false)}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
