import React from "react";
import { Button, Typography, Input, Form, Card, Divider, Space } from "antd";
import { EditOutlined, ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import styles from "../../styles.module.scss";

const { Title, Text } = Typography;

interface TemplatePreviewProps {
  template: string;
  onRegenerate: () => void;
  onUseTemplate: () => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onRegenerate,
  onUseTemplate,
  templateName,
  onTemplateNameChange,
}) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [form] = Form.useForm();

  const handleSaveName = () => {
    const newName = form.getFieldValue('templateName');
    onTemplateNameChange(newName);
    setIsEditingName(false);
  };

  return (
    <div className={styles.templatePreviewContainer}>
      <div className={styles.previewHeader}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={onRegenerate}
          className={styles.backButton}
        >
          Back to Edit
        </Button>
        
        <div className={styles.templateNameContainer}>
          {isEditingName ? (
            <Form form={form} initialValues={{ templateName }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="templateName" noStyle>
                  <Input 
                    autoFocus 
                    onPressEnter={handleSaveName}
                    onBlur={handleSaveName}
                    className={styles.templateNameInput}
                  />
                </Form.Item>
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  onClick={handleSaveName}
                  className={styles.saveNameButton}
                />
              </Space.Compact>
            </Form>
          ) : (
            <div className={styles.templateNameWrapper} onClick={() => setIsEditingName(true)}>
              <Title level={4} className={styles.templateName}>
                {templateName || 'Untitled Template'}
              </Title>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                className={styles.editNameButton}
              />
            </div>
          )}
        </div>
      </div>

      <Card className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <Text strong>Preview</Text>
          <Button type="link" onClick={onRegenerate}>
            Edit
          </Button>
        </div>
        
        <Divider className={styles.previewDivider} />
        
        <div className={styles.templatePreview}>
          <div dangerouslySetInnerHTML={{ __html: template }} />
        </div>
      </Card>

      <div className={styles.previewActions}>
        <Button 
          type="primary" 
          onClick={onUseTemplate}
          className={styles.useTemplateButton}
        >
          Use This Template
        </Button>
        <Button 
          type="default" 
          onClick={onRegenerate}
          className={styles.generateAgainButton}
        >
          Generate Again
        </Button>
      </div>
    </div>
  );
};

export default TemplatePreview;
