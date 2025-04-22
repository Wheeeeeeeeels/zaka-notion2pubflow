import React, { useState } from 'react';
import { NotionPage } from '../../shared/types/notion';
import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

interface ArticleEditorProps {
  article: NotionPage;
  onSave: (article: NotionPage) => void;
  onCancel: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel }) => {
  const [title, setTitle] = useState(article.title);
  const [author, setAuthor] = useState(article.properties.Author?.rich_text?.[0]?.plain_text || '');
  const [digest, setDigest] = useState(article.properties.Digest?.rich_text?.[0]?.plain_text || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...article,
      title,
      properties: {
        ...article.properties,
        Author: {
          type: 'rich_text',
          rich_text: [{
            type: 'text',
            text: { content: author, link: null },
            plain_text: author,
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default'
            },
            href: null
          }],
        },
        Digest: {
          type: 'rich_text',
          rich_text: [{
            type: 'text',
            text: { content: digest, link: null },
            plain_text: digest,
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default'
            },
            href: null
          }],
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">编辑文章</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            作者
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            摘要
          </label>
          <textarea
            value={digest}
            onChange={(e) => setDigest(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor; 