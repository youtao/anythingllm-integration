---
description: 智能同步知识库 - 支持网络搜索、文件上传、URL 抓取
argument-hint: [topic] [file-or-url]
model: "sonnet"
---

# /sync-knowledge - 智能同步知识库

## 功能说明

统一的同步命令，支持三种方式同步知识到 AnythingLLM：
- 🌐 **网络搜索** - 自动搜索并同步最新内容
- 📁 **本地文件** - 上传本地文档
- 🔗 **URL 抓取** - 抓取网页内容

## 使用方法

```
/sync-knowledge [主题] [文件路径或URL]
```

### 使用场景

**场景 1：网络搜索（默认）**
```
/sync-knowledge "PostgreSQL 18 新特性"
```
AI 将自动搜索网络并同步内容

**场景 2：本地文件**
```
/sync-knowledge "Vue 文档" ~/docs/guide.md
```
AI 将读取并上传本地文件

**场景 3：URL 抓取**
```
/sync-knowledge "React 19" https://react.dev/blog/react-19
```
AI 将抓取网页内容并同步

**场景 4：无参数（交互模式）**
```
/sync-knowledge
```
AI 将询问您想要同步什么

## 执行流程

当您执行 `/sync-knowledge` 命令时，AI 会：

1. **分析输入参数**
   - 如果没有参数：询问同步方式
   - 如果是 URL：自动识别为 URL 抓取
   - 如果是文件路径：自动识别为文件上传
   - 如果只有主题：执行网络搜索

2. **确认同步内容**
   - 显示将要同步的内容摘要
   - 等待您确认

3. **执行同步**
   - 整理内容为 Markdown 格式
   - 保存到 `knowledge/<主题>/` 目录
   - 上传到 AnythingLLM 知识库

4. **返回结果**
   - 显示文件保存位置
   - 确认上传状态

## 参数说明

### 主题（topic）
- 用于组织知识库目录
- 示例：PostgreSQL 18、Vue 3.5、React 19
- 如果不提供，将根据内容自动生成

### 文件路径或 URL（可选）
- **文件路径**：支持相对路径和绝对路径
  - 示例：`~/docs/guide.md`、`./tutorial.md`
- **URL**：支持 HTTP/HTTPS 链接
  - 示例：`https://vuejs.org/guide/`

## 示例

### 示例 1：网络搜索

```
/sync-knowledge "PostgreSQL 18 性能优化"
```

AI 执行流程：
1. 搜索 "PostgreSQL 18 性能优化 最新 特性 2025"
2. 整理为结构化 Markdown
3. 保存到 `knowledge/postgresql-18-performance/2026-02-06-优化.md`
4. 上传到 AnythingLLM

### 示例 2：上传本地文件

```
/sync-knowledge "Vue 指南" ~/docs/vue3-guide.md
```

AI 执行流程：
1. 读取 `~/docs/vue3-guide.md`
2. 提取标题和内容
3. 保存到 `knowledge/vue-guide/vue3-guide.md`
4. 上传到 AnythingLLM

### 示例 3：抓取 URL

```
/sync-knowledge "React 19" https://react.dev/blog/react-19
```

AI 执行流程：
1. 抓取网页内容
2. 转换为 Markdown 格式
3. 保存到 `knowledge/react-19/react-19-blog.md`
4. 上传到 AnythingLLM

### 示例 4：交互模式

```
/sync-knowledge
```

AI 会询问：
> 您想要同步什么内容？
>
> 1. 🌐 从网络搜索
> 2. 📁 上传本地文件
> 3. 🔗 抓取网页内容
>
> 请输入选项或直接描述您的需求

## 智能识别规则

AI 会自动判断您的意图：

| 输入内容 | 识别为 | 操作 |
|---------|--------|------|
| `主题`（无其他参数） | 网络搜索 | 搜索主题相关内容 |
| `主题 ~/path/file.md` | 本地文件 | 读取并上传文件 |
| `主题 https://...` | URL 抓取 | 抓取网页内容 |
|（无参数）| 交互模式 | 询问用户意图 |

## 文件组织

同步的内容会自动保存到：

```
knowledge/
├── postgresql-18/
│   └── 2026-02-06-features.md
├── vue-3.5/
│   └── 2026-02-06-guide.md
└── react-19/
    └── 2026-02-06-blog.md
```

- 按主题分目录组织
- 文件名包含日期和标题
- 相同标题的文件会自动更新

## 注意事项

### 网络搜索
- 依赖 Tavily 搜索引擎
- 搜索结果会整理为结构化文档
- 自动提取关键信息和代码示例

### 本地文件
- 支持 Markdown、TXT、PDF 格式
- 确保文件路径正确且可访问
- 大文件处理需要较长时间

### URL 抓取
- 目标网站必须可访问
- 某些网站有反爬虫限制
- 动态加载内容可能无法抓取

### 通用规则
- 确保已配置 AnythingLLM API
- 相同标题的文件会更新而非创建新文件
- 知识库自动向量化处理
- 可使用 `/list-knowledge` 查看已同步内容

## 相关命令

- `/list-knowledge` - 列出所有已同步的知识库内容
