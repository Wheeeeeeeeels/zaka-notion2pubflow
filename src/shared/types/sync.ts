export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface SyncState {
  articleId: string;
  status: SyncStatus;
  progress?: number;
  error?: string;
  lastSyncTime?: number;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // 分钟
  lastSyncTime?: number;
} 