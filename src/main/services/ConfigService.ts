import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { NotionConfig } from '../../shared/types/notion';
import { WeChatConfig } from '../../shared/types/wechat';
import { SyncConfig } from '../../shared/types/sync';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

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
    this.config = newConfig;
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
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
} 