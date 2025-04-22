import React from 'react';
import { NotionPage } from '../../shared/types/notion';
import { SyncState, SyncStatus } from '../../shared/types/sync';

interface SyncControlProps {
  article: NotionPage;
}

export const SyncControl: React.FC<SyncControlProps> = ({ article }) => {
  const [syncState, setSyncState] = React.useState<SyncState>({
    articleId: article.id,
    status: SyncStatus.PENDING
  });

  React.useEffect(() => {
    // 获取同步状态
    window.electron.getSyncStatus(article.id).then((state: SyncState) => {
      setSyncState(state);
    });

    // 监听同步状态更新
    window.electron.onSyncStateChanged((state: SyncState) => {
      if (state.articleId === article.id) {
        setSyncState(state);
      }
    });
  }, [article.id]);

  const handleSync = async () => {
    try {
      await window.electron.syncArticle(article.id);
    } catch (error) {
      console.error('同步失败:', error);
    }
  };

  const getStatusText = () => {
    switch (syncState.status) {
      case SyncStatus.PENDING:
        return '待同步';
      case SyncStatus.SYNCING:
        return '同步中...';
      case SyncStatus.SUCCESS:
        return '同步成功';
      case SyncStatus.FAILED:
        return `同步失败: ${syncState.error || '未知错误'}`;
      default:
        return '未知状态';
    }
  };

  const getStatusClass = () => {
    switch (syncState.status) {
      case SyncStatus.SUCCESS:
        return 'text-green-500';
      case SyncStatus.FAILED:
        return 'text-red-500';
      case SyncStatus.SYNCING:
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span className={getStatusClass()}>{getStatusText()}</span>
      {syncState.lastSyncTime && (
        <span className="text-sm text-gray-500">
          {new Date(syncState.lastSyncTime).toLocaleString()}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={syncState.status === SyncStatus.SYNCING}
        className={`px-4 py-2 rounded ${
          syncState.status === SyncStatus.SYNCING
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-700 text-white'
        }`}
      >
        同步到微信
      </button>
    </div>
  );
}; 