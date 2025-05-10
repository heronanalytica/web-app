"use client";

import { Modal, Button, Typography } from "antd";
import { FontPoppins } from "@/app/fonts/poppins";

const { Text } = Typography;

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: RegisterModalProps) {
  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      centered
      footer={[
        <Button
          key="ok"
          type="primary"
          onClick={onClose}
          style={{
            backgroundColor: "#6C5CE7",
            borderColor: "#6C5CE7",
          }}
        >
          Ok
        </Button>,
      ]}
    >
      <Text className={FontPoppins.className}>
        Thank you for your interest. However, we’re in beta stage and
        registration is invitation only.
        <br />
        Please sign up for waitlist or contact us.
      </Text>
    </Modal>
  );
}
