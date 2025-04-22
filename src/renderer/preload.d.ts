import { Config } from '../shared/types/config';

interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
    on(channel: string, func: (...args: any[]) => void): void;
    removeListener(channel: string, func: (...args: any[]) => void): void;
  };
  getConfig(): Promise<Config>;
  saveConfig(config: Config): Promise<boolean>;
  getNotionPages(): Promise<any[]>;
  syncArticle(pageId: string): Promise<any>;
  getSyncStatus(articleId: string): Promise<any>;
  onSyncStateChanged(callback: (state: any) => void): () => void;
  showNotification(title: string, body: string): Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 