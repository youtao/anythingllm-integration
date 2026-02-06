#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

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

// 上传文档到工作区（使用官方 /v1/document/raw-text 端点）
async function uploadDocument(workspaceSlug, title, content, metadata = {}) {
  try {
    // 构建请求体 - 使用官方 API 标准
    const requestBody = {
      textContent: content,
      metadata: {
        title: title,
        ...metadata
      },
      addToWorkspaces: workspaceSlug  // 自动添加到指定工作区
    };

    // 调用官方 /v1/document/raw-text 端点
    const response = await axios.post(
      `${CONFIG.baseURL}/v1/document/raw-text`,
      requestBody,
      {
        headers: getHeaders(),
        timeout: 60000  // 文档处理和向量化可能需要较长时间
      }
    );

    // 官方 API 返回格式：{ success: true, error: null, documents: [...] }
    if (response.data.success && response.data.documents) {
      const doc = response.data.documents[0];
      return {
        success: true,
        message: '文档上传并向量化成功',
        docId: doc.id,
        docLocation: doc.location,
        title: doc.title,
        wordCount: doc.wordCount,
        tokenCount: doc.token_count_estimate
      };
    } else {
      return {
        success: false,
        error: response.data.error || '文档上传失败'
      };
    }
  } catch (error) {
    const message = handleApiError(error, '上传文档');
    return { success: false, error: message };
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

// 发送聊天请求
async function chatWithWorkspace(message, workspaceSlug = null) {
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
        return { error: '未找到工作区' };
      }
    }

    const response = await axios.post(
      `${CONFIG.baseURL}/v1/workspace/${slug}/chat`,
      {
        message,
        mode: 'chat',
        sessionId: 'mcp-session-' + Date.now()
      },
      {
        headers: getHeaders(),
        timeout: 30000  // 聊天可能需要较长时间
      }
    );

    return {
      success: true,
      workspace: slug,
      response: response.data.textResponse,
      sources: response.data.sources || []
    };
  } catch (error) {
    const message = handleApiError(error, '聊天');
    return { success: false, error: message };
  }
}

// ==================== MCP 服务器 ====================

const server = new Server(
  {
    name: 'anythingllm-mcp-server',
    version: '1.0.0',
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
        name: 'anythingllm_chat',
        description: '使用 AnythingLLM 进行智能问答，结合本地知识库和 LLM。会自动检索相关文档并基于文档内容生成回答。',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '用户消息或问题',
            },
            workspace: {
              type: 'string',
              description: '工作区标识符（可选）',
            },
          },
          required: ['message'],
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
        description: '向指定工作区上传文档。文档会被向量化并添加到知识库中。支持 Markdown 格式。',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: '目标工作区标识符',
            },
            title: {
              type: 'string',
              description: '文档标题',
            },
            content: {
              type: 'string',
              description: '文档内容（支持 Markdown）',
            },
            metadata: {
              type: 'object',
              description: '可选的元数据（如 tags, category 等）',
            },
          },
          required: ['workspace', 'title', 'content'],
        },
      },
      {
        name: 'anythingllm_update_knowledge',
        description: '更新知识库：从网络搜索最新信息并上传到指定工作区。这是一个便捷方法，结合搜索和上传。',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: {
              type: 'string',
              description: '目标工作区标识符',
            },
            topic: {
              type: 'string',
              description: '要搜索和更新的主题',
            },
            query: {
              type: 'string',
              description: '搜索查询（可选，默认使用 topic）',
            },
          },
          required: ['workspace', 'topic'],
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

      case 'anythingllm_chat': {
        const result = await chatWithWorkspace(args.message, args.workspace);
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
        const result = await uploadDocument(
          args.workspace,
          args.title,
          args.content,
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

      case 'anythingllm_update_knowledge': {
        const { workspace, topic, query } = args;
        const searchQuery = query || topic;

        // 返回详细的操作指南和示例
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                message: '请按以下步骤更新知识库:',
                steps: [
                  `1️⃣ 使用 Tavily 搜索工具查询: "${searchQuery}"`,
                  '2️⃣ 整理搜索结果为 Markdown 格式',
                  `3️⃣ 使用 anythingllm_upload_document 上传到工作区: ${workspace}`,
                  '4️⃣ 验证文档已成功添加到知识库'
                ],
                tavily_search_example: {
                  tool: 'tavily_search',
                  parameters: {
                    query: searchQuery,
                    search_depth: 'basic',
                    max_results: 10
                  }
                },
                upload_example: {
                  tool: 'anythingllm_upload_document',
                  parameters: {
                    workspace: workspace,
                    title: `${topic} - ${new Date().toISOString().split('T')[0]}`,
                    content: `# ${topic}\n\n## 搜索结果\n\n这里是使用 Tavily 搜索到的内容...\n\n## 参考资料\n\n- 来源1: ...\n- 来源2: ...`,
                    metadata: {
                      topic: topic,
                      updated_at: new Date().toISOString(),
                      source: 'tavily_search'
                    }
                  }
                },
                verification_command: `anythingllm_search "${topic}"`,
                notes: [
                  '💡 提示: 搜索结果应包含具体的版本号、配置步骤和代码示例',
                  '💡 提示: 添加来源链接以便后续查阅',
                  '💡 提示: 使用清晰的标题和分段结构'
                ]
              }, null, 2),
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
  console.error('AnythingLLM MCP 服务器已启动 v1.2.0');
  console.error('支持功能: 搜索、聊天、创建工作区、上传文档、知识更新');
}

main().catch((error) => {
  console.error('❌ 服务器启动失败:', error.message);
  process.exit(1);
});
