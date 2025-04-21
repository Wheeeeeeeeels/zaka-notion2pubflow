import React from 'react';
import { NotionPage } from '../../shared/types/notion';

interface ArticleListProps {
  onSelectArticle: (article: NotionPage) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ onSelectArticle }) => {
  const [articles, setArticles] = React.useState<NotionPage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await window.electron.ipcRenderer.invoke('getArticles');
        setArticles(result);
      } catch (err) {
        console.error('获取文章列表失败:', err);
        setError('获取文章列表失败，请检查配置是否正确');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <ul className="space-y-2">
        {articles.map(article => (
          <li
            key={article.id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer"
            onClick={() => onSelectArticle(article)}
          >
            <h3 className="text-lg font-semibold">{article.title}</h3>
            <p className="text-sm text-gray-500">
              最后编辑：{new Date(article.lastEditedTime).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleList; 