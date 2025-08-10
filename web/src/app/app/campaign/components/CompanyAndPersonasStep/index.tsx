import React from "react";
import { Card, Typography, Tag, Tabs } from "antd";
import {
  GlobalOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";
import { capitalizeFirstLetter, capitalizeWords } from "@/utils/stringUtils";
import styles from "./styles.module.scss";

const { Title, Text } = Typography;

interface PersonaCardProps {
  title: string;
  description?: string;
  tags?: string[];
}

const PersonaCard: React.FC<PersonaCardProps> = ({
  title,
  description,
  tags,
}) => (
  <Card className={styles.personaCard}>
    <div className={styles.personaHeader}>
      <Title level={5} className={styles.personaName}>
        {title}
      </Title>
      {tags?.map((tag, i) => (
        <Tag key={i} color="purple" className={styles.roleTag}>
          {tag}
        </Tag>
      ))}
    </div>
    {description && <Text>{description}</Text>}
  </Card>
);

const CompanyAndPersonasStep: React.FC = () => {
  const { campaign } = useCampaignBuilder();
  console.log(campaign);
  const companyProfile = campaign?.companyProfile;

  if (!companyProfile) {
    return <div>No company profile found</div>;
  }

  // Extract marketing tone and brand positioning from the generated data
  const marketingTone =
    companyProfile.generatedMarketingTone?.summary || "Not specified";
  const brandPositioning =
    companyProfile.generatedOverallProfile?.brand_positioning ||
    "Not specified";
  const toneOfVoice =
    companyProfile.generatedOverallProfile?.tone_of_voice || "Not specified";

  // Safely access values and products with null checks
  const companyValues = companyProfile.generatedOverallProfile?.values || [];
  const companyProducts =
    companyProfile.generatedOverallProfile?.products || [];

  // Create sample personas based on the available data
  const personas: PersonaCardProps[] = [
    {
      title: "Primary Persona",
      description:
        companyProfile.generatedOverallProfile?.typical_customer_profile
          ?.lifestyle,
      tags: [
        companyProfile.generatedOverallProfile?.typical_customer_profile
          ?.age_range,
        companyProfile.generatedOverallProfile?.typical_customer_profile
          ?.income_level,
      ].filter(Boolean) as string[],
    },
    {
      title: "Secondary Persona",
      description: "Additional customer segment based on analysis",
      tags: ["Potential", "Segment"],
    },
  ];

  const items = [
    {
      key: "company",
      label: (
        <span>
          <InfoCircleOutlined />
          <span>Company Information</span>
        </span>
      ),
      children: (
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
      ),
    },
    {
      key: "personas",
      label: (
        <span>
          <TeamOutlined />
          <span>Target Personas</span>
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <div className={styles.personasGrid}>
            {personas.map((persona, index) => (
              <PersonaCard
                key={index}
                title={persona.title}
                description={persona.description}
                tags={persona.tags}
              />
            ))}
          </div>

          {companyProducts.length > 0 && (
            <div className={styles.productsSection}>
              <Title level={5} className={styles.sectionSubtitle}>
                Key Products/Services
              </Title>
              <div className={styles.productsGrid}>
                {companyProducts.map((product, i) => (
                  <div key={i} className={styles.productCard}>
                    {capitalizeFirstLetter(product)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.section}>
        <Tabs
          defaultActiveKey="company"
          items={items}
          className={styles.tabs}
          size="large"
        />
      </Card>
    </div>
  );
};

export default CompanyAndPersonasStep;
