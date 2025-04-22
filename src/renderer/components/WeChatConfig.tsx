import React, { useState } from 'react';
import { WeChatConfig as WeChatConfigType } from '../../shared/types/wechat';

interface WeChatConfigProps {
  onConfigChange: (config: WeChatConfigType) => void;
}

const WeChatConfig: React.FC<WeChatConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<WeChatConfigType>({
    appId: '',
    appSecret: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange(config);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">微信公众号配置</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            AppID
          </label>
          <input
            type="text"
            value={config.appId}
            onChange={(e) => setConfig({ ...config, appId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            AppSecret
          </label>
          <input
            type="password"
            value={config.appSecret}
            onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
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

export default WeChatConfig; 