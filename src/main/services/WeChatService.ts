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
    try {
      console.log('开始发布文章到微信公众号...');
      console.log('文章内容:', JSON.stringify(article, null, 2));

      const accessToken = await this.getAccessToken();
      console.log('获取到访问令牌:', accessToken);

      // 获取封面图片的 media_id
      console.log('正在上传封面图片...');
      let thumbMediaId: string | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!thumbMediaId && retryCount < maxRetries) {
        try {
          // 使用 Unsplash 的随机图片
          const unsplashUrl = `https://api.unsplash.com/photos/random?query=technology+minimal&orientation=landscape&client_id=WVH7UopVAW9CxpF3CSNDgbYMJLNO0qwRphkOBEDjtWY`;
          console.log('正在获取 Unsplash 图片...');
          const unsplashResponse = await axios.get(unsplashUrl);
          const imageUrl = unsplashResponse.data.urls.regular;
          console.log('获取到 Unsplash 图片:', imageUrl);

          if (!imageUrl) {
            throw new Error('无法获取 Unsplash 图片');
          }

          thumbMediaId = await this.uploadImage(imageUrl);
          console.log('获取到封面图片 media_id:', thumbMediaId);

          // 创建草稿
          const draftUrl = `${this.baseUrl}/draft/add?access_token=${accessToken}`;
          console.log('创建草稿，请求URL:', draftUrl);

          const articleData = {
            articles: [{
              title: article.title,
              author: article.author || '匿名',
              digest: article.digest || article.title,
              content: article.content,
              content_source_url: '',
              thumb_media_id: thumbMediaId,
              need_open_comment: article.needOpenComment ? 1 : 0,
              only_fans_can_comment: 0
            }]
          };

          console.log('发送的草稿数据:', JSON.stringify(articleData, null, 2));
          const draftResponse = await axios.post<WeChatResponse>(draftUrl, articleData);
          console.log('创建草稿响应:', JSON.stringify(draftResponse.data, null, 2));

          if (!draftResponse.data.media_id) {
            throw new Error(`创建草稿失败: ${draftResponse.data.errmsg || '未知错误'}`);
          }

          const draftMediaId = draftResponse.data.media_id;
          console.log('草稿创建成功，media_id:', draftMediaId);

          // 等待1秒确保草稿保存完成
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 发布草稿
          await this.publishDraft(draftMediaId);
          console.log('文章发布流程完成');
          return;

        } catch (error) {
          console.error(`第 ${retryCount + 1} 次尝试失败:`, error);
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error('发布文章失败:', error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      console.log('开始获取访问令牌...');
      const config = this.configService.getWeChatConfig();
      console.log('当前微信配置:', config);

      const cachedToken = config.accessToken;
      const tokenExpiresAt = config.tokenExpiresAt || 0;

      // 如果令牌未过期，直接返回
      if (cachedToken && tokenExpiresAt > Date.now()) {
        console.log('使用缓存的访问令牌');
        return cachedToken;
      }

      console.log('获取新的访问令牌...');
      const url = `${this.baseUrl}/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
      console.log('请求URL:', url);

      const response = await axios.get<WeChatResponse & { access_token: string; expires_in: number }>(url);
      console.log('获取令牌响应:', response.data);

      if (response.data.errcode !== 0 && !response.data.access_token) {
        console.error('获取访问令牌失败:', response.data);
        throw new Error(`获取访问令牌失败: ${response.data.errmsg}`);
      }

      // 更新配置
      console.log('更新访问令牌配置...');
      const currentConfig = await this.configService.getConfig();
      await this.configService.saveConfig({
        ...currentConfig,
        wechat: {
          ...currentConfig.wechat,
          accessToken: response.data.access_token,
          tokenExpiresAt: Date.now() + (response.data.expires_in * 1000)
        }
      });

      console.log('访问令牌获取成功');
      return response.data.access_token;
    } catch (error) {
      console.error('获取访问令牌失败:', error);
      throw error;
    }
  }

  private async uploadImage(imageUrl: string): Promise<string> {
    try {
      console.log('开始上传图片:', imageUrl);
      const accessToken = await this.getAccessToken();
      // 使用永久素材接口替代临时素材接口
      const url = `${this.baseUrl}/material/add_material?access_token=${accessToken}&type=image`;
      console.log('上传图片URL:', url);

      // 下载图片
      console.log('正在下载图片...');
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'image/png,image/*'
        }
      });
      const buffer = Buffer.from(imageResponse.data);
      console.log('图片下载完成，大小:', buffer.length, '字节');

      // 创建 FormData
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'image/png' });
      formData.append('media', blob, 'cover.png');
      // 添加描述信息
      formData.append('description', JSON.stringify({
        title: 'Article Cover Image',
        introduction: 'Auto generated cover image'
      }));

      // 上传到微信
      console.log('正在上传永久图片到微信...');
      const response = await axios.post<WeChatResponse & { media_id: string }>(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('上传图片响应:', response.data);

      if (response.data.errcode !== 0 && !response.data.media_id) {
        console.error('上传图片失败:', response.data);
        throw new Error(`上传图片失败: ${response.data.errmsg}`);
      }

      console.log('永久图片上传成功，media_id:', response.data.media_id);
      return response.data.media_id;
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  }

  // 添加获取发布状态描述的辅助方法
  private getPublishStatus(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: '发布成功',
      1: '待发布',
      2: '发布失败',
      3: '已删除',
      4: '内容违规',
      5: '图片违规',
      6: '视频违规',
      7: '标题违规',
      8: '其他违规'
    };
    return statusMap[status] || '未知状态';
  }

  // 添加发布草稿的方法
  async publishDraft(mediaId: string): Promise<void> {
    try {
      console.log('开始发布草稿...');
      const accessToken = await this.getAccessToken();
      const publishUrl = `${this.baseUrl}/freepublish/submit?access_token=${accessToken}`;
      
      const publishResponse = await axios.post<WeChatResponse>(publishUrl, {
        media_id: mediaId
      });
   
      console.log('发布草稿响应:', publishResponse.data);
      if (publishResponse.data.errcode === 0 && publishResponse.data.publish_id) {
        console.log('文章提交发布成功，publish_id:', publishResponse.data.publish_id);
        
        // 等待发布完成
        let retryCount = 0;
        const maxRetries = 10;
        const retryInterval = 2000; // 2秒

        while (retryCount < maxRetries) {
          // 检查发布状态
          console.log('正在检查发布状态...');
          const statusUrl = `${this.baseUrl}/freepublish/get?access_token=${accessToken}`;
          const statusResponse = await axios.post<WeChatResponse>(statusUrl, {
            publish_id: publishResponse.data.publish_id
          });
          
          console.log('发布状态响应:', statusResponse.data);
          const publishStatus = statusResponse.data.publish_status;
          console.log('文章状态:', this.getPublishStatus(publishStatus));

          if (publishStatus === 0) {
            console.log('文章发布成功，可在公众号查看');
            return;
          } else if (publishStatus > 1) { // 状态大于1表示发布失败
            throw new Error(`发布失败: ${this.getPublishStatus(publishStatus)}`);
          }

          // 如果状态是1(待发布)，继续等待
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`等待发布完成，第 ${retryCount} 次检查...`);
            await new Promise(resolve => setTimeout(resolve, retryInterval));
          }
        }

        throw new Error('发布超时，请在公众号后台检查发布状态');
      } else {
        throw new Error(`发布草稿失败: ${publishResponse.data.errmsg || '未知错误'}`);
      }
    } catch (error) {
      console.error('发布草稿失败:', error);
      throw error;
    }
  }
} 