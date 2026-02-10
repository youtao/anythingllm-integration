#!/bin/bash
#
# force-knowledge-query.sh
#
# PreToolUse Hook: 强制在回答技术问题前查询 AnythingLLM 知识库
#
# 功能：在用户提问技术问题时，自动注入查询 AnythingLLM MCP 的指令
# 触发时机：每次 Claude Code 准备响应之前
#

# 读取用户输入
USER_INPUT=$(cat)

# 配置：需要强制查询的关键词
TECH_KEYWORDS="PostgreSQL|MySQL|数据库|ABP|Vue|React|Angular|前端|\.NET|C#|TypeScript|JavaScript|Python|Java|Go|Rust|Node|Express|Django|Spring|API|REST|GraphQL|Docker|Kubernetes|Git|Linux"

# 检查输入是否包含技术关键词
if echo "$USER_INPUT" | grep -qiE "($TECH_KEYWORDS)"; then

  # 提取主要关键词（用于搜索）
  TOPIC=$(echo "$USER_INPUT" | grep -oEi "($TECH_KEYWORDS)" | head -1)

  # 生成强制查询提示
  cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 检测到技术问题，正在查询 AnythingLLM 知识库...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  重要：在回答此问题前，您必须：

1️⃣  优先使用 @anythingllm_search 搜索知识库
    搜索关键词：$TOPIC

2️⃣  基于检索到的文档片段回答

3️⃣  如果知识库无相关内容，再使用其他搜索方式

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 可用命令：
   @anythingllm_search "$TOPIC 相关问题"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

fi

# 原样传递用户输入
echo "$USER_INPUT"
