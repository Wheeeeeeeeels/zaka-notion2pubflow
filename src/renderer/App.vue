<template>
  <div class="min-h-screen bg-[#1a1b1e]">
    <!-- 侧边栏 -->
    <div class="fixed left-0 top-0 h-full w-64 bg-[#212226] border-r border-[#2a2b2f] z-10">
      <div class="p-6">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-[#2b7df7] to-[#7c4dff] rounded-lg flex items-center justify-center">
            <span class="text-white text-lg font-bold">N</span>
          </div>
          <span class="text-lg font-semibold bg-gradient-to-r from-[#2b7df7] to-[#7c4dff] bg-clip-text text-transparent">
            Notion Sync
          </span>
        </div>
      </div>
      
      <nav class="mt-6">
        <div 
          v-for="page in ['articles', 'sync', 'config']" 
          :key="page"
          @click="currentPage = page"
          :class="[
            'mx-3 mb-2 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center space-x-3',
            currentPage === page 
              ? 'bg-[#2b7df7]/10 text-[#2b7df7]' 
              : 'hover:bg-[#2a2b2f] text-gray-400'
          ]"
        >
          <span v-html="getPageIcon(page)"></span>
          <span class="font-medium">{{ getPageTitle(page) }}</span>
        </div>
      </nav>
    </div>

    <!-- 主要内容区域 -->
    <div class="ml-64 p-8">
      <!-- 顶部状态栏 -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">{{ getPageTitle(currentPage) }}</h1>
          <p class="mt-1 text-sm text-gray-400">{{ getPageDescription(currentPage) }}</p>
        </div>
        
        <div class="flex items-center space-x-4">
          <button 
            v-if="currentPage === 'articles'"
            @click="loadArticles" 
            class="inline-flex items-center px-4 py-2 bg-[#2a2b2f] border border-[#3a3b3f] rounded-lg hover:bg-[#3a3b3f] transition-colors duration-200 text-white"
          >
            <span v-html="getPageIcon('sync')" class="mr-2"></span>
            刷新列表
          </button>
        </div>
      </div>

      <!-- 文章列表页面 -->
      <div v-if="currentPage === 'articles'" class="space-y-6">
        <!-- 配置未完成提示 -->
        <div v-if="!notionConfig.apiKey || !notionConfig.databaseId" class="bg-[#212226] rounded-lg border border-[#2a2b2f] p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-[#2a2b2f] rounded-full flex items-center justify-center">
            <span v-html="getPageIcon('config')" class="text-gray-400 w-8 h-8"></span>
          </div>
          <h3 class="text-lg font-medium text-white">请先完成配置</h3>
          <p class="mt-2 text-sm text-gray-400">您需要先设置 Notion API Key 和数据库 ID 才能加载文章</p>
          <button 
            @click="currentPage = 'config'"
            class="mt-4 px-4 py-2 bg-[#2b7df7] text-white rounded-lg hover:bg-[#1a6fe6] transition-colors duration-200"
          >
            去配置
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="loading" class="flex items-center justify-center py-12">
          <span v-html="getLoadingIcon()" class="text-[#2b7df7]"></span>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div class="flex items-center">
            <span v-html="getErrorIcon()" class="text-red-400 mr-2"></span>
            <p class="text-red-400">{{ error }}</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="articles.length === 0" class="bg-[#212226] rounded-lg border border-[#2a2b2f] p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-[#2a2b2f] rounded-full flex items-center justify-center">
            <span v-html="getPageIcon('articles')" class="text-gray-400 w-8 h-8"></span>
          </div>
          <h3 class="text-lg font-medium text-white">暂无文章</h3>
          <p class="mt-2 text-sm text-gray-400">开始创建你的第一篇文章吧</p>
        </div>

        <!-- 文章列表 -->
        <div v-else class="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div 
            v-for="article in articles" 
            :key="article.id" 
            class="group bg-[#212226] rounded-xl border border-[#2a2b2f] overflow-hidden hover:border-[#2b7df7]/50 hover:shadow-[0_0_20px_rgba(43,125,247,0.1)] transition-all duration-300"
          >
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-white line-clamp-2 group-hover:text-[#2b7df7] transition-colors duration-200">
                    {{ article.title }}
                  </h3>
                  <p class="mt-2 text-sm text-gray-400 line-clamp-3">{{ article.description }}</p>
                </div>
                <div class="flex-shrink-0">
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusClass(article.status)
                    ]"
                  >
                    {{ getStatusText(article.status) }}
                  </span>
                </div>
              </div>
              
              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center space-x-2 text-sm text-gray-400">
                  <i class="ri-time-line"></i>
                  <span>{{ formatDate(article.lastEditedTime) }}</span>
                </div>
                <button
                  @click="syncArticle(article.id)"
                  :disabled="isSyncing(article.id)"
                  :class="[
                    'inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isSyncing(article.id)
                      ? 'bg-[#2a2b2f] text-gray-400 cursor-not-allowed'
                      : 'bg-[#2b7df7]/10 text-[#2b7df7] hover:bg-[#2b7df7]/20'
                  ]"
                >
                  <span v-html="isSyncing(article.id) ? getLoadingIcon() : getSendIcon()" class="mr-1"></span>
                  {{ isSyncing(article.id) ? '同步中' : '同步到微信' }}
                </button>
              </div>

              <!-- 同步状态 -->
              <div v-if="getSyncState(article.id)" class="mt-4 pt-4 border-t border-[#2a2b2f]">
                <div class="flex items-center space-x-2">
                  <span 
                    :class="[
                      'flex-shrink-0 w-2 h-2 rounded-full',
                      getSyncStatusClass(getSyncState(article.id))
                    ]"
                  ></span>
                  <span class="text-sm" :class="getSyncStatusClass(getSyncState(article.id))">
                    {{ getSyncStatusText(getSyncState(article.id)) }}
                  </span>
                  <span v-if="getLastSyncTime(article.id)" class="text-sm text-gray-500">
                    · {{ formatDate(getLastSyncTime(article.id)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 同步状态页面 -->
      <div v-if="currentPage === 'sync'" class="bg-[#212226] rounded-xl border border-[#2a2b2f]">
        <div class="divide-y divide-[#2a2b2f]">
          <div 
            v-for="(state, id) in syncStates" 
            :key="id" 
            class="p-4 flex items-center justify-between hover:bg-[#2a2b2f] transition-colors duration-200 cursor-pointer"
            @click="handleSyncItemClick(id, state)"
          >
            <div class="flex items-center space-x-3">
              <span 
                :class="[
                  'flex-shrink-0 w-2 h-2 rounded-full',
                  getSyncStatusClass(state)
                ]"
              ></span>
              <span class="font-medium text-white">{{ getArticleTitle(id) }}</span>
            </div>
            <div class="flex items-center space-x-4">
              <span :class="[
                'text-sm font-medium',
                getSyncStatusClass(state)
              ]">
                {{ getSyncStatusText(state) }}
              </span>
              <span class="text-sm text-gray-500">
                {{ formatDate(state.lastSyncTime) }}
              </span>
              <button
                v-if="state.status === 'failed'"
                @click.stop="syncArticle(id)"
                :disabled="isSyncing(id)"
                class="px-3 py-1 text-sm rounded-lg bg-[#2b7df7]/10 text-[#2b7df7] hover:bg-[#2b7df7]/20 transition-colors duration-200"
              >
                重试
              </button>
            </div>
          </div>
        </div>

        <!-- 同步详情弹窗 -->
        <div v-if="selectedSync" 
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          @click="selectedSync = null"
        >
          <div 
            class="bg-[#212226] rounded-xl border border-[#2a2b2f] p-6 max-w-lg w-full mx-4 space-y-4"
            @click.stop
          >
            <h3 class="text-lg font-medium text-white">同步详情</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-400">文章标题</span>
                <span class="text-white">{{ getArticleTitle(selectedSync.articleId) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">同步状态</span>
                <span :class="getSyncStatusClass(selectedSync)">
                  {{ getSyncStatusText(selectedSync) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">最后同步时间</span>
                <span class="text-white">{{ new Date(selectedSync.lastSyncTime).toLocaleString() }}</span>
              </div>
              <div v-if="selectedSync.error" class="mt-4">
                <span class="text-gray-400">错误信息</span>
                <p class="mt-1 text-red-400 bg-red-400/10 p-3 rounded-lg">{{ selectedSync.error }}</p>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                v-if="selectedSync.status === 'failed'"
                @click="retrySync(selectedSync.articleId)"
                :disabled="isSyncing(selectedSync.articleId)"
                class="px-4 py-2 bg-[#2b7df7] text-white rounded-lg hover:bg-[#2468d9] transition-colors duration-200"
              >
                重试同步
              </button>
              <button
                @click="selectedSync = null"
                class="px-4 py-2 bg-[#2a2b2f] text-white rounded-lg hover:bg-[#3a3b3f] transition-colors duration-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 配置页面 -->
      <div v-if="currentPage === 'config'" class="space-y-8">
        <!-- Notion 配置 -->
        <div class="bg-[#212226] rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">Notion 配置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">API Key</label>
              <input 
                v-model="notionConfig.apiKey"
                type="password"
                class="w-full px-4 py-2 bg-[#2a2b2f] border border-[#3a3b3f] rounded-lg text-white focus:outline-none focus:border-[#2b7df7]"
                placeholder="输入您的 Notion API Key"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">数据库 ID</label>
              <input 
                v-model="notionConfig.databaseId"
                type="text"
                class="w-full px-4 py-2 bg-[#2a2b2f] border border-[#3a3b3f] rounded-lg text-white focus:outline-none focus:border-[#2b7df7]"
                placeholder="输入您的 Notion 数据库 ID"
              />
            </div>
          </div>
        </div>

        <!-- 微信配置 -->
        <div class="bg-[#212226] rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">微信配置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">AppID</label>
              <input 
                v-model="wechatConfig.appId"
                type="text"
                class="w-full px-4 py-2 bg-[#2a2b2f] border border-[#3a3b3f] rounded-lg text-white focus:outline-none focus:border-[#2b7df7]"
                placeholder="输入您的微信 AppID"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">AppSecret</label>
              <input 
                v-model="wechatConfig.appSecret"
                type="password"
                class="w-full px-4 py-2 bg-[#2a2b2f] border border-[#3a3b3f] rounded-lg text-white focus:outline-none focus:border-[#2b7df7]"
                placeholder="输入您的微信 AppSecret"
              />
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end">
          <button 
            @click="saveConfig"
            class="px-6 py-2 bg-[#2b7df7] text-white rounded-lg hover:bg-[#1a6fe6] transition-colors duration-200"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// 声明 window.electron 类型
declare global {
  interface Window {
    electron: {
      getConfig: () => Promise<any>;
      saveConfig: (config: any) => Promise<void>;
      getNotionPages: () => Promise<any[]>;
      syncArticle: (pageId: string) => Promise<void>;
      getSyncStatus: (articleId: string) => Promise<any>;
      onSyncStateChanged: (callback: (state: any) => void) => void;
    };
  }
}

// 页面状态
const currentPage = ref('articles');
const loading = ref(false);
const error = ref('');
const saving = ref(false);

// 数据
const config = reactive({
  notionApiKey: '',
  databaseId: '',
  wechatAppId: '',
  wechatAppSecret: '',
  autoSync: false,
  syncInterval: 30
});

const articles = ref<any[]>([]);
const syncStates = ref<Record<string, any>>({});

// 添加新的状态和方法
const selectedSync = ref(null);

// 配置相关
const notionConfig = ref({
  apiKey: '',
  databaseId: ''
})

const wechatConfig = ref({
  appId: '',
  appSecret: ''
})

// 工具函数
const getPageTitle = (page: string) => {
  const titles: Record<string, string> = {
    articles: '文章列表',
    sync: '同步状态',
    config: '配置'
  };
  return titles[page];
};

const formatDate = (date: string | number | Date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    default: 'bg-gray-500/20 text-gray-400'
  };
  return classes[status] || classes.default;
};

const getSyncStatusClass = (state: any) => {
  if (!state) return 'text-gray-400';
  
  const classes: Record<string, string> = {
    success: 'text-green-400',
    failed: 'text-red-400',
    syncing: 'text-[#2b7df7]',
    pending: 'text-gray-400'
  };
  return classes[state.status] || classes.pending;
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    default: '未发布'
  };
  return texts[status] || texts.default;
};

const getSyncStatusText = (state: any) => {
  if (!state) return '未同步';
  
  const texts: Record<string, string> = {
    success: '同步成功',
    failed: '同步失败',
    syncing: '同步中',
    pending: '未同步'
  };
  return texts[state.status] || texts.pending;
};

const getSyncState = (articleId: string) => {
  return syncStates.value[articleId];
};

const getLastSyncTime = (articleId: string) => {
  return syncStates.value[articleId]?.lastSyncTime;
};

const isSyncing = (articleId: string) => {
  return syncStates.value[articleId]?.status === 'syncing';
};

const getArticleTitle = (articleId: string) => {
  return articles.value.find(article => article.id === articleId)?.title || '未知文章';
};

// 加载配置
const loadConfig = async () => {
  try {
    console.log('正在加载配置...');
    const config = await window.electron.getConfig();
    console.log('加载到的配置:', config);
    
    if (config && config.notion) {
      notionConfig.value = {
        apiKey: config.notion.apiKey || '',
        databaseId: config.notion.databaseId || ''
      };
    }
    
    if (config && config.wechat) {
      wechatConfig.value = {
        appId: config.wechat.appId || '',
        appSecret: config.wechat.appSecret || ''
      };
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
};

// 显示通知
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // 淡出动画
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// 保存配置
const saveConfig = async () => {
  saving.value = true;
  try {
    const configToSave = {
      notion: {
        apiKey: notionConfig.value.apiKey,
        databaseId: notionConfig.value.databaseId
      },
      wechat: {
        appId: wechatConfig.value.appId,
        appSecret: wechatConfig.value.appSecret
      },
      sync: {
        autoSync: false,
        syncInterval: 30
      }
    };

    console.log('正在保存配置:', configToSave);
    await window.electron.saveConfig(configToSave);
    console.log('配置保存成功');

    showNotification('配置保存成功！');
    
    // 延迟一秒后重新加载文章列表
    setTimeout(async () => {
      try {
        await loadArticles();
      } catch (error) {
        console.error('重新加载文章失败:', error);
        showNotification('重新加载文章失败: ' + (error instanceof Error ? error.message : String(error)), 'error');
      }
    }, 1000);
  } catch (error) {
    console.error('保存配置失败:', error);
    showNotification(error instanceof Error ? error.message : '保存配置失败', 'error');
  } finally {
    saving.value = false;
  }
};

// 加载文章列表
const loadArticles = async () => {
  // 如果配置未完成，直接返回
  if (!notionConfig.value.apiKey || !notionConfig.value.databaseId) {
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    articles.value = await window.electron.getNotionPages();
    // 加载每篇文章的同步状态
    for (const article of articles.value) {
      const status = await window.electron.getSyncStatus(article.id);
      syncStates.value[article.id] = status;
    }
  } catch (err) {
    console.error('加载文章失败:', err);
    error.value = '加载文章失败';
  } finally {
    loading.value = false;
  }
};

// 同步文章
const syncArticle = async (articleId: string) => {
  try {
    // 更新同步状态为"同步中"
    syncStates.value[articleId] = { status: 'syncing', lastSyncTime: Date.now() };
    
    await window.electron.syncArticle(articleId);
    
    // 更新同步状态为"成功"
    syncStates.value[articleId] = { status: 'success', lastSyncTime: Date.now() };
    
    // 重新加载文章列表
    await loadArticles();
  } catch (err) {
    console.error('同步文章失败:', err);
    // 更新同步状态为"失败"
    syncStates.value[articleId] = { 
      status: 'failed', 
      error: err instanceof Error ? err.message : '未知错误',
      lastSyncTime: Date.now()
    };
  }
};

// 监听同步状态变化
const setupSyncStateListener = () => {
  window.electron.onSyncStateChanged((state: any) => {
    if (state.articleId) {
      syncStates.value[state.articleId] = state;
    }
  });
};

// 初始化
onMounted(async () => {
  await loadConfig();
  await loadArticles();
  setupSyncStateListener();
  
  // 定期刷新同步状态
  setInterval(async () => {
    for (const article of articles.value) {
      const status = await window.electron.getSyncStatus(article.id);
      syncStates.value[article.id] = status;
    }
  }, 30000); // 每30秒更新一次
});

// 修改 getPageIcon 方法
const getPageIcon = (page: string) => {
  const icons: Record<string, string> = {
    articles: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z"/></svg>`,
    sync: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
    config: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
  };
  return icons[page];
};

// 添加加载图标
const getLoadingIcon = () => {
  return `<svg class="icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10"/></svg>`;
};

// 添加错误图标
const getErrorIcon = () => {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
};

// 添加发送图标
const getSendIcon = () => {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`;
};

const getPageDescription = (page: string) => {
  const descriptions: Record<string, string> = {
    articles: '管理和同步你的 Notion 文章',
    sync: '查看文章同步状态和历史记录',
    config: '配置你的 Notion 和微信公众号'
  };
  return descriptions[page];
};

const handleSyncItemClick = (id: string, state: any) => {
  selectedSync.value = { ...state, articleId: id };
};

const retrySync = async (articleId: string) => {
  await syncArticle(articleId);
  selectedSync.value = null;
};
</script>

<style>
.app {
  min-height: 100vh;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1a1b1e;
}

::-webkit-scrollbar-thumb {
  background: #2a2b2f;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3a3b3f;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.icon {
  width: 1.2em;
  height: 1.2em;
  display: inline-block;
  vertical-align: middle;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 