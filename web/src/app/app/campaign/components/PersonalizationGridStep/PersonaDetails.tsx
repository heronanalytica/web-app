import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Typography, Tabs, Tag, Skeleton } from "antd";
import type { DescriptionsProps } from "antd";
import { Persona } from "@/types/persona";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface PersonaDetailsProps {
  visible: boolean;
  onClose: () => void;
  personaCode: string | null;
}

const PersonaDetails: React.FC<PersonaDetailsProps> = ({
  visible,
  onClose,
  personaCode,
}) => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPersona = async () => {
      if (!personaCode) {
        setPersona(null);
        return;
      }

      setLoading(true);
      try {
        const { default: personas } = await import("./persona-lib.json");
        const foundPersona = personas.find(
          (p: Persona) => p.code === personaCode
        );
        setPersona(foundPersona || null);
      } catch (error) {
        console.error("Failed to load persona:", error);
        setPersona(null);
      } finally {
        setLoading(false);
      }
    };

    loadPersona();
  }, [personaCode]);

  if (loading) {
    return (
      <Modal
        title="Loading Persona..."
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <Skeleton active />
      </Modal>
    );
  }

  if (!persona) {
    return (
      <Modal
        title="Persona Not Found"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <p>Could not find the requested persona information.</p>
      </Modal>
    );
  }

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Demographics",
      children: (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {persona &&
            Object.entries(persona.demographics).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
        </ul>
      ),
      span: 3,
    },
    {
      key: "2",
      label: "Bio",
      children: persona?.bio.Bio || "No bio available",
      span: 3,
    },
  ];

  return (
    <Modal
      title={
        <>
          {persona.name} <Text type="secondary">({persona.code})</Text>
        </>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Overview" key="1">
          <Descriptions
            bordered
            column={3}
            items={items}
            style={{ marginTop: 16 }}
            contentStyle={{ background: "#fff" }}
            labelStyle={{ fontWeight: 600, width: "150px" }}
          />
        </TabPane>
        <TabPane tab="Psychographics" key="2">
          <div style={{ padding: "16px 0" }}>
            {Object.entries(persona.psychographics || {}).map(
              ([key, value]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <Text strong>{key}:</Text>
                  <div style={{ marginTop: 4 }}>{value}</div>
                </div>
              )
            )}
          </div>
        </TabPane>
        <TabPane tab="Media & Behavior" key="3">
          <div style={{ padding: "16px 0" }}>
            {Object.entries(
              persona.media_engagement_purchase_behavior || {}
            ).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <Text strong>{key}:</Text>
                <div style={{ marginTop: 4 }}>{value}</div>
              </div>
            ))}
          </div>
        </TabPane>
      </Tabs>

      <div style={{ marginTop: 24 }}>
        <Title level={5}>Tags</Title>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {persona.tags?.map((tag: string) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default PersonaDetails;
