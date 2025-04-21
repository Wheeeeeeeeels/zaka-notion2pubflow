import React from 'react';
import { NotionPage, NotionBlock } from '../../shared/types/notion';

interface ArticlePreviewProps {
  article: NotionPage;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  const [blocks, setBlocks] = React.useState<NotionBlock[]>([]);

  React.useEffect(() => {
    window.electron.ipcRenderer
      .invoke('getPageContent', article.id)
      .then((result: NotionBlock[]) => {
        setBlocks(result);
      });
  }, [article.id]);

  const renderBlock = (block: NotionBlock) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p className="mb-4">
            {block.content.rich_text?.map((text, index) => (
              <span key={index}>{text.plain_text}</span>
            )) || ''}
          </p>
        );
      case 'heading_1':
        return (
          <h1 className="text-2xl font-bold mb-4">
            {block.content.rich_text?.map((text, index) => (
              <span key={index}>{text.plain_text}</span>
            )) || ''}
          </h1>
        );
      case 'heading_2':
        return (
          <h2 className="text-xl font-bold mb-3">
            {block.content.rich_text?.map((text, index) => (
              <span key={index}>{text.plain_text}</span>
            )) || ''}
          </h2>
        );
      case 'heading_3':
        return (
          <h3 className="text-lg font-bold mb-2">
            {block.content.rich_text?.map((text, index) => (
              <span key={index}>{text.plain_text}</span>
            )) || ''}
          </h3>
        );
      case 'image':
        return (
          <div className="mb-4">
            <img
              src={block.content.url}
              alt={block.content.caption?.[0]?.plain_text || ''}
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <div className="prose max-w-none">
        {blocks.map((block) => (
          <div key={block.id}>{renderBlock(block)}</div>
        ))}
      </div>
    </div>
  );
};

export default ArticlePreview; 