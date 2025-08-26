import React from "react";
import { Form, Input, Button, Upload, Radio, message, Typography } from "antd";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import styles from "../../styles.module.scss";
import {
  useCampaignBuilder,
  useStepState,
} from "../../../CampaignBuilder/CampaignBuilderContext";
import {
  CampaignStepStateKey,
  GeneratorBriefDto,
} from "@/types/campaignStepState";
import { useS3Upload, FILE_TYPES } from "@/hooks/useS3Upload";
import ImagePreviewButton from "./ImagePreviewButton";
import { BASE_URL } from "@/lib/fetcher";

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
      });
      setCanGoNext(true);
    }
  }, [generator, form, setCanGoNext]);

  // Helper: ensure we always pass a full GeneratorBriefDto to setGenerator
  const asFullGenerator = (
    patch: Partial<GeneratorBriefDto>
  ): GeneratorBriefDto => ({
    // required fields with sensible defaults matching your initialValues
    objective: generator?.objective ?? "Sales generation",
    tone: generator?.tone ?? "Professional",
    // optional fields – keep previous if any
    businessResults: generator?.businessResults ?? "",
    keyMessages: generator?.keyMessages ?? "",
    cta: generator?.cta ?? "",
    photoFileId: generator?.photoFileId,
    // apply patch last
    ...patch,
  });

  // Photo upload via shared hook — only persist photoId
  const { uploading, beforeUpload, customRequest, deleteById } = useS3Upload({
    fileType: FILE_TYPES.CAMPAIGN_PHOTO,
    maxSizeMB: 5,
    acceptMimes: ["image/"], // any image/*
    onAfterRegister: (reg) => {
      setGenerator(asFullGenerator({ photoFileId: reg.id }), true);
      messageApi.success("Photo uploaded");
    },
    onError: (e) => messageApi.error(e.message),
    extraUploadBody: { isPublic: true },
  });

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = generator?.photoFileId;
    try {
      if (id) await deleteById(id);
    } finally {
      setGenerator(asFullGenerator({ photoFileId: undefined }), true);
      messageApi.success("Photo removed");
    }
  };

  const onFinish = async (values: any) => {
    try {
      // 1) save into stepState so backend can read it later
      setGenerator(
        asFullGenerator({
          objective: values.objective,
          tone: values.tone,
          businessResults: values.businessResults,
          keyMessages: values.keyMessages,
          cta: values.cta,
        }),
        true
      );

      // 2) keep local preview UX as-is
      const imgSrc = generator?.photoFileId
        ? new URL(
            `${BASE_URL}/api/file/download/${encodeURIComponent(
              generator.photoFileId
            )}`
          )
        : null;

      const photoHtml = imgSrc
        ? `
          <div style="margin:16px 0; text-align:center;">
            <img
              src="${imgSrc}"
              alt="Campaign photo"
              style="max-width:100%;height:auto;border-radius:8px;display:inline-block"
            />
          </div>
        `
        : "";

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
          <p style="margin:0 0 12px 0"><strong>Campaign Image:</strong></p>
          ${photoHtml}
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
          <p style="margin:0 0 12px 0"><strong>Call to action:</strong></p>
          ${
            values.cta
              ? `<div style="margin:24px 0">
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

          {/* Campaign photo via shared S3 uploader — only photoId in step state */}
          <Form.Item label="Campaign photo:">
            <Upload
              accept="image/*"
              beforeUpload={beforeUpload}
              customRequest={customRequest}
              maxCount={1}
              showUploadList={false}
              disabled={uploading}
            >
              <div className={styles.uploadInputBox}>
                <span>
                  {generator?.photoFileId
                    ? "Image uploaded"
                    : "Upload image here"}
                </span>
                {generator?.photoFileId ? (
                  <span>
                    <Button
                      type="link"
                      size="small"
                      onClick={handleRemovePhoto}
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </span>
                ) : (
                  <PlusCircleOutlined className={styles.uploadPlus} />
                )}
              </div>
            </Upload>
            <ImagePreviewButton
              fileId={generator?.photoFileId}
              text="Preview"
              modalTitle="Campaign photo"
              // Optional: auto-open as soon as a new photo is uploaded
              // autoOpenOnChange
              buttonProps={{ type: "link", size: "small" }}
            />
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
