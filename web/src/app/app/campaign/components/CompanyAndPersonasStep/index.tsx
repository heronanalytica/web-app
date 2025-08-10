import React from "react";
import { Card, Tabs } from "antd";
import { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";
import { CompanyInfo } from "./components/CompanyInfo/CompanyInfo";
import { PersonasInfo } from "./components/PersonasInfo/PersonasInfo";
import styles from "./styles.module.scss";

const CompanyAndPersonasStep: React.FC = () => {
  const { campaign } = useCampaignBuilder();
  const companyProfile = campaign?.companyProfile;

  if (!companyProfile) {
    return <div>No company profile found</div>;
  }

  const items = [
    {
      key: "company",
      label: (
        <span>
          <InfoCircleOutlined />
          <span>Company Information</span>
        </span>
      ),
      children: <CompanyInfo companyProfile={companyProfile} />,
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
        <PersonasInfo classifiedPersonaFile={campaign?.classifiedPersonaFile} />
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
