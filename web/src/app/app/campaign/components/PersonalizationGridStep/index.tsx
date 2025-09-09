import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { throttle } from "lodash";
import {
  Button,
  Card,
  Empty,
  Input,
  List,
  Space,
  Typography,
  Tag,
  Skeleton,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useCampaignBuilder } from "../CampaignBuilder/CampaignBuilderContext";
import {
  useRenderedEmails,
  RenderedEmailItem,
} from "@/hooks/useRenderedEmails";
import styles from "./styles.module.scss";
import EmailPreviewFrame from "@/app/app/components/EmailPreviewFrame";
import PersonaDetails from "./PersonaDetails";

const { Text } = Typography;

const confidenceText = (n: number | null) =>
  (n ?? 0).toString().replace(/\.0+$/, "") + "% match";

const PersonaChip: React.FC<{ label?: string | null }> = ({ label }) =>
  label ? <Tag color="gold">{label}</Tag> : <Tag>Persona</Tag>;

const RecipientCardHeader: React.FC<{ item: RenderedEmailItem }> = ({
  item,
}) => {
  // Compute displayName from firstName and lastName if not provided
  const displayName =
    item.contact.displayName ||
    [item.contact.firstName, item.contact.lastName].filter(Boolean).join(" ") ||
    item.contact.email;

  return (
    <Space direction="vertical" size={2} style={{ width: "100%" }}>
      <Text strong style={{ fontSize: 16 }}>
        {displayName}
      </Text>
      <Text type="secondary">{item.contact.email}</Text>
      <div
        style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}
      >
        <PersonaChip
          label={item.personaDisplayName ?? item.personaCode ?? undefined}
        />
        {typeof item.personaConfidence === "number" && (
          <Text type="secondary">{confidenceText(item.personaConfidence)}</Text>
        )}
      </div>
    </Space>
  );
};

const PersonalizationGridStep: React.FC = () => {
  const { campaign } = useCampaignBuilder();
  const campaignId = campaign?.id;
  const { loading, items, total, q, setQ, refetch } =
    useRenderedEmails(campaignId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewingPersona, setViewingPersona] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState(q);
  const throttledRef = useRef(
    throttle((value: string) => {
      setQ(value);
      refetch();
    }, 500)
  );

  // Update the search query immediately for better UX
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      throttledRef.current(value);
    },
    []
  );

  // Clean up the throttle on unmount
  useEffect(() => {
    const throttled = throttledRef.current;
    return () => {
      throttled.cancel();
    };
  }, []);

  const activeItem = useMemo(
    () => items.find((x) => x.id === activeId) ?? items[0],
    [items, activeId]
  );

  const handleViewPersona = () => {
    setViewingPersona(true);
  };

  const handleClosePersona = () => {
    setViewingPersona(false);
  };

  return (
    <div className={styles.grid}>
      {/* LEFT: recipients */}
      <div className={styles.leftCol}>
        <div className={styles.leftHeader}>
          <div className={styles.leftTitle}>
            Recipients <span className={styles.badge}>{total}</span>
          </div>
          <Input
            allowClear
            size="middle"
            prefix={<SearchOutlined />}
            placeholder="Search customers…"
            value={searchQuery}
            onChange={handleSearchChange}
            onPressEnter={() => {
              setQ(searchQuery);
              refetch();
            }}
          />
        </div>

        <div className={styles.listWrap}>
          {loading ? (
            <div style={{ padding: 12 }}>
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : items.length === 0 ? (
            <Empty description="No rendered emails yet" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  className={
                    item.id === activeItem?.id ? styles.rowActive : styles.row
                  }
                  onClick={() => setActiveId(item.id)}
                >
                  <List.Item.Meta
                    title={
                      <div className={styles.rowTitle}>
                        <span className={styles.name}>
                          {item.contact.displayName}
                        </span>
                        <span className={styles.email}>
                          {item.contact.email}
                        </span>
                      </div>
                    }
                    description={
                      <div className={styles.rowDesc}>
                        <PersonaChip
                          label={
                            item.personaDisplayName ??
                            item.personaCode ??
                            undefined
                          }
                        />
                        {typeof item.personaConfidence === "number" && (
                          <span className={styles.match}>
                            {confidenceText(item.personaConfidence)}
                          </span>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      {/* RIGHT: preview */}
      <div className={styles.rightCol}>
        {loading && !activeItem ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : !activeItem ? (
          <Empty description="Select a recipient" />
        ) : (
          <>
            <Card className={styles.headerCard}>
              <div className={styles.headerRow}>
                <RecipientCardHeader item={activeItem} />
                <div>
                  <Button
                    onClick={handleViewPersona}
                    disabled={!activeItem?.personaCode}
                  >
                    View Full Persona
                  </Button>
                </div>
              </div>
            </Card>

            <Card className={styles.emailMetaCard}>
              <div className={styles.metaRow}>
                <div>
                  <Text type="secondary">From:</Text>&nbsp;
                  {activeItem.renderedEmail?.from || "—"}
                </div>
                <div>
                  <Text type="secondary">To:</Text>&nbsp;
                  {activeItem.renderedEmail?.to || activeItem.contact.email}
                </div>
              </div>
              <div className={styles.metaRow}>
                <div>
                  <Text type="secondary">Subject:</Text>&nbsp;
                  {activeItem.renderedEmail?.subject || "—"}
                </div>
                <div>
                  <Text type="secondary">Preheader:</Text>&nbsp;
                  {activeItem.renderedEmail?.preheader || "—"}
                </div>
              </div>
            </Card>

            <EmailPreviewFrame html={activeItem.renderedEmail?.html || null} />
          </>
        )}
      </div>

      <PersonaDetails
        visible={viewingPersona}
        onClose={handleClosePersona}
        personaCode={activeItem?.personaCode || null}
      />
    </div>
  );
};

export default PersonalizationGridStep;
