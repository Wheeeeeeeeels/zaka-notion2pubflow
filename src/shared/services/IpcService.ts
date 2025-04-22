import { IpcRequest, IpcResponse, IpcChannel } from '../types/ipc';
import { NotionPage } from '../types/notion';
import { SyncState } from '../types/sync';
import { Config } from '../types/config';
import { NotionConfig } from '../types/notion';

export class IpcService {
  /**
   * 发送 IPC 请求
   */
  static async send<T>(channel: IpcChannel, request?: IpcRequest): Promise<T> {
    return window.electron.ipcRenderer.invoke(channel, request);
  }

  /**
   * 保存应用配置
   * @param config 完整的配置对象
   * @returns 保存是否成功
   */
  static async saveConfig(config: Config): Promise<boolean> {
    try {
      console.log('IpcService.saveConfig - 开始保存配置');
      console.log('配置对象:', JSON.stringify(config, null, 2));
      
      // 验证配置
      if (!config?.notion?.apiKey || !config?.notion?.databaseId) {
        console.error('配置验证失败: API Key 或数据库 ID 为空');
        throw new Error('API Key 和数据库 ID 不能为空');
      }
      
      // 发送到主进程
      const result = await window.electron.ipcRenderer.invoke('save-config', config);
      console.log('配置保存结果:', result);
      return result;
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  }

  /**
   * 保存 Notion 配置
   */
  static async saveNotionConfig(config: NotionConfig): Promise<void> {
    return window.electron.ipcRenderer.invoke('save-notion-config', config);
  }

  /**
   * 获取 Notion 配置
   */
  static async getNotionConfig(): Promise<NotionConfig> {
    return window.electron.ipcRenderer.invoke('get-notion-config');
  }

  /**
   * 获取 Notion 页面列表
   */
  static async getNotionPages(): Promise<NotionPage[]> {
    return window.electron.ipcRenderer.invoke('get-notion-pages');
  }

  /**
   * 获取 Notion 页面内容
   */
  static async getNotionPageContent(pageId: string): Promise<any> {
    return window.electron.ipcRenderer.invoke('get-notion-page-content', pageId);
  }

  /**
   * 获取同步状态
   */
  static async getSyncStatus(articleId: string): Promise<SyncState> {
    return window.electron.getSyncStatus(articleId);
  }

  /**
   * 同步文章
   */
  static async syncArticle(articleId: string): Promise<void> {
    return window.electron.syncArticle(articleId);
  }

  /**
   * 获取配置
   */
  static async getConfig(): Promise<Config> {
    return window.electron.getConfig();
  }

  static on(channel: string, callback: (...args: any[]) => void) {
    window.electron.ipcRenderer.on(channel, callback);
  }

  static removeListener(channel: string, callback: (...args: any[]) => void) {
    window.electron.ipcRenderer.removeListener(channel, callback);
  }

  static async showNotification(title: string, body: string): Promise<void> {
    try {
      console.log('IpcService.showNotification - 开始发送通知');
      console.log('参数:', { title, body });
      
      if (!window.electron) {
        console.error('window.electron 未定义');
        throw new Error('Electron API 未初始化');
      }
      
      if (!window.electron.ipcRenderer) {
        console.error('window.electron.ipcRenderer 未定义');
        throw new Error('IPC Renderer 未初始化');
      }
      
      // 尝试使用系统通知
      if ('Notification' in window) {
        console.log('浏览器支持 Notification API');
        try {
          if (Notification.permission === 'granted') {
            console.log('通知权限已授予');
            new Notification(title, { body });
          } else if (Notification.permission !== 'denied') {
            console.log('请求通知权限...');
            const permission = await Notification.requestPermission();
            console.log('通知权限结果:', permission);
            if (permission === 'granted') {
              new Notification(title, { body });
            }
          } else {
            console.log('通知权限被拒绝');
          }
        } catch (error) {
          console.error('浏览器通知失败:', error);
        }
      } else {
        console.log('浏览器不支持 Notification API');
      }
      
      // 同时发送到主进程
      console.log('正在调用 show-notification...');
      const result = await window.electron.ipcRenderer.invoke('show-notification', { title, body });
      console.log('通知发送结果:', result);
      return result;
    } catch (error) {
      console.error('发送通知失败:', error);
      throw error;
    }
  }
} 