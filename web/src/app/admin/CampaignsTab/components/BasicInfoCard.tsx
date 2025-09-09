import { Card, Descriptions, Tag, Button, Space, Typography } from "antd";
import { Campaign } from "@/types/campaign";
import { CampaignStatus } from "@/types/campaign";
import { DownloadOutlined, FileOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";

interface BasicInfoCardProps {
  campaign: Campaign;
}

const getStatusTag = (status: CampaignStatus) => {
  const statusColors = {
    [CampaignStatus.DRAFT]: "blue",
    [CampaignStatus.ACTIVE]: "green",
    [CampaignStatus.PAUSED]: "orange",
    [CampaignStatus.COMPLETED]: "gray",
  };

  return (
    <Tag color={statusColors[status] || "default"}>{status.toUpperCase()}</Tag>
  );
};

const FileDownloadItem: React.FC<{
  fileId?: string;
  fileName?: string;
  label: string;
}> = ({ fileId, fileName, label }) => {
  if (!fileId) return null;

  const downloadFile = async (fileId: string, fileName: string) => {
    const response = await fetcher.raw(
      `/api/file/download/${encodeURIComponent(fileId)}`
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <Space>
        <FileOutlined />
        <Typography.Text>{label}:</Typography.Text>
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => downloadFile(fileId, fileName || "")}
          style={{ padding: 0, height: "auto" }}
        >
          {fileName || "Download File"}
        </Button>
      </Space>
    </div>
  );
};

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ campaign }) => {
  return (
    <Card title="Basic Information" style={{ marginBottom: 24 }}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{campaign.name}</Descriptions.Item>
        <Descriptions.Item label="Status">
          {getStatusTag(campaign.status)}
        </Descriptions.Item>
        <Descriptions.Item label="Created By">
          {campaign.user?.email || "Unknown"}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(campaign.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {new Date(campaign.updatedAt).toLocaleString()}
        </Descriptions.Item>

        {/* File Downloads Section */}
        <Descriptions.Item
          label="Files"
          contentStyle={{ padding: "12px 24px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FileDownloadItem
              fileId={campaign.stepState?.customerFile?.fileId}
              fileName={campaign.stepState?.customerFile?.fileName}
              label="Customer File"
            />
            <FileDownloadItem
              fileId={
                campaign.stepState?.companyProfile?.marketingContentFileId
              }
              fileName="Marketing Content"
              label="Marketing File"
            />
            <FileDownloadItem
              fileId={campaign.stepState?.companyProfile?.designAssetFileId}
              fileName="Design Asset"
              label="Design Asset File"
            />
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default BasicInfoCard;
