"use client";

import { Modal, Button, Typography } from "antd";
import { FontPoppins } from "@/assets/fonts/poppins";

const { Text } = Typography;

type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
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
        Please contact us to reset password.
      </Text>
    </Modal>
  );
}
