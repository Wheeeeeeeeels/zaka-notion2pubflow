import React, { useState, useEffect } from 'react';
import { IpcService } from '../../shared/services/IpcService';
import { NotionConfig } from '../../shared/types/notion';
import { WeChatConfig } from '../../shared/types/wechat';
import { SyncConfig } from '../../shared/types/sync';
import { Config } from '../../shared/types/config';

interface ConfigPanelProps {
  onConfigSaved: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onConfigSaved }) => {
  const [config, setConfig] = useState<Config>({
    notion: { apiKey: '', databaseId: '' },
    wechat: { appId: '', appSecret: '' },
    sync: { autoSync: false, syncInterval: 30 },
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const config = await IpcService.getConfig();
      setConfig(config);
    } catch (err) {
      console.error('加载配置失败:', err);
      await IpcService.showNotification('错误', '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('ConfigPanel - 开始保存配置...');
      setLoading(true);
      setSaveStatus({ type: null, message: '' });
      
      console.log('当前配置对象:', JSON.stringify(config, null, 2));
      
      // 验证配置
      if (!config.notion.apiKey || !config.notion.databaseId) {
        console.log('配置验证失败: API Key 或数据库 ID 为空');
        setSaveStatus({ type: 'error', message: 'API Key 和数据库 ID 不能为空' });
        return;
      }
      
      // 确保发送完整的配置对象
      const configToSave = {
        notion: {
          apiKey: config.notion.apiKey.trim(),
          databaseId: config.notion.databaseId.trim()
        },
        wechat: {
          appId: (config.wechat?.appId || '').trim(),
          appSecret: (config.wechat?.appSecret || '').trim()
        },
        sync: {
          autoSync: Boolean(config.sync?.autoSync),
          syncInterval: Number(config.sync?.syncInterval) || 30
        }
      };
      
      console.log('处理后的配置对象:', JSON.stringify(configToSave, null, 2));
      console.log('正在调用 IpcService.saveConfig...');
      const result = await IpcService.saveConfig(configToSave);
      console.log('保存配置结果:', result);
      
      if (result) {
        console.log('配置保存成功，正在显示成功通知...');
        setSaveStatus({ type: 'success', message: '配置保存成功！' });
        await IpcService.showNotification('成功', '配置保存成功！');
        console.log('正在重新加载配置...');
        await loadConfig();
        console.log('配置重新加载完成');
      }
      
      onConfigSaved();
    } catch (error) {
      console.error('保存配置时出错:', error);
      setSaveStatus({ type: 'error', message: error instanceof Error ? error.message : '保存配置失败' });
      await IpcService.showNotification('错误', error instanceof Error ? error.message : '保存配置失败');
    } finally {
      console.log('保存操作完成，设置 loading 为 false');
      setLoading(false);
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
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>Notion 配置</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>API Key</label>
          <input
            type="password"
            value={config.notion.apiKey}
            onChange={e => handleChange('notion', 'apiKey', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>数据库 ID</label>
          <input
            type="text"
            value={config.notion.databaseId}
            onChange={e => handleChange('notion', 'databaseId', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>微信公众号配置</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>AppID</label>
          <input
            type="text"
            value={config.wechat.appId}
            onChange={e => handleChange('wechat', 'appId', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>AppSecret</label>
          <input
            type="password"
            value={config.wechat.appSecret}
            onChange={e => handleChange('wechat', 'appSecret', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>同步设置</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={config.sync.autoSync}
              onChange={e => handleChange('sync', 'autoSync', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            启用自动同步
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>同步间隔（分钟）</label>
          <input
            type="number"
            min="1"
            value={config.sync.syncInterval}
            onChange={e => handleChange('sync', 'syncInterval', parseInt(e.target.value))}
            style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        {saveStatus.type && (
          <div style={{
            marginBottom: '10px',
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: saveStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: saveStatus.type === 'success' ? '#065f46' : '#991b1b',
            textAlign: 'center'
          }}>
            {saveStatus.message}
          </div>
        )}
        <button
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: loading ? '#93c5fd' : '#3b82f6',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none'
          }}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel; 