import { Config } from '../../shared/types/config';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
        on(channel: string, func: (...args: any[]) => void): void;
        removeListener(channel: string, func: (...args: any[]) => void): void;
      };
      getConfig(): Promise<Config>;
      saveConfig(config: Config): Promise<void>;
      getNotionPages(): Promise<any[]>;
      syncArticle(pageId: string): Promise<void>;
      getSyncStatus(articleId: string): Promise<any>;
      onSyncStateChanged(callback: (state: any) => void): () => void;
      showNotification(title: string, body: string): Promise<void>;
    }
  }
}

export {}; 