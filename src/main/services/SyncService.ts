import { NotionService } from './NotionService';
import { WeChatService } from './WeChatService';
import { NotionPage, NotionBlock } from '../../shared/types/notion';
import { WeChatArticle } from '../../shared/types/wechat';
import { SyncState, SyncStatus } from '../../shared/types/sync';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

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

  async syncArticle(articleId: string): Promise<SyncState> {
    try {
      console.log('开始同步文章:', articleId);
      this.updateSyncState(articleId, SyncStatus.SYNCING);

      // 获取 Notion 文章内容
      console.log('正在获取文章属性...');
      const page = await this.notionService.getPageProperties(articleId);
      console.log('文章属性:', page);

      console.log('正在获取文章内容...');
      const blocks = await this.notionService.getPageContent(articleId);
      console.log('文章内容块数量:', blocks.length);

      // 转换文章格式
      console.log('正在转换文章格式...');
      const weChatArticle = this.convertToWeChatArticle(page, blocks);
      console.log('转换后的文章:', weChatArticle);

      // 发布到微信公众号
      console.log('正在发布到微信公众号...');
      await this.weChatService.publishArticle(weChatArticle);
      console.log('文章发布成功');

      return this.updateSyncState(articleId, SyncStatus.SUCCESS);
    } catch (error) {
      console.error('同步文章失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return this.updateSyncState(articleId, SyncStatus.FAILED, errorMessage);
    }
  }

  getSyncState(articleId: string): SyncState {
    return this.syncStates.get(articleId) || {
      articleId,
      status: SyncStatus.PENDING,
    };
  }

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

  private convertToWeChatArticle(
    page: NotionPage,
    blocks: NotionBlock[]
  ): WeChatArticle {
    const content = blocks
      .map(block => this.convertBlockToHtml(block))
      .join('\n');

    const authorProperty = page.properties.Author;
    const digestProperty = page.properties.Digest;

    return {
      title: page.title,
      content,
      author: authorProperty?.rich_text?.[0]?.plain_text || '',
      digest: digestProperty?.rich_text?.[0]?.plain_text || '',
      showCoverPic: true,
      needOpenComment: true,
    };
  }

  private convertBlockToHtml(block: NotionBlock): string {
    const richText = block.content.rich_text || [];
    const textContent = richText.map(text => text.plain_text).join('');

    switch (block.type) {
      case 'paragraph':
        return `<p>${textContent}</p>`;
      case 'heading_1':
        return `<h1>${textContent}</h1>`;
      case 'heading_2':
        return `<h2>${textContent}</h2>`;
      case 'heading_3':
        return `<h3>${textContent}</h3>`;
      case 'image':
        return `<img src="${block.content.url}" alt="${block.content.caption?.[0]?.plain_text || ''}" />`;
      default:
        return '';
    }
  }
} 