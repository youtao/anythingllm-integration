# AnythingLLM Integration - AI 助手指南

## 项目概述

**项目**: anythingllm-integration v1.2.0
**功能**: AnythingLLM 知识库集成，提供自动查询和同步功能

## MCP 工具（5 个）

| 工具 | 用途 | 优先级 |
|------|------|--------|
| `anythingllm_search` | 向量搜索知识库 | ⭐⭐⭐ |
| `anythingllm_chat` | RAG 智能问答 | ⭐⭐ |
| `anythingllm_list_workspaces` | 列出所有工作区 | ⭐ |
| `anythingllm_create_workspace` | 创建新工作区 | ⭐ |
| `anythingllm_upload_document` | 上传文档（自动向量化） | ⭐⭐ |

### anythingllm_search
- **参数**: `query` (必需), `workspace` (可选)
- **场景**: 技术问题优先使用此工具查询知识库

### anythingllm_chat
- **参数**: `message` (必需), `workspace` (可选)
- **场景**: 需要详细、结构化的回答时使用

### anythingllm_upload_document
- **参数**: `workspace`, `title`, `content` (必需), `metadata` (可选)
- **API**: 使用官方 `/v1/document/raw-text` 端点，自动向量嵌入

## 强制查询机制

### 触发关键词
```
PostgreSQL, MySQL, 数据库, ABP, Vue, React, Angular, 前端,
.NET, C#, TypeScript, JavaScript, Python, Java, Go, Rust, Node,
API, REST, GraphQL, Docker, Kubernetes, Git, Linux
```

### 工作流程
```
用户提问 → Hook 检测关键词 → 注入查询指令 → anythingllm_search → 回答
```

### 配置
- Hook 配置: [hooks/hooks.json](hooks/hooks.json)
- 脚本: [scripts/force-knowledge-query.sh](scripts/force-knowledge-query.sh)

## 斜杠命令

- `/setup` - 安装配置插件
- `/sync-knowledge [主题] [文件/URL]` - 智能同步知识

## 知识库同步规则

**必须按主题文件夹组织**：
```
knowledge/
├── postgresql-18/          # 主题文件夹
│   └── 2026-02-06-features.md
├── vue-3.5/                # 主题文件夹
│   └── 2026-02-06-guide.md
```

**规则**: ✅ 按主题分文件夹 | ❌ 禁止直接在 knowledge 根目录创建文件

## 环境变量

```bash
ANYTHINGLLM_BASE_URL="http://192.168.3.100:3000/api"
ANYTHINGLLM_API_KEY="your-api-key"
ANYTHINGLLM_WORKSPACE="default-workspace"  # 可选
```

## 关键文件

| 文件 | 说明 |
|------|------|
| [mcp-server/index.js](mcp-server/index.js) | MCP 服务器实现 |
| [commands/setup.md](commands/setup.md) | 安装配置命令 |
| [commands/sync-knowledge.md](commands/sync-knowledge.md) | 同步命令 |
