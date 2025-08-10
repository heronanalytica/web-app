import { Card, Typography } from "antd";
import type { Campaign } from "@/types/campaign";
import CustomerPersonaUploader from "./CustomerPersonaUploader";

const { Text } = Typography;

interface ClassifiedPersonaCardProps {
  campaign: Campaign;
  onUpdate: (updates: Partial<Campaign>) => void;
}

const ClassifiedPersonaCard: React.FC<ClassifiedPersonaCardProps> = ({
  campaign,
  onUpdate,
}) => {
  return (
    <Card title="Classified Customers Persona" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Upload a CSV file containing classified customer persona data. This
          data will be used for analysis and reporting.
        </Text>
      </div>
      <CustomerPersonaUploader
        userId={campaign.user?.id}
        campaignId={campaign.id}
        initialFileId={campaign.stepState?.classifiedPersonaFile?.fileId}
        initialFileName={campaign.stepState?.classifiedPersonaFile?.fileName}
        onUploadSuccess={(fileId, fileName) => {
          onUpdate({
            stepState: {
              ...campaign.stepState,
              classifiedPersonaFile: {
                fileId,
                fileName,
              },
            },
          });
        }}
        onDelete={() => {
          onUpdate({
            stepState: {
              ...campaign.stepState,
              classifiedPersonaFile: undefined,
            },
          });
        }}
      />
    </Card>
  );
};

export default ClassifiedPersonaCard;
