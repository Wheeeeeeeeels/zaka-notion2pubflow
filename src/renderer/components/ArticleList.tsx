import React from 'react';
import { NotionPage } from '../../shared/types/notion';

interface ArticleListProps {
  articles: NotionPage[];
  loading: boolean;
  error: string | null;
  onSync: (pageId: string) => Promise<void>;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, loading, error, onSync }) => {
  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (articles.length === 0) {
    return <div>暂无文章</div>;
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article.id} className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold">{article.title}</h2>
          <p className="text-gray-600">{article.lastEditedTime}</p>
          <button
            onClick={() => onSync(article.id)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            同步到微信
          </button>
        </div>
      ))}
    </div>
  );
};

export default ArticleList; 