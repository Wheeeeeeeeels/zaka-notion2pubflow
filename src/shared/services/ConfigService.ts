import { NotionConfig } from '../types/notion';
import fs from 'fs';
import path from 'path';

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.env.APPDATA || '', 'Notion2PublicFlow', 'config.json');
    this.ensureConfigDirectory();
  }

  private ensureConfigDirectory() {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 保存 Notion 配置
   */
  async saveNotionConfig(config: NotionConfig) {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = {
        ...currentConfig,
        notion: config,
      };
      await fs.promises.writeFile(this.configPath, JSON.stringify(newConfig, null, 2));
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取配置
   */
  async getConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        return {};
      }
      const config = await fs.promises.readFile(this.configPath, 'utf-8');
      return JSON.parse(config);
    } catch (error) {
      console.error('读取配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取 Notion 配置
   */
  async getNotionConfig(): Promise<NotionConfig | null> {
    try {
      const config = await this.getConfig();
      return config.notion || null;
    } catch (error) {
      console.error('获取 Notion 配置失败:', error);
      throw error;
    }
  }
} 