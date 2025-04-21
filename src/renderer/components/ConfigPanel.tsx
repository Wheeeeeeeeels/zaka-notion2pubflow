import React, { useState, useEffect } from 'react';
import { IpcService } from '../../shared/services/IpcService';
import { NotionConfig } from '../../shared/types/notion';
import { WeChatConfig } from '../../shared/types/wechat';
import { SyncConfig } from '../../shared/types/sync';

interface Config {
  notion: NotionConfig;
  wechat: WeChatConfig;
  sync: SyncConfig;
}

const ConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<Config>({
    notion: { apiKey: '', databaseId: '' },
    wechat: { appId: '', appSecret: '' },
    sync: { autoSync: false, syncInterval: 30 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const config = await IpcService.getConfig();
      setConfig(config);
      setError(null);
    } catch (err) {
      setError('加载配置失败');
      console.error('加载配置失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await IpcService.saveConfig(config);
      setError(null);
    } catch (err) {
      setError('保存配置失败');
      console.error('保存配置失败:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof Config, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Notion 配置</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              value={config.notion.apiKey}
              onChange={e => handleChange('notion', 'apiKey', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">数据库 ID</label>
            <input
              type="text"
              value={config.notion.databaseId}
              onChange={e => handleChange('notion', 'databaseId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">微信公众号配置</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">AppID</label>
            <input
              type="text"
              value={config.wechat.appId}
              onChange={e => handleChange('wechat', 'appId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">AppSecret</label>
            <input
              type="password"
              value={config.wechat.appSecret}
              onChange={e => handleChange('wechat', 'appSecret', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">同步设置</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.sync.autoSync}
              onChange={e => handleChange('sync', 'autoSync', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-900">启用自动同步</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">同步间隔（分钟）</label>
            <input
              type="number"
              min="1"
              value={config.sync.syncInterval}
              onChange={e => handleChange('sync', 'syncInterval', parseInt(e.target.value))}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded ${
            saving
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-700'
          } text-white`}
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel; 