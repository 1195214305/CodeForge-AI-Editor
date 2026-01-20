/**
 * Zustand 状态管理 - CodeForge 编辑器
 * 管理文件系统、编辑器状态、终端状态、AI 对话等
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 文件类型定义
export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileNode[]
  path: string
}

// 终端历史记录
export interface TerminalHistory {
  id: string
  command: string
  output: string
  timestamp: number
}

// AI 对话消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// 编辑器状态接口
interface EditorState {
  // 文件系统
  files: FileNode[]
  currentFile: FileNode | null

  // 编辑器设置
  theme: 'cyberpunk' | 'dark' | 'neon'
  fontSize: number

  // 终端状态
  terminalHistory: TerminalHistory[]
  terminalOpen: boolean

  // AI 对话
  chatMessages: ChatMessage[]
  chatOpen: boolean
  qwenApiKey: string

  // 侧边栏状态
  fileExplorerOpen: boolean
  settingsOpen: boolean

  // 操作方法
  addFile: (parentPath: string, name: string, type: 'file' | 'folder') => void
  deleteFile: (path: string) => void
  updateFileContent: (path: string, content: string) => void
  setCurrentFile: (file: FileNode | null) => void

  // 终端操作
  addTerminalHistory: (command: string, output: string) => void
  clearTerminalHistory: () => void
  toggleTerminal: () => void

  // AI 对话操作
  addChatMessage: (role: 'user' | 'assistant', content: string) => void
  clearChatMessages: () => void
  toggleChat: () => void
  setQwenApiKey: (key: string) => void

  // 设置操作
  setTheme: (theme: 'cyberpunk' | 'dark' | 'neon') => void
  setFontSize: (size: number) => void
  toggleFileExplorer: () => void
  toggleSettings: () => void
}

// 创建默认文件系统
const createDefaultFiles = (): FileNode[] => [
  {
    id: 'root',
    name: 'workspace',
    type: 'folder',
    path: '/',
    children: [
      {
        id: 'welcome',
        name: 'welcome.md',
        type: 'file',
        language: 'markdown',
        path: '/welcome.md',
        content: `# 欢迎使用 CodeForge AI 代码编辑器

这是一个基于 ESA Pages 的轻量级 AI 代码编辑器。

## 功能特性

- Monaco Editor 代码编辑器（支持多语言语法高亮）
- XTerm.js 终端（WebGL 加速）
- 虚拟文件系统（存储在 localStorage）
- AI Agent 系统（支持千问 API）
- 多主题支持（赛博朋克、暗黑、霓虹）

## 快速开始

1. 点击左侧文件浏览器创建新文件
2. 在设置中配置千问 API Key
3. 使用 AI 助手进行代码生成和问答
4. 在终端中运行命令（模拟）

## 技术栈

- React + TypeScript
- Monaco Editor
- XTerm.js
- Zustand 状态管理
- Tailwind CSS
- ESA Pages 边缘函数

---

**本项目由阿里云 ESA 提供边缘计算支持**
`
      },
      {
        id: 'example-js',
        name: 'example.js',
        type: 'file',
        language: 'javascript',
        path: '/example.js',
        content: `// JavaScript 示例代码
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci(10):', fibonacci(10));
`
      }
    ]
  }
]

// 辅助函数：查找文件节点
const findNode = (nodes: FileNode[], path: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findNode(node.children, path)
      if (found) return found
    }
  }
  return null
}

// 辅助函数：删除文件节点
const deleteNode = (nodes: FileNode[], path: string): FileNode[] => {
  return nodes.filter(node => {
    if (node.path === path) return false
    if (node.children) {
      node.children = deleteNode(node.children, path)
    }
    return true
  })
}

// 创建 Zustand Store
export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // 初始状态
      files: createDefaultFiles(),
      currentFile: null,
      theme: 'cyberpunk',
      fontSize: 14,
      terminalHistory: [],
      terminalOpen: false,
      chatMessages: [],
      chatOpen: false,
      qwenApiKey: '',
      fileExplorerOpen: true,
      settingsOpen: false,

      // 文件操作
      addFile: (parentPath: string, name: string, type: 'file' | 'folder') => {
        set(state => {
          const newFiles = [...state.files]
          const parent = findNode(newFiles, parentPath)

          if (parent && parent.type === 'folder') {
            const newPath = `${parentPath === '/' ? '' : parentPath}/${name}`
            const newNode: FileNode = {
              id: `${Date.now()}-${Math.random()}`,
              name,
              type,
              path: newPath,
              content: type === 'file' ? '' : undefined,
              children: type === 'folder' ? [] : undefined,
              language: type === 'file' ? getLanguageFromExtension(name) : undefined
            }

            if (!parent.children) parent.children = []
            parent.children.push(newNode)
          }

          return { files: newFiles }
        })
      },

      deleteFile: (path: string) => {
        set(state => ({
          files: deleteNode(state.files, path),
          currentFile: state.currentFile?.path === path ? null : state.currentFile
        }))
      },

      updateFileContent: (path: string, content: string) => {
        set(state => {
          const newFiles = [...state.files]
          const file = findNode(newFiles, path)
          if (file && file.type === 'file') {
            file.content = content
          }
          return { files: newFiles }
        })
      },

      setCurrentFile: (file: FileNode | null) => {
        set({ currentFile: file })
      },

      // 终端操作
      addTerminalHistory: (command: string, output: string) => {
        set(state => ({
          terminalHistory: [
            ...state.terminalHistory,
            {
              id: `${Date.now()}-${Math.random()}`,
              command,
              output,
              timestamp: Date.now()
            }
          ]
        }))
      },

      clearTerminalHistory: () => {
        set({ terminalHistory: [] })
      },

      toggleTerminal: () => {
        set(state => ({ terminalOpen: !state.terminalOpen }))
      },

      // AI 对话操作
      addChatMessage: (role: 'user' | 'assistant', content: string) => {
        set(state => ({
          chatMessages: [
            ...state.chatMessages,
            {
              id: `${Date.now()}-${Math.random()}`,
              role,
              content,
              timestamp: Date.now()
            }
          ]
        }))
      },

      clearChatMessages: () => {
        set({ chatMessages: [] })
      },

      toggleChat: () => {
        set(state => ({ chatOpen: !state.chatOpen }))
      },

      setQwenApiKey: (key: string) => {
        set({ qwenApiKey: key })
      },

      // 设置操作
      setTheme: (theme: 'cyberpunk' | 'dark' | 'neon') => {
        set({ theme })
      },

      setFontSize: (size: number) => {
        set({ fontSize: size })
      },

      toggleFileExplorer: () => {
        set(state => ({ fileExplorerOpen: !state.fileExplorerOpen }))
      },

      toggleSettings: () => {
        set(state => ({ settingsOpen: !state.settingsOpen }))
      }
    }),
    {
      name: 'codeforge-storage',
      partialize: (state) => ({
        files: state.files,
        theme: state.theme,
        fontSize: state.fontSize,
        qwenApiKey: state.qwenApiKey
      })
    }
  )
)

// 辅助函数：根据文件扩展名获取语言
function getLanguageFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell'
  }
  return languageMap[ext || ''] || 'plaintext'
}
