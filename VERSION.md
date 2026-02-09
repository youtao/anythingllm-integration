# 版本管理规范

## ⚠️ 强制规范

**每次 release 时必须同步修改以下文件中的版本号**，确保版本一致性。

## 版本号文件位置

| 文件 | 版本号位置 | 用途 |
|------|-----------|------|
| `package.json` | `version` | 项目根版本 |
| `mcp-server/package.json` | `version` | MCP 服务器版本 |
| `.claude-plugin/plugin.json` | `version` | 插件版本 |
| `.claude-plugin/marketplace.json` | `metadata.version` | 市场版本 |
| `.claude-plugin/marketplace.json` | `plugins[0].version` | 插件市场版本 |
| `mcp-server/index.js` | `Server version` | MCP 服务器启动日志 |
| `README.md` | Badge 版本 | 文档展示 |
| `README.md` | "最新版本亮点" | 更新日志 |

## 版本号统一规则

所有文件应使用**相同的版本号**（格式：`x.y.z`）。

**示例**：v1.2.0
- package.json: `"version": "1.2.0"`
- mcp-server/package.json: `"version": "1.2.0"`
- .claude-plugin/plugin.json: `"version": "1.2.0"`
- .claude-plugin/marketplace.json: `"version": "1.2.0"` (两处)
- mcp-server/index.js: `version: '1.2.0'`
- README.md: `version-1.2.0` 和 `v1.2.0`

## Release 检查清单

发布新版本时，按以下顺序检查：

```bash
# 1. 搜索所有版本号
grep -r "1\.[0-9]\+\.[0-9]\+" --include="*.json" --include="*.js" --include="*.md" .

# 2. 确认所有版本号一致

# 3. 更新版本号（示例：升级到 1.3.0）
# - package.json
# - mcp-server/package.json
# - .claude-plugin/plugin.json
# - .claude-plugin/marketplace.json (两处)
# - mcp-server/index.js
# - README.md (两处)

# 4. 提交更改
git add -A
git commit -m "release: v1.3.0"

# 5. 创建 git tag
git tag v1.3.0

# 6. 推送
git push && git push --tags
```

## 版本号命名规则

遵循语义化版本 (Semantic Versioning)：

- **主版本号 (Major)**：不兼容的 API 修改
- **次版本号 (Minor)**：向下兼容的功能性新增
- **修订号 (Patch)**：向下兼容的问题修正

**示例**：
- `1.0.0` → `1.0.1` (Bug 修复)
- `1.0.1` → `1.1.0` (新功能)
- `1.1.0` → `2.0.0` (重大变更)

## 注意事项

1. ⚠️ **不要遗漏**：所有 8 个位置必须同步更新
2. ⚠️ **格式一致**：使用 `x.y.z` 格式，不要加 `v` 前缀（JSON 中）
3. ⚠️ **测试验证**：更新后运行 `grep` 命令验证一致性
4. ⚠️ **Git Tag**：每次 release 必须创建对应的 git tag
