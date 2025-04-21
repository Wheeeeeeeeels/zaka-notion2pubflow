import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export class NotionService {
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({
      auth: apiKey,
    });
  }

  /**
   * 获取数据库中的所有页面
   * @param databaseId 数据库ID
   */
  async getPagesFromDatabase(databaseId: string) {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
      });
      return response.results as PageObjectResponse[];
    } catch (error) {
      console.error('获取 Notion 页面失败:', error);
      throw error;
    }
  }

  /**
   * 获取页面内容
   * @param pageId 页面ID
   */
  async getPageContent(pageId: string) {
    try {
      const response = await this.client.blocks.children.list({
        block_id: pageId,
      });
      return response.results;
    } catch (error) {
      console.error('获取页面内容失败:', error);
      throw error;
    }
  }

  /**
   * 获取页面属性
   * @param pageId 页面ID
   */
  async getPageProperties(pageId: string) {
    try {
      const response = await this.client.pages.retrieve({
        page_id: pageId,
      });
      return response;
    } catch (error) {
      console.error('获取页面属性失败:', error);
      throw error;
    }
  }
} 