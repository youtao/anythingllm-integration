#!/bin/bash
#
# check-config.sh
#
# 检查 AnythingLLM 配置是否正确
#

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_config() {
  echo "🔍 检查 AnythingLLM 配置..."
  echo ""

  # 检查环境变量
  if [ -z "$ANYTHINGLLM_BASE_URL" ]; then
    echo -e "${YELLOW}⚠️  ANYTHINGLLM_BASE_URL 未设置${NC}"
    echo "   使用默认值: http://localhost:3000/api"
    export ANYTHINGLLM_BASE_URL="http://localhost:3000/api"
  else
    echo -e "${GREEN}✅ ANYTHINGLLM_BASE_URL: $ANYTHINGLLM_BASE_URL${NC}"
  fi

  if [ -z "$ANYTHINGLLM_API_KEY" ] || [ "$ANYTHINGLLM_API_KEY" = "YOUR_API_KEY_HERE" ]; then
    echo -e "${RED}❌ ANYTHINGLLM_API_KEY 未设置或使用占位符${NC}"
    echo "   请设置: export ANYTHINGLLM_API_KEY=\"your-api-key\""
    return 1
  else
    # 只显示前10个字符
    API_KEY_PREVIEW="${ANYTHINGLLM_API_KEY:0:10}..."
    echo -e "${GREEN}✅ ANYTHINGLLM_API_KEY: $API_KEY_PREVIEW${NC}"
  fi

  # 测试连接
  echo ""
  echo "🔌 测试连接到 AnythingLLM..."

  response=$(curl -s -o /dev/null -w "%{http_code}" \
    "$ANYTHINGLLM_BASE_URL/v1/workspaces" \
    -H "Authorization: Bearer $ANYTHINGLLM_API_KEY" \
    -H "Content-Type: application/json" \
    --max-time 5)

  if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ 连接成功!${NC}"

    # 获取工作区列表
    echo ""
    echo "📁 可用工作区:"
    workspaces=$(curl -s "$ANYTHINGLLM_BASE_URL/v1/workspaces" \
      -H "Authorization: Bearer $ANYTHINGLLM_API_KEY" \
      -H "Content-Type: application/json" \
      --max-time 5)

    echo "$workspaces" | grep -o '"slug":"[^"]*"' | sed 's/"slug":"\([^"]*\)"/  - \1/' || echo "  (无工作区)"

    return 0
  elif [ "$response" = "401" ]; then
    echo -e "${RED}❌ 认证失败 (401), API 密钥可能无效${NC}"
    return 1
  elif [ "$response" = "000" ]; then
    echo -e "${RED}❌ 无法连接到服务器: $ANYTHINGLLM_BASE_URL${NC}"
    echo "   请检查 AnythingLLM 服务是否正在运行"
    return 1
  else
    echo -e "${RED}❌ 连接失败 (HTTP $response)${NC}"
    return 1
  fi
}

check_config
