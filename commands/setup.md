---
description: 安装 AnythingLLM 插件依赖并配置环境
---

# /setup - 安装和配置

## 功能说明

自动安装 AnythingLLM 插件所需的所有依赖，并引导您完成环境配置。

## 执行步骤

### 步骤 1: 安装 npm 依赖

**检测插件安装位置**：

如果通过插件市场安装，插件位于：
```
/home/youtao/.claude/plugins/cache/youtao-claude-plugin-marketplace/anythingllm-integration/1.0.0/
```

如果从源码开发，插件位于：
```
/home/youtao/projects/anythingllm-integration/
```

**自动安装依赖**：

```bash
# 检测插件根目录并安装依赖
if [ -n "$CLAUDE_PLUGIN_ROOT" ]; then
  echo "📦 插件市场安装模式"
  cd "$CLAUDE_PLUGIN_ROOT/mcp-server" && npm install
else
  echo "🔧 源码开发模式"
  cd mcp-server && npm install && cd ..
  npm install
fi
```

**一键安装**（推荐）：
```bash
# 自动检测安装位置
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(pwd)}"
cd "$PLUGIN_ROOT/mcp-server" && npm install
```

**预期输出**：
```
added 30 packages in 3s
```

### 步骤 2: 检查安装

验证所有依赖是否正确安装：

```bash
# 检测插件根目录
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(pwd)}"

# 检查 MCP SDK
test -f "$PLUGIN_ROOT/mcp-server/node_modules/@modelcontextprotocol/sdk/package.json"

# 检查 axios
test -f "$PLUGIN_ROOT/mcp-server/node_modules/axios/package.json"

echo "✅ 依赖安装完成！"
echo "📂 插件位置: $PLUGIN_ROOT"
```

### 步骤 3: 配置环境变量

引导您配置 AnythingLLM 连接信息。

**需要配置的环境变量**：
- `ANYTHINGLLM_BASE_URL` - AnythingLLM API 地址
- `ANYTHINGLLM_API_KEY` - AnythingLLM API 密钥

**配置方式**（选择一种）：

**方式 1：临时环境变量**
```bash
export ANYTHINGLLM_BASE_URL="http://192.168.3.100:3000/api"
export ANYTHINGLLM_API_KEY="your-api-key-here"
```

**方式 2：.env 文件**
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的配置
nano .env
```

**方式 3：Shell 配置文件**
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export ANYTHINGLLM_BASE_URL="http://192.168.3.100:3000/api"
export ANYTHINGLLM_API_KEY="your-api-key-here"
```

### 步骤 4: 验证配置

测试 MCP 服务器是否能正常运行：

```bash
# 使用插件根目录
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(pwd)}"
node "$PLUGIN_ROOT/mcp-server/index.js" &
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node "$PLUGIN_ROOT/mcp-server/index.js"
```

**预期输出**：
```
AnythingLLM MCP 配置: http://192.168.3.100:3000/api
AnythingLLM MCP 服务器已启动 v2.0.0
{"result":{"tools":[...]}}
```

### 步骤 5: 安装插件

如果还未安装插件，运行：

```bash
# 本地安装（推荐用于开发）
claude plugin install /home/youtao/projects/anythingllm-integration --scope local

# 或全局安装
claude plugin install /home/youtao/projects/anythingllm-integration --scope global
```

### 步骤 6: 验证安装

在 Claude Code 中运行以下命令验证：

```
/mcp                    # 查看 MCP 服务器列表
/list-knowledge         # 查看知识库（如果有）
```

**预期结果**：
- `/mcp` 显示 `anythingllm` 服务器
- 显示 6 个可用工具

## 注意事项

- ⚠️ **必须先安装依赖**：MCP 服务器需要 `@modelcontextprotocol/sdk`
- ⚠️ **必须配置环境变量**：否则无法连接到 AnythingLLM
- ⚠️ **重启 Claude Code**：安装插件后需要重启才生效

## 故障排查

### 问题 1：npm install 失败

**症状**：`npm install` 报错

**解决方案**：
```bash
# 清理缓存重试
npm cache clean --force
npm install

# 或使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### 问题 2：MCP 服务器无法启动

**症状**：`Cannot find module '@modelcontextprotocol/sdk'`

**原因**：在错误的目录安装了依赖

**解决方案**：
```bash
# 确认插件安装位置
echo "插件根目录: ${CLAUDE_PLUGIN_ROOT:-$(pwd)}"

# 在正确的位置安装依赖
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(pwd)}"
cd "$PLUGIN_ROOT/mcp-server" && npm install
```

### 问题 3：环境变量未生效

**症状**：无法连接到 AnythingLLM

**解决方案**：
```bash
# 检查环境变量
echo $ANYTHINGLLM_BASE_URL
echo $ANYTHINGLLM_API_KEY

# 如果为空，重新设置
export ANYTHINGLLM_BASE_URL="http://your-server:3000/api"
export ANYTHINGLLM_API_KEY="your-key"
```

### 问题 4：Hook 不生效

**症状**：技术问题不强制查询

**解决方案**：
1. 检查 plugin.json 中的 hooks 引用
2. 确认 hooks/hooks.json 文件存在
3. 重启 Claude Code

## 完成后

安装成功后，您可以：

- ✅ 使用 6 个 MCP 工具查询 AnythingLLM 知识库
- ✅ 使用 `/sync-knowledge` 同步知识
- ✅ 技术问题时自动强制查询

## 相关文档

- [README.md](./README.md) - 项目概述
- [INSTALL.md](./INSTALL.md) - 详细安装指南
- [HOOKS.md](./HOOKS.md) - Hook 配置说明
