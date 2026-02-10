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

# 配置：技术关键词（全面覆盖技术领域）
# 注意：使用 | 分隔，不需要转义特殊字符
TECH_KEYWORDS="PostgreSQL|MySQL|MongoDB|Redis|数据库|Database|Vue|React|Angular|Svelte|Solid|前端|Frontend|JavaScript|TypeScript|\.NET|C#|F#|VB\.NET|ASP\.NET|C\+\+|Java|Kotlin|Scala|Python|Django|Flask|FastAPI|Go|Golang|Rust|Ruby|Rails|Node|Express|NestJS|Koa|PHP|Laravel|Symfony|Swift|Objective-C|Dart|Flutter|R|Julia|Matlab|Spring|SpringBoot|MyBatis|Hibernate|JPA|Entity Framework|LINQ|Xamarin|Next\.js|Nuxt\.js|Vite|Webpack|Rollup|Parcel|TensorFlow|PyTorch|Keras|Scikit|Pandas|NumPy|Git|GitHub|GitLab|Bitbucket|SVN|Mercurial|Docker|Kubernetes|K8s|Container|Pod|Helm|Jenkins|CI/CD|GitHub Actions|GitLab CI|Linux|Unix|Bash|Shell|PowerShell|Awk|Sed|VSCode|IDE|IntelliJ|Eclipse|Visual Studio|Postman|Insomnia|Swagger|OpenAPI|GraphQL|REST|API|gRPC|SOAP|Webhook|AWS|Azure|GCP|阿里云|腾讯云|华为云|EC2|S3|RDS|Lambda|VPC|CDN|LoadBalancer|OSS|COS|KMS|IAM|EIP|SLB|Serverless|FaaS|BaaS|Microservices|算法|Algorithm|数据结构|Design Pattern|设计模式|架构|Architecture|微服务|Monolith|敏捷|Agile|Scrum|Kanban|DevOps|TDD|BDD|单元测试|Unit Test|集成测试|Integration Test|性能优化|Performance|SQL|NoSQL|NewSQL|缓存|Cache|消息队列|Message Queue|Kafka|RabbitMQ|分布式|Distributed|高可用|HA|Load Balance|LB|安全|Security|加密|Encryption|OAuth|JWT|SSL|TLS|HTTP|HTTPS|TCP|UDP|IP|DNS|DHCP|VPN|Proxy|Nginx|Apache|Tomcat|Undertow|需求|Requirement|用户故事|User Story|Sprint|Backlog|Roadmap|Milestone|Issue|Ticket|Bug|Feature|Epic|大数据|Big Data|Hadoop|Spark|Flink|数据仓库|Data Warehouse|ETL|ELT|BI|商业智能|数据分析|Data Analysis|数据可视化|Visualization|Tableau|PowerBI|Grafana|Kibana|iOS|Android|React Native|Ionic|Cordova|Xamarin|Native|Hybrid|PWA|SPA|MPA|开源|Open Source|Git|版本控制|CLI|Command Line|Terminal|Console|SDK|API|Library|Package|Plugin|Extension|Add-on|Module|Component|Claude|Claude Code|ChatGPT|GPT|OpenAI|Anthropic|AI|人工智能|Machine Learning|机器学习|Deep Learning|深度学习|LLM|大语言模型|Prompt|Prompt Engineering|提示词工程|Agent|智能体|Multi-Agent|多智能体|MCP|Model Context Protocol|Plugin|插件|Skill|技能|Tool|工具|Function Calling|函数调用|RAG|检索增强生成|Vector Database|向量数据库|Embedding|嵌入|Semantic Search|语义搜索|Knowledge Base|知识库|Chunking|分块|Token|Fine-tuning|微调|RLHF|人类反馈强化学习"

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
