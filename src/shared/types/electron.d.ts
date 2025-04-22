import { SyncState } from './sync';

interface IElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
    on(channel: string, func: (...args: any[]) => void): void;
    removeListener(channel: string, func: (...args: any[]) => void): void;
  };
  getConfig(): Promise<{
    apiKey: string;
    databaseId: string;
  }>;
  saveConfig(config: {
    apiKey: string;
    databaseId: string;
  }): Promise<void>;
  getNotionPages(): Promise<any[]>;
  syncArticle(pageId: string): Promise<void>;
  getSyncStatus(articleId: string): Promise<SyncState>;
  onSyncStateChanged(callback: (state: SyncState) => void): void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
} 