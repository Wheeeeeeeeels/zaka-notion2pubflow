export interface IpcRequest {
  type: string;
  payload?: any;
}

export interface IpcResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export enum IpcChannel {
  SAVE_NOTION_CONFIG = 'save-notion-config',
  GET_NOTION_CONFIG = 'get-notion-config',
  GET_NOTION_PAGES = 'get-notion-pages',
  GET_NOTION_PAGE_CONTENT = 'get-notion-page-content',
} 