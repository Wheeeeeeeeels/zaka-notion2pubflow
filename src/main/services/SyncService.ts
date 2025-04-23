import { NotionService } from './NotionService';
import { WeChatService } from './WeChatService';
import { NotionPage, NotionBlock } from '../../shared/types/notion';
import { WeChatArticle } from '../../shared/types/wechat';
import { SyncState, SyncStatus } from '../../shared/types/sync';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

interface RichText {
  plain_text: string;
}

export class SyncService {
  private notionService: NotionService;
  private weChatService: WeChatService;
  private syncStates: { [key: string]: SyncState } = {};
  private syncStateFile: string;

  constructor(notionService: NotionService, weChatService: WeChatService) {
    this.notionService = notionService;
    this.weChatService = weChatService;
    this.syncStateFile = path.join(app.getPath('userData'), 'sync-states.json');
    this.loadSyncStates();
  }

  // 加载同步状态
  private loadSyncStates() {
    try {
      if (fs.existsSync(this.syncStateFile)) {
        const data = fs.readFileSync(this.syncStateFile, 'utf8');
        this.syncStates = JSON.parse(data);
        console.log('已加载同步状态:', this.syncStates);
      }
    } catch (error) {
      console.error('加载同步状态失败:', error);
      this.syncStates = {};
    }
  }

  // 保存同步状态
  private saveSyncStates() {
    try {
      fs.writeFileSync(this.syncStateFile, JSON.stringify(this.syncStates, null, 2));
      console.log('已保存同步状态');
    } catch (error) {
      console.error('保存同步状态失败:', error);
    }
  }

  // 更新同步状态
  private updateSyncState(articleId: string, status: SyncStatus, error?: string): SyncState {
    const state: SyncState = {
      articleId,
      status,
      lastSyncTime: Date.now(),
      error
    };
    this.syncStates[articleId] = state;
    this.saveSyncStates();
    return state;
  }

  // 获取同步状态
  getSyncState(articleId: string): SyncState | undefined {
    return this.syncStates[articleId];
  }

  // 获取所有同步状态
  getAllSyncStates(): { [key: string]: SyncState } {
    return this.syncStates;
  }

  async syncArticle(articleId: string): Promise<SyncState> {
    try {
      console.log('开始同步文章:', articleId);
      this.updateSyncState(articleId, SyncStatus.SYNCING);

      // 验证服务是否初始化
      if (!this.notionService || !this.weChatService) {
        throw new Error('服务未初始化，请先保存正确的配置');
      }

      // 获取 Notion 文章内容
      console.log('正在获取文章属性...');
      let page;
      try {
        page = await this.notionService.getPageProperties(articleId);
        console.log('文章属性:', JSON.stringify(page, null, 2));
      } catch (error) {
        console.error('获取文章属性失败:', error);
        throw new Error('获取文章属性失败，请检查 Notion API Key 和数据库 ID 是否正确');
      }

      if (!page || !page.properties) {
        throw new Error('无法获取文章属性，请检查数据库 ID 是否正确');
      }

      // 检查文章发布状态并记录日志
      const publishStatus = page.properties.PublishStatus?.select?.name;
      if (publishStatus === 'published') {
        console.log('文章已发布，将进行重新发布');
      }

      // 获取文章内容
      console.log('正在获取文章内容...');
      let blocks;
      try {
        blocks = await this.notionService.getPageContent(articleId);
        console.log('文章内容块数量:', blocks.length);
      } catch (error) {
        console.error('获取文章内容失败:', error);
        throw new Error('获取文章内容失败，请检查文章权限设置');
      }

      if (!blocks || blocks.length === 0) {
        throw new Error('文章内容为空');
      }

      // 转换文章格式
      console.log('正在转换文章格式...');
      const weChatArticle = this.convertToWeChatArticle(page, blocks);
      console.log('转换后的文章:', JSON.stringify(weChatArticle, null, 2));

      if (!weChatArticle.title) {
        throw new Error('文章标题不能为空');
      }

      if (!weChatArticle.content) {
        throw new Error('文章内容不能为空');
      }

      // 发布到微信公众号
      console.log('正在发布到微信公众号...');
      try {
        await this.weChatService.publishArticle(weChatArticle);
        console.log('文章发布成功');
      } catch (error) {
        console.error('发布到微信失败:', error);
        throw new Error('发布到微信失败，请检查微信配置是否正确');
      }

      // 更新 Notion 中的发布状态
      try {
        await this.notionService.updatePageProperties(articleId, {
          PublishStatus: {
            select: {
              name: 'published'
            }
          },
          PublishTime: {
            date: {
              start: new Date().toISOString()
            }
          }
        });
      } catch (error) {
        console.error('更新 Notion 状态失败:', error);
        // 不抛出错误，因为文章已经发布成功
      }

      return this.updateSyncState(articleId, SyncStatus.SUCCESS);
    } catch (error) {
      console.error('同步文章失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return this.updateSyncState(articleId, SyncStatus.FAILED, errorMessage);
    }
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