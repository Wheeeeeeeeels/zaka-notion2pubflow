import { NotionConfig } from './notion';
import { WeChatConfig } from './wechat';
import { SyncConfig } from './sync';

export interface Config {
  notion: NotionConfig;
  wechat: WeChatConfig;
  sync: SyncConfig;
} 