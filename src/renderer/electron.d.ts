import { NotionPage, NotionBlock, NotionConfig } from '../shared/types/notion';
import { SyncState } from '../shared/types/sync';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: 'getArticles'): Promise<NotionPage[]>;
        invoke(channel: 'getPageContent', pageId: string): Promise<NotionBlock[]>;
        invoke(channel: 'getSyncState', articleId: string): Promise<SyncState>;
        invoke(channel: 'syncArticle', articleId: string): Promise<void>;
        invoke(channel: 'getNotionConfig'): Promise<NotionConfig>;
        invoke(channel: 'saveNotionConfig', config: NotionConfig): Promise<void>;
        on(channel: 'syncStateChanged', callback: (state: SyncState) => void): () => void;
      };
    };
  }
} 