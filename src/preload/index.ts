import { contextBridge, ipcRenderer } from 'electron';
import { SyncState } from '../shared/types/sync';

// 定义 API 类型
interface IElectronAPI {
  getConfig: () => Promise<{
    apiKey: string;
    databaseId: string;
  }>;
  saveConfig: (config: {
    apiKey: string;
    databaseId: string;
  }) => Promise<void>;
  getNotionPages: () => Promise<any[]>;
  syncArticle: (pageId: string) => Promise<void>;
  getSyncStatus: (articleId: string) => Promise<SyncState>;
  onSyncStateChanged: (callback: (state: SyncState) => void) => void;
}

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 配置相关
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  
  // Notion 相关
  getNotionPages: () => ipcRenderer.invoke('get-notion-pages'),
  
  // 同步相关
  syncArticle: (pageId) => ipcRenderer.invoke('sync-article', pageId),
  getSyncStatus: (articleId) => ipcRenderer.invoke('get-sync-status', articleId),
  onSyncStateChanged: (callback) => {
    ipcRenderer.on('syncStateChanged', (_, state) => callback(state));
  }
} as IElectronAPI); 