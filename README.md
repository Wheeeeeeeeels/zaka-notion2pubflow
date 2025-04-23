# Notion2PublicFlow

一个优雅的 Notion 文章同步到微信公众号的桌面应用。

![应用截图](./assets/app-screenshot.png)

## ✨ 功能特点

- 🔄 从 Notion 数据库自动同步文章
- 📝 智能转换为微信公众号格式
- 🎨 美观的界面设计
- 📊 实时同步状态显示
- ⚙️ 简单的配置管理
- 🔍 文章预览功能

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- Notion API Key
- 微信公众号 AppID 和 AppSecret

### 安装

1. 克隆仓库：
```bash
git clone https://github.com/Wheeeeeeeeels/zaka-notion2pubflow.git
cd zaka-notion2pubflow
```

2. 安装依赖：
```bash
npm install
# 或
yarn install
```

3. 启动应用：
```bash
npm run dev
# 或
yarn dev
```

## 📝 使用说明

### Notion 数据库设置

1. 在 Notion 中创建一个新的数据库
2. 数据库需要包含以下属性：
   - `title`（标题）: 文章标题
   - `PublishStatus`（选择器）: 发布状态，可选值：
     - `draft`: 草稿
     - `published`: 已发布
   - `PublishTime`（日期）: 发布时间
   - `Status`（状态）: 文章状态
   - `Author`（文本）: 作者（可选）
   - `Digest`（文本）: 文章摘要（可选）

### 配置步骤

1. 获取 Notion API Key：
   - 访问 [Notion Integrations](https://www.notion.so/my-integrations)
   - 点击 "New integration"
   - 填写名称并创建
   - 复制生成的 API Key

2. 获取数据库 ID：
   - 在浏览器中打开您的 Notion 数据库
   - URL 中形如 `https://www.notion.so/xxx/yyy?v=zzz` 的 `yyy` 部分就是数据库 ID

3. 配置微信公众号：
   - 登录 [微信公众平台](https://mp.weixin.qq.com/)
   - 进入"开发 > 基本配置"
   - 获取 AppID 和 AppSecret

4. 在应用中配置：
   - 启动应用后点击左侧"配置"
   - 填入上述获取的配置信息
   - 点击保存

### 使用流程

1. 在 Notion 中编写文章
2. 在应用中点击"刷新列表"获取最新文章
3. 点击"同步到微信"将文章同步到公众号
4. 在"同步状态"页面查看同步结果

## ⚙️ 常见问题

### 同步失败的可能原因

1. Notion API 配置问题
   - 确保 API Key 正确
   - 确保已将 integration 添加到数据库的访问权限中

2. 数据库格式问题
   - 检查是否包含所有必需的属性
   - 确保属性类型正确

3. 微信公众号配置问题
   - 验证 AppID 和 AppSecret 是否正确
   - 检查公众号是否有发布文章的权限

### 解决方案

1. 配置问题
   - 重新保存配置
   - 检查配置文件是否正确保存

2. 同步问题
   - 查看同步状态页面的错误信息
   - 检查文章格式是否符合要求

3. 其他问题
   - 重启应用
   - 清除配置重新设置

## 🔧 开发指南

### 构建应用
```bash
npm run build
# 或
yarn build
```

### 目录结构
```
src/
├── main/          # Electron 主进程
│   ├── services/  # 核心服务
│   └── ipc/       # 进程间通信
├── renderer/      # 前端界面
│   ├── components/# UI 组件
│   └── styles/    # 样式文件
└── shared/        # 共享类型和工具
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (git checkout -b feature/AmazingFeature)
3. 提交您的更改 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📱 联系方式

- 作者：Wheeeeeeeeels
- 邮箱：wheels.cs.work@gmail.com

## 🙏 致谢

- [Electron](https://www.electronjs.org/)
- [Notion API](https://developers.notion.com/)
- [微信公众平台](https://mp.weixin.qq.com/)

## 📝 更新日志

### v1.0.0 (2024-04-23)
- ✨ 首次发布
- 🎉 支持 Notion 文章同步到微信公众号
- 🌈 美观的用户界面
- ⚡️ 实时同步状态
- 🔧 简单的配置管理