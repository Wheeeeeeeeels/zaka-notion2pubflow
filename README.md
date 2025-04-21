# Notion2PublicFlow

一个将 Notion 文章同步到微信公众号的桌面应用。

## 功能特点

- 从 Notion 数据库获取文章
- 将 Notion 文章转换为微信公众号格式
- 支持自动同步和手动同步
- 实时预览文章效果
- 保存同步状态和配置

## 技术栈

- Electron
- React
- TypeScript
- TailwindCSS
- Notion API
- 微信公众号 API

## 开发环境设置

1. 克隆仓库：
```bash
git clone https://github.com/Wheeeeeeeeels/zaka-notion2pubflow.git
cd zaka-notion2pubflow
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建应用：
```bash
npm run build
```

## 配置说明

1. Notion 配置
   - 需要 Notion API Key
   - 需要 Notion 数据库 ID

2. 微信公众号配置
   - 需要公众号 AppID
   - 需要公众号 AppSecret

## 使用说明

1. 首次使用需要配置 Notion API Key 和数据库 ID
2. 配置完成后会自动加载文章列表
3. 点击文章可以预览内容
4. 点击同步按钮将文章同步到微信公众号

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT License