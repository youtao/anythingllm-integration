# AnythingLLM MCP Server

MCP Server for AnythingLLM integration - 支持 PDF、Word、图片等多种文件格式上传

## 安装

### 通过 npx 使用（推荐）

无需手动安装，直接在 `.mcp.json` 中配置即可使用：

```json
{
  "mcpServers": {
    "anythingllm": {
      "command": "npx",
      "args": ["-y", "@youtao/anythingllm-mcp-server"],
      "env": {
        "ANYTHINGLLM_BASE_URL": "http://your-server:3000/api",
        "ANYTHINGLLM_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 全局安装

```bash
npm install -g @youtao/anythingllm-mcp-server
```

## 配置

### 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `ANYTHINGLLM_BASE_URL` | ✅ | AnythingLLM API 地址 |
| `ANYTHINGLLM_API_KEY` | ✅ | API 密钥 |
| `ANYTHINGLLM_WORKSPACE` | ❌ | 默认工作区（可选） |

### Claude Code MCP 配置

在 `.mcp.json` 或 Claude Code 的 MCP 配置中添加：

```json
{
  "mcpServers": {
    "anythingllm": {
      "command": "npx",
      "args": ["-y", "@youtao/anythingllm-mcp-server"],
      "env": {
        "ANYTHINGLLM_BASE_URL": "http://your-server:3000/api",
        "ANYTHINGLLM_API_KEY": "your-api-key"
      }
    }
  }
}
```

**环境变量引用**（推荐）：在系统环境变量中设置，然后使用 `${VARIABLE_NAME}` 引用：

```json
"env": {
  "ANYTHINGLLM_BASE_URL": "${ANYTHINGLLM_BASE_URL}",
  "ANYTHINGLLM_API_KEY": "${ANYTHINGLLM_API_KEY}"
}
```

## 功能

### MCP 工具

| 工具 | 说明 |
|------|------|
| `anythingllm_search` | 向量搜索知识库 |
| `anythingllm_list_workspaces` | 列出所有工作区 |
| `anythingllm_create_workspace` | 创建新工作区 |
| `anythingllm_upload_document` | 上传文档（PDF、Word、图片等） |
| `anythingllm_list_documents` | 列出工作区文档 |

### 支持的文件格式

- PDF 文档
- Word 文档
- 图片
- 纯文本文件
- Markdown 文件

## 使用示例

```bash
# 直接运行（需要先设置环境变量）
export ANYTHINGLLM_BASE_URL="http://localhost:3000/api"
export ANYTHINGLLM_API_KEY="your-api-key"
anythingllm-mcp-server
```

## 项目主页

- GitHub: https://github.com/youtao/anythingllm-integration
- Issues: https://github.com/youtao/anythingllm-integration/issues

## 许可证

MIT
