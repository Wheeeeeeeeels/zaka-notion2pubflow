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
    
    this.configPath = join(configDir, 'notion.json');
    this.config = {
      notion: { apiKey: '', databaseId: '' },
      wechat: { appId: '', appSecret: '' },
      sync: { autoSync: false, syncInterval: 30 }
    };
  }

  async init(): Promise<void> {
    try {
      await this.loadConfig();
    } catch (error) {
      console.error('初始化配置失败，使用默认配置:', error);
      await this.saveConfig(this.config);
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // 如果配置文件不存在，使用默认配置
        await this.saveConfig(this.config);
      } else {
        throw error;
      }
    }
  }

  async getConfig(): Promise<Config> {
    return this.config;
  }

  async saveConfig(newConfig: Config): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(newConfig, null, 2));
      this.config = newConfig;
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  }

  getNotionConfig(): NotionConfig {
    try {
      if (!existsSync(this.configPath)) {
        return {
          apiKey: '',
          databaseId: '',
        };
      }

      const configData = readFileSync(this.configPath, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('读取配置文件失败:', error);
      return {
        apiKey: '',
        databaseId: '',
      };
    }
  }

  saveNotionConfig(config: NotionConfig): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('保存配置文件失败:', error);
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