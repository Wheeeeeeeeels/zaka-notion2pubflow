import { Client } from '@notionhq/client';
import { NotionConfig, NotionPage, NotionBlock } from '../../shared/types/notion';
import { PageObjectResponse, BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export class NotionService {
  private client: Client | null = null;
  private config: NotionConfig;

  constructor(config: NotionConfig) {
    this.config = config;
    this.initClient();
  }

  private initClient() {
    try {
      if (!this.config.apiKey) {
        console.error('Notion API Key 未配置');
        return;
      }
      this.client = new Client({
        auth: this.config.apiKey
      });
      console.log('Notion 客户端初始化成功');
    } catch (error) {
      console.error('Notion 客户端初始化失败:', error);
      this.client = null;
    }
  }

  async getArticles(): Promise<NotionPage[]> {
    try {
      console.log('开始获取 Notion 文章列表...');
      
      // 验证客户端和配置
      if (!this.client) {
        throw new Error('Notion 客户端未初始化，请检查 API Key');
      }
      if (!this.config.databaseId) {
        throw new Error('数据库 ID 未配置');
      }

      console.log('使用数据库 ID:', this.config.databaseId);
      
      // 尝试查询数据库
      try {
        const response = await this.client.databases.query({
          database_id: this.config.databaseId,
          sorts: [
            {
              timestamp: 'last_edited_time',
              direction: 'descending'
            }
          ]
        });

        console.log('成功获取数据库响应，文章数量:', response.results.length);

        const articles = response.results.map((page: PageObjectResponse) => {
          // 查找标题属性
          const titleProperty = Object.entries(page.properties).find(
            ([_, prop]) => prop.type === 'title'
          );

          let title = '未命名';
          if (titleProperty) {
            const titleValue = titleProperty[1] as { title: Array<{ plain_text: string }> };
            title = titleValue.title[0]?.plain_text || '未命名';
          }

          // 获取发布状态和时间
          const properties = page.properties as any;
          const publishStatus = properties.PublishStatus?.select?.name || 'unpublished';
          const publishTime = properties.PublishTime?.date?.start;

          console.log('处理文章:', {
            id: page.id,
            title,
            publishStatus,
            publishTime
          });

          return {
            id: page.id,
            url: page.url,
            title,
            properties: page.properties,
            lastEditedTime: page.last_edited_time,
            publishStatus,
            publishTime
          };
        });

        return articles;
      } catch (error: any) {
        // 处理特定的 Notion API 错误
        if (error.code === 'object_not_found') {
          throw new Error('找不到指定的数据库，请检查数据库 ID 是否正确');
        } else if (error.code === 'unauthorized') {
          throw new Error('无权访问该数据库，请检查 API Key 权限');
        } else if (error.status === 400) {
          throw new Error('数据库 ID 格式不正确');
        }
        throw error;
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw error;
    }
  }

  async getPageProperties(pageId: string): Promise<NotionPage> {
    try {
      if (!this.client) {
        throw new Error('Notion 客户端未初始化');
      }

      const response = await this.client.pages.retrieve({ page_id: pageId });
      const page = response as PageObjectResponse;

      // 查找标题属性
      const titleProperty = Object.entries(page.properties).find(
        ([_, prop]) => prop.type === 'title'
      );

      const title = titleProperty
        ? (titleProperty[1] as { title: Array<{ plain_text: string }> }).title[0]?.plain_text
        : '未命名';

      return {
        id: page.id,
        url: page.url,
        title,
        properties: page.properties,
        lastEditedTime: page.last_edited_time
      };
    } catch (error: any) {
      if (error.code === 'object_not_found') {
        throw new Error('找不到指定的页面');
      }
      throw error;
    }
  }

  async getPageContent(pageId: string): Promise<NotionBlock[]> {
    try {
      if (!this.client) {
        throw new Error('Notion 客户端未初始化');
      }

      const response = await this.client.blocks.children.list({
        block_id: pageId
      });

      return response.results.map((block: BlockObjectResponse) => ({
        id: block.id,
        type: block.type,
        has_children: block.has_children,
        content: {
          rich_text: (block as any)[block.type]?.rich_text || [],
          url: (block as any)[block.type]?.url,
          caption: (block as any)[block.type]?.caption
        }
      }));
    } catch (error: any) {
      if (error.code === 'object_not_found') {
        throw new Error('找不到指定的页面内容');
      }
      throw error;
    }
  }

  async updatePageProperties(pageId: string, properties: any): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('Notion 客户端未初始化');
      }

      await this.client.pages.update({
        page_id: pageId,
        properties
      });
    } catch (error: any) {
      if (error.code === 'object_not_found') {
        throw new Error('找不到指定的页面');
      } else if (error.code === 'validation_error') {
        throw new Error('属性更新格式不正确');
      }
      throw error;
    }
  }
} 