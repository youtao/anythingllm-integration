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

# 配置：技术关键词（按类别分组，使用数组便于维护）
keyword_array=(
  # 数据库
  "PostgreSQL|MySQL|MongoDB|Redis|数据库|Database"
  # 前端
  "Vue|React|Angular|Svelte|Solid|前端|Frontend|JavaScript|TypeScript"
  # 后端 - .NET
  "\.NET|C#|F#|VB\.NET|ASP\.NET|C\+\+"
  # 后端 - Java
  "Java|Kotlin|Scala|Spring|SpringBoot|MyBatis|Hibernate|JPA"
  # 后端 - Python
  "Python|Django|Flask|FastAPI|TensorFlow|PyTorch|Keras|Scikit|Pandas|NumPy"
  # 后端 - Go
  "Go|Golang|Rust"
  # 后端 - Node.js
  "Node|Express|NestJS|Koa"
  # 后端 - PHP
  "PHP|Laravel|Symfony"
  # 移动端
  "Swift|Objective-C|Dart|Flutter|R|Julia|Matlab|iOS|Android|React Native|Ionic|Cordova|Xamarin|Native|Hybrid|PWA|SPA|MPA"
  # 开发工具 - 版本控制
  "Git|GitHub|GitLab|Bitbucket|SVN|Mercurial|开源|Open Source"
  # 开发工具 - 容器化
  "Docker|Kubernetes|K8s|Container|Pod|Helm"
  # 开发工具 - CI/CD
  "Jenkins|CI/CD|GitHub Actions|GitLab CI"
  # 开发工具 - 操作系统
  "Linux|Unix|Bash|Shell|PowerShell|Awk|Sed|CLI|Command Line|Terminal|Console"
  # 开发工具 - IDE
  "VSCode|IDE|IntelliJ|Eclipse|Visual Studio"
  # 开发工具 - API
  "Postman|Insomnia|Swagger|OpenAPI|GraphQL|REST|API|gRPC|SOAP|Webhook"
  # 云平台 - 国际
  "AWS|Azure|GCP|EC2|S3|RDS|Lambda|VPC|CDN|LoadBalancer"
  # 云平台 - 国内
  "阿里云|腾讯云|华为云|OSS|COS|KMS|IAM|EIP|SLB"
  # 云原生
  "Serverless|FaaS|BaaS|Microservices"
  # 算法与架构
  "算法|Algorithm|数据结构|Design Pattern|设计模式|架构|Architecture|微服务|Monolith"
  # 项目管理
  "敏捷|Agile|Scrum|Kanban|DevOps|TDD|BDD|需求|Requirement|用户故事|User Story|Sprint|Backlog|Roadmap|Milestone|Issue|Ticket|Bug|Feature|Epic"
  # 测试
  "单元测试|Unit Test|集成测试|Integration Test"
  # 性能与运维
  "性能优化|Performance|SQL|NoSQL|NewSQL|缓存|Cache|消息队列|Message Queue|Kafka|RabbitMQ|分布式|Distributed|高可用|HA|Load Balance|LB"
  # 安全
  "安全|Security|加密|Encryption|OAuth|JWT|SSL|TLS|HTTP|HTTPS|TCP|UDP|IP|DNS|DHCP|VPN|Proxy|Nginx|Apache|Tomcat|Undertow"
  # 大数据
  "大数据|Big Data|Hadoop|Spark|Flink|数据仓库|Data Warehouse|ETL|ELT|BI|商业智能|数据分析|Data Analysis|数据可视化|Visualization|Tableau|PowerBI|Grafana|Kibana"
  # 开发通用
  "\.NET|Entity Framework|LINQ|Xamarin|Next\.js|Nuxt\.js|Vite|Webpack|Rollup|Parcel"
  # AI/LLM - Claude 系列
  "Claude|Claude Code|ChatGPT|GPT|OpenAI|Anthropic"
  # AI/LLM - 基础概念
  "AI|人工智能|Machine Learning|机器学习|Deep Learning|深度学习|LLM|大语言模型|Token"
  # AI/LLM - Prompt
  "Prompt|Prompt Engineering|提示词工程"
  # AI/LLM - Agent
  "Agent|智能体|Multi-Agent|多智能体|Function Calling|函数调用"
  # AI/LLM - 架构
  "RAG|检索增强生成|Vector Database|向量数据库|Embedding|嵌入|Semantic Search|语义搜索|Knowledge Base|知识库|Chunking|分块"
  # AI/LLM - 训练
  "Fine-tuning|微调|RLHF|人类反馈强化学习"
  # AI/LLM - 开发工具
  "MCP|Model Context Protocol|Plugin|插件|Skill|技能|Tool|工具|SDK|API|Library|Package|Extension|Add-on|Module|Component"
)

# 将数组合并为正则表达式（用换行符连接，然后替换为 |）
TECH_KEYWORDS=$(IFS=$'\n'; echo "${keyword_array[*]}" | tr '\n' '|')

# 检查输入是否包含技术关键词
if echo "$USER_INPUT" | grep -qiE "($TECH_KEYWORDS)"; then

  # 提取主要关键词（用于搜索建议）
  TOPIC=$(echo "$USER_INPUT" | grep -oEi "($TECH_KEYWORDS)" | head -1)

  # 确保提取到了有效关键词才显示建议
  if [ -n "$TOPIC" ]; then
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

fi

# 原样传递用户输入
echo "$USER_INPUT"
