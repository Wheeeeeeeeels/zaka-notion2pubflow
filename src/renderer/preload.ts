import { contextBridge, ipcRenderer } from 'electron';
import { Config } from '../shared/types/config';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, func);
    }
  },
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: Config) => ipcRenderer.invoke('save-config', config),
  getNotionPages: () => ipcRenderer.invoke('get-notion-pages'),
  syncArticle: (pageId: string) => ipcRenderer.invoke('sync-article', pageId),
  getSyncStatus: (articleId: string) => ipcRenderer.invoke('get-sync-status', articleId),
  onSyncStateChanged: (callback: (state: any) => void) => {
    ipcRenderer.on('sync-state-changed', (_, state) => callback(state));
    return () => ipcRenderer.removeListener('sync-state-changed', callback);
  },
  showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', { title, body })
}); 