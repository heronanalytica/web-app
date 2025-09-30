import React from "react";
import { Modal, Table, Empty } from "antd";

type RationaleMapItem = {
  persona_insight: string;
  copy_adjustment: string;
  rationale: string;
};

type PersonalizationRationale = {
  explanation_id: string;
  mapping: RationaleMapItem[];
};

export default function PersonalizationRationaleModal({
  open,
  onClose,
  renderedEmail,
  recipientDisplayName,
}: {
  open: boolean;
  onClose: () => void;
  renderedEmail: {
    rationale?: PersonalizationRationale | null;
  } | null;
  recipientDisplayName?: string | null;
}) {
  const hasData = !!renderedEmail?.rationale?.mapping?.length;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      width={840}
      title={<span>Resonate for {recipientDisplayName || "Recipient"}</span>}
    >
      {!hasData ? (
        <Empty description="No personalization rationale available for this email." />
      ) : (
        <Table<RationaleMapItem>
          rowKey={(r, idx) => String(idx)}
          pagination={false}
          dataSource={renderedEmail!.rationale!.mapping}
          columns={[
            {
              title: "Persona insight",
              dataIndex: "persona_insight",
              width: 240,
            },
            {
              title: "Copy adjustment",
              dataIndex: "copy_adjustment",
              width: 260,
            },
            {
              title: "Rationale",
              dataIndex: "rationale",
            },
          ]}
        />
      )}
    </Modal>
  );
}
