/**
 * Monaco Editor 组件
 * 代码编辑器核心组件，支持多语言语法高亮
 */

import { useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { useEditorStore } from '../store/editorStore'
import { Save, FileCode } from 'lucide-react'

export default function Editor() {
  const { currentFile, updateFileContent, theme, fontSize } = useEditorStore()
  const editorRef = useRef<any>(null)

  // Monaco 编辑器主题映射
  const getMonacoTheme = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'vs-dark'
      case 'neon':
        return 'vs-dark'
      default:
        return 'vs-dark'
    }
  }

  // 处理编辑器内容变化
  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      updateFileContent(currentFile.path, value)
    }
  }

  // 处理编辑器挂载
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // 自定义快捷键
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        console.log('保存文件:', currentFile?.name)
        // 这里可以添加保存逻辑
      }
    )
  }

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="text-center space-y-4">
          <FileCode className="w-24 h-24 mx-auto text-cyber-cyan opacity-30" />
          <div className="text-gray-400 text-lg">
            选择或创建一个文件开始编码
          </div>
          <div className="text-gray-500 text-sm">
            支持 JavaScript、TypeScript、Python、Java 等多种语言
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-bg">
      {/* 编辑器头部 */}
      <div className="h-12 bg-dark-surface border-b border-dark-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <FileCode className="w-5 h-5 text-cyber-cyan" />
          <span className="text-gray-300 font-medium">{currentFile.name}</span>
          <span className="text-xs text-gray-500 px-2 py-1 bg-dark-bg rounded">
            {currentFile.language}
          </span>
        </div>
        <button
          className="flex items-center space-x-2 px-3 py-1.5 bg-cyber-cyan text-dark-bg rounded hover:bg-cyber-orange transition-colors"
          onClick={() => console.log('保存文件')}
        >
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">保存</span>
        </button>
      </div>

      {/* Monaco 编辑器 */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={currentFile.language}
          value={currentFile.content || ''}
          theme={getMonacoTheme()}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontLigatures: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>
    </div>
  )
}
