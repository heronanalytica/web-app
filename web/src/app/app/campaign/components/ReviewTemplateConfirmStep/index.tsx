"use client";

import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Typography,
  Spin,
} from "antd";
import styles from "./styles.module.scss";
import {
  useCampaignBuilder,
  useStepState,
} from "../CampaignBuilder/CampaignBuilderContext";
import { CampaignStepStateKey } from "@/types/campaignStepState";
import { fetcher } from "@/lib/fetcher";

const { Text } = Typography;

const ReviewConfirmStep: React.FC = () => {
  const [form] = Form.useForm();
  const { campaign, setCanGoNext } = useCampaignBuilder();
  const [template, setTemplate] = useStepState(
    CampaignStepStateKey.CommonTemplate
  );
  const [loading, setLoading] = React.useState(false);
  const [regenLoading, setRegenLoading] = React.useState(false);
  const [msg, ctx] = message.useMessage();
  const suppressChangeRef = React.useRef(false);

  // Load the latest stepState from server if commonTemplate is missing
  React.useEffect(() => {
    const load = async () => {
      if (!campaign?.id || template?.html) return;
      setLoading(true);
      try {
        const fresh = await fetcher.get(`/api/campaigns/${campaign.id}`);
        const serverTemplate = fresh?.stepState?.commonTemplate;
        if (serverTemplate?.html) {
          setTemplate(serverTemplate, true);
          suppressChangeRef.current = true;
          form.setFieldsValue({
            subject: serverTemplate.subject || "",
            preheader: serverTemplate.preheader || "",
            html: serverTemplate.html || "",
          });
          suppressChangeRef.current = false;
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id]);

  // Initialize form when local state exists
  React.useEffect(() => {
    if (!template) return;
    suppressChangeRef.current = true;
    form.setFieldsValue({
      subject: template.subject || "",
      preheader: template.preheader || "",
      html: template.html || "",
    });
    suppressChangeRef.current = false;
  }, [template, form]);

  // Gate "Next" button
  React.useEffect(() => {
    setCanGoNext(
      Boolean(template?.subject && template?.preheader && template?.html)
    );
  }, [template?.subject, template?.preheader, template?.html, setCanGoNext]);

  const pushToState = (patch: Partial<typeof template>) => {
    const next = {
      subject: patch?.subject ?? template?.subject ?? "",
      preheader: patch?.preheader ?? template?.preheader ?? "",
      html: patch?.html ?? template?.html ?? "",
    };
    setTemplate(next, true);
  };

  const onValuesChange = (_: any, values: any) => {
    if (suppressChangeRef.current) return;
    pushToState({
      subject: values.subject,
      preheader: values.preheader,
      html: values.html,
    });
  };

  const handleRegenerate = async () => {
    if (!campaign?.id) return;
    setRegenLoading(true);
    try {
      const res = await fetcher.post(
        `/api/campaigns/${campaign.id}/common-template`
      );
      const fresh = {
        subject: res?.subject ?? "Untitled",
        preheader: res?.preheader ?? template?.preheader ?? "",
        html: res?.html ?? "",
      };
      setTemplate(fresh, true);
      suppressChangeRef.current = true;
      form.setFieldsValue(fresh);
      suppressChangeRef.current = false;
      msg.success("Template regenerated");
    } catch (e: any) {
      msg.error(e?.message || "Failed to regenerate template");
    } finally {
      setRegenLoading(false);
    }
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(form.getFieldValue("html") || "");
      msg.success("HTML copied");
    } catch {
      msg.error("Cannot copy to clipboard");
    }
  };

  return (
    <div className={styles.container}>
      {ctx}
      <Card className={styles.card}>
        <div className={styles.header}>
          <Text strong>Template is ready.</Text>{" "}
          <Text type="secondary">
            After you review it, we’ll tailor it to each recipient in the next
            step.
          </Text>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <Spin />
          </div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.formCol}>
              <Form
                form={form}
                layout="vertical"
                onValuesChange={onValuesChange}
                initialValues={{
                  subject: template?.subject || "",
                  preheader: template?.preheader || "",
                  html: template?.html || "",
                }}
              >
                <Form.Item label="Summary" className={styles.dimItem}>
                  <Text type="secondary">
                    This template uses an engaging subject line and preheader to
                    boost opens, a concise value prop, light social proof, and a
                    clear call-to-action. You can still adjust your brand’s
                    tone, imagery, and offer details.
                  </Text>
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: "Subject is required" }]}
                >
                  <Input placeholder="Enter email subject" />
                </Form.Item>

                <Form.Item
                  name="preheader"
                  label="Pre-header"
                  tooltip="Preview text shown in inbox next to the subject (recommended 35–110 chars)"
                  rules={[
                    { required: true, message: "Preheader is required" },
                    {
                      max: 150,
                      message: "Keep preheader under 150 characters",
                    },
                    {
                      validator: (_, v) =>
                        /<[^>]+>/.test(v || "")
                          ? Promise.reject(
                              "Preheader must be plain text (no HTML)"
                            )
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <Input placeholder="Enter preheader (inbox preview text)" />
                </Form.Item>

                <Form.Item
                  name="html"
                  label="HTML code"
                  rules={[{ required: true, message: "HTML is required" }]}
                >
                  <Input.TextArea
                    rows={14}
                    placeholder="Paste or edit email HTML here"
                  />
                </Form.Item>

                <Space size="small">
                  <Button onClick={copyHtml}>Copy HTML</Button>
                  <Button onClick={handleRegenerate} loading={regenLoading}>
                    Regenerate
                  </Button>
                </Space>
              </Form>
            </div>

            <div className={styles.previewCol}>
              <div className={styles.previewHeader}>Preview</div>
              <div className={styles.previewBody}>
                {/* We purposely use dangerouslySetInnerHTML for a simple inline preview */}
                <div
                  className={styles.previewCanvas}
                  dangerouslySetInnerHTML={{
                    __html: form.getFieldValue("html") || "",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReviewConfirmStep;
