import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { RightOutlined } from "@ant-design/icons";

const SignUpButton = () => {
  const router = useRouter();

  const handleNavigateToPricing = () => {
    trackEvent({
      action: "click",
      category: "Homepage",
      label: "Sign Up Now",
    });
    router.push("/pricing");
  };

  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
        color: "#222F65",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "1rem",
      }}
      onClick={handleNavigateToPricing}
    >
      Sign up now &nbsp;
      <RightOutlined style={{ fontSize: "12px" }} />
    </motion.button>
  );
};

export default SignUpButton;
