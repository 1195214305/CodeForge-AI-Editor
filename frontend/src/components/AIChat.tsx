/**
 * AI 对话组件
 * 集成千问 API 进行代码生成和问答
 */

import { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import { MessageSquare, Send, X, Trash2, Loader2 } from 'lucide-react'

export default function AIChat() {
  const { chatOpen, chatMessages, qwenApiKey, addChatMessage, clearChatMessages, toggleChat } = useEditorStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (!qwenApiKey) {
      alert('请先在设置中配置千问 API Key')
      return
    }

    const userMessage = input.trim()
    setInput('')
    addChatMessage('user', userMessage)
    setIsLoading(true)

    try {
      const response = await fetch('/api/qwen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: qwenApiKey,
          messages: [
            ...chatMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('API 请求失败')
      }

      const data = await response.json()
      addChatMessage('assistant', data.content)
    } catch (error) {
      console.error('AI 对话错误:', error)
      addChatMessage('assistant', '抱歉，发生了错误。请检查 API Key 是否正确配置。')
    } finally {
      setIsLoading(false)
    }
  }

  if (!chatOpen) return null

  return (
    <div className="w-96 bg-dark-bg border-l border-dark-border flex flex-col">
      {/* AI 对话头部 */}
      <div className="h-12 bg-dark-surface border-b border-dark-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-cyber-cyan" />
          <span className="text-sm text-gray-300 font-medium">AI 助手</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChatMessages}
            className="p-1.5 hover:bg-dark-bg rounded transition-colors"
            title="清空对话"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-cyber-orange" />
          </button>
          <button
            onClick={toggleChat}
            className="p-1.5 hover:bg-dark-bg rounded transition-colors"
            title="关闭 AI 助手"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-cyber-orange" />
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-sm">开始与 AI 助手对话</p>
            <p className="text-xs mt-2">支持代码生成、问题解答等</p>
          </div>
        )}

        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-cyber-cyan text-dark-bg'
                  : 'bg-dark-surface text-gray-300 border border-dark-border'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
              <div className="text-xs opacity-60 mt-1">
                {new Date(message.timestamp).toLocaleTimeString('zh-CN')}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-dark-surface text-gray-300 border border-dark-border rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-gray-300 focus:border-cyber-cyan focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-cyber-cyan text-dark-bg rounded hover:bg-cyber-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
