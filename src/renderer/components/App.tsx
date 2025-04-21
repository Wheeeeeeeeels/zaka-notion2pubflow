import React, { useState } from 'react';
import ArticleList from './ArticleList';
import ConfigPanel from './ConfigPanel';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'config'>('articles');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'articles'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  文章列表
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'config'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  配置
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'articles' ? (
          <ArticleList onSelectArticle={(article) => {
            // TODO: 处理文章选择
          }} />
        ) : (
          <ConfigPanel />
        )}
      </main>

      <footer className="bg-white shadow-sm mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Notion to WeChat Sync - 保持内容同步的最佳方式
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App; 