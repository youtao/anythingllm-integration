#!/bin/bash
#
# smart-knowledge-query-suggestion.sh
#
# PreToolUse Hook: 智能知识库查询建议
#
# 功能：检测技术问题时，智能建议查询 AnythingLLM 知识库
# 触发时机：每次 Claude Code 准备响应之前
# 模式：建议模式（非强制），让 AI 自主决定是否查询
#

# 读取用户输入
USER_INPUT=$(cat)

# 配置：技术关键词（用于检测可能需要查询知识库的问题）
TECH_KEYWORDS="PostgreSQL|MySQL|数据库|ABP|Vue|React|Angular|前端|\.NET|C#|TypeScript|JavaScript|Python|Java|Go|Rust|Node|Express|Django|Spring|API|REST|GraphQL|Docker|Kubernetes|Git|Linux"

# 检查输入是否包含技术关键词
if echo "$USER_INPUT" | grep -qiE "($TECH_KEYWORDS)"; then

  # 提取主要关键词（用于搜索建议）
  TOPIC=$(echo "$USER_INPUT" | grep -oEi "($TECH_KEYWORDS)" | head -1)

  # 生成智能建议提示
  cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 检测到技术问题：$TOPIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 建议：可以先查询 AnythingLLM 知识库，获取准确信息

使用命令：
   @anythingllm_search "$TOPIC 相关问题"

如果知识库没有相关内容，您可以使用其他方式回答。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

fi

# 原样传递用户输入
echo "$USER_INPUT"
