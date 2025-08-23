import React from "react";
import { Form, Input, Button, Upload, Radio, message, Typography } from "antd";
import { PlusCircleOutlined, RocketOutlined } from "@ant-design/icons";
import styles from "../../styles.module.scss";
import {
  useCampaignBuilder,
  useStepState,
} from "../../../CampaignBuilder/CampaignBuilderContext";
import { CampaignStepStateKey } from "@/types/campaignStepState";

const { Text } = Typography;

interface TemplateGeneratorProps {
  onTemplateGenerated: (template: string) => void;
}

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({
  onTemplateGenerated,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [generator, setGenerator] = useStepState(
    CampaignStepStateKey.Generator
  );
  const { setCanGoNext } = useCampaignBuilder();

  React.useEffect(() => {
    if (generator) {
      form.setFieldsValue({
        objective: generator.objective,
        tone: generator.tone,
        businessResults: generator.businessResults,
        keyMessages: generator.keyMessages,
        cta: generator.cta,
        // photo not prefilled (Upload shows custom UI); hook up when you store a file id
      });
      setCanGoNext(true);
    }
  }, [generator, form, setCanGoNext]);

  const onFinish = async (values: any) => {
    try {
      // 1) save into stepState so backend can read it later
      setGenerator(
        {
          objective: values.objective,
          tone: values.tone,
          businessResults: values.businessResults,
          keyMessages: values.keyMessages,
          cta: values.cta,
          // If you later upload a photo to the backend, store its fileId here:
          // photoFileId: values.photo?.[0]?.response?.id,
        },
        true
      );

      // 2) keep local preview UX as-is
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2 style="margin:0 0 12px 0">Campaign draft</h2>
          <p style="margin:0 0 6px 0"><strong>Objective:</strong> ${
            values.objective
          }</p>
          <p style="margin:0 0 12px 0"><strong>Tone:</strong> ${values.tone}</p>
          <p style="margin:0 0 12px 0"><strong>Target business results:</strong><br/>${
            values.businessResults
          }</p>
          <p style="margin:0 0 20px 0"><strong>Key messages:</strong><br/>${values.keyMessages.replace(
            /\n/g,
            "<br/>"
          )}</p>
          ${
            values.cta
              ? `<div style="text-align:center;margin:24px 0">
                  <a href="#" style="display:inline-block;padding:12px 20px;border-radius:6px;background:#6759ff;color:#fff;text-decoration:none;font-weight:600">${values.cta}</a>
                </div>`
              : ""
          }
          <p style="color:#8c8c8c;font-size:12px;margin-top:24px">This is a quick preview generated from your answers.</p>
        </div>
      `;
      onTemplateGenerated(html);

      // 3) allow Next
      setCanGoNext(true);
      messageApi.success("Saved. Moving to preview…");
    } catch {
      messageApi.error("Something went wrong");
    }
  };

  const photoList = Form.useWatch("photo", form);

  return (
    <div className={styles.templateGenerator}>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          objective: generator?.objective ?? "Sales generation",
          tone: generator?.tone ?? "Professional",
          businessResults: generator?.businessResults,
          keyMessages: generator?.keyMessages,
          cta: generator?.cta,
        }}
      >
        {/* … the rest of your form stays the same … */}
        {/* (unchanged markup below) */}
        <div className={styles.formSection}>
          <Text strong style={{ display: "block", marginBottom: 16 }}>
            Let’s create a template for the campaign
          </Text>

          <div className={styles.twoCol}>
            <Form.Item
              name="objective"
              className={styles.fullWidth}
              label={
                <div>
                  <div>What is the objective of the campaign?*</div>
                  <div className={styles.fieldHint}>
                    We recommend only one objective to ensure the communication
                    is effective
                  </div>
                </div>
              }
              rules={[
                { required: true, message: "Please choose one objective" },
              ]}
            >
              <Radio.Group className={styles.radioBox}>
                <Radio value="Sales generation">Sales generation</Radio>
                <Radio value="Lead nurturing">Lead nuturing</Radio>
                <Radio value="Client retention">Client retention</Radio>
                <Radio value="Brand awareness">Brand awareness</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="tone"
              className={styles.fullWidth}
              label="What is campaign tone?*"
              rules={[{ required: true, message: "Please choose a tone" }]}
            >
              <Radio.Group className={styles.radioBox}>
                <Radio value="Professional">Professional</Radio>
                <Radio value="Friendly">Friendly</Radio>
                <Radio value="Playful">Playful</Radio>
                <Radio value="Empathetic">Empathetic</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <Form.Item
            name="businessResults"
            label="What business results do you want to see?*:"
            rules={[
              {
                required: true,
                message: "Please enter target business results",
              },
            ]}
          >
            <Input placeholder="Enter target business results here" />
          </Form.Item>

          <Form.Item
            name="keyMessages"
            label="What are key messages?*"
            rules={[{ required: true, message: "Please enter key messages" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter key messages in bullet points here"
            />
          </Form.Item>

          <Form.Item
            name="photo"
            label="Campaign photo:"
            valuePropName="fileList"
            getValueFromEvent={(e) =>
              (Array.isArray(e) ? e : e?.fileList)?.slice(0, 1) || []
            }
          >
            <Upload
              accept="image/*"
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isImage) messageApi.error("Please upload an image file");
                if (!isLt5M) messageApi.error("Image must be smaller than 5MB");
                return false; // prevent auto-upload for now
              }}
              maxCount={1}
              showUploadList={false}
            >
              <div className={styles.uploadInputBox}>
                <span>{photoList?.[0]?.name || "Upload image here"}</span>
                <PlusCircleOutlined className={styles.uploadPlus} />
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="cta"
            label="What is the Call To Action (CTA)?*?"
            rules={[{ required: true, message: "Please enter a CTA" }]}
          >
            <Input placeholder="Enter CTA here" />
          </Form.Item>

          <div className={styles.formFooter}>
            <span className={styles.mandatoryNote}>*: mandatory</span>
            <Button
              type="primary"
              htmlType="submit"
              icon={<RocketOutlined />}
              className={styles.nextButton}
            >
              Next
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default TemplateGenerator;
