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
  baseURL: process.env.ANYTHINGLLM_BASE_URL || 'http://192.168.3.100:3000/api',
  apiKey: process.env.ANYTHINGLLM_API_KEY || null,
  workspaceSlug: process.env.ANYTHINGLLM_WORKSPACE || null,
};

console.error(`AnythingLLM MCP 配置: ${CONFIG.baseURL}`);

// ==================== 核心 API 函数 ====================

// 获取工作区列表
async function getWorkspaces() {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
    }

    const response = await axios.get(`${CONFIG.baseURL}/v1/workspaces`, { headers });
    return response.data.workspaces || [];
  } catch (error) {
    console.error('获取工作区失败:', error.message);
    return [];
  }
}

// 创建工作区
async function createWorkspace(name) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
    }

    const response = await axios.post(
      `${CONFIG.baseURL}/v1/workspaces/new`,
      { name },
      { headers }
    );

    return {
      success: true,
      workspace: response.data.workspace
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// 上传文档到工作区
async function uploadDocument(workspaceSlug, title, content, metadata = {}) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
    }

    const response = await axios.post(
      `${CONFIG.baseURL}/v1/workspace/${workspaceSlug}/update-embeddings`,
      {
        docs: [
          {
            id: `doc-${Date.now()}`,
            url: `local://${title}`,
            title: title,
            content: content,
            published: new Date().toISOString(),
            ...metadata
          }
        ]
      },
      { headers }
    );

    return {
      success: true,
      message: response.data.message || '文档上传成功'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// 搜索文档
async function searchDocuments(query, workspaceSlug = null) {
  try {
    let slug = workspaceSlug || CONFIG.workspaceSlug;

    if (!slug) {
      const workspaces = await getWorkspaces();
      if (workspaces.length > 0) {
        slug = workspaces[0].slug;
        CONFIG.workspaceSlug = slug;
      } else {
        return { error: '未找到工作区，请先创建工作区' };
      }
    }

    const headers = { 'Content-Type': 'application/json' };
    if (CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
    }

    const response = await axios.post(
      `${CONFIG.baseURL}/v1/workspace/${slug}/search`,
      { query },
      { headers }
    );

    return {
      workspace: slug,
      results: response.data.results || []
    };
  } catch (error) {
    return {
      error: `搜索失败: ${error.response?.data?.message || error.message}`
    };
  }
}

// 发送聊天请求
async function chatWithWorkspace(message, workspaceSlug = null) {
  try {
    let slug = workspaceSlug || CONFIG.workspaceSlug;

    if (!slug) {
      const workspaces = await getWorkspaces();
      if (workspaces.length > 0) {
        slug = workspaces[0].slug;
        CONFIG.workspaceSlug = slug;
      } else {
        return { error: '未找到工作区' };
      }
    }

    const headers = { 'Content-Type': 'application/json' };
    if (CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
    }

    const response = await axios.post(
      `${CONFIG.baseURL}/v1/workspace/${slug}/chat`,
      {
        message,
        mode: 'chat',
        sessionId: 'mcp-session-' + Date.now()
      },
      { headers }
    );

    return {
      workspace: slug,
      response: response.data.textResponse,
      sources: response.data.sources || []
    };
  } catch (error) {
    return {
      error: `聊天失败: ${error.response?.data?.message || error.message}`
    };
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
        const workspaces = await getWorkspaces();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ workspaces }, null, 2),
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
        // 这个工具的实现需要结合网络搜索
        // 由于 MCP 服务器本身没有网络搜索能力，这里返回提示
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                message: '请使用以下步骤更新知识库：',
                steps: [
                  '1. 使用 Tavily 或其他网络搜索工具获取最新信息',
                  '2. 整理搜索结果为 Markdown 格式',
                  '3. 使用 anythingllm_upload_document 上传文档',
                  `   工作区: ${args.workspace}`,
                  `   主题: ${args.topic}`,
                ],
                example: {
                  tool: 'anythingllm_upload_document',
                  parameters: {
                    workspace: args.workspace,
                    title: `${args.topic} - ${new Date().toISOString().split('T')[0]}`,
                    content: '# 搜索到的内容\\n\\n这里是搜索结果...'
                  }
                }
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AnythingLLM MCP 服务器已启动 v2.0.0');
  console.error('支持功能: 搜索、聊天、创建工作区、上传文档');
}

main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
