import React, { useState } from 'react';
import { SyncConfig as SyncConfigType } from '../../shared/types/sync';

interface SyncConfigProps {
  onConfigChange: (config: SyncConfigType) => void;
}

const SyncConfig: React.FC<SyncConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<SyncConfigType>({
    autoSync: false,
    syncInterval: 60,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange(config);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">同步配置</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.autoSync}
            onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            启用自动同步
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            同步间隔（分钟）
          </label>
          <input
            type="number"
            min="1"
            value={config.syncInterval}
            onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) })}
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

export default SyncConfig; 