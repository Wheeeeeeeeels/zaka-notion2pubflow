import React, { useState } from 'react';
import { NotionConfig as NotionConfigType } from '../../shared/types/notion';

interface NotionConfigProps {
  onConfigChange: (config: NotionConfigType) => void;
}

const NotionConfig: React.FC<NotionConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<NotionConfigType>({
    apiKey: '',
    databaseId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange(config);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Notion 配置</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="text"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Database ID
          </label>
          <input
            type="text"
            value={config.databaseId}
            onChange={(e) => setConfig({ ...config, databaseId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          保存配置
        </button>
      </form>
    </div>
  );
};

export default NotionConfig; 