import { contextBridge, ipcRenderer } from 'electron';

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
  getSyncStatus: () => Promise<{
    status: 'idle' | 'syncing' | 'error';
    message?: string;
  }>;
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
  getSyncStatus: () => ipcRenderer.invoke('get-sync-status'),
} as IElectronAPI); 