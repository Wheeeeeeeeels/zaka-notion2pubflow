export interface WeChatConfig {
  appId: string;
  appSecret: string;
  accessToken?: string;
  tokenExpiresAt?: number;
}

export interface WeChatArticle {
  title: string;
  content: string;
  author?: string;
  digest?: string;
  showCoverPic?: boolean;
  thumbMediaId?: string;
  needOpenComment?: boolean;
  onlyFansCanComment?: boolean;
}

export interface WeChatResponse {
  errcode: number;
  errmsg: string;
  [key: string]: any;
} 