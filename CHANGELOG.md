# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-07

### Added
- ✨ 使用官方 AnythingLLM `/v1/document/raw-text` API 端点
- ✨ 自动向量嵌入 - 通过 `addToWorkspaces` 参数自动触发
- ✨ 详细的文档上传返回信息（id, location, wordCount, tokenCount）
- ✨ 配置验证和健康检查 - 启动时验证 API 连接
- ✨ 辅助函数 - `getHeaders()`, `handleApiError()`, `validateConfig()`
- ✨ 文档更新 - 添加 API 架构说明

### Changed
- 🔄 **重大更新**：重构 `uploadDocument` 函数使用官方 API 标准
- 🔄 简化文档上传流程 - 从 3 步减少到 1 步
- 🔄 优化默认配置 - 使用 `localhost:3000` 替代硬编码内网地址
- 🔄 改进错误处理 - 详细的错误分类和提示信息

### Fixed
- 🐛 修复文档上传 API 端点不正确的问题
- 🐛 修复向量嵌入需要手动触发的问题
- 🐛 修复配置默认值使用内网地址的问题
- 🐛 修复缺少请求超时配置的问题

### Removed
- ❌ 移除非标准的三步上传流程（remove → upload → update-embeddings）
- ❌ 移除手动调用 `update-embeddings` 的代码

### Technical Details
- **API 端点变更**：
  - 旧：`/v1/workspace/{slug}/upload` (非标准)
  - 新：`/v1/document/raw-text` (官方标准)
- **网络请求优化**：
  - 旧：3 次 API 调用
  - 新：1 次 API 调用
- **代码改进**：
  - 从 64 行减少到 40 行
  - 更好的错误处理和返回信息

### Migration Notes
如果你之前使用了自定义的文档上传流程，升级到 v1.2.0 后：
1. 无需修改调用方式 - MCP 工具接口保持兼容
2. 上传速度会更快 - 减少了网络往返次数
3. 返回信息更丰富 - 现在包含文档的详细统计信息

## [1.1.0] - 2026-02-06

### Added
- ✨ 初始版本发布
- ✅ 6 个 MCP 工具（搜索、聊天、工作区管理、文档上传）
- ✅ 3 个斜杠命令（setup, sync-knowledge, list-knowledge）
- ✅ PreToolUse Hook 强制查询知识库
- ✅ GitHub 插件市场支持
- ✅ 配置验证和健康检查

### Bug Fixes
- 🐛 修复 setup 命令支持插件市场安装
- 🐛 修复 sync-knowledge 强制文档分组
- 🐛 修复 list-knowledge 调用 API 而非读取本地文件

### Documentation
- 📝 完善所有命令文档
- 📝 添加环境变量配置说明
- 📝 添加故障排查指南

---

## Version Reference

- [1.2.0] - https://github.com/youtao/anythingllm-integration/releases/tag/v1.2.0
- [1.1.0] - https://github.com/youtao/anythingllm-integration/releases/tag/v1.1.0
