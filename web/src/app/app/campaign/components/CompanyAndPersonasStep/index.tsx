import React from 'react';
import { Card, Tabs } from 'antd';
import { InfoCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useCampaignBuilder } from '../CampaignBuilder/CampaignBuilderContext';
import { CompanyInfo } from './components/CompanyInfo/CompanyInfo';
import { PersonasInfo } from './components/PersonasInfo/PersonasInfo';
import styles from './styles.module.scss';

interface Persona {
  title: string;
  description?: string;
  tags?: string[];
}

const CompanyAndPersonasStep: React.FC = () => {
  const { campaign } = useCampaignBuilder();
  const companyProfile = campaign?.companyProfile;

  if (!companyProfile) {
    return <div>No company profile found</div>;
  }

  // Create sample personas based on the available data
  const personas: Persona[] = [
    {
      title: 'Primary Persona',
      description: companyProfile.generatedOverallProfile?.typical_customer_profile?.lifestyle,
      tags: [
        companyProfile.generatedOverallProfile?.typical_customer_profile?.age_range,
        companyProfile.generatedOverallProfile?.typical_customer_profile?.income_level,
      ].filter(Boolean) as string[],
    },
    {
      title: 'Secondary Persona',
      description: 'Additional customer segment based on analysis',
      tags: ['Potential', 'Segment'],
    },
  ];

  const companyProducts = companyProfile.generatedOverallProfile?.products || [];

  const items = [
    {
      key: 'company',
      label: (
        <span>
          <InfoCircleOutlined />
          <span>Company Information</span>
        </span>
      ),
      children: <CompanyInfo companyProfile={companyProfile} />,
    },
    {
      key: 'personas',
      label: (
        <span>
          <TeamOutlined />
          <span>Target Personas</span>
        </span>
      ),
      children: <PersonasInfo personas={personas} companyProducts={companyProducts} />,
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
