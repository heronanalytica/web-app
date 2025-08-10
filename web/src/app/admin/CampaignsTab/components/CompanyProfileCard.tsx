import { Card, Typography, Button, Space, Divider, message, Input } from "antd";
import { Campaign } from "@/types/campaign";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { fetcher } from "@/lib/fetcher";

const { TextArea } = Input;

const { Title, Text, Paragraph } = Typography;

interface CompanyProfileCardProps {
  campaign: Campaign;
  onUpdate: (updatedCampaign: Campaign) => void;
}

const CompanyProfileCard: React.FC<CompanyProfileCardProps> = ({
  campaign,
  onUpdate,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const companyProfile = campaign.companyProfile;

  const handleAnalyzeProfile = async () => {
    try {
      setLoading(true);
      // Call the analyze endpoint
      const newCompanyProfile = await fetcher.post(
        `/api/company-profiles/analyze`,
        {
          campaignId: campaign.id,
          companyProfileId: companyProfile?.id,
        }
      );

      if (newCompanyProfile && companyProfile) {
        // Update the campaign with the analyzed data
        onUpdate({
          ...campaign,
          companyProfile: newCompanyProfile,
        });
        messageApi.success("Company profile analyzed successfully");
      }
    } catch (error) {
      console.error("Error analyzing company profile:", error);
      messageApi.error("Failed to analyze company profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingField || !editingValue.trim()) {
      setEditingField(null);
      return;
    }

    if (!companyProfile) {
      return;
    }

    try {
      setLoading(true);
      // Call the update endpoint
      await fetcher.put(`/api/company-profiles/admin/${companyProfile.id}`, {
        userId: campaign.userId,
        [editingField]: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ...companyProfile[editingField],
          summary: editingValue,
        },
      });

      // Update the campaign with the new data
      onUpdate({
        ...campaign,
        companyProfile: {
          ...companyProfile,
          [editingField]: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            ...companyProfile[editingField],
            summary: editingValue,
          },
        },
      });
      messageApi.success("Company profile updated successfully");
      setEditingField(null);
    } catch (error) {
      console.error("Error updating company profile:", error);
      messageApi.error("Failed to update company profile");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditingValue("");
  };

  const renderEditableField = (
    field: string,
    label: string,
    value: string,
    isMarkdown: boolean = false
  ) => {
    if (editingField === field) {
      return (
        <div style={{ marginBottom: 16 }}>
          <Text strong>{label}:</Text>
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            {isMarkdown ? (
              <TextArea
                rows={6}
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                style={{ width: "100%" }}
              />
            ) : (
              <TextArea
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                style={{ width: "100%" }}
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
            )}
          </div>
          <Space>
            <Button type="primary" size="small" onClick={handleSaveEdit}>
              Save
            </Button>
            <Button size="small" onClick={cancelEditing}>
              Cancel
            </Button>
          </Space>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: 16, position: "relative" }}>
        <Text strong>{label}:</Text>
        <div style={{ marginTop: 4 }}>
          {value ? (
            <Paragraph style={{ marginBottom: 0 }}>{value}</Paragraph>
          ) : (
            <Text type="secondary">Not set</Text>
          )}
        </div>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => startEditing(field, value || "")}
          style={{ position: "absolute", top: 0, right: 0 }}
        />
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      <Card
        title={
          <Space>
            <Title level={5} style={{ margin: 0 }}>
              Company Profile & Marketing Tone
            </Title>
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Button
            type="primary"
            onClick={handleAnalyzeProfile}
            loading={loading}
            disabled={!companyProfile}
          >
            Analyze with AI
          </Button>
        }
      >
        {!companyProfile ? (
          <Text type="secondary">
            No company profile available for this campaign
          </Text>
        ) : (
          <>
            {renderEditableField(
              "generatedOverallProfile",
              "Company Profile",
              companyProfile.generatedOverallProfile?.summary || "",
              true
            )}
            <Divider style={{ margin: "16px 0" }} />
            {renderEditableField(
              "generatedMarketingTone",
              "Marketing Tone",
              companyProfile.generatedMarketingTone?.summary || ""
            )}
          </>
        )}
      </Card>
    </>
  );
};

export default CompanyProfileCard;
