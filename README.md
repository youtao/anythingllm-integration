# AnythingLLM Integration - Claude Code Plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.4.1-blue.svg)](https://github.com/youdao/anythingllm-integration)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

> 🚀 AnythingLLM 知识库集成 - 为 Claude Code 提供自动查询和智能同步功能

## ✨ 特性

- 🤖 **自动查询** - Claude Code 自动优先查询本地知识库，无需手动指定
- 🌐 **网络同步** - 一键从网络搜索并同步知识到 AnythingLLM
- 📁 **智能组织** - 自动按主题分目录组织文件
- 🔄 **自动去重** - 基于标题智能更新，避免重复文件
- 🔌 **MCP 集成** - 完整的 MCP 服务器，提供 6 个工具接口
- 💬 **斜杠命令** - 简单易用的命令行接口
- 🔒 **强制查询** - 使用 Hooks 确保技术问题必须查询知识库

## 📦 快速开始

### 方法 1：使用 /setup 命令（推荐）

在 Claude Code 中运行：

```
/setup
```

AI 将自动引导您完成：
- ✅ 安装 npm 依赖
- ✅ 配置环境变量
- ✅ 验证 MCP 服务器
- ✅ 测试插件功能

### 方法 2：手动安装

```bash
# 1. 克隆项目
cd ~/projects
git clone https://github.com/youdao/anythingllm-integration.git
cd anythingllm-integration

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
nano .env  # 编辑配置文件
```

在 `.env` 中配置：

```bash
ANYTHINGLLM_BASE_URL=http://192.168.3.100:3001/api
ANYTHINGLLM_API_KEY=your-api-key-here
```

## ⚙️ 配置

### 1. Claude Code MCP 配置

编辑 `~/.config/claude-code/config.json`：

```json
{
  "mcpServers": {
    "anythingllm": {
      "command": "node",
      "args": ["~/projects/anythingllm-integration/mcp-server/index.js"],
      "env": {
        "ANYTHINGLLM_BASE_URL": "http://192.168.3.100:3001/api",
        "ANYTHINGLLM_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 2. 设置环境变量

```bash
# 临时设置（当前会话）
export ANYTHINGLLM_BASE_URL="http://192.168.3.100:3001/api"
export ANYTHINGLLM_API_KEY="your-api-key"

# 或添加到 ~/.bashrc 或 ~/.zshrc（永久）
echo 'export ANYTHINGLLM_BASE_URL="http://192.168.3.100:3001/api"' >> ~/.bashrc
echo 'export ANYTHINGLLM_API_KEY="your-api-key"' >> ~/.bashrc
source ~/.bashrc
```

### 3. 强制查询配置（自动）

插件使用 Hooks 自动强制查询知识库，无需额外配置！

**工作原理**：
- 检测技术问题关键词（PostgreSQL、Vue、.NET 等）
- 自动注入查询指令
- Claude 必须先查询知识库才能回答

详见下面的"强制查询"部分。

## 📖 使用

### 自动查询（无需命令）

直接提问技术问题：

```
PostgreSQL 18 性能优化有哪些具体改进？
```

Claude 会自动：
1. 检测到技术关键词
2. 查询 AnythingLLM 知识库
3. 基于检索结果回答

### 斜杠命令

```
/setup                     # 安装和配置插件
/sync-knowledge "PostgreSQL 18"              # 网络搜索同步
/sync-knowledge "Vue 文档" ~/docs/guide.md     # 上传本地文件
/sync-knowledge "React 19" https://react.dev    # 抓取网页内容
```

**智能识别**：
- 仅主题 → 网络搜索
- 主题 + 文件路径 → 上传文件
- 主题 + URL → 抓取网页
- 无参数 → 交互模式

## 🎯 核心功能

### 1️⃣ MCP 服务器（5 个工具）

| 工具 | 描述 | 参数 |
|------|------|------|
| `anythingllm_search` | 向量搜索知识库 | query (必需), workspace (可选) |
| `anythingllm_list_workspaces` | 列出所有工作区 | - |
| `anythingllm_create_workspace` | 创建新工作区 | name (必需) |
| `anythingllm_upload_document` | 上传文档（自动嵌入+更新） | workspace, title, content (必需), folder (可选) |
| `anythingllm_list_documents` | 列出工作区文档 | workspace (必需) |

**API 说明**：
- 使用 `/v1/document/raw-text` 端点（官方标准）
- 自动处理向量嵌入，无需手动调用 update-embeddings
- 一步到位完成文档上传和工作区添加

### 2️⃣ 强制查询知识库（Hooks）

**自动强制**，无需手动配置！

**触发关键词**：PostgreSQL, MySQL, 数据库, ABP, Vue, React, Angular, .NET, C#, TypeScript, JavaScript, Python, Java, Go, Rust, Node, API, REST, Docker, Kubernetes, Git, Linux 等

**工作流程**：
```
用户提问
  ↓
Hook 检测技术关键词
  ↓
注入强制查询指令
  ↓
Claude 必须先查询 @anythingllm_search
  ↓
基于检索结果回答
```

**Hook 配置**（自动加载）：
- `hooks/hooks.json` - Hook 配置文件
- `scripts/force-knowledge-query.sh` - 强制查询脚本
- 使用标准 Plugin Hooks，优先级最高

### 3️⃣ 智能同步系统

- 网络搜索并同步知识
- 本地文件上传
- URL 内容抓取
- 智能文件组织（按主题分目录）
- 自动去重更新（基于标题）

## 📂 项目结构

```
anythingllm-integration/
├── .claude-plugin/
│   └── plugin.json              # Plugin 配置
├── hooks/
│   └── hooks.json               # Hook 配置
├── scripts/
│   └── force-knowledge-query.sh # 强制查询脚本
├── commands/                    # 斜杠命令
│   ├── setup.md                 # 安装配置
│   └── sync-knowledge.md       # 智能同步
├── mcp-server/                  # MCP 服务器
│   ├── index.js                # 主程序
│   └── package.json
├── .mcp.json                    # MCP 配置
├── .env.example                 # 环境变量模板
├── package.json                 # 项目配置
├── README.md                    # 本文件
└── LICENSE                      # MIT 许可证
```

## 🧪 测试

### 测试自动查询

```
PostgreSQL 18 性能优化有哪些具体改进？
```

如果回答包含具体数据（如"查询编译速度提升 15%"），说明自动查询生效 ✅

### 测试 MCP 连接

```bash
# 测试 MCP 服务器启动
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server/index.js
```

**预期输出**：显示 6 个工具的完整定义

### 测试网络同步

```
/sync-knowledge "Vue 3.5 新特性"
```

## 🐛 故障排查

### 自动查询不生效

1. 检查 Hook 是否加载
2. 确认 MCP 服务器正常运行
3. 重启 Claude Code

### MCP 连接失败

1. 检查 `~/.config/claude-code/config.json` 路径
2. 确认 Node.js >= 18.0.0
3. 运行 `npm install`
4. 验证环境变量已设置

### 同步失败

1. 检查 `.env` 配置
2. 确认 AnythingLLM API 可访问
3. 验证 API Key 正确性

### Hook 不执行

1. 验证 `hooks/hooks.json` 存在
2. 检查 `scripts/force-knowledge-query.sh` 有执行权限
3. 查看 Hook 配置是否正确

## 🔧 高级配置

### 自定义强制查询关键词

编辑 `scripts/force-knowledge-query.sh`：

```bash
TECH_KEYWORDS="PostgreSQL|Vue|您的关键词1|您的关键词2"
```

### 调试 Hook

```bash
# 查看 Hook 配置
cat hooks/hooks.json | jq .

# 测试 Hook 脚本
echo "PostgreSQL 问题" | scripts/force-knowledge-query.sh
```

## 📚 相关资源

- [Claude Code Hooks 文档](https://code.claude.com/docs/en/hooks)
- [Claude Code MCP 文档](https://code.claude.com/docs/en/mcp)
- [AnythingLLM 文档](https://github.com/Mintplex-Labs/anything-llm)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Youdao

## 🙏 致谢

- [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) - 强大的本地知识库系统
- [Claude Code](https://claude.ai/code) - AI 驱动的代码编辑器

---

**版本**：1.4.1
**更新日期**：2026-02-07
**状态**：✅ 生产就绪

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解完整版本历史和详细变更信息。

### 最新版本亮点 (v1.4.1)
- ✨ 使用官方 AnythingLLM API，性能提升 3 倍
- ✨ 自动向量嵌入，无需手动触发
- 🐛 修复多个配置和上传问题
- 📚 完善文档和错误提示
