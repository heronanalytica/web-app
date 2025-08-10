import React, { useEffect, useState, useMemo } from "react";
import { Card, Table, Spin } from "antd";
import type { TableProps } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/fetcher";
import styles from "../../styles.module.scss";
import type { ClassifiedPersonaFile } from "@/types/campaign";

type DataType = Record<string, string | number | boolean | null>;

const PAGE_SIZE = 10;

interface PersonaFilePreviewProps {
  file: ClassifiedPersonaFile;
}

const PersonaFilePreview: React.FC<PersonaFilePreviewProps> = ({ file }) => {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<DataType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
        const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
        if (parsed.errors.length > 0) {
          console.error('CSV parsing errors:', parsed.errors);
          throw new Error('Failed to parse CSV data');
        }
        setPreviewData(parsed.data as DataType[]);
      } catch (err) {
        console.error("Error fetching persona preview:", err);
        setError("Failed to load persona data");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [file]);

  // Get column headers (first row of data)
  const columns: TableProps<DataType>['columns'] = useMemo(() => {
    if (previewData.length === 0) return [];
    
    return Object.keys(previewData[0]).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      render: (value: unknown) => String(value || ""),
    }));
  }, [previewData]);

  // Pagination config
  const pagination = {
    current: currentPage,
    pageSize: PAGE_SIZE,
    total: previewData.length,
    onChange: (page: number) => setCurrentPage(page),
    showSizeChanger: false,
  };

  if (loading) {
    return (
      <div className={styles.personaPreviewLoading}>
        <Spin />
        <span style={{ marginLeft: 8 }}>Loading persona data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={styles.personaPreviewCard}>
        <div style={{ color: '#ff4d4f' }}>{error}</div>
      </Card>
    );
  }

  if (previewData.length === 0) {
    return (
      <Card className={styles.personaPreviewCard}>
        <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>No persona data available</div>
      </Card>
    );
  }

  return (
    <div className={styles.personaPreviewContainer}>
      <Card
        className={styles.personaPreviewCard}
        title={
          <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
            <FileOutlined style={{ marginRight: 8 }} />
            <span>Classified Persona Data</span>
          </div>
        }
      >
        <div className={styles.personaPreviewTableWrapper}>
          <Table
            dataSource={previewData}
            columns={columns}
            pagination={pagination}
            loading={loading}
            rowKey={(record, index) => `row-${index}`}
            scroll={{ x: true }}
            size="small"
            className={styles.personaTable}
          />
        </div>
      </Card>
    </div>
  );
};

export default PersonaFilePreview;
