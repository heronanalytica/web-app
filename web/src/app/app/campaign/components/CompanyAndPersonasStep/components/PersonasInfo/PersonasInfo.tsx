import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { capitalizeFirstLetter } from '@/utils/stringUtils';
import styles from '../../styles.module.scss';

const { Title } = Typography;

interface PersonaCardProps {
  title: string;
  description?: string;
  tags?: string[];
}

interface PersonasInfoProps {
  personas: PersonaCardProps[];
  companyProducts: string[];
}

const PersonaCard: React.FC<PersonaCardProps> = ({ title, description, tags }) => (
  <Card className={styles.personaCard}>
    <div className={styles.personaHeader}>
      <Title level={5} className={styles.personaName}>
        {title}
      </Title>
    </div>
    {description && <p className={styles.personaDescription}>{capitalizeFirstLetter(description)}</p>}
    {tags && tags.length > 0 && (
      <div className={styles.personaTags}>
        {tags.map((tag, i) => (
          <Tag key={i} color="blue">
            {tag}
          </Tag>
        ))}
      </div>
    )}
  </Card>
);

interface PersonasInfoProps {
  personas: Array<{
    title: string;
    description?: string;
    tags?: string[];
  }>;
  companyProducts: string[];
}

export const PersonasInfo: React.FC<PersonasInfoProps> = ({ personas, companyProducts }) => {
  return (
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
  );
};
