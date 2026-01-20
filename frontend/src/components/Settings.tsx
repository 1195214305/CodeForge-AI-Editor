/**
 * 设置面板组件
 * 管理主题、字体大小、API Key 等配置
 */

import { useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import { Settings as SettingsIcon, X, Eye, EyeOff } from 'lucide-react'

export default function Settings() {
  const { settingsOpen, toggleSettings, theme, setTheme, fontSize, setFontSize, qwenApiKey, setQwenApiKey } = useEditorStore()
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(qwenApiKey)

  if (!settingsOpen) return null

  const handleSaveApiKey = () => {
    setQwenApiKey(tempApiKey)
    alert('API Key 已保存')
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-surface border border-cyber-cyan rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
        {/* 设置头部 */}
        <div className="h-14 border-b border-dark-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 text-cyber-cyan" />
            <h2 className="text-xl font-medium text-gray-300">设置</h2>
          </div>
          <button
            onClick={toggleSettings}
            className="p-2 hover:bg-dark-bg rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-cyber-orange" />
          </button>
        </div>

        {/* 设置内容 */}
        <div className="p-6 space-y-6">
          {/* 主题设置 */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-cyber-cyan">主题</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('cyberpunk')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'cyberpunk'
                    ? 'border-cyber-cyan bg-cyber-cyan bg-opacity-10'
                    : 'border-dark-border hover:border-cyber-cyan'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded bg-gradient-to-br from-cyber-orange to-cyber-cyan"></div>
                  <span className="text-sm text-gray-300">赛博朋克</span>
                </div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-cyber-cyan bg-cyber-cyan bg-opacity-10'
                    : 'border-dark-border hover:border-cyber-cyan'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded bg-gradient-to-br from-gray-800 to-gray-900"></div>
                  <span className="text-sm text-gray-300">暗黑</span>
                </div>
              </button>

              <button
                onClick={() => setTheme('neon')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'neon'
                    ? 'border-cyber-cyan bg-cyber-cyan bg-opacity-10'
                    : 'border-dark-border hover:border-cyber-cyan'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded bg-gradient-to-br from-cyber-pink to-cyber-yellow"></div>
                  <span className="text-sm text-gray-300">霓虹</span>
                </div>
              </button>
            </div>
          </div>

          {/* 字体大小 */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-cyber-cyan">字体大小</h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-gray-300 w-12 text-right">{fontSize}px</span>
            </div>
          </div>

          {/* 千问 API Key */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-cyber-cyan">千问 API Key</h3>
            <p className="text-sm text-gray-400">
              配置千问 API Key 以使用 AI 助手功能。
              <a
                href="https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-cyan hover:text-cyber-orange ml-1"
              >
                获取 API Key
              </a>
            </p>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 bg-dark-bg border border-dark-border rounded text-gray-300 focus:border-cyber-cyan focus:outline-none"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyber-cyan"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={handleSaveApiKey}
              className="w-full px-4 py-2 bg-cyber-cyan text-dark-bg rounded hover:bg-cyber-orange transition-colors font-medium"
            >
              保存 API Key
            </button>
          </div>

          {/* 关于 */}
          <div className="space-y-3 pt-6 border-t border-dark-border">
            <h3 className="text-lg font-medium text-cyber-cyan">关于</h3>
            <div className="text-sm text-gray-400 space-y-2">
              <p>CodeForge AI 代码编辑器</p>
              <p>基于 ESA Pages 的轻量级 AI 代码编辑器</p>
              <p className="text-xs text-gray-500 mt-4">
                技术栈: React + TypeScript + Monaco Editor + XTerm.js + Zustand
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
