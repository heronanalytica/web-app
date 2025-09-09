import React from "react";
import { Card, Typography, Empty } from "antd";
import PersonaFilePreview from "./PersonaFilePreview";
import styles from "../../styles.module.scss";
import { ClassifiedPersonaFile } from "@/types/campaign";

const { Text } = Typography;

interface PersonasInfoProps {
  classifiedPersonaFile?: ClassifiedPersonaFile;
}

export const PersonasInfo: React.FC<PersonasInfoProps> = ({
  classifiedPersonaFile,
}) => {
  return (
    <div className={styles.tabContent}>
      {classifiedPersonaFile ? (
        <PersonaFilePreview file={classifiedPersonaFile} />
      ) : (
        <Card className={styles.emptyStateCard}>
          <Empty
            description={
              <Text type="secondary">
                No classified persona data available. Please complete the
                customer file upload and analysis steps first.
              </Text>
            }
          />
        </Card>
      )}
    </div>
  );
};
