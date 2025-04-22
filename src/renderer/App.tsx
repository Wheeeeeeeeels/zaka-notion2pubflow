import React, { useState, useEffect } from 'react';
import ConfigPanel from './components/ConfigPanel';
import ArticleList from './components/ArticleList';
import { NotionPage } from '../shared/types/notion';

export const App: React.FC = () => {
  const [articles, setArticles] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      return await window.electron.ipcRenderer.invoke('get-notion-pages');
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw error;
    }
  };

  const handleSync = async (pageId: string) => {
    try {
      setLoading(true);
      await window.electron.ipcRenderer.invoke('sync-article', pageId);
      // 重新加载文章列表
      const updatedArticles = await fetchArticles();
      setArticles(updatedArticles);
      setError(null);
    } catch (error) {
      console.error('同步文章失败:', error);
      setError('同步文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSaved = () => {
    console.log('配置已保存，重新加载文章列表');
    // 重新加载文章列表
    setLoading(true);
    fetchArticles()
      .then((articles) => {
        setArticles(articles);
        setError(null);
      })
      .catch((err) => {
        console.error('加载文章列表失败:', err);
        setError('加载文章列表失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 初始加载文章列表
  useEffect(() => {
    handleConfigSaved();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Notion 文章同步工具</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ConfigPanel onConfigSaved={handleConfigSaved} />
          </div>
          
          <div>
            <ArticleList
              articles={articles}
              loading={loading}
              error={error}
              onSync={handleSync}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 