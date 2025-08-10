import React from "react";
import { Typography, Tag } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { capitalizeFirstLetter, capitalizeWords } from "@/utils/stringUtils";
import styles from "../../styles.module.scss";

const { Title, Text } = Typography;

interface CompanyInfoProps {
  companyProfile: {
    name?: string;
    website?: string;
    businessInfo?: string;
    generatedOverallProfile?: {
      values?: string[];
      brand_positioning?: string;
      tone_of_voice?: string;
      summary?: string;
    };
    generatedMarketingTone?: {
      summary?: string;
    };
  };
}

export const CompanyInfo: React.FC<CompanyInfoProps> = ({ companyProfile }) => {
  const companyValues = companyProfile.generatedOverallProfile?.values || [];
  const brandPositioning =
    companyProfile.generatedOverallProfile?.brand_positioning ||
    "Not specified";
  const toneOfVoice =
    companyProfile.generatedOverallProfile?.tone_of_voice || "Not specified";
  const marketingTone =
    companyProfile.generatedMarketingTone?.summary || "Not specified";

  return (
    <div className={styles.tabContent}>
      <div className={styles.companyInfo}>
        <div className={styles.logoContainer}>
          <div className={styles.logoPlaceholder}>
            {companyProfile.name?.[0]?.toUpperCase() || "C"}
          </div>
        </div>

        <div className={styles.companyDetails}>
          <Title level={5} className={styles.companyName}>
            {capitalizeWords(companyProfile.name) || "Company Name"}
          </Title>

          {companyProfile.website && (
            <div className={styles.infoRow}>
              <GlobalOutlined className={styles.icon} />
              <a
                href={
                  companyProfile.website.startsWith("http")
                    ? companyProfile.website
                    : `https://${companyProfile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {companyProfile.website}
              </a>
            </div>
          )}

          {companyValues.length > 0 && (
            <div className={styles.tagsContainer}>
              {companyValues.map((value, i) => (
                <Tag key={i} color="blue">
                  {capitalizeWords(value)}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {companyProfile.businessInfo && (
        <div className={styles.aboutSection}>
          <Title level={5} className={styles.sectionSubtitle}>
            Business Information
          </Title>
          <Text>{companyProfile.businessInfo}</Text>
        </div>
      )}

      {companyProfile.generatedOverallProfile?.summary && (
        <div className={styles.aboutSection}>
          <Title level={5} className={styles.sectionSubtitle}>
            Company Overview
          </Title>
          <Text>
            {capitalizeFirstLetter(
              companyProfile.generatedOverallProfile.summary
            )}
          </Text>
        </div>
      )}

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <Title level={5} className={styles.sectionSubtitle}>
            Brand Positioning
          </Title>
          <Text>{capitalizeFirstLetter(brandPositioning)}</Text>
        </div>

        <div className={styles.infoCard}>
          <Title level={5} className={styles.sectionSubtitle}>
            Tone of Voice
          </Title>
          <Text>{capitalizeFirstLetter(toneOfVoice)}</Text>
        </div>

        <div className={styles.infoCard}>
          <Title level={5} className={styles.sectionSubtitle}>
            Marketing Tone
          </Title>
          <Text>{capitalizeFirstLetter(marketingTone)}</Text>
        </div>
      </div>
    </div>
  );
};
