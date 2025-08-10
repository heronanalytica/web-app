import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Spin, Typography } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";
import styles from "../../styles.module.scss";
import { ClassifiedPersonaFile } from "@/types/campaign";

const { Text } = Typography;

interface PersonaFilePreviewProps {
  file: ClassifiedPersonaFile;
}

const PersonaFilePreview: React.FC<PersonaFilePreviewProps> = ({ file }) => {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  // State for full screen preview modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!file.id) return;

      setLoading(true);
      try {
        const response = await fetcher.raw(
          `/api/file/download/${encodeURIComponent(file.id)}`
        );
        if (!response.ok) throw new Error("Failed to fetch file");
        const csvText = await response.text();
        const Papa = (await import("papaparse")).default;
        const parsed = Papa.parse(csvText, { preview: 10 });
        setPreviewData(parsed.data);
      } catch (err) {
        console.error("Error fetching persona preview:", err);
        setError("Failed to load persona data");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [file]);

  if (loading) {
    return (
      <div className={styles.personaPreviewLoading}>
        <Spin />
        <Text style={{ marginLeft: 8 }}>Loading persona data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={styles.personaPreviewCard}>
        <Text type="danger">{error}</Text>
      </Card>
    );
  }

  if (previewData.length === 0) {
    return (
      <Card className={styles.personaPreviewCard}>
        <Text type="secondary">No persona data available</Text>
      </Card>
    );
  }

  // Get column headers (first row of data)
  const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];
  const previewRows = previewData.slice(0, 5); // Show first 5 rows in preview

  return (
    <div className={styles.personaPreviewContainer}>
      <Card
        className={styles.personaPreviewCard}
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <FileOutlined style={{ marginRight: 8 }} />
            <span>Classified Persona Data</span>
          </div>
        }
        extra={
          <Button
            type="link"
            onClick={() => setIsModalVisible(true)}
            disabled={previewData.length === 0}
          >
            View Full Data
          </Button>
        }
      >
        <div className={styles.personaPreviewTableWrapper}>
          <table className={styles.personaPreviewTable}>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className={styles.personaPreviewHeader}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className={styles.personaPreviewRow}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className={styles.personaPreviewCell}>
                      {String(row[header] || "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewData.length > 5 && (
            <div className={styles.personaPreviewMore}>
              + {previewData.length - 5} more rows
            </div>
          )}
        </div>
      </Card>

      {/* Full Screen Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <FileOutlined style={{ marginRight: 8 }} />
            <span>Full Persona Data</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <table className={styles.personaPreviewTable}>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className={styles.personaPreviewHeader}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex} className={styles.personaPreviewRow}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className={styles.personaPreviewCell}>
                      {String(row[header] || "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default PersonaFilePreview;
