import { ipcMain } from 'electron';
import { ConfigService } from '../services/ConfigService';
import { NotionService } from '../services/NotionService';
import { SyncService } from '../services/SyncService';

export function setupIpcHandlers(
  configService: ConfigService,
  notionService: NotionService,
  syncService: SyncService
) {
  // 配置相关
  ipcMain.handle('get-config', async () => {
    return configService.getNotionConfig();
  });

  ipcMain.handle('save-config', async (event, config: { apiKey: string; databaseId: string }) => {
    return configService.saveNotionConfig(config);
  });

  // Notion 相关
  ipcMain.handle('get-notion-pages', async () => {
    return notionService.getPages();
  });

  // 同步相关
  ipcMain.handle('sync-article', async (event, pageId: string) => {
    return syncService.syncArticle(pageId);
  });

  ipcMain.handle('get-sync-status', async () => {
    return syncService.getStatus();
  });
} 