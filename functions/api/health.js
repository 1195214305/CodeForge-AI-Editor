/**
 * 健康检查接口
 * 用于验证边缘函数是否正常运行
 */

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  return new Response(JSON.stringify({
    status: 'ok',
    message: 'CodeForge 边缘函数运行正常',
    timestamp: new Date().toISOString(),
    edge: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
