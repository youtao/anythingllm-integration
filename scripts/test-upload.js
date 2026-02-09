#!/usr/bin/env node
/**
 * AnythingLLM 文档上传测试脚本
 * 用于验证 API 配置和上传功能
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env 文件
dotenv.config({ path: join(__dirname, '../.env') });

const BASE_URL = process.env.ANYTHINGLLM_BASE_URL || 'http://192.168.3.100:3000/api';
const API_KEY = process.env.ANYTHINGLLM_API_KEY;
const WORKSPACE = process.env.ANYTHINGLLM_WORKSPACE || 'default-workspace';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 构建请求头
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  return headers;
}

// 测试 1: 验证配置
function testConfig() {
  log('\n=== 测试 1: 验证配置 ===', 'blue');

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    log('❌ API Key 未配置或为默认值', 'red');
    log('请在 .env 文件中设置 ANYTHINGLLM_API_KEY', 'yellow');
    return false;
  }

  log(`✅ BASE_URL: ${BASE_URL}`, 'green');
  log(`✅ API_KEY: ${API_KEY.substring(0, 10)}...`, 'green');
  log(`✅ WORKSPACE: ${WORKSPACE}`, 'green');
  return true;
}

// 测试 2: API 连接测试
async function testConnection() {
  log('\n=== 测试 2: API 连接测试 ===', 'blue');

  try {
    const response = await axios.get(`${BASE_URL}/v1/workspaces`, {
      headers: getHeaders(),
      timeout: 10000
    });

    if (response.status === 200) {
      log('✅ API 连接成功', 'green');

      const workspaces = response.data.workspaces || [];
      log(`📁 找到 ${workspaces.length} 个工作区:`, 'blue');

      workspaces.forEach(ws => {
        log(`   - ${ws.name} (${ws.slug})`, 'reset');
      });

      // 检查默认工作区是否存在
      const defaultExists = workspaces.some(ws => ws.slug === WORKSPACE);
      if (!defaultExists) {
        log(`⚠️  警告: 配置的工作区 "${WORKSPACE}" 不存在`, 'yellow');
        if (workspaces.length > 0) {
          log(`   建议使用: ${workspaces[0].slug}`, 'yellow');
        }
      }

      return true;
    }
  } catch (error) {
    log(`❌ API 连接失败: ${error.message}`, 'red');
    if (error.response?.status === 401) {
      log('   原因: API Key 无效', 'red');
    }
    return false;
  }
}

// 测试 3: 上传文档
async function testUpload() {
  log('\n=== 测试 3: 上传测试文档 ===', 'blue');

  const testDoc = {
    title: `test-doc-${Date.now()}.md`,
    content: `# 测试文档

这是一个由 AnythingLLM MCP 测试脚本自动生成的文档。

**创建时间**: ${new Date().toISOString()}

## 测试内容

- 功能: 文档上传测试
- 状态: 进行中
- 目的: 验证 MCP 工具的正常工作

## 技术栈

- AnythingLLM
- MCP Server
- Node.js
`
  };

  try {
    // 步骤 1: 上传文档
    log(`📤 上传文档: ${testDoc.title}`, 'blue');

    const uploadResponse = await axios.post(
      `${BASE_URL}/v1/document/raw-text`,
      {
        textContent: testDoc.content,
        metadata: {
          title: testDoc.title
        }
      },
      {
        headers: getHeaders(),
        timeout: 60000
      }
    );

    if (!uploadResponse.data.success || !uploadResponse.data.documents) {
      log(`❌ 上传失败: ${uploadResponse.data.error || '未知错误'}`, 'red');
      return false;
    }

    const doc = uploadResponse.data.documents[0];
    const docLocation = doc.location;
    log(`✅ 文档上传成功: ${docLocation}`, 'green');
    log(`   - 文档 ID: ${doc.id}`, 'reset');
    log(`   - 标题: ${doc.title}`, 'reset');
    log(`   - 字数: ${doc.wordCount}`, 'reset');

    // 步骤 2: 嵌入到工作区
    log(`🔗 嵌入到工作区: ${WORKSPACE}`, 'blue');

    const embedResponse = await axios.post(
      `${BASE_URL}/v1/workspace/${WORKSPACE}/update-embeddings`,
      { adds: [docLocation] },
      {
        headers: getHeaders(),
        timeout: 60000
      }
    );

    log('✅ 文档嵌入成功', 'green');
    log(`   - 文档位置: ${docLocation}`, 'reset');

    return true;
  } catch (error) {
    log(`❌ 操作失败: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`   详细信息: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// 测试 4: 验证文档已添加
async function testVerify() {
  log('\n=== 测试 4: 验证文档已添加 ===', 'blue');

  try {
    const response = await axios.get(
      `${BASE_URL}/v1/workspace/${WORKSPACE}/documents`,
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );

    const documents = response.data.documents || [];
    log(`📄 工作区中共有 ${documents.length} 个文档`, 'blue');

    // 显示最近添加的文档
    const recentDocs = documents.slice(-5);
    log('\n最近添加的文档:', 'blue');
    recentDocs.forEach(doc => {
      log(`   - ${doc.title} (${doc.publishedAt})`, 'reset');
    });

    return true;
  } catch (error) {
    log(`❌ 验证失败: ${error.message}`, 'red');
    return false;
  }
}

// 主测试流程
async function main() {
  log('\n========================================', 'blue');
  log('  AnythingLLM MCP 上传功能测试', 'blue');
  log('========================================', 'blue');

  const configOk = testConfig();
  if (!configOk) {
    log('\n❌ 配置验证失败，请修复后重试', 'red');
    process.exit(1);
  }

  const connectionOk = await testConnection();
  if (!connectionOk) {
    log('\n❌ API 连接失败，请检查配置', 'red');
    process.exit(1);
  }

  const uploadOk = await testUpload();
  if (!uploadOk) {
    log('\n❌ 文档上传失败', 'red');
    process.exit(1);
  }

  await testVerify();

  log('\n========================================', 'green');
  log('  ✅ 所有测试通过！', 'green');
  log('========================================', 'green');
  log('\n现在你可以使用 Claude Code MCP 工具上传文档了', 'blue');
}

main().catch(error => {
  log(`\n❌ 测试脚本执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
