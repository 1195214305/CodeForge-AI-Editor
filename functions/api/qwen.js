/**
 * 千问 API 代理
 * 在边缘节点调用千问 API，保护用户 API Key
 */

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { apiKey, messages } = body

    if (!apiKey) {
      return new Response(JSON.stringify({ error: '缺少 API Key' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 调用千问 API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: messages
        },
        parameters: {
          result_format: 'message'
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('千问 API 错误:', errorText)
      return new Response(JSON.stringify({ error: 'API 调用失败' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    const content = data.output?.choices?.[0]?.message?.content || '无响应'

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('处理请求错误:', error)
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
