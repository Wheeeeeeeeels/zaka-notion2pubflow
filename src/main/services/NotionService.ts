import { Client } from '@notionhq/client';
import { NotionPage, NotionBlock, NotionConfig } from '../../shared/types/notion';
import { PageObjectResponse, BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export class NotionService {
  private client: Client | null = null;
  private databaseId: string | null = null;

  constructor(config: NotionConfig) {
    if (config.apiKey && config.databaseId) {
      this.client = new Client({
        auth: config.apiKey,
      });
      this.databaseId = config.databaseId;
    }
  }

  private validateConfig() {
    if (!this.client || !this.databaseId) {
      throw new Error('Notion 配置未完成，请先设置 API Key 和数据库 ID');
    }
  }

  async getArticles(): Promise<NotionPage[]> {
    this.validateConfig();
    
    try {
      const response = await this.client!.databases.query({
        database_id: this.databaseId!,
      });

      return response.results.map((page) => {
        const pageObj = page as PageObjectResponse;
        const titleProperty = Object.values(pageObj.properties).find(
          (prop: any) => prop.type === 'title'
        ) as { title: Array<{ plain_text: string }> };

        return {
          id: pageObj.id,
          url: pageObj.url,
          title: titleProperty?.title?.[0]?.plain_text || '',
          lastEditedTime: pageObj.last_edited_time,
          properties: this.convertProperties(pageObj.properties),
        };
      });
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw new Error('获取文章列表失败，请检查配置是否正确');
    }
  }

  async getPageProperties(pageId: string): Promise<NotionPage> {
    const page = await this.client!.pages.retrieve({ page_id: pageId }) as PageObjectResponse;
    const titleProperty = Object.values(page.properties).find(
      (prop: any) => prop.type === 'title'
    ) as { title: Array<{ plain_text: string }> };

    return {
      id: page.id,
      url: page.url,
      title: titleProperty?.title?.[0]?.plain_text || '',
      lastEditedTime: page.last_edited_time,
      properties: this.convertProperties(page.properties),
    };
  }

  private convertProperties(properties: PageObjectResponse['properties']): NotionPage['properties'] {
    const result: NotionPage['properties'] = {};
    for (const [key, prop] of Object.entries(properties)) {
      result[key] = {
        type: prop.type,
        rich_text: prop.type === 'rich_text' ? prop.rich_text || [] : [],
        title: prop.type === 'title' ? prop.title || [] : [],
      };
    }
    return result;
  }

  async getPageContent(pageId: string): Promise<NotionBlock[]> {
    const response = await this.client!.blocks.children.list({
      block_id: pageId,
    });

    return Promise.all(
      response.results.map(async (block) => {
        const blockObj = block as BlockObjectResponse;
        const content = this.extractBlockContent(blockObj);
        
        const result: NotionBlock = {
          id: blockObj.id,
          type: blockObj.type,
          has_children: blockObj.has_children,
          content,
        };

        return result;
      })
    );
  }

  private extractBlockContent(block: BlockObjectResponse): NotionBlock['content'] {
    const type = block.type;
    const content = (block as any)[type];
    
    return {
      rich_text: content?.rich_text || [],
      url: content?.file?.url || content?.external?.url,
      caption: content?.caption,
    };
  }
} 