import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { ConfigService } from './services/ConfigService';
import { NotionService } from './services/NotionService';
import { WeChatService } from './services/WeChatService';
import { SyncService } from './services/SyncService';
import { setupIpcHandlers } from './ipc/handlers';

let mainWindow: BrowserWindow | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

// 处理 GPU 进程崩溃
app.on('gpu-process-crashed', (event, killed) => {
  console.log('GPU 进程崩溃，正在重启...');
  if (mainWindow) {
    mainWindow.reload();
  }
});

// 处理网络服务崩溃
app.on('render-process-gone', (event, details) => {
  console.log('渲染进程崩溃:', details.reason);
  if (mainWindow) {
    mainWindow.reload();
  }
});

const createWindow = async () => {
  console.log('正在创建窗口...');
  const appPath = app.getAppPath();
  console.log('应用路径:', appPath);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
      preload: join(appPath, 'out/preload/index.js'),
      allowRunningInsecureContent: true,
      // 禁用 GPU 加速，避免 GPU 崩溃问题
      disableHardwareAcceleration: true
    },
  });

  console.log('窗口创建完成，准备加载页面...');
  
  // 检查开发服务器是否可用
  const checkDevServer = async () => {
    try {
      const response = await fetch('http://localhost:5173');
      console.log('开发服务器响应状态:', response.status);
      return response.status === 200;
    } catch (error) {
      console.error('检查开发服务器失败:', error);
      return false;
    }
  };

  // 等待开发服务器启动
  const waitForDevServer = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
      console.log(`检查开发服务器 (${i + 1}/${retries})...`);
      const isAvailable = await checkDevServer();
      if (isAvailable) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  };

  const isDevServerAvailable = await waitForDevServer();
  console.log('开发服务器状态:', isDevServerAvailable ? '可用' : '不可用');

  if (isDevServerAvailable) {
    try {
      console.log('尝试加载开发服务器页面...');
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } catch (error) {
      console.error('加载开发服务器失败:', error);
      try {
        console.log('尝试加载本地文件...');
        const indexPath = join(appPath, 'out/renderer/index.html');
        console.log('加载文件路径:', indexPath);
        await mainWindow.loadFile(indexPath);
      } catch (error) {
        console.error('加载本地文件失败:', error);
      }
    }
  } else {
    try {
      console.log('加载本地文件...');
      const indexPath = join(appPath, 'out/renderer/index.html');
      console.log('加载文件路径:', indexPath);
      await mainWindow.loadFile(indexPath);
    } catch (error) {
      console.error('加载本地文件失败:', error);
    }
  }

  // 监听页面加载失败事件
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('页面加载失败:', errorCode, errorDescription);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`重试加载页面 (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.reload();
        }
      }, 1000);
    }
  });

  // 监听渲染进程日志
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`渲染进程日志 [${level}]:`, message);
  });

  // 监听渲染进程崩溃
  mainWindow.webContents.on('crashed', (event) => {
    console.error('渲染进程崩溃');
    if (mainWindow) {
      mainWindow.reload();
    }
  });
};

// 禁用 GPU 加速
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  console.log('应用准备就绪，初始化服务...');
  const configService = new ConfigService();
  const config = configService.getNotionConfig();
  console.log('Notion 配置:', config);
  const notionService = new NotionService(config);
  const weChatService = new WeChatService(configService);
  const syncService = new SyncService(notionService, weChatService);

  setupIpcHandlers(configService, notionService, syncService);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 