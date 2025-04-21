import { NotionService } from './NotionService';
import { WeChatService } from './WeChatService';
import { NotionPage, NotionBlock } from '../types/notion';
import { WeChatArticle } from '../types/wechat';
import { SyncState, SyncStatus } from '../types/sync';
import { PageObjectResponse, BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

interface RichText {
  plain_text: string;
}

export class SyncService {
  private notionService: NotionService;
  private weChatService: WeChatService;
  private syncStates: Map<string, SyncState> = new Map();

  constructor(notionService: NotionService, weChatService: WeChatService) {
    this.notionService = notionService;
    this.weChatService = weChatService;
  }

  /**
   * 同步文章
   */
  async syncArticle(articleId: string): Promise<SyncState> {
    try {
      this.updateSyncState(articleId, SyncStatus.SYNCING);

      // 获取 Notion 文章内容
      const page = await this.notionService.getPageProperties(articleId) as PageObjectResponse;
      const blocks = await this.notionService.getPageContent(articleId) as BlockObjectResponse[];

      // 转换文章格式
      const weChatArticle = this.convertToWeChatArticle({
        id: page.id,
        url: page.url,
        title: (page.properties.title as any)?.title?.[0]?.plain_text || '',
        lastEditedTime: page.last_edited_time,
        properties: page.properties
      }, blocks.map(block => ({
        id: block.id,
        type: block.type,
        has_children: block.has_children,
        content: {
          rich_text: (block as any)[block.type]?.rich_text,
          url: (block as any)[block.type]?.url,
          caption: (block as any)[block.type]?.caption
        }
      })));

      // 发布到微信公众号
      await this.weChatService.publishArticle(weChatArticle);

      return this.updateSyncState(articleId, SyncStatus.SUCCESS);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return this.updateSyncState(articleId, SyncStatus.FAILED, errorMessage);
    }
  }

  /**
   * 获取同步状态
   */
  getSyncState(articleId: string): SyncState {
    return this.syncStates.get(articleId) || {
      articleId,
      status: SyncStatus.PENDING,
    };
  }

  /**
   * 更新同步状态
   */
  private updateSyncState(
    articleId: string,
    status: SyncStatus,
    error?: string
  ): SyncState {
    const state: SyncState = {
      articleId,
      status,
      error,
      lastSyncTime: Date.now(),
    };

    this.syncStates.set(articleId, state);
    return state;
  }

  /**
   * 转换 Notion 文章为微信公众号文章格式
   */
  private convertToWeChatArticle(
    page: NotionPage,
    blocks: NotionBlock[]
  ): WeChatArticle {
    const content = blocks
      .map(block => this.convertBlockToHtml(block))
      .join('\n');

    return {
      title: page.title,
      content,
      author: page.properties.Author?.rich_text?.[0]?.plain_text,
      digest: page.properties.Digest?.rich_text?.[0]?.plain_text,
      showCoverPic: true,
      needOpenComment: true,
    };
  }

  /**
   * 转换 Notion 块为 HTML
   */
  private convertBlockToHtml(block: NotionBlock): string {
    switch (block.type) {
      case 'paragraph':
        return `<p>${block.content.rich_text?.map((text: RichText) => text.plain_text).join('') || ''}</p>`;
      case 'heading_1':
        return `<h1>${block.content.rich_text?.map((text: RichText) => text.plain_text).join('') || ''}</h1>`;
      case 'heading_2':
        return `<h2>${block.content.rich_text?.map((text: RichText) => text.plain_text).join('') || ''}</h2>`;
      case 'heading_3':
        return `<h3>${block.content.rich_text?.map((text: RichText) => text.plain_text).join('') || ''}</h3>`;
      case 'image':
        return `<img src="${block.content.url}" alt="${block.content.caption?.[0]?.plain_text || ''}" />`;
      default:
        return '';
    }
  }
} 