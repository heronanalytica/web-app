export interface Persona {
  code: string;
  name: string;
  demographics: Record<string, string>;
  bio: { Bio: string };
  psychographics: Record<string, string>;
  media_engagement_purchase_behavior: Record<string, string>;
  tags: string[];
  [key: string]: any;
}

