#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';

// 从环境变量读取配置
const CONFIG = {
  baseURL: process.env.ANYTHINGLLM_BASE_URL || 'http://localhost:3000/api',
  apiKey: process.env.ANYTHINGLLM_API_KEY || null,
  workspaceSlug: process.env.ANYTHINGLLM_WORKSPACE || null,
};

// ==================== 辅助函数 ====================

// 构建请求头
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (CONFIG.apiKey) {
    headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
  }
  return headers;
}

// 处理 API 错误，返回详细错误信息
function handleApiError(error, context) {
  let message = `${context}失败`;

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      message = 'API 密钥无效或已过期';
    } else if (status === 404) {
      message = '资源不存在';
    } else if (status >= 500) {
      message = 'AnythingLLM 服务器错误';
    } else {
      message = data?.message || error.message;
    }
  } else if (error.code === 'ECONNREFUSED') {
    message = '无法连接到 AnythingLLM 服务器';
  } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
    message = '请求超时';
  } else {
    message = error.message;
  }

  return message;
}

// 验证配置
function validateConfig() {
  const errors = [];

  if (!CONFIG.baseURL) {
    errors.push('缺少 ANYTHINGLLM_BASE_URL 环境变量');
  }

  if (!CONFIG.apiKey || CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    errors.push('缺少或未配置 ANYTHINGLLM_API_KEY');
  }

  if (errors.length > 0) {
    console.error('❌ 配置错误:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\n请设置以下环境变量:');
    console.error('  export ANYTHINGLLM_BASE_URL="http://your-server:3000/api"');
    console.error('  export ANYTHINGLLM_API_KEY="your-api-key"');
    throw new Error('配置验证失败');
  }
}

// 健康检查 - 验证 API 可达性和密钥有效性
async function healthCheck() {
  try {
    const response = await axios.get(`${CONFIG.baseURL}/v1/workspaces`, {
      headers: getHeaders(),
      timeout: 5000
    });

    if (response.status === 200) {
      console.error('✅ AnythingLLM API 连接成功');
      return true;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ API 密钥无效 (401 Unauthorized)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`❌ 无法连接到 AnythingLLM: ${CONFIG.baseURL}`);
    } else {
      console.error('❌ 健康检查失败:', error.message);
    }
    throw new Error('健康检查失败');
  }
}

console.error(`AnythingLLM MCP 配置: ${CONFIG.baseURL}`);

// ==================== 辅助函数 ====================

// 验证文件路径
async function validateFilePath(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const stats = await fs.stat(absolutePath);

    if (!stats.isFile()) {
      throw new Error('路径不是一个文件');
    }

    return {
      success: true,
      absolutePath,
      size: stats.size,
      exists: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      exists: false
    };
  }
}

// 获取 MIME 类型
function getMimeType(filePath) {
  return mime.lookup(filePath) || 'application/octet-stream';
}

// ==================== 核心 API 函数 ====================

// 获取工作区列表
async function getWorkspaces() {
  try {
    const response = await axios.get(`${CONFIG.baseURL}/v1/workspaces`, {
      headers: getHeaders(),
      timeout: 10000
    });
    return { success: true, workspaces: response.data.workspaces || [] };
  } catch (error) {
    const message = handleApiError(error, '获取工作区');
    return { success: false, error: message };
  }
}

// 创建工作区
async function createWorkspace(name) {
  try {
    const response = await axios.post(
      `${CONFIG.baseURL}/v1/workspaces/new`,
      { name },
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );

    return {
      success: true,
      workspace: response.data.workspace
    };
  } catch (error) {
    const message = handleApiError(error, '创建工作区');
    return { success: false, error: message };
  }
}

// 查找工作区中指定标题的文档
async function findDocumentByTitle(workspaceSlug, title) {
  try {
    const response = await axios.get(
      `${CONFIG.baseURL}/v1/workspace/${workspaceSlug}/documents`,
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );

    if (response.data.documents) {
      return response.data.documents.find(doc => doc.title === title);
    }
    return null;
  } catch (error) {
    // 查询失败不阻塞，返回 null
    console.error('查询文档列表失败:', error.message);
    return null;
  }
}

// 删除指定文档
async function deleteDocument(docLocation) {
  try {
    await axios.post(
      `${CONFIG.baseURL}/v1/document/delete`,
      { docLocation },
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error, '删除文档')
    };
  }
}

// 上传文件到工作区（支持 PDF, Word, 图片等）
async function uploadDocumentFile(workspaceSlug, filePath, title, folder = null, metadata = {}) {
  try {
    // 步骤 1: 验证文件
    const validation = await validateFilePath(filePath);
    if (!validation.success) {
      return {
        success: false,
        error: `文件验证失败: ${validation.error}`
      };
    }

    const absolutePath = validation.absolutePath;
    const mimeType = getMimeType(absolutePath);

    // 步骤 2: 使用 form-data 构建请求
    const FormData = (await import('form-data')).default;
    const form = new FormData();

    // 添加文件
    form.append('file', await fs.readFile(absolutePath), {
      filename: path.basename(absolutePath),
      contentType: mimeType
    });

    // 添加元数据
    const fileMetadata = {
      title: title || path.basename(absolutePath),
      ...metadata
    };
    form.append('metadata', JSON.stringify(fileMetadata));

    // 添加文件夹参数（单独字段）
    if (folder) {
      form.append('folder', folder);
    }

    // 步骤 3: 上传文件
    const response = await axios.post(
      `${CONFIG.baseURL}/v1/document/upload`,
      form,
      {
        headers: {
          ...getHeaders(),
          ...form.getHeaders()
        },
        timeout: 120000  // 文件上传需要更长超时
      }
    );

    if (!response.data.success || !response.data.documents) {
      return {
        success: false,
        error: response.data.error || '文件上传失败'
      };
    }

    const doc = response.data.documents[0];
    const docLocation = doc.location;

    // 步骤 4: 嵌入到工作区
    try {
      await axios.post(
        `${CONFIG.baseURL}/v1/workspace/${workspaceSlug}/update-embeddings`,
        { adds: [docLocation] },
        {
          headers: getHeaders(),
          timeout: 60000
        }
      );

      return {
        success: true,
        message: '文件上传并嵌入成功',
        docId: doc.id,
        docLocation: docLocation,
        title: doc.title,
        fileName: path.basename(absolutePath),
        fileSize: validation.size,
        mimeType: mimeType
      };
    } catch (embedError) {
      return {
        success: false,
        error: `文件上传成功但嵌入失败: ${handleApiError(embedError, '嵌入')}`,
        docLocation: docLocation
      };
    }
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error, '上传文件')
    };
  }
}

// 搜索文档
async function searchDocuments(query, workspaceSlug = null) {
  try {
    let slug = workspaceSlug || CONFIG.workspaceSlug;

    if (!slug) {
      const result = await getWorkspaces();
      if (!result.success) {
        return { error: result.error };
      }
      const workspaces = result.workspaces;
      if (workspaces.length > 0) {
        slug = workspaces[0].slug;
        CONFIG.workspaceSlug = slug;
      } else {
        return { error: '未找到工作区，请先创建工作区' };
      }
    }

    const response = await axios.post(
      `${CONFIG.baseURL}/v1/workspace/${slug}/search`,
      { query },
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );

    return {
      success: true,
      workspace: slug,
      results: response.data.results || []
    };
  } catch (error) {
    const message = handleApiError(error, '搜索文档');
    return { success: false, error: message };
  }
}

// 上传文档
async function uploadDocumentWithUpdate(workspaceSlug, title, filePath, folder = null, metadata = {}) {
  // 步骤 0: 检查是否存在同名文档
  const existingDoc = await findDocumentByTitle(workspaceSlug, title);
  if (existingDoc) {
    console.error(`检测到同名文档 "${title}"，先删除旧版本`);
    await deleteDocument(existingDoc.location);
  }

  // 继续执行上传流程
  return await uploadDocumentFile(workspaceSlug, filePath, title, folder, metadata);
}

// 列出工作区中的所有文档
async function listDocuments(workspaceSlug) {
  try {
    const response = await axios.get(
      `${CONFIG.baseURL}/v1/workspace/${workspaceSlug}/documents`,
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );
    return {
      success: true,
      documents: response.data.documents || []
    };
  } catch (error) {
    const message = handleApiError(error, '获取文档列表');
    return { success: false, error: message };
  }
}

// ==================== MCP 服务器 ====================

const server = new Server(
  {
    name: 'anythingllm-mcp-server',
    version: '1.5.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 注册工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'anythingllm_search',
        description: '在 AnythingLLM 知识库中搜索相关文档。使用本地 RAG 向量检索，返回最相关的文档片段。',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索查询，支持自然语言问题',
            },
            workspace: {
              type: 'string',
              description: '工作区标识符（可选）',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'anythingllm_list_workspaces',
        description: '列出所有可用的 AnythingLLM 工作区',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'anythingllm_create_workspace',
        description: '创建一个新的 AnythingLLM 工作区。工作区用于组织不同主题的知识库。',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '工作区名称',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'anythingllm_upload_document',
        description: '向指定工作区上传文件（支持 PDF、Word、图片等）。文件会自动提取文本内容并嵌入到知识库中。',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: '目标工作区标识符',
            },
            filePath: {
              type: 'string',
              description: '本地文件路径（支持 PDF, Word, 图片等）',
            },
            title: {
              type: 'string',
              description: '文档标题（可选，默认使用文件名）',
            },
            folder: {
              type: 'string',
              description: '可选的文件夹名称，用于组织文档',
            },
            metadata: {
              type: 'object',
              description: '可选的元数据（如 tags, category 等）',
            },
          },
          required: ['workspace', 'filePath'],
        },
      },
      {
        name: 'anythingllm_list_documents',
        description: '列出工作区中的所有文档',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: '工作区标识符',
            },
          },
          required: ['workspace'],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'anythingllm_search': {
        const result = await searchDocuments(args.query, args.workspace);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'anythingllm_list_workspaces': {
        const result = await getWorkspaces();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                result.success
                  ? { workspaces: result.workspaces }
                  : { error: result.error },
                null, 2
              ),
            },
          ],
        };
      }

      case 'anythingllm_create_workspace': {
        const result = await createWorkspace(args.name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'anythingllm_upload_document': {
        const title = args.title || path.basename(args.filePath);

        const result = await uploadDocumentWithUpdate(
          args.workspace,
          title,
          args.filePath,
          args.folder || null,
          args.metadata
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'anythingllm_list_documents': {
        const result = await listDocuments(args.workspace);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  // 1. 验证配置
  validateConfig();

  // 2. 健康检查
  await healthCheck();

  // 3. 启动 MCP 服务器
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AnythingLLM MCP 服务器已启动 v1.5.0');
  console.error('支持功能: 搜索、列出工作区、创建工作区、上传文档、列出文档');
}

main().catch((error) => {
  console.error('❌ 服务器启动失败:', error.message);
  process.exit(1);
});
