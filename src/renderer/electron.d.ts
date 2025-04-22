import { NotionPage, NotionBlock, NotionConfig } from '../shared/types/notion';
import { SyncState } from '../shared/types/sync';
import { Config } from '../shared/types/config';

declare global {
  interface Window {
    electron: {
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
    };
  }
}

export {}; 