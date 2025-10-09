import { useCallback } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Typography, Upload, message } from "antd";
import type { UploadProps } from "antd";
import styles from "../../styles.module.scss";
import {
  useCampaignBuilder,
  useStepState,
} from "../../../CampaignBuilder/CampaignBuilderContext";
import { CampaignStepStateKey } from "@/types/campaignStepState";

const { Text } = Typography;

interface UploadTemplateProps {
  loading?: boolean;
}

const UploadTemplate = ({ loading = false }: UploadTemplateProps) => {
  const [, setGenerator] = useStepState(CampaignStepStateKey.Generator);
  const { setCanGoNext } = useCampaignBuilder();
  const [messageApi] = message.useMessage();

  const handleFileRead = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }, []);

  const handleChange: UploadProps["onChange"] = async (info) => {
    const { file } = info;

    if (file.status === "uploading") {
      return;
    }

    if (file.status === "done") {
      try {
        const content = await handleFileRead(file.originFileObj as File);
        setGenerator({ uploadedHtml: content }, true);
        setCanGoNext(true);
        messageApi.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error("Error reading file:", error);
        messageApi.error("Failed to read file");
      }
    } else if (file.status === "error") {
      messageApi.error(`${file.name} upload failed`);
    }
  };

  const uploadProps: UploadProps = {
    name: "template",
    accept: ".html",
    showUploadList: false,
    multiple: false,
    beforeUpload: (file) => {
      const isHtml = file.type === "text/html" || file.name.endsWith(".html");
      if (!isHtml) {
        message.error("You can only upload HTML files!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: handleChange,
    disabled: loading,
  };

  return (
    <div className={styles.uploadTemplate}>
      <Upload.Dragger
        {...uploadProps}
        className={styles.uploadPlaceholder}
        disabled={loading}
      >
        <UploadOutlined style={{ fontSize: "32px", marginBottom: 16 }} />
        <br />
        <Text>
          {loading
            ? "Uploading..."
            : "Drag & drop your template file here or click to browse"}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
          Supported formats: .html
        </Text>
      </Upload.Dragger>
    </div>
  );
};

export default UploadTemplate;
