import React from "react";
import { Typography, Card, Row, Col, Tag } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { Campaign } from "@/types/campaign";
import styles from "./style.module.scss";

const { Title, Text } = Typography;

interface CampaignViewProps {
  campaign: Campaign;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ campaign }) => {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <CheckCircleFilled className={styles.successIcon} />
          <Title level={2} style={{ marginBottom: 8 }}>
            Campaign Launched Successfully
          </Title>
          <Text type="secondary">Your campaign is now live and running</Text>
        </div>

        <div className={styles.statsContainer}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} style={{ textAlign: "center" }}>
              <div>
                <Text type="secondary" className={styles.label}>
                  Status
                </Text>
                <div>
                  <Tag
                    color="success"
                    style={{ fontSize: 16, padding: "4px 12px" }}
                  >
                    {campaign.status}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: "center" }}>
              <div>
                <Text type="secondary" className={styles.label}>
                  Launched At
                </Text>
                <div className={styles.value}>
                  {campaign.launchedAt
                    ? new Date(campaign.launchedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className={styles.message}>
          <Title level={4} style={{ marginBottom: 8 }}>
            What&apos;s Next?
          </Title>
          <Text>
            Your campaign is now active. You can track its performance and
            manage it from this dashboard. We&apos;ll notify you as we gather
            more data about your campaign&apos;s performance.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default CampaignView;
