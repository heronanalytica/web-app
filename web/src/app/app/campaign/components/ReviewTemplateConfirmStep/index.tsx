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

type Snapshot = { subject: string; preheader: string; html: string };
const normalize = (v?: Partial<Snapshot> | null): Snapshot => ({
  subject: v?.subject ?? "",
  preheader: v?.preheader ?? "",
  html: v?.html ?? "",
});
const equalSnap = (a: Snapshot, b: Snapshot) =>
  a.subject === b.subject && a.preheader === b.preheader && a.html === b.html;

const ReviewConfirmStep: React.FC = () => {
  const [form] = Form.useForm();
  const { campaign, setCanGoNext } = useCampaignBuilder(); // <- bring in save
  const [template, setTemplate] = useStepState(
    CampaignStepStateKey.CommonTemplate
  );
  const [loading, setLoading] = React.useState(false);
  const [regenLoading, setRegenLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [msg, ctx] = message.useMessage();
  const suppressChangeRef = React.useRef(false);
  const baselineRef = React.useRef<Snapshot>(normalize(template));
  const subjectWatch = Form.useWatch("subject", form);
  const preheaderWatch = Form.useWatch("preheader", form);

  const snapshotFromForm = React.useCallback(
    (): Snapshot =>
      normalize({
        subject: form.getFieldValue("subject"),
        preheader: form.getFieldValue("preheader"),
        html: form.getFieldValue("html"),
      }),
    [form]
  );

  // Load the latest stepState from server if commonTemplate is missing
  React.useEffect(() => {
    const load = async () => {
      if (!campaign?.id || template?.html) return;
      setLoading(true);
      try {
        const fresh = await fetcher.get(`/api/campaigns/${campaign.id}`);
        const serverTemplate = normalize(fresh?.stepState?.commonTemplate);
        if (serverTemplate.html) {
          setTemplate(serverTemplate, true); // persist to store
          suppressChangeRef.current = true;
          form.setFieldsValue(serverTemplate);
          suppressChangeRef.current = false;
          baselineRef.current = serverTemplate; // set baseline
          setIsDirty(false);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id]);

  // Initialize/reflect local store to form (do NOT touch baseline/dirty here)
  React.useEffect(() => {
    if (!template) return;
    suppressChangeRef.current = true;
    form.setFieldsValue(normalize(template));
    suppressChangeRef.current = false;
  }, [template, form]);

  // Gate "Next" button
  React.useEffect(() => {
    const snap = normalize(template);
    setCanGoNext(Boolean(snap.subject && snap.preheader && snap.html));
  }, [setCanGoNext, template]);

  // Push local-only (no server) on change, and compute dirty vs baseline
  const onValuesChange = (_: any, values: any) => {
    if (suppressChangeRef.current) return;
    const next = normalize(values);
    setTemplate(next); // <- no "true" => do NOT persist server-side
    setIsDirty(!equalSnap(next, baselineRef.current));
  };

  const handleRegenerate = async () => {
    if (!campaign?.id) return;
    setRegenLoading(true);
    try {
      const res = await fetcher.post(
        `/api/campaigns/${campaign.id}/common-template`
      );
      const fresh = normalize({
        subject: res?.subject ?? "Untitled",
        preheader: res?.preheader ?? template?.preheader ?? "",
        html: res?.html ?? "",
      });
      setTemplate(fresh, true); // persist store + server
      suppressChangeRef.current = true;
      form.setFieldsValue(fresh);
      suppressChangeRef.current = false;
      baselineRef.current = fresh; // new baseline after regeneration
      setIsDirty(false);
      msg.success("Template regenerated");
    } catch (e: any) {
      msg.error(e?.message || "Failed to regenerate template");
    } finally {
      setRegenLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const current = snapshotFromForm();
      // update store then persist whole campaign stepState via builder.save()
      setTemplate(current, true);
      baselineRef.current = current; // move baseline forward
      setIsDirty(false);
      msg.success("Saved");
    } catch (e: any) {
      msg.error(e?.message || "Failed to save");
    } finally {
      setIsSaving(false);
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

        {regenLoading && <Spin fullscreen />}
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
                initialValues={normalize(template)}
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
                  <Button
                    type="primary"
                    onClick={handleSave}
                    disabled={!isDirty}
                    loading={isSaving}
                  >
                    Save
                  </Button>
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
                <div className={styles.emailHeader}>
                  <div className={styles.emailSubject}>
                    {subjectWatch?.trim() || "(No subject)"}
                  </div>
                  {Boolean(preheaderWatch?.trim()) && (
                    <div className={styles.emailPreheader}>
                      {preheaderWatch}
                    </div>
                  )}
                </div>

                {/* Render email HTML inside iframe */}
                <iframe
                  title="email-preview"
                  srcDoc={form.getFieldValue("html") || ""}
                  className={styles.previewCanvas}
                  sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
                  style={{
                    width: "100%",
                    minHeight: "600px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "white",
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
