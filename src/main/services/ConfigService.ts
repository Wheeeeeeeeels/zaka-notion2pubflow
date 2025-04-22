import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { NotionConfig } from '../../shared/types/notion';
import { WeChatConfig } from '../../shared/types/wechat';
import { SyncConfig } from '../../shared/types/sync';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { Config } from '../../shared/types/config';

interface Config {
  notion: NotionConfig;
  wechat: WeChatConfig;
  sync: SyncConfig;
}

export class ConfigService {
  private configPath: string;
  private config: Config;

  constructor() {
    const userDataPath = app.getPath('userData');
    const configDir = join(userDataPath, 'config');
    
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    this.configPath = join(configDir, 'config.json');
    this.config = {
      notion: { apiKey: '', databaseId: '' },
      wechat: { appId: '', appSecret: '' },
      sync: { autoSync: false, syncInterval: 30 }
    };

    // 初始化配置
    this.init().catch(error => {
      console.error('初始化配置失败:', error);
    });
  }

  async init(): Promise<void> {
    try {
      await this.loadConfig();
    } catch (error) {
      console.error('加载配置失败，使用默认配置:', error);
      // 确保配置文件存在
      const configDir = path.dirname(this.configPath);
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
      await this.saveConfig(this.config);
    }
  }

  private async loadConfig(): Promise<Config> {
    try {
      if (!existsSync(this.configPath)) {
        console.log('配置文件不存在，创建默认配置');
        await this.saveConfig(this.config);
        return this.config;
      }
      
      console.log('正在读取配置文件:', this.configPath);
      const data = await fs.readFile(this.configPath, 'utf-8');
      console.log('配置文件内容:', data);
      
      const loadedConfig = JSON.parse(data);
      console.log('解析后的配置:', loadedConfig);
      
      // 确保配置对象包含所有必要的字段
      this.config = {
        notion: {
          apiKey: loadedConfig.notion?.apiKey || '',
          databaseId: loadedConfig.notion?.databaseId || '',
        },
        wechat: {
          appId: loadedConfig.wechat?.appId || '',
          appSecret: loadedConfig.wechat?.appSecret || '',
        },
        sync: {
          autoSync: loadedConfig.sync?.autoSync || false,
          syncInterval: loadedConfig.sync?.syncInterval || 30,
        },
      };
      
      console.log('最终配置:', this.config);
      return this.config;
    } catch (error) {
      console.error('加载配置失败:', error);
      throw error;
    }
  }

  async getConfig(): Promise<Config> {
    return this.config;
  }

  async saveConfig(newConfig: Config): Promise<void> {
    try {
      // 验证并格式化配置
      this.validateConfig(newConfig);
      
      // 保存配置
      this.config = newConfig;
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
      
      console.log('配置保存成功:', this.config);
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  }

  getNotionConfig(): NotionConfig {
    return this.config.notion;
  }

  async saveNotionConfig(config: NotionConfig): Promise<void> {
    try {
      console.log('开始保存 Notion 配置:', config);
      
      // 更新配置
      this.config.notion = config;
      console.log('配置已更新:', this.config);
      
      // 确保配置目录存在
      const configDir = path.dirname(this.configPath);
      if (!existsSync(configDir)) {
        console.log('创建配置目录:', configDir);
        mkdirSync(configDir, { recursive: true });
      }
      
      // 保存到文件
      console.log('正在写入配置文件:', this.configPath);
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('配置文件写入成功');
      
      // 验证配置是否保存成功
      const savedConfig = await this.loadConfig();
      console.log('验证保存的配置:', savedConfig);
    } catch (error) {
      console.error('保存 Notion 配置失败:', error);
      throw error;
    }
  }

  getWeChatConfig(): WeChatConfig {
    return this.config.wechat;
  }

  getSyncConfig(): SyncConfig {
    return this.config.sync;
  }

  // 格式化数据库 ID
  private formatDatabaseId(id: string): string {
    // 移除所有非字母数字字符
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanId.length !== 32) {
      throw new Error('数据库 ID 必须是 32 位字符');
    }

    // 转换为 UUID 格式
    return [
      cleanId.slice(0, 8),
      cleanId.slice(8, 12),
      cleanId.slice(12, 16),
      cleanId.slice(16, 20),
      cleanId.slice(20)
    ].join('-');
  }

  private validateConfig(config: Config) {
    const errors: string[] = [];

    // 验证 Notion 配置
    if (!config.notion.apiKey) {
      errors.push('Notion API Key 不能为空');
    } else if (config.notion.apiKey.length < 50) {
      errors.push('Notion API Key 格式不正确');
    }

    if (!config.notion.databaseId) {
      errors.push('数据库 ID 不能为空');
    } else {
      try {
        // 尝试格式化数据库 ID
        config.notion.databaseId = this.formatDatabaseId(config.notion.databaseId);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : '数据库 ID 格式不正确');
      }
    }

    // 验证微信配置
    if (!config.wechat.appId) {
      errors.push('微信 AppID 不能为空');
    }
    if (!config.wechat.appSecret) {
      errors.push('微信 AppSecret 不能为空');
    }

    // 验证同步配置
    if (config.sync.syncInterval < 1) {
      errors.push('同步间隔不能小于 1 分钟');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  }

  private loadConfig(): Config {
    try {
      if (existsSync(this.configPath)) {
        const data = readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }

    return {
      notion: {
        apiKey: '',
        databaseId: ''
      },
      wechat: {
        appId: '',
        appSecret: '',
        accessToken: '',
        tokenExpiresAt: 0
      },
      sync: {
        autoSync: false,
        syncInterval: 30
      }
    };
  }

  saveConfig(config: Config): void {
    try {
      // 验证配置
      this.validateConfig(config);

      // 清理数据库 ID
      config.notion.databaseId = config.notion.databaseId.trim();

      // 保存配置
      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;

      console.log('配置保存成功');
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  }
} 