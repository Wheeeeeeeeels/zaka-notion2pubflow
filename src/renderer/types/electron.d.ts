interface Window {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: any[]): Promise<any>;
      on(channel: string, func: (...args: any[]) => void): void;
      removeListener(channel: string, func: (...args: any[]) => void): void;
    };
    getConfig(): Promise<any>;
    saveConfig(config: { apiKey: string; databaseId: string }): Promise<boolean>;
    getNotionPages(): Promise<any>;
    syncArticle(pageId: string): Promise<any>;
    getSyncStatus(articleId: string): Promise<any>;
    onSyncStateChanged(callback: (state: any) => void): () => void;
  };
} 