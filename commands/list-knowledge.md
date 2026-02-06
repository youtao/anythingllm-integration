---
description: 列出所有知识库主题和文件
model: "sonnet"
---

# /list-knowledge - 列出知识库

## 功能说明

列出所有已同步的知识库主题和文件，提供知识库概览。

## 使用方法

```
/list-knowledge
```

## 执行步骤

1. **扫描目录**
   - 读取 `${CLAUDE_PLUGIN_ROOT}/knowledge/` 目录
   - 识别所有主题文件夹

2. **统计信息**
   - 统计每个主题的文件数量
   - 计算总文件数和主题数
   - 获取最新更新时间

3. **展示列表**
   - 按主题分类显示
   - 显示文件数量和最新文件
   - 提供目录结构预览

## 输出格式

```
📚 AnythingLLM 知识库概览

📁 主题数: 5
📄 总文件数: 23

主题列表:

📂 postgresql-18 (4 个文件)
  ├── 2025-02-06-features.md
  ├── 2025-02-06-performance.md
  ├── 2025-02-06-upgrade.md
  └── 2025-02-06-indexing.md

📂 vue-3.5 (3 个文件)
  ├── 2025-02-06-composition-api.md
  ├── 2025-02-06-reactivity.md
  └── 2025-02-06-components.md

...

最后更新: 2025-02-06 14:30
```

## 注意事项

- 仅显示本地文件系统中的文件
- 不包含 AnythingLLM 中的文档状态
- 文件按主题目录组织
- 可用于快速浏览知识库内容
