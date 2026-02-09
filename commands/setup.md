---
description: 安装 AnythingLLM 插件依赖并配置环境
---

# /setup - 安装和配置

自动安装 AnythingLLM 插件依赖并配置环境。

## 执行流程

### 1. 确定插件位置
- 检查环境变量 `CLAUDE_PLUGIN_ROOT`
- 如果为空，使用当前目录
- 目标：`<插件根目录>/mcp-server/`

### 2. 安装依赖
```bash
cd mcp-server && npm install
```
**验证**：检查 `node_modules/@modelcontextprotocol/sdk` 和 `axios` 存在

### 3. 配置环境变量

**必需变量**：
- `ANYTHINGLLM_BASE_URL` - API 地址（如 `http://192.168.3.100:3000/api`）
- `ANYTHINGLLM_API_KEY` - API 密钥

**可选变量**：
- `ANYTHINGLLM_WORKSPACE` - 默认工作区（默认使用第一个可用工作区）

**配置方式**（选择一种）：
1. **.env 文件**（推荐）：
   ```bash
   cp .env.example .env
   # 编辑 .env 填入配置
   ```

2. **Shell 配置文件**：
   ```bash
   export ANYTHINGLLM_BASE_URL="http://your-server:3000/api"
   export ANYTHINGLLM_API_KEY="your-key"
   ```

### 4. 验证配置

**测试 MCP 工具**：
```bash
# 列出工作区
anythingllm_list_workspaces()
```

**预期结果**：
- 返回工作区列表
- 无连接错误

### 5. 完成确认

向用户报告：
- ✅ 依赖安装完成
- ✅ 环境变量已配置
- ✅ MCP 工具可用（5 个工具）
- ✅ 连接测试成功

## 可用工具

| 工具 | 说明 |
|-----|------|
| `anythingllm_search` | 向量搜索知识库 |
| `anythingllm_list_workspaces` | 列出工作区 |
| `anythingllm_create_workspace` | 创建工作区 |
| `anythingllm_upload_document` | 上传文档 |
| `anythingllm_list_documents` | 列出文档 |

## 错误处理

**npm install 失败**
```bash
npm cache clean --force
npm install --registry=https://registry.npmmirror.com
```

**模块找不到**
- 确认在 `mcp-server/` 目录安装依赖
- 检查 `CLAUDE_PLUGIN_ROOT` 环境变量

**连接失败**
- 检查 `ANYTHINGLLM_BASE_URL` 和 `ANYTHINGLLM_API_KEY`
- 确认 AnythingLLM 服务可访问

**工具不可用**
- 重启 Claude Code
- 运行 `/mcp` 检查服务器状态

## 完成后

安装成功后可以使用：
- `/sync-knowledge` - 同步知识到 AnythingLLM
- MCP 工具 - 直接查询知识库
- 强制查询 - 技术问题自动查询（已配置 Hook）
