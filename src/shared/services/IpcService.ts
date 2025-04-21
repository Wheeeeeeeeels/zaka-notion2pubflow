// 使用 window.electron 而不是直接导入 electron
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, func: (...args: any[]) => void) => void;
        removeListener: (channel: string, func: (...args: any[]) => void) => void;
      };
    };
  }
}

import { IpcRequest, IpcResponse, IpcChannel } from '../types/ipc';
import { NotionPage } from '../types/notion';
import { SyncState } from '../types/sync';

export class IpcService {
  /**
   * 发送 IPC 请求
   */
  static async send<T>(channel: IpcChannel, request?: IpcRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send(channel, request);
      
      window.electron.ipcRenderer.once(`${channel}-reply`, (_, response: IpcResponse) => {
        if (response.success) {
          resolve(response.data as T);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * 保存 Notion 配置
   */
  static async saveNotionConfig(config: any): Promise<void> {
    return this.send(IpcChannel.SAVE_NOTION_CONFIG, {
      type: 'save-notion-config',
      payload: config,
    });
  }

  /**
   * 获取 Notion 配置
   */
  static async getNotionConfig(): Promise<any> {
    return this.send(IpcChannel.GET_NOTION_CONFIG);
  }

  /**
   * 获取 Notion 页面列表
   */
  static async getNotionPages(): Promise<NotionPage[]> {
    return window.electron.ipcRenderer.invoke('notion:getPages');
  }

  /**
   * 获取 Notion 页面内容
   */
  static async getNotionPageContent(pageId: string): Promise<any> {
    return this.send(IpcChannel.GET_NOTION_PAGE_CONTENT, {
      type: 'get-notion-page-content',
      payload: { pageId },
    });
  }

  static async getSyncStatus(articleId: string): Promise<SyncState> {
    return window.electron.ipcRenderer.invoke('sync:getStatus', articleId);
  }

  static async syncArticle(articleId: string): Promise<void> {
    return window.electron.ipcRenderer.invoke('sync:syncArticle', articleId);
  }

  static async getConfig(): Promise<any> {
    return window.electron.ipcRenderer.invoke('config:get');
  }

  static async saveConfig(config: any): Promise<void> {
    return window.electron.ipcRenderer.invoke('config:save', config);
  }

  static async invoke<T>(channel: string, ...args: any[]): Promise<T> {
    return window.electron.ipcRenderer.invoke(channel, ...args);
  }

  static on(channel: string, callback: (...args: any[]) => void) {
    window.electron.ipcRenderer.on(channel, callback);
  }

  static removeListener(channel: string, callback: (...args: any[]) => void) {
    window.electron.ipcRenderer.removeListener(channel, callback);
  }
} 