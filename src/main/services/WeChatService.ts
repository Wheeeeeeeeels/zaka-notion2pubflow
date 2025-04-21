import axios from 'axios';
import { WeChatConfig, WeChatArticle, WeChatResponse } from '../../shared/types/wechat';
import { ConfigService } from './ConfigService';

export class WeChatService {
  private configService: ConfigService;
  private baseUrl = 'https://api.weixin.qq.com/cgi-bin';

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  async publishArticle(article: WeChatArticle): Promise<void> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/draft/add?access_token=${accessToken}`;

    const response = await axios.post<WeChatResponse>(url, {
      articles: [article]
    });

    if (response.data.errcode !== 0) {
      throw new Error(`发布文章失败: ${response.data.errmsg}`);
    }
  }

  private async getAccessToken(): Promise<string> {
    const config = this.configService.getWeChatConfig();
    const cachedToken = config.accessToken;
    const tokenExpiresAt = config.tokenExpiresAt || 0;

    // 如果令牌未过期，直接返回
    if (cachedToken && tokenExpiresAt > Date.now()) {
      return cachedToken;
    }

    // 获取新的访问令牌
    const url = `${this.baseUrl}/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
    const response = await axios.get<WeChatResponse & { access_token: string; expires_in: number }>(url);

    if (response.data.errcode !== 0 && !response.data.access_token) {
      throw new Error(`获取访问令牌失败: ${response.data.errmsg}`);
    }

    // 更新配置
    const currentConfig = await this.configService.getConfig();
    await this.configService.saveConfig({
      ...currentConfig,
      wechat: {
        ...currentConfig.wechat,
        accessToken: response.data.access_token,
        tokenExpiresAt: Date.now() + (response.data.expires_in * 1000)
      }
    });

    return response.data.access_token;
  }

  private async uploadImage(imageUrl: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/media/upload?access_token=${accessToken}&type=image`;

    // 下载图片
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data, 'binary');

    // 上传到微信
    const formData = new FormData();
    formData.append('media', new Blob([buffer]), 'image.jpg');

    const response = await axios.post<WeChatResponse & { media_id: string }>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.errcode !== 0 && !response.data.media_id) {
      throw new Error(`上传图片失败: ${response.data.errmsg}`);
    }

    return response.data.media_id;
  }
} 