import { Client } from '@notionhq/client';
import { NotionConfig, NotionPage, NotionBlock } from '../../shared/types/notion';
import { PageObjectResponse, BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export class NotionService {
  private client: Client | null = null;

  constructor(private config: NotionConfig) {
    this.validateConfig(config);
    this.client = new Client({
      auth: config.apiKey,
    });
  }

  private validateConfig(config: NotionConfig) {
    if (!config.apiKey || !config.databaseId) {
      throw new Error('Notion 配置未完成，请先设置 API Key 和数据库 ID');
    }

    // 清理数据库 ID
    const cleanedDatabaseId = config.databaseId.trim();
    
    // 验证 UUID 格式（支持带连字符和不带连字符的格式）
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanedDatabaseId)) {
      throw new Error('数据库 ID 格式不正确，请检查并重新输入');
    }

    // 更新配置
    this.config.databaseId = cleanedDatabaseId;
  }

  async getArticles(): Promise<NotionPage[]> {
    try {
      console.log('开始获取 Notion 文章列表...');
      console.log('当前配置:', this.config);
      
      if (!this.client) {
        console.error('Notion 客户端未初始化');
        throw new Error('Notion 客户端未初始化');
      }

      console.log('正在查询数据库:', this.config.databaseId);
      const response = await this.client.databases.query({
        database_id: this.config.databaseId,
      });

      console.log('获取到文章数量:', response.results.length);
      const articles = response.results.map((pageResponse) => {
        const page = pageResponse as PageObjectResponse;
        
        // 查找标题属性
        const titleProperty = Object.entries(page.properties).find(
          ([_, prop]) => prop.type === 'title'
        );
        
        const title = titleProperty ? 
          (titleProperty[1] as { title: Array<{ plain_text: string }> }).title[0]?.plain_text || '未命名' :
          (page.properties as any).Name?.title?.[0]?.plain_text || '未命名';

        console.log('处理文章:', {
          id: page.id,
          title: title,
          properties: page.properties
        });

        return {
          id: page.id,
          url: page.url,
          title: title,
          properties: page.properties,
          lastEditedTime: page.last_edited_time,
        };
      });

      console.log('文章列表:', articles);
      return articles;
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw new Error('获取文章列表失败，请检查配置是否正确');
    }
  }

  async getPageProperties(pageId: string): Promise<NotionPage> {
    try {
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
    } catch (error) {
      console.error('获取页面属性失败:', error);
      throw new Error('获取页面属性失败，请检查页面 ID 是否正确');
    }
  }

  private convertProperties(properties: PageObjectResponse['properties']): NotionPage['properties'] {
    return Object.entries(properties).reduce((acc, [key, value]) => {
      acc[key] = {
        type: value.type,
        rich_text: value.type === 'rich_text' ? (value as any).rich_text : [],
        title: value.type === 'title' ? (value as any).title : [],
      };
      return acc;
    }, {} as NotionPage['properties']);
  }

  async getPageContent(pageId: string): Promise<NotionBlock[]> {
    try {
      const response = await this.client!.blocks.children.list({
        block_id: pageId,
      });

      return response.results.map((block) => {
        const blockObj = block as BlockObjectResponse;
        return {
          id: blockObj.id,
          type: blockObj.type,
          has_children: blockObj.has_children,
          content: this.extractBlockContent(blockObj),
        };
      });
    } catch (error) {
      console.error('获取页面内容失败:', error);
      throw new Error('获取页面内容失败，请检查页面 ID 是否正确');
    }
  }

  private extractBlockContent(block: BlockObjectResponse): NotionBlock['content'] {
    const content = (block as any)[block.type];
    return {
      rich_text: content?.rich_text,
      url: content?.url,
      caption: content?.caption,
    };
  }
} 