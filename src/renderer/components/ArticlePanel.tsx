import React, { useState } from 'react';
import { NotionPage } from '../../shared/types/notion';
import { SyncState, SyncStatus } from '../../shared/types/sync';
import { IpcService } from '../../shared/services/IpcService';
import ArticleList from './ArticleList';
import ArticleEditor from './ArticleEditor';
import ArticlePreview from './ArticlePreview';
import SyncButton from './SyncButton';
import SyncStatusComponent from './SyncStatus';

const ArticlePanel: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<NotionPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});

  const handleSelectArticle = (article: NotionPage) => {
    setSelectedArticle(article);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (article: NotionPage) => {
    try {
      await IpcService.saveConfig({
        notion: {
          apiKey: article.properties.APIKey?.rich_text?.[0]?.plain_text || '',
          databaseId: article.properties.DatabaseId?.rich_text?.[0]?.plain_text || '',
        },
        wechat: {
          appId: article.properties.AppId?.rich_text?.[0]?.plain_text || '',
          appSecret: article.properties.AppSecret?.rich_text?.[0]?.plain_text || '',
        },
        sync: {
          autoSync: article.properties.AutoSync?.rich_text?.[0]?.plain_text === 'true',
          syncInterval: parseInt(article.properties.SyncInterval?.rich_text?.[0]?.plain_text || '30'),
        },
      });
      setSelectedArticle(article);
      setIsEditing(false);
    } catch (error) {
      console.error('保存文章失败:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSync = async (articleId: string) => {
    try {
      const state = await IpcService.syncArticle(articleId);
      setSyncStates(prev => ({
        ...prev,
        [articleId]: {
          articleId,
          status: SyncStatus.SUCCESS,
          lastSyncTime: Date.now(),
        },
      }));
    } catch (error) {
      console.error('同步文章失败:', error);
      setSyncStates(prev => ({
        ...prev,
        [articleId]: {
          articleId,
          status: SyncStatus.FAILED,
          error: error instanceof Error ? error.message : '未知错误',
          lastSyncTime: Date.now(),
        },
      }));
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200">
        <ArticleList onSelectArticle={handleSelectArticle} />
      </div>
      <div className="w-2/3 p-4">
        {selectedArticle ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedArticle.title}</h2>
              <div className="flex space-x-2">
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
                  >
                    编辑
                  </button>
                )}
                <SyncButton
                  articleId={selectedArticle.id}
                  state={syncStates[selectedArticle.id] || { status: SyncStatus.PENDING }}
                  onSync={handleSync}
                />
              </div>
            </div>
            <SyncStatusComponent state={syncStates[selectedArticle.id] || { status: SyncStatus.PENDING }} />
            {isEditing ? (
              <ArticleEditor
                article={selectedArticle}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <ArticlePreview article={selectedArticle} />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            请选择一篇文章
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePanel; 