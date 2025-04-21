import axios from 'axios';
import { WeChatConfig, WeChatArticle, WeChatResponse } from '../types/wechat';

export class WeChatService {
  private config: WeChatConfig;
  private baseUrl = 'https://api.weixin.qq.com/cgi-bin';

  constructor(config: WeChatConfig) {
    this.config = config;
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string> {
    // 检查是否已有有效的访问令牌
    if (this.config.accessToken && this.config.tokenExpiresAt && this.config.tokenExpiresAt > Date.now()) {
      return this.config.accessToken;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/token`, {
        params: {
          grant_type: 'client_credential',
          appid: this.config.appId,
          secret: this.config.appSecret,
        },
      });

      if (response.data.errcode) {
        throw new Error(response.data.errmsg);
      }

      this.config.accessToken = response.data.access_token;
      this.config.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

      return response.data.access_token;
    } catch (error) {
      console.error('获取访问令牌失败:', error);
      throw error;
    }
  }

  /**
   * 上传图片
   */
  async uploadImage(imageBuffer: Buffer): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      const formData = new FormData();
      formData.append('media', new Blob([imageBuffer]));

      const response = await axios.post(
        `${this.baseUrl}/media/upload?access_token=${accessToken}&type=image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.errcode) {
        throw new Error(response.data.errmsg);
      }

      return response.data.media_id;
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  }

  /**
   * 发布文章
   */
  async publishArticle(article: WeChatArticle): Promise<WeChatResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/material/add_news?access_token=${accessToken}`,
        {
          articles: [article],
        }
      );

      if (response.data.errcode) {
        throw new Error(response.data.errmsg);
      }

      return response.data;
    } catch (error) {
      console.error('发布文章失败:', error);
      throw error;
    }
  }
} 