import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { ConfigService } from './services/ConfigService';
import { NotionService } from './services/NotionService';
import { WeChatService } from './services/WeChatService';
import { SyncService } from './services/SyncService';
import { setupIpcHandlers } from './ipc/handlers';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 全局变量
let mainWindow: BrowserWindow | null = null;
let configService: ConfigService | null = null;
let notionService: NotionService | null = null;
let weChatService: WeChatService | null = null;
let syncService: SyncService | null = null;

// 初始化服务
async function initServices() {
  try {
    // 初始化配置服务
    configService = new ConfigService();
    await configService.init(); // 确保配置已加载
    const notionConfig = configService.getNotionConfig();
    
    console.log('初始化服务时的 Notion 配置:', notionConfig);
    
    // 初始化 Notion 服务
    if (notionConfig.apiKey && notionConfig.databaseId) {
      try {
        notionService = new NotionService(notionConfig);
        weChatService = new WeChatService(configService);
        syncService = new SyncService(notionService, weChatService);
        console.log('服务初始化成功');
      } catch (error) {
        console.error('服务初始化失败:', error);
      }
    } else {
      console.log('Notion 配置未完成，等待用户设置...');
    }
  } catch (error) {
    console.error('初始化服务失败:', error);
  }
}

// 处理 GPU 进程崩溃
app.on('gpu-process-crashed', (event, killed) => {
  console.log('GPU 进程崩溃，正在重启...');
  if (mainWindow) {
    mainWindow.reload();
  }
});

// 处理网络服务崩溃
app.on('render-process-gone', (event, details) => {
  console.log('渲染进程崩溃:', details);
  if (mainWindow) {
    mainWindow.reload();
  }
});

// 创建窗口
async function createWindow() {
  try {
    // 创建窗口
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/index.js')
      },
    });
    
    // 加载页面
    if (isDev) {
      // 开发环境
      await mainWindow.loadURL('http://localhost:5173');
    } else {
      // 生产环境
      await mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
    
    // 打开开发者工具
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  } catch (error) {
    console.error('创建窗口失败:', error);
  }
}

// 应用准备就绪时初始化服务和创建窗口
app.whenReady().then(async () => {
  console.log('应用准备就绪，初始化服务...');
  await initServices();
  
  // 设置 IPC 处理器
  if (configService) {
    setupIpcHandlers(configService, notionService, weChatService, syncService);
  }
  
  await createWindow();
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 激活应用时创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 