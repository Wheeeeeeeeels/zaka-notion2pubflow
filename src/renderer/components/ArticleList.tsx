import React from 'react';
import { NotionPage } from '../../shared/types/notion';
import { SyncState, SyncStatus } from '../../shared/types/sync';

interface ArticleListProps {
  articles: NotionPage[];
  loading: boolean;
  error: string | null;
  onSync: (pageId: string) => Promise<void>;
  syncStates: Record<string, SyncState>;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, loading, error, onSync, syncStates }) => {
  if (loading) {
    return <div className="text-gray-500">加载中...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (articles.length === 0) {
    return <div className="text-gray-500">暂无文章</div>;
  }

  const getPublishStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-500';
      case 'draft':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPublishStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      default:
        return '未发布';
    }
  };

  const getSyncStatusColor = (state?: SyncState) => {
    if (!state) return 'text-gray-500';
    switch (state.status) {
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

  const getSyncStatusText = (state?: SyncState) => {
    if (!state) return '未同步';
    switch (state.status) {
      case SyncStatus.SUCCESS:
        return '同步成功';
      case SyncStatus.FAILED:
        return `同步失败: ${state.error || '未知错误'}`;
      case SyncStatus.SYNCING:
        return '同步中...';
      default:
        return '未同步';
    }
  };

  return (
    <div className="space-y-4">
      {articles.map((article) => {
        const syncState = syncStates[article.id];
        const isPublished = article.publishStatus === 'published';
        
        return (
          <div key={article.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold">{article.title}</h2>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                最后编辑：{new Date(article.lastEditedTime).toLocaleString()}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${getPublishStatusColor(article.publishStatus)}`}>
                  {getPublishStatusText(article.publishStatus)}
                </span>
                {article.publishTime && (
                  <span className="text-sm text-gray-500">
                    发布时间：{new Date(article.publishTime).toLocaleString()}
                  </span>
                )}
              </div>
              <div className={`text-sm ${getSyncStatusColor(syncState)}`}>
                {getSyncStatusText(syncState)}
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => onSync(article.id)}
                disabled={isPublished || syncState?.status === SyncStatus.SYNCING}
                className={`px-4 py-2 rounded text-white ${
                  isPublished || syncState?.status === SyncStatus.SYNCING
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-700'
                }`}
              >
                {isPublished ? '已发布' : '同步到微信'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArticleList; 