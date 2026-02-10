#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CONFIG = {
  baseURL: process.env.ANYTHINGLLM_BASE_URL || 'http://192.168.3.100:3000/api',
  apiKey: process.env.ANYTHINGLLM_API_KEY,
};

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (CONFIG.apiKey) {
    headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
  }
  return headers;
}

async function testAPI() {
  console.log('🧪 测试 AnythingLLM API...\n');
  console.log(`📍 基础 URL: ${CONFIG.baseURL}`);
  console.log(`🔑 API Key: ${CONFIG.apiKey ? '已配置' : '未配置'}\n`);

  // 1. 获取工作区列表
  console.log('--- 测试 1: 获取工作区列表 ---');
  try {
    const response = await axios.get(`${CONFIG.baseURL}/v1/workspaces`, {
      headers: getHeaders(),
      timeout: 10000
    });
    console.log('✅ 成功!');
    console.log(`返回格式:`, JSON.stringify(response.data, null, 2));

    const workspaces = response.data.workspaces || [];
    console.log(`工作区数量: ${workspaces.length}`);

    if (workspaces.length === 0) {
      console.log('❌ 没有工作区，需要先创建工作区\n');
      return;
    }

    const firstWorkspace = workspaces[0];
    console.log(`第一个工作区: ${firstWorkspace.name} (slug: ${firstWorkspace.slug})\n`);

    // 2. 列出文档
    console.log('--- 测试 2: 列出工作区文档 ---');
    const docResponse = await axios.get(
      `${CONFIG.baseURL}/v1/workspace/${firstWorkspace.slug}/documents`,
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );
    console.log('✅ 成功!');
    console.log('返回格式:', JSON.stringify(docResponse.data, null, 2));

    const documents = docResponse.data.documents || [];
    console.log(`文档数量: ${documents.length}\n`);

    // 3. 搜索文档
    console.log('--- 测试 3: 搜索文档 ---');
    const searchResponse = await axios.post(
      `${CONFIG.baseURL}/v1/workspace/${firstWorkspace.slug}/search`,
      { query: '测试搜索' },
      {
        headers: getHeaders(),
        timeout: 10000
      }
    );
    console.log('✅ 成功!');
    console.log('返回格式:', JSON.stringify(searchResponse.data, null, 2));

    const results = searchResponse.data.results || [];
    console.log(`搜索结果数量: ${results.length}\n`);

    // 4. 测试空工作区的情况
    if (documents.length === 0) {
      console.log('--- 测试 4: 空工作区行为 ---');
      console.log('当前工作区没有文档，这是返回的空数据:');
      console.log('documents:', documents);
      console.log('results:', results);
      console.log('这解释了为什么 MCP 工具返回空结果\n');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAPI();
