import { ipcMain, dialog, Notification } from 'electron';
import { ConfigService } from '../services/ConfigService';
import { NotionService } from '../services/NotionService';
import { SyncService } from '../services/SyncService';
import { WeChatService } from '../services/WeChatService';
import { Config } from '../../shared/types/config';

let notionService: NotionService | null = null;
let weChatService: WeChatService | null = null;
let syncService: SyncService | null = null;

export function setupIpcHandlers(
  configService: ConfigService,
  _notionService: NotionService | null,
  _weChatService: WeChatService | null,
  _syncService: SyncService | null
) {
  notionService = _notionService;
  weChatService = _weChatService;
  syncService = _syncService;

  // 配置相关
  ipcMain.handle('get-config', async () => {
    return configService.getConfig();
  });

  ipcMain.handle('show-notification', async (event, { title, body }) => {
    try {
      console.log('主进程 - 收到显示通知请求');
      console.log('参数:', { title, body });
      
      // 尝试使用系统通知
      try {
        const notification = new Notification({
          title: title,
          body: body,
          silent: false
        });
        
        notification.show();
      } catch (error) {
        console.warn('系统通知失败，使用对话框:', error);
        // 使用对话框作为备选
        await dialog.showMessageBox({
          type: 'info',
          title: title,
          message: body,
          buttons: ['确定']
        });
      }
      
      return true;
    } catch (error) {
      console.error('显示通知失败:', error);
      throw error;
    }
  });

  ipcMain.handle('save-config', async (event, config: any) => {
    try {
      console.log('收到配置保存请求:', JSON.stringify(config, null, 2));
      
      // 直接使用传入的配置对象
      const configToSave: Config = {
        notion: {
          apiKey: config.notion.apiKey,
          databaseId: config.notion.databaseId
        },
        wechat: {
          appId: config.wechat.appId,
          appSecret: config.wechat.appSecret
        },
        sync: config.sync || {
          autoSync: false,
          syncInterval: 30
        }
      };
      
      // 验证配置
      if (!configToSave.notion.apiKey || !configToSave.notion.databaseId) {
        throw new Error('Notion API Key 和数据库 ID 不能为空');
      }
      
      if (!configToSave.wechat.appId || !configToSave.wechat.appSecret) {
        throw new Error('微信 AppID 和 AppSecret 不能为空');
      }
      
      // 保存配置
      console.log('正在保存配置到文件...');
      await configService.saveConfig(configToSave);
      console.log('配置已保存到文件');
      
      // 重新初始化服务
      console.log('正在重新初始化服务...');
      notionService = new NotionService(configToSave.notion);
      weChatService = new WeChatService(configService);
      syncService = new SyncService(notionService, weChatService);
      console.log('服务重新初始化成功');
      
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  });

  // Notion 相关
  ipcMain.handle('get-notion-pages', async () => {
    if (!notionService) {
      throw new Error('Notion 服务未初始化，请先设置 API Key 和数据库 ID');
    }
    console.log('正在获取 Notion 文章列表...');
    const pages = await notionService.getArticles();
    console.log('获取到文章数量:', pages.length);
    return pages;
  });

  // 同步相关
  ipcMain.handle('sync-article', async (event, pageId: string) => {
    if (!syncService) {
      throw new Error('同步服务未初始化，请先设置 API Key 和数据库 ID');
    }
    return syncService.syncArticle(pageId);
  });

  ipcMain.handle('get-sync-status', async (event, articleId: string) => {
    if (!syncService) {
      return {
        articleId,
        status: 'pending',
        error: '同步服务未初始化，请先设置 API Key 和数据库 ID'
      };
    }
    return syncService.getSyncState(articleId);
  });
} 