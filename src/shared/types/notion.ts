import { PageObjectResponse, BlockObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
}

export interface NotionPage {
  id: string;
  url: string;
  title: string;
  lastEditedTime: string;
  properties: Record<string, {
    type: string;
    rich_text?: RichTextItemResponse[];
    title?: RichTextItemResponse[];
  }>;
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  content: {
    rich_text?: Array<{
      plain_text: string;
    }>;
    url?: string;
    caption?: Array<{
      plain_text: string;
    }>;
  };
} 