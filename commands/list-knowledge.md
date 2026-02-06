---
description: 列出 AnythingLLM 中的所有工作区
model: "sonnet"
---

# /list-knowledge - 列出工作区

## 功能说明

列出 AnythingLLM 中的所有工作区，显示知识库概览。**注意**：此命令调用 AnythingLLM API 获取实际工作区列表，而不是读取本地文件。

## 使用方法

```
/list-knowledge
```

## 执行步骤

1. **调用 AnythingLLM API**
   - 使用 `anythingllm_list_workspaces` MCP 工具
   - 从 AnythingLLM 服务器获取工作区列表

2. **展示工作区信息**
   - 显示工作区名称和 slug
   - 显示创建时间和最后活动时间
   - 统计工作区数量

## 输出格式

```
📚 AnythingLLM 工作区列表

📁 工作区数: 5

工作区列表:

📂 PostgreSQL 知识库 (slug: postgresql-kb)
  创建时间: 2025-02-01 10:30
  最后活动: 2025-02-06 14:30

📂 Vue 3 文档 (slug: vue3-docs)
  创建时间: 2025-02-03 09:15
  最后活动: 2025-02-06 11:20

📂 React 19 更新 (slug: react19-updates)
  创建时间: 2025-02-05 16:45
  最后活动: 2025-02-06 08:50

...

最后同步: 2025-02-06 14:30
```

## 与本地文件的区别

| 类型 | 数据源 | 用途 |
|------|--------|------|
| **本命令** | AnythingLLM API | 查看服务器上的工作区状态 |
| 本地 knowledge/ | 文件系统 | 查看本地缓存的文档 |

## 注意事项

- ⚠️ 显示的是 AnythingLLM 服务器上的工作区，不是本地文件
- 需要确保已配置 AnythingLLM API 连接
- 工作区按创建时间倒序排列
- 可用于快速浏览已创建的知识库工作区

## 相关命令

- `/sync-knowledge` - 同步知识到指定工作区
- `/setup` - 配置 AnythingLLM API 连接
