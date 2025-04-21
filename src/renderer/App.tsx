import React, { useState, useEffect } from 'react';
import NotionConfig from './components/NotionConfig';
import ArticleList from './components/ArticleList';
import ArticlePreview from './components/ArticlePreview';
import { NotionConfig as NotionConfigType, NotionPage } from '../shared/types/notion';

export const App: React.FC = () => {
  const [notionConfig, setNotionConfig] = useState<NotionConfigType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NotionPage | null>(null);

  useEffect(() => {
    loadNotionConfig();
  }, []);

  const loadNotionConfig = async () => {
    try {
      const config = await window.electron.ipcRenderer.invoke('getNotionConfig');
      if (config) {
        setNotionConfig(config);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotionConfigChange = async (config: NotionConfigType) => {
    try {
      await window.electron.ipcRenderer.invoke('saveNotionConfig', config);
      setNotionConfig(config);
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  };

  const handleSelectArticle = (article: NotionPage) => {
    setSelectedArticle(article);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Notion2PublicFlow</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {!notionConfig ? (
              <NotionConfig onConfigChange={handleNotionConfigChange} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">文章列表</h2>
                  <ArticleList onSelectArticle={handleSelectArticle} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">文章预览</h2>
                  {selectedArticle ? (
                    <ArticlePreview article={selectedArticle} />
                  ) : (
                    <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                      请选择一篇文章进行预览
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}; 