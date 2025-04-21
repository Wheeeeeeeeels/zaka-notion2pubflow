<template>
  <div class="app">
    <nav class="nav">
      <div class="logo">
        <h1>Notion to WeChat</h1>
      </div>
      <div class="nav-items">
        <button 
          :class="['nav-item', { active: currentPage === 'articles' }]"
          @click="currentPage = 'articles'"
        >
          文章列表
        </button>
        <button 
          :class="['nav-item', { active: currentPage === 'sync' }]"
          @click="currentPage = 'sync'"
        >
          同步状态
        </button>
        <button 
          :class="['nav-item', { active: currentPage === 'config' }]"
          @click="currentPage = 'config'"
        >
          配置
        </button>
      </div>
    </nav>

    <main class="main">
      <div v-if="currentPage === 'articles'" class="page">
        <h2>文章列表</h2>
        <div class="article-list">
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else-if="articles.length === 0" class="empty">
            暂无文章
          </div>
          <div v-else class="articles">
            <div v-for="article in articles" :key="article.id" class="article-item">
              <h3>{{ article.title }}</h3>
              <p>{{ article.description }}</p>
              <button @click="syncArticle(article.id)">同步到微信</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentPage === 'sync'" class="page">
        <h2>同步状态</h2>
        <div class="sync-status">
          <div v-if="syncStatus.status === 'syncing'" class="syncing">
            正在同步...
          </div>
          <div v-else-if="syncStatus.status === 'error'" class="error">
            同步失败: {{ syncStatus.message }}
          </div>
          <div v-else class="idle">
            暂无同步任务
          </div>
        </div>
      </div>

      <div v-if="currentPage === 'config'" class="page">
        <h2>配置</h2>
        <div class="config-form">
          <div class="form-group">
            <label>Notion API Key</label>
            <input 
              type="password" 
              v-model="config.notionApiKey" 
              placeholder="输入你的 Notion API Key"
            />
          </div>
          <div class="form-group">
            <label>Database ID</label>
            <input 
              type="text" 
              v-model="config.databaseId" 
              placeholder="输入你的 Database ID"
            />
          </div>
          <div v-if="configError" class="error">{{ configError }}</div>
          <button 
            class="save-btn" 
            @click="saveConfig"
            :disabled="saving"
          >
            {{ saving ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// 页面状态
const currentPage = ref('articles');
const loading = ref(false);
const error = ref('');
const saving = ref(false);
const configError = ref('');

// 数据
const config = reactive({
  notionApiKey: '',
  databaseId: ''
});
const articles = ref<any[]>([]);
const syncStatus = reactive({
  status: 'idle' as 'idle' | 'syncing' | 'error',
  message: ''
});

// 加载配置
const loadConfig = async () => {
  try {
    const savedConfig = await window.electron.getConfig();
    config.notionApiKey = savedConfig.apiKey;
    config.databaseId = savedConfig.databaseId;
  } catch (err) {
    console.error('加载配置失败:', err);
  }
};

// 保存配置
const saveConfig = async () => {
  saving.value = true;
  configError.value = '';
  try {
    await window.electron.saveConfig({
      apiKey: config.notionApiKey,
      databaseId: config.databaseId
    });
    // 保存成功后重新加载文章列表
    loadArticles();
  } catch (err) {
    configError.value = '保存配置失败';
    console.error('保存配置失败:', err);
  } finally {
    saving.value = false;
  }
};

// 加载文章列表
const loadArticles = async () => {
  loading.value = true;
  error.value = '';
  try {
    articles.value = await window.electron.getNotionPages();
  } catch (err) {
    error.value = '加载文章失败';
    console.error('加载文章失败:', err);
  } finally {
    loading.value = false;
  }
};

// 同步文章
const syncArticle = async (pageId: string) => {
  try {
    await window.electron.syncArticle(pageId);
    // 同步成功后更新状态
    updateSyncStatus();
  } catch (err) {
    console.error('同步文章失败:', err);
  }
};

// 更新同步状态
const updateSyncStatus = async () => {
  try {
    const status = await window.electron.getSyncStatus();
    syncStatus.status = status.status;
    syncStatus.message = status.message;
  } catch (err) {
    console.error('获取同步状态失败:', err);
  }
};

// 初始化
onMounted(async () => {
  await loadConfig();
  await loadArticles();
  // 定期更新同步状态
  setInterval(updateSyncStatus, 5000);
});
</script>

<style>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  background: #2c3e50;
  color: white;
  padding: 1rem;
}

.logo {
  margin-bottom: 1rem;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-items {
  display: flex;
  gap: 1rem;
}

.nav-item {
  background: none;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
}

.main {
  flex: 1;
  padding: 2rem;
  background: #f5f5f5;
  overflow-y: auto;
}

.page {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.config-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.save-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.save-btn:hover {
  background: #34495e;
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.articles {
  display: grid;
  gap: 1rem;
}

.article-item {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.article-item h3 {
  margin: 0 0 0.5rem 0;
}

.article-item p {
  margin: 0 0 1rem 0;
  color: #666;
}

.article-item button {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.article-item button:hover {
  background: #34495e;
}

.sync-status {
  text-align: center;
  padding: 2rem;
}

.syncing {
  color: #2c3e50;
}

.idle {
  color: #666;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 