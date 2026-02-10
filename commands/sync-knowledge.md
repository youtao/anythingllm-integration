---
description: 智能同步知识库 - 支持网络搜索、文件上传、URL 抓取
argument-hint: [topic] [file-or-url]
model: "sonnet"
---

# /sync-knowledge - 智能同步知识库

统一的同步命令，支持三种方式同步知识到 AnythingLLM：
- 🌐 **网络搜索** - 使用 WebSearch 搜索并同步最新内容
- 📁 **本地文件** - 上传本地文档
- 🔗 **URL 抓取** - 抓取网页内容

## 使用方法

```
/sync-knowledge [主题] [文件路径或URL]
```

### 场景

**网络搜索（默认）**
```
/sync-knowledge "PostgreSQL 18 新特性"
```

**本地文件**
```
/sync-knowledge "Vue 文档" ~/docs/guide.md
```

**URL 抓取**
```
/sync-knowledge "React 19" https://react.dev/blog/react-19
```

**交互模式**
```
/sync-knowledge
```

## 执行流程

### 1. 确定工作区
- 调用 `anythingllm_list_workspaces`
- 为空则调用 `anythingllm_create_workspace <主题>`
- 使用第一个工作区或用户指定的

### 2. 分析输入参数
- 无参数：询问同步方式
- 是 URL：识别为 URL 抓取
- 是文件路径：识别为文件上传
- 只有主题：执行网络搜索

### 3. 执行同步
- 整理内容为 Markdown 格式
- 在文件顶部添加元数据（日期、来源等）
- **必须按主题分文件夹**：`knowledge/<主题>/<简洁文件名>.md`
- 调用 `anythingllm_upload_document` 上传（**必须传递 `folder` 参数**）

### 4. 验证完成
- **根据 `anythingllm_upload_document` 返回结果判断是否成功**：
  - `success: true` → 上传成功
  - `success: false` → 上传失败，报告 `error` 信息
- 调用 `anythingllm_search "<主题关键词>" <workspace>` 测试搜索
- 向用户报告：保存位置、工作区、搜索结果

**注意**：不再调用 `anythingllm_list_documents` 进行冗余校验

## 文件组织规则

```
knowledge/
├── postgresql-18/          # 主题文件夹
│   ├── features.md
│   └── performance.md
├── vue-3.5/                # 主题文件夹
│   └── guide.md
└── react-19/               # 主题文件夹
    └── blog.md
```

**规则**：
- ✅ 必须按主题创建子文件夹
- ✅ 文件名简洁明了（不含日期）
- ✅ 版本信息（日期、来源）放在文件内容顶部
- ❌ 禁止直接在 knowledge 根目录创建文件

## 文件内容格式

每个文件应包含以下元数据头部：

```markdown
---
title: "文档标题"
date: "2026-02-10"
source: "网络搜索/URL抓取/本地文件"
keywords: ["关键词1", "关键词2"]
---

# 文档内容

...
```

**示例**：

网络搜索获取的内容：
```markdown
---
title: "PostgreSQL 18 性能优化"
date: "2026-02-10"
source: "网络搜索"
query: "PostgreSQL 18 性能优化 最新 特性"
url: "https://..."
---

# PostgreSQL 18 性能优化
...
```

URL 抓取的内容：
```markdown
---
title: "React 19 更新说明"
date: "2026-02-10"
source: "URL 抓取"
url: "https://react.dev/blog/react-19"
---

# React 19
...
```

## MCP 工具调用

| 工具 | 参数 | 说明 |
|-----|------|------|
| `anythingllm_list_workspaces` | - | 获取可用工作区 |
| `anythingllm_create_workspace` | `name` | 创建新工作区 |
| `anythingllm_upload_document` | `workspace`, `filePath`, `title`, `folder` (必需) | 上传文档 |
| `anythingllm_search` | `query`, `workspace` | 搜索知识库 |

**重要说明**：
- `anythingllm_upload_document` 的 `folder` 参数是**必需的**，用于按主题组织文档
- 不再使用 `anythingllm_list_documents` 进行校验，直接根据上传返回的 `success` 字段判断

## 错误处理

**上传失败**
- 检查 `anythingllm_upload_document` 返回的 `success` 字段
- 如果 `success: false`，报告返回的 `error` 信息
- 检查 API 密钥和连接状态

**工作区不存在**
- 自动创建工作区或使用第一个可用工作区

**搜索失败但上传成功**
- 告知文档已保存（根据 `success: true` 确认）
- 搜索暂时不可用，但文档已成功嵌入

## 示例

### 网络搜索
```
/sync-knowledge "PostgreSQL 18 性能优化"
```
1. 搜索 "PostgreSQL 18 性能优化 最新 特性 2025"
2. 创建 `knowledge/postgresql-18-performance/`
3. 保存到 `knowledge/postgresql-18-performance/optimization.md`
   - 文件顶部包含：日期、搜索关键词、来源链接
4. 调用 `anythingllm_upload_document`:
   - `workspace`: "woyo"
   - `filePath`: "knowledge/postgresql-18-performance/optimization.md"
   - `title`: "PostgreSQL 18 性能优化"
   - `folder`: "postgresql-18-performance" (必需)
5. 检查返回的 `success` 字段确认上传成功
6. 搜索验证

### 本地文件
```
/sync-knowledge "Vue 指南" ~/docs/vue3-guide.md
```
1. 读取文件
2. 创建 `knowledge/vue-guide/`
3. 保存到 `knowledge/vue-guide/guide.md`
   - 保留原标题和内容
4. 调用 `anythingllm_upload_document`:
   - `workspace`: "woyo"
   - `filePath`: "knowledge/vue-guide/guide.md"
   - `title`: "Vue 3 指南"
   - `folder`: "vue-guide" (必需)
5. 检查返回的 `success` 字段确认上传成功
6. 搜索验证

### URL 抓取
```
/sync-knowledge "React 19" https://react.dev/blog/react-19
```
1. 抓取网页
2. 创建 `knowledge/react-19/`
3. 保存到 `knowledge/react-19/blog.md`
   - 文件顶部包含：日期、来源 URL
4. 调用 `anythingllm_upload_document`:
   - `workspace`: "woyo"
   - `filePath`: "knowledge/react-19/blog.md"
   - `title`: "React 19 更新说明"
   - `folder`: "react-19" (必需)
5. 检查返回的 `success` 字段确认上传成功
6. 搜索验证
